import type { SupabaseClient } from "@supabase/supabase-js";
import type { OnboardingData } from "@/components/onboarding/types";

/**
 * Convertit une saisie libre ("50 000", "50.000 FCFA", "") en nombre.
 */
function parseMontant(value: string | undefined): number {
  if (!value) return 0;
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export async function saveOnboarding(
  supabase: SupabaseClient,
  data: OnboardingData
): Promise<{ error: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Session expirée, merci de vous reconnecter." };
  }

  // 1. Profil propriétaire + préférences
  const { error: propError } = await supabase.from("proprietaire").upsert({
    id: user.id,
    nom: data.profil.nom || user.email?.split("@")[0] || "Propriétaire",
    telephone: data.profil.telephone || null,
    devise: data.preferences.devise || "FCFA",
    garantie_defaut: data.preferences.garantie,
    montant_garantie_defaut: data.preferences.garantie
      ? parseMontant(data.preferences.montantGarantie)
      : null,
    notif_email: data.preferences.notifEmail,
    widget_priorite: data.preferences.widgetPriorite,
    onboarding_complete: true,
  });

  if (propError) {
    return {
      error:
        "Impossible d'enregistrer votre profil. Vérifiez vos informations et réessayez.",
    };
  }

  // 2. Créer organisation (type = rôle sélectionné)
  let organisationId: string | null = null;
  if (data.role) {
    const { data: org, error: orgError } = await supabase
      .from("organisations")
      .insert({
        nom: data.role === "agence" 
          ? (data.agenceInfo?.nom || "Mon Agence")
          : data.profil.nom || "Mon Organisation",
        type: data.role === "agence" 
          ? "agence"
          : data.role === "gestionnaire"
          ? "gestionnaire"
          : "proprietaire",
      })
      .select("id")
      .single();

    if (orgError || !org) {
      return {
        error:
          "Impossible de créer votre organisation. Vérifiez les informations et réessayez.",
      };
    }
    organisationId = org.id;
  }

  // 3. Créer membre_organisation (lier user à org avec role_interne)
  if (organisationId) {
    const { error: memError } = await supabase
      .from("membres_organisation")
      .insert({
        organisation_id: organisationId,
        user_id: user.id,
        role_interne: data.roleInterne || 
          (data.role === "agence" ? "admin" : "proprietaire"),
      });

    if (memError) {
      return {
        error:
          "Impossible d'ajouter votre profil à l'organisation. Vérifiez et réessayez.",
      };
    }
  }

  // 4. Créer proprietaires_geres si gestionnaire/agence avec données
  if (
    organisationId &&
    (data.role === "gestionnaire" || data.role === "agence") &&
    data.proprietaireGere?.nom
  ) {
    const { error: propGereError } = await supabase
      .from("proprietaires_geres")
      .insert({
        organisation_id: organisationId,
        nom: data.proprietaireGere.nom,
        telephone: data.proprietaireGere.telephone || null,
        commission_pct: data.proprietaireGere.commissionPct || 10,
      });

    if (propGereError) {
      return {
        error:
          "Impossible d'enregistrer le propriétaire géré. Vérifiez et réessayez.",
      };
    }
  }

  // 5. Immeuble / bien principal
  const { data: immeuble, error: immeubleError } = await supabase
    .from("immeubles")
    .insert({
      proprietaire_id: user.id,
      organisation_id: organisationId,
      nom: data.bien.nom || "Mon bien",
      adresse: data.bien.adresse || null,
      ville: data.bien.ville || null,
      quartier: data.bien.quartier || null,
      repere: data.bien.repere || null,
      type: data.bien.type,
    })
    .select("id")
    .single();

  if (immeubleError || !immeuble) {
    return {
      error:
        "Impossible de créer votre bien. Vérifiez le nom et le type du bien, puis réessayez.",
    };
  }

  // 6. Logements + (si occupés) locataires & contrats
  for (const logement of data.logements) {
    const loyerLogement = parseMontant(logement.loyer);

    const { data: logementRow, error: logementError } = await supabase
      .from("logements")
      .insert({
        immeuble_id: immeuble.id,
        nom: logement.nom,
        loyer_mensuel: loyerLogement,
        type_location: data.bien.typeLocation || "longue_duree",
        statut: logement.occupe ? "occupe" : "vacant",
      })
      .select("id")
      .single();

    if (logementError || !logementRow) {
      return {
        error: `Impossible de créer le logement "${logement.nom}". Vérifiez les informations saisies et réessayez.`,
      };
    }

    if (logement.occupe && logement.locataireNom) {
      const { data: locataire, error: locataireError } = await supabase
        .from("locataires")
        .insert({
          proprietaire_id: user.id,
          organisation_id: organisationId,
          nom: logement.locataireNom,
          telephone: logement.locataireTelephone || null,
        })
        .select("id")
        .single();

      if (locataireError || !locataire) {
        return {
          error: `Impossible d'enregistrer le locataire "${logement.locataireNom}". Vérifiez les informations saisies et réessayez.`,
        };
      }

      const moyenPaiement = data.moyenPaiement || "especes";
      const { error: contratError } = await supabase.from("contrats").insert({
        locataire_id: locataire.id,
        logement_id: logementRow.id,
        loyer_mensuel: loyerLogement,
        moyen_paiement: moyenPaiement,
        depot_garantie: data.preferences.garantie
          ? parseMontant(data.preferences.montantGarantie)
          : 0,
        date_debut: logement.dateDebut || new Date().toISOString().slice(0, 10),
        date_fin: logement.dateFin || null,
        statut: "actif",
      });

      if (contratError) {
        return {
          error: `Impossible de créer le contrat pour "${logement.locataireNom}". Vérifiez les informations saisies et réessayez.`,
        };
      }
    }
  }

  return { error: null };
}
