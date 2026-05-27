"use client"

import * as React from "react"
import { toast } from "sonner"
import { Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { exportAccountingCsv } from "@/app/dashboard/accounting/actions"

type Props = {
  from: string
  to: string
  branch: string | null
}

export function CsvExportButton({ from, to, branch }: Props) {
  const [loading, setLoading] = React.useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const csv = await exportAccountingCsv({
        from,
        to,
        branch,
      })
      if (!csv || csv.split("\n").length <= 1) {
        toast.info("Nothing to export for this period.")
        return
      }
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const branchSuffix = branch ? `_${branch.toLowerCase().replace(/\s+/g, "-")}` : ""
      a.download = `enviro-orders_${from}_to_${to}${branchSuffix}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast.success("Exported orders CSV")
    } catch (err) {
      console.error(err)
      toast.error("Could not export CSV")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="gap-2"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Download size={16} />
      )}
      Export CSV
    </Button>
  )
}
