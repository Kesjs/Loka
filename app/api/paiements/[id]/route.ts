/**
 * Payment Detail Routes
 * GET: Fetch single payment
 * PUT: Update payment
 * DELETE: Delete payment
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PaymentRepository } from "@/lib/db/repositories/PaymentRepository"
import { ValidationError, DatabaseError } from "@/lib/errors/ApplicationError"

/**
 * GET /api/paiements/[id]
 * Fetch single payment
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const paymentRepo = new PaymentRepository()

    // Get payment
    const { data: payment, error } = await supabase
      .from("paiements")
      .select(
        `
        *,
        contrat:contrat_id(proprietaire_id)
      `
      )
      .eq("id", id)
      .single()

    if (error) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Verify ownership
    if (payment.contrat.proprietaire_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(payment, { status: 200 })
  } catch (error) {
    console.error("GET /api/paiements/[id] error:", error)
    return NextResponse.json(
      { error: "Failed to fetch payment" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/paiements/[id]
 * Update payment
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership first
    const { data: payment } = await supabase
      .from("paiements")
      .select(
        `
        *,
        contrat:contrat_id(proprietaire_id)
      `
      )
      .eq("id", id)
      .single()

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment.contrat.proprietaire_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Parse update data
    const body = await request.json()

    // Update payment
    const { data: updated, error } = await supabase
      .from("paiements")
      .update(body)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      throw new DatabaseError(error.message)
    }

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("PUT /api/paiements/[id] error:", error)

    if (error instanceof DatabaseError) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { error: "Failed to update payment" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/paiements/[id]
 * Delete payment
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify ownership
    const { data: payment } = await supabase
      .from("paiements")
      .select(
        `
        *,
        contrat:contrat_id(proprietaire_id)
      `
      )
      .eq("id", id)
      .single()

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    if (payment.contrat.proprietaire_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Delete payment
    const { error } = await supabase
      .from("paiements")
      .delete()
      .eq("id", id)

    if (error) {
      throw new DatabaseError(error.message)
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("DELETE /api/paiements/[id] error:", error)

    if (error instanceof DatabaseError) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(
      { error: "Failed to delete payment" },
      { status: 500 }
    )
  }
}
