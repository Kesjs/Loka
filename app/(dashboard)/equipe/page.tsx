import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PageTransition } from "@/components/animations";
import { Plus, UserPlus } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export default function EquipePage() {
  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-neutral-900">Équipe</h1>
          <p className="text-sm text-neutral-600">
            Gérez les membres de votre agence et leurs permissions
          </p>
        </div>
        <Link
          href="/equipe/invite"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={18} weight="bold" />
          Inviter un membre
        </Link>
      </div>

      {/* Section: Membre de l'équipe */}
      <Card>
        <CardHeader>
          <CardTitle>Membres actifs</CardTitle>
          <CardDescription>Liste des collaborateurs de votre agence</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Placeholder pour la liste des membres */}
            <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-neutral-200 border-dashed">
              <UserPlus size={32} className="text-neutral-300 mb-3" />
              <p className="text-sm text-neutral-500 mb-3">Aucun membre pour le moment</p>
              <Link
                href="/equipe/invite"
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                Inviter votre premier collaborateur →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Section: Invitations en attente */}
      <Card>
        <CardHeader>
          <CardTitle>Invitations en attente</CardTitle>
          <CardDescription>Collaborateurs en cours d'invitation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 rounded-lg border border-neutral-200 border-dashed">
            <p className="text-sm text-neutral-500">Aucune invitation en attente</p>
          </div>
        </CardContent>
      </Card>

      {/* Section: Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>Définissez les rôles et permissions de l'équipe</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-neutral-600">
            <p className="mb-3 font-medium">Rôles disponibles :</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-medium text-neutral-900 min-w-24">Admin</span>
                <span className="text-neutral-600">Accès complet à tous les propriétaires et paramètres</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-neutral-900 min-w-24">Gestionnaire</span>
                <span className="text-neutral-600">Gère les propriétaires assignés</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-medium text-neutral-900 min-w-24">Consultant</span>
                <span className="text-neutral-600">Accès en lecture seule aux propriétaires assignés</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
