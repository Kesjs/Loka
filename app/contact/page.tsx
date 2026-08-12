"use client";

import { useState } from "react";
import Link from "next/link";
import { Buildings, EnvelopeSimple, Phone, MapPin, ArrowLeft, PaperPlaneRight, CheckCircle, Warning } from "@phosphor-icons/react";
import { createClient } from "@/lib/supabase/client";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    profil: "proprietaire",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Insérer la demande de contact dans Supabase
      const { error: insertError } = await supabase
        .from("demandes_contact")
        .insert({
          nom: formData.nom,
          email: formData.email,
          telephone: formData.telephone || null,
          profil: formData.profil,
          message: formData.message,
        });

      if (insertError) {
        console.error("Erreur insertion:", insertError);
        setError("Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer ou écrivez directement à contact@loka.bj.");
        setLoading(false);
        return;
      }

      // Succès
      setSubmitted(true);
      setFormData({ nom: "", email: "", telephone: "", profil: "proprietaire", message: "" });
    } catch (err) {
      console.error("Erreur:", err);
      setError("Une erreur inattendue s'est produite. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 border border-primary-200 text-primary-600 font-bold">
              <Buildings size={22} weight="duotone" />
            </div>
            <span className="text-lg font-bold text-neutral-900">Lokka</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-neutral-600 hover:text-neutral-900 transition-colors">
            <ArrowLeft size={14} /> Retour à l'accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-3 text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">Support & Assistance</p>
          <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Contactez l'équipe Lokka</h1>
          <p className="text-sm text-neutral-600 max-w-lg mx-auto">
            Une question sur la plateforme, besoin d'une démonstration privée pour votre agence ou assistance technique ?
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-6 text-xs">
            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 space-y-2">
              <div className="flex items-center gap-2 text-primary-600 font-semibold">
                <MapPin size={18} /> Adresse
              </div>
              <p className="text-neutral-700 font-medium">Cotonou, République du Bénin 🇧🇯</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 space-y-2">
              <div className="flex items-center gap-2 text-primary-600 font-semibold">
                <EnvelopeSimple size={18} /> Email
              </div>
              <p className="text-neutral-700 font-medium">contact@loka.bj</p>
            </div>

            <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5 space-y-2">
              <div className="flex items-center gap-2 text-primary-600 font-semibold">
                <Phone size={18} /> WhatsApp Direct
              </div>
              <p className="text-neutral-700 font-medium">+229 01 00 00 00</p>
            </div>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <CheckCircle size={48} className="mx-auto text-emerald-400" weight="fill" />
                <h3 className="text-lg font-bold text-white">Message transmis avec succès</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Un conseiller Lokka vous recontactera par téléphone ou email dans les plus brefs délais.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-700">Nom complet</label>
                  <input
                    type="text"
                    name="nom"
                    required
                    placeholder="Votre nom"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    disabled={loading}
                    className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-neutral-900 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-neutral-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="nom@exemple.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={loading}
                      className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-neutral-900 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-neutral-700">Téléphone (WhatsApp)</label>
                    <input
                      type="tel"
                      name="telephone"
                      placeholder="+229 01..."
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      disabled={loading}
                      className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-neutral-900 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-700">Votre profil</label>
                  <select 
                    name="profil"
                    value={formData.profil}
                    onChange={(e) => setFormData({ ...formData, profil: e.target.value })}
                    disabled={loading}
                    className="h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-neutral-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="proprietaire">Propriétaire individuel</option>
                    <option value="gestionnaire">Gestionnaire mandataire</option>
                    <option value="agence">Agence immobilière</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-700">Message</label>
                  <textarea
                    name="message"
                    rows={4}
                    required
                    placeholder="Expliquez-nous votre besoin..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    disabled={loading}
                    className="w-full rounded-lg border border-neutral-300 bg-white p-3 text-neutral-900 placeholder:text-neutral-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Afficher les erreurs */}
                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-danger-50 border border-danger-200 p-3 text-xs">
                    <Warning size={16} className="text-danger-600 mt-0.5 shrink-0" weight="fill" />
                    <p className="text-danger-700">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 font-semibold text-white shadow-lg shadow-primary-600/20 hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <PaperPlaneRight size={16} weight="bold" />
                  {loading ? "Envoi en cours..." : "Envoyer le message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
