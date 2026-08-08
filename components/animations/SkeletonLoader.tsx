/**
 * Skeleton Loader Components
 * Multiple skeleton variants for different UI elements
 */

'use client'

import React from "react"
import { motion } from "framer-motion"
import { skeletonVariants } from "./transitions"

interface SkeletonProps {
  className?: string
  count?: number
}

/**
 * Generic Skeleton - Base component
 */
export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <motion.div
      variants={skeletonVariants}
      initial="initial"
      animate="animate"
      className={`bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 bg-[length:200%_100%] rounded ${className}`}
    />
  )
}

/**
 * Stat Card Skeleton
 */
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  )
}

/**
 * Multiple Stat Cards Skeleton
 */
export function StatCardsSkeleton({ count = 4 }: SkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Table Row Skeleton
 */
export function TableRowSkeleton() {
  return (
    <tr className="border-b border-slate-200">
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-32" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-6 py-4">
        <Skeleton className="h-4 w-16" />
      </td>
    </tr>
  )
}

/**
 * Table Skeleton with Header
 */
export function TableSkeleton({ count = 5 }: SkeletonProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-4 w-24" />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-4 w-32" />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-4 w-20" />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-4 w-24" />
            </th>
            <th className="px-6 py-3 text-left">
              <Skeleton className="h-4 w-16" />
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: count }).map((_, i) => (
            <TableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

/**
 * Form Field Skeleton
 */
export function FormFieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full rounded" />
    </div>
  )
}

/**
 * Form Group Skeleton
 */
export function FormGroupSkeleton({ count = 4 }: SkeletonProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <FormFieldSkeleton key={i} />
        ))}
      </div>
      <Skeleton className="h-10 w-24 rounded" />
    </div>
  )
}

/**
 * Chart Skeleton
 */
export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
      <Skeleton className="h-4 w-32 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded" />
        ))}
      </div>
    </div>
  )
}

/**
 * Card Content Skeleton
 */
export function CardContentSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}

/**
 * Avatar Skeleton
 */
export function AvatarSkeleton() {
  return <Skeleton className="h-10 w-10 rounded-full" />
}

/**
 * List Skeleton
 */
export function ListSkeleton({ count = 5 }: SkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <AvatarSkeleton />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Header Skeleton
 */
export function HeaderSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-96" />
    </div>
  )
}

/**
 * Button Skeleton
 */
export function ButtonSkeleton() {
  return <Skeleton className="h-10 w-24 rounded" />
}

/**
 * Compose complex skeletons
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <HeaderSkeleton />
      <StatCardsSkeleton count={4} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartSkeleton />
        </div>
        <div>
          <CardContentSkeleton />
        </div>
      </div>
      <TableSkeleton count={5} />
    </div>
  )
}
