import {
  getConsultations,
  getConsultationStaffOptions,
} from "@/app/actions/consultation"
import { ConsultationsList } from "@/components/dashboard/ConsultationsList"

export const dynamic = "force-dynamic"

export default async function ConsultationsPage() {
  const [{ items }, staffOptions] = await Promise.all([
    getConsultations(1, 500),
    getConsultationStaffOptions(),
  ])

  return (
    <div className="dashboard-page">
      <ConsultationsList
        items={items.map((req) => ({
          id: req.id,
          fullName: req.fullName,
          email: req.email,
          phone: req.phone,
          medicationInterest: req.medicationInterest,
          message: req.message,
          status: req.status,
          handledById: req.handledById,
          handledByName: req.handledByName,
          handledAt: req.handledAt?.toISOString() ?? null,
          notes: req.notes,
          createdAt: req.createdAt.toISOString(),
        }))}
        staffOptions={staffOptions}
      />
    </div>
  )
}
