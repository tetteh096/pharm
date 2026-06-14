"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Download, FileSpreadsheet, Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  exportChronicImportTemplate,
  exportChronicPatientsCsv,
  importChronicPatientsFromCsv,
} from "@/app/dashboard/chronic/actions"

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function ChronicCsvTools({ scope }: { scope: "mine" | "all" }) {
  const router = useRouter()
  const fileRef = React.useRef<HTMLInputElement>(null)
  const [downloadingTemplate, setDownloadingTemplate] = React.useState(false)
  const [exporting, setExporting] = React.useState(false)
  const [importing, setImporting] = React.useState(false)

  const handleTemplate = async () => {
    setDownloadingTemplate(true)
    try {
      const csv = await exportChronicImportTemplate()
      downloadCsv("enviro-chronic-care-template.csv", csv)
      toast.success("Template downloaded. Open it in Excel, fill in your patients, then import.")
    } catch {
      toast.error("Could not download the template")
    } finally {
      setDownloadingTemplate(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const csv = await exportChronicPatientsCsv({ scope })
      const rows = csv.split("\n").filter(Boolean)
      if (rows.length <= 1) {
        toast.info("No chronic patients to export for this view.")
        return
      }
      downloadCsv(
        `enviro-chronic-care_${scope}_${new Date().toISOString().slice(0, 10)}.csv`,
        csv
      )
      toast.success("Chronic care list exported")
    } catch {
      toast.error("Could not export the list")
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async (file: File) => {
    setImporting(true)
    try {
      const text = await file.text()
      const result = await importChronicPatientsFromCsv(text)

      if (result.created > 0) {
        toast.success(
          `Imported ${result.created} patient${result.created === 1 ? "" : "s"}`
        )
        router.refresh()
      }

      if (result.skipped > 0 && result.created === 0 && result.errors.length === 0) {
        toast.info(
          `No new patients imported. ${result.skipped} row${result.skipped === 1 ? "" : "s"} skipped (already on chronic care or example row).`
        )
      }

      if (result.errors.length > 0) {
        const preview = result.errors
          .slice(0, 3)
          .map((e) => `Row ${e.row}: ${e.message}`)
          .join("\n")
        toast.error(
          result.errors.length === 1
            ? preview
            : `${result.errors.length} rows had issues.\n${preview}${result.errors.length > 3 ? "\n…" : ""}`
        )
      }

      if (result.created === 0 && result.skipped === 0 && result.errors.length === 0) {
        toast.info("No rows found to import.")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed")
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ""
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={fileRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void handleImport(file)
        }}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        disabled={downloadingTemplate}
        onClick={() => void handleTemplate()}
      >
        {downloadingTemplate ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileSpreadsheet className="h-4 w-4" />
        )}
        Download template
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        disabled={importing}
        onClick={() => fileRef.current?.click()}
      >
        {importing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        Import CSV
      </Button>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        disabled={exporting}
        onClick={() => void handleExport()}
      >
        {exporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export list
      </Button>
    </div>
  )
}
