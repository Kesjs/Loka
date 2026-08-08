# 🚀 PLAN DÉTAILLÉ: Transformation Loka en App Fonctionnelle Complète

## DURÉE TOTALE: 8-10 semaines | 1 personne full-time

### OVERVIEW: 9 Phases Séquentielles

```
Phase 0 (2-3j) → Phase 1 (4-5j) → Phase 2 (3-4j) → Phase 3 (5-7j)
                    ↓
         Phase 4 (3-4j) → Phase 5 (4-5j) → Phase 6 (5-6j)
                    ↓
         Phase 7 (3-4j) → Phase 8 (2-3j)
```

**Stratégie d'exécution:**
- Faire Phase 0 d'abord (architecture)
- Phases 1 + 2 en parallèle (design + performance)
- Phases 3-6 séquentiellement (features métier dépendent les unes des autres)
- Phases 7-8 en fin (testing + launch)

---

## PHASE 0: SETUP & ARCHITECTURE (2-3 jours)

### Objectifs
- ✅ Refactor architecture (from "pages fetching directly" to "services + repositories")
- ✅ Setup patterns et abstractions
- ✅ Migrations DB (normalization)
- ✅ Configuration build + lint

### Livrables

#### 1. Architecture Layer Abstraction

```
lib/
├── db/
│   ├── repositories/
│   │   ├── PaymentRepository.ts
│   │   ├── ContractRepository.ts
│   │   ├── TenantRepository.ts
│   │   ├── PropertyRepository.ts
│   │   └── index.ts
│   └── schema.ts (Zod schemas)
├── services/
│   ├── PaymentService.ts
│   ├── ContractService.ts
│   ├── AlertService.ts
│   ├── ReportService.ts
│   └── index.ts
├── types/
│   ├── domain.ts (entities)
│   ├── dto.ts (transfer objects)
│   └── errors.ts
├── utils/
│   ├── pagination.ts
│   ├── validation.ts
│   ├── cache.ts
│   └── formatting.ts
└── hooks/
    ├── useAsync.ts
    ├── usePagination.ts
    └── useCache.ts
```

#### 2. Database Migrations

**Migration 1: Normalize Ownership**
```sql
-- Ajouter proprietaire_id aux tables qui le manquent
ALTER TABLE logements ADD COLUMN proprietaire_id UUID REFERENCES auth.users;
ALTER TABLE contrats ADD COLUMN proprietaire_id UUID REFERENCES auth.users;

-- Populate (from parent immeuble)
UPDATE logements SET proprietaire_id = 
  (SELECT proprietaire_id FROM immeubles WHERE immeubles.id = logements.immeuble_id)
WHERE proprietaire_id IS NULL;

-- Create indexes
CREATE INDEX idx_logements_proprietaire ON logements(proprietaire_id);
CREATE INDEX idx_contrats_proprietaire ON contrats(proprietaire_id);
```

**Migration 2: Add Audit Trail**

```sql
-- Table audit pour tracking changes
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proprietaire_id UUID NOT NULL REFERENCES auth.users,
  entity_type TEXT NOT NULL, -- 'contrat', 'paiement', etc
  entity_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  changes JSONB,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_audit_proprietaire ON audit_logs(proprietaire_id);
```

**Migration 3: Enhance Paiement Table**

```sql
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS
  reconciliation_status TEXT DEFAULT 'pending', -- 'pending', 'reconciled', 'disputed'
  reconciled_by UUID REFERENCES auth.users,
  reconciled_at TIMESTAMP,
  notes TEXT;

-- Unique constraint: prevent duplicate payments for same contract/month
ALTER TABLE paiements ADD CONSTRAINT unique_payment_per_month
  UNIQUE(contrat_id, date_trunc('month', periode_debut));
```

**Migration 4: Add Garantie Handling**

```sql
CREATE TABLE garanties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrat_id UUID NOT NULL REFERENCES contrats ON DELETE CASCADE,
  proprietaire_id UUID NOT NULL REFERENCES auth.users,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'held', -- 'held', 'partial_return', 'returned'
  held_at TIMESTAMP DEFAULT now(),
  return_initiated_at TIMESTAMP,
  returned_at TIMESTAMP,
  deductions JSONB DEFAULT '[]', -- [{reason, amount, date}]
  notes TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_garanties_contrat ON garanties(contrat_id);
CREATE INDEX idx_garanties_proprietaire ON garanties(proprietaire_id);
```

#### 3. Zod Validation Schemas

```typescript
// lib/types/schema.ts
import { z } from "zod";

export const PaymentSchema = z.object({
  contrat_id: z.string().uuid(),
  montant: z.number().positive(),
  date_paiement: z.date(),
  mode: z.enum(["cash", "mobile_money", "virement", "cheque"]),
  periode_debut: z.date(),
  periode_fin: z.date(),
  notes: z.string().optional()
});

export const ContratSchema = z.object({
  locataire_id: z.string().uuid(),
  logement_id: z.string().uuid(),
  loyer_mensuel: z.number().positive(),
  depot_garantie: z.number().non_negative(),
  date_debut: z.date(),
  date_fin: z.date().optional(),
  statut: z.enum(["actif", "termine", "resilie"])
});

// etc pour autres entities
```

#### 4. Service Layer Examples

```typescript
// lib/services/PaymentService.ts
export class PaymentService {
  constructor(private repo: PaymentRepository) {}

  async recordPayment(dto: RecordPaymentDTO, userId: string): Promise<Payment> {
    // Validate input
    const validated = PaymentSchema.parse(dto);
    
    // Check contract ownership
    const contract = await this.repo.getContractById(dto.contrat_id, userId);
    if (!contract) throw new NotFoundError("Contrat introuvable");
    
    // Detect duplicate payment
    const existing = await this.repo.findDuplicatePayment(
      dto.contrat_id,
      dto.periode_debut
    );
    if (existing) throw new DuplicatePaymentError();
    
    // Create payment
    const payment = await this.repo.create(validated, userId);
    
    // Audit log
    await auditLog(userId, "paiement", payment.id, "create", payment);
    
    return payment;
  }

  async getMissingPayments(userId: string): Promise<MissingPayment[]> {
    // Complex logic: find all contracts without payments for current month
    return this.repo.getMissingForCurrentMonth(userId);
  }
}
```

#### 5. Repository Pattern

