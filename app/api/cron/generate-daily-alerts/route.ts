/**
 * POST /api/cron/generate-daily-alerts
 * Cron job endpoint for daily alert generation
 * Called by Vercel Cron or external scheduler
 * 
 * Authorization: Bearer token check
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { AlertService } from '@/lib/services/AlertService'
import { AlertRepository } from '@/lib/db/repositories/AlertRepository'
import { ContractRepository } from '@/lib/db/repositories/ContractRepository'
import { PaymentRepository } from '@/lib/db/repositories/PaymentRepository'
import { sendDigestEmail } from '@/lib/services/EmailService'
import { handleApiError } from '@/lib/errors/ApplicationError'

/**
 * Generate daily alerts for all users
 * Should be called once per day via cron job
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()

    // Get all proprietaires (users)
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()

    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`)
    }

    if (!users || users.data.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users to process',
        processed: 0,
      })
    }

    let processedCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Process each proprietaire
    for (const user of users.data) {
      try {
        const userId = user.id
        const userEmail = user.email || 'unknown'
        const userName = user.user_metadata?.nom || 'Utilisateur'

        // Initialize services
        const alertService = new AlertService(
          new AlertRepository(),
          new ContractRepository(),
          new PaymentRepository()
        )

        // Generate alerts
        await alertService.generateDailyAlerts(userId)

        // Get alerts for this user
        const allAlerts = await alertService.getAllAlerts(userId)
        const criticalCount = await alertService.getCriticalCount(userId)

        // Send digest email if there are alerts
        if (allAlerts.length > 0) {
          const digestData = {
            proprietaireName: userName,
            proprietaireEmail: userEmail,
            alertCount: allAlerts.length,
            criticalCount,
            alerts: allAlerts.map((alert) => ({
              proprietaireName: userName,
              proprietaireEmail: userEmail,
              alertType: alert.type as 'missing_payment' | 'expiring_contract' | 'deposit_to_return',
              severity: alert.severity as 'high' | 'medium' | 'low',
              message: alert.message,
              details: {
                tenantName: undefined,
                propertyName: undefined,
              },
            })),
          }

          await sendDigestEmail(digestData)
        }

        processedCount++
      } catch (error) {
        errorCount++
        const errorMsg = error instanceof Error ? error.message : String(error)
        errors.push(`User ${user.id}: ${errorMsg}`)
        console.error(`Error processing user ${user.id}:`, error)
      }
    }

    console.log(
      `Daily alert generation completed. Processed: ${processedCount}, Errors: ${errorCount}`
    )

    return NextResponse.json({
      success: true,
      message: 'Daily alerts generated successfully',
      processed: processedCount,
      errors: errorCount,
      errorDetails: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Cron job error:', error)
    const errorResponse = handleApiError(error)
    return NextResponse.json(errorResponse, { status: errorResponse.statusCode })
  }
}

/**
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/cron/generate-daily-alerts',
    method: 'POST',
    description: 'Daily alert generation cron job',
    auth: 'Bearer token required (CRON_SECRET)',
  })
}
