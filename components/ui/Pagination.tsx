/**
 * Pagination Component
 * Reusable pagination with Framer Motion animations
 */

"use client"

import React from "react"
import { motion } from "framer-motion"
import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr"
import { itemVariants } from "@/components/animations"
import { Select } from "@/components/ui/select"

interface PaginationProps {
  /**
   * Current page number (1-indexed)
   */
  page: number

  /**
   * Total number of pages
   */
  totalPages: number

  /**
   * Callback when page changes
   */
  onPageChange: (page: number) => void

  /**
   * Whether pagination is disabled (e.g., while loading)
   */
  disabled?: boolean

  /**
   * Maximum number of page buttons to show (excluding prev/next)
   */
  maxButtons?: number

  /**
   * Additional CSS class
   */
  className?: string
}

/**
 * Calculate which page numbers to display
 */
function getPaginationButtons(
  currentPage: number,
  totalPages: number,
  maxButtons: number = 5
): (number | string)[] {
  if (totalPages <= maxButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const buttons: (number | string)[] = []
  const halfWindow = Math.floor(maxButtons / 2)

  let start = Math.max(1, currentPage - halfWindow)
  let end = Math.min(totalPages, start + maxButtons - 1)

  if (end - start + 1 < maxButtons) {
    start = Math.max(1, end - maxButtons + 1)
  }

  if (start > 1) {
    buttons.push(1)
    if (start > 2) {
      buttons.push("...")
    }
  }

  for (let i = start; i <= end; i++) {
    buttons.push(i)
  }

  if (end < totalPages) {
    if (end < totalPages - 1) {
      buttons.push("...")
    }
    buttons.push(totalPages)
  }

  return buttons
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  maxButtons = 5,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const buttons = getPaginationButtons(page, totalPages, maxButtons)
  const canGoPrev = page > 1
  const canGoNext = page < totalPages

  return (
    <motion.div
      variants={itemVariants}
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || !canGoPrev}
        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        aria-label="Previous page"
      >
        <CaretLeft size={18} />
      </button>

      {/* Page Buttons */}
      <div className="flex gap-1">
        {buttons.map((button, index) => {
          const isEllipsis = button === "..."
          const isCurrentPage = button === page
          const pageNum = typeof button === "number" ? button : null

          return (
            <motion.button
              key={`${button}-${index}`}
              variants={itemVariants}
              onClick={() => pageNum && onPageChange(pageNum)}
              disabled={disabled || isEllipsis}
              className={`
                w-10 h-10 rounded-lg font-medium text-sm transition-all
                ${
                  isEllipsis
                    ? "cursor-default text-slate-400"
                    : isCurrentPage
                      ? "bg-primary-600 text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                }
                ${disabled && !isCurrentPage ? "disabled:opacity-50" : ""}
              `}
              whileHover={!isEllipsis && !disabled ? { scale: 1.05 } : {}}
              whileTap={!isEllipsis && !disabled ? { scale: 0.95 } : {}}
            >
              {button}
            </motion.button>
          )
        })}
      </div>

      {/* Next Button */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || !canGoNext}
        className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        aria-label="Next page"
      >
        <CaretRight size={18} />
      </button>

      {/* Page Info */}
      <span className="text-sm text-slate-500 ml-4">
        Page {page} of {totalPages}
      </span>
    </motion.div>
  )
}

/**
 * Pagination with size selector
 */
interface PaginationWithSizeProps extends PaginationProps {
  pageSize: number
  onPageSizeChange: (size: number) => void
  availableSizes?: number[]
}

export function PaginationWithSize({
  page,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  availableSizes = [10, 20, 50, 100],
  disabled = false,
  className = "",
}: PaginationWithSizeProps) {
  return (
    <motion.div
      variants={itemVariants}
      className={`flex items-center justify-between ${className}`}
    >
      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        disabled={disabled}
      />

      <motion.div
        variants={itemVariants}
        className="flex items-center gap-3"
      >
        <label className="text-sm text-slate-600">
          Items per page:
        </label>
        <Select
          value={pageSize.toString()}
          onChange={(value) => onPageSizeChange(Number(value))}
          options={availableSizes.map((size) => ({
            value: size.toString(),
            label: size.toString(),
          }))}
          disabled={disabled}
        />
      </motion.div>
    </motion.div>
  )
}
