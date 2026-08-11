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
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("❌ [saveOnboarding] User not authenticated");
      return { error: "Session expirée, merci de vous reconnecter." };
    }

    console.log("📝 [saveOnboarding] Début de la sauvegarde pour user:", user.id);

    // ─────────────────────────────────────────────────────────────
    // 1. Table `proprietaire` (id = auth.uid(), colonnes exactes)
    //    Colonnes: id, nom, telephone, structure, logo_url, objectif,
    //              devise, frequence_loyer, jour_echeance,
    //              garantie_defaut, montant_garantie_defaut,
    //              charges_incluses_defaut, charges_defaut,
    //              notif_email, widget_priorite, onboarding_complete
    // ─────────────────────────────────────────────────────────────
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
      console.error("❌ [saveOnboarding] Erreur upsert proprietaire:", propError);
      return {
        error: propError.message
          ? `Impossible d'enregistrer votre profil : ${propError.message}`
          : "Impossible d'enregistrer votre profil. Vérifiez vos informations et réessayez.",
      };
    }

    console.log("✅ [saveOnboarding] Propriétaire créé/mis à jour");

    // ─────────────────────────────────────────────────────────────
    // 2. Table `organisations`
    //    Colonnes: owner_user_id, nom, type (ENUM organisation_type),
    //              ville, taille_portefeuille
    //    ENUM organisation_type: 'individuel', 'gestionnaire', 'agence'
    // ─────────────────────────────────────────────────────────────
    const orgType =
      data.role === "agence"
        ? "agence"
        : data.role === "gestionnaire"
        ? "gestionnaire"
        : "individuel";

    const orgNom =
      data.role === "agence"
        ? data.agenceInfo?.nom || data.profil.nom || "Mon Agence"
        : data.profil.nom || "Mon Organisation";

    const { data: org, error: orgError } = await supabase
      .from("organisations")
      .insert({
        owner_user_id: user.id,
        nom: orgNom,
        type: orgType,
        ville: data.bien.ville || data.agenceInfo?.ville || null,
        taille_portefeuille: data.agenceInfo?.taillePortefeuille || null,
      })
      .select("id")
      .single();

    if (orgError || !org) {
      console.error("❌ [saveOnboarding] Erreur création organisation:", orgError);
      return {
        error: orgError?.message
          ? `Impossible de créer votre organisation : ${orgError.message}`
          : "Impossible de créer votre organisation. Vérifiez les informations et réessayez.",
      };
    }

    const organisationId = org.id;
    console.log("✅ [saveOnboarding] Organisation créée:", organisationId, "type:", orgType);

    // ─────────────────────────────────────────────────────────────
    // 3. Table `membres_organisation`
    //    Colonnes: organisation_id, user_id, role_interne (ENUM role_interne_type)
    //    Défaut ENUM: 'admin'
    // ─────────────────────────────────────────────────────────────
    const { error: memError } = await supabase
      .from("membres_organisation")
      .insert({
        organisation_id: organisationId,
        user_id: user.id,
        // Le créateur est toujours 'admin' — conforme à l'ENUM role_interne_type
        role_interne: "admin",
      });

    if (memError) {
      console.error("⚠️ [saveOnboarding] Erreur création membre (non bloquant):", memError);
      // Non bloquant — owner_user_id suffit pour les policies RLS
    } else {
      console.log("✅ [saveOnboarding] Membre organisation créé");
    }

    // ─────────────────────────────────────────────────────────────
    // 4. Table `proprietaires_geres` (gestionnaire/agence uniquement)
    //    Colonnes: organisation_id, nom, telephone, email
    // ─────────────────────────────────────────────────────────────
    if (
      (data.role === "gestionnaire" || data.role === "agence") &&
      data.proprietaireGere?.nom
    ) {
      const { error: propGereError } = await supabase
        .from("proprietaires_geres")
        .insert({
          organisation_id: organisationId,
          nom: data.proprietaireGere.nom,
          telephone: data.proprietaireGere.telephone || null,
          email: null,
        });

      if (propGereError) {
        console.error("⚠️ [saveOnboarding] Erreur propriétaire géré (non bloquant):", propGereError);
      } else {
        console.log("✅ [saveOnboarding] Propriétaire géré créé");
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 5. Table `immeubles`
    //    Colonnes: proprietaire_id, organisation_id, nom, adresse,
    //              ville, quartier, repere, type (ENUM type_immeuble)
    //    Pas de: type_location, profil_type, situation
    // ─────────────────────────────────────────────────────────────
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
        type: mapTypeBien(data.bien.type),
      })
      .select("id")
      .single();

    if (immeubleError || !immeuble) {
      console.error("❌ [saveOnboarding] Erreur création immeuble:", immeubleError);
      return {
        error: "Impossible de créer votre bien. Vérifiez le nom et le type du bien, puis réessayez.",
      };
    }

    console.log("✅ [saveOnboarding] Immeuble créé:", immeuble.id);

    // ─────────────────────────────────────────────────────────────
    // 6. Tables `logements` + `locataires` + `contrats`
    //    logements: immeuble_id, nom, loyer_mensuel, statut
    //    Pas de: type_location, proprietaire_id
    //    contrats: locataire_id, logement_id, loyer_mensuel, date_debut,
    //              date_fin, statut, depot_garantie, moyen_paiement_habituel
    //    Pas de: proprietaire_id, moyen_paiement
    // ─────────────────────────────────────────────────────────────
    let logementsCreated = 0;
    let locatairesCreated = 0;
    let contratsCreated = 0;

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
        console.error("❌ [saveOnboarding] Erreur création logement:", logementError);
        return {
          error: `Impossible de créer le logement "${logement.nom}". Vérifiez les informations saisies et réessayez.`,
        };
      }

      logementsCreated++;

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
          console.error("❌ [saveOnboarding] Erreur création locataire:", locataireError);
          return {
            error: `Impossible d'enregistrer le locataire "${logement.locataireNom}". Vérifiez les informations saisies et réessayez.`,
          };
        }

        locatairesCreated++;

        const { error: contratError } = await supabase.from("contrats").insert({
          locataire_id: locataire.id,
          logement_id: logementRow.id,
          loyer_mensuel: loyerLogement,
          moyen_paiement_habituel: mapMoyenPaiement(data.moyenPaiement),
          depot_garantie: data.preferences.garantie
            ? parseMontant(data.preferences.montantGarantie)
            : 0,
          date_debut: logement.dateDebut || new Date().toISOString().slice(0, 10),
          date_fin: logement.dateFin || null,
          statut: "actif",
        });

        if (contratError) {
          console.error("❌ [saveOnboarding] Erreur création contrat:", contratError);
          return {
            error: `Impossible de créer le contrat pour "${logement.locataireNom}". Vérifiez les informations saisies et réessayez.`,
          };
        }

        contratsCreated++;
      }
    }

    console.log("✅ [saveOnboarding] Sauvegarde terminée avec succès");
    console.log(`   - ${logementsCreated} logement(s)`);
    console.log(`   - ${locatairesCreated} locataire(s)`);
    console.log(`   - ${contratsCreated} contrat(s)`);

    return { error: null };
  } catch (err) {
    // Capture des erreurs inattendues
    console.error("❌ [saveOnboarding] Erreur inattendue:", err);
    return {
      error: "Une erreur inattendue s'est produite lors de la sauvegarde. Veuillez réessayer ou contacter le support si le problème persiste.",
    };
  }
}

/**
 * Mappe TypeBien (onboarding) → ENUM type_immeuble (DB).
 * Valeurs ENUM exactes: 'immeuble', 'maison', 'villa', 'boutique', 'terrain'
 */
function mapTypeBien(type: string | null): string | null {
  switch (type) {
    case "immeuble":   return "immeuble";
    case "maison":     return "maison";
    case "villa":      return "villa";
    case "boutique":   return "boutique";
    case "terrain":    return "terrain";
    // Types sans correspondance ENUM → null (colonne nullable)
    default:           return null;
  }
}

/**
 * Mappe MoyenPaiement (onboarding) → ENUM moyen_paiement_type (DB).
 * Valeurs ENUM exactes: 'especes', 'mobile_money', 'virement', 'plusieurs'
 * La colonne moyen_paiement_habituel est nullable → null si inconnu.
 */
function mapMoyenPaiement(moyen: string | null): string | null {
  switch (moyen) {
    case "especes":      return "especes";
    case "mobile_money": return "mobile_money";
    case "virement":     return "virement";
    case "plusieurs":    return "plusieurs";
    default:             return null;
  }
}
