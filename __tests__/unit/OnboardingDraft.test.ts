/**
 * Tests pour le système d'auto-save d'onboarding
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  saveDraftLocally,
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
    vi.clearAllMocks();
  });

  const mockData: OnboardingData = {
    profil: { nom: "Jean Dupont", telephone: "+22900000000", email: "jean@example.com" },
    role: "proprietaire",
    estADistance: false,
    proprietaireGere: { nom: "", telephone: "" },
    bien: {
      nom: "",
      adresse: null,
      ville: null,
      quartier: null,
      repere: null,
      type: null,
      typeLocation: null,
    },
    nombreLogements: 1,
    logements: [],
    preferences: {
      garantie: false,
      montantGarantie: "",
      devise: "FCFA",
      notifEmail: true,
      widgetPriorite: null,
    },
  };

  describe("saveDraftLocally", () => {
    it("doit sauvegarder le brouillon dans localStorage", () => {
      saveDraftLocally(1, mockData);

      const stored = localStorageMock.getItem("loka_onboarding_draft");
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(parsed.step).toBe(1);
      expect(parsed.data.profil.nom).toBe("Jean Dupont");
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
        from: vi.fn().mockReturnValue({
          upsert: vi.fn().mockResolvedValue({ error: null }),
        }),
        auth: {
          getUser: vi.fn().mockResolvedValue({
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
      vi.useFakeTimers();

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          upsert: vi.fn().mockResolvedValue({ error: null }),
        }),
        auth: {
          getUser: vi.fn().mockResolvedValue({
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
      vi.advanceTimersByTime(500);
      expect(mockSupabase.from).not.toHaveBeenCalled();

      // Après débounce
      vi.advanceTimersByTime(600);
      expect(mockSupabase.from).toHaveBeenCalled();

      vi.useRealTimers();
    });
  });
});
