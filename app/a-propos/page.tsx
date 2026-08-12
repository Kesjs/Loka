import Link from "next/link";
import { Buildings, ArrowLeft, ShieldCheck, Sparkle, UsersThree } from "@phosphor-icons/react/dist/ssr";

export default function AProposPage() {
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

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 text-sm leading-relaxed text-neutral-700">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">Notre Mission</p>
          <h1 className="text-2xl font-bold text-neutral-900 sm:text-3xl">La technologie au service de l'immobilier au Bénin</h1>
        </div>

        <div className="space-y-4">
          <p>
            Lokka a été conçue avec une conviction simple : la gestion d'un patrimoine locatif ne devrait plus reposer sur des cahiers manuscrits, des reçus volants ou des relances téléphoniques fastidieuses.
          </p>

          <p>
            En combinant l'automatisation administrative et les moyens de paiement locaux (MTN Mobile Money, Moov Money), Lokka offre une plateforme neutre, sécurisée et moderne à tous les acteurs du secteur : propriétaires individuels, gestionnaires de biens et agences immobilières.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-neutral-200 text-center">
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-1">
            <ShieldCheck size={20} className="mx-auto text-primary-600" />
            <p className="font-semibold text-neutral-900 text-sm">Sécurisé</p>
            <p className="text-[11px] text-neutral-600">Données chiffrées</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-1">
            <Sparkle size={20} className="mx-auto text-accent-600" />
            <p className="font-semibold text-neutral-900 text-sm">Mobile Money</p>
            <p className="text-[11px] text-neutral-600">MTN & Moov</p>
          </div>
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-1">
            <UsersThree size={20} className="mx-auto text-neutral-600" />
            <p className="font-semibold text-neutral-900 text-sm">100% Bénin</p>
            <p className="text-[11px] text-neutral-600">ARCEP & Code Foncier</p>
          </div>
        </div>
      </main>
    </div>
  );
}
