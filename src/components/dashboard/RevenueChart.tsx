"use client"

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

type ChartPoint = { month: string; revenue: number }

export function RevenueChart({ data }: { data: ChartPoint[] }) {
  const hasData = data.some((d) => d.revenue > 0)

  if (!hasData) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
        Revenue chart will populate when delivered orders are recorded.
      </div>
    )
  }

  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
          <XAxis
            dataKey="month"
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `GH₵${value}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <span className="text-xs text-muted-foreground">Revenue</span>
                    <p className="font-bold">GH₵{payload[0].value}</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#1157ee"
            strokeWidth={2}
            dot={{ r: 3, fill: "#13ec8a" }}
            activeDot={{ r: 5, fill: "#13ec8a" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