```typescript
// lib/db/repositories/PaymentRepository.ts
export class PaymentRepository {
  async create(data: CreatePaymentDTO, userId: string): Promise<Payment> {
    const supabase = createServerClient();
    const { data: payment, error } = await supabase
      .from("paiements")
      .insert([{ ...data, proprietaire_id: userId }])
      .select()
      .single();
    
    if (error) throw new DatabaseError(error.message);
    return payment;
  }

  async findDuplicatePayment(
    contratId: string,
    periodeDebut: Date
  ): Promise<Payment | null> {
    // Complex query to detect duplicates
  }

  async getMissingForCurrentMonth(userId: string): Promise<MissingPayment[]> {
    // Requête complexe pour trouver les paiements manquants
  }
}
```

### Tasks PHASE 0

- [ ] Créer structure `lib/db/repositories`
- [ ] Créer structure `lib/services`
- [ ] Écrire Zod schemas pour toutes entities
- [ ] Exécuter migrations SQL (Supabase migrations)
- [ ] Refactor 3 pages pour utiliser services (home, logements, contrats)
- [ ] Setup error handling + logging
- [ ] Configurer linting (ESLint) + formatting (Prettier)
- [ ] Tests unitaires pour 2 services critiques

**Temps estimé: 2-3 jours**

---

## PHASE 1: DESIGN & ANIMATIONS (4-5 jours)

### Objectifs
- ✅ Setup Framer Motion animations
- ✅ Ajouter toutes animations de page
- ✅ Skeleton loaders pour tous loading states
- ✅ Polish UI/UX complète

### Livrables

#### 1. Animation Component Library

```typescript
// components/animations/
├── PageTransition.tsx     // Page enter/exit animations
├── CardStagger.tsx        // Staggered card animations
├── SkeletonLoader.tsx     // Loading skeleton
├── EmptyState.tsx         // Empty state animations
├── LoadingSpinner.tsx     // Custom spinner with Lottie
├── transitions.ts         // Reusable transition variants
└── useAnimationState.ts   // Hook for animation logic
```

#### 2. Framer Motion Setup

```typescript
// components/animations/transitions.ts
export const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};
```

#### 3. Skeleton Loaders

```typescript
// components/animations/SkeletonLoader.tsx
export function StatCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-4 space-y-2">
        <div className="h-4 bg-neutral-200 rounded w-1/3" />
        <div className="h-6 bg-neutral-200 rounded w-2/3" />
        <div className="h-3 bg-neutral-100 rounded w-1/2" />
      </CardContent>
    </Card>
  );
}

export function TableSkeleton({ rows = 5 }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {[...Array(4)].map((_, i) => (
            <TableHead key={i}>
              <div className="h-4 bg-neutral-200 rounded animate-pulse" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(rows)].map((_, i) => (
          <TableRow key={i} className="animate-pulse">
            {[...Array(4)].map((_, j) => (
              <TableCell key={j}>
                <div className="h-4 bg-neutral-100 rounded" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

#### 4. Update All Pages with Animations

**Pattern à appliquer sur chaque page:**

```typescript
"use client"

import { motion } from "framer-motion"
import { pageVariants, containerVariants, itemVariants } from "@/components/animations/transitions"

export default function LogementsPage() {
  const [isLoading, setIsLoading] = useState(true)
  
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      className="space-y-5"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {isLoading
          ? [...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((stat) => (
              <motion.div key={stat.label} variants={itemVariants}>
                <StatCard {...stat} />
              </motion.div>
            ))}
      </motion.div>
      
      {isLoading ? (
        <TableSkeleton />
      ) : (
        <motion.div variants={itemVariants}>
          <DataTable data={logements} />
        </motion.div>
      )}
    </motion.div>
  )
}
```

#### 5. Enhanced UI Polish

```typescript
// components/ui/
// Ajouter/modifier:
├── Tooltip.tsx            // Avec animation
├── Notification.tsx       // Toast avec animation slide-in
├── LoadingButton.tsx      // Button avec loading state animé
├── Modal.tsx              // Modal avec backdrop animation
├── Tabs.tsx               // Tabs avec underline animation
└── Drawer.tsx             // Drawer avec slide-in animation
```

### Tasks PHASE 1

- [ ] Installer Lottie (`lottie-react`)
- [ ] Setup Framer Motion hooks + utils
- [ ] Créer library composants animation
- [ ] Implémenter animations sur Home page
- [ ] Implémenter animations sur Logements page
- [ ] Implémenter animations sur Locataires page
- [ ] Implémenter animations sur Contrats page
- [ ] Ajouter page transitions (Layout animation)
- [ ] Ajouter Lottie animations pour empty states
- [ ] Custom scrollbar CSS
- [ ] Focus states pour accessibility
- [ ] Tester responsiveness des animations

**Temps estimé: 4-5 jours**

---


## PHASE 2: PERFORMANCE & CHARGEMENT INSTANTANÉ (3-4 jours)

### Objectifs
- ✅ Pagination on all tables
- ✅ React Query pour caching
- ✅ ISR + Revalidation
- ✅ Lazy loading images
- ✅ Code splitting
- ✅ Database query optimization

### Livrables

#### 1. React Query Setup

```typescript
// lib/react-query.ts
import { QueryClient } from "@tanstack/react-query"

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes
      retry: 1,
    },
  },
})
```

#### 2. Custom Hooks with React Query

```typescript
// lib/hooks/useLogements.ts
export function useLogements(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ["logements", page],
    queryFn: async () => {
      const supabase = createClient()
      const offset = (page - 1) * pageSize
      
      const { data, count, error } = await supabase
        .from("logements")
        .select("*", { count: "exact" })
        .range(offset, offset + pageSize - 1)
      
      return { data, total: count }
    },
  })
}

// lib/hooks/usePayments.ts
export function usePayments(contractId: string) {
  return useQuery({
    queryKey: ["payments", contractId],
    queryFn: () => getPaymentsByContract(contractId),
    staleTime: 1000 * 60, // 1 min
  })
}
```

#### 3. Pagination Component

```typescript
// components/ui/Pagination.tsx
import { ChevronLeft, ChevronRight } from "@phosphor-icons/react"

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading,
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-neutral-600">
        Page {currentPage} sur {totalPages}
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="p-2 hover:bg-neutral-100 disabled:opacity-50"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="p-2 hover:bg-neutral-100 disabled:opacity-50"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
```

#### 4. ISR Configuration

```typescript
// next.config.ts
export default {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  },
  experimental: {
    ppl: true, // Partial Pre-rendering
  },
}
```

#### 5. Lazy Loading Images

```typescript
// components/OptimizedImage.tsx
import Image from "next/image"

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  ...props
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      placeholder="blur"
      loading="lazy"
      {...props}
    />
  )
}
```

#### 6. Database Query Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_logements_immeuble_statut 
  ON logements(immeuble_id, statut);
  
CREATE INDEX idx_contrats_locataire_statut 
  ON contrats(locataire_id, statut);
  
CREATE INDEX idx_paiements_contrat_date 
  ON paiements(contrat_id, date_paiement DESC);
  
CREATE INDEX idx_paiements_periode 
  ON paiements(proprietaire_id, periode_debut, periode_fin);
```

