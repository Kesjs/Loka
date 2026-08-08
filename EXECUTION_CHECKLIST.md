# ✅ EXECUTION CHECKLIST - Loka Transformation

## SETUP INITIAL (Avant Phase 0)

```bash
# 1. Dependencies supplémentaires
npm install \
  @tanstack/react-query \
  react-hook-form \
  @hookform/resolvers \
  zod \
  framer-motion \
  jsPDF \
  jspdf-autotable \
  recharts \
  lottie-react \
  resend \
  @sentry/nextjs \
  jest \
  @testing-library/react \
  @testing-library/jest-dom

# 2. Dev dependencies
npm install -D \
  @types/jest \
  jest-environment-jsdom \
  ts-jest \
  @testing-library/user-event

# 3. Setup Jest
npx jest --init

# 4. Create base directories
mkdir -p lib/db/repositories
mkdir -p lib/services
mkdir -p lib/types
mkdir -p lib/hooks
mkdir -p components/animations
mkdir -p __tests__/unit
mkdir -p __tests__/integration
```

---

## PHASE 0: SETUP & ARCHITECTURE

### Checklist

- [ ] **Architecture Layer Abstraction**
  - [ ] Créer `lib/db/repositories/index.ts`
  - [ ] Implémenter `PaymentRepository.ts`
  - [ ] Implémenter `ContractRepository.ts`
  - [ ] Implémenter `TenantRepository.ts`
  - [ ] Implémenter `PropertyRepository.ts`
  - [ ] Créer `lib/db/schema.ts`

- [ ] **Types & Validation**
  - [ ] Créer `lib/types/domain.ts` (entities)
  - [ ] Créer `lib/types/dto.ts` (transfer objects)
  - [ ] Créer `lib/types/errors.ts`
  - [ ] Créer Zod schemas dans `lib/types/schema.ts`

- [ ] **Services**
  - [ ] Créer `lib/services/PaymentService.ts`
  - [ ] Créer `lib/services/ContractService.ts`
  - [ ] Créer `lib/services/AlertService.ts`
  - [ ] Créer `lib/services/ReportService.ts`

- [ ] **Database Migrations**
  - [ ] Migration: Normalize ownership (add proprietaire_id)
  - [ ] Migration: Add audit_logs table
  - [ ] Migration: Enhance paiements table
  - [ ] Migration: Add garanties table
  - [ ] Migration: Add alerts table
  - [ ] Create indexes for performance

- [ ] **Error Handling**
  - [ ] Implémenter `lib/errors/ApplicationError.ts`
  - [ ] Créer error handler middleware
  - [ ] Setup error logging

- [ ] **Code Quality**
  - [ ] Setup ESLint config
  - [ ] Setup Prettier config
  - [ ] Run `npm run lint` pass
  - [ ] Run `npm run type-check` pass

### Time: 2-3 days

---

## PHASE 1: DESIGN & ANIMATIONS

### Checklist

- [ ] **Framer Motion Setup**
  - [ ] Créer `components/animations/transitions.ts`
  - [ ] Créer `components/animations/PageTransition.tsx`
  - [ ] Créer `components/animations/CardStagger.tsx`
  - [ ] Créer `components/animations/useAnimationState.ts`

- [ ] **Skeleton Loaders**
  - [ ] Créer `components/animations/SkeletonLoader.tsx`
  - [ ] Créer `StatCardSkeleton` component
  - [ ] Créer `TableSkeleton` component
  - [ ] Créer `FormSkeleton` component

- [ ] **Lottie Animations**
  - [ ] Créer `components/animations/LoadingSpinner.tsx`
  - [ ] Créer `components/animations/EmptyState.tsx`
  - [ ] Importer/créer 3-4 Lottie files (loading, success, error, empty)

- [ ] **Update Pages with Animations**
  - [ ] Home page: wrap avec `PageTransition` + stagger cards
  - [ ] Logements page: stagger stats + skeleton loading
  - [ ] Locataires page: stagger list + animations
  - [ ] Contrats page: stagger cards + animations
  - [ ] All table rows: add hover animations

- [ ] **Enhanced UI Components**
  - [ ] Update `components/ui/Tooltip.tsx` avec animation
  - [ ] Créer `components/ui/Notification.tsx` (toast)
  - [ ] Créer `components/ui/LoadingButton.tsx`
  - [ ] Update modals avec backdrop animation
  - [ ] Update tabs/drawers avec transitions

- [ ] **Polish**
  - [ ] Custom scrollbar styling (CSS)
  - [ ] Focus states pour accessibility
  - [ ] Page transitions (exit animations)
  - [ ] Test toutes animations sur mobile

### Time: 4-5 days

---

## PHASE 2: PERFORMANCE & CHARGEMENT

### Checklist

- [ ] **React Query Setup**
  - [ ] Créer `lib/react-query.ts`
  - [ ] Setup QueryProvider dans `app/layout.tsx`
  - [ ] Add React Query DevTools

- [ ] **Custom Hooks**
  - [ ] Créer `lib/hooks/useLogements.ts`
  - [ ] Créer `lib/hooks/useLocataires.ts`
  - [ ] Créer `lib/hooks/useContrats.ts`
  - [ ] Créer `lib/hooks/usePaiements.ts`

