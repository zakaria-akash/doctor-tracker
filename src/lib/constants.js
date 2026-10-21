// Keep these values aligned with the backend enums; they are API values, not display labels.
export const ROLES = ["admin", "viewer"];

export const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "ENT",
  "Gastroenterology",
  "General Medicine",
  "Gynecology",
  "Neurology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Urology",
];

export const CONDITIONS = [
  "Hypertension",
  "Diabetes",
  "Asthma",
  "Heart Disease",
  "Arthritis",
  "Migraine",
  "Fracture",
  "Skin Allergy",
  "Anxiety",
  "Thyroid Disorder",
  "Kidney Disease",
  "Respiratory Infection",
  "Other",
];

export const STATUSES = ["stable", "under_observation", "critical", "recovered"];
export const GENDERS = ["male", "female", "other"];
export const PAGE_SIZES = [10, 20, 50];

// Labels supplement color so status is understandable without relying on color alone.
export const STATUS_LABELS = {
  stable: "Stable",
  under_observation: "Under observation",
  critical: "Critical",
  recovered: "Recovered",
};

// Each status also has a matching light/dark badge style for quick visual scanning.
export const STATUS_STYLES = {
  stable: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  under_observation: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  critical: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  recovered: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
};
