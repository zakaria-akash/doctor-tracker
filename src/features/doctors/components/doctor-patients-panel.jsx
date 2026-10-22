"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Filter, Plus, RotateCcw, Trash2, Users } from "lucide-react";
import { debounce } from "nuqs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ActiveFilters,
  DataTable,
  DataTablePagination,
  FilterSelect,
  SearchInput,
} from "@/components/data-table";
import {
  ConditionBadge,
  ConfirmDialog,
  EmptyState,
  ResponsiveDialog,
  StatusBadge,
} from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@/components/providers/user-provider";
import { doctorPatientsQuery, useDeleteDoctorPatient } from "@/features/doctors/api";
import { usePatientFilters } from "@/features/patients/use-patient-filters";
import { CONDITIONS, STATUSES, STATUS_LABELS } from "@/lib/constants";
import { AddDoctorPatientDialog } from "./add-doctor-patient-dialog";

const RemovePatientContext = createContext(null);

function displayDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : format(date, "dd MMM yyyy");
}

// Module-scoped definitions avoid rebuilding every cell renderer during search and pagination.
const PATIENT_COLUMNS = [
  {
    key: "patient",
    header: "Patient",
    cell: (patient) => (
      <div>
        <p className="font-semibold">{patient.name}</p>
        <p className="text-xs text-muted-foreground">
          {patient.age} years · {patient.gender}
        </p>
      </div>
    ),
  },
  {
    key: "condition",
    header: "Condition",
    cell: (patient) => <ConditionBadge value={patient.condition} />,
  },
  {
    key: "status",
    header: "Status",
    cell: (patient) => <StatusBadge value={patient.status} />,
  },
  {
    key: "admissionDate",
    header: "Admitted",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (patient) => displayDate(patient.admissionDate),
  },
  {
    key: "contact",
    header: "Contact",
    cell: (patient) => (
      <span className="text-sm text-muted-foreground">{patient.phone || patient.email || "—"}</span>
    ),
  },
  {
    key: "actions",
    header: <span className="sr-only">Actions</span>,
    className: "text-right",
    cell: (patient) => <RemovePatientButton patient={patient} />,
  },
];

