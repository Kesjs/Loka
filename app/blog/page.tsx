import Link from "next/link";
import { Buildings, ArrowLeft, Newspaper, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";

export default function BlogPage() {
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

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          <Newspaper size={26} weight="duotone" />
        </div>
        <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">Le blog Loka</p>
        <h1 className="mt-3 text-2xl font-black text-white sm:text-3xl">On prépare nos premiers articles.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-400">
          Bientôt ici : des guides pratiques sur la gestion locative au Bénin, l'encaissement Mobile Money et les quittances conformes. Rien n'est publié pour l'instant — on préfère ne rien mettre en ligne plutôt que du contenu bâclé.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400"
          >
            <EnvelopeSimple size={16} weight="bold" />
            Être prévenu à la sortie
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-bold text-slate-300 transition-colors hover:border-slate-600 hover:text-white"
          >
            Retour à l'accueil
          </Link>
        </div>
      </main>
    </div>
  );
}
