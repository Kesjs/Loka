/**
 * components/dashboard/ContratsTabFilter.tsx
 *
 * Composant client pour les onglets de filtrage des contrats (Actifs, Expirés, Résiliés, Tous)
 * Utilisé par app/(dashboard)/contrats/page.tsx pour C.3 Phase 5
 */

"use client";

import { useState } from "react";
import { Handshake, CurrencyCircleDollar, X } from "@phosphor-icons/react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatMontant, formatDate } from "@/lib/utils";

type ContraStatut = "actif" | "expire" | "resilie" | "tous";

interface ContratsTabFilterProps {
  contratsActifs: any[];
  contratsExpires: any[];
  contratsResilies: any[];
}

export function ContratsTabFilter({
  contratsActifs,
  contratsExpires,
  contratsResilies,
}: ContratsTabFilterProps) {
  const [activeTab, setActiveTab] = useState<ContraStatut>("actif");

  // Déterminer quels contrats afficher selon l'onglet
  let displayedContrats: any[] = [];
  let selectedCount = 0;

  switch (activeTab) {
    case "actif":
      displayedContrats = contratsActifs;
      selectedCount = contratsActifs.length;
      break;
    case "expire":
      displayedContrats = contratsExpires;
      selectedCount = contratsExpires.length;
      break;
    case "resilie":
      displayedContrats = contratsResilies;
      selectedCount = contratsResilies.length;
      break;
    case "tous":
      displayedContrats = [...contratsActifs, ...contratsExpires, ...contratsResilies];
      selectedCount = displayedContrats.length;
      break;
  }

  // Calculer le loyer total pour l'onglet courant
  const loyerTotal = displayedContrats.reduce(
    (sum) => sum + Number(0),
    0
  );

  // Onglets disponibles
  const tabs: Array<{ id: ContraStatut; label: string; count: number }> = [
    { id: "actif", label: "Actifs", count: contratsActifs.length },
    { id: "expire", label: "Expirés", count: contratsExpires.length },
    { id: "resilie", label: "Résiliés", count: contratsResilies.length },
    { id: "tous", label: "Tous", count: contratsActifs.length + contratsExpires.length + contratsResilies.length },
  ];

  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
      {/* Onglets */}
      <div className="border-b border-neutral-200">
        <div className="flex gap-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-neutral-600 hover:text-neutral-900"
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? "bg-primary-100 text-primary-700"
                  : "bg-neutral-100 text-neutral-600"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats pour l'onglet courant */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-primary-50 p-2.5 text-primary-600">
              <Handshake size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">
                {activeTab === "actif" && "Contrats actifs"}
                {activeTab === "expire" && "Contrats expirés"}
                {activeTab === "resilie" && "Contrats résiliés"}
                {activeTab === "tous" && "Total contrats"}
              </p>
              <p className="text-lg font-semibold text-neutral-900">{selectedCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="rounded-2xl bg-accent-50 p-2.5 text-accent-600">
              <CurrencyCircleDollar size={18} />
            </div>
            <div>
              <p className="text-sm text-neutral-500">
                {activeTab === "actif" && "Loyer mensuel actif"}
                {activeTab !== "actif" && "Contrats sélectionnés"}
              </p>
              <p className="text-lg font-semibold text-neutral-900">
                {activeTab === "actif" ? formatMontant(loyerTotal) : selectedCount}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tableau des contrats */}
      {displayedContrats.length === 0 ? (
        <Card className="border-neutral-200 shadow-sm">
          <CardContent className="py-10 text-center">
            <p className="text-sm text-neutral-500">Aucun contrat {activeTab === "tous" ? "" : `${activeTab}e`} pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden border-neutral-200 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Locataire</TableHead>
                <TableHead>Logement</TableHead>
                <TableHead>Date début</TableHead>
                <TableHead>Date fin</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Loyer</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedContrats.map((contrat: any) => (
                <TableRow key={contrat.id} className="transition-colors duration-200 hover:bg-neutral-50">
                  <TableCell>
                    <span className="font-medium text-neutral-900">
                      {contrat.locataire?.nom ?? "—"}
                    </span>
                  </TableCell>
                  <TableCell>{contrat.logement?.nom ?? "—"}</TableCell>
                  <TableCell>{formatDate(contrat.date_debut)}</TableCell>
                  <TableCell>{contrat.date_fin ? formatDate(contrat.date_fin) : "—"}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${
                      contrat.statut === "actif"
                        ? "bg-success-100 text-success-700"
                        : contrat.statut === "expire"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-neutral-100 text-neutral-700"
                    }`}>
                      {contrat.statut === "actif" && "Actif"}
                      {contrat.statut === "expire" && "Expiré"}
                      {contrat.statut === "resilie" && "Résilié"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">{formatMontant(Number(contrat.loyer_mensuel) || 0)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
