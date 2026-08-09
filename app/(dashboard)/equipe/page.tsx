import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrganisationScope } from "@/lib/organisation-scope";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageTransition } from "@/components/animations";
import { Plus, UserPlus, UsersThree, ShieldCheck, Eye } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default async function EquipePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/auth");

  // Garde rôle : seule une agence peut voir cette page
  const orgScope = await getOrganisationScope(supabase);
  if (orgScope.organisationType !== "agence") {
    redirect("/home");
  }

  // Charger les vrais membres de l'organisation
  const { data: membres } = orgScope.organisationId
    ? await supabase
        .from("membres_organisation")
        .select("id, user_id, role_interne, created_at")
        .eq("organisation_id", orgScope.organisationId)
        .order("created_at", { ascending: true })
    : { data: [] };

  // Charger les infos de chaque membre (nom depuis table proprietaire)
  const membresAvecNom = await Promise.all(
    (membres ?? []).map(async (m) => {
      if (!m.user_id) return { ...m, nom: "Membre inconnu", email: null };
      const { data: prop } = await supabase
        .from("proprietaire")
        .select("nom")
        .eq("id", m.user_id)
        .maybeSingle();
      const { data: authUser } = await supabase.auth.admin
        .getUserById(m.user_id)
        .catch(() => ({ data: null }));
      return {
        ...m,
        nom: prop?.nom || "Membre",
        email: (authUser as any)?.user?.email || null,
      };
    })
  );

  const roleLabel: Record<string, string> = {
    admin: "Admin",
    gestionnaire: "Gestionnaire",
    mandataire: "Mandataire",
    consultant: "Consultant",
    autre: "Autre",
  };

  const roleIcon: Record<string, string> = {
    admin: "bg-primary-100 text-primary-700",
    gestionnaire: "bg-amber-100 text-amber-700",
    mandataire: "bg-blue-100 text-blue-700",
    consultant: "bg-neutral-100 text-neutral-600",
    autre: "bg-neutral-100 text-neutral-600",
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-primary-600">Organisation</p>
          <h1 className="text-2xl font-bold text-neutral-900">Équipe</h1>
          <p className="text-sm text-neutral-500">
            Gérez les membres de votre agence et leurs permissions
          </p>
        </div>
        <Link
          href="/equipe/invite"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors text-sm"
        >
          <Plus size={16} weight="bold" />
          Inviter un membre
        </Link>
      </div>

      {/* Membres actifs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UsersThree size={18} className="text-primary-600" weight="fill" />
              Membres actifs
            </CardTitle>
            <CardDescription>
              {membresAvecNom.length === 0
                ? "Aucun collaborateur pour le moment"
                : `${membresAvecNom.length} collaborateur${membresAvecNom.length > 1 ? "s" : ""}`}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {membresAvecNom.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-neutral-200 border-dashed">
              <UserPlus size={32} className="text-neutral-300 mb-3" />
              <p className="text-sm text-neutral-500 mb-3">Aucun membre pour le moment</p>
              <Link
                href="/equipe/invite"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Inviter votre premier collaborateur →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {membresAvecNom.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-600">
                      {(m.nom || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{m.nom}</p>
                      {m.email && (
                        <p className="text-xs text-neutral-500">{m.email}</p>
                      )}
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleIcon[m.role_interne] ?? roleIcon.autre}`}>
                    {roleLabel[m.role_interne] ?? m.role_interne}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rôles disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-primary-600" weight="fill" />
            Permissions par rôle
          </CardTitle>
          <CardDescription>
            Définissez les accès selon les responsabilités de chacun
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { role: "Admin", color: "bg-primary-100 text-primary-700", desc: "Accès complet : propriétaires, paiements, équipe, paramètres" },
              { role: "Gestionnaire", color: "bg-amber-100 text-amber-700", desc: "Gère les propriétaires assignés, accès aux paiements et contrats" },
              { role: "Mandataire", color: "bg-blue-100 text-blue-700", desc: "Mandataire de propriétaires spécifiques, accès limité" },
              { role: "Consultant", color: "bg-neutral-100 text-neutral-600 border border-neutral-200", desc: "Accès en lecture seule aux données assignées" },
            ].map(({ role, color, desc }) => (
              <div key={role} className="flex items-start gap-3 p-3 rounded-lg border border-neutral-100">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 ${color}`}>
                  {role}
                </span>
                <p className="text-sm text-neutral-600">{desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