### Tasks PHASE 2

- [ ] Setup React Query + QueryProvider
- [ ] Créer custom hooks pour chaque entity
- [ ] Implémenter pagination sur tables
- [ ] Ajouter React Query devtools (dev mode)
- [ ] Optimiser queries avec indexes
- [ ] Lazy load images
- [ ] Code splitting pour pages lourdes
- [ ] Setup ISR revalidation timing
- [ ] Cache strategy implementation
- [ ] Performance audit avec Lighthouse

**Temps estimé: 3-4 jours**

---

## PHASE 3: FEATURES CRITIQUES - PAIEMENTS (5-7 jours)

### Objectifs
- ✅ Formulaire enregistrement paiements
- ✅ Génération quittance PDF
- ✅ Réconciliation bancaire
- ✅ Détection paiements en retard

### Livrables

#### 1. Payment Form Component

```typescript
// components/payments/CreatePaymentForm.tsx
"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { PaymentSchema } from "@/lib/types/schema"

export function CreatePaymentForm({ contractId, onSuccess }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm({
    resolver: zodResolver(PaymentSchema),
    defaultValues: { contrat_id: contractId },
  })

  async function onSubmit(data) {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        body: JSON.stringify(data),
      })
      
      if (!response.ok) throw new Error("Erreur enregistrement")
      
      onSuccess()
      form.reset()
    } catch (error) {
      form.setError("root", { message: error.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Form fields */}
      <input type="hidden" {...form.register("contrat_id")} />
      
      <div>
        <label className="text-sm font-medium">Montant</label>
        <input
          type="number"
          step="0.01"
          {...form.register("montant", { valueAsNumber: true })}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2"
        />
        {form.formState.errors.montant && (
          <p className="text-sm text-danger-500">
            {form.formState.errors.montant.message}
          </p>
        )}
      </div>

      {/* Other fields: date, mode, periode_debut, periode_fin */}
      
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-primary-600 px-4 py-2 text-white disabled:opacity-50"
      >
        {isSubmitting ? "Enregistrement..." : "Enregistrer paiement"}
      </button>
    </form>
  )
}
```

#### 2. Server Action pour Paiements

```typescript
// app/actions/payments.ts
"use server"

import { PaymentService } from "@/lib/services/PaymentService"
import { createServerClient } from "@/lib/supabase/server"
import { PaymentSchema } from "@/lib/types/schema"

export async function createPayment(formData: unknown) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Unauthorized")

  // Validate
  const validated = PaymentSchema.parse(formData)

  // Create
  const service = new PaymentService(new PaymentRepository())
  const payment = await service.recordPayment(validated, user.id)

  // Generate receipt
  await generateReceipt(payment)

  return payment
}

export async function generateReceipt(payment: Payment) {
  // Utiliser jsPDF ou similar pour générer PDF quittance
  // Stocker dans Supabase Storage
}
```

#### 3. Receipt PDF Generation

```typescript
// lib/services/ReceiptService.ts
import { jsPDF } from "jspdf"
import { createClient } from "@/lib/supabase/server"

export async function generateReceiptPDF(payment: Payment) {
  const supabase = await createClient()
  
  // Fetch related data
  const contract = await getContractDetails(payment.contrat_id)
  const proprietaire = await getProprietaireInfo()
  
  // Create PDF
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(16)
  doc.text("QUITTANCE DE LOYER", 20, 20)
  
  // Content
  doc.setFontSize(10)
  doc.text(`Propriétaire: ${proprietaire.nom}`, 20, 40)
  doc.text(`Locataire: ${contract.locataire.nom}`, 20, 50)
  doc.text(`Logement: ${contract.logement.nom}`, 20, 60)
  doc.text(`Montant: ${payment.montant} ${proprietaire.devise}`, 20, 70)
  doc.text(`Période: ${formatDate(payment.periode_debut)} - ${formatDate(payment.periode_fin)}`, 20, 80)
  doc.text(`Date de paiement: ${formatDate(payment.date_paiement)}`, 20, 90)
  doc.text(`Mode: ${payment.mode}`, 20, 100)
  
  // Signature area
  doc.text("Signature du propriétaire:", 20, 130)
  doc.rect(20, 135, 50, 30)
  
  // Save to Supabase Storage
  const fileName = `receipt_${payment.id}_${Date.now()}.pdf`
  const pdfBytes = doc.output("arraybuffer")
  
  const { error } = await supabase.storage
    .from("receipts")
    .upload(`${proprietaire.id}/${fileName}`, pdfBytes)
  
  if (error) throw error
  
  // Update payment record with receipt URL
  await supabase
    .from("paiements")
    .update({ quittance_url: `receipts/${proprietaire.id}/${fileName}` })
    .eq("id", payment.id)
}
```

#### 4. Missing Payments Detection

```typescript
// lib/services/AlertService.ts
export async function detectMissingPayments(proprietaireId: string) {
  const supabase = await createClient()
  const currentMonth = new Date()
  currentMonth.setDate(1)
  
  // Get all active contracts
  const { data: contracts } = await supabase
    .from("contrats")
    .select("*")
    .eq("proprietaire_id", proprietaireId)
    .eq("statut", "actif")
  
  const missingPayments = []
  
  for (const contract of contracts) {
    // Check if payment exists for this month
    const { data: payment } = await supabase
      .from("paiements")
      .select("id")
      .eq("contrat_id", contract.id)
      .gte("periode_debut", currentMonth)
      .single()
    
    if (!payment) {
      missingPayments.push({
        contrat_id: contract.id,
        locataire_nom: contract.locataire.nom,
        loyer_attendu: contract.loyer_mensuel,
        jours_retard: Math.floor(
          (Date.now() - contract.date_debut.getTime()) / (1000 * 60 * 60 * 24)
        ),
      })
    }
  }
  
  return missingPayments
}
```

#### 5. Payment Page Updated

