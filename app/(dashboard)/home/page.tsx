import Link from "next/link"
import {
  Buildings,
  DoorOpen,
  Wallet,
  ChartPieSlice,
  WarningCircle,
  HandWaving,
} from "@phosphor-icons/react/dist/ssr"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  PageTransition,
} from "@/components/animations"
import { getDashboardData } from "@/lib/dashboard"
import { formatMontant, formatDate } from "@/lib/utils"
import { Suspense } from "react"
import { HeaderSkeleton, StatCardsSkeleton, TableSkeleton } from "@/components/animations"

async function DashboardContent() {
  const dashboard = await getDashboardData()
  const devise = dashboard.proprietaire?.devise ?? "FCFA"
  const nom = dashboard.proprietaire?.nom ?? ""

  const stats = [
    {
      label: "Revenu mensuel réel",
      value: formatMontant(dashboard.revenuMensuelReel, devise),
      sub: `Potentiel : ${formatMontant(dashboard.revenuMensuelPotentiel, devise)}`,
      icon: Wallet,
    },
    {
      label: "Taux d'occupation",
      value: `${dashboard.tauxOccupation}%`,
      sub: `${dashboard.nbLogementsOccupes} / ${dashboard.nbLogements} logements occupés`,
      icon: ChartPieSlice,
    },
    {
      label: "Immeubles",
      value: String(dashboard.nbImmeubles),
      sub: "biens enregistrés",
      icon: Buildings,
    },
    {
      label: "Logements",
      value: String(dashboard.nbLogements),
      sub: `${dashboard.nbLogements - dashboard.nbLogementsOccupes} vacant(s)`,
      icon: DoorOpen,
    },
  ]

  return (
    <PageTransition className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          Bonjour{nom ? `, ${nom}` : ""}
          <HandWaving size={22} weight="duotone" className="text-accent-500" />
        </h1>
        <p className="text-sm text-neutral-500">
          Voici un aperçu de votre activité locative.
        </p>
      </div>

      {dashboard.nbLogements === 0 ? (
        <div>
          <Card>
            <CardContent className="py-10 text-center space-y-2">
              <p className="text-sm text-neutral-500">
                Aucun logement enregistré pour le moment.
              </p>
              <Link
                href="/immeubles"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Ajouter votre premier bien →
              </Link>
            </CardContent>
          </Card>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map(({ label, value, sub, icon: Icon }) => (
              <div key={label}>
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-neutral-500">
                        {label}
                      </span>
                      <Icon size={18} className="text-primary-500" />
                    </div>
                    <p className="text-xl font-bold text-neutral-900 tabular-nums">
                      {value}
                    </p>
                    <p className="text-xs text-neutral-400">{sub}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {dashboard.contratsExpirants.length > 0 && (
            <div>
              <Card className="border-accent-200 bg-accent-50/40">
                <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                  <WarningCircle size={18} className="text-accent-600" />
                  <CardTitle className="text-sm">
                    Contrats expirant dans les 30 prochains jours
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-2">
                    {dashboard.contratsExpirants.map((c) => (
                      <li key={c.id}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-neutral-700">
                            {c.locataire_nom}
                            {c.logement_nom ? ` — ${c.logement_nom}` : ""}
                          </span>
                          <span className="text-neutral-500">
                            {formatDate(c.date_fin)} ({c.jours_restants} j)
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Paiements récents</CardTitle>
                <CardDescription>Les 5 derniers encaissements</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {dashboard.paiementsRecents.length === 0 ? (
                  <p className="text-sm text-neutral-400 py-4">
                    Aucun paiement enregistré pour le moment.
                  </p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Locataire</TableHead>
                        <TableHead>Logement</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Mode</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                      </TableRow>
                    </TableHeader>
                    <tbody>
                      {dashboard.paiementsRecents.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.locataire_nom}</TableCell>
                          <TableCell>{p.logement_nom ?? "—"}</TableCell>
                          <TableCell>{formatDate(p.date_paiement)}</TableCell>
                          <TableCell className="capitalize">
                            {p.mode.replace("_", " ")}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatMontant(p.montant, devise)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </tbody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </PageTransition>
  )
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <HeaderSkeleton />
          <StatCardsSkeleton count={4} />
          <TableSkeleton count={5} />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
