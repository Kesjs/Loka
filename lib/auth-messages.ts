/**
 * Messages d'authentification en français
 * Contenu cohérent et bien rédigé pour toute la suite auth
 */

export const AUTH_MESSAGES = {
  // =====================
  // NAVIGATION & GENERAL
  // =====================
  navigation: {
    signIn: "Connexion",
    signUp: "Inscription",
    forgotPassword: "Mot de passe oublié",
    changePassword: "Changer de mot de passe",
    changeEmail: "Modifier l'email",
  },

  // =====================
  // CONTENU GAUCHE (DYNAMIQUE)
  // =====================
  leftContent: {
    signIn: {
      title: "Bienvenue",
      subtitle: "Connectez-vous à votre compte pour gérer vos biens immobiliers.",
      footnote: "Vous n'avez pas de compte ? Créez-en un en quelques minutes.",
    },
    signUp: {
      title: "Créez votre compte",
      subtitle: "Créez votre compte et commencez à gérer vos biens immobiliers dès aujourd'hui.",
      footnote: "Vous avez déjà un compte ? Connectez-vous directement.",
    },
    forgotPassword: {
      title: "Besoin d'aide ?",
      subtitle: "Nous pouvons vous envoyer un lien pour réinitialiser votre mot de passe.",
      footnote: "Vous vous souvenez de votre mot de passe ? Reconnectez-vous.",
    },
    changePassword: {
      title: "Sécurisez votre compte",
      subtitle: "Mettez à jour votre mot de passe pour protéger votre compte.",
      footnote: "Un mot de passe fort protège mieux vos données.",
    },
    changeEmail: {
      title: "Modifiez votre email",
      subtitle: "Mettez à jour l'adresse email associée à votre compte.",
      footnote: "Nous vous enverrons un lien de confirmation.",
    },
  },

  // =====================
  // LABELS & PLACEHOLDERS
  // =====================
  labels: {
    email: "Adresse email",
    password: "Mot de passe",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le mot de passe",
    currentPassword: "Mot de passe actuel",
    newEmail: "Nouvelle adresse email",
  },

  placeholders: {
    email: "vous@exemple.com",
    password: "••••••••",
    newPassword: "••••••••",
    confirmPassword: "••••••••",
    currentPassword: "••••••••",
    newEmail: "nouveau@exemple.com",
  },

  // =====================
  // BUTTONS
  // =====================
  buttons: {
    signIn: "Se connecter",
    signUp: "Créer mon compte",
    forgotPassword: "Réinitialiser mon mot de passe",
    changePassword: "Mettre à jour le mot de passe",
    changeEmail: "Modifier l'email",
    sending: "Envoi en cours...",
    loading: "Veuillez patienter...",
    backToSignIn: "← Retour à la connexion",
  },

  // =====================
  // VALIDATION ERRORS
  // =====================
  validation: {
    emailRequired: "Veuillez entrer votre adresse email.",
    emailInvalid: "Cette adresse email n'est pas valide.",
    passwordRequired: "Veuillez entrer votre mot de passe.",
    passwordTooShort: "Votre mot de passe doit contenir au moins 8 caractères.",
    passwordWeak: "Utilisez des majuscules, minuscules, chiffres et symboles.",
    passwordMismatch: "Les mots de passe ne correspondent pas.",
    currentPasswordRequired: "Veuillez entrer votre mot de passe actuel.",
    newEmailRequired: "Veuillez entrer votre nouvelle adresse email.",
    newEmailInvalid: "Cette nouvelle adresse email n'est pas valide.",
    allFieldsRequired: "Tous les champs sont obligatoires.",
  },

  // =====================
  // AUTH ERRORS (Supabase mapped)
  // =====================
  errors: {
    invalidCredentials: "Email ou mot de passe incorrect.",
    userNotFound: "Aucun compte trouvé avec cette adresse email.",
    emailAlreadyExists: "Un compte existe déjà pour cette adresse email.",
    tooManyAttempts: "Trop de tentatives. Veuillez réessayer dans quelques minutes.",
    passwordResetLinkExpired: "Ce lien a expiré. Veuillez demander un nouveau lien.",
    emailChangeConfirmationExpired: "Ce lien de confirmation a expiré. Veuillez refaire la demande.",
    invalidToken: "Ce lien n'est pas valide. Veuillez demander un nouveau lien.",
    sessionExpired: "Votre session a expiré. Veuillez vous reconnecter.",
    networkError: "Erreur de connexion. Vérifiez votre connexion Internet.",
    unknownError: "Une erreur est survenue. Veuillez réessayer.",
  },

  // =====================
  // SUCCESS MESSAGES
  // =====================
  success: {
    signUpComplete: "Inscription réussie ! Redirige vers la configuration...",
    resetLinkSent: "Nous vous avons envoyé un lien de réinitialisation par email.",
    checkYourEmail: "Vérifiez votre boîte aux lettres (et les spams).",
    passwordChanged: "Votre mot de passe a été mis à jour avec succès.",
    emailChangeConfirmationSent: "Vérifiez votre nouvelle adresse email pour confirmer la modification.",
    accountUpdated: "Votre compte a été mis à jour.",
  },

  // =====================
  // HELP TEXTS & HINTS
  // =====================
  hints: {
    passwordRequirements: "8 caractères minimum, avec majuscules, minuscules, chiffres et symboles",
    emailConfirmation: "Un lien de confirmation a été envoyé à votre email.",
    noAccount: "Vous n'avez pas de compte ?",
    haveAccount: "Vous avez déjà un compte ?",
    forgotPasswordQuestion: "Mot de passe oublié ?",
    switchToSignUp: "Créer un compte",
    switchToSignIn: "Se connecter",
    securityNote: "Votre mot de passe doit être fort et unique.",
  },

  // =====================
  // FOOTER LINKS
  // =====================
  footer: {
    termsOfService: "Conditions d'utilisation",
    privacyPolicy: "Politique de confidentialité",
    support: "Besoin d'aide ?",
    contactUs: "Nous contacter",
  },
};

