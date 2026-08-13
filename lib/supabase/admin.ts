import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec la clé service_role — usage SERVEUR UNIQUEMENT
 * (routes API / server actions). Ne jamais importer ce fichier dans un
 * composant "use client".
 *
 * Sert à créer et gérer les comptes Auth des locataires lors de
 * l'invitation par le propriétaire (l'utilisateur connecté n'a pas les
 * droits pour créer un compte Auth pour quelqu'un d'autre avec la clé
 * anonyme — il faut la clé service_role, gardée côté serveur).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Configuration Supabase admin manquante : vérifiez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
