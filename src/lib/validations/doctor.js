import { z } from "zod";
import { SPECIALIZATIONS } from "@/lib/constants";

// This pattern intentionally mirrors the backend's accepted phone characters and length.
const phonePattern = /^\+?[0-9\s()-]{7,20}$/;

export const doctorSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(80, "Name is too long"),
  specialization: z.enum(SPECIALIZATIONS, { error: "Select a specialization" }),
  hospital: z
    .string()
    .trim()
    .min(2, "Hospital must be at least 2 characters")
    .max(120, "Hospital is too long"),
  phone: z.string().trim().regex(phonePattern, "Enter a valid phone number"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "Enter a valid email address" })),
});

// Stable defaults let React Hook Form reset cleanly after a successful create.
export const DOCTOR_DEFAULTS = {
  name: "",
  specialization: "",
  hospital: "",
  phone: "",
  email: "",
};
