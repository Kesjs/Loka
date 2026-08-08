import { Gear, Bell, ShieldCheck, CurrencyCircleDollar } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function ParametresPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Card className="border-neutral-200 shadow-sm">
        <CardContent className="py-10 text-center">
          <p className="text-sm text-neutral-500">Connectez-vous pour accéder aux paramètres.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
      <div>
        <p className="text-sm font-medium text-primary-600">Configuration</p>
        <h1 className="text-2xl font-semibold text-neutral-900">Paramètres</h1>
        <p className="mt-1 text-sm text-neutral-500">Adaptez votre espace et vos préférences selon votre façon de gérer le patrimoine.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gear size={18} /> Compte
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-neutral-500">Gérez votre profil, vos coordonnées et les informations de contact.</CardContent>
        </Card>
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={18} /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-neutral-500">Activez ou désactivez les alertes par email pour vos échéances et paiements.</CardContent>
        </Card>
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CurrencyCircleDollar size={18} /> Paiements
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-neutral-500">Définissez vos préférences de facturation et vos modes de paiement.</CardContent>
        </Card>
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck size={18} /> Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-sm text-neutral-500">Renforcez la protection de votre espace d’administration et de vos accès.</CardContent>
        </Card>
      </div>
    </div>
  );
}
