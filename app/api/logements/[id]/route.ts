/**
 * PUT /api/logements/[id]
 * Update logement with new fields: amenities, chambres, surface, description, etc.
 * 
 * Request body:
 * {
 *   nom?: string
 *   type?: string
 *   description?: string
 *   loyer_mensuel?: number
 *   statut?: "occupe" | "vacant"
 *   chambres?: number
 *   salles_bain?: number
 *   surface_m2?: number
 *   amenities?: string[]
 *   photo_principale?: string (URL)
 *   photos_additionnelles?: string[] (URLs)
 * }
 * 
 * Response:
 * {
 *   success: boolean
 *   logement: Logement
 *   message: string
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { withErrorHandler } from "@/lib/api/errorHandler";
import { UpdateLogementSchema } from "@/lib/types/schema";
import {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  DatabaseError,
} from "@/lib/errors/ApplicationError";

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: logementId } = await params;

  // Validate logement ID
  if (!logementId || logementId.length === 0) {
    throw new ValidationError("Logement ID is required");
  }

  // Get authenticated user
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError("User not authenticated");
  }

  // Parse and validate request body
  let updateData;
  try {
    updateData = await request.json();
  } catch (error) {
    throw new ValidationError("Invalid JSON in request body");
  }

  // Validate using Zod schema
  const validationResult = UpdateLogementSchema.safeParse(updateData);
  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors;
    const errorMsg = Object.entries(errors)
      .map(([key, msgs]) => `${key}: ${msgs?.join(", ")}`)
      .join("; ");
    throw new ValidationError(`Validation failed: ${errorMsg}`);
  }

  // Get logement and verify ownership
  const { data: logement, error: logementError } = await supabase
    .from("logements")
    .select("id, proprietaire_id, immeuble_id")
    .eq("id", logementId)
    .single();

  if (logementError || !logement) {
    throw new NotFoundError(`Logement ${logementId} not found`);
  }

  if (logement.proprietaire_id !== user.id) {
    throw new UnauthorizedError(
      "You don't have permission to update this logement"
    );
  }

  try {
    // Prepare update object with only provided fields
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // Only include fields that were provided
    if (validationResult.data.nom !== undefined) {
      updatePayload.nom = validationResult.data.nom;
    }
    if (validationResult.data.type !== undefined) {
      updatePayload.type = validationResult.data.type;
    }
    if (validationResult.data.description !== undefined) {
      updatePayload.description = validationResult.data.description;
    }
    if (validationResult.data.loyer_mensuel !== undefined) {
      updatePayload.loyer_mensuel = validationResult.data.loyer_mensuel;
    }
    if (validationResult.data.statut !== undefined) {
      updatePayload.statut = validationResult.data.statut;
    }
    if (validationResult.data.chambres !== undefined) {
      updatePayload.chambres = validationResult.data.chambres;
    }
    if (validationResult.data.salles_bain !== undefined) {
      updatePayload.salles_bain = validationResult.data.salles_bain;
    }
    if (validationResult.data.surface_m2 !== undefined) {
      updatePayload.surface_m2 = validationResult.data.surface_m2;
    }
    if (validationResult.data.amenities !== undefined) {
      updatePayload.amenities = validationResult.data.amenities;
    }
    if (validationResult.data.photo_principale !== undefined) {
      updatePayload.photo_principale = validationResult.data.photo_principale;
    }
    if (validationResult.data.photos_additionnelles !== undefined) {
      updatePayload.photos_additionnelles =
        validationResult.data.photos_additionnelles;
    }

    // Update logement
    const { data: updated, error: updateError } = await supabase
      .from("logements")
      .update(updatePayload)
      .eq("id", logementId)
      .select()
      .single();

    if (updateError) {
      throw new DatabaseError(`Failed to update logement: ${updateError.message}`);
    }

    return NextResponse.json(
      {
        success: true,
        logement: updated,
        message: "Logement updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    if (
      error instanceof ValidationError ||
      error instanceof NotFoundError ||
      error instanceof UnauthorizedError ||
      error instanceof DatabaseError
    ) {
      throw error;
    }
    throw new DatabaseError(
      `Update failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

/**
 * GET /api/logements/[id]
 * Fetch single logement details
 */
async function handleGet(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: logementId } = await params;

  if (!logementId) {
    throw new ValidationError("Logement ID is required");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError("User not authenticated");
  }

  const { data: logement, error: logementError } = await supabase
    .from("logements")
    .select("*")
    .eq("id", logementId)
    .eq("proprietaire_id", user.id)
    .single();

  if (logementError || !logement) {
    throw new NotFoundError(`Logement ${logementId} not found`);
  }

  return NextResponse.json({ success: true, logement }, { status: 200 });
}

/**
 * DELETE /api/logements/[id]
 * Delete logement (cascade deletes related records via RLS)
 */
async function handleDelete(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: logementId } = await params;

  if (!logementId) {
    throw new ValidationError("Logement ID is required");
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new UnauthorizedError("User not authenticated");
  }

  // Verify ownership before delete
  const { data: logement, error: fetchError } = await supabase
    .from("logements")
    .select("id, proprietaire_id, photos_additionnelles, photo_principale")
    .eq("id", logementId)
    .single();

  if (fetchError || !logement) {
    throw new NotFoundError(`Logement ${logementId} not found`);
  }

  if (logement.proprietaire_id !== user.id) {
    throw new UnauthorizedError(
      "You don't have permission to delete this logement"
    );
  }

  try {
    // Delete logement (this should cascade via RLS if configured)
    const { error: deleteError } = await supabase
      .from("logements")
      .delete()
      .eq("id", logementId);

    if (deleteError) {
      throw new DatabaseError(`Failed to delete logement: ${deleteError.message}`);
    }

    // Note: Photo cleanup happens via storage RLS policies or background job
    // For now, just note that files can be cleaned up via a separate maintenance task

    return NextResponse.json(
      {
        success: true,
        message: "Logement deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    throw new DatabaseError(
      `Delete failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Export route handlers with proper Next.js signature (params as second argument)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    return await handler(request, { params });
  } catch (error) {
    console.error("[API Error]", error);
    const { handleApiError } = await import("@/lib/errors/ApplicationError");
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      {
        error: {
          message: errorResponse.message,
          code: errorResponse.code,
          details: errorResponse.details,
        },
      },
      { status: errorResponse.statusCode }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    return await handleGet(request, { params });
  } catch (error) {
    console.error("[API Error]", error);
    const { handleApiError } = await import("@/lib/errors/ApplicationError");
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      {
        error: {
          message: errorResponse.message,
          code: errorResponse.code,
          details: errorResponse.details,
        },
      },
      { status: errorResponse.statusCode }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    return await handleDelete(request, { params });
  } catch (error) {
    console.error("[API Error]", error);
    const { handleApiError } = await import("@/lib/errors/ApplicationError");
    const errorResponse = handleApiError(error);
    return NextResponse.json(
      {
        error: {
          message: errorResponse.message,
          code: errorResponse.code,
          details: errorResponse.details,
        },
      },
      { status: errorResponse.statusCode }
    );
  }
}
