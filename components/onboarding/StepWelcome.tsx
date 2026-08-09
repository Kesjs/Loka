"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface StepWelcomeProps {
  onNext: () => void;
}

export default function StepWelcome({ onNext }: StepWelcomeProps) {
  const [user, setUser] = useState<{ email?: string; user_metadata?: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (err) {
        console.error("Erreur récupération utilisateur:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-8 text-center">
      {/* Icône succès */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute inset-0 bg-green-100 rounded-full blur-xl" />
          <CheckCircle size={64} weight="fill" className="relative text-green-600" />
        </div>
      </div>

      {/* Titre et sous-titre */}
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-neutral-900">
          Bienvenue chez Loka ! 🎉
        </h1>
        <p className="text-lg text-neutral-600">
          Votre compte a été créé avec succès.
        </p>
      </div>

      {/* Infos utilisateur */}
      {!loading && user && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-neutral-600 mb-1">Connecté en tant que :</p>
          <p className="text-base font-semibold text-neutral-900 truncate">
            {user.email}
          </p>
        </div>
      )}

      {/* Texte de transition */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
        <p className="text-sm text-neutral-700">
          Nous avons besoin de quelques informations pour configurer votre profil et vous proposer une meilleure expérience.
        </p>
      </div>

      {/* Bouton */}
      <Button onClick={onNext} className="w-full h-12 text-base font-medium">
        Commencer la configuration
      </Button>

      {/* Message optionnel */}
      <p className="text-xs text-neutral-500">
        Cette configuration prendra environ 5 minutes
      </p>
    </div>
  );
}