```typescript
// app/(dashboard)/paiements/page.tsx
"use client"

import { useState } from "react"
import { usePayments } from "@/lib/hooks/usePayments"
import { CreatePaymentForm } from "@/components/payments/CreatePaymentForm"
import { Pagination } from "@/components/ui/Pagination"

export default function PaiementsPage() {
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  
  const { data, isPending } = usePayments(page)
  
  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Paiements</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg"
        >
          {showForm ? "Annuler" : "Enregistrer un paiement"}
        </button>
      </div>
      
      {showForm && (
        <Card>
          <CardContent className="p-6">
            <CreatePaymentForm onSuccess={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}
      
      {/* Payments table */}
      <PaymentTable data={data?.data} isLoading={isPending} />
      
      <Pagination
        currentPage={page}
        totalPages={Math.ceil((data?.total || 0) / 20)}
        onPageChange={setPage}
      />
    </div>
  )
}
```

### Tasks PHASE 3

- [ ] Créer PaymentService avec logique métier
- [ ] Build CreatePaymentForm avec validation
- [ ] Implémenter generateReceipt avec jsPDF
- [ ] Setup Supabase Storage pour receipts
- [ ] Créer server action createPayment
- [ ] Implémenter detectMissingPayments
- [ ] Update Paiements page avec form
- [ ] Tester duplicate payment detection
- [ ] Validation des dates (periode_fin > periode_debut)
- [ ] Email notification au locataire quand paiement créé

**Temps estimé: 5-7 jours**

---


## PHASE 4: FEATURES CRITIQUES - ALERTES & NOTIFICATIONS (3-4 jours)

### Objectifs
- ✅ Système d'alertes pour impayés
- ✅ Contrats expirant bientôt
- ✅ Notifications (page + email)
- ✅ Dashboard alertes

### Livrables

#### 1. Alert System

```typescript
// lib/services/AlertService.ts
export class AlertService {
  async generateDailyAlerts(proprietaireId: string) {
    const supabase = await createClient()
    const now = new Date()
    
    // 1. Missing payments
    const missingPayments = await this.detectMissingPayments(proprietaireId)
    
    // 2. Expiring contracts (within 30 days)
    const { data: expiringContracts } = await supabase
      .from("contrats")
      .select("*")
      .eq("proprietaire_id", proprietaireId)
      .eq("statut", "actif")
      .lte("date_fin", new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000))
      .gt("date_fin", now)
    
    // 3. Overdue deposits to return
    const { data: depositsToReturn } = await supabase
      .from("garanties")
      .select("*")
      .eq("proprietaire_id", proprietaireId)
      .eq("status", "held")
      // Where contract expired > 10 days ago
    
    // Create alert records
    for (const payment of missingPayments) {
      await supabase.from("alerts").insert({
        proprietaire_id: proprietaireId,
        type: "missing_payment",
        entity_id: payment.contrat_id,
        severity: "high",
        message: `Paiement manquant: ${payment.locataire_nom}`,
        created_at: now,
      })
    }
    
    return {
      missingPayments,
      expiringContracts,
      depositsToReturn,
    }
  }
}
```

#### 2. Alerts Table & DB Schema

```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proprietaire_id UUID NOT NULL REFERENCES auth.users,
  type TEXT NOT NULL, -- 'missing_payment', 'expiring_contract', 'deposit_to_return'
  severity TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  entity_type TEXT,
  entity_id UUID,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  action_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  expires_at TIMESTAMP
);

CREATE INDEX idx_alerts_proprietaire_read ON alerts(proprietaire_id, is_read);
CREATE INDEX idx_alerts_created ON alerts(created_at DESC);
```

#### 3. Notifications Page (Working)

```typescript
// app/(dashboard)/notifications/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { CheckCircle, X } from "@phosphor-icons/react"

export default function NotificationsPage() {
  const { data: alerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: async () => {
      const res = await fetch("/api/alerts")
      return res.json()
    },
  })

  async function markAsRead(alertId: string) {
    await fetch(`/api/alerts/${alertId}`, {
      method: "PATCH",
      body: JSON.stringify({ is_read: true }),
    })
  }

  const unreadCount = alerts?.filter(a => !a.is_read).length ?? 0

  return (
    <motion.div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {unreadCount > 0 && (
          <span className="bg-danger-500 text-white px-3 py-1 rounded-full text-sm">
            {unreadCount} non lues
          </span>
        )}
      </div>

      <div className="space-y-2">
        {alerts?.map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-4 rounded-lg border flex justify-between items-start ${
              alert.severity === "high"
                ? "border-danger-200 bg-danger-50"
                : alert.severity === "medium"
                  ? "border-warning-200 bg-warning-50"
                  : "border-neutral-200 bg-neutral-50"
            }`}
          >
            <div className="flex-1">
              <p className="font-medium text-neutral-900">{alert.message}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {formatDate(alert.created_at)}
              </p>
            </div>
            <button
              onClick={() => markAsRead(alert.id)}
              className="text-neutral-400 hover:text-neutral-600"
            >
              {alert.is_read ? <CheckCircle size={20} /> : <X size={20} />}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
```

#### 4. Email Notifications

```typescript
// lib/services/EmailService.ts
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendMissingPaymentAlert(
  proprietaire: Proprietaire,
  alert: Alert
) {
  await resend.emails.send({
    from: "noreply@loka.app",
    to: proprietaire.email,
    subject: `[ALERTE] Paiement manquant - ${alert.message}`,
    html: `
      <h2>Paiement manquant</h2>
      <p>${alert.message}</p>
      <p>Veuillez vérifier votre tableau de bord pour plus de détails.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/paiements">
        Voir les paiements
      </a>
    `,
  })
}

