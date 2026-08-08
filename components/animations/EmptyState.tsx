/**
 * Empty State Components
 * Animated empty states with Lottie
 */

"use client"

import React from "react"
import { motion } from "framer-motion"
import { containerVariants, itemVariants } from "./transitions"

interface EmptyStateProps {
  title: string
  description: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

/**
 * Generic empty state
 */
export function EmptyState({
  title,
  description,
  icon,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={`flex flex-col items-center justify-center py-12 ${className}`}
    >
      {icon && (
        <motion.div
          variants={itemVariants}
          className="mb-4 text-slate-300 text-6xl"
        >
          {icon}
        </motion.div>
      )}

      <motion.h3
        variants={itemVariants}
        className="text-lg font-semibold text-slate-900 mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        variants={itemVariants}
        className="text-slate-600 text-center max-w-xs mb-6"
      >
        {description}
      </motion.p>

      {action && (
        <motion.button
          variants={itemVariants}
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}

/**
 * No payments empty state
 */
export function NoPaymentsEmpty() {
  return (
    <EmptyState
      title="Aucun paiement"
      description="Aucun paiement enregistré pour le moment. Commencez par enregistrer un paiement."
      icon="💳"
      action={{
        label: "Nouveau paiement",
        onClick: () => console.log("Add payment"),
      }}
    />
  )
}

/**
 * No contracts empty state
 */
export function NoContractsEmpty() {
  return (
    <EmptyState
      title="Aucun contrat"
      description="Créez votre premier contrat de location pour commencer."
      icon="📋"
      action={{
        label: "Nouveau contrat",
        onClick: () => console.log("Add contract"),
      }}
    />
  )
}

/**
 * No properties empty state
 */
export function NoPropertiesEmpty() {
  return (
    <EmptyState
      title="Aucun bien immobilier"
      description="Ajoutez votre premier bien immobilier pour commencer votre gestion locative."
      icon="🏠"
      action={{
        label: "Ajouter un bien",
        onClick: () => console.log("Add property"),
      }}
    />
  )
}

/**
 * No tenants empty state
 */
export function NoTenantsEmpty() {
  return (
    <EmptyState
      title="Aucun locataire"
      description="Aucun locataire enregistré. Créez un nouveau contrat pour ajouter un locataire."
      icon="👥"
      action={{
        label: "Nouveau contrat",
        onClick: () => console.log("Add tenant"),
      }}
    />
  )
}

/**
 * No alerts empty state
 */
export function NoAlertsEmpty() {
  return (
    <EmptyState
      title="Aucune alerte"
      description="Tout est à jour. Vous n'avez pas d'alerte pour le moment."
      icon="✨"
    />
  )
}

/**
 * Search results empty
 */
export function NoSearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      title="Aucun résultat"
      description={`Aucun résultat trouvé pour "${query}". Essayez une autre recherche.`}
      icon="🔍"
    />
  )
}

/**
 * Error state
 */
export function ErrorState({
  title = "Une erreur est survenue",
  description = "Veuillez réessayer ultérieurement.",
  retry,
}: {
  title?: string
  description?: string
  retry?: () => void
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon="⚠️"
      action={
        retry
          ? {
              label: "Réessayer",
              onClick: retry,
            }
          : undefined
      }
    />
  )
}

/**
 * Loading state - animated
 */
export function LoadingState() {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col items-center justify-center py-12"
    >
      <motion.div
        variants={itemVariants}
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-2 border-slate-300 border-t-blue-600 rounded-full"
      />
      <motion.p
        variants={itemVariants}
        className="text-slate-600 mt-4"
      >
        Chargement...
      </motion.p>
    </motion.div>
  )
}

/**
 * Success state
 */
export function SuccessState({
  title = "Succès",
  description = "L'opération a été effectuée avec succès.",
}: {
  title?: string
  description?: string
}) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon="✅"
    />
  )
}

/**
 * Empty with illustration
 */
export function EmptyWithIllustration({
  title,
  description,
  imageSrc,
  action,
}: EmptyStateProps & { imageSrc?: string }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="flex flex-col items-center justify-center py-12"
    >
      {imageSrc && (
        <motion.img
          variants={itemVariants}
          src={imageSrc}
          alt={title}
          className="w-32 h-32 mb-4 object-cover rounded-lg"
        />
      )}

      <motion.h3
        variants={itemVariants}
        className="text-lg font-semibold text-slate-900 mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        variants={itemVariants}
        className="text-slate-600 text-center max-w-xs mb-6"
      >
        {description}
      </motion.p>

      {action && (
        <motion.button
          variants={itemVariants}
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  )
}
