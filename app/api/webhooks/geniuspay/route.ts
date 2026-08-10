import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { createClient } from "@/lib/supabase/server";

const SIGNATURE_HEADER = "x-geniuspay-signature";

function isValidSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.GENIUSPAY_WEBHOOK_SECRET;

  if (!secret || !signature) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = signature.trim().replace(/^sha256=/, "");

  if (provided.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(provided), Buffer.from(expected));
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    if (!isValidSignature(rawBody, request.headers.get(SIGNATURE_HEADER))) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    let payload: unknown;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // GeniusPay Payload Struct : { event: "payment.success", data: { transaction_id, amount, locataire_id, contrat_id, payment_method } }
    const { event, data } = payload as {
      event?: string;
      data?: Record<string, unknown>;
    };

    if (event !== "payment.success" || !data) {
      return NextResponse.json({ status: "ignored" });
    }

    const transactionId = data.transaction_id;
    const contratId = data.contrat_id;
    const amount = data.amount;
    const paymentMethod = data.payment_method;

    if (
      typeof transactionId !== "string" ||
      typeof contratId !== "string" ||
      typeof amount !== "number" ||
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = await createClient();

    // Idempotence : GeniusPay peut rejouer un webhook déjà traité.
    const { data: existing } = await supabase
      .from("paiements")
      .select("id")
      .eq("transaction_id", transactionId)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, transaction_id: transactionId });
    }

    const { error: payErr } = await supabase.from("paiements").insert({
      contrat_id: contratId,
      montant: amount,
      date_paiement: new Date().toISOString(),
      transaction_id: transactionId,
      payment_method:
        typeof paymentMethod === "string" ? paymentMethod : "momo_mtn",
      status: "completed",
    });

    if (payErr) {
      console.error("Erreur insertion paiement Webhook GeniusPay:", payErr);
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }

    return NextResponse.json({ success: true, transaction_id: transactionId });
  } catch (err) {
    console.error("Erreur Webhook GeniusPay:", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
