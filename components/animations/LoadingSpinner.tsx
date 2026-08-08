/**
 * Loading Spinner Components
 * Various spinner animations for different use cases
 */

"use client"

import React from "react"
import { motion } from "framer-motion"
import { spinVariants, pulseVariants } from "./transitions"

interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

/**
 * Basic rotating spinner
 */
export function Spinner({
  size = "md",
  className = "",
}: SpinnerProps) {
  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }[size]

  return (
    <motion.div
      variants={spinVariants}
      animate="animate"
      className={`${sizeClass} border-2 border-slate-300 border-t-blue-600 rounded-full ${className}`}
    />
  )
}

/**
 * Centered page loader
 */
export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-slate-600">Chargement...</p>
      </div>
    </div>
  )
}

/**
 * Inline spinner for buttons or actions
 */
export function InlineSpinner({ size = "sm", className = "" }: SpinnerProps) {
  return <Spinner size={size} className={`inline-block ${className}`} />
}

/**
 * Pulse effect spinner
 */
export function PulseSpinner({ size = "md", className = "" }: SpinnerProps) {
  const sizeClass = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }[size]

  return (
    <motion.div
      variants={pulseVariants}
      animate="animate"
      className={`${sizeClass} bg-blue-600 rounded-full ${className}`}
    />
  )
}

/**
 * Animated dots loader
 */
export function DotsLoader() {
  return (
    <div className="flex gap-1 items-center">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -8, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.1,
          }}
          className="w-2 h-2 bg-blue-600 rounded-full"
        />
      ))}
    </div>
  )
}

/**
 * Bar loader
 */
export function BarLoader() {
  return (
    <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
      <motion.div
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="h-full w-1/2 bg-gradient-to-r from-transparent via-blue-600 to-transparent"
      />
    </div>
  )
}

/**
 * Skeleton pulse loader
 */
export function SkeletonLoader({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            backgroundPosition: ["200% center", "-200% center"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded"
          style={{
            backgroundSize: "200% center",
          }}
        />
      ))}
    </div>
  )
}

/**
 * Circular progress
 */
interface CircularProgressProps {
  progress: number
  size?: number
  className?: string
}

export function CircularProgress({
  progress,
  size = 60,
  className = "",
}: CircularProgressProps) {
  const radius = (size - 4) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className={className}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#e2e8f0"
        strokeWidth="2"
        fill="none"
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke="#3b82f6"
        strokeWidth="2"
        fill="none"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset }}
        transition={{ duration: 0.5 }}
        strokeLinecap="round"
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy="0.3em"
        className="text-xs font-semibold fill-slate-700"
      >
        {progress}%
      </text>
    </svg>
  )
}

/**
 * Linear progress bar
 */
interface ProgressBarProps {
  progress: number
  className?: string
}

export function ProgressBar({ progress, className = "" }: ProgressBarProps) {
  return (
    <div className={`w-full h-2 bg-slate-200 rounded-full overflow-hidden ${className}`}>
      <motion.div
        className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  )
}

/**
 * Skeleton card loader
 */
export function SkeletonCardLoader() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              backgroundPosition: ["200% center", "-200% center"],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "linear",
            }}
            className={`h-4 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded ${
              i === 0 ? "w-1/3" : i === 1 ? "w-1/2" : "w-2/3"
            }`}
            style={{
              backgroundSize: "200% center",
            }}
          />
        ))}
      </div>
    </div>
  )
}
