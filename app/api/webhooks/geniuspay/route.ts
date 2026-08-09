import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // GeniusPay Payload Struct : { event: "payment.success", data: { transaction_id, amount, locataire_id, contrat_id, payment_method } }
    const { event, data } = payload;

    if (event !== "payment.success" || !data) {
      return NextResponse.json({ status: "ignored" });
    }

    const { transaction_id, amount, locataire_id, contrat_id, payment_method } = data;

    const supabase = await createClient();

    // 1. Inscrire le paiement dans la table paiements
    const { error: payErr } = await supabase.from("paiements").insert({
      contrat_id,
      montant: amount,
      date_paiement: new Date().toISOString(),
      transaction_id,
      payment_method: payment_method || "momo_mtn",
      status: "completed",
    });

    if (payErr) {
      console.error("Erreur insertion paiement Webhook GeniusPay:", payErr);
      return NextResponse.json({ error: payErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, transaction_id });
  } catch (err) {
    console.error("Erreur Webhook GeniusPay:", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
