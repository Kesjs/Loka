'use client'

/**
 * AlertCenter Component
 * Full alert list page/modal
 * Shows all alerts with ability to mark as read/delete
 */

import { useState } from 'react'
import { useAlerts } from '@/lib/hooks/useAlerts'
import { AlertNotification } from './AlertNotification'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Warning, Info, CheckCircle } from '@phosphor-icons/react'

interface AlertCenterProps {
  onClose: () => void
}

export function AlertCenter({ onClose }: AlertCenterProps) {
  const { data: alerts = [], isLoading } = useAlerts()

  const unreadCount = alerts.filter((a) => !a.is_read).length
  const criticalCount = alerts.filter((a) => a.severity === 'high' && !a.is_read).length

  // Group alerts by severity
  const alertsByType = {
    high: alerts.filter((a) => a.severity === 'high'),
    medium: alerts.filter((a) => a.severity === 'medium'),
    low: alerts.filter((a) => a.severity === 'low'),
  }

  const handleMarkAllAsRead = async () => {
    const unreadIds = alerts
      .filter((a) => !a.is_read)
      .map((a) => a.id)

    if (unreadIds.length === 0) return

    try {
      for (const id of unreadIds) {
        await fetch(`/api/alerts/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_read: true }),
        })
      }
      // Refresh alerts
      window.location.reload()
    } catch (error) {
      console.error('Erreur lors du marquage:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl mx-4 bg-white rounded-lg shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white border-b-4 border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Centre d'alertes</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-blue-800 rounded-full p-1 transition-colors"
              aria-label="Fermer"
            >
              <X size={24} weight="bold" />
            </button>
          </div>
          <p className="text-blue-100">
            {unreadCount > 0 ? (
              <>
                {unreadCount} alerte{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
                {criticalCount > 0 && ` (${criticalCount} critique${criticalCount > 1 ? 's' : ''})`}
              </>
            ) : (
              'Aucune alerte non lue'
            )}
          </p>
        </div>

        {/* Action Bar */}
        {unreadCount > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-b flex gap-2">
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Marquer tout comme lu
            </button>
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto flex-1 divide-y">
          {isLoading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin text-3xl">⟳</div>
              <p className="text-gray-600 mt-2">Chargement des alertes...</p>
            </div>
          ) : alerts.length === 0 ? (
            <div className="p-6 text-center">
              <CheckCircle size={48} weight="thin" className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">Aucune alerte</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {/* High Severity */}
              {alertsByType.high.length > 0 && (
                <div key="high">
                  <div className="px-6 py-3 bg-red-50 sticky top-0">
                    <h3 className="text-sm font-bold text-red-900 flex items-center gap-2">
                      <Warning size={18} weight="duotone" />
                      Critique ({alertsByType.high.length})
                    </h3>
                  </div>
                  {alertsByType.high.map((alert, idx) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <AlertNotification alert={alert} />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Medium Severity */}
              {alertsByType.medium.length > 0 && (
                <div key="medium">
                  <div className="px-6 py-3 bg-yellow-50 sticky top-0">
                    <h3 className="text-sm font-bold text-yellow-900 flex items-center gap-2">
                      <Info size={18} weight="duotone" />
                      Moyen ({alertsByType.medium.length})
                    </h3>
                  </div>
                  {alertsByType.medium.map((alert, idx) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <AlertNotification alert={alert} />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Low Severity */}
              {alertsByType.low.length > 0 && (
                <div key="low">
                  <div className="px-6 py-3 bg-blue-50 sticky top-0">
                    <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                      <CheckCircle size={18} weight="duotone" />
                      Bas ({alertsByType.low.length})
                    </h3>
                  </div>
                  {alertsByType.low.map((alert, idx) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <AlertNotification alert={alert} />
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-3 border-t flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition-colors font-medium"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
