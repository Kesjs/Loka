import { mapDbError } from "@/lib/db-errors"

describe("mapDbError", () => {
  it("returns a generic message when error is null", () => {
    expect(mapDbError(null)).toBe(
      "Une erreur inattendue est survenue. Réessayez."
    )
  })

  it.each([
    ["23505", "Cet élément existe déjà. Vérifiez le nom saisi."],
    ["23502", "Un champ obligatoire est manquant. Vérifiez le formulaire."],
    [
      "23503",
      "L'élément associé n'existe plus. Rechargez la page et réessayez.",
    ],
    [
      "42501",
      "Vous n'avez pas les droits nécessaires pour cette action. Reconnectez-vous et réessayez.",
    ],
    [
      "22P02",
      "Une des valeurs sélectionnées n'est pas valide. Vérifiez vos choix.",
    ],
  ])("maps postgres code %s", (code, expected) => {
    expect(mapDbError({ code })).toBe(expected)
  })

  it.each([
    ["duplicate key value violates unique constraint", "23505"],
    ["null value violates not-null constraint", "23502"],
    ["insert violates foreign key constraint", "23503"],
    ["new row violates row-level security policy", "42501"],
    ["permission denied for table logements", "42501"],
    ["invalid input value for enum statut", "22P02"],
  ])("maps message %s the same way as its code", (message, code) => {
    expect(mapDbError({ message })).toBe(mapDbError({ code }))
  })

  it("detects expired sessions", () => {
    expect(mapDbError({ message: "JWT expired" })).toBe(
      "Votre session a expiré. Reconnectez-vous et réessayez."
    )
    expect(mapDbError({ message: "invalid session token" })).toBe(
      "Votre session a expiré. Reconnectez-vous et réessayez."
    )
  })

  it("detects network failures", () => {
    expect(mapDbError({ message: "failed to fetch" })).toBe(
      "Problème de connexion. Vérifiez votre réseau et réessayez."
    )
    expect(mapDbError({ message: "network error" })).toBe(
      "Problème de connexion. Vérifiez votre réseau et réessayez."
    )
  })

  it("falls back to a generic save error", () => {
    expect(mapDbError({ code: "XX000", message: "boom" })).toBe(
      "Une erreur est survenue lors de l'enregistrement. Réessayez dans un instant."
    )
    expect(mapDbError({})).toBe(
      "Une erreur est survenue lors de l'enregistrement. Réessayez dans un instant."
    )
  })

  it("gives priority to the code over the message", () => {
    expect(mapDbError({ code: "23505", message: "network" })).toBe(
      "Cet élément existe déjà. Vérifiez le nom saisi."
    )
  })
})
