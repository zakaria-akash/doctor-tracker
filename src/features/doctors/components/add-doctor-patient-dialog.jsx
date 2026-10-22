"use client";

import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField, ResponsiveDialog, Spinner } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAddDoctorPatient } from "@/features/doctors/api";
import { applyServerErrors } from "@/lib/api/form-errors";
import { CONDITIONS, GENDERS, STATUSES, STATUS_LABELS } from "@/lib/constants";
import { doctorPatientSchema, DOCTOR_PATIENT_DEFAULTS } from "@/lib/validations/patient";

const selectClassName =
  "h-9 w-full rounded-md border bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50";
const textareaClassName =
  "min-h-24 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50";

// The doctor comes from the validated route and is deliberately omitted from the submitted body.
export function AddDoctorPatientDialog({ doctorId, doctorName, open, onOpenChange, onAdded }) {
  const addPatient = useAddDoctorPatient(doctorId);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(doctorPatientSchema),
    defaultValues: DOCTOR_PATIENT_DEFAULTS,
  });

  function changeOpen(nextOpen) {
    if (!nextOpen && addPatient.isPending) return;
    if (!nextOpen) reset(DOCTOR_PATIENT_DEFAULTS);
    onOpenChange(nextOpen);
  }

  async function submit(values) {
    try {
      const response = await addPatient.mutateAsync(values);
      toast.success(`${response.data.name} was assigned to ${doctorName}`);
      reset(DOCTOR_PATIENT_DEFAULTS);
      onOpenChange(false);
      onAdded?.();
    } catch (error) {
      if (!applyServerErrors(error, setError)) {
        toast.error(error.message || "Could not add the patient");
      }
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={changeOpen}
      title="Add patient"
      description={`Create a patient assigned to ${doctorName}.`}
      contentClassName="md:max-w-2xl"
    >
      <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
        {/* This read-only field explains the locked relationship without sending a spoofable ID. */}
        <FormField id="patient-doctor" label="Doctor" description="Locked to this profile">
          <Input value={doctorName} readOnly disabled />
        </FormField>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="patient-name" label="Patient name" error={errors.name} required>
            <Input {...register("name")} placeholder="Rahim Uddin" autoComplete="name" />
          </FormField>
          <FormField id="patient-age" label="Age" error={errors.age} required>
            <Input {...register("age")} type="number" min="0" max="120" inputMode="numeric" />
          </FormField>
          <FormField id="patient-gender" label="Gender" error={errors.gender} required>
            <select {...register("gender")} className={selectClassName}>
              <option value="">Select gender</option>
              {GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="patient-condition" label="Condition" error={errors.condition} required>
            <select {...register("condition")} className={selectClassName}>
              <option value="">Select condition</option>
              {CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="patient-status" label="Status" error={errors.status} required>
            <select {...register("status")} className={selectClassName}>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            id="patient-admission-date"
            label="Admission date"
            error={errors.admissionDate}
            required
          >
            <Input
              {...register("admissionDate")}
              type="date"
              max={format(new Date(), "yyyy-MM-dd")}
            />
          </FormField>
          <FormField id="patient-phone" label="Phone" error={errors.phone}>
            <Input {...register("phone")} type="tel" autoComplete="tel" />
          </FormField>
          <FormField id="patient-email" label="Email" error={errors.email}>
            <Input {...register("email")} type="email" autoComplete="email" />
          </FormField>
        </div>

        <FormField id="patient-notes" label="Notes" error={errors.notes}>
          <textarea
            {...register("notes")}
            className={textareaClassName}
            rows={3}
            maxLength={500}
            placeholder="Optional care notes"
          />
        </FormField>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={addPatient.isPending}
            onClick={() => changeOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={addPatient.isPending}>
            {addPatient.isPending ? <Spinner label="Adding patient" /> : null}
            {addPatient.isPending ? "Adding…" : "Add patient"}
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
