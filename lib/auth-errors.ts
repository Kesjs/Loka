export function mapAuthError(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "Email ou mot de passe incorrect.",
    "Email not confirmed": "Votre email n'a pas encore été confirmé.",
    "User not found": "Aucun compte trouvé pour cet email.",
    "Invalid email": "L'adresse email saisie n'est pas valide.",
    "Invalid password": "Le mot de passe saisi est incorrect.",
    "Password should be at least 6 characters":
      "Le mot de passe doit contenir au moins 6 caractères.",
  };
  return (
    map[message] ??
    "Impossible de se connecter pour le moment. Vérifiez vos identifiants et réessayez."
  );
}
