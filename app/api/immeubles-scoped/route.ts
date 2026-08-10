/**
 * app/api/immeubles-scoped/route.ts
 * 
 * Route API qui retourne les immeubles scoped pour l'utilisateur courant.
 * Utilisée par app/(dashboard)/logements/page.tsx pour le filtre de sélection d'immeuble.
 * 
 * Résout le problème de C.3 Phase 4 : exposer les noms d'immeubles d'autres utilisateurs
 * dans le dropdown sans scope explicite.
 */

import { createClient } from "@/lib/supabase/server";
import { getOrganisationScope } from "@/lib/organisation-scope";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Récupérer le scope d'organisation (source unique de vérité)
    const scope = await getOrganisationScope(supabase);
    
    // Récupérer les immeubles filtrés par le scope
    const { data: immeubles, error } = await supabase
      .from("immeubles")
      .select("id, nom")
      .in("proprietaire_id", scope.proprietaireIds)
      .order("nom", { ascending: true });

    if (error) {
      console.error("Erreur récupération immeubles scoped:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ immeubles: immeubles || [] });
  } catch (err) {
    console.error("Erreur API immeubles-scoped:", err);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
