"use client";

import { useState } from "react";
import Link from "next/link";
import { Buildings, EnvelopeSimple, Phone, MapPin, ArrowLeft, PaperPlaneRight, CheckCircle } from "@phosphor-icons/react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              <Buildings size={22} weight="duotone" />
            </div>
            <span className="text-lg font-black text-white">Loka</span>
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft size={14} /> Retour à l'accueil
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-3 text-center mb-10">
          <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Support & Assistance</p>
          <h1 className="text-3xl font-black text-white sm:text-4xl">Contactez l'équipe Loka</h1>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Une question sur la plateforme, besoin d'une démonstration privée pour votre agence ou assistance technique ?
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="space-y-6 text-xs">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <MapPin size={18} /> Adresse
              </div>
              <p className="text-slate-300 font-medium">Cotonou, République du Bénin 🇧🇯</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <EnvelopeSimple size={18} /> Email
              </div>
              <p className="text-slate-300 font-medium">contact@loka.bj</p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <Phone size={18} /> WhatsApp Direct
              </div>
              <p className="text-slate-300 font-medium">+229 01 00 00 00</p>
            </div>
          </div>

          <div className="md:col-span-2 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <CheckCircle size={48} className="mx-auto text-emerald-400" weight="fill" />
                <h3 className="text-lg font-bold text-white">Message transmis avec succès</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Un conseiller Loka vous recontactera par téléphone ou email dans les plus brefs délais.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Nom complet</label>
                  <input
                    type="text"
                    required
                    placeholder="Votre nom"
                    className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="nom@exemple.com"
                      className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-300">Téléphone (WhatsApp)</label>
                    <input
                      type="tel"
                      required
                      placeholder="+229 01..."
                      className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Votre profil</label>
                  <select className="h-10 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 text-white focus:border-emerald-500 focus:outline-none">
                    <option>Propriétaire individuel</option>
                    <option>Gestionnaire mandataire</option>
                    <option>Agence immobilière</option>
                    <option>Autre</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">Message</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Expliquez-nous votre besoin..."
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 p-3 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all"
                >
                  <PaperPlaneRight size={16} weight="bold" />
                  Envoyer le message
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
