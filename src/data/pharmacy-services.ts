/**
 * Shared pharmacy services copy for ServiceList, scroll showcase, etc.
 */

export interface PharmacyService {
  id: number;
  title: string;
  iconClass: string;
  image: string;
  desc: string;
  panelTitle: string;
  panelIntro: string;
  steps: { label: string; detail: string }[];
  note?: string;
}

export const pharmacyServices: PharmacyService[] = [
  {
    id: 1,
    title: "Prescription Dispensing",
    iconClass: "fas fa-prescription-bottle-alt",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1400&auto=format&fit=crop&q=85",
    desc: "FDA-compliant dispensing of prescribed medications. We verify, counsel, and dispense — no shortcuts.",
    panelTitle: "Prescription Medication Dispensing",
    panelIntro:
      "Every prescription we fill is verified by a licensed pharmacist. We source only from FDA-Ghana approved suppliers and counsel every patient before dispensing — especially for antibiotics, antihypertensives, and controlled medicines.",
    steps: [
      { label: "Present prescription", detail: "Bring your doctor's written prescription or e-prescription." },
      { label: "Pharmacist verification", detail: "We check drug interactions, dosage accuracy, and patient allergies before filling." },
      { label: "Dispensing", detail: "Medications are dispensed with correct labelling — dose, frequency, duration, storage." },
      { label: "Counselling", detail: "Our pharmacist explains how to take the medication, what to avoid, and signs of adverse effects." },
    ],
    note: "Madina branch open 24 hours for emergency prescription fills.",
  },
  {
    id: 2,
    title: "Pharmacist Consultation",
    iconClass: "fas fa-user-md",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1400&auto=format&fit=crop&q=85",
    desc: "One-on-one consultation with a certified pharmacist. Ask about medications, side effects, drug interactions, and more.",
    panelTitle: "One-on-One Pharmacist Consultation",
    panelIntro:
      "Our pharmacists are not just dispensers — they are your first line of healthcare. Book a private 15-minute consultation to discuss your medication regimen, manage chronic conditions, or get advice before visiting a doctor.",
    steps: [
      { label: "Choose your topic", detail: "Medication review, side-effect management, supplement advice, or chronic disease (diabetes, hypertension, asthma) counselling." },
      { label: "Private consultation", detail: "Held in our consultation room at Madina or Odorkor. Confidential and non-judgmental." },
      { label: "Personalised plan", detail: "You leave with clear written notes: what to take, when, and what to watch for." },
      { label: "Follow-up", detail: "Call or WhatsApp us on 055 461 2072 (Madina) for follow-up questions after your visit." },
    ],
    note: "Free for existing customers. Walk-in or book via phone.",
  },
  {
    id: 3,
    title: "Home & Office Delivery",
    iconClass: "fas fa-truck",
    image: "https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?w=1400&auto=format&fit=crop&q=85",
    desc: "Order from our online shop and get medications delivered quickly — with pharmacist support when you need it.",
    panelTitle: "Medication Delivery",
    panelIntro:
      "Can’t make it to the branch? Order through our shop and we’ll arrange delivery for eligible items in the Madina and Odorkor areas. Our team confirms your order and counsels you on safe use before dispatch.",
    steps: [
      { label: "Browse the shop", detail: "Find medicines and wellness products on our website." },
      { label: "Place your order", detail: "Add items to cart and complete checkout with your delivery details." },
      { label: "Pharmacist review", detail: "Prescription items are verified before they leave the pharmacy." },
      { label: "Delivery", detail: "Your order is prepared and sent to your address — call us if you have questions." },
    ],
    note: "Delivery availability may vary by product and location. Call 055 461 2072 (Madina) for same-day options.",
  },
  {
    id: 4,
    title: "Malaria Rapid Test",
    iconClass: "fas fa-microscope",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1400&auto=format&fit=crop&q=85",
    desc: "Fast, on-site malaria diagnostic using WHO-approved rapid test kits. Results in 15 minutes — no lab visit needed.",
    panelTitle: "Malaria Rapid Diagnostic Test (RDT)",
    panelIntro:
      "Malaria remains one of the most common illnesses in Ghana. Our pharmacists perform a certified rapid test in-store and give you results within 15 minutes, so you can start the right treatment immediately.",
    steps: [
      { label: "Walk in", detail: "No appointment needed. Visit either our Madina or Odorkor branch." },
      { label: "Finger-prick sample", detail: "A small blood drop is collected by a trained pharmacy technician." },
      { label: "15-minute result", detail: "The RDT strip detects Plasmodium falciparum antigens." },
      { label: "Pharmacist review", detail: "Our pharmacist explains the result and recommends ACT treatment if positive, or alternative diagnosis if negative." },
    ],
    note: "Cost: GH₵ 30. Available at both branches. Madina branch is open 24 hours.",
  },
  {
    id: 5,
    title: "Blood Sugar (Glucose) Test",
    iconClass: "fas fa-tint",
    image: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=1400&auto=format&fit=crop&q=85",
    desc: "Quick blood glucose screening for diabetes monitoring and early detection. Know your numbers in under 5 minutes.",
    panelTitle: "Blood Glucose Screening",
    panelIntro:
      "Unmanaged blood sugar is a silent threat. Whether you are monitoring existing diabetes or screening for pre-diabetes, our in-pharmacy glucose test gives you accurate, immediate readings with pharmacist interpretation.",
    steps: [
      { label: "Fasting or random", detail: "Tell us your last meal time. We record fasting or random glucose accordingly." },
      { label: "Glucometer test", detail: "A calibrated digital glucometer gives results in under 5 minutes." },
      { label: "Result interpretation", detail: "Normal: <7.8 mmol/L (random). Our pharmacist explains what your number means." },
      { label: "Lifestyle advice", detail: "Receive guidance on diet, exercise, and whether a doctor referral is needed." },
    ],
    note: "Cost: GH₵ 20. No appointment required.",
  },
  {
    id: 6,
    title: "Blood Pressure Check",
    iconClass: "fas fa-heartbeat",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1400&auto=format&fit=crop&q=85",
    desc: "Free walk-in blood pressure monitoring. Hypertension often shows no symptoms — check yours today.",
    panelTitle: "Walk-in Blood Pressure Monitoring",
    panelIntro:
      "Hypertension is called the 'silent killer' because most people feel fine until a crisis hits. We offer free blood pressure checks with a digital sphygmomanometer at both branches.",
    steps: [
      { label: "Sit and rest", detail: "You rest for 5 minutes in a quiet seat before the reading." },
      { label: "Dual-arm reading", detail: "We take readings on both arms and record the higher value." },
      { label: "Interpretation", detail: "Normal: <120/80 mmHg. Pre-hypertension: 120–139/80–89. Stage 1: ≥140/90." },
      { label: "Follow-up plan", detail: "If elevated, we advise lifestyle changes or refer you to a physician. Anti-hypertensive medications dispensed if prescribed." },
    ],
    note: "Free service. Available at both branches.",
  },
];