export async function sendReceiptToTenant(
  tenant: Tenant,
  payment: Payment,
  receiptUrl: string
) {
  await resend.emails.send({
    from: "noreply@loka.app",
    to: tenant.email,
    subject: `Quittance de loyer - ${formatDate(payment.date_paiement)}`,
    html: `
      <h2>Quittance de loyer</h2>
      <p>Montant: ${payment.montant} ${payment.devise}</p>
      <p>Période: ${formatDate(payment.periode_debut)} - ${formatDate(payment.periode_fin)}</p>
      <a href="${receiptUrl}">Télécharger la quittance</a>
    `,
  })
}
```

#### 5. Home Page Alert Widget

```typescript
// components/dashboard/AlertWidget.tsx
export function AlertWidget({ alerts }) {
  const criticalCount = alerts.filter(a => a.severity === "high").length
  
  return (
    <Card className="border-danger-200 bg-danger-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WarningCircle size={18} className="text-danger-600" />
          Alertes critiques
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {criticalCount === 0 ? (
          <p className="text-sm text-neutral-600">Aucune alerte</p>
        ) : (
          alerts
            .filter(a => a.severity === "high")
            .slice(0, 3)
            .map(alert => (
              <p key={alert.id} className="text-sm text-danger-700">
                • {alert.message}
              </p>
            ))
        )}
        <Link
          href="/notifications"
          className="text-sm font-medium text-danger-600 hover:text-danger-700 mt-2 inline-block"
        >
          Voir toutes les alertes →
        </Link>
      </CardContent>
    </Card>
  )
}
```

### Tasks PHASE 4

- [ ] Créer table alerts dans DB
- [ ] Implémenter AlertService
- [ ] Créer cron job pour generate daily alerts (cloud function)
- [ ] Setup Resend pour emails
- [ ] Implémenter sendMissingPaymentAlert
- [ ] Implémenter sendReceiptToTenant
- [ ] Build working Notifications page
- [ ] Add AlertWidget au Home
- [ ] Ajouter toast notifications pour actions
- [ ] Setup read/unread tracking

**Temps estimé: 3-4 jours**

---

## PHASE 5: WORKFLOWS CONTRATS (4-5 jours)

### Objectifs
- ✅ Création contrats complète
- ✅ Renouvellement contrats
- ✅ Résiliation contrats
- ✅ Gestion garanties

### Livrables

#### 1. Contract State Machine

```typescript
// lib/types/contract.ts
export type ContractStatus = "actif" | "termine" | "resilie" | "pending_renewal"

export const contractTransitions: Record<ContractStatus, ContractStatus[]> = {
  "actif": ["termine", "resilie", "pending_renewal"],
  "pending_renewal": ["actif", "resilie"],
  "termine": ["actif"], // renewal
  "resilie": [], // terminal state
}

export function canTransition(from: ContractStatus, to: ContractStatus): boolean {
  return contractTransitions[from]?.includes(to) ?? false
}
```

#### 2. Contract Service

```typescript
// lib/services/ContractService.ts
export class ContractService {
  constructor(
    private contractRepo: ContractRepository,
    private paymentRepo: PaymentRepository,
    private guaranteeRepo: GuaranteeRepository
  ) {}

  async createContract(dto: CreateContractDTO, userId: string) {
    // Validate contract dates
    if (dto.date_fin && dto.date_fin <= dto.date_debut) {
      throw new ValidationError("Date fin doit être après date début")
    }

    // Check for overlapping contracts on same logement
    const overlapping = await this.contractRepo.findOverlapping(
      dto.logement_id,
      dto.date_debut,
      dto.date_fin
    )
    
    if (overlapping.length > 0) {
      throw new ValidationError("Contrat chevauchant existant")
    }

    // Create contract
    const contract = await this.contractRepo.create(dto, userId)

    // Create guarantee record
    if (dto.depot_garantie > 0) {
      await this.guaranteeRepo.create({
        contrat_id: contract.id,
        amount: dto.depot_garantie,
        status: "held",
      }, userId)
    }

    // Update logement status
    await this.logementRepo.updateStatus(dto.logement_id, "occupe")

    return contract
  }

  async renewContract(
    contractId: string,
    newTermData: RenewContractDTO,
    userId: string
  ) {
    const oldContract = await this.contractRepo.getById(contractId)
    
    if (!canTransition(oldContract.statut, "pending_renewal")) {
      throw new ValidationError("Contrat ne peut pas être renouvelé")
    }

    // Create new contract with same tenant/logement but new dates
    const newContract = await this.contractRepo.create({
      locataire_id: oldContract.locataire_id,
      logement_id: oldContract.logement_id,
      loyer_mensuel: newTermData.loyer_mensuel,
      depot_garantie: newTermData.depot_garantie,
      date_debut: newTermData.date_debut,
      date_fin: newTermData.date_fin,
      statut: "actif",
    }, userId)

    // Mark old contract as terminated
    await this.contractRepo.updateStatus(contractId, "termine")

    return newContract
  }

  async terminateContract(
    contractId: string,
    terminationData: TerminateContractDTO,
    userId: string
  ) {
    const contract = await this.contractRepo.getById(contractId)

    // Mark as terminated
    await this.contractRepo.updateStatus(contractId, "termine")

    // Handle guarantee return
    const guarantee = await this.guaranteeRepo.getByContractId(contractId)
    
    if (guarantee && guarantee.status === "held") {
      // Process deductions if any
      const returnAmount = guarantee.amount - (terminationData.deductions || 0)
      
      await this.guaranteeRepo.update(contractId, {
        status: terminationData.deductions > 0 ? "partial_return" : "returned",
        returned_at: new Date(),
        return_initiated_at: new Date(),
        deductions: terminationData.deductionDetails,
      })

      // Send email to tenant about guarantee return
      await sendGuaranteeReturnEmail(contract.locataire, returnAmount)
    }

    // Update logement to vacant
    await this.logementRepo.updateStatus(contract.logement_id, "vacant")
  }
}
```

#### 3. Enhanced Contract Form

```typescript
// components/contracts/CreateContractForm.tsx
"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"

