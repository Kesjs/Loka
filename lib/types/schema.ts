/**
 * Zod Validation Schemas
 * Type-safe validation for all data transfers
 */

import { z } from "zod"

// ============================================================================
// PAYMENT SCHEMAS
// ============================================================================

export const PaymentSchema = z.object({
  contrat_id: z.string().uuid("ID contrat invalide"),
  montant: z.number().positive("Montant doit être positif"),
  date_paiement: z.coerce.date(),
  mode: z.enum(["cash", "mobile_money", "virement", "cheque"]),
  periode_debut: z.coerce.date(),
  periode_fin: z.coerce.date(),
  notes: z.string().optional(),
})

export const RecordPaymentDTO = PaymentSchema.refine(
  (data) => data.periode_fin > data.periode_debut,
  {
    message: "Période fin doit être après période début",
    path: ["periode_fin"],
  }
)

export type RecordPaymentDTO = z.infer<typeof RecordPaymentDTO>

// ============================================================================
// CONTRACT SCHEMAS
// ============================================================================

export const ContratSchema = z.object({
  locataire_id: z.string().uuid(),
  logement_id: z.string().uuid(),
  loyer_mensuel: z.number().positive("Loyer doit être positif"),
  depot_garantie: z.number().nonnegative("Garantie ne peut pas être négative"),
  date_debut: z.coerce.date(),
  date_fin: z.coerce.date().optional(),
  statut: z.enum(["actif", "termine", "resilie"]),
})

export const CreateContratSchema = ContratSchema.omit({ statut: true }).extend({
  statut: z.literal("actif").optional(),
}).refine(
  (data) => !data.date_fin || data.date_fin > data.date_debut,
  {
    message: "Date fin doit être après date début",
    path: ["date_fin"],
  }
)

export type CreateContratDTO = z.infer<typeof CreateContratSchema>

export const RenewContratSchema = z.object({
  loyer_mensuel: z.number().positive(),
  depot_garantie: z.number().nonnegative(),
  date_debut: z.coerce.date(),
  date_fin: z.coerce.date(),
})

export type RenewContratDTO = z.infer<typeof RenewContratSchema>

export const TerminateContratSchema = z.object({
  deductions: z.number().nonnegative().optional(),
  deductionDetails: z.array(z.object({
    reason: z.string(),
    amount: z.number().positive(),
    date: z.coerce.date(),
  })).optional(),
})

export type TerminateContratDTO = z.infer<typeof TerminateContratSchema>

// ============================================================================
// GUARANTEE SCHEMAS
// ============================================================================

export const GarantieSchema = z.object({
  contrat_id: z.string().uuid(),
  amount: z.number().positive(),
  status: z.enum(["held", "partial_return", "returned"]),
  deductions: z.array(z.object({
    reason: z.string(),
    amount: z.number().positive(),
    date: z.date(),
  })).optional(),
  notes: z.string().optional(),
})

// ============================================================================
// ALERT SCHEMAS
// ============================================================================

export const AlertSchema = z.object({
  type: z.enum(["missing_payment", "expiring_contract", "deposit_to_return"]),
  severity: z.enum(["low", "medium", "high"]),
  message: z.string(),
  entity_type: z.string().optional(),
  entity_id: z.string().uuid().optional(),
})

// ============================================================================
// TENANT SCHEMAS
// ============================================================================

export const LocataireSchema = z.object({
  nom: z.string().min(2, "Nom doit avoir au moins 2 caractères"),
  telephone: z.string().optional(),
  email: z.string().email("Email invalide").optional(),
})

export type CreateLocataireDTO = z.infer<typeof LocataireSchema>

// ============================================================================
// PROPERTY SCHEMAS
// ============================================================================

export const ImmeubleSchema = z.object({
  nom: z.string().min(2),
  adresse: z.string().optional(),
  ville: z.string().optional(),
  type: z.string().optional(),
})

export type CreateImmeubleDTO = z.infer<typeof ImmeubleSchema>

export const LogementSchema = z.object({
  nom: z.string().min(2, "Nom doit avoir au moins 2 caractères"),
  immeuble_id: z.string().uuid("ID immeuble invalide"),
  type: z.string().optional(),
  description: z.string().optional(),
  loyer_mensuel: z.number().positive("Loyer doit être positif"),
  statut: z.enum(["occupe", "vacant"]),
  
  // Characteristics
  chambres: z.number().int().positive("Nombre de chambres invalide").optional().default(1),
  salles_bain: z.number().int().positive("Nombre de salles de bain invalide").optional().default(1),
  surface_m2: z.number().positive("Surface doit être positive").optional(),
  
  // Amenities
  amenities: z.array(z.string()).optional().default([]),
  
  // Photos (URLs stored after upload)
  photo_principale: z.string().url().optional(),
  photos_additionnelles: z.array(z.string().url()).optional().default([]),
})

export type CreateLogementDTO = z.infer<typeof LogementSchema>

// Schema for updating logement (all fields optional)
export const UpdateLogementSchema = LogementSchema.partial().omit({ immeuble_id: true })

export type UpdateLogementDTO = z.infer<typeof UpdateLogementSchema>
