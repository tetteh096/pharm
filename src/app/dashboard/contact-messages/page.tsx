import {
  getContactMessages,
  getContactMessageStaffOptions,
} from "@/app/actions/contact"
import { ContactMessagesList } from "@/components/dashboard/ContactMessagesList"

export const dynamic = "force-dynamic"

export default async function ContactMessagesPage() {
  const [{ items }, staffOptions] = await Promise.all([
    getContactMessages(1, 500),
    getContactMessageStaffOptions(),
  ])

  return (
    <div className="dashboard-page">
      <ContactMessagesList
        items={items.map((msg) => ({
          id: msg.id,
          fullName: msg.fullName,
          email: msg.email,
          phone: msg.phone,
          branchId: msg.branchId,
          branchName: msg.branchName,
          subject: msg.subject,
          message: msg.message,
          status: msg.status,
          handledById: msg.handledById,
          handledByName: msg.handledByName,
          handledAt: msg.handledAt?.toISOString() ?? null,
          notes: msg.notes,
          createdAt: msg.createdAt.toISOString(),
        }))}
        staffOptions={staffOptions}
      />
    </div>
  )
}
