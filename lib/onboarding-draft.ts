/**
 * Gestion robuste des brouillons d'onboarding
 * Sauvegarde hybride : localStorage + Supabase
 * 
 * Flux :
 * 1. Sauvegarde locale (localStorage) pour réactivité instantanée
 * 2. Sauvegarde DB (Supabase) tous les 30s en arrière-plan
 * 3. Récupération : DB en priorité, puis localStorage
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { OnboardingData } from "@/components/onboarding/types";

const DRAFT_KEY = "loka_onboarding_draft";
const LAST_SYNC_KEY = "loka_onboarding_last_sync";

/**
 * Charge le brouillon d'onboarding
 * Priorité : DB > localStorage
 */
export async function loadOnboardingDraft(
  supabase: SupabaseClient
): Promise<{ step: number; data: OnboardingData } | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Essayer de charger depuis la DB
  try {
    const { data: draftData, error: loadError } = await supabase
      .from("onboarding_drafts")
      .select("step, data")
      .eq("user_id", user.id)
      .maybeSingle();

    if (loadError) {
      console.warn("⚠️ Erreur lors du chargement de la DB:", loadError);
    }

    if (draftData) {
      console.log("✅ Brouillon chargé depuis la DB");
      return {
        step: draftData.step,
        data: draftData.data as OnboardingData,
      };
    }
  } catch (err) {
    console.warn("⚠️ Erreur lors du chargement de la DB:", err);
  }

  // 2. Fallback : localStorage
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        console.log("✅ Brouillon chargé depuis localStorage");
        return JSON.parse(raw);
      }
    } catch (err) {
      console.warn("⚠️ Erreur localStorage:", err);
    }
  }

  return null;
}

/**
 * Sauvegarde le brouillon localement (instantané)
 */
export function saveDraftLocally(
  step: number,
  data: OnboardingData
): void {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ step, data })
    );
    window.localStorage.setItem(
      LAST_SYNC_KEY,
      new Date().toISOString()
    );
  } catch (err) {
    console.warn("⚠️ Erreur lors de la sauvegarde locale:", err);
  }
}

/**
 * Sauvegarde le brouillon dans la DB (asynchrone)
 * À appeler en arrière-plan via debounce/throttle
 */
export async function saveDraftToDatabase(
  supabase: SupabaseClient,
  step: number,
  data: OnboardingData
): Promise<{ success: boolean; error?: string }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Utilisateur non authentifié" };
  }

  try {
    const { error } = await supabase.from("onboarding_drafts").upsert(
      {
        user_id: user.id,
        step,
        data,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      }
    );

    if (error) {
      console.warn("⚠️ Erreur DB:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Brouillon sauvegardé en DB");
    return { success: true };
  } catch (err) {
    console.warn("⚠️ Erreur sauvegarde DB:", err);
    return {
      success: false,
      error: "Impossible de sauvegarder le brouillon",
    };
  }
}

/**
 * Supprime le brouillon (après complétion)
 */
export async function deleteDraft(
  supabase: SupabaseClient
): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Supprimer de la DB
  try {
    const { error: deleteError } = await supabase
      .from("onboarding_drafts")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.warn("⚠️ Erreur suppression DB:", deleteError);
    }
  } catch (err) {
    console.warn("⚠️ Erreur suppression DB:", err);
  }

  // Supprimer du localStorage
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(DRAFT_KEY);
      window.localStorage.removeItem(LAST_SYNC_KEY);
    } catch (err) {
      console.warn("⚠️ Erreur suppression localStorage:", err);
    }
  }
}

/**
 * Hook pour synchroniser le brouillon avec débounce
 * À utiliser dans le composant onboarding
 */
export function createAutoSaveFunction(
  supabase: SupabaseClient,
  debounceMs: number = 30000 // 30 secondes par défaut
) {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingData: { step: number; data: OnboardingData } | null = null;

  return async (step: number, data: OnboardingData) => {
    // Sauvegarde locale instantanée
    saveDraftLocally(step, data);
    pendingData = { step, data };

    // Annuler le timeout précédent
    if (timeoutId) clearTimeout(timeoutId);

    // Sauvegarde DB débouclée
    timeoutId = setTimeout(async () => {
      if (pendingData) {
        await saveDraftToDatabase(
          supabase,
          pendingData.step,
          pendingData.data
        );
      }
    }, debounceMs);
  };
}
