"use client"

import * as React from "react"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"

type Point = { date: string; revenue: number; orders: number }

const compactGhs = (value: number) => {
  if (value >= 1_000_000) return `GH₵${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `GH₵${(value / 1_000).toFixed(1)}K`
  return `GH₵${Math.round(value)}`
}

const formatDateShort = (iso: string) => {
  const d = new Date(iso)
  return d.toLocaleDateString("en-GH", { month: "short", day: "numeric" })
}

export function RevenueTrendChart({ data }: { data: Point[] }) {
  const maxLabels = 10
  const skip = Math.max(1, Math.floor(data.length / maxLabels))

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--p1-clr, #13ec8a)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--p1-clr, #13ec8a)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
            opacity={0.4}
          />
          <XAxis
            dataKey="date"
            tickFormatter={(value, index) =>
              index % skip === 0 ? formatDateShort(value) : ""
            }
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          />
          <YAxis
            tickFormatter={compactGhs}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            width={70}
          />
          <Tooltip
            cursor={{ stroke: "var(--p1-clr, #13ec8a)", strokeWidth: 1 }}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const p = payload[0].payload as Point
              return (
                <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
                  <div className="font-semibold mb-1">
                    {new Date(p.date).toLocaleDateString("en-GH", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="text-muted-foreground">
                    Revenue:{" "}
                    <span className="font-mono text-foreground font-semibold">
                      {compactGhs(p.revenue)}
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    Orders:{" "}
                    <span className="font-mono text-foreground font-semibold">
                      {p.orders}
                    </span>
                  </div>
                </div>
              )
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="var(--p1-clr, #13ec8a)"
            strokeWidth={2}
            fill="url(#revenueGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
