import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ManualOrderForm } from "@/components/dashboard/ManualOrderForm"

export const dynamic = "force-dynamic"

export default function NewOrderPage() {
  return (
    <div className="dashboard-page space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/orders">
            <ArrowLeft size={20} />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create order</h1>
          <p className="text-sm text-muted-foreground">
            For phone-in or walk-in customers. Stock is reserved as soon as the
            order is created.
          </p>
        </div>
      </div>

      <ManualOrderForm />
    </div>
  )
}
