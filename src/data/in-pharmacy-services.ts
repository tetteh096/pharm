/**
 * Walk-in clinical services — listed on /service (no hero images; separate from scroll showcase).
 */

export type InPharmacyServiceCategory = {
  id: string
  label: string
  intro: string
}

export type InPharmacyService = {
  id: string
  title: string
  desc: string
  iconClass: string
  categoryId: string
}

export const inPharmacyServiceCategories: InPharmacyServiceCategory[] = [
  {
    id: "counselling",
    label: "Counselling & therapy",
    intro: "Licensed pharmacist guidance for safer, clearer medication use.",
  },
  {
    id: "monitoring",
    label: "Health monitoring",
    intro: "Quick walk-in checks to help you track key health markers.",
  },
  {
    id: "testing",
    label: "Diagnostic testing",
    intro: "On-site screening with pharmacist interpretation of results.",
  },
]

export const inPharmacyServices: InPharmacyService[] = [
  {
    id: "medication-counselling",
    title: "Medication Counselling",
    desc: "One-on-one guidance on doses, side effects, interactions, and how to take your medicines safely.",
    iconClass: "fas fa-comments",
    categoryId: "counselling",
  },
  {
    id: "mtm",
    title: "Medication Therapy Management",
    desc: "Structured review of your medicines — especially for chronic conditions — to improve outcomes and reduce risks.",
    iconClass: "fas fa-clipboard-list",
    categoryId: "counselling",
  },
  {
    id: "blood-pressure",
    title: "Blood Pressure Monitoring",
    desc: "Walk-in blood pressure checks with clear explanation of your reading and next steps if elevated.",
    iconClass: "fas fa-heartbeat",
    categoryId: "monitoring",
  },
  {
    id: "cholesterol",
    title: "Cholesterol Level Monitoring",
    desc: "Screening to help you understand cardiovascular risk and discuss lifestyle or referral options.",
    iconClass: "fas fa-chart-line",
    categoryId: "monitoring",
  },
  {
    id: "bmi",
    title: "BMI Checking",
    desc: "Body mass index measurement with practical weight-management advice from our pharmacy team.",
    iconClass: "fas fa-weight",
    categoryId: "monitoring",
  },
  {
    id: "malaria",
    title: "Malaria Testing",
    desc: "Rapid on-site malaria screening with results explained and treatment guidance when appropriate.",
    iconClass: "fas fa-bug",
    categoryId: "testing",
  },
  {
    id: "typhoid",
    title: "Typhoid Testing",
    desc: "In-pharmacy typhoid screening to support early diagnosis and timely care decisions.",
    iconClass: "fas fa-vial",
    categoryId: "testing",
  },
  {
    id: "syphilis",
    title: "Syphilis Testing",
    desc: "Confidential screening with discreet counselling and referral support if further care is needed.",
    iconClass: "fas fa-user-shield",
    categoryId: "testing",
  },
  {
    id: "hiv",
    title: "HIV Testing",
    desc: "Private, pharmacist-supported HIV screening with clear next steps and non-judgmental advice.",
    iconClass: "fas fa-ribbon",
    categoryId: "testing",
  },
  {
    id: "hb",
    title: "Haemoglobin (Hb) Testing",
    desc: "Quick Hb checks to screen for anaemia — useful for fatigue, pregnancy care, and chronic illness monitoring.",
    iconClass: "fas fa-tint",
    categoryId: "testing",
  },
]
