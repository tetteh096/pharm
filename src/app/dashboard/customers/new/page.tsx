import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PatientForm } from "@/components/dashboard/PatientForm"

export default function NewPatientPage() {
  return (
    <div className="dashboard-page space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/customers">
            <ArrowLeft size={20} />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New patient</h1>
          <p className="text-sm text-muted-foreground">
            Capture demographics, contact info, allergies, and medical notes
            for the patient&apos;s file.
          </p>
        </div>
      </div>

      <PatientForm />
    </div>
  )
}
