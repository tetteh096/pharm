"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Crosshair, MapPin, Search, Loader2, X } from "lucide-react"
import type {
  Map as LeafletMap,
  Marker as LeafletMarker,
} from "leaflet"

import "leaflet/dist/leaflet.css"

export type DeliveryLocation = {
  lat: number
  lng: number
  address: string
}

type DeliveryMapPickerProps = {
  /** Initial location to pin if available (e.g. when editing). */
  initial?: DeliveryLocation | null
  /** Called every time the customer picks a new location. */
  onChange: (location: DeliveryLocation | null) => void
}

// Default center: Madina, Greater Accra.
const DEFAULT_CENTER: [number, number] = [5.6837, -0.1665]
const DEFAULT_ZOOM = 13

type NominatimResult = {
  lat: string
  lon: string
  display_name: string
}

export default function DeliveryMapPicker({ initial, onChange }: DeliveryMapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<LeafletMarker | null>(null)

  const [ready, setReady] = useState(false)
  const [pinned, setPinned] = useState<DeliveryLocation | null>(initial ?? null)
  const [search, setSearch] = useState("")
  const [searching, setSearching] = useState(false)
  const [results, setResults] = useState<NominatimResult[]>([])
  const [locating, setLocating] = useState(false)
  const [reverseLoading, setReverseLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Lazily reverse-geocode (lat,lng -> address) using OpenStreetMap's Nominatim.
  const reverseGeocode = useCallback(
    async (lat: number, lng: number, signal?: AbortSignal): Promise<string> => {
      try {
        setReverseLoading(true)
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=en`,
          { signal, headers: { Accept: "application/json" } }
        )
        if (!res.ok) throw new Error("reverse")
        const data = (await res.json()) as { display_name?: string }
        return data.display_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      } catch {
        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      } finally {
        setReverseLoading(false)
      }
    },
    []
  )

  // One-time map bootstrap. Leaflet is browser-only.
  useEffect(() => {
    let cancelled = false
    let map: LeafletMap | null = null

    ;(async () => {
      if (!containerRef.current) return
      // Leaflet ships CJS — try default export first, then fall back to namespace.
      const mod = await import("leaflet")
      const L = (mod as unknown as { default?: typeof mod }).default ?? mod

      // Leaflet's default marker icons reference image URLs relative to the
      // CSS file which doesn't work via bundlers. Use CDN icons instead.
      const iconRetinaUrl =
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png"
      const iconUrl =
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png"
      const shadowUrl =
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
      L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl })

      if (cancelled || !containerRef.current) return

      const center: [number, number] = initial
        ? [initial.lat, initial.lng]
        : DEFAULT_CENTER

      map = L.map(containerRef.current, {
        center,
        zoom: initial ? 16 : DEFAULT_ZOOM,
        scrollWheelZoom: true,
      })

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      mapRef.current = map

      // Helper to place / move the marker.
      const placeMarker = async (lat: number, lng: number) => {
        if (!mapRef.current) return
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng])
        } else {
          markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(
            mapRef.current
          )
          markerRef.current.on("dragend", async () => {
            const pos = markerRef.current!.getLatLng()
            const address = await reverseGeocode(pos.lat, pos.lng)
            const next = { lat: pos.lat, lng: pos.lng, address }
            setPinned(next)
            onChange(next)
          })
        }
        const address = await reverseGeocode(lat, lng)
        const next = { lat, lng, address }
        setPinned(next)
        onChange(next)
      }

      // Click-to-pin behaviour.
      map.on("click", (e) => {
        const { lat, lng } = e.latlng
        void placeMarker(lat, lng)
      })

      if (initial) {
        // Restore a previously-pinned location.
        markerRef.current = L.marker([initial.lat, initial.lng], {
          draggable: true,
        }).addTo(map)
        markerRef.current.on("dragend", async () => {
          if (!markerRef.current) return
          const pos = markerRef.current.getLatLng()
          const address = await reverseGeocode(pos.lat, pos.lng)
          const next = { lat: pos.lat, lng: pos.lng, address }
          setPinned(next)
          onChange(next)
        })
      }

      // Expose placeMarker on the instance so other handlers can use it.
      ;(map as unknown as { _placeMarker: typeof placeMarker })._placeMarker =
        placeMarker

      if (!cancelled) setReady(true)
    })().catch((err) => {
      console.error("Failed to load Leaflet map", err)
      if (!cancelled) setError("We couldn't load the map. You can still type your address below.")
    })

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
      markerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Helper to programmatically set/move pin (used by search + geolocation).
  const setPin = useCallback(
    async (lat: number, lng: number, zoom = 16) => {
      if (!mapRef.current) return
      mapRef.current.setView([lat, lng], zoom, { animate: true })
      const placer = (
        mapRef.current as unknown as {
          _placeMarker?: (lat: number, lng: number) => Promise<void>
        }
      )._placeMarker
      if (placer) await placer(lat, lng)
    },
    []
  )

  // ─── Forward search via Nominatim ───────────────────────────────────────
  useEffect(() => {
    if (!search.trim()) {
      setResults([])
      return
    }
    const handle = setTimeout(async () => {
      setSearching(true)
      try {
        const q = encodeURIComponent(`${search} Accra Ghana`)
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${q}&limit=5&accept-language=en&countrycodes=gh`,
          { headers: { Accept: "application/json" } }
        )
        if (!res.ok) throw new Error("search")
        const data = (await res.json()) as NominatimResult[]
        setResults(data)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
      }
    }, 400)
    return () => clearTimeout(handle)
  }, [search])

  const handleResultClick = (r: NominatimResult) => {
    const lat = Number(r.lat)
    const lng = Number(r.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return
    setResults([])
    setSearch(r.display_name)
    void setPin(lat, lng, 16)
  }

  const handleUseMyLocation = () => {
    if (!("geolocation" in navigator)) {
      setError("Your browser does not support GPS location.")
      return
    }
    setLocating(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        await setPin(pos.coords.latitude, pos.coords.longitude, 17)
        setLocating(false)
      },
      (err) => {
        setLocating(false)
        if (err.code === err.PERMISSION_DENIED) {
          setError("Please allow location access, or click on the map to pin your spot.")
        } else {
          setError("We couldn't get your location. Click on the map to pin your spot.")
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleClear = () => {
    if (markerRef.current && mapRef.current) {
      mapRef.current.removeLayer(markerRef.current)
      markerRef.current = null
    }
    setPinned(null)
    onChange(null)
  }

  return (
    <div className="delivery-map-picker">
      <div className="d-flex flex-column flex-md-row gap-2 mb-2 position-relative">
        <div className="flex-grow-1 position-relative">
          <Search
            size={16}
            className="position-absolute"
            style={{
              top: "50%",
              left: 14,
              transform: "translateY(-50%)",
              color: "rgba(0,0,0,0.4)",
            }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a place, e.g. Madina Market, Spintex, East Legon…"
            className="form-control rounded-5 ps-5"
            style={{ paddingRight: 38 }}
          />
          {searching ? (
            <Loader2
              size={16}
              className="animate-spin position-absolute"
              style={{ top: "50%", right: 14, transform: "translateY(-50%)" }}
            />
          ) : search ? (
            <button
              type="button"
              onClick={() => {
                setSearch("")
                setResults([])
              }}
              className="position-absolute border-0 bg-transparent p-0"
              aria-label="Clear search"
              style={{ top: "50%", right: 14, transform: "translateY(-50%)" }}
            >
              <X size={16} style={{ color: "rgba(0,0,0,0.5)" }} />
            </button>
          ) : null}

          {results.length > 0 && (
            <div
              className="position-absolute w-100 rounded-3 shadow-sm overflow-hidden bg-white border"
              style={{ top: "calc(100% + 6px)", zIndex: 1000, maxHeight: 240, overflowY: "auto" }}
            >
              {results.map((r, i) => (
                <button
                  key={`${r.lat}-${r.lon}-${i}`}
                  type="button"
                  onClick={() => handleResultClick(r)}
                  className="d-block w-100 text-start border-0 bg-transparent px-3 py-2 d-flex align-items-start gap-2"
                  style={{ fontSize: "0.84rem", borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                >
                  <MapPin size={14} className="mt-1" style={{ color: "var(--p1-clr)", flexShrink: 0 }} />
                  <span className="black">{r.display_name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="rounded-5 px-3 py-2 fw_700 border-0 d-inline-flex align-items-center justify-content-center gap-2 flex-shrink-0"
          style={{
            background: locating ? "rgba(0,0,0,0.05)" : "var(--p1-clr)",
            color: locating ? "rgba(0,0,0,0.5)" : "#fff",
            fontSize: "0.82rem",
            cursor: locating ? "wait" : "pointer",
          }}
        >
          {locating ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
          {locating ? "Locating…" : "Use my location"}
        </button>
      </div>

      <div
        ref={containerRef}
        className="rounded-4 overflow-hidden border position-relative"
        style={{ height: 320, background: "#f4f6f8", zIndex: 0 }}
      >
        {!ready && !error && (
          <div className="position-absolute top-50 start-50 translate-middle d-flex flex-column align-items-center gap-2 pra">
            <Loader2 size={20} className="animate-spin" />
            <span style={{ fontSize: "0.8rem" }}>Loading map…</span>
          </div>
        )}
      </div>

      {error && (
        <p className="mb-0 mt-2" style={{ color: "#b91c1c", fontSize: "0.78rem" }}>
          {error}
        </p>
      )}

      {pinned ? (
        <div
          className="d-flex align-items-start gap-2 mt-2 rounded-3 p-2 px-3"
          style={{
            background: "rgba(19, 236, 138, 0.08)",
            border: "1px solid rgba(19, 236, 138, 0.22)",
          }}
        >
          <MapPin size={16} className="mt-1 flex-shrink-0" style={{ color: "var(--p1-clr)" }} />
          <div className="flex-grow-1 min-w-0">
            <p className="black mb-0 fw_700" style={{ fontSize: "0.85rem", lineHeight: 1.4 }}>
              {reverseLoading ? "Looking up that spot…" : "Pinned location"}
            </p>
            <p className="pra mb-0" style={{ fontSize: "0.78rem", wordBreak: "break-word" }}>
              {pinned.address}
            </p>
            <p className="pra mb-0" style={{ fontSize: "0.7rem", opacity: 0.65 }}>
              GPS: {pinned.lat.toFixed(5)}, {pinned.lng.toFixed(5)}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="border-0 bg-transparent p-1 d-inline-flex align-items-center justify-content-center rounded-circle"
            aria-label="Remove pinned location"
            style={{ color: "#dc2626" }}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <p className="pra mb-0 mt-2" style={{ fontSize: "0.78rem" }}>
          Tap a spot on the map, search above, or use your GPS to drop a delivery pin. The rider will use this to find you.
        </p>
      )}
    </div>
  )
}
