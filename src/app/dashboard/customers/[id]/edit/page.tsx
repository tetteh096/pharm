import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PatientForm } from "@/components/dashboard/PatientForm"
import { getPatient } from "../../actions"

type Params = Promise<{ id: string }>

export default async function EditPatientPage({
  params,
}: {
  params: Params
}) {
  const { id } = await params
  const patient = await getPatient(id)
  if (!patient) notFound()

  return (
    <div className="dashboard-page space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/customers/${id}`}>
            <ArrowLeft size={20} />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Edit {patient.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update demographics, contact info, and medical profile.
          </p>
        </div>
      </div>

      <PatientForm
        existing={{
          id: patient.id,
          name: patient.name,
          phone: patient.phone,
          email: patient.email,
          dateOfBirth: patient.dateOfBirth
            ? patient.dateOfBirth.toISOString()
            : null,
          gender: patient.gender,
          address: patient.address,
          emergencyContactName: patient.emergencyContactName,
          emergencyContactPhone: patient.emergencyContactPhone,
          allergies: patient.allergies,
          medicalNotes: patient.medicalNotes,
          clientType: patient.clientType,
          condition: patient.condition,
          source: patient.source,
          notes: patient.notes,
          status: patient.status,
          lastRefillAt: patient.lastRefillAt
            ? patient.lastRefillAt.toISOString()
            : null,
          nextRefillAt: patient.nextRefillAt
            ? patient.nextRefillAt.toISOString()
            : null,
        }}
      />
    </div>
  )
}