export function CreateContractForm({ onSuccess }) {
  const [step, setStep] = useState(1)
  const form = useForm({
    resolver: zodResolver(ContractSchema),
  })

  async function onSubmit(data) {
    try {
      const res = await fetch("/api/contracts", {
        method: "POST",
        body: JSON.stringify(data),
      })
      
      if (!res.ok) throw new Error("Erreur création contrat")
      
      onSuccess()
    } catch (error) {
      form.setError("root", { message: error.message })
    }
  }

  return (
    <motion.form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="font-semibold">Sélectionner locataire et logement</h3>
          
          <Controller
            control={form.control}
            name="locataire_id"
            render={({ field }) => (
              <select {...field} className="w-full rounded-lg border border-neutral-300 px-3 py-2">
                <option value="">Choisir un locataire</option>
                {/* Options */}
              </select>
            )}
          />

          <Controller
            control={form.control}
            name="logement_id"
            render={({ field }) => (
              <select {...field} className="w-full rounded-lg border border-neutral-300 px-3 py-2">
                <option value="">Choisir un logement</option>
                {/* Options */}
              </select>
            )}
          />

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg"
          >
            Suivant
          </button>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <h3 className="font-semibold">Détails contrat</h3>
          
          {/* Loyer, garantie, dates fields */}
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 border border-neutral-300 px-4 py-2 rounded-lg"
            >
              Retour
            </button>
            <button
              type="submit"
              className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg"
            >
              Créer contrat
            </button>
          </div>
        </motion.div>
      )}
    </motion.form>
  )
}
```

#### 4. Contract Detail Page - Action Buttons

```typescript
// app/(dashboard)/contrats/[id]/page.tsx
export default async function ContractDetailPage({ params }) {
  const contract = await getContract(params.id)
  const guarantee = await getGuarantee(contract.id)

  return (
    <div className="space-y-6">
      {/* Contract details */}

      <Card className="border-primary-200 bg-primary-50/50">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {contract.statut === "actif" && (
            <>
              <Link
                href={`/contrats/${contract.id}/renew`}
                className="block w-full bg-primary-600 text-white px-4 py-2 rounded-lg text-center"
              >
                Renouveler le contrat
              </Link>
              <button
                onClick={() => setShowTerminateModal(true)}
                className="w-full border border-danger-200 text-danger-600 px-4 py-2 rounded-lg"
              >
                Résilier le contrat
              </button>
            </>
          )}

          {guarantee && guarantee.status === "held" && (
            <button
              onClick={() => setShowGuaranteeModal(true)}
              className="w-full border border-warning-200 text-warning-600 px-4 py-2 rounded-lg"
            >
              Gérer la garantie
            </button>
          )}
        </CardContent>
      </Card>

      {/* Guarantee details */}
      {guarantee && (
        <GuaranteeCard guarantee={guarantee} contractId={contract.id} />
      )}
    </div>
  )
}
```

### Tasks PHASE 5

- [ ] Implémenter ContractService avec state machine
- [ ] Créer CreateContractForm multi-step
- [ ] Build renewContract flow
- [ ] Build terminateContract flow
- [ ] Setup Guarantee system
- [ ] Créer GuaranteeReturnForm
- [ ] Tester overlapping contracts detection
- [ ] Email notifications pour contract events
- [ ] Contract PDF generation (optional)

**Temps estimé: 4-5 jours**

---


## PHASE 6: RAPPORTS & ANALYTICS (5-6 jours)

### Objectifs
- ✅ Rapports financiers complets
- ✅ Taux d'occupation tracking
- ✅ Charts avec Recharts
- ✅ Export PDF/CSV
- ✅ Tax reporting

### Livrables

#### 1. Report Service

```typescript
// lib/services/ReportService.ts
export class ReportService {
  async getFinancialReport(
    proprietaireId: string,
    startDate: Date,
    endDate: Date
  ) {
    const supabase = await createClient()
    
    // Get all payments in period
    const { data: payments } = await supabase
      .from("paiements")
      .select("*")
      .eq("proprietaire_id", proprietaireId)
      .gte("date_paiement", startDate)
      .lte("date_paiement", endDate)
    
    // Get all expenses (from future feature)
    const { data: expenses } = await supabase
      .from("expenses")
      .select("*")
      .eq("proprietaire_id", proprietaireId)
      .gte("date", startDate)
      .lte("date", endDate)
    
    const totalRevenue = payments.reduce((sum, p) => sum + p.montant, 0)
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const netProfit = totalRevenue - totalExpenses
    
    // Group by month for chart
    const monthlyData = this.groupByMonth(payments, expenses)
    
    return {
      period: { startDate, endDate },
      totalRevenue,
      totalExpenses,
      netProfit,
      profitMargin: (netProfit / totalRevenue) * 100,
      monthlyData,
      paymentMethods: this.analyzePaymentMethods(payments),
      tenantPerformance: await this.getTenantPaymentPerformance(proprietaireId),
    }
  }

  async getOccupancyReport(proprietaireId: string) {
    const supabase = await createClient()
    
    // Get all logements
    const { data: logements } = await supabase
      .from("logements")
      .select("*, immeuble:immeubles(nom)")
      .in(
        "immeuble_id",
        (await supabase.from("immeubles").select("id").eq("proprietaire_id", proprietaireId)).data.map(i => i.id)
      )
    
    const occupied = logements.filter(l => l.statut === "occupe").length
    const occupancyRate = (occupied / logements.length) * 100
    
    // Get historical occupancy (from audit logs or separate tracking)
    const historicalData = await this.getOccupancyTrend(proprietaireId)
    
    return {
      totalProperties: logements.length,
      occupied,
      vacant: logements.length - occupied,
      occupancyRate,
      historicalData,
      propertyBreakdown: this.groupByProperty(logements),
    }
  }

  async getTaxReport(proprietaireId: string, year: number) {
    // Calculate taxable income
    const revenue = await this.getTotalRevenueForYear(proprietaireId, year)
    const expenses = await this.getTotalExpensesForYear(proprietaireId, year)
    const taxableIncome = revenue - expenses
    
    return {
      year,
      grossRevenue: revenue,
      deductibleExpenses: expenses,
      taxableIncome,
      // Format for tax authority reporting
    }
  }
  
  private groupByMonth(payments, expenses) {
    const months = {}
    
    for (const payment of payments) {
      const month = formatYearMonth(payment.date_paiement)
      if (!months[month]) months[month] = { revenue: 0, expenses: 0 }
      months[month].revenue += payment.montant
    }
    
    for (const expense of expenses) {
      const month = formatYearMonth(expense.date)
      if (!months[month]) months[month] = { revenue: 0, expenses: 0 }
      months[month].expenses += expense.amount
    }
    
    return Object.entries(months).map(([month, data]) => ({
      month,
      ...data,
      profit: data.revenue - data.expenses,
    }))
  }
}
```

#### 2. Charts Component

```typescript
// components/reports/FinancialCharts.tsx
"use client"

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

export function RevenueChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={2} />
        <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} />
        <Line type="monotone" dataKey="profit" stroke="#22c55e" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function OccupancyChart({ data }) {
  const chartData = [
    { name: "Occupés", value: data.occupied },
    { name: "Vacants", value: data.vacant },
  ]
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value }) => `${name}: ${value}`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          <Cell fill="#4f46e5" />
          <Cell fill="#ef4444" />
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

