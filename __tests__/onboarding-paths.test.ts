/**
 * Test: Vérifie que la séquence d'onboarding est fixe, quel que soit le rôle.
 *
 * Depuis la refonte (récap onboarding & dashboard par rôle), l'onboarding
 * ne comporte plus que 3 écrans + transition, identiques pour tous les
 * profils : role → property → housing_count → complete. Seul le contenu
 * affiché à l'étape "property" varie (bloc propriétaire géré pour Agence),
 * jamais la longueur ou l'ordre de la séquence — ce qui élimine la classe
 * de bug "saut direct à la dernière étape" du système précédent.
 */

import { calculateTotalSteps, getStepSequence } from '@/components/onboarding/types';

describe('Séquence d\'onboarding (fixe, tous rôles)', () => {
  const roles = ['proprietaire', 'gestionnaire', 'agence', null] as const;

  it.each(roles)('a toujours exactement 4 étapes pour le rôle "%s"', (role) => {
    expect(calculateTotalSteps()).toBe(4);
    expect(getStepSequence(role).length).toBe(4);
  });

  it.each(roles)('respecte toujours l\'ordre role → property → housing_count → complete pour "%s"', (role) => {
    expect(getStepSequence(role)).toEqual([
      'role',
      'property',
      'housing_count',
      'complete',
    ]);
  });

  it('ne varie jamais en longueur, contrairement à l\'ancien système par situation/rôle', () => {
    const lengths = roles.map((role) => getStepSequence(role).length);
    const uniqueLengths = new Set(lengths);
    expect(uniqueLengths.size).toBe(1);
  });
});
