/**
 * Card Stagger Component
 * Animated container that staggers children animations
 */

"use client"

import React from "react"
import { motion } from "framer-motion"
import { containerVariants, itemVariants, cardVariants } from "./transitions"

interface CardStaggerProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

/**
 * Basic stagger container for any children
 */
export function CardStagger({
  children,
  className = "",
  delay = 0.2,
}: CardStaggerProps) {
  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={className}
    >
      <motion.div variants={itemVariants}>{children}</motion.div>
    </motion.div>
  )
}

/**
 * Stagger multiple cards/items
 */
interface CardGridProps {
  items: React.ReactNode[]
  className?: string
  columns?: number
}

export function CardGrid({
  items,
  className = "grid gap-6",
  columns = 4,
}: CardGridProps) {
  const gridClass = `${className} grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns}`

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={gridClass}
    >
      {items.map((item, index) => (
        <motion.div key={index} variants={itemVariants}>
          {item}
        </motion.div>
      ))}
    </motion.div>
  )
}

/**
 * Stagger list items
 */
interface StaggerListProps {
  items: React.ReactNode[]
  className?: string
}

export function StaggerList({ items, className = "space-y-3" }: StaggerListProps) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={className}
    >
      {items.map((item, index) => (
        <motion.li key={index} variants={itemVariants}>
          {item}
        </motion.li>
      ))}
    </motion.ul>
  )
}

/**
 * Card with stagger animation
 */
export function StaggerCard({
  children,
  className = "bg-white rounded-lg border border-slate-200 p-6 shadow-sm",
}: CardStaggerProps) {
  return (
    <motion.div variants={itemVariants} className={className}>
      {children}
    </motion.div>
  )
}

/**
 * Stagger with hover effect
 */
export function CardStaggerHover({
  children,
  className = "bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow",
}: CardStaggerProps) {
  return (
    <motion.div variants={cardVariants} className={className} whileHover="hover">
      {children}
    </motion.div>
  )
}

/**
 * Table body with staggered rows
 */
interface TableRowsProps {
  rows: React.ReactNode[]
}

export function StaggerTableRows({ rows }: TableRowsProps) {
  return (
    <motion.tbody
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {rows.map((row, index) => (
        <motion.tr key={index} variants={itemVariants}>
          {row}
        </motion.tr>
      ))}
    </motion.tbody>
  )
}

/**
 * Stagger with custom timing
 */
interface CustomStaggerProps extends CardStaggerProps {
  staggerDelay?: number
  itemDelay?: number
}

export function CustomStagger({
  children,
  className = "",
  staggerDelay = 0.1,
  itemDelay = 0.2,
}: CustomStaggerProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: itemDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Fade-in stagger
 */
export function FadeInStagger({
  items,
  className = "",
}: CardGridProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        initial: { opacity: 0 },
        animate: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={{
            initial: { opacity: 0 },
            animate: { opacity: 1 },
          }}
        >
          {item}
        </motion.div>
      ))}
    </motion.div>
  )
}
