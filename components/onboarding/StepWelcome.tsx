"use client";

import { useEffect, useState } from "react";
import { CheckCircle, User, Phone, EnvelopeSimple } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface StepWelcomeProps {
  value: { nom: string; telephone: string; email: string };
  onChange: (v: { nom: string; telephone: string; email: string }) => void;
  onNext: () => void;
}

export default function StepWelcome({ value, onChange, onNext }: StepWelcomeProps) {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        // Pré-remplir l'email depuis l'utilisateur
        if (user?.email && !value.email) {
          onChange({ ...value, email: user.email });
        }
      } catch (err) {
        console.error("Erreur récupération utilisateur:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isValid = value.nom.trim() !== "" && value.telephone.trim() !== "";

  return (
    <div className="space-y-8">
      {/* Succès de connexion */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-100 rounded-full blur-xl" />
            <CheckCircle size={56} weight="fill" className="relative text-green-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900">
            Bienvenue chez Loka ! 🎉
          </h1>
          <p className="text-sm text-neutral-600">
            Votre compte a été créé avec succès. Complétez vos informations pour commencer.
          </p>
        </div>
      </div>

      {/* Formulaire profil */}
      <div className="space-y-5">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-900">
              <User size={15} />
              Nom complet
              <span className="text-danger-600">*</span>
            </label>
            <input
              type="text"
              value={value.nom}
              onChange={(e) => onChange({ ...value, nom: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValid) {
                  e.preventDefault();
                  onNext();
                }
              }}
              placeholder="Ex : Marie Dossou"
              className="h-10 w-full rounded-md border border-neutral-300 px-3 text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-900">
              <Phone size={15} />
              Téléphone
              <span className="text-danger-600">*</span>
            </label>
            <input
              type="tel"
              value={value.telephone}
              onChange={(e) => onChange({ ...value, telephone: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValid) {
                  e.preventDefault();
                  onNext();
                }
              }}
              placeholder="+229 97 00 00 00"
              className="h-10 w-full rounded-md border border-neutral-300 px-3 text-sm placeholder:text-neutral-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-sm font-medium text-neutral-900">
              <EnvelopeSimple size={15} />
              Email
            </label>
            <input
              type="email"
              value={value.email}
              onChange={(e) => onChange({ ...value, email: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter" && isValid) {
                  e.preventDefault();
                  onNext();
                }
              }}
              placeholder="marie@exemple.com"
              disabled
              className="h-10 w-full rounded-md border border-neutral-300 px-3 text-sm bg-neutral-100 placeholder:text-neutral-400 text-neutral-600 cursor-not-allowed"
            />
          </div>
        </div>

        <p className="text-xs text-neutral-500">
          <span className="text-danger-600">*</span> Champs obligatoires
        </p>

        <Button onClick={onNext} disabled={!isValid} className="w-full h-11">
          Continuer vers l'étape suivante
        </Button>
      </div>
    </div>
  );
}
