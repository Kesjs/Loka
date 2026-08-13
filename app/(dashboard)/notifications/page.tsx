'use client'

/**
 * Notifications Page
 * Full alerts management page
 * Shows all alerts with filtering and actions
 */

import { useState } from 'react'
import { useAlerts } from '@/lib/hooks/useAlerts'
import { AlertNotification } from '@/components/alerts/AlertNotification'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Bell, Warning, Info, CheckCircle, Trash, ArrowLeft, WarningCircle } from '@phosphor-icons/react'

type FilterType = 'all' | 'unread' | 'high' | 'medium' | 'low'

export default function NotificationsPage() {
  const { data: alerts = [], isLoading, refetch } = useAlerts()
  const [filter, setFilter] = useState<FilterType>('all')

  // Filter alerts
  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'all') return true
    if (filter === 'unread') return !alert.is_read
    return alert.severity === filter
  })

  const stats = {
    total: alerts.length,
    unread: alerts.filter((a) => !a.is_read).length,
    high: alerts.filter((a) => a.severity === 'high').length,
    medium: alerts.filter((a) => a.severity === 'medium').length,
    low: alerts.filter((a) => a.severity === 'low').length,
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
      refetch()
    } catch (error) {
      console.error('Erreur lors du marquage des alertes:', error)
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer toutes les alertes ?')) return

    try {
      for (const alert of alerts) {
        await fetch(`/api/alerts/${alert.id}`, {
          method: 'DELETE',
        })
      }
      refetch()
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={32} weight="fill" className="text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">
                Gérez toutes vos alertes et notifications
              </p>
            </div>
          </div>
          <Link
            href="/home"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            <ArrowLeft size={18} weight="bold" />
            Retour
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Total"
          value={stats.total}
          icon={Bell}
          color="bg-gray-100"
          iconColor="text-gray-600"
          isActive={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <StatCard
          label="Non lues"
          value={stats.unread}
          icon={Bell}
          color="bg-blue-100"
          iconColor="text-blue-600"
          isActive={filter === 'unread'}
          onClick={() => setFilter('unread')}
        />
        <StatCard
          label="Critique"
          value={stats.high}
          icon={WarningCircle}
          color="bg-red-100"
          iconColor="text-red-600"
          isActive={filter === 'high'}
          onClick={() => setFilter('high')}
        />
        <StatCard
          label="Moyen"
          value={stats.medium}
          icon={Info}
          color="bg-yellow-100"
          iconColor="text-yellow-600"
          isActive={filter === 'medium'}
          onClick={() => setFilter('medium')}
        />
        <StatCard
          label="Bas"
          value={stats.low}
          icon={CheckCircle}
          color="bg-green-100"
          iconColor="text-green-600"
          isActive={filter === 'low'}
          onClick={() => setFilter('low')}
        />
      </div>

      {/* Action Bar */}
      {stats.unread > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg flex items-center justify-between"
        >
          <p className="text-blue-900">
            <strong>{stats.unread}</strong> alerte{stats.unread > 1 ? 's' : ''} non lue{stats.unread > 1 ? 's' : ''}
          </p>
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Marquer tout comme lu
          </button>
        </motion.div>
      )}

      {/* Alerts List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin text-3xl">⟳</div>
            <p className="text-gray-600 mt-4">Chargement des alertes...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={64} weight="thin" className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">
              {filter === 'unread'
                ? 'Aucune alerte non lue'
                : filter === 'all'
                  ? 'Aucune alerte'
                  : `Aucune alerte ${filter}`}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            <AnimatePresence mode="popLayout">
              {filteredAlerts.map((alert, idx) => (
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
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Danger Zone */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg"
        >
          <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
            <WarningCircle size={20} weight="fill" />
            Zone de danger
          </h3>
          <p className="text-sm text-red-800 mb-4">
            Supprimez définitivement toutes les alertes. Cette action est irréversible.
          </p>
          <button
            onClick={handleDeleteAll}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            <Trash size={18} weight="bold" />
            Supprimer toutes les alertes
          </button>
        </motion.div>
      )}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number
  icon: React.ElementType<any>
  color: string
  iconColor: string
  isActive: boolean
  onClick: () => void
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  iconColor,
  isActive,
  onClick,
}: StatCardProps) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`p-4 rounded-lg text-center transition-all cursor-pointer ${
        isActive
          ? 'ring-2 ring-offset-2 ring-blue-600 shadow-lg ' + color
          : 'hover:shadow-md ' + color
      }`}
    >
      <Icon size={32} weight="fill" className={`mx-auto mb-2 ${iconColor}`} />
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-600 mt-1">{label}</div>
    </motion.button>
  )
}
