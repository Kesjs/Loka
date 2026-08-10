/**
 * EmailService
 * Handles all email notifications using Brevo API
 * French localization for property management alerts
 */

export interface AlertEmailData {
  proprietaireName: string
  proprietaireEmail: string
  alertType: 'missing_payment' | 'expiring_contract' | 'deposit_to_return'
  severity: 'high' | 'medium' | 'low'
  message: string
  details?: {
    tenantName?: string
    propertyName?: string
    daysOverdue?: number
    daysUntilExpiry?: number
    amount?: number
  }
}

export interface DigestEmailData {
  proprietaireName: string
  proprietaireEmail: string
  alertCount: number
  criticalCount: number
  alerts: AlertEmailData[]
}

const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_API_URL = 'https://api.brevo.com/v3'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const SENDER_EMAIL = process.env.BREVO_SENDER_EMAIL || 'noreply@loka.app'
const SENDER_NAME = 'Loka'

/**
 * Get severity badge color
 */
function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'high':
      return '#DC2626' // red-600
    case 'medium':
      return '#EAB308' // yellow-500
    case 'low':
      return '#0EA5E9' // cyan-500
    default:
      return '#64748B' // slate-500
  }
}

/**
 * Get severity label in French
 */
function getSeverityLabel(severity: string): string {
  switch (severity) {
    case 'high':
      return '🔴 Critique'
    case 'medium':
      return '🟡 Moyen'
    case 'low':
      return '🔵 Bas'
    default:
      return 'Info'
  }
}

/**
 * Get alert type label in French
 */
function getAlertTypeLabel(type: string): string {
  switch (type) {
    case 'missing_payment':
      return '💰 Paiement Manquant'
    case 'expiring_contract':
      return '📋 Contrat Expirant'
    case 'deposit_to_return':
      return '🏦 Dépôt à Restituer'
    default:
      return 'Alerte'
  }
}

/**
 * Send alert email via Brevo
 */
export async function sendAlertEmail(data: AlertEmailData): Promise<void> {
  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY not configured')
    return
  }

  const htmlContent = generateAlertEmailHTML(data)

  const payload = {
    sender: {
      name: SENDER_NAME,
      email: SENDER_EMAIL,
    },
    to: [
      {
        email: data.proprietaireEmail,
        name: data.proprietaireName,
      },
    ],
    subject: `[${getSeverityLabel(data.severity)}] ${getAlertTypeLabel(data.alertType)}`,
    htmlContent,
    tags: [data.alertType, data.severity],
  }

  try {
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Brevo API error:', error)
      throw new Error(`Failed to send alert email: ${error}`)
    }

    console.log(`Alert email sent to ${data.proprietaireEmail}`)
  } catch (error) {
    console.error('Error sending alert email:', error)
    throw error
  }
}

/**
 * Send daily digest email via Brevo
 */
export async function sendDigestEmail(data: DigestEmailData): Promise<void> {
  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY not configured')
    return
  }

  const htmlContent = generateDigestEmailHTML(data)

  const payload = {
    sender: {
      name: SENDER_NAME,
      email: SENDER_EMAIL,
    },
    to: [
      {
        email: data.proprietaireEmail,
        name: data.proprietaireName,
      },
    ],
    subject: `📊 Résumé quotidien - ${data.criticalCount} alerte${data.criticalCount !== 1 ? 's' : ''} critique${data.criticalCount !== 1 ? 's' : ''}`,
    htmlContent,
    tags: ['digest', 'daily'],
  }

  try {
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Brevo API error:', error)
      throw new Error(`Failed to send digest email: ${error}`)
    }

    console.log(`Digest email sent to ${data.proprietaireEmail}`)
  } catch (error) {
    console.error('Error sending digest email:', error)
    throw error
  }
}

/**
 * Generate alert email HTML
 */
