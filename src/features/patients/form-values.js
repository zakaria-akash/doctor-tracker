import { format } from "date-fns";

// Populate native form controls without converting an admission timestamp into a different day.
export function patientFormValues(patient) {
  return {
    name: patient.name ?? "",
    age: patient.age ?? "",
    gender: patient.gender ?? "",
    phone: patient.phone ?? "",
    email: patient.email ?? "",
    condition: patient.condition ?? "",
    status: patient.status ?? "stable",
    admissionDate: format(new Date(patient.admissionDate), "yyyy-MM-dd"),
    notes: patient.notes ?? "",
    doctor: typeof patient.doctor === "string" ? patient.doctor : (patient.doctor?.id ?? ""),
  };
}

// Only dirty fields become PATCH keys, preserving every untouched timestamp and server-owned field.
export function patientChanges(values, dirtyFields, rawValues) {
  return Object.fromEntries(
    Object.keys(dirtyFields)
      .filter((field) => dirtyFields[field])
      .map((field) => {
        if (field === "admissionDate") {
          // The date picker represents a local calendar date; parse its parts instead of UTC YYYY-MM-DD.
          const [year, month, day] = rawValues.admissionDate.split("-").map(Number);
          return [field, new Date(year, month - 1, day).toISOString()];
        }
        // Empty optional fields must survive JSON serialization so the backend can clear their old values.
        return [field, values[field] ?? ""];
      }),
  );
}
