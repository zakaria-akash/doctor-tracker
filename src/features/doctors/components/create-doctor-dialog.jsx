"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField, ResponsiveDialog, Spinner } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateDoctor } from "@/features/doctors/api";
import { applyServerErrors } from "@/lib/api/form-errors";
import { SPECIALIZATIONS } from "@/lib/constants";
import { doctorSchema, DOCTOR_DEFAULTS } from "@/lib/validations/doctor";

const selectClassName =
  "h-9 w-full rounded-md border bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:opacity-50";

// The dialog mirrors backend validation and maps duplicate-email conflicts onto the email field.
export function CreateDoctorDialog({ open, onOpenChange, hospitals = [] }) {
  const createDoctor = useCreateDoctor();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues: DOCTOR_DEFAULTS,
  });

  function changeOpen(nextOpen) {
    // Keep entered data while a request is running; reset only when a completed dialog closes.
    if (!nextOpen && createDoctor.isPending) return;
    if (!nextOpen) reset(DOCTOR_DEFAULTS);
    onOpenChange(nextOpen);
  }

  async function submit(values) {
    try {
      const response = await createDoctor.mutateAsync(values);
      toast.success(`${response.data.name} was added`);
      reset(DOCTOR_DEFAULTS);
      onOpenChange(false);
    } catch (error) {
      // Backend validation and 409 conflicts share one fieldErrors envelope.
      if (!applyServerErrors(error, setError)) {
        toast.error(error.message || "Could not add the doctor");
      }
    }
  }

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={changeOpen}
      title="Add doctor"
      description="Create a doctor profile and make it available for patient assignment."
    >
      <form className="space-y-4" onSubmit={handleSubmit(submit)} noValidate>
        <FormField id="doctor-name" label="Name" error={errors.name} required>
          <Input {...register("name")} placeholder="Dr. Ayesha Rahman" autoComplete="name" />
        </FormField>

        <FormField
          id="doctor-specialization"
          label="Specialization"
          error={errors.specialization}
          required
        >
          <select {...register("specialization")} className={selectClassName}>
            <option value="">Select specialization</option>
            {SPECIALIZATIONS.map((specialization) => (
              <option key={specialization} value={specialization}>
                {specialization}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="doctor-hospital" label="Hospital" error={errors.hospital} required>
          <Input
            {...register("hospital")}
            list="doctor-hospitals"
            placeholder="Dhaka Medical College Hospital"
            autoComplete="organization"
          />
        </FormField>
        {/* Existing hospitals are suggestions only; a new valid hospital name is still accepted. */}
        <datalist id="doctor-hospitals">
          {hospitals.map((hospital) => (
            <option key={hospital} value={hospital} />
          ))}
        </datalist>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="doctor-phone" label="Phone" error={errors.phone} required>
            <Input
              {...register("phone")}
              type="tel"
              placeholder="+880 1712 345678"
              autoComplete="tel"
            />
          </FormField>
          <FormField id="doctor-email" label="Email" error={errors.email} required>
            <Input
              {...register("email")}
              type="email"
              placeholder="ayesha@example.com"
              autoComplete="email"
            />
          </FormField>
        </div>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            disabled={createDoctor.isPending}
            onClick={() => changeOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createDoctor.isPending}>
            {createDoctor.isPending ? <Spinner label="Adding doctor" /> : null}
            {createDoctor.isPending ? "Adding…" : "Add doctor"}
          </Button>
        </div>
      </form>
    </ResponsiveDialog>
  );
}