export function PaymentMethodsChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="mode" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#4f46e5" />
      </BarChart>
    </ResponsiveContainer>
  )
}
```

#### 3. Reports Page

```typescript
// app/(dashboard)/rapports/page.tsx
"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { DownloadIcon } from "@phosphor-icons/react"
import { RevenueChart, OccupancyChart, PaymentMethodsChart } from "@/components/reports/FinancialCharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function RapportsPage() {
  const [period, setPeriod] = useState("month") // month, quarter, year
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
  const [endDate, setEndDate] = useState(new Date())

  const { data: financialData } = useQuery({
    queryKey: ["financial-report", startDate, endDate],
    queryFn: async () => {
      const res = await fetch(
        `/api/reports/financial?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
      )
      return res.json()
    },
  })

  const { data: occupancyData } = useQuery({
    queryKey: ["occupancy-report"],
    queryFn: async () => {
      const res = await fetch("/api/reports/occupancy")
      return res.json()
    },
  })

  async function exportToPDF() {
    const res = await fetch("/api/reports/export-pdf", {
      method: "POST",
      body: JSON.stringify({
        financial: financialData,
        occupancy: occupancyData,
        period: { startDate, endDate },
      }),
    })
    
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `rapport_${formatDate(new Date())}.pdf`
    a.click()
  }

  async function exportToCSV() {
    // Similar to PDF but export to CSV
  }

  return (
    <motion.div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Rapports</h1>
        <div className="flex gap-2">
          <Button onClick={exportToPDF} variant="outline">
            <DownloadIcon size={16} />
            Export PDF
          </Button>
          <Button onClick={exportToCSV} variant="outline">
            <DownloadIcon size={16} />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date range picker */}
      <Card>
        <CardContent className="p-4 flex gap-4">
          <input type="date" value={startDate} onChange={e => setStartDate(new Date(e.target.value))} />
          <input type="date" value={endDate} onChange={e => setEndDate(new Date(e.target.value))} />
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenu total" value={formatMontant(financialData?.totalRevenue)} />
        <StatCard label="Dépenses" value={formatMontant(financialData?.totalExpenses)} />
        <StatCard label="Profit net" value={formatMontant(financialData?.netProfit)} />
        <StatCard label="Marge" value={`${financialData?.profitMargin?.toFixed(1)}%`} />
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <CardTitle>Revenus et dépenses (mois)</CardTitle>
        </CardHeader>
        <CardContent>
          {financialData && <RevenueChart data={financialData.monthlyData} />}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Taux d'occupation</CardTitle>
          </CardHeader>
          <CardContent>
            {occupancyData && <OccupancyChart data={occupancyData} />}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Modes de paiement</CardTitle>
          </CardHeader>
          <CardContent>
            {financialData && <PaymentMethodsChart data={financialData.paymentMethods} />}
          </CardContent>
        </Card>
      </div>

      {/* Tax report section */}
      <Card className="border-primary-200 bg-primary-50/50">
        <CardHeader>
          <CardTitle>Rapport fiscal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>Revenu foncier brut: {formatMontant(financialData?.totalRevenue)}</p>
          <p>Charges déductibles: {formatMontant(financialData?.totalExpenses)}</p>
          <p className="font-semibold">Revenu imposable: {formatMontant(financialData?.netProfit)}</p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

#### 4. PDF Export

```typescript
// lib/services/ExportService.ts
import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

export async function generateReportPDF(data: ReportData) {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(16)
  doc.text("RAPPORT DE GESTION LOCATIVE", 20, 20)
  
  doc.setFontSize(10)
  doc.text(`Période: ${formatDate(data.period.startDate)} - ${formatDate(data.period.endDate)}`, 20, 30)
  
  // Financial summary
  doc.setFontSize(12)
  doc.text("Résumé Financier", 20, 45)
  
  autoTable(doc, {
    startY: 50,
    head: [["Métrique", "Montant"]],
    body: [
      ["Revenu total", formatMontant(data.financial.totalRevenue)],
      ["Dépenses", formatMontant(data.financial.totalExpenses)],
      ["Profit net", formatMontant(data.financial.netProfit)],
      ["Marge", `${data.financial.profitMargin.toFixed(1)}%`],
    ],
  })
  
  // Occupancy section
  let yPos = doc.lastAutoTable.finalY + 20
  doc.text("Occupation des logements", 20, yPos)
  
  autoTable(doc, {
    startY: yPos + 5,
    head: [["Statut", "Nombre", "Pourcentage"]],
    body: [
      ["Occupés", data.occupancy.occupied, `${data.occupancy.occupancyRate.toFixed(1)}%`],
      ["Vacants", data.occupancy.vacant, `${(100 - data.occupancy.occupancyRate).toFixed(1)}%`],
    ],
  })
  
  // Save
  doc.save(`rapport_${formatDate(new Date())}.pdf`)
}
```

### Tasks PHASE 6

- [ ] Implémenter ReportService avec tous calculs
- [ ] Setup Recharts avec animations
- [ ] Build FinancialCharts composants
- [ ] Build RapportsPage complète
- [ ] Implémenter PDF export avec jsPDF
- [ ] Implémenter CSV export
- [ ] Ajouter date range picker
- [ ] Calculer tax reporting
- [ ] Tester avec données réelles
- [ ] Ajouter comparaison year-over-year

**Temps estimé: 5-6 jours**

---

## PHASE 7: TESTING & HARDENING (3-4 jours)

### Objectifs
- ✅ Tests unitaires critiques
- ✅ Tests d'intégration
- ✅ Error handling robuste
- ✅ Security audit
- ✅ Performance testing

### Livrables

#### 1. Unit Tests

```typescript
// lib/services/__tests__/PaymentService.test.ts
import { PaymentService } from "@/lib/services/PaymentService"
import { MockPaymentRepository } from "./mocks"

describe("PaymentService", () => {
  let service: PaymentService
  let mockRepo: MockPaymentRepository

  beforeEach(() => {
    mockRepo = new MockPaymentRepository()
    service = new PaymentService(mockRepo)
  })

  test("should create payment successfully", async () => {
    const payment = await service.recordPayment({
      contrat_id: "123",
      montant: 1000,
      date_paiement: new Date(),
      mode: "virement",
    }, "user-1")

    expect(payment.id).toBeDefined()
    expect(mockRepo.created).toContainEqual(expect.objectContaining({ montant: 1000 }))
  })

  test("should reject duplicate payment", async () => {
    await mockRepo.insert({
      contrat_id: "123",
      periode_debut: new Date("2024-01-01"),
      periode_fin: new Date("2024-01-31"),
    })

    expect(() =>
      service.recordPayment({
        contrat_id: "123",
        periode_debut: new Date("2024-01-01"),
        periode_fin: new Date("2024-01-31"),
      }, "user-1")
    ).rejects.toThrow("Duplicate")
  })
})
```

#### 2. Integration Tests

```typescript
// __tests__/integration/contract-workflow.test.ts
describe("Contract Workflow", () => {
  test("should create, renew, and terminate contract", async () => {
    // Setup
    const tenant = await createTestTenant()
    const property = await createTestProperty()

    // Create contract
    const contract = await contractService.createContract({
      locataire_id: tenant.id,
      logement_id: property.id,
      loyer_mensuel: 1000,
      date_debut: new Date("2024-01-01"),
      date_fin: new Date("2025-01-01"),
    }, "user-1")

    expect(contract.statut).toBe("actif")
    expect(property.statut).toBe("occupe")

    // Renew contract
    const renewed = await contractService.renewContract(contract.id, {
      loyer_mensuel: 1050,
      date_debut: new Date("2025-01-01"),
      date_fin: new Date("2026-01-01"),
    }, "user-1")

    expect(renewed.id).not.toBe(contract.id)
    expect(renewed.loyer_mensuel).toBe(1050)

    // Terminate
    await contractService.terminateContract(contract.id, {}, "user-1")

    const terminated = await contractService.getById(contract.id)
    expect(terminated.statut).toBe("termine")
  })
})
```

#### 3. Error Handling

```typescript
// lib/errors/ApplicationError.ts
export class ApplicationError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message)
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "VALIDATION_ERROR", 400, details)
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string) {
    super(message, "NOT_FOUND", 404)
  }
}

