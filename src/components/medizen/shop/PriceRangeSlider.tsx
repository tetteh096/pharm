"use client"

import { useCallback, useEffect, useState } from "react"
import { formatGhs } from "@/lib/format"

type Props = {
  min: number
  max: number
  value: [number, number]
  onChange: (next: [number, number]) => void
  step?: number
  debounceMs?: number
}

export default function PriceRangeSlider({
  min,
  max,
  value,
  onChange,
  step = 1,
  debounceMs = 300,
}: Props) {
  const [local, setLocal] = useState<[number, number]>(value)

  useEffect(() => {
    setLocal(value)
  }, [value[0], value[1]]) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounce notification to parent so dragging doesn't refetch on every pixel.
  useEffect(() => {
    if (local[0] === value[0] && local[1] === value[1]) return
    const t = setTimeout(() => onChange(local), debounceMs)
    return () => clearTimeout(t)
  }, [local, value, onChange, debounceMs])

  const update = useCallback(
    (idx: 0 | 1, raw: number) => {
      setLocal((prev) => {
        const next: [number, number] = [...prev]
        if (idx === 0) {
          next[0] = Math.max(min, Math.min(raw, prev[1] - step))
        } else {
          next[1] = Math.min(max, Math.max(raw, prev[0] + step))
        }
        return next
      })
    },
    [min, max, step]
  )

  const range = max - min || 1
  const leftPct = ((local[0] - min) / range) * 100
  const rightPct = ((local[1] - min) / range) * 100

  return (
    <div className="price-slider">
      <div className="slider-track-wrap">
        <div className="slider-track" />
        <div
          className="slider-track-active"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={local[0]}
          onChange={(e) => update(0, Number(e.target.value))}
          aria-label="Minimum price"
          className="slider-input"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={local[1]}
          onChange={(e) => update(1, Number(e.target.value))}
          aria-label="Maximum price"
          className="slider-input"
        />
      </div>

      <div className="price-display">
        <span>{formatGhs(local[0])}</span>
        <span className="price-display-dash">—</span>
        <span>{formatGhs(local[1])}</span>
      </div>

      <div className="price-inputs-row">
        <div className="price-input-wrap">
          <label className="price-label">Min</label>
          <input
            type="number"
            min={min}
            max={local[1] - step}
            value={local[0]}
            onChange={(e) => update(0, Number(e.target.value))}
            className="price-number"
          />
        </div>
        <div className="price-input-wrap">
          <label className="price-label">Max</label>
          <input
            type="number"
            min={local[0] + step}
            max={max}
            value={local[1]}
            onChange={(e) => update(1, Number(e.target.value))}
            className="price-number"
          />
        </div>
      </div>

    </div>
  )
}