function generateAlertEmailHTML(data: AlertEmailData): string {
  const severityColor = getSeverityColor(data.severity)
  const severityLabel = getSeverityLabel(data.severity)
  const typeLabel = getAlertTypeLabel(data.alertType)

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1f2937; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .alert-badge { display: inline-block; padding: 8px 12px; background: ${severityColor}; color: white; border-radius: 6px; font-weight: bold; margin: 10px 0; }
        .alert-message { background: white; padding: 15px; border-left: 4px solid ${severityColor}; border-radius: 4px; margin: 15px 0; }
        .details { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .details p { margin: 8px 0; }
        .cta-button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Loka</h1>
          <p>Alerte Importante</p>
        </div>
        <div class="content">
          <h2>Bonjour ${data.proprietaireName},</h2>
          
          <div class="alert-badge">${severityLabel} - ${typeLabel}</div>
          
          <div class="alert-message">
            <strong>${data.message}</strong>
          </div>
          
          ${
            data.details
              ? `
            <div class="details">
              <h3>Détails:</h3>
              ${data.details.tenantName ? `<p><strong>Locataire:</strong> ${data.details.tenantName}</p>` : ''}
              ${data.details.propertyName ? `<p><strong>Bien:</strong> ${data.details.propertyName}</p>` : ''}
              ${data.details.amount ? `<p><strong>Montant:</strong> ${data.details.amount.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</p>` : ''}
              ${data.details.daysOverdue ? `<p><strong>Jours de retard:</strong> ${data.details.daysOverdue}</p>` : ''}
              ${data.details.daysUntilExpiry ? `<p><strong>Jours avant expiration:</strong> ${data.details.daysUntilExpiry}</p>` : ''}
            </div>
            `
              : ''
          }
          
          <center>
            <a href="${APP_URL}/notifications" class="cta-button">Voir les alertes</a>
          </center>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Cette alerte a été générée automatiquement par votre tableau de bord de gestion immobilière.
            <br>
            <a href="${APP_URL}/notifications" style="color: #1e40af; text-decoration: none;">Gérez vos alertes</a>
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Loka. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Generate digest email HTML
 */
function generateDigestEmailHTML(data: DigestEmailData): string {
  const criticalAlerts = data.alerts.filter((a) => a.severity === 'high')
  const mediumAlerts = data.alerts.filter((a) => a.severity === 'medium')
  const lowAlerts = data.alerts.filter((a) => a.severity === 'low')

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1f2937; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 20px; }
        .alert-section { margin: 20px 0; }
        .alert-section-title { font-weight: bold; padding: 10px; border-radius: 4px; margin-bottom: 10px; }
        .alert-section-title.high { background: #fee2e2; color: #7f1d1d; }
        .alert-section-title.medium { background: #fef3c7; color: #78350f; }
        .alert-section-title.low { background: #cffafe; color: #082f49; }
        .alert-item { background: white; padding: 12px; margin: 8px 0; border-left: 4px solid; border-radius: 4px; }
        .alert-item.high { border-color: #dc2626; }
        .alert-item.medium { border-color: #eab308; }
        .alert-item.low { border-color: #0ea5e9; }
        .cta-button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; border-top: 1px solid #e5e7eb; }
        .stats { background: white; padding: 15px; border-radius: 4px; text-align: center; margin: 15px 0; }
        .stat-item { display: inline-block; margin: 0 15px; }
        .stat-number { font-size: 24px; font-weight: bold; color: #1e40af; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Loka</h1>
          <p>📊 Résumé Quotidien des Alertes</p>
        </div>
        <div class="content">
          <h2>Bonjour ${data.proprietaireName},</h2>
          
          <div class="stats">
            <div class="stat-item">
              <div class="stat-number">${data.alertCount}</div>
              <div>Alerte${data.alertCount !== 1 ? 's' : ''} totale${data.alertCount !== 1 ? 's' : ''}</div>
            </div>
            <div class="stat-item">
              <div class="stat-number" style="color: #dc2626;">${data.criticalCount}</div>
              <div>Critique${data.criticalCount !== 1 ? 's' : ''}</div>
            </div>
          </div>
          
          ${
            criticalAlerts.length > 0
              ? `
            <div class="alert-section">
              <div class="alert-section-title high">🔴 Alertes Critiques (${criticalAlerts.length})</div>
              ${criticalAlerts.map((alert) => `<div class="alert-item high"><strong>${getAlertTypeLabel(alert.alertType)}</strong><br>${alert.message}</div>`).join('')}
            </div>
            `
              : ''
          }
          
          ${
            mediumAlerts.length > 0
              ? `
            <div class="alert-section">
              <div class="alert-section-title medium">🟡 Alertes Moyennes (${mediumAlerts.length})</div>
              ${mediumAlerts.map((alert) => `<div class="alert-item medium"><strong>${getAlertTypeLabel(alert.alertType)}</strong><br>${alert.message}</div>`).join('')}
            </div>
            `
              : ''
          }
          
          ${
            lowAlerts.length > 0
              ? `
            <div class="alert-section">
              <div class="alert-section-title low">🔵 Alertes Basses (${lowAlerts.length})</div>
              ${lowAlerts.map((alert) => `<div class="alert-item low"><strong>${getAlertTypeLabel(alert.alertType)}</strong><br>${alert.message}</div>`).join('')}
            </div>
            `
              : ''
          }
          
          <center>
            <a href="${APP_URL}/notifications" class="cta-button">Voir toutes les alertes</a>
          </center>
        </div>
        <div class="footer">
          <p>&copy; 2026 Loka. Tous droits réservés.</p>
          <p><a href="${APP_URL}/parametres" style="color: #1e40af; text-decoration: none;">Gérer mes préférences</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}

/**
 * Contract Email Functions
 */

export interface ContractEmailData {
  proprietaireName: string
  proprietaireEmail: string
  tenantName: string
  propertyName: string
  eventType: 'created' | 'renewed' | 'terminated'
  contractDetails?: {
    rentAmount?: number
    guaranteeAmount?: number
    startDate?: string
    endDate?: string
  }
  guaranteeDetails?: {
    originalAmount: number
    deductions: number
    returnAmount: number
  }
}

/**
 * Send contract event email via Brevo
 */
export async function sendContractEmail(
  data: ContractEmailData
): Promise<void> {
  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY not configured')
    return
  }

  const htmlContent = generateContractEmailHTML(data)

  const subjectMap = {
    created: `✅ Nouveau contrat créé - ${data.tenantName}`,
    renewed: `🔄 Contrat renouvelé - ${data.tenantName}`,
    terminated: `⏹️ Contrat résilié - ${data.tenantName}`,
  }

  const payload = {
    sender: {
      name: SENDER_NAME,
      email: SENDER_EMAIL,
    },
    to: [
      {
        email: data.proprietaireEmail,
        name: data.proprietaireName,
      },
    ],
    subject: subjectMap[data.eventType],
    htmlContent,
    tags: [`contract_${data.eventType}`, 'contracts'],
  }

  try {
    const response = await fetch(`${BREVO_API_URL}/smtp/email`, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Brevo API error:', error)
      throw new Error(`Failed to send contract email: ${error}`)
    }

    console.log(`Contract ${data.eventType} email sent to ${data.proprietaireEmail}`)
  } catch (error) {
    console.error('Error sending contract email:', error)
    throw error
  }
}

/**
 * Generate contract event email HTML
 */
function generateContractEmailHTML(data: ContractEmailData): string {
  const eventLabels = {
    created: '✅ Nouveau Contrat Créé',
    renewed: '🔄 Contrat Renouvelé',
    terminated: '⏹️ Contrat Résilié',
  }

  const eventMessages = {
    created: 'Un nouveau contrat a été créé avec succès.',
    renewed: 'Le contrat a été renouvelé avec les nouvelles conditions.',
    terminated:
      'Le contrat a été résilié. La garantie a été traitée selon les déductions.',
  }

  const eventColors = {
    created: '#10b981',
    renewed: '#3b82f6',
    terminated: '#ef4444',
  }

  const color = eventColors[data.eventType]

  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1f2937; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .event-banner { background: ${color}; color: white; padding: 15px; border-radius: 6px; text-align: center; font-size: 18px; font-weight: bold; margin: 15px 0; }
        .section { background: white; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .section-title { font-weight: bold; color: #1f2937; margin-bottom: 10px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
        .detail-label { font-weight: 600; color: #6b7280; }
        .detail-value { text-align: right; }
        .cta-button { display: inline-block; padding: 12px 24px; background: #1e40af; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
        .guarantee-info { background: #fee2e2; border-left: 4px solid #dc2626; padding: 12px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Loka</h1>
          <p>Notification Contrat</p>
        </div>
        <div class="content">
          <h2>Bonjour ${data.proprietaireName},</h2>
          
          <div class="event-banner">${eventLabels[data.eventType]}</div>
          
          <p>${eventMessages[data.eventType]}</p>
          
          <div class="section">
            <div class="section-title">📋 Informations du Contrat</div>
            <div class="detail-row">
              <span class="detail-label">Locataire:</span>
              <span class="detail-value">${data.tenantName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Bien:</span>
              <span class="detail-value">${data.propertyName}</span>
            </div>
            ${
              data.contractDetails?.rentAmount
                ? `
            <div class="detail-row">
              <span class="detail-label">Loyer mensuel:</span>
              <span class="detail-value">${data.contractDetails.rentAmount.toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'XOF',
                })} FCFA</span>
            </div>
            `
                : ''
            }
            ${
              data.contractDetails?.guaranteeAmount
                ? `
            <div class="detail-row">
              <span class="detail-label">Dépôt de garantie:</span>
              <span class="detail-value">${data.contractDetails.guaranteeAmount.toLocaleString(
                  'fr-FR',
                  { style: 'currency', currency: 'XOF' }
                )} FCFA</span>
            </div>
            `
                : ''
            }
            ${
              data.contractDetails?.startDate
                ? `
            <div class="detail-row">
              <span class="detail-label">Date de début:</span>
              <span class="detail-value">${new Date(data.contractDetails.startDate).toLocaleDateString(
                  'fr-FR'
                )}</span>
            </div>
            `
                : ''
            }
            ${
              data.contractDetails?.endDate
                ? `
            <div class="detail-row">
              <span class="detail-label">Date de fin:</span>
              <span class="detail-value">${new Date(data.contractDetails.endDate).toLocaleDateString(
                  'fr-FR'
                )}</span>
            </div>
            `
                : ''
            }
          </div>
          
          ${
            data.eventType === 'terminated' && data.guaranteeDetails
              ? `
          <div class="section">
            <div class="section-title">🏦 Traitement de la Garantie</div>
            <div class="detail-row">
              <span class="detail-label">Montant initial:</span>
              <span class="detail-value">${data.guaranteeDetails.originalAmount.toLocaleString(
                  'fr-FR',
                  { style: 'currency', currency: 'XOF' }
                )} FCFA</span>
            </div>
            ${
              data.guaranteeDetails.deductions > 0
                ? `
            <div class="detail-row">
              <span class="detail-label">Déductions:</span>
              <span class="detail-value" style="color: #dc2626; font-weight: bold;">-${data.guaranteeDetails.deductions.toLocaleString(
                  'fr-FR',
                  { style: 'currency', currency: 'XOF' }
                )} FCFA</span>
            </div>
            `
                : ''
            }
            <div class="detail-row" style="border: none; padding-top: 12px; border-top: 2px solid #10b981; color: #059669; font-weight: bold;">
              <span class="detail-label">Montant à retourner:</span>
              <span class="detail-value">${data.guaranteeDetails.returnAmount.toLocaleString(
                  'fr-FR',
                  { style: 'currency', currency: 'XOF' }
                )} FCFA</span>
            </div>
          </div>
          `
              : ''
          }
          
          <center>
            <a href="${APP_URL}/contrats" class="cta-button">Voir mes contrats</a>
          </center>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Cette notification a été générée automatiquement par votre tableau de bord de gestion immobilière.
          </p>
        </div>
        <div class="footer">
          <p>&copy; 2026 Loka. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
