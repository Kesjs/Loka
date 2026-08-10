/**
 * lib/storage/logos.ts
 * 
 * Utilities pour gérer les logos organisations dans Supabase Storage.
 * Bucket: 'logos'
 * Path convention: logos/{organisationId}/{filename}
 */

import { SupabaseClient } from "@supabase/supabase-js";

export interface LogoUploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

/**
 * Récupérer l'URL publique du logo d'une organisation
 */
export async function getLogoUrl(
  supabase: SupabaseClient,
  organisationId: string
): Promise<string | null> {
  try {
    // Lister les fichiers du dossier de l'organisation
    const { data, error } = await supabase.storage
      .from("logos")
      .list(organisationId, { limit: 1 });

    if (error || !data || data.length === 0) {
      return null;
    }

    const filename = data[0].name;
    const path = `${organisationId}/${filename}`;

    // Retourner l'URL publique
    const {
      data: { publicUrl },
    } = supabase.storage.from("logos").getPublicUrl(path);

    return publicUrl || null;
  } catch (error) {
    console.error("Erreur récupération URL logo:", error);
    return null;
  }
}

/**
 * Uploader un logo pour une organisation
 * Supprime l'ancien logo et en crée un nouveau
 */
export async function uploadLogo(
  supabase: SupabaseClient,
  organisationId: string,
  file: File
): Promise<LogoUploadResult> {
  try {
    // Valider le fichier
    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "Le fichier doit être une image",
      };
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      return {
        success: false,
        error: "Le fichier doit être inférieur à 5MB",
      };
    }

    // Générer un nom unique pour le fichier
    const timestamp = Date.now();
    const ext = file.name.split(".").pop();
    const filename = `logo-${timestamp}.${ext}`;
    const path = `${organisationId}/${filename}`;

    // Supprimer les anciens logos de l'organisation
    const { data: existingFiles } = await supabase.storage
      .from("logos")
      .list(organisationId);

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(
        (f) => `${organisationId}/${f.name}`
      );
      await supabase.storage.from("logos").remove(filesToDelete);
    }

    // Uploader le nouveau logo
    const { data, error } = await supabase.storage
      .from("logos")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    // Récupérer l'URL publique
    const {
      data: { publicUrl },
    } = supabase.storage.from("logos").getPublicUrl(data.path);

    return {
      success: true,
      url: publicUrl,
      path: data.path,
    };
  } catch (error) {
    console.error("Erreur upload logo:", error);
    return {
      success: false,
      error: "Erreur lors de l'upload du logo",
    };
  }
}

/**
 * Supprimer le logo d'une organisation
 */
export async function deleteLogo(
  supabase: SupabaseClient,
  organisationId: string
): Promise<boolean> {
  try {
    const { data: existingFiles } = await supabase.storage
      .from("logos")
      .list(organisationId);

    if (!existingFiles || existingFiles.length === 0) {
      return true; // Rien à supprimer
    }

    const filesToDelete = existingFiles.map(
      (f) => `${organisationId}/${f.name}`
    );
    const { error } = await supabase.storage
      .from("logos")
      .remove(filesToDelete);

    if (error) {
      console.error("Erreur suppression logo:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erreur delete logo:", error);
    return false;
  }
}
