import { mapAuthError } from "@/lib/auth-errors"

describe("mapAuthError", () => {
  it.each([
    ["Invalid login credentials", "Email ou mot de passe incorrect."],
    ["Email not confirmed", "Votre email n'a pas encore été confirmé."],
    ["User not found", "Aucun compte trouvé pour cet email."],
    ["Invalid email", "L'adresse email saisie n'est pas valide."],
    ["Invalid password", "Le mot de passe saisi est incorrect."],
    [
      "Password should be at least 6 characters",
      "Le mot de passe doit contenir au moins 6 caractères.",
    ],
  ])("translates %s", (input, expected) => {
    expect(mapAuthError(input)).toBe(expected)
  })

  const fallback =
    "Impossible de se connecter pour le moment. Vérifiez vos identifiants et réessayez."

  it("falls back for unknown messages", () => {
    expect(mapAuthError("Something went wrong")).toBe(fallback)
    expect(mapAuthError("")).toBe(fallback)
  })

  it("is case sensitive and does not partially match", () => {
    expect(mapAuthError("invalid login credentials")).toBe(fallback)
    expect(mapAuthError("Error: Invalid login credentials")).toBe(fallback)
  })
})
