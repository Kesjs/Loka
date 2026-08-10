import { cn, formatMontant, formatDate } from "@/lib/utils"

// Espaces insécables produits par toLocaleString("fr-FR")
const normalize = (value: string) => value.replace(/\u00a0|\u202f/g, " ")

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "text-sm")).toBe("px-2 text-sm")
  })

  it("keeps the last conflicting tailwind class", () => {
    expect(cn("px-2", "px-4")).toBe("px-4")
  })

  it("ignores falsy values", () => {
    expect(cn("px-2", false, null, undefined, "")).toBe("px-2")
  })

  it("supports conditional objects and arrays", () => {
    expect(cn(["rounded", { hidden: false, "text-red-500": true }])).toBe(
      "rounded text-red-500"
    )
  })
})

describe("formatMontant", () => {
  it("formats with FCFA by default", () => {
    expect(normalize(formatMontant(1500000))).toBe("1 500 000 FCFA")
  })

  it("accepts a custom currency", () => {
    expect(normalize(formatMontant(1000, "EUR"))).toBe("1 000 EUR")
  })

  it("formats zero and negative amounts", () => {
    expect(normalize(formatMontant(0))).toBe("0 FCFA")
    expect(normalize(formatMontant(-2500))).toBe("-2 500 FCFA")
  })
})

describe("formatDate", () => {
  it("formats an ISO date in French short form", () => {
    expect(formatDate("2024-03-09T10:00:00.000Z")).toMatch(/^09 mars 2024$/)
  })

  it("pads the day to two digits", () => {
    expect(formatDate("2024-12-01T00:00:00.000Z")).toMatch(/^01 déc/)
  })

  it("returns Invalid Date for an unparsable input", () => {
    expect(formatDate("not-a-date")).toBe("Invalid Date")
  })
})
