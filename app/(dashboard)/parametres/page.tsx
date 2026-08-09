"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Gear, Bell, CurrencyCircleDollar, ShieldCheck, FloppyDisk, Phone, User, EnvelopeSimple, CheckCircle } from "@phosphor-icons/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PhoneInputBenin from "@/components/ui/PhoneInputBenin";
import { isValidPhoneNumber } from "libphonenumber-js";

interface Profil {
  nom: string;
  telephone: string;
  devise: string;
  notif_email: boolean;
  garantie_defaut: boolean;
  montant_garantie_defaut: number | null;
}

export default function ParametresPage() {
  const [profil, setProfil] = useState<Profil | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [email, setEmail] = useState("");
  const [editProfil, setEditProfil] = useState<Profil | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      setEmail(user.email ?? "");

      const { data } = await supabase
        .from("proprietaire")
        .select("nom, telephone, devise, notif_email, garantie_defaut, montant_garantie_defaut")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setProfil(data as Profil);
        setEditProfil(data as Profil);
      }
      setLoading(false);
    })();
  }, []);

  async function handleSave() {
    if (!editProfil) return;
    setSaving(true);
    setSaved(false);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setSaving(false); return; }

    await supabase.from("proprietaire").upsert({
      id: user.id,
      nom: editProfil.nom,
      telephone: editProfil.telephone || null,
      devise: editProfil.devise || "FCFA",
      notif_email: editProfil.notif_email,
      garantie_defaut: editProfil.garantie_defaut,
      montant_garantie_defaut: editProfil.garantie_defaut ? (editProfil.montant_garantie_defaut || null) : null,
    });

    setProfil(editProfil);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const isPhoneValid = editProfil?.telephone
    ? isValidPhoneNumber(editProfil.telephone, "BJ")
    : true; // téléphone optionnel en paramètres

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-neutral-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary-600">Configuration</p>
        <h1 className="text-2xl font-bold text-neutral-900">Paramètres</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Gérez votre profil, vos préférences et la sécurité de votre espace.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Profil */}
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User size={17} className="text-primary-600" weight="fill" />
              Profil
            </CardTitle>
            <CardDescription>Vos informations personnelles et de contact</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Nom complet
              </label>
              <input
                type="text"
                value={editProfil?.nom ?? ""}
                onChange={(e) => setEditProfil((p) => p ? { ...p, nom: e.target.value } : p)}
                className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Votre nom"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Email
              </label>
              <div className="flex h-10 items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500">
                <EnvelopeSimple size={15} />
                <span>{email}</span>
                <span className="ml-auto text-xs text-neutral-400">Non modifiable</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Téléphone
              </label>
              <PhoneInputBenin
                value={editProfil?.telephone ?? ""}
                onChange={(normalized) =>
                  setEditProfil((p) => p ? { ...p, telephone: normalized } : p)
                }
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Devise
              </label>
              <select
                value={editProfil?.devise ?? "FCFA"}
                onChange={(e) => setEditProfil((p) => p ? { ...p, devise: e.target.value } : p)}
                className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="FCFA">FCFA (Franc CFA)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="USD">USD (Dollar)</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bell size={17} className="text-primary-600" weight="fill" />
              Notifications
            </CardTitle>
            <CardDescription>Alertes et rappels automatiques</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-4 hover:bg-neutral-50 transition-colors">
              <input
                type="checkbox"
                checked={editProfil?.notif_email ?? false}
                onChange={(e) => setEditProfil((p) => p ? { ...p, notif_email: e.target.checked } : p)}
                className="mt-0.5 h-4 w-4 accent-primary-600 rounded"
              />
              <div>
                <p className="text-sm font-medium text-neutral-900">Notifications par email</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Recevez les rappels d'échéances, impayés et expirations de contrat par email.
                </p>
              </div>
            </label>
          </CardContent>
        </Card>

        {/* Paiements */}
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CurrencyCircleDollar size={17} className="text-primary-600" weight="fill" />
              Paiements
            </CardTitle>
            <CardDescription>Garantie locative par défaut</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200 p-4 hover:bg-neutral-50 transition-colors">
              <input
                type="checkbox"
                checked={editProfil?.garantie_defaut ?? false}
                onChange={(e) => setEditProfil((p) => p ? { ...p, garantie_defaut: e.target.checked } : p)}
                className="mt-0.5 h-4 w-4 accent-primary-600 rounded"
              />
              <div>
                <p className="text-sm font-medium text-neutral-900">Dépôt de garantie par défaut</p>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Activer le dépôt de garantie par défaut pour les nouveaux contrats.
                </p>
              </div>
            </label>

            {editProfil?.garantie_defaut && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Montant par défaut ({editProfil?.devise ?? "FCFA"})
                </label>
                <input
                  type="number"
                  min={0}
                  value={editProfil?.montant_garantie_defaut ?? ""}
                  onChange={(e) =>
                    setEditProfil((p) => p ? { ...p, montant_garantie_defaut: parseFloat(e.target.value) || 0 } : p)
                  }
                  className="h-10 w-full rounded-lg border border-neutral-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex : 50000"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card className="border-neutral-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck size={17} className="text-primary-600" weight="fill" />
              Sécurité
            </CardTitle>
            <CardDescription>Gestion du mot de passe et accès</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <p className="text-sm text-neutral-600">
                Utilisez la connexion Supabase Auth. Pour changer de mot de passe, utilisez la fonction "Mot de passe oublié" depuis la page de connexion.
              </p>
              <div className="flex items-center gap-2 rounded-xl bg-success-50 border border-success-200 px-4 py-3">
                <ShieldCheck size={16} className="text-success-600 shrink-0" weight="fill" />
                <p className="text-xs font-medium text-success-700">Compte sécurisé et chiffré</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bouton sauvegarder */}
      <div className="flex items-center justify-end gap-3 border-t border-neutral-200 pt-4">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-success-600">
            <CheckCircle size={16} weight="fill" />
            Enregistré
          </span>
        )}
        <Button
          onClick={handleSave}
          disabled={saving || !isPhoneValid}
          className="gap-2"
        >
          <FloppyDisk size={16} weight="bold" />
          {saving ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </div>
  );
}
