/** How a patient appears in dashboard lists and filters. */
export function getPatientTypeLabel(
  clientType: string,
  source: string | null | undefined
): string {
  if (clientType === "Chronic Client") return "Chronic Client"
  if (source === "Online order") return "Online"
  if (clientType === "Phone / Walk-in") return "Phone / Walk-in"
  if (clientType === "Walk-in" || source === "Walk-in") return "Walk-in"
  return clientType || "Regular"
}

export const PATIENT_TYPE_FILTER_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "Online", label: "Online" },
  { value: "Regular", label: "Regular" },
  { value: "Walk-in", label: "Walk-in" },
  { value: "Phone / Walk-in", label: "Phone / Walk-in" },
  { value: "Chronic Client", label: "Chronic Client" },
] as const
