import Link from "next/link";
import { Buildings, ArrowLeft, ShieldCheck, Sparkle, UsersThree } from "@phosphor-icons/react/dist/ssr";

export default function AProposPage() {
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

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 text-xs leading-relaxed text-slate-300">
        <div className="space-y-2">
          <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Notre Mission</p>
          <h1 className="text-2xl font-black text-white sm:text-3xl">La technologie au service de l'immobilier au Bénin</h1>
        </div>

        <div className="space-y-4">
          <p>
            Loka a été conçue avec une conviction simple : la gestion d'un patrimoine locatif ne devrait plus reposer sur des cahiers manuscrits, des reçus volants ou des relances téléphoniques fastidieuses.
          </p>

          <p>
            En combinant l'automatisation administrative et les moyens de paiement locaux (MTN Mobile Money, Moov Money), Loka offre une plateforme neutre, sécurisée et moderne à tous les acteurs du secteur : propriétaires individuels, gestionnaires de biens et agences immobilières.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-center">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-1">
            <ShieldCheck size={20} className="mx-auto text-emerald-400" />
            <p className="font-bold text-white text-sm">Securisé</p>
            <p className="text-[11px] text-slate-400">Données chiffrées</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-1">
            <Sparkle size={20} className="mx-auto text-amber-400" />
            <p className="font-bold text-white text-sm">Mobile Money</p>
            <p className="text-[11px] text-slate-400">MTN & Moov</p>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 space-y-1">
            <UsersThree size={20} className="mx-auto text-blue-400" />
            <p className="font-bold text-white text-sm">100% Bénin</p>
            <p className="text-[11px] text-slate-400">ARCEP & Code Foncier</p>
          </div>
        </div>
      </main>
    </div>
  );
}
