"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getOrganisationScope } from "@/lib/organisation-scope";

export default function NewProprietairePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    email: "",
  });

  const validatePhone = (phone: string): boolean => {
    // Validation ARCEP Bénin : 10 chiffres commençant par 01
    const cleaned = phone.replace(/\s+/g, "");
    return /^01\d{8}$/.test(cleaned);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validation
      if (!formData.nom.trim()) {
        setError("Le nom est requis");
        setLoading(false);
        return;
      }

      if (!formData.telephone.trim()) {
        setError("Le téléphone est requis");
        setLoading(false);
        return;
      }

      if (!validatePhone(formData.telephone)) {
        setError("Numéro invalide : doit contenir 10 chiffres et commencer par 01");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Vous devez être connecté");
        setLoading(false);
        return;
      }

      // Récupérer l'organisation
      const orgScope = await getOrganisationScope(supabase);

      // Créer le propriétaire géré
      const { data, error: insertError } = await supabase
        .from("proprietaires_geres")
        .insert({
          organisation_id: orgScope.organisationId,
          nom: formData.nom.trim(),
          telephone: formData.telephone.trim(),
          email: formData.email.trim() || null,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Erreur création propriétaire:", insertError);
        setError("Erreur lors de la création du propriétaire");
        setLoading(false);
        return;
      }

      // Rediriger vers la liste
      router.push("/proprietaires");
      router.refresh();
    } catch (err) {
      console.error("Erreur:", err);
      setError("Une erreur est survenue");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center gap-4">
        <Link
          href="/proprietaires"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 text-neutral-600 transition-colors hover:bg-neutral-50"
        >
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Nouveau propriétaire</h1>
          <p className="mt-1 text-sm text-neutral-500">Ajouter un propriétaire à votre portefeuille</p>
        </div>
      </div>

      <Card className="border-neutral-200 shadow-sm">
        <CardHeader>
          <CardTitle>Informations du propriétaire</CardTitle>
          <CardDescription>Les informations de base pour identifier le propriétaire</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-danger-50 border border-danger-200 p-3">
                <p className="text-sm text-danger-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="nom" className="text-sm font-medium text-neutral-700">
                Nom complet <span className="text-danger-500">*</span>
              </label>
              <Input
                id="nom"
                type="text"
                placeholder="Ex: Jean Kouadio"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="telephone" className="text-sm font-medium text-neutral-700">
                Téléphone <span className="text-danger-500">*</span>
              </label>
              <Input
                id="telephone"
                type="tel"
                placeholder="Ex: 01 23 45 67 89"
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                required
                disabled={loading}
              />
              <p className="text-xs text-neutral-500">Format : 10 chiffres commençant par 01</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-neutral-700">Email (facultatif)</label>
              <Input
                id="email"
                type="email"
                placeholder="Ex: jean.kouadio@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Création..." : "Créer le propriétaire"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
