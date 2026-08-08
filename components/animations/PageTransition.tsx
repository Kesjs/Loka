/**
 * Page Transition Component
 * Wraps pages for entrance/exit animations
 */

"use client"

import React from "react"
import { motion } from "framer-motion"
import { pageVariants } from "./transitions"

interface PageTransitionProps {
  children: React.ReactNode
  className?: string
}

export function PageTransition({
  children,
  className = "",
}: PageTransitionProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Page with fade animation only
 */
export function PageFade({
  children,
  className = "",
}: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Page with slide animation
 */
interface PageSlideProps extends PageTransitionProps {
  direction?: "left" | "right"
}

export function PageSlide({
  children,
  direction = "right",
  className = "",
}: PageSlideProps) {
  const x = direction === "left" ? -50 : 50

  return (
    <motion.div
      initial={{ opacity: 0, x }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -x }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Loading overlay during page transition
 */
export function PageLoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-8 h-8 border-3 border-slate-300 border-t-blue-600 rounded-full"
      />
    </motion.div>
  )
}
