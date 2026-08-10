/**
 * Payment Detail Routes
 * GET: Fetch single payment
 * PUT: Update payment
 * DELETE: Delete payment
 */

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { PaymentRepository } from "@/lib/db/repositories/PaymentRepository"
import { DatabaseError } from "@/lib/errors/ApplicationError"
import { apiErrorResponse } from "@/lib/api/errorHandler"

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
      console.error("GET /api/paiements/[id] lookup error:", error)
      return NextResponse.json({ error: "Payment not found" }, { status: 404 })
    }

    // Verify ownership
    if (payment.contrat.proprietaire_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    return NextResponse.json(payment, { status: 200 })
  } catch (error) {
    return apiErrorResponse(error, "Failed to fetch payment")
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
    const { data: payment, error: lookupError } = await supabase
      .from("paiements")
      .select(
        `
        *,
        contrat:contrat_id(proprietaire_id)
      `
      )
      .eq("id", id)
      .single()

    if (lookupError || !payment) {
      if (lookupError) {
        console.error("PUT /api/paiements/[id] lookup error:", lookupError)
      }
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
    return apiErrorResponse(error, "Failed to update payment")
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
    const { data: payment, error: lookupError } = await supabase
      .from("paiements")
      .select(
        `
        *,
        contrat:contrat_id(proprietaire_id)
      `
      )
      .eq("id", id)
      .single()

    if (lookupError || !payment) {
      if (lookupError) {
        console.error("DELETE /api/paiements/[id] lookup error:", lookupError)
      }
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
    return apiErrorResponse(error, "Failed to delete payment")
  }
}
