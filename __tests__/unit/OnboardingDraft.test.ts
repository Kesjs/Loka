/**
 * Tests pour le système d'auto-save d'onboarding
 */

import {
  loadOnboardingDraft,
  saveDraftLocally,
  saveDraftToDatabase,
  deleteDraft,
  createAutoSaveFunction,
} from "@/lib/onboarding-draft";
import type { OnboardingData } from "@/components/onboarding/types";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Onboarding Draft Auto-Save", () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  const mockData: OnboardingData = {
    profil: "individuel",
    role: "proprietaire",
    situation: null,
    roleInterne: undefined,
    agenceInfo: null,
    proprietaireGere: null,
    property: null,
    housingCount: 0,
    occupation: [],
    paiement: null,
  };

  describe("saveDraftLocally", () => {
    it("doit sauvegarder le brouillon dans localStorage", () => {
      saveDraftLocally(1, mockData);

      const stored = localStorageMock.getItem("loka_onboarding_draft");
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.step).toBe(1);
      expect(parsed.data.profil).toBe("individuel");
    });

    it("doit mettre à jour le timestamp de dernière synchronisation", () => {
      saveDraftLocally(0, mockData);

      const lastSync = localStorageMock.getItem("loka_onboarding_last_sync");
      expect(lastSync).toBeDefined();
      expect(new Date(lastSync!)).toBeInstanceOf(Date);
    });
  });

  describe("createAutoSaveFunction", () => {
    it("doit créer une fonction d'auto-save avec débounce", async () => {
      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          upsert: jest.fn().mockResolvedValue({ error: null }),
        }),
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: "test-user-id" } },
          }),
        },
      };

      const autoSave = createAutoSaveFunction(mockSupabase as any, 100);

      // Appel multiple rapide
      await autoSave(0, mockData);
      await autoSave(1, mockData);

      // localStorage doit être mis à jour instantanément
      const stored = localStorageMock.getItem("loka_onboarding_draft");
      expect(stored).toBeDefined();
      expect(JSON.parse(stored!).step).toBe(1);
    });

    it("ne doit pas appeler Supabase plus d'une fois avec débounce", async () => {
      jest.useFakeTimers();

      const mockSupabase = {
        from: jest.fn().mockReturnValue({
          upsert: jest.fn().mockResolvedValue({ error: null }),
        }),
        auth: {
          getUser: jest.fn().mockResolvedValue({
            data: { user: { id: "test-user-id" } },
          }),
        },
      };

      const autoSave = createAutoSaveFunction(mockSupabase as any, 1000);

      // Appels multiples rapides
      await autoSave(0, mockData);
      await autoSave(1, mockData);
      await autoSave(2, mockData);

      // Pas d'appel Supabase encore (avant débounce)
      jest.advanceTimersByTime(500);
      expect(mockSupabase.from).not.toHaveBeenCalled();

      // Après débounce
      jest.advanceTimersByTime(600);
      await Promise.resolve();
      expect(mockSupabase.auth.getUser).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });

  describe("saveDraftToDatabase", () => {
    const buildSupabase = (overrides: {
      user?: { id: string } | null;
      upsertResult?: { error: { message: string } | null };
      upsertThrows?: boolean;
    } = {}) => {
      const {
        user = { id: "test-user-id" },
        upsertResult = { error: null },
        upsertThrows = false,
      } = overrides;
      const upsert = jest.fn(() =>
        upsertThrows
          ? Promise.reject(new Error("network down"))
          : Promise.resolve(upsertResult)
      );
      return {
        supabase: {
          auth: { getUser: jest.fn().mockResolvedValue({ data: { user } }) },
          from: jest.fn().mockReturnValue({ upsert }),
        } as any,
        upsert,
      };
    };

    it("upsert le brouillon sur user_id", async () => {
      const { supabase, upsert } = buildSupabase();

      await expect(
        saveDraftToDatabase(supabase, 2, mockData)
      ).resolves.toEqual({ success: true });
      expect(supabase.from).toHaveBeenCalledWith("onboarding_drafts");
      expect(upsert).toHaveBeenCalledWith(
        expect.objectContaining({ user_id: "test-user-id", step: 2, data: mockData }),
        { onConflict: "user_id" }
      );
    });

    it("échoue sans utilisateur authentifié", async () => {
      const { supabase, upsert } = buildSupabase({ user: null });

      await expect(saveDraftToDatabase(supabase, 1, mockData)).resolves.toEqual({
        success: false,
        error: "Utilisateur non authentifié",
      });
      expect(upsert).not.toHaveBeenCalled();
    });

    it("remonte l'erreur Supabase", async () => {
      const { supabase } = buildSupabase({
        upsertResult: { error: { message: "permission denied" } },
      });

      await expect(saveDraftToDatabase(supabase, 1, mockData)).resolves.toEqual({
        success: false,
        error: "permission denied",
      });
    });

    it("capture une exception réseau", async () => {
      const { supabase } = buildSupabase({ upsertThrows: true });

      await expect(saveDraftToDatabase(supabase, 1, mockData)).resolves.toEqual({
        success: false,
        error: "Impossible de sauvegarder le brouillon",
      });
    });
  });

  describe("loadOnboardingDraft", () => {
    const buildSupabase = (
      user: { id: string } | null,
      draft: { step: number; data: unknown } | null,
      throws = false
    ) =>
      ({
        auth: { getUser: jest.fn().mockResolvedValue({ data: { user } }) },
        from: jest.fn().mockReturnValue({
          select: () => ({
            eq: () => ({
              maybeSingle: () =>
                throws
                  ? Promise.reject(new Error("db down"))
                  : Promise.resolve({ data: draft }),
            }),
          }),
        }),
      }) as any;

    it("retourne null sans utilisateur", async () => {
      await expect(
        loadOnboardingDraft(buildSupabase(null, null))
      ).resolves.toBeNull();
    });

    it("privilégie le brouillon en base", async () => {
      saveDraftLocally(9, mockData);

      await expect(
        loadOnboardingDraft(
          buildSupabase({ id: "test-user-id" }, { step: 3, data: mockData })
        )
      ).resolves.toEqual({ step: 3, data: mockData });
    });

    it("retombe sur localStorage si la base ne renvoie rien", async () => {
      saveDraftLocally(4, mockData);

      await expect(
        loadOnboardingDraft(buildSupabase({ id: "test-user-id" }, null))
      ).resolves.toEqual({ step: 4, data: mockData });
    });

    it("retombe sur localStorage si la base échoue", async () => {
      saveDraftLocally(5, mockData);

      await expect(
        loadOnboardingDraft(buildSupabase({ id: "test-user-id" }, null, true))
      ).resolves.toEqual({ step: 5, data: mockData });
    });

    it("retourne null sans brouillon nulle part", async () => {
      await expect(
        loadOnboardingDraft(buildSupabase({ id: "test-user-id" }, null))
      ).resolves.toBeNull();
    });
  });

  describe("deleteDraft", () => {
    const buildSupabase = (user: { id: string } | null) => {
      const eq = jest.fn().mockResolvedValue({ error: null });
      const del = jest.fn(() => ({ eq }));
      return {
        supabase: {
          auth: { getUser: jest.fn().mockResolvedValue({ data: { user } }) },
          from: jest.fn().mockReturnValue({ delete: del }),
        } as any,
        eq,
      };
    };

    it("supprime le brouillon en base et en local", async () => {
      saveDraftLocally(1, mockData);
      const { supabase, eq } = buildSupabase({ id: "test-user-id" });

      await deleteDraft(supabase);

      expect(eq).toHaveBeenCalledWith("user_id", "test-user-id");
      expect(localStorageMock.getItem("loka_onboarding_draft")).toBeNull();
      expect(localStorageMock.getItem("loka_onboarding_last_sync")).toBeNull();
    });

    it("ne fait rien sans utilisateur", async () => {
      saveDraftLocally(1, mockData);
      const { supabase } = buildSupabase(null);

      await deleteDraft(supabase);

      expect(supabase.from).not.toHaveBeenCalled();
      expect(localStorageMock.getItem("loka_onboarding_draft")).not.toBeNull();
    });
  });
});
