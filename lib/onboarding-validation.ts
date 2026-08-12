/**
 * lib/onboarding-validation.ts
 * 
 * Validation côté client des données d'onboarding avant soumission.
 * Permet de détecter les erreurs avant l'appel API et d'améliorer l'UX.
 */

import type { OnboardingData } from "@/components/onboarding/types";

export interface ValidationError {
  field: string;
  message: string;
  section: "profil" | "role" | "bien" | "logements" | "preferences";
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * Validation complète des données d'onboarding avant soumission finale
 */
export function validateOnboardingData(data: OnboardingData): ValidationResult {
  const errors: ValidationError[] = [];

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. PROFIL UTILISATEUR
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (!data.profil.nom || data.profil.nom.trim().length === 0) {
    errors.push({
      field: "profil.nom",
      message: "Le nom est obligatoire",
      section: "profil",
    });
  }

  if (data.profil.nom && data.profil.nom.length < 2) {
    errors.push({
      field: "profil.nom",
      message: "Le nom doit contenir au moins 2 caractères",
      section: "profil",
    });
  }

  if (data.profil.nom && data.profil.nom.length > 100) {
    errors.push({
      field: "profil.nom",
      message: "Le nom ne peut pas dépasser 100 caractères",
      section: "profil",
    });
  }

  // Validation optionnelle du téléphone (si fourni)
  if (data.profil.telephone) {
    const phoneRegex = /^[+]?[\d\s()-]{8,20}$/;
    if (!phoneRegex.test(data.profil.telephone)) {
      errors.push({
        field: "profil.telephone",
        message: "Format de téléphone invalide",
        section: "profil",
      });
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. RÔLE
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const validRoles = ["proprietaire", "gestionnaire", "agence"];
  if (!data.role || !validRoles.includes(data.role)) {
    errors.push({
      field: "role",
      message: "Vous devez sélectionner un rôle valide",
      section: "role",
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. PREMIER PROPRIÉTAIRE GÉRÉ (Agence uniquement — recueilli dans StepProperty)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (data.role === "agence") {
    if (!data.proprietaireGere.nom || data.proprietaireGere.nom.trim().length === 0) {
      errors.push({
        field: "proprietaireGere.nom",
        message: "Le nom du premier propriétaire géré est obligatoire",
        section: "bien",
      });
    } else if (data.proprietaireGere.nom.length < 2) {
      errors.push({
        field: "proprietaireGere.nom",
        message: "Le nom du propriétaire doit contenir au moins 2 caractères",
        section: "bien",
      });
    }
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. BIEN IMMOBILIER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (!data.bien.nom || data.bien.nom.trim().length === 0) {
    errors.push({
      field: "bien.nom",
      message: "Le nom du bien est obligatoire",
      section: "bien",
    });
  }

  if (data.bien.nom && data.bien.nom.length < 2) {
    errors.push({
      field: "bien.nom",
      message: "Le nom du bien doit contenir au moins 2 caractères",
      section: "bien",
    });
  }

  const validTypeBien = ["immeuble", "maison", "villa", "boutique", "terrain"];
  if (data.bien.type && !validTypeBien.includes(data.bien.type)) {
    errors.push({
      field: "bien.type",
      message: "Type de bien invalide",
      section: "bien",
    });
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. LOGEMENTS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (!data.logements || data.logements.length === 0) {
    errors.push({
      field: "logements",
      message: "Vous devez configurer au moins un logement",
      section: "logements",
    });
  }

  data.logements.forEach((logement, index) => {
    // Nom du logement obligatoire
    if (!logement.nom || logement.nom.trim().length === 0) {
      errors.push({
        field: `logements[${index}].nom`,
        message: `Le logement #${index + 1} doit avoir un nom`,
        section: "logements",
      });
    }

    // Si occupé, informations locataire obligatoires
    if (logement.occupe) {
      if (!logement.locataireNom || logement.locataireNom.trim().length === 0) {
        errors.push({
          field: `logements[${index}].locataireNom`,
          message: `Le logement "${logement.nom}" est occupé mais le nom du locataire est manquant`,
          section: "logements",
        });
      }

      if (logement.locataireNom && logement.locataireNom.length < 2) {
        errors.push({
          field: `logements[${index}].locataireNom`,
          message: `Le nom du locataire du logement "${logement.nom}" doit contenir au moins 2 caractères`,
          section: "logements",
        });
      }

      // Validation du loyer
      if (!logement.loyer || logement.loyer.toString().trim().length === 0) {
        errors.push({
          field: `logements[${index}].loyer`,
          message: `Le logement "${logement.nom}" doit avoir un loyer défini`,
          section: "logements",
        });
      } else {
        const loyerNum = typeof logement.loyer === 'string' 
          ? Number(logement.loyer.replace(/[^\d]/g, '')) 
          : logement.loyer;
        
        if (isNaN(loyerNum) || loyerNum < 0) {
          errors.push({
            field: `logements[${index}].loyer`,
            message: `Le loyer du logement "${logement.nom}" doit être un montant valide`,
            section: "logements",
          });
        }

        if (loyerNum === 0) {
          errors.push({
            field: `logements[${index}].loyer`,
            message: `Le loyer du logement "${logement.nom}" ne peut pas être zéro`,
            section: "logements",
          });
        }
      }

      // Date de début (optionnelle mais doit être valide si fournie)
      if (logement.dateDebut) {
        const dateDebut = new Date(logement.dateDebut);
        if (isNaN(dateDebut.getTime())) {
          errors.push({
            field: `logements[${index}].dateDebut`,
            message: `La date de début du contrat pour "${logement.nom}" est invalide`,
            section: "logements",
          });
        }
      }

      // Date de fin (optionnelle mais doit être après date début si fournie)
      if (logement.dateFin && logement.dateDebut) {
        const dateDebut = new Date(logement.dateDebut);
        const dateFin = new Date(logement.dateFin);
        
        if (isNaN(dateFin.getTime())) {
          errors.push({
            field: `logements[${index}].dateFin`,
            message: `La date de fin du contrat pour "${logement.nom}" est invalide`,
            section: "logements",
          });
        } else if (dateFin <= dateDebut) {
          errors.push({
            field: `logements[${index}].dateFin`,
            message: `La date de fin du contrat pour "${logement.nom}" doit être après la date de début`,
            section: "logements",
          });
        }
      }
    }
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. PRÉFÉRENCES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const validDevises = ["FCFA", "EUR", "USD", "XOF", "XAF"];
  if (data.preferences.devise && !validDevises.includes(data.preferences.devise)) {
    errors.push({
      field: "preferences.devise",
      message: "Devise invalide",
      section: "preferences",
    });
  }

  if (data.preferences.garantie && data.preferences.montantGarantie) {
    const montantGarantie = typeof data.preferences.montantGarantie === 'string'
      ? Number(data.preferences.montantGarantie.replace(/[^\d]/g, ''))
      : data.preferences.montantGarantie;

    if (isNaN(montantGarantie) || montantGarantie < 0) {
      errors.push({
        field: "preferences.montantGarantie",
        message: "Le montant de la garantie doit être un nombre positif",
        section: "preferences",
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize les données avant envoi
 * Nettoie les espaces, normalise les formats
 */
export function sanitizeOnboardingData(data: OnboardingData): OnboardingData {
  return {
    ...data,
    profil: {
      ...data.profil,
      nom: data.profil.nom?.trim() || "",
      telephone: (data.profil.telephone?.trim() || "") as string,
    },
    bien: {
      ...data.bien,
      nom: data.bien.nom?.trim() || "",
      adresse: data.bien.adresse?.trim() || null,
      ville: data.bien.ville?.trim() || null,
      quartier: data.bien.quartier?.trim() || null,
      repere: data.bien.repere?.trim() || null,
    },
    logements: data.logements.map(logement => ({
      ...logement,
      nom: logement.nom?.trim() || "",
      locataireNom: logement.locataireNom?.trim() || null,
      locataireTelephone: logement.locataireTelephone?.trim() || null,
    })),
    proprietaireGere: {
      nom: data.proprietaireGere.nom?.trim() || "",
      telephone: data.proprietaireGere.telephone?.trim() || "",
    },
  };
}

/**
 * Formatte les erreurs de validation pour affichage utilisateur
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return "";

  if (errors.length === 1) {
    return errors[0].message;
  }

  // Grouper par section
  const sections: Record<string, ValidationError[]> = {};
  errors.forEach(error => {
    if (!sections[error.section]) {
      sections[error.section] = [];
    }
    sections[error.section].push(error);
  });

  const sectionLabels: Record<string, string> = {
    profil: "Profil",
    role: "Rôle",
    bien: "Bien immobilier",
    logements: "Logements",
    preferences: "Préférences",
  };

  let message = "Veuillez corriger les erreurs suivantes :\n\n";
  Object.entries(sections).forEach(([section, sectionErrors]) => {
    message += `${sectionLabels[section] || section} :\n`;
    sectionErrors.forEach(err => {
      message += `  • ${err.message}\n`;
    });
    message += "\n";
  });

  return message.trim();
}
