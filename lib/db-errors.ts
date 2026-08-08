/**
 * Traduit les erreurs Postgres/Supabase brutes en messages clairs pour l'utilisateur.
 * À utiliser partout où un insert/update Supabase peut échouer côté client.
 */
export function mapDbError(error: { message?: string; code?: string } | null): string {
  if (!error) return "Une erreur inattendue est survenue. Réessayez.";

  const code = error.code ?? "";
  const message = error.message ?? "";

  // Violation de contrainte unique (doublon)
  if (code === "23505" || message.includes("duplicate key")) {
    return "Cet élément existe déjà. Vérifiez le nom saisi.";
  }

  // Violation de contrainte NOT NULL
  if (code === "23502" || message.includes("violates not-null constraint")) {
    return "Un champ obligatoire est manquant. Vérifiez le formulaire.";
  }

  // Violation de clé étrangère (référence invalide, ex: immeuble supprimé entre-temps)
  if (code === "23503" || message.includes("violates foreign key constraint")) {
    return "L'élément associé n'existe plus. Rechargez la page et réessayez.";
  }

  // Violation RLS (droits d'accès)
  if (code === "42501" || message.includes("row-level security") || message.includes("permission denied")) {
    return "Vous n'avez pas les droits nécessaires pour cette action. Reconnectez-vous et réessayez.";
  }

  // Valeur invalide pour un enum (ex: type non reconnu)
  if (code === "22P02" || message.includes("invalid input value for enum")) {
    return "Une des valeurs sélectionnées n'est pas valide. Vérifiez vos choix.";
  }

  // Session expirée / non authentifié
  if (message.includes("JWT") || message.includes("session")) {
    return "Votre session a expiré. Reconnectez-vous et réessayez.";
  }

  // Erreur réseau
  if (message.includes("fetch") || message.includes("network")) {
    return "Problème de connexion. Vérifiez votre réseau et réessayez.";
  }

  return "Une erreur est survenue lors de l'enregistrement. Réessayez dans un instant.";
}
