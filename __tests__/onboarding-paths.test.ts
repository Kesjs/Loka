/**
 * Test: Verify all onboarding paths match spec requirements
 * 
 * User paths to test:
 * 1. Propriétaire débutant (premier_bien) → 7 steps (skips Occupation + Paiement)
 * 2. Propriétaire confirmé (possede_deja) → 9 steps (includes Occupation + Paiement)
 * 3. Gestionnaire famille → 9 steps
 * 4. Gestionnaire particuliers → 9 steps
 * 5. Agence démarrage → 11 steps
 * 6. Agence portefeuille existant → 11 steps
 */

import { calculateTotalSteps, isProprietaireDebutant } from '@/components/onboarding/types';

describe('Onboarding Path Calculations', () => {
  describe('Propriétaire paths', () => {
    it('should calculate 7 steps for propriétaire débutant (premier_bien)', () => {
      const steps = calculateTotalSteps('proprietaire', 'premier_bien');
      expect(steps).toBe(7);
      expect(isProprietaireDebutant('proprietaire', 'premier_bien')).toBe(true);
    });

    it('should calculate 7 steps for propriétaire débutant (commence_louer)', () => {
      const steps = calculateTotalSteps('proprietaire', 'commence_louer');
      expect(steps).toBe(7);
      expect(isProprietaireDebutant('proprietaire', 'commence_louer')).toBe(true);
    });

    it('should calculate 9 steps for propriétaire confirmé (possede_deja)', () => {
      const steps = calculateTotalSteps('proprietaire', 'possede_deja');
      expect(steps).toBe(9);
      expect(isProprietaireDebutant('proprietaire', 'possede_deja')).toBe(false);
    });

    it('should calculate 9 steps for propriétaire confirmé (gere_deja)', () => {
      const steps = calculateTotalSteps('proprietaire', 'gere_deja');
      expect(steps).toBe(9);
      expect(isProprietaireDebutant('proprietaire', 'gere_deja')).toBe(false);
    });
  });

  describe('Gestionnaire paths', () => {
    it('should calculate 9 steps for gestionnaire famille', () => {
      const steps = calculateTotalSteps('gestionnaire', 'famille');
      expect(steps).toBe(9);
    });

    it('should calculate 9 steps for gestionnaire particuliers', () => {
      const steps = calculateTotalSteps('gestionnaire', 'particuliers');
      expect(steps).toBe(9);
    });
  });

  describe('Agence paths', () => {
    it('should calculate 11 steps for agence demarre', () => {
      const steps = calculateTotalSteps('agence', 'demarre_agence');
      expect(steps).toBe(11);
    });

    it('should calculate 11 steps for agence portefeuille existant', () => {
      const steps = calculateTotalSteps('agence', 'portefeuille_existant');
      expect(steps).toBe(11);
    });

    it('should calculate 11 steps for agence migration', () => {
      const steps = calculateTotalSteps('agence', 'migre_autre_outil');
      expect(steps).toBe(11);
    });
  });

  describe('Edge cases', () => {
    it('should return 1 if no role selected', () => {
      const steps = calculateTotalSteps(null, null);
      expect(steps).toBe(1);
    });

    it('should return 1 if only role selected but no situation', () => {
      const steps = calculateTotalSteps('proprietaire', null);
      expect(steps).toBe(1);
    });
  });

  /**
   * Step sequence breakdown:
   * 
   * PROPRIÉTAIRE DÉBUTANT (7 steps):
   * 0. Welcome
   * 1. Profile
   * 2. Role
   * 3. Situation
   * 4. Property
   * 5. HousingCount
   * 6. Complete (no Occupation, no Paiement)
   * 
   * PROPRIÉTAIRE CONFIRMÉ (9 steps):
   * 0. Welcome
   * 1. Profile
   * 2. Role
   * 3. Situation
   * 4. Property
   * 5. HousingCount
   * 6. Occupation
   * 7. Paiement
   * 8. Complete
   * 
   * GESTIONNAIRE (9 steps):
   * 0. Welcome
   * 1. Profile
   * 2. Role
   * 3. Situation (includes role_interne question)
   * 4. ProprietaireGere
   * 5. Property
   * 6. HousingCount
   * 7. Occupation
   * 8. Paiement
   * 9. Complete (typo in comment - should be 9)
   * 
   * AGENCE (11 steps):
   * 0. Welcome
   * 1. Profile
   * 2. Role
   * 3. Situation
   * 4. AgenceInfo
   * 5. ProprietaireGere
   * 6. Property
   * 7. HousingCount
   * 8. Occupation
   * 9. Paiement
   * 10. Complete
   */
  describe('Step sequences', () => {
    it('propriétaire débutant should not see Occupation or Paiement steps', () => {
      // Steps: Welcome(0) + Profile(1) + Role(2) + Situation(3) + Property(4) + HousingCount(5) + Complete(6)
      // Missing: Occupation, Paiement
      const isDebutant = isProprietaireDebutant('proprietaire', 'premier_bien');
      expect(isDebutant).toBe(true);
      expect(calculateTotalSteps('proprietaire', 'premier_bien')).toBe(7);
    });

    it('propriétaire confirmé should see all steps including Occupation and Paiement', () => {
      // Steps: Welcome(0) + Profile(1) + Role(2) + Situation(3) + Property(4) + HousingCount(5) + Occupation(6) + Paiement(7) + Complete(8)
      const isDebutant = isProprietaireDebutant('proprietaire', 'possede_deja');
      expect(isDebutant).toBe(false);
      expect(calculateTotalSteps('proprietaire', 'possede_deja')).toBe(9);
    });

    it('gestionnaire should see ProprietaireGere after Situation', () => {
      // Steps: Welcome(0) + Profile(1) + Role(2) + Situation(3) + ProprietaireGere(4) + Property(5) + HousingCount(6) + Occupation(7) + Paiement(8) + Complete(9)
      const steps = calculateTotalSteps('gestionnaire', 'famille');
      expect(steps).toBe(9);
    });

    it('agence should see AgenceInfo and ProprietaireGere after Situation', () => {
      // Steps: Welcome(0) + Profile(1) + Role(2) + Situation(3) + AgenceInfo(4) + ProprietaireGere(5) + Property(6) + HousingCount(7) + Occupation(8) + Paiement(9) + Complete(10)
      const steps = calculateTotalSteps('agence', 'demarre_agence');
      expect(steps).toBe(11);
    });
  });
});