- [ ] **Pagination**
  - [ ] Créer `components/ui/Pagination.tsx`
  - [ ] Intégrer sur Logements page
  - [ ] Intégrer sur Locataires page
  - [ ] Intégrer sur Contrats page
  - [ ] Intégrer sur Paiements page

- [ ] **Database Optimization**
  - [ ] Run migration: Create indexes
  - [ ] Verify index usage with EXPLAIN plans
  - [ ] Add query optimization comments

- [ ] **Image Optimization**
  - [ ] Créer `components/OptimizedImage.tsx`
  - [ ] Update all Image components
  - [ ] Setup image formats (avif, webp)

- [ ] **Code Splitting**
  - [ ] Setup dynamic imports pour heavy components
  - [ ] Lazy load report charts
  - [ ] Lazy load form pages

- [ ] **Performance Testing**
  - [ ] Run Lighthouse audit
  - [ ] Check Core Web Vitals
  - [ ] Load test avec k6

### Time: 3-4 days

---

## PHASE 3: PAIEMENTS

### Checklist

- [ ] **Payment Service**
  - [ ] Implémenter `PaymentService.recordPayment()`
  - [ ] Implémenter duplicate detection
  - [ ] Implémenter `getMissingPayments()`
  - [ ] Add audit logging

- [ ] **Payment Form**
  - [ ] Créer `components/payments/CreatePaymentForm.tsx`
  - [ ] Add form validation with react-hook-form
  - [ ] Add error handling
  - [ ] Add success feedback

- [ ] **PDF Receipt Generation**
  - [ ] Créer `lib/services/ReceiptService.ts`
  - [ ] Implement jsPDF template
  - [ ] Setup Supabase Storage for receipts
  - [ ] Test PDF generation

- [ ] **API Routes**
  - [ ] Créer `app/api/payments/route.ts` (POST)
  - [ ] Créer `app/api/payments/[id]/route.ts` (GET, PATCH)
  - [ ] Add authentication checks
  - [ ] Add error handling

- [ ] **Paiements Page**
  - [ ] Add CreatePaymentForm
  - [ ] Add payments table with pagination
  - [ ] Add filters/search
  - [ ] Add download receipt button

- [ ] **Testing**
  - [ ] Test duplicate payment detection
  - [ ] Test date validation
  - [ ] Test PDF generation
  - [ ] Test email sending

### Time: 5-7 days

---

## PHASE 4: ALERTES ✅ COMPLETE

### Checklist

- [x] **Database**
  - [x] Run migration: Create alerts table
  - [x] Add indexes

- [x] **Alert Service**
  - [x] Implémenter `AlertService.generateDailyAlerts()`
  - [x] Detect missing payments
  - [x] Detect expiring contracts
  - [x] Detect deposits to return (TODO in code)

- [x] **UI Components**
  - [x] Créer `AlertBell.tsx` (badge with count)
  - [x] Créer `AlertCenter.tsx` (modal interface)
  - [x] Créer `AlertNotification.tsx` (individual alert)
  - [x] Integrated into Navbar

- [x] **Alerts Page**
  - [x] Build `/notifications` page (200+ lines)
  - [x] Add alert list with filtering
  - [x] Add mark as read functionality
  - [x] Add animations & empty states
  - [x] Add batch operations

- [x] **API Routes**
  - [x] GET `/api/alerts` (all/unread)
  - [x] PATCH `/api/alerts` (batch mark read)
  - [x] GET `/api/alerts/[id]` → PATCH/DELETE individual
  - [x] GET `/api/alerts/critical-count` (badge)
  - [x] POST `/api/alerts/generate` (manual trigger)

- [x] **Integration**
  - [x] React Query hooks (useAlerts, useUnreadAlerts, useCriticalAlertCount)
  - [x] AlertBell in Navbar header
  - [x] AlertCenter modal on click
  - [x] Deep linking support

- [ ] **Scheduled Jobs** (Phase 5)
  - [ ] Setup Supabase cron (or Vercel cron)
  - [ ] Run daily alert generation
  - [ ] Email notification sending

### Time: 1 day (Phase 4 UI+API Complete)
### Email integration: Phase 5 (2-3 more days)

---

## PHASE 5: CONTRATS

### Checklist

- [ ] **Contract Service**
  - [ ] Implement contract state machine
  - [ ] Implement `createContract()`
  - [ ] Implement `renewContract()`
  - [ ] Implement `terminateContract()`
  - [ ] Implement overlapping detection

- [ ] **Guarantee System**
  - [ ] Créer `GuaranteeRepository.ts`
  - [ ] Implement guarantee creation on contract creation
  - [ ] Implement guarantee return workflow
  - [ ] Implement deduction handling

- [ ] **UI Forms**
  - [ ] Update `CreateContractForm.tsx` (multi-step)
  - [ ] Créer `RenewContractForm.tsx`
  - [ ] Créer `TerminateContractForm.tsx`
  - [ ] Créer `GuaranteeReturnForm.tsx`

