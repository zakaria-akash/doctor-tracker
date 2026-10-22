"use client";

import { useState } from "react";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { Filter, Pencil, RotateCcw, Trash2, Users } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ActiveFilters,
  DataTable,
  DataTablePagination,
  DateRangeFilter,
  FilterSelect,
  SearchInput,
} from "@/components/data-table";
import {
  ConditionBadge,
  ConfirmDialog,
  EmptyState,
  QueryFeedback,
  ResponsiveDialog,
  StatusBadge,
} from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/components/providers/user-provider";
import { optionsQuery } from "@/features/doctors/api";
import { patientsQuery, useDeletePatient } from "@/features/patients/api";
import { usePatientFilters } from "@/features/patients/use-patient-filters";
import { CONDITIONS, GENDERS, STATUSES, STATUS_LABELS } from "@/lib/constants";
import { DoctorSelect } from "./doctor-select";
import { EditPatientSheet } from "./edit-patient-sheet";

// These values match the backend's accepted sort literals exactly.
const SORT_OPTIONS = [
  { value: "oldest", label: "Oldest first" },
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
  { value: "age_asc", label: "Age: youngest" },
  { value: "age_desc", label: "Age: oldest" },
];

// Both desktop rows and mobile cards use the same contact information and readable initials.
function PatientIdentity({ patient }) {
  const initials = patient.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return (
    <div className="flex min-w-48 items-center gap-3">
      <span
        aria-hidden="true"
        className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-sm font-semibold text-primary"
      >
        {initials}
      </span>
      <div className="min-w-0">
        <p className="font-semibold">{patient.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {patient.phone || patient.email || "No contact details"}
        </p>
        {patient.phone && patient.email ? (
          <p className="truncate text-xs text-muted-foreground">{patient.email}</p>
        ) : null}
      </div>
    </div>
  );
}

// Links preserve the doctor's profile route; deleted/unassigned relationships remain understandable.
function PatientDoctor({ doctor }) {
  return doctor?.id ? (
    <Link href={`/doctors/${doctor.id}`} className="hover:text-primary hover:underline">
      {doctor.name}
    </Link>
  ) : (
    <span className="text-muted-foreground">Unassigned</span>
  );
}

// Relative dates stay concise while the absolute local timestamp is available on hover and focus.
function AdmissionDate({ value }) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "—";
  return (
    <time
      dateTime={date.toISOString()}
      title={format(date, "dd MMM yyyy, HH:mm")}
      tabIndex={0}
      className="whitespace-nowrap text-muted-foreground"
    >
      {formatDistanceToNow(date, { addSuffix: true })}
    </time>
  );
}

