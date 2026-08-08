/**
 * Supabase Storage Utilities
 * Helper functions for handling logement photo uploads, compression, and URL generation
 */

import { createClient } from "@/lib/supabase/server";
import sharp from "sharp";

const BUCKET_NAME = "logement-photos";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface UploadPhotoResult {
  url: string;
  path: string;
  size: number;
  filename: string;
}

export interface PhotoValidationError {
  code: string;
  message: string;
}

/**
 * Validate photo file before upload
 */
export function validatePhotoFile(
  file: File,
  maxSize: number = MAX_FILE_SIZE
): PhotoValidationError | null {
  // Check file size
  if (file.size > maxSize) {
    return {
      code: "FILE_TOO_LARGE",
      message: `File size exceeds limit of ${maxSize / 1024 / 1024}MB`,
    };
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      code: "INVALID_TYPE",
      message: `File type "${file.type}" not allowed. Allowed: ${ALLOWED_TYPES.join(", ")}`,
    };
  }

  return null;
}

/**
 * Compress image using Sharp
 * Reduces file size while maintaining quality
 */
export async function compressImage(
  buffer: Buffer,
  format: "jpeg" | "png" | "webp" = "webp"
): Promise<Buffer> {
  let pipeline = sharp(buffer);

  // Resize if too large (max 2000px width, maintain aspect)
  pipeline = pipeline.resize(2000, 2000, {
    fit: "inside",
    withoutEnlargement: true,
  });

  // Compress based on format
  switch (format) {
    case "jpeg":
      pipeline = pipeline.jpeg({ quality: 80, progressive: true });
      break;
    case "png":
      pipeline = pipeline.png({ compressionLevel: 9 });
      break;
    case "webp":
      pipeline = pipeline.webp({ quality: 80 });
      break;
  }

  return pipeline.toBuffer();
}

/**
 * Generate thumbnail for gallery preview
 */
export async function generateThumbnail(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .resize(300, 300, {
      fit: "cover",
      position: "center",
    })
    .webp({ quality: 70 })
    .toBuffer();
}

/**
 * Upload photo to Supabase Storage
 */
export async function uploadPhoto(
  file: File,
  proprietaireId: string,
  logementId: string,
  userId: string
): Promise<UploadPhotoResult> {
  // Validate
  const validationError = validatePhotoFile(file);
  if (validationError) {
    throw new Error(validationError.message);
  }

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Determine format for compression
  const format = file.type.includes("jpeg")
    ? "jpeg"
    : file.type.includes("webp")
      ? "webp"
      : "png";

  // Compress image
  const compressedBuffer = await compressImage(buffer, format as any);

  // Generate filename
  const ext = format === "jpeg" ? ".jpg" : `.${format}`;
  const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`;

  // Build storage path: proprietaire_id/logement_id/filename
  const storagePath = `${proprietaireId}/${logementId}/${filename}`;

  // Upload to Supabase Storage
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, compressedBuffer, {
      contentType: format === "jpeg" ? "image/jpeg" : `image/${format}`,
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Generate public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);

  return {
    url: publicUrl,
    path: storagePath,
    size: compressedBuffer.length,
    filename,
  };
}

/**
 * Delete photo from Supabase Storage
 */
export async function deletePhoto(
  storagePath: string,
  proprietaireId: string
): Promise<void> {
  const supabase = await createClient();

  // Verify ownership via path
  if (!storagePath.startsWith(proprietaireId)) {
    throw new Error("Unauthorized: Cannot delete photos from other users");
  }

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([storagePath]);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Delete multiple photos
 */
export async function deletePhotos(
  storagePaths: string[],
  proprietaireId: string
): Promise<void> {
  const supabase = await createClient();

  // Verify ownership for all paths
  const unauthorized = storagePaths.some((path) =>
    !path.startsWith(proprietaireId)
  );

  if (unauthorized) {
    throw new Error("Unauthorized: Cannot delete photos from other users");
  }

  if (storagePaths.length === 0) {
    return;
  }

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove(storagePaths);

  if (error) {
    throw new Error(`Delete failed: ${error.message}`);
  }
}

/**
 * Generate signed URLs for private photo access (if needed)
 */
export async function getSignedUrl(
  storagePath: string,
  expiresIn: number = 3600
): Promise<string> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, expiresIn);

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Get public URL for a photo
 */
export async function getPublicUrl(storagePath: string): Promise<string> {
  const supabase = await createClient();

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(storagePath);

  return publicUrl;
}
