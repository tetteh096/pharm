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

      <style jsx>{`
        .price-slider {
          padding: 0 4px;
        }
        .slider-track-wrap {
          position: relative;
          height: 32px;
          display: flex;
          align-items: center;
        }
        .slider-track {
          position: absolute;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(0, 0, 0, 0.08);
          border-radius: 999px;
        }
        .slider-track-active {
          position: absolute;
          height: 4px;
          background: var(--p1-clr);
          border-radius: 999px;
          z-index: 1;
        }
        .slider-input {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 32px;
          appearance: none;
          -webkit-appearance: none;
          background: transparent;
          pointer-events: none;
          z-index: 2;
          margin: 0;
        }
        .slider-input::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid var(--p1-clr);
          cursor: grab;
          pointer-events: auto;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
          transition: transform 0.15s;
        }
        .slider-input::-webkit-slider-thumb:active {
          cursor: grabbing;
          transform: scale(1.15);
        }
        .slider-input::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px solid var(--p1-clr);
          cursor: grab;
          pointer-events: auto;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
        }
        .slider-input::-moz-range-track {
          background: transparent;
        }
        .price-display {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          margin-top: 14px;
          font-size: 0.82rem;
          font-weight: 800;
          color: #09162a;
          letter-spacing: 0.01em;
        }
        .price-display-dash {
          opacity: 0.35;
          font-weight: 500;
        }
        .price-inputs-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 8px;
        }
        .price-input-wrap {
          display: flex;
          flex-direction: column;
          gap: 3px;
          min-width: 0;
        }
        .price-label {
          font-size: 0.62rem;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .price-number {
          width: 100%;
          padding: 0.4rem 0.55rem;
          font-size: 0.82rem;
          font-weight: 700;
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: 8px;
          outline: none;
          background: #ffffff;
          color: #09162a !important;
        }
        .price-number:focus {
          border-color: var(--p1-clr);
          color: #09162a !important;
          box-shadow: 0 0 0 3px rgba(19, 236, 138, 0.15);
        }
      `}</style>
    </div>
  )
}
