/**
 * GET /api/logements
 * List all logements for authenticated user with optional filtering
 * 
 * Query parameters:
 * - immeuble_id?: string (filter by building)
 * - statut?: "occupe" | "vacant" (filter by status)
 * - page?: number (default: 1)
 * - limit?: number (default: 20, max: 100)
 * - sort?: "nom" | "loyer" | "surface" | "-loyer" | "-surface" (default: "nom")
 * - amenities?: string[] (filter by amenities - JSON array)
 * 
 * Response:
 * {
 *   success: boolean
 *   logements: Logement[]
 *   total: number
 *   page: number
 *   limit: number
 *   pages: number
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOrganisationScope } from "@/lib/organisation-scope";
import { withErrorHandler } from "@/lib/api/errorHandler";
import {
  ValidationError,
  UnauthorizedError,
  DatabaseError,
} from "@/lib/errors/ApplicationError";

async function handler(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError("User not authenticated");
  }

  // Parse query parameters
  const searchParams = request.nextUrl.searchParams;
  const immeubleId = searchParams.get("immeuble_id");
  const statut = searchParams.get("statut");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
  const sort = searchParams.get("sort") || "nom";
  const amenitiesParam = searchParams.get("amenities");

  // Parse amenities filter (JSON array)
  let amenitiesFilter: string[] = [];
  if (amenitiesParam) {
    try {
      amenitiesFilter = JSON.parse(amenitiesParam);
      if (!Array.isArray(amenitiesFilter)) {
        throw new ValidationError("amenities must be an array");
      }
    } catch (error) {
      throw new ValidationError("Invalid amenities filter format");
    }
  }

  // Validate sort parameter
  const validSorts = ["nom", "loyer", "surface", "-loyer", "-surface"];
  if (!validSorts.includes(sort)) {
    throw new ValidationError(
      `Invalid sort parameter. Must be one of: ${validSorts.join(", ")}`
    );
  }

  try {
    // Récupérer le scope de l'organisation
    const orgScope = await getOrganisationScope(supabase);

    // Récupérer les immeubles de l'organisation pour filtrer les logements
    let immeublesQuery = supabase
      .from("immeubles")
      .select("id");

    if (orgScope.organisationId) {
      immeublesQuery = immeublesQuery.eq("organisation_id", orgScope.organisationId);
    } else {
      immeublesQuery = immeublesQuery.in("proprietaire_id", orgScope.proprietaireIds);
    }

    const { data: immeubles } = await immeublesQuery;

    const immeubleIds = (immeubles ?? []).map((i) => i.id);

    if (immeubleIds.length === 0) {
      // Pas d'immeubles pour cette organisation
      return NextResponse.json(
        {
          success: true,
          logements: [],
          total: 0,
          page,
          limit,
          pages: 0,
          hasMore: false,
        },
        { status: 200 }
      );
    }

    // Build query - filtrer par immeubles de l'organisation
    let query = supabase
      .from("logements")
      .select("*", { count: "exact" })
      .in("immeuble_id", immeubleIds);

    // Apply filters
    if (immeubleId) {
      query = query.eq("immeuble_id", immeubleId);
    }

    if (statut) {
      if (!["occupe", "vacant"].includes(statut)) {
        throw new ValidationError("Statut must be 'occupe' or 'vacant'");
      }
      query = query.eq("statut", statut);
    }

    // Apply amenities filter (using containment operator)
    if (amenitiesFilter.length > 0) {
      // Filter logements where amenities contains all specified amenities
      for (const amenity of amenitiesFilter) {
        query = query.contains("amenities", [amenity]);
      }
    }

    // Apply sorting
    let orderColumn = "nom";
    let ascending = true;

    if (sort.startsWith("-")) {
      orderColumn = sort.substring(1);
      ascending = false;
    } else {
      orderColumn = sort;
    }

    if (orderColumn === "loyer") {
      query = query.order("loyer_mensuel", { ascending });
    } else if (orderColumn === "surface") {
      query = query.order("surface_m2", { ascending });
    } else {
      query = query.order("nom", { ascending });
    }

    // Get total count before pagination
    const { data: countData, count: total } = await query;

    // Apply pagination
    const offset = (page - 1) * limit;
    query = supabase
      .from("logements")
      .select("*")
      .in("immeuble_id", immeubleIds);

    // Re-apply filters for paginated query
    if (immeubleId) {
      query = query.eq("immeuble_id", immeubleId);
    }
    if (statut) {
      query = query.eq("statut", statut);
    }
    if (amenitiesFilter.length > 0) {
      for (const amenity of amenitiesFilter) {
        query = query.contains("amenities", [amenity]);
      }
    }

    // Re-apply sorting for paginated query
    if (orderColumn === "loyer") {
      query = query.order("loyer_mensuel", { ascending });
    } else if (orderColumn === "surface") {
      query = query.order("surface_m2", { ascending });
    } else {
      query = query.order("nom", { ascending });
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: logements, error: queryError } = await query;

    if (queryError) {
      throw new DatabaseError(`Query failed: ${queryError.message}`);
    }

    const totalCount = total || 0;
    const pages = Math.ceil(totalCount / limit);

    return NextResponse.json(
      {
        success: true,
        logements: logements || [],
        total: totalCount,
        page,
        limit,
        pages,
        hasMore: page < pages,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof ValidationError || error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      `Fetch failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * POST /api/logements
 * Create new logement
 */
async function handlePost(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError("User not authenticated");
  }

  let createData;
  try {
    createData = await request.json();
  } catch (error) {
    throw new ValidationError("Invalid JSON in request body");
  }

  // Validate required fields
  if (!createData.nom || !createData.immeuble_id || !createData.loyer_mensuel) {
    throw new ValidationError(
      "Missing required fields: nom, immeuble_id, loyer_mensuel"
    );
  }

  try {
    // Récupérer le scope de l'organisation
    const orgScope = await getOrganisationScope(supabase);

    // Vérifier que l'immeuble appartient à l'organisation
    const { data: immeuble } = await supabase
      .from("immeubles")
      .select("id")
      .eq("id", createData.immeuble_id)
      .eq("organisation_id", orgScope.organisationId)
      .maybeSingle();

    if (!immeuble) {
      throw new ValidationError("Immeuble not found or not accessible");
    }

    // Create logement
    const { data: logement, error: createError } = await supabase
      .from("logements")
      .insert({
        immeuble_id: createData.immeuble_id,
        nom: createData.nom,
        type: createData.type || null,
        description: createData.description || null,
        loyer_mensuel: createData.loyer_mensuel,
        statut: createData.statut || "vacant",
        chambres: createData.chambres || 1,
        salles_bain: createData.salles_bain || 1,
        surface_m2: createData.surface_m2 || null,
        amenities: createData.amenities || [],
        photo_principale: createData.photo_principale || null,
        photos_additionnelles: createData.photos_additionnelles || [],
      })
      .select()
      .single();

    if (createError) {
      throw new DatabaseError(`Failed to create logement: ${createError.message}`);
    }

    return NextResponse.json(
      {
        success: true,
        logement,
        message: "Logement created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      `Creation failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

export const GET = withErrorHandler(handler);
export const POST = withErrorHandler(handlePost);
