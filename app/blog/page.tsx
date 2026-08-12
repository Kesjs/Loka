import Link from "next/link";
import { Buildings, ArrowLeft, Newspaper, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";

export default function BlogPage() {
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

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 border border-primary-200 text-primary-600">
          <Newspaper size={26} weight="duotone" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-600">Le blog Lokka</p>
        <h1 className="mt-3 text-2xl font-bold text-neutral-900 sm:text-3xl">On prépare nos premiers articles.</h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-neutral-600">
          Bientôt ici : des guides pratiques sur la gestion locative au Bénin, l'encaissement Mobile Money et les quittances conformes. Rien n'est publié pour l'instant — on préfère ne rien mettre en ligne plutôt que du contenu bâclé.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <EnvelopeSimple size={16} weight="bold" />
            Être prévenu à la sortie
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-400 hover:text-neutral-900 hover:bg-neutral-50"
          >
            Retour à l'accueil
          </Link>
        </div>
      </main>
    </div>
  );
}
