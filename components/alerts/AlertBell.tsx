'use client'

/**
 * AlertBell Component
 * Header badge showing count of critical unread alerts
 * Navigates to /notifications page on click
 */

import { useRouter } from 'next/navigation'
import { useCriticalAlertCount } from '@/lib/hooks/useAlerts'
import { Bell } from '@phosphor-icons/react'

export function AlertBell() {
  const router = useRouter()
  const { data: criticalData, isLoading } = useCriticalAlertCount()
  const count = criticalData?.count || 0

  const handleClick = () => {
    router.push('/notifications')
  }

  return (
    <button
      onClick={handleClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      aria-label="Notifications"
    >
      {/* Bell Icon */}
      <Bell size={24} weight="regular" />

      {/* Badge - only show if count > 0 */}
      {count > 0 && !isLoading && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}