// The URL holds filters and the selected editor, so a copied link reconstructs the same patient view.
export function PatientsView() {
  const user = useUser();
  const canEdit = user.role === "admin";
  const queryClient = useQueryClient();
  const { filters, setFilters, apiParams } = usePatientFilters();
  const [editId, setEditId] = useQueryState("edit", parseAsString);
  // Keep delete visibility in the URL so cached route state cannot reopen a stale local modal.
  const [removeId, setRemoveId] = useQueryState("remove", parseAsString);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const patients = useQuery(patientsQuery(apiParams));
  const options = useQuery(optionsQuery());
  const deletion = useDeletePatient();
  const result = patients.data;
  const doctors = (options.data?.data?.doctors ?? []).map((doctor) => ({
    value: doctor.id,
    label: doctor.name,
  }));

  // Every filter change returns to page one; zero is deliberately retained as a valid age.
  function updateFilter(key, value) {
    setFilters({ [key]: value === "" ? null : value, page: 1 });
  }
  function resetFilters() {
    setFilters({
      page: 1,
      search: null,
      condition: null,
      status: null,
      gender: null,
      doctor: null,
      minAge: null,
      maxAge: null,
      from: null,
      to: null,
      sort: null,
    });
  }
  function clearFilter(key) {
    if (key === "dates") setFilters({ from: null, to: null, page: 1 });
    else updateFilter(key, null);
  }

  // The confirmation stays open on failure, and the mutation hook restores optimistic rows.
  async function confirmDelete() {
    if (!deleteTarget || deletion.isPending) return;
    try {
      await deletion.mutateAsync(deleteTarget.id);
      toast.success(`${deleteTarget.name} deleted`);
      setDeleteTarget(null);
      setRemoveId(null);
      // Avoid stranding the user on an empty last page after deleting its final row.
      if (result?.data?.length === 1 && apiParams.page > 1)
        setFilters({ page: apiParams.page - 1 });
    } catch (error) {
      toast.error(error.message || "Could not delete patient");
    }
  }

  const activeFilters = [
    { key: "search", label: "Search", value: filters.search },
    { key: "condition", label: "Condition", value: filters.condition },
    { key: "status", label: "Status", value: STATUS_LABELS[filters.status] },
    { key: "gender", label: "Gender", value: filters.gender },
    {
      key: "doctor",
      label: "Doctor",
      value: filters.doctor
        ? (doctors.find((doctor) => doctor.value === filters.doctor)?.label ?? "Selected doctor")
        : null,
    },
    { key: "minAge", label: "Minimum age", value: filters.minAge },
    { key: "maxAge", label: "Maximum age", value: filters.maxAge },
    { key: "dates", label: "Admission dates", value: filters.from || filters.to ? true : null },
    {
      key: "sort",
      label: "Sort",
      value: SORT_OPTIONS.find((option) => option.value === filters.sort)?.label,
    },
  ];
  const activeCount = activeFilters.filter(
    (filter) => filter.value !== "" && filter.value != null,
  ).length;

  // The shared controls appear inline on desktop and in a focus-trapped filter drawer on mobile.
  const filterControls = (
    <div className="grid items-end gap-3 lg:grid-cols-3 xl:grid-cols-4">
      <FilterSelect
        label="Condition"
        value={filters.condition}
        options={CONDITIONS}
        onChange={(value) => updateFilter("condition", value)}
      />
      <FilterSelect
        label="Gender"
        value={filters.gender}
        options={GENDERS.map((gender) => ({
          value: gender,
          label: gender[0].toUpperCase() + gender.slice(1),
        }))}
        onChange={(value) => updateFilter("gender", value)}
      />
      <DoctorSelect
        doctors={doctors}
        value={filters.doctor}
        onChange={(value) => updateFilter("doctor", value)}
        disabled={options.isPending}
      />
      <div className="grid gap-1.5">
        <span className="text-xs text-muted-foreground">Admission date</span>
        <DateRangeFilter
          from={filters.from}
          to={filters.to}
          onChange={(dates) => setFilters({ ...dates, page: 1 })}
          label="Admission date"
        />
      </div>
      <label className="grid gap-1.5 text-xs text-muted-foreground">
        Minimum age
        <Input
          type="number"
          min="0"
          max={filters.maxAge ?? 120}
          value={filters.minAge ?? ""}
          onChange={(event) =>
            updateFilter(
              "minAge",
              event.target.value === ""
                ? null
                : Math.min(120, Math.max(0, Number(event.target.value))),
            )
          }
        />
      </label>
      <label className="grid gap-1.5 text-xs text-muted-foreground">
        Maximum age
        <Input
          type="number"
          min={filters.minAge ?? 0}
          max="120"
          value={filters.maxAge ?? ""}
          onChange={(event) =>
            updateFilter(
              "maxAge",
              event.target.value === ""
                ? null
                : Math.min(120, Math.max(0, Number(event.target.value))),
            )
          }
        />
      </label>
      <FilterSelect
        label="Sort"
        allLabel="Newest first"
        value={filters.sort === "newest" ? "" : filters.sort}
        options={SORT_OPTIONS}
        onChange={(value) => updateFilter("sort", value || "newest")}
      />
    </div>
  );

  // Role-aware controls are omitted entirely for viewers, including the editor's detail query.
  function actions(patient) {
    return canEdit ? (
      <div className="flex justify-end gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={`Edit ${patient.name}`}
          disabled={deletion.isPending}
          onClick={() => setEditId(patient.id)}
        >
          <Pencil aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          aria-label={`Delete ${patient.name}`}
          disabled={deletion.isPending}
          onClick={() => {
            setDeleteTarget(patient);
            setRemoveId(patient.id);
          }}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>
    ) : null;
  }
  const columns = [
    { key: "patient", header: "Patient", cell: (patient) => <PatientIdentity patient={patient} /> },
    {
      key: "age",
      header: "Age / Gender",
      cell: (patient) => `${patient.age} · ${patient.gender?.[0]?.toUpperCase() ?? "—"}`,
    },
    {
      key: "condition",
      header: "Condition",
      cell: (patient) => <ConditionBadge value={patient.condition} />,
    },
    { key: "status", header: "Status", cell: (patient) => <StatusBadge value={patient.status} /> },
    {
      key: "doctor",
      header: "Doctor",
      cell: (patient) => <PatientDoctor doctor={patient.doctor} />,
    },
    {
      key: "admission",
      header: "Admitted",
      cell: (patient) => <AdmissionDate value={patient.admissionDate} />,
    },
    ...(canEdit
      ? [{ key: "actions", header: <span className="sr-only">Actions</span>, cell: actions }]
      : []),
  ];

  return (
    <section className="space-y-4" aria-label="Patients directory">
      <div className="flex gap-3">
        <SearchInput
          value={filters.search}
          onChange={(value) => updateFilter("search", value)}
          label="Search patients"
          placeholder="Search name, condition, phone or email…"
        />
        <Button
          type="button"
          variant="outline"
          className="self-end lg:hidden"
          onClick={() => setFiltersOpen(true)}
        >
          <Filter aria-hidden="true" />
          Filters
          {activeCount ? (
            <span className="rounded-full bg-primary/10 px-1.5 text-xs text-primary">
              {activeCount}
            </span>
          ) : null}
        </Button>
      </div>
      {/* Pressed states expose the selected status to keyboard and screen-reader users. */}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Patient status">
        {["", ...STATUSES].map((status) => (
          <Button
            key={status || "all"}
            type="button"
            variant={filters.status === status ? "default" : "outline"}
            size="sm"
            aria-pressed={filters.status === status}
            onClick={() => updateFilter("status", status)}
          >
            {STATUS_LABELS[status] ?? "All statuses"}
          </Button>
        ))}
      </div>
      <div className="hidden rounded-xl border bg-card p-4 lg:block">{filterControls}</div>
      <ResponsiveDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title="Filter patients"
        description="Combine filters to find the patients you need."
      >
        {filterControls}
        <Button type="button" className="mt-4 w-full" onClick={() => setFiltersOpen(false)}>
          Show results
        </Button>
      </ResponsiveDialog>
      <ActiveFilters filters={activeFilters} onClear={clearFilter} onClearAll={resetFilters} />
      {options.isError ? (
        <p role="status" className="text-sm text-muted-foreground">
          Doctor options could not load.{" "}
          <button type="button" onClick={() => options.refetch()} className="underline">
            Retry doctor options
          </button>
        </p>
      ) : null}
      {filters.minAge != null && filters.maxAge != null && filters.minAge > filters.maxAge ? (
        <p role="alert" className="text-sm text-destructive">
          Minimum age must not exceed maximum age.
        </p>
      ) : null}
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
        <>
          <QueryFeedback
            error={patients.isError ? patients.error : null}
            onRetry={() => patients.refetch()}
            isFetching={patients.isFetching}
          />
          <DataTable
            columns={columns}
            data={result?.data ?? []}
            isPending={patients.isPending}
            isFetching={patients.isFetching}
            caption="Patients"
            announcement={
              result
                ? `${result.meta?.total ?? result.data.length} patients found`
                : "Loading patients"
            }
            renderMobileCard={(patient) => (
              <div className="space-y-3">
                <PatientIdentity patient={patient} />
                <div className="flex flex-wrap gap-2">
                  <ConditionBadge value={patient.condition} />
                  <StatusBadge value={patient.status} />
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Age / Gender</p>
                    <p>
                      {patient.age} · {patient.gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Doctor</p>
                    <PatientDoctor doctor={patient.doctor} />
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Admitted</p>
                    <AdmissionDate value={patient.admissionDate} />
                  </div>
                </div>
                {actions(patient)}
              </div>
            )}
            emptyState={
              <EmptyState
                icon={Users}
                title="No patients found"
                description="Try another search or clear your filters. Add new patients from a doctor's profile."
                action={
                  <Button type="button" variant="outline" onClick={resetFilters}>
                    Clear filters
                  </Button>
                }
              />
            }
          />
          {result?.meta ? (
            <DataTablePagination
              meta={result.meta}
              disabled={patients.isFetching}
              onPageChange={(page) => setFilters({ page })}
              onLimitChange={(limit) => setFilters({ limit, page: 1 })}
              onPrefetchPage={(page) =>
                queryClient.prefetchQuery(patientsQuery({ ...apiParams, page }))
              }
            />
          ) : null}
        </>
      )}
      {canEdit && editId ? (
        <EditPatientSheet id={editId} doctors={doctors} onClose={() => setEditId(null)} />
      ) : null}
      {canEdit ? (
        <ConfirmDialog
          open={Boolean(deleteTarget && deleteTarget.id === removeId)}
          onOpenChange={(open) => {
            if (!open && !deletion.isPending) {
              setDeleteTarget(null);
              setRemoveId(null);
            }
          }}
          title="Delete patient?"
          description={`Permanently delete ${deleteTarget?.name ?? "this patient"} and their care record? This cannot be undone.`}
          confirmLabel="Delete patient"
          pending={deletion.isPending}
          onConfirm={confirmDelete}
        />
      ) : null}
    </section>
  );
}