- [ ] **Contract Detail Page**
  - [ ] Add action buttons (renew, terminate)
  - [ ] Show guarantee details
  - [ ] Add contract history
  - [ ] Add related payments

- [ ] **API Routes**
  - [ ] Update `/api/contracts` routes
  - [ ] Add `/api/contracts/[id]/renew`
  - [ ] Add `/api/contracts/[id]/terminate`
  - [ ] Add `/api/guarantees` routes

- [ ] **Testing**
  - [ ] Test contract creation
  - [ ] Test renewal flow
  - [ ] Test termination flow
  - [ ] Test overlapping detection

### Time: 4-5 days

---

## PHASE 6: RAPPORTS

### Checklist

- [ ] **Report Service**
  - [ ] Implement `getFinancialReport()`
  - [ ] Implement `getOccupancyReport()`
  - [ ] Implement `getTaxReport()`
  - [ ] Implement aggregation logic

- [ ] **Charts**
  - [ ] Créer revenue chart (Line)
  - [ ] Créer occupancy chart (Pie)
  - [ ] Créer payment methods chart (Bar)
  - [ ] Setup responsive containers

- [ ] **Reports Page**
  - [ ] Build date range picker
  - [ ] Build summary stats
  - [ ] Build charts section
  - [ ] Add tax report section

- [ ] **Export**
  - [ ] Implement PDF export with jsPDF
  - [ ] Implement CSV export
  - [ ] Add download buttons
  - [ ] Test exports

- [ ] **API Routes**
  - [ ] Create `/api/reports/financial`
  - [ ] Create `/api/reports/occupancy`
  - [ ] Create `/api/reports/export-pdf`
  - [ ] Create `/api/reports/export-csv`

- [ ] **Testing**
  - [ ] Test calculations
  - [ ] Test aggregations
  - [ ] Test PDF generation
  - [ ] Test with sample data

### Time: 5-6 days

---

## PHASE 7: TESTING & HARDENING

### Checklist

- [ ] **Unit Tests**
  - [ ] Write PaymentService tests (5+)
  - [ ] Write ContractService tests (5+)
  - [ ] Write AlertService tests (3+)
  - [ ] Write utility function tests (5+)
  - [ ] Run: `npm run test -- --coverage`

- [ ] **Integration Tests**
  - [ ] Write contract workflow test
  - [ ] Write payment flow test
  - [ ] Write alert generation test

- [ ] **Error Handling**
  - [ ] Add try-catch to all API routes
  - [ ] Add error boundary components
  - [ ] Test error scenarios
  - [ ] Setup Sentry

- [ ] **Security Audit**
  - [ ] Verify RLS policies
  - [ ] Check API authentication
  - [ ] Validate all inputs with Zod
  - [ ] Check XSS protection
  - [ ] Review secrets handling

- [ ] **Performance Testing**
  - [ ] Run Lighthouse (target: 90+)
  - [ ] Run load test with k6
  - [ ] Check Core Web Vitals
  - [ ] Profile with DevTools

### Time: 3-4 days

---

## PHASE 8: DOCUMENTATION & DEPLOYMENT

### Checklist

- [ ] **Documentation**
  - [ ] Write README.md
  - [ ] Write ARCHITECTURE.md
  - [ ] Write API.md
  - [ ] Write DATABASE.md
  - [ ] Write DEPLOYMENT.md

- [ ] **Deployment**
  - [ ] Setup Vercel project
  - [ ] Configure environment variables
  - [ ] Setup GitHub Actions
  - [ ] Configure pre-commit hooks

- [ ] **Monitoring**
  - [ ] Setup Sentry
  - [ ] Setup Vercel Analytics
  - [ ] Setup error logging
  - [ ] Create monitoring dashboard

- [ ] **Final QA**
  - [ ] Test all flows end-to-end
  - [ ] Test on mobile
  - [ ] Test on different browsers
  - [ ] Verify animations smooth
  - [ ] Check accessibility

### Time: 2-3 days

---

## QUICK START COMMANDS

```bash
# Start development
npm run dev

# Run tests
npm run test
npm run test -- --watch

# Build for production
npm run build
npm start

# Lint & format
npm run lint
npm run format

# Type checking
npm run type-check

# Generate Supabase migrations
supabase migration new <name>

# Push migrations to local
supabase migration up

# Check test coverage
npm run test -- --coverage
```

---

## DEPLOYMENT CHECKLIST

Before going live:

- [ ] All tests passing (`npm run test`)
- [ ] Lint passing (`npm run lint`)
- [ ] Type checking passing (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables set
- [ ] Sentry configured
- [ ] Database migrations applied
- [ ] RLS policies verified
- [ ] Email service working
- [ ] Backup strategy in place
- [ ] Monitoring alerts configured

---

## WEEKLY STANDUP TEMPLATE

**Week X - Phase Y**

✅ Completed:
- Item 1
- Item 2

🚧 In Progress:
- Item 1
- Item 2

⚠️ Blockers:
- Issue 1
- Issue 2

📊 Metrics:
- Code coverage: X%
- Performance score: Y/100
- Test pass rate: Z%

---
