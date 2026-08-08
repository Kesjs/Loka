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
    objectif: data.objectif,
    devise: data.preferences.devise || "FCFA",
    frequence_loyer: data.preferences.frequenceLoyer,
    jour_echeance: data.preferences.jourEcheance || null,
    garantie_defaut: data.preferences.garantie,
    montant_garantie_defaut: data.preferences.garantie
      ? parseMontant(data.preferences.montantGarantie)
      : null,
    charges_incluses_defaut: data.preferences.chargesIncluses,
    charges_defaut: data.preferences.charges,
    notif_email: data.preferences.notifEmail,
    widget_priorite: data.preferences.widgetPriorite,
    logo_url: data.preferences.logoUrl || null,
    onboarding_complete: true,
  });

  if (propError) {
    return {
      error:
        "Impossible d'enregistrer votre profil. Vérifiez vos informations et réessayez.",
    };
  }

  // 2. Immeuble / bien principal
  const { data: immeuble, error: immeubleError } = await supabase
    .from("immeubles")
    .insert({
      proprietaire_id: user.id,
      nom: data.bien.nom || "Mon bien",
      adresse: data.bien.adresse || null,
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

  // 3. Logements + (si occupés) locataires & contrats
  for (const logement of data.logements) {
    const loyerLogement = parseMontant(logement.loyer);

    const { data: logementRow, error: logementError } = await supabase
      .from("logements")
      .insert({
        immeuble_id: immeuble.id,
        nom: logement.nom,
        loyer_mensuel: loyerLogement,
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

      const { error: contratError } = await supabase.from("contrats").insert({
        locataire_id: locataire.id,
        logement_id: logementRow.id,
        loyer_mensuel: loyerLogement,
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
