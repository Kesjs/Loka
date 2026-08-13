'use client'

/**
 * AlertNotification Component
 * Individual alert item
 * Shows in AlertCenter and can be used as toast
 */

import { Alert } from '@/lib/db/repositories/AlertRepository'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Warning, Info, CheckCircle, Trash, Check } from '@phosphor-icons/react'

interface AlertNotificationProps {
  alert: Alert
  onClose?: () => void
}

export function AlertNotification({ alert, onClose }: AlertNotificationProps) {
  const [isMarked, setIsMarked] = useState(alert.is_read)
  const [isDeleted, setIsDeleted] = useState(false)

  if (isDeleted) return null

  const severityConfig = {
    high: {
      bg: 'bg-red-50',
      border: 'border-l-4 border-red-500',
      badge: 'bg-red-100 text-red-900',
      icon: Warning,
    },
    medium: {
      bg: 'bg-yellow-50',
      border: 'border-l-4 border-yellow-500',
      badge: 'bg-yellow-100 text-yellow-900',
      icon: Info,
    },
    low: {
      bg: 'bg-blue-50',
      border: 'border-l-4 border-blue-500',
      badge: 'bg-blue-100 text-blue-900',
      icon: CheckCircle,
    },
  }

  const typeConfig: Record<string, { icon: React.ComponentType<any>; label: string }> = {
    missing_payment: { icon: Warning, label: 'Paiement manquant' },
    expiring_contract: { icon: Info, label: 'Contrat expirant' },
    deposit_to_return: { icon: CheckCircle, label: 'Dépôt à restituer' },
  }

  const config = severityConfig[alert.severity]
  const typeInfo = typeConfig[alert.type] || { icon: Info, label: alert.type }
  const SeverityIcon = config.icon
  const TypeIcon = typeInfo.icon

  const handleMarkAsRead = async () => {
    try {
      const response = await fetch(`/api/alerts/${alert.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: true }),
      })

      if (response.ok) {
        setIsMarked(true)
      }
    } catch (error) {
      console.error('Erreur lors du marquage:', error)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/alerts/${alert.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setIsDeleted(true)
        onClose?.()
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const formattedDate = new Date(alert.created_at).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <motion.div
      layout
      className={`${config.bg} ${config.border} p-4 hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 pt-1">
          <SeverityIcon size={20} weight="duotone" className="text-gray-700" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${config.badge}`}>
              <TypeIcon size={14} weight="duotone" />
              {typeInfo.label}
            </div>
          </div>

          <p className="text-sm font-medium text-gray-900 leading-relaxed">
            {alert.message}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            {formattedDate}
          </p>

          {/* Link if available */}
          {alert.action_url && (
            <Link
              href={alert.action_url}
              className="inline-block text-xs font-medium text-blue-600 hover:text-blue-800 mt-2 underline"
            >
              Voir les détails →
            </Link>
          )}
        </div>

        {/* Status Indicator & Actions */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {!isMarked && (
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" title="Non lue" />
          )}

          {/* Action Buttons */}
          <div className="flex gap-1">
            {!isMarked && (
              <button
                onClick={handleMarkAsRead}
                className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-100 rounded transition-colors"
                title="Marquer comme lue"
                aria-label="Marquer comme lue"
              >
                <Check size={16} weight="bold" />
              </button>
            )}

            <button
              onClick={handleDelete}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded transition-colors"
              title="Supprimer"
              aria-label="Supprimer"
            >
              <Trash size={16} weight="bold" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
