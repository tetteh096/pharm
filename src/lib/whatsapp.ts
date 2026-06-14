/** Ghana local number → WhatsApp international format (no +). */
export function toWhatsAppPhone(tel: string | null | undefined): string | null {
  if (!tel) return null
  const digits = tel.replace(/\D/g, "")
  if (!digits) return null
  if (digits.startsWith("233")) return digits
  if (digits.startsWith("0")) return `233${digits.slice(1)}`
  return `233${digits}`
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const text = message.trim()
  const base = `https://wa.me/${phone}`
  if (!text) return base
  return `${base}?text=${encodeURIComponent(text)}`
}