/**
 * Mappe les erreurs Supabase vers des messages en français
 * @param error - le message d'erreur brut renvoyé par Supabase (authError.message)
 * @param code - le code d'erreur structuré renvoyé par Supabase (authError.code), plus fiable que le texte
 */
export function mapAuthError(error: string | null, code?: string | null): string {
  // Le code structuré est prioritaire : il ne dépend pas de la formulation exacte du message anglais
  if (code) {
    const codeLower = code.toLowerCase();
    if (codeLower === "user_already_exists") {
      return AUTH_MESSAGES.errors.emailAlreadyExists;
    }
    if (codeLower === "invalid_credentials") {
      return AUTH_MESSAGES.errors.invalidCredentials;
    }
    if (codeLower === "user_not_found") {
      return AUTH_MESSAGES.errors.userNotFound;
    }
    if (codeLower === "over_request_rate_limit" || codeLower === "over_email_send_rate_limit") {
      return AUTH_MESSAGES.errors.tooManyAttempts;
    }
  }

  if (!error) return AUTH_MESSAGES.errors.unknownError;

  const errorLower = error.toLowerCase();

  // Email déjà utilisé — Supabase renvoie "User already registered" (et parfois "already exists")
  if (
    errorLower.includes("user already registered") ||
    errorLower.includes("already registered") ||
    errorLower.includes("user already exists") ||
    errorLower.includes("already exists")
  ) {
    return AUTH_MESSAGES.errors.emailAlreadyExists;
  }

  // Identifiants invalides
  if (
    errorLower.includes("invalid login credentials") ||
    errorLower.includes("invalid credentials")
  ) {
    return AUTH_MESSAGES.errors.invalidCredentials;
  }

  // Utilisateur non trouvé
  if (errorLower.includes("user not found")) {
    return AUTH_MESSAGES.errors.userNotFound;
  }

  // Trop de tentatives
  if (
    errorLower.includes("rate limit exceeded") ||
    errorLower.includes("too many requests")
  ) {
    return AUTH_MESSAGES.errors.tooManyAttempts;
  }

  // Token expiré
  if (
    errorLower.includes("token expired") ||
    errorLower.includes("invalid token")
  ) {
    return AUTH_MESSAGES.errors.passwordResetLinkExpired;
  }

  // Erreur réseau
  if (
    errorLower.includes("network") ||
    errorLower.includes("fetch")
  ) {
    return AUTH_MESSAGES.errors.networkError;
  }

  // Défaut
  return AUTH_MESSAGES.errors.unknownError;
}
