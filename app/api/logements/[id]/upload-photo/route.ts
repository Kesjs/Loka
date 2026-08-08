/**
 * POST /api/logements/[id]/upload-photo
 * Handle multi-photo upload for logement with compression and URL storage
 * 
 * Request body: FormData with:
 * - files: File[] (multiple files)
 * - setAsPrimary: boolean (optional - set first file as photo_principale)
 * 
 * Response:
 * - success: boolean
 * - uploads: UploadPhotoResult[]
 * - photoPrincipal: string (if set)
 * - photosAdditionnelles: string[]
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { uploadPhoto, deletePhoto } from "@/lib/supabase/storage";
import { withErrorHandler } from "@/lib/api/errorHandler";
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

  // Validate logement ID format
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

  // Parse FormData
  const formData = await request.formData();
  const files = formData.getAll("files") as File[];
  const setAsPrimary = formData.get("setAsPrimary") === "true";

  // Validate files
  if (!files || files.length === 0) {
    throw new ValidationError("No files provided");
  }

  if (files.length > 10) {
    throw new ValidationError("Maximum 10 files allowed per upload");
  }

  // Get logement from database
  const { data: logement, error: logementError } = await supabase
    .from("logements")
    .select("id, proprietaire_id, photo_principale, photos_additionnelles")
    .eq("id", logementId)
    .single();

  if (logementError || !logement) {
    throw new NotFoundError(`Logement ${logementId} not found`);
  }

  // Verify ownership
  if (logement.proprietaire_id !== user.id) {
    throw new UnauthorizedError(
      "You don't have permission to upload photos for this logement"
    );
  }

  try {
    // Upload all files
    const uploadResults = [];
    const uploadedUrls: string[] = [];

    for (const file of files) {
      try {
        const result = await uploadPhoto(
          file,
          logement.proprietaire_id,
          logementId,
          user.id
        );
        uploadResults.push(result);
        uploadedUrls.push(result.url);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        throw new ValidationError(
          `Failed to upload ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Determine photo assignments
    let photoPrincipal = logement.photo_principale;
    let photosAdditionnelles = logement.photos_additionnelles || [];

    if (setAsPrimary && uploadedUrls.length > 0) {
      // Move old primary to additional if it exists
      if (photoPrincipal) {
        photosAdditionnelles = [photoPrincipal, ...photosAdditionnelles];
      }
      // Set first uploaded as primary
      photoPrincipal = uploadedUrls[0];
      // Add rest as additional
      photosAdditionnelles = [
        ...uploadedUrls.slice(1),
        ...photosAdditionnelles,
      ];
    } else {
      // Add all uploaded files as additional
      photosAdditionnelles = [
        ...uploadedUrls,
        ...(photosAdditionnelles || []),
      ];
    }

    // Update logement in database
    const { error: updateError } = await supabase
      .from("logements")
      .update({
        photo_principale: photoPrincipal,
        photos_additionnelles: photosAdditionnelles,
        updated_at: new Date().toISOString(),
      })
      .eq("id", logementId);

    if (updateError) {
      throw new DatabaseError(`Failed to update logement: ${updateError.message}`);
    }

    return NextResponse.json(
      {
        success: true,
        uploads: uploadResults.map((r) => ({
          filename: r.filename,
          url: r.url,
          size: r.size,
        })),
        photoPrincipal,
        photosAdditionnelles,
        message: `Successfully uploaded ${uploadResults.length} photo(s)`,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ValidationError) {
      throw error;
    }
    throw new DatabaseError(
      `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

// Wrap with error handler
export async function POST(
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
