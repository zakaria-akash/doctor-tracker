import { format } from "date-fns";
import { z } from "zod";
import { CONDITIONS, GENDERS, STATUSES } from "@/lib/constants";

const phonePattern = /^\+?[0-9\s()-]{7,20}$/;
const objectIdPattern = /^[a-f\d]{24}$/i;

// Empty optional form controls should become undefined instead of failing validation.
const optionalPhone = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().trim().regex(phonePattern, "Enter a valid phone number").optional(),
);
const optionalEmail = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Enter a valid email address" }))
    .optional(),
);

const patientFields = {
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name is too long"),
  // Prevent an empty required field from becoming numeric zero through JavaScript coercion.
  age: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.coerce.number({ error: "Age is required" }).int("Age must be a whole number").min(0).max(120),
  ),
  gender: z.enum(GENDERS, { error: "Select a gender" }),
  phone: optionalPhone,
  email: optionalEmail,
  condition: z.enum(CONDITIONS, { error: "Select a condition" }),
  status: z.enum(STATUSES, { error: "Select a status" }),
  // Native date inputs represent local midnight; UTC parsing would reject today's date in UTC+ zones.
  admissionDate: z.preprocess(
    (value) => {
      if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
      const [year, month, day] = value.split("-").map(Number);
      return new Date(year, month - 1, day);
    },
    z.coerce
      .date({ error: "Choose an admission date" })
      .refine((date) => date <= new Date(), "Admission date cannot be in the future"),
  ),
  notes: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().trim().max(500, "Notes cannot exceed 500 characters").optional(),
  ),
};

// The dedicated patients form includes the doctor used for assignment/reassignment.
export const patientSchema = z.object({
  ...patientFields,
  doctor: z.string().regex(objectIdPattern, "Select a doctor"),
});

// A doctor profile fixes the doctor in the URL, so its add-patient form omits that field.
export const doctorPatientSchema = z.object(patientFields);

export const PATIENT_DEFAULTS = {
  name: "",
  age: "",
  gender: "",
  phone: "",
  email: "",
  condition: "",
  status: "stable",
  admissionDate: format(new Date(), "yyyy-MM-dd"),
  notes: "",
  doctor: "",
};

export const DOCTOR_PATIENT_DEFAULTS = Object.fromEntries(
  Object.entries(PATIENT_DEFAULTS).filter(([key]) => key !== "doctor"),
);
