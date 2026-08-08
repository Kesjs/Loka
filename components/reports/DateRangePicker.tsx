"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface DateRangePickerProps {
  onDateRangeChange: (startDate: Date, endDate: Date) => void
  defaultDays?: number
}

export default function DateRangePicker({
  onDateRangeChange,
  defaultDays = 30,
}: DateRangePickerProps) {
  const today = new Date()
  const defaultStart = new Date(today.getTime() - defaultDays * 24 * 60 * 60 * 1000)

  const [startDate, setStartDate] = useState(
    defaultStart.toISOString().split("T")[0]
  )
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0])

  const handleApply = () => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    end.setHours(23, 59, 59, 999)
    onDateRangeChange(start, end)
  }

  const handlePreset = (days: number) => {
    const end = new Date()
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000)
    setStartDate(start.toISOString().split("T")[0])
    setEndDate(end.toISOString().split("T")[0])
    end.setHours(23, 59, 59, 999)
    onDateRangeChange(start, end)
  }

  return (
    <Card className="p-4 bg-white border border-gray-200">
      <div className="space-y-4">
        {/* Preset buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePreset(7)}
            className="text-xs"
          >
            7 jours
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePreset(30)}
            className="text-xs"
          >
            30 jours
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePreset(90)}
            className="text-xs"
          >
            90 jours
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const year = new Date().getFullYear()
              const start = new Date(year, 0, 1)
              const end = new Date(year, 11, 31)
              setStartDate(start.toISOString().split("T")[0])
              setEndDate(end.toISOString().split("T")[0])
              end.setHours(23, 59, 59, 999)
              onDateRangeChange(start, end)
            }}
            className="text-xs"
          >
            Cette année
          </Button>
        </div>

        {/* Custom date inputs */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Du
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Au
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full"
            />
          </div>
          <Button onClick={handleApply} className="bg-blue-600 text-white">
            Appliquer
          </Button>
        </div>
      </div>
    </Card>
  )
}
