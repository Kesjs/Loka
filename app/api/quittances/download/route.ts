/**
 * app/api/quittances/download/route.ts
 * 
 * Route API qui génère et retourne une quittance PDF.
 * Utilisée par:
 * - app/(tenant)/dashboard/page.tsx — bouton "Télécharger la Quittance PDF"
 * - app/(dashboard)/logements — historique des quittances
 * 
 * Implémentation E.5 — Bouton quittance branché avec vraie génération PDF
 */

import { createClient } from "@/lib/supabase/server";
import { NextResponse, NextRequest } from "next/server";
import jsPDF from "jspdf";
import { getLogoUrl } from "@/lib/storage/logos";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { locataireId } = body;

    if (!locataireId) {
      return NextResponse.json(
        { error: "locataireId requis" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Récupérer les données du locataire et du dernier paiement
    const { data: locataire, error: locataireError } = await supabase
      .from("locataires")
      .select("id, nom, email, telephone, contrats(proprietaire_id)")
      .eq("id", locataireId)
      .maybeSingle();

    if (locataireError || !locataire) {
      return NextResponse.json(
        { error: "Locataire non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer le dernier paiement
    const { data: paiements } = await supabase
      .from("paiements")
      .select("id, montant, date_paiement, mode")
      .eq("locataire_id", locataireId)
      .order("date_paiement", { ascending: false })
      .limit(1);

    const lastPayment = paiements?.[0];

    // Récupérer l'organisation du propriétaire pour obtenir le logo
    let logoUrl: string | null = null;
    let organisationName = "Lokka";
    
    try {
      const proprietaireId = locataire.contrats?.[0]?.proprietaire_id;
      if (proprietaireId) {
        const { data: org } = await supabase
          .from("organisations")
          .select("id, nom")
          .eq("created_by", proprietaireId)
          .limit(1)
          .maybeSingle();

        if (org) {
          organisationName = org.nom || "Lokka";
          logoUrl = await getLogoUrl(supabase, org.id);
        }
      }
    } catch (error) {
      console.warn("Erreur récupération logo:", error);
      // Continue sans logo
    }

    // Créer le PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Couleurs marque Lokka
    const primaryColor = [14, 42, 30]; // vert Lokka
    const neutralDark = [23, 23, 23];   // neutral-950
    const neutralLight = [245, 245, 245]; // neutral-50

    let yPosition = 25;

    // En-tête avec logo
    if (logoUrl) {
      try {
        // Récupérer l'image du logo
        const response = await fetch(logoUrl);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const dataUrl = `data:${blob.type};base64,${base64}`;
        
        // Ajouter le logo au PDF (10mm x 10mm)
        doc.addImage(dataUrl, "PNG", 20, yPosition, 15, 15);
        yPosition = 45;
      } catch (error) {
        console.warn("Erreur ajout logo PDF:", error);
        // Continuer sans logo
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(organisationName, 20, yPosition);
        yPosition = 45;
      }
    } else {
      // Pas de logo, afficher le nom en texte
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(organisationName || "Lokka", 20, yPosition);
      yPosition = 45;
    }

    // Ligne séparatrice
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(20, yPosition + 5, 190, yPosition + 5);
    yPosition += 15;

    // Titre document
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
    doc.text("Quittance de Loyer", 20, yPosition);
    yPosition += 20;

    // Infos locataire
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Locataire: ${locataire.nom}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Email: ${locataire.email}`, 20, yPosition);
    yPosition += 8;
    if (locataire.telephone) {
      doc.text(`Téléphone: ${locataire.telephone}`, 20, yPosition);
      yPosition += 8;
    }

    yPosition += 5;

    // Section paiement
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
    doc.text("Détails du Paiement", 20, yPosition);
    yPosition += 10;

    // Boîte de détails
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, yPosition, 170, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
    yPosition += 12;

    if (lastPayment) {
      doc.text(`Montant: ${lastPayment.montant} FCFA`, 30, yPosition);
      yPosition += 10;
      const date = new Date(lastPayment.date_paiement);
      const dateStr = date.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      doc.text(`Date: ${dateStr}`, 30, yPosition);
      yPosition += 10;
      doc.text(`Mode: ${lastPayment.mode || "Non spécifié"}`, 30, yPosition);
      yPosition += 10;
      doc.text(`Référence: ${lastPayment.id}`, 30, yPosition);
    } else {
      doc.text("Aucun paiement enregistré", 30, yPosition);
    }

    // Footer
    yPosition = 270;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "Cette quittance est générée automatiquement par Lokka et a valeur probante de libération de dette.",
      20,
      yPosition
    );

    // Générer le blob PDF
    const pdfBlob = doc.output("blob");

    // Retourner le PDF en téléchargement
    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="quittance-${locataireId}-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Erreur génération PDF quittance:", error);
    return NextResponse.json(
      { error: "Erreur serveur lors de la génération du PDF" },
      { status: 500 }
    );
  }
}

/**
 * GET — Alternative pour télécharger par reference ID
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const refId = searchParams.get("ref");

    if (!refId) {
      return NextResponse.json(
        { error: "ref (reference ID) requis" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Récupérer le paiement par référence
    const { data: paiement, error } = await supabase
      .from("paiements")
      .select("id, montant, date_paiement, mode, locataire_id, proprietaire_id")
      .eq("id", refId)
      .maybeSingle();

    if (error || !paiement) {
      return NextResponse.json(
        { error: "Quittance non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer les infos locataire
    const { data: locataire } = await supabase
      .from("locataires")
      .select("id, nom, email, telephone")
      .eq("id", paiement.locataire_id)
      .maybeSingle();

    // Récupérer l'organisation du propriétaire pour obtenir le logo
    let logoUrl: string | null = null;
    let organisationName = "Lokka";
    
    try {
      if (paiement.proprietaire_id) {
        const { data: org } = await supabase
          .from("organisations")
          .select("id, nom")
          .eq("created_by", paiement.proprietaire_id)
          .limit(1)
          .maybeSingle();

        if (org) {
          organisationName = org.nom || "Lokka";
          logoUrl = await getLogoUrl(supabase, org.id);
        }
      }
    } catch (error) {
      console.warn("Erreur récupération logo:", error);
    }

    // Créer le PDF
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Couleurs marque Lokka
    const primaryColor = [14, 42, 30];
    const neutralDark = [23, 23, 23];

    let yPosition = 25;

    // En-tête avec logo
    if (logoUrl) {
      try {
        const response = await fetch(logoUrl);
        const blob = await response.blob();
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");
        const dataUrl = `data:${blob.type};base64,${base64}`;
        
        doc.addImage(dataUrl, "PNG", 20, yPosition, 15, 15);
        yPosition = 45;
      } catch (error) {
        console.warn("Erreur ajout logo PDF:", error);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(24);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.text(organisationName, 20, yPosition);
        yPosition = 45;
      }
    } else {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(organisationName, 20, yPosition);
      yPosition = 45;
    }

    // Ligne séparatrice
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.line(20, yPosition + 5, 190, yPosition + 5);
    yPosition += 15;

    // Titre
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
    doc.text("Quittance de Loyer", 20, yPosition);
    yPosition += 20;

    // Infos
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    if (locataire) {
      doc.text(`Locataire: ${locataire.nom}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Email: ${locataire.email}`, 20, yPosition);
    }

    yPosition += 15;

    // Section paiement
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
    doc.text("Détails du Paiement", 20, yPosition);
    yPosition += 10;

    doc.setDrawColor(200, 200, 200);
    doc.rect(20, yPosition, 170, 50);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(neutralDark[0], neutralDark[1], neutralDark[2]);
    yPosition += 12;

    doc.text(`Montant: ${paiement.montant} FCFA`, 30, yPosition);
    yPosition += 10;
    const date = new Date(paiement.date_paiement);
    const dateStr = date.toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Date: ${dateStr}`, 30, yPosition);
    yPosition += 10;
    doc.text(`Mode: ${paiement.mode || "Non spécifié"}`, 30, yPosition);
    yPosition += 10;
    doc.text(`Référence: ${paiement.id}`, 30, yPosition);

    // Footer
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "Cette quittance est générée automatiquement par Lokka et a valeur probante de libération de dette.",
      20,
      270
    );

    const pdfBlob = doc.output("blob");

    return new NextResponse(pdfBlob, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="quittance-${refId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Erreur GET quittance PDF:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