// The panel scopes patient queries to the current doctor while keeping filters shareable in the URL.
export function DoctorPatientsPanel({ doctorId, doctorName }) {
  const router = useRouter();
  const user = useUser();
  const canEdit = user.role === "admin";
  const queryClient = useQueryClient();
  const { filters, setFilters, apiParams } = usePatientFilters();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [patientToRemove, setPatientToRemove] = useState(null);
  const removePatient = useDeleteDoctorPatient(doctorId);

  // The nested backend route already locks the doctor; memoization also keeps prefetch effects stable.
  const scopedParams = useMemo(
    () => ({
      page: apiParams.page,
      limit: apiParams.limit,
      search: apiParams.search,
      condition: apiParams.condition,
      status: apiParams.status,
      gender: apiParams.gender,
      minAge: apiParams.minAge,
      maxAge: apiParams.maxAge,
      from: apiParams.from,
      to: apiParams.to,
      sort: apiParams.sort,
    }),
    [
      apiParams.condition,
      apiParams.from,
      apiParams.gender,
      apiParams.limit,
      apiParams.maxAge,
      apiParams.minAge,
      apiParams.page,
      apiParams.search,
      apiParams.sort,
      apiParams.status,
      apiParams.to,
    ],
  );
  const patients = useQuery(doctorPatientsQuery(doctorId, scopedParams));
  const result = patients.data;

  // Prefetch the next scoped page once its existence is known.
  useEffect(() => {
    if (result?.meta?.hasNextPage) {
      queryClient.prefetchQuery(
        doctorPatientsQuery(doctorId, { ...scopedParams, page: scopedParams.page + 1 }),
      );
    }
  }, [doctorId, queryClient, result?.meta?.hasNextPage, scopedParams]);

  function updateFilter(key, value, options) {
    setFilters({ [key]: value || null, page: 1 }, options);
  }

  function resetFilters() {
    setFilters({
      page: 1,
      search: null,
      condition: null,
      status: null,
      gender: null,
      from: null,
      to: null,
      minAge: null,
      maxAge: null,
      sort: null,
    });
  }

  async function confirmRemoval() {
    if (!patientToRemove) return;
    try {
      await removePatient.mutateAsync(patientToRemove.id);
      toast.success(`${patientToRemove.name} was removed`);
      setPatientToRemove(null);
      // Refresh the server-rendered profile count after the client-side mutation succeeds.
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Could not remove the patient");
    }
  }

  const activeFilters = [
    filters.search && { key: "search", label: "Search", value: filters.search },
    filters.condition && { key: "condition", label: "Condition", value: filters.condition },
    filters.status && {
      key: "status",
      label: "Status",
      value: STATUS_LABELS[filters.status] ?? filters.status,
    },
  ];

  const filterControls = (
    <div className="grid gap-3 sm:grid-cols-2">
      <FilterSelect
        label="Condition"
        value={filters.condition}
        options={CONDITIONS}
        onChange={(value) => updateFilter("condition", value)}
      />
      <FilterSelect
        label="Status"
        value={filters.status}
        options={STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] }))}
        onChange={(value) => updateFilter("status", value)}
      />
    </div>
  );

  return (
    <RemovePatientContext value={canEdit ? setPatientToRemove : null}>
      <Card>
        <CardHeader className="gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <CardTitle>Patients</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Patients currently assigned to {doctorName}.
            </p>
          </div>
          {canEdit ? (
            <Button type="button" onClick={() => setAddOpen(true)}>
              <Plus aria-hidden="true" />
              Add patient
            </Button>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <SearchInput
              value={filters.search}
              onChange={(value) =>
                updateFilter(
                  "search",
                  value,
                  value ? { limitUrlUpdates: debounce(350) } : undefined,
                )
              }
              label="Search assigned patients"
              placeholder="Search patient name, condition or contact…"
            />
            <Button
              type="button"
              variant="outline"
              className="sm:hidden"
              onClick={() => setFiltersOpen(true)}
            >
              <Filter aria-hidden="true" />
              Filters
            </Button>
          </div>

          <div className="hidden rounded-lg border bg-muted/15 p-3 sm:block">{filterControls}</div>
          <ResponsiveDialog
            open={filtersOpen}
            onOpenChange={setFiltersOpen}
            title="Filter patients"
          >
            {filterControls}
          </ResponsiveDialog>
          <ActiveFilters filters={activeFilters} onClear={updateFilter} onClearAll={resetFilters} />

          {patients.isError && !result ? (
            <EmptyState
              icon={RotateCcw}
              title="Could not load patients"
              description={patients.error.message}
              action={
                <Button type="button" onClick={() => patients.refetch()}>
                  Retry
                </Button>
              }
            />
          ) : (
            <DataTable
              columns={PATIENT_COLUMNS}
              data={result?.data ?? []}
              isPending={patients.isPending}
              isFetching={patients.isFetching}
              caption={`Patients assigned to ${doctorName}`}
              getRowKey={(patient) => patient.id}
              renderMobileCard={(patient) => <PatientMobileCard patient={patient} />}
              emptyState={
                <EmptyState
                  icon={Users}
                  title="No patients found"
                  description={
                    activeFilters.some(Boolean)
                      ? "Try clearing the current patient filters."
                      : `No patients are assigned to ${doctorName} yet.`
                  }
                  action={
                    activeFilters.some(Boolean) ? (
                      <Button type="button" variant="outline" onClick={resetFilters}>
                        Clear filters
                      </Button>
                    ) : canEdit ? (
                      <Button type="button" onClick={() => setAddOpen(true)}>
                        <Plus aria-hidden="true" />
                        Add first patient
                      </Button>
                    ) : null
                  }
                />
              }
            />
          )}

          {result?.meta ? (
            <DataTablePagination
              meta={result.meta}
              disabled={patients.isFetching}
              onPageChange={(page) => setFilters({ page })}
              onLimitChange={(limit) => setFilters({ limit, page: 1 })}
              onPrefetchPage={(page) =>
                queryClient.prefetchQuery(doctorPatientsQuery(doctorId, { ...scopedParams, page }))
              }
            />
          ) : null}
        </CardContent>
      </Card>

      {canEdit ? (
        <AddDoctorPatientDialog
          doctorId={doctorId}
          doctorName={doctorName}
          open={addOpen}
          onOpenChange={setAddOpen}
          onAdded={() => router.refresh()}
        />
      ) : null}

      <ConfirmDialog
        open={Boolean(patientToRemove)}
        onOpenChange={(open) => !open && !removePatient.isPending && setPatientToRemove(null)}
        title="Remove patient?"
        description={
          patientToRemove
            ? `Remove ${patientToRemove.name} from ${doctorName}'s patient list? This permanently deletes the patient record.`
            : "This permanently deletes the patient record."
        }
        confirmLabel="Remove patient"
        pending={removePatient.isPending}
        onConfirm={confirmRemoval}
      />
    </RemovePatientContext>
  );
}

function RemovePatientButton({ patient }) {
  const requestRemove = useContext(RemovePatientContext);
  if (!requestRemove) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={`Remove ${patient.name}`}
      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
      onClick={() => requestRemove(patient)}
    >
      <Trash2 aria-hidden="true" />
    </Button>
  );
}

function PatientMobileCard({ patient }) {
  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{patient.name}</p>
          <p className="text-xs text-muted-foreground">
            {patient.age} years · {patient.gender}
          </p>
        </div>
        <RemovePatientButton patient={patient} />
      </div>
      <div className="flex flex-wrap gap-2">
        <ConditionBadge value={patient.condition} />
        <StatusBadge value={patient.status} />
      </div>
      <p className="text-xs text-muted-foreground">Admitted {displayDate(patient.admissionDate)}</p>
    </div>
  );
}
