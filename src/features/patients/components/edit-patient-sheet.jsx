"use client";

import { useEffect } from "react";
import { format } from "date-fns";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFormState, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  EmptyState,
  FormField,
  QueryFeedback,
  ResponsiveDialog,
  Spinner,
} from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { patientQuery, patientKeys, useUpdatePatient } from "@/features/patients/api";
import { patientChanges, patientFormValues } from "@/features/patients/form-values";
import { patientSchema } from "@/lib/validations/patient";
import { applyServerErrors } from "@/lib/api/form-errors";
import { CONDITIONS, GENDERS, STATUSES, STATUS_LABELS } from "@/lib/constants";

const selectClass =
  "h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50";

// This component is mounted only for admins; invalid URL IDs never cause a detail request.
export function EditPatientSheet({ id, onClose, doctors }) {
  const queryClient = useQueryClient();
  const updatePatient = useUpdatePatient();
  const validId = /^[a-f\d]{24}$/i.test(id);
  const patient = useQuery({
    ...patientQuery(id),
    enabled: validId,
    // A full list row gives an instant form; the detail request also supports copied deep links.
    initialData: () => {
      const cached = queryClient
        .getQueriesData({ queryKey: patientKeys.lists() })
        .flatMap(([, result]) => result?.data ?? [])
        .find((item) => item.id === id);
      return cached ? { success: true, data: cached } : undefined;
    },
    initialDataUpdatedAt: 0,
  });

  // Prevent dismissal during a write so success/failure cannot silently affect an abandoned form.
  function close() {
    if (!updatePatient.isPending) onClose();
  }

  return (
    <ResponsiveDialog
      open
      onOpenChange={(open) => {
        if (!open) close();
      }}
      title="Edit patient"
      description="Update patient details or assign a different doctor."
      contentClassName="md:inset-y-0 md:right-0 md:left-auto md:h-dvh md:max-h-dvh md:w-full md:max-w-xl md:translate-x-0 md:translate-y-0 md:rounded-none md:data-[state=open]:slide-in-from-right md:data-[state=closed]:slide-out-to-right"
    >
      {/* A stale cached row remains visible, but a failed detail refresh must be explicit. */}
      {patient.data && patient.isError ? (
        <QueryFeedback
          error={patient.error}
          onRetry={() => patient.refetch()}
          isFetching={patient.isFetching}
        />
      ) : null}
      {!validId || (patient.isError && !patient.data) ? (
        <EmptyState
          title={validId ? "Could not load patient" : "Invalid patient link"}
          description={
            validId ? patient.error.message : "Close this panel and select a patient from the list."
          }
          action={
            validId ? (
              <Button type="button" variant="outline" onClick={() => patient.refetch()}>
                Retry
              </Button>
            ) : (
              <Button type="button" onClick={close}>
                Close
              </Button>
            )
          }
        />
      ) : patient.data?.data ? (
        <PatientEditForm
          key={id}
          patient={patient.data.data}
          doctors={doctors}
          mutation={updatePatient}
          onClose={close}
        />
      ) : (
        <div className="flex min-h-40 items-center justify-center gap-2" role="status">
          <Spinner />
          Loading patient…
        </div>
      )}
    </ResponsiveDialog>
  );
}

// A separate keyed form gives each patient an independent dirty-field baseline.
function PatientEditForm({ patient, doctors, mutation, onClose }) {
  "use no memo";

  // RHF resets rebuild mutable field registrations; compiler-cached register props can become stale.
  // Opt out only this form so changes reliably update its dirty state after a cached/detail reset.
  const { register, handleSubmit, control, getValues, reset, setError } = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: patientFormValues(patient),
  });
  // Subscribe explicitly: React Compiler may preserve the form object's proxy across field updates.
  // A dedicated subscription keeps Save availability, sparse PATCH keys and errors reactive.
  const { errors, dirtyFields, isDirty } = useFormState({ control });
  const notes = useWatch({ control, name: "notes" }) ?? "";
  const currentDoctor = typeof patient.doctor === "string" ? patient.doctor : patient.doctor?.id;

  // Fresh detail data may replace an instant cached row, but must never overwrite an edit in progress.
  useEffect(() => {
    if (!isDirty) reset(patientFormValues(patient));
  }, [patient, isDirty, reset]);

  async function submit(values) {
    const changes = patientChanges(values, dirtyFields, getValues());
    if (!Object.keys(changes).length) {
      onClose();
      return;
    }
    try {
      await mutation.mutateAsync({ id: patient.id, values: changes });
      toast.success(`${values.name} updated`);
      onClose();
    } catch (error) {
      // Field errors stay beside controls; forbidden/network failures remain visible as a toast.
      if (!applyServerErrors(error, setError))
        toast.error(error.message || "Could not update patient");
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="space-y-4">
      {/* Disable the entire editable fieldset during submission to protect its dirty-field snapshot. */}
      <fieldset disabled={mutation.isPending} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="edit-patient-name" label="Patient name" error={errors.name} required>
            <Input {...register("name")} autoComplete="name" />
          </FormField>
          <FormField id="edit-patient-age" label="Age" error={errors.age} required>
            <Input {...register("age")} type="number" min="0" max="120" inputMode="numeric" />
          </FormField>
          <FormField id="edit-patient-gender" label="Gender" error={errors.gender} required>
            <select {...register("gender")} className={selectClass}>
              {GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {gender[0].toUpperCase() + gender.slice(1)}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            id="edit-patient-condition"
            label="Condition"
            error={errors.condition}
            required
          >
            <select {...register("condition")} className={selectClass}>
              {CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {condition}
                </option>
              ))}
            </select>
          </FormField>
          <FormField id="edit-patient-status" label="Status" error={errors.status} required>
            <select {...register("status")} className={selectClass}>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </FormField>
          <FormField
            id="edit-patient-admission"
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
          <FormField id="edit-patient-phone" label="Phone" error={errors.phone}>
            <Input {...register("phone")} type="tel" autoComplete="tel" />
          </FormField>
          <FormField id="edit-patient-email" label="Email" error={errors.email}>
            <Input {...register("email")} type="email" autoComplete="email" />
          </FormField>
        </div>
        {/* Preserve the existing doctor while dropdown options load or fail independently. */}
        <FormField
          id="edit-patient-doctor"
          label="Assigned doctor"
          description="Changing this moves the patient to the selected doctor's list."
          error={errors.doctor}
          required
        >
          <select {...register("doctor")} className={selectClass}>
            {!doctors.some((doctor) => doctor.value === currentDoctor) ? (
              <option value={currentDoctor}>{patient.doctor?.name ?? "Current doctor"}</option>
            ) : null}
            {doctors.map((doctor) => (
              <option key={doctor.value} value={doctor.value}>
                {doctor.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField
          id="edit-patient-notes"
          label="Notes"
          description={`${notes.length}/500 characters`}
          error={errors.notes}
        >
          <textarea
            {...register("notes")}
            maxLength={500}
            rows={4}
            className="w-full resize-y rounded-md border bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </FormField>
      </fieldset>
      {/* Pending and unchanged forms cannot submit duplicate or empty PATCH requests. */}
      <div className="flex justify-end gap-2 border-t pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending || !isDirty}>
          {mutation.isPending ? <Spinner label="Saving patient" /> : null}
          {mutation.isPending ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