export class DuplicatePaymentError extends ApplicationError {
  constructor() {
    super("Payment already exists for this period", "DUPLICATE_PAYMENT", 409)
  }
}

// API error handler middleware
export function handleApiError(error: unknown) {
  if (error instanceof ApplicationError) {
    return {
      message: error.message,
      code: error.code,
      details: error.details,
    }
  }

  // Log unexpected errors
  console.error("Unexpected error:", error)
  
  return {
    message: "An unexpected error occurred",
    code: "INTERNAL_ERROR",
  }
}
```

#### 4. Security Audit

```typescript
// Checklist:
- [ ] RLS policies verified on all tables
- [ ] API routes validate user ownership
- [ ] Input validation with Zod on all endpoints
- [ ] CORS configured correctly
- [ ] Rate limiting on sensitive endpoints
- [ ] XSS protection (no dangerouslySetInnerHTML)
- [ ] CSRF tokens on mutations
- [ ] Secrets not in code (env vars only)
- [ ] Password validation strong
- [ ] Audit logging for sensitive operations
```

### Tasks PHASE 7

- [ ] Setup Jest + React Testing Library
- [ ] Write 20+ unit tests pour services
- [ ] Write 10+ integration tests
- [ ] Setup error handling wrapper
- [ ] Add try-catch à tous API routes
- [ ] Security audit checklist
- [ ] Performance profiling
- [ ] Load testing (k6 ou Artillery)
- [ ] Sentry integration pour error tracking
- [ ] Monitoring setup

**Temps estimé: 3-4 jours**

---

## PHASE 8: DOCUMENTATION & DEPLOYMENT (2-3 jours)

### Objectifs
- ✅ Documentation complète
- ✅ Setup CI/CD
- ✅ Deployment workflow
- ✅ Monitoring & logging

### Livrables

#### 1. Documentation

```markdown
# Loka - Documentation

## Installation & Setup
1. Clone repository
2. `npm install`
3. `cp .env.example .env.local`
4. Configure Supabase keys
5. `npm run dev`

## Architecture
- Services layer
- Repository pattern
- Error handling
- Type safety with Zod

## Database
- Schema and migrations
- RLS policies
- Indexes for performance

## API Routes
- /api/contracts
- /api/payments
- /api/alerts
- /api/reports

## Testing
- Unit tests with Jest
- Integration tests
- Running: `npm run test`

## Deployment
- Vercel for frontend
- Supabase managed DB
- Email: Resend
- Storage: Supabase Storage
```

#### 2. CI/CD Pipeline

```yaml
# .github/workflows/main.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - run: npm run build
      - uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

#### 3. Monitoring Setup

```typescript
// lib/monitoring.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
})

export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, { extra: context })
}

export function logMetric(name: string, value: number) {
  // Send to monitoring service
}
```

### Tasks PHASE 8

- [ ] Write README complet
- [ ] Write ARCHITECTURE.md
- [ ] Write DATABASE.md
- [ ] Write API.md
- [ ] Setup Vercel deployment
- [ ] Configure environment variables
- [ ] Setup GitHub Actions CI/CD
- [ ] Setup Sentry monitoring
- [ ] Setup logs aggregation
- [ ] Create runbooks for incidents
- [ ] Final QA checklist

**Temps estimé: 2-3 jours**

---

## TIMELINE TOTAL

```
PHASE 0:  ████░░░░░░░░░░░░░░  (2-3 days)
PHASE 1:  ██████░░░░░░░░░░░░  (4-5 days) — in parallel with Phase 2
PHASE 2:  ██████░░░░░░░░░░░░  (3-4 days) — in parallel with Phase 1
PHASE 3:  ████████░░░░░░░░░░  (5-7 days)
PHASE 4:  ██████░░░░░░░░░░░░  (3-4 days)
PHASE 5:  ███████░░░░░░░░░░░  (4-5 days)
PHASE 6:  ████████░░░░░░░░░░  (5-6 days)
PHASE 7:  ██████░░░░░░░░░░░░  (3-4 days)
PHASE 8:  ████░░░░░░░░░░░░░░  (2-3 days)

TOTAL: 33-41 days ≈ 8-10 weeks (1 person full-time)
```

---

## DEPENDENCIES & RISK MITIGATION

### Phase 0 is blocking everything
→ Spend time on architecture, it's worth it

### Phases 1 & 2 can be done in parallel
→ Different skills: animations vs optimization

### Phases 3-6 are dependent sequentially
→ Paiements needed before Alertes
→ Alertes needed before reporting

### Phase 7 should start after Phase 3
→ Start testing early, don't wait until end

---

## SUCCESS CRITERIA

After completing this roadmap, Loka will:

✅ Have clean, testable architecture (Phase 0)
✅ Look premium with smooth animations (Phase 1)
✅ Load instantly with smart caching (Phase 2)
✅ Let users record & track payments (Phase 3)
✅ Alert users of problems automatically (Phase 4)
✅ Support full contract lifecycle (Phase 5)
✅ Provide actionable business insights (Phase 6)
✅ Be secure, tested, and monitored (Phase 7)
✅ Be deployable and documented (Phase 8)

**Result:** A professional-grade property management app, not a prototype.

---
