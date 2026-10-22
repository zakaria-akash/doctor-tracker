"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Filter, Plus, RotateCcw, Stethoscope } from "lucide-react";
import { debounce, parseAsInteger, useQueryState } from "nuqs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ActiveFilters,
  DataTable,
  DataTablePagination,
  DateRangeFilter,
  FilterSelect,
  SearchInput,
} from "@/components/data-table";
import { EmptyState, ResponsiveDialog } from "@/components/feedback";
import { Button } from "@/components/ui/button";
import { SPECIALIZATIONS } from "@/lib/constants";
import { useUser } from "@/components/providers/user-provider";
import { doctorsQuery, optionsQuery } from "@/features/doctors/api";
import { DOCTOR_SORTS, useDoctorFilters } from "@/features/doctors/use-doctor-filters";
import { CreateDoctorDialog } from "./create-doctor-dialog";
import { DoctorAvatar } from "./doctor-avatar";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name_asc", label: "Name A–Z" },
  { value: "name_desc", label: "Name Z–A" },
];

function displayDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : format(date, "dd MMM yyyy");
}

// Columns stay at module scope so the table receives the same definitions on every render.
const DOCTOR_COLUMNS = [
  {
    key: "doctor",
    header: "Doctor",
    cell: (doctor) => (
      <div className="flex min-w-52 items-center gap-3">
        <DoctorAvatar name={doctor.name} specialization={doctor.specialization} />
        <div className="min-w-0">
          <Link
            className="font-semibold hover:text-primary hover:underline"
            href={`/doctors/${doctor.id}`}
          >
            {doctor.name}
          </Link>
          <p className="truncate text-xs text-muted-foreground">{doctor.email}</p>
        </div>
      </div>
    ),
  },
  {
    key: "specialization",
    header: "Specialization",
    cell: (doctor) => (
      <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
        {doctor.specialization}
      </span>
    ),
  },
  {
    key: "hospital",
    header: "Hospital",
    className: "max-w-52 truncate",
    cell: (doctor) => <span title={doctor.hospital}>{doctor.hospital}</span>,
  },
  {
    key: "phone",
    header: "Phone",
    cell: (doctor) => (
      <a
        className="whitespace-nowrap hover:text-primary hover:underline"
        href={`tel:${doctor.phone}`}
      >
        {doctor.phone}
      </a>
    ),
  },
  {
    key: "patients",
    header: "Patients",
    cell: (doctor) => (
      <span className="inline-flex min-w-8 justify-center rounded-full bg-muted px-2 py-1 text-xs font-semibold">
        {doctor.patientCount ?? 0}
      </span>
    ),
  },
  {
    key: "joined",
    header: "Joined",
    className: "whitespace-nowrap text-muted-foreground",
    cell: (doctor) => displayDate(doctor.createdAt),
  },
  {
    key: "actions",
    header: <span className="sr-only">Actions</span>,
    className: "text-right",
    cell: (doctor) => (
      <Button asChild variant="ghost" size="sm">
        <Link href={`/doctors/${doctor.id}`}>View</Link>
      </Button>
    ),
  },
];

// This client island owns URL state, remote caching, role-aware actions and responsive table controls.
export function DoctorsView() {
  const user = useUser();
  const canEdit = user.role === "admin";
  const queryClient = useQueryClient();
  const { filters, setFilters, apiParams } = useDoctorFilters();
  const [filtersOpen, setFiltersOpen] = useState(false);
  // Store the modal as `?new=1` so it remains deep-linkable and matches the project URL contract.
  const [createParam, setCreateParam] = useQueryState("new", parseAsInteger.withDefault(0));
  const createOpen = createParam === 1;
  const doctors = useQuery(doctorsQuery(apiParams));
  const options = useQuery(optionsQuery());

  const result = doctors.data;
  const optionData = options.data?.data;
  const hospitals = optionData?.hospitals ?? [];

  // Warm the next page as soon as its existence is known so pagination feels immediate.
  useEffect(() => {
    if (result?.meta?.hasNextPage) {
      queryClient.prefetchQuery(doctorsQuery({ ...apiParams, page: apiParams.page + 1 }));
    }
  }, [apiParams, queryClient, result?.meta?.hasNextPage]);

  function updateFilter(key, value, options) {
    setFilters({ [key]: value || null, page: 1 }, options);
  }

  function updateDates({ from, to }) {
    setFilters({ from, to, page: 1 });
  }

  function resetFilters() {
    setFilters({
      page: 1,
      search: null,
      specialization: null,
      hospital: null,
      from: null,
      to: null,
      sort: null,
    });
  }

  function clearFilter(key) {
    if (key === "dates") {
      setFilters({ from: null, to: null, page: 1 });
      return;
    }
    updateFilter(key, null);
  }

  const activeFilters = [
    filters.search && { key: "search", label: "Search", value: filters.search },
    filters.specialization && {
      key: "specialization",
      label: "Specialization",
      value: filters.specialization,
    },
    filters.hospital && { key: "hospital", label: "Hospital", value: filters.hospital },
    (filters.from || filters.to) && { key: "dates", label: "Registered date", value: true },
    filters.sort !== "newest" && {
      key: "sort",
      label: "Sort",
      value: SORT_OPTIONS.find((option) => option.value === filters.sort)?.label,
    },
  ];

  const filterControls = (
    <div className="grid gap-3 lg:grid-cols-4">
      <FilterSelect
        label="Specialization"
        value={filters.specialization}
        options={optionData?.specializations ?? SPECIALIZATIONS}
        onChange={(value) => updateFilter("specialization", value)}
      />
      <FilterSelect
        label="Hospital"
        value={filters.hospital}
        options={hospitals}
        onChange={(value) => updateFilter("hospital", value)}
      />
      <FilterSelect
        label="Sort"
        allLabel="Newest first"
        value={filters.sort === "newest" ? "" : filters.sort}
        options={SORT_OPTIONS.filter((option) => option.value !== "newest")}
        onChange={(value) => updateFilter("sort", value || "newest")}
      />
      <div className="grid content-end gap-1.5">
        <span className="text-xs text-muted-foreground">Registered date</span>
        <DateRangeFilter from={filters.from} to={filters.to} onChange={updateDates} />
      </div>
    </div>
  );

  // The first failed load replaces the table; background refresh failures keep existing rows visible.
  if (doctors.isError && !result) {
    return (
      <EmptyState
        icon={RotateCcw}
        title="Could not load doctors"
        description={doctors.error.message}
        action={
          <Button type="button" onClick={() => doctors.refetch()}>
            Retry
          </Button>
        }
      />
    );
  }

  return (
    <section className="space-y-4" aria-label="Doctors directory">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={filters.search}
          onChange={(value) =>
            updateFilter("search", value, value ? { limitUrlUpdates: debounce(350) } : undefined)
          }
          label="Search doctors"
          placeholder="Search name, specialization, hospital or email…"
        />
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="lg:hidden"
            onClick={() => setFiltersOpen(true)}
          >
            <Filter aria-hidden="true" />
            Filters
          </Button>
          {canEdit ? (
            <Button type="button" onClick={() => setCreateParam(1)}>
              <Plus aria-hidden="true" />
              Add doctor
            </Button>
          ) : null}
        </div>
      </div>

      {/* Desktop keeps filters in view; mobile moves the same controls into a focused bottom sheet. */}
      <div className="hidden rounded-xl border bg-card p-4 lg:block">{filterControls}</div>
      <ResponsiveDialog
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        title="Filter doctors"
        description="Narrow the directory using one or more filters."
      >
        <div className="space-y-4">{filterControls}</div>
      </ResponsiveDialog>

      <ActiveFilters filters={activeFilters} onClear={clearFilter} onClearAll={resetFilters} />

      <DataTable
        columns={DOCTOR_COLUMNS}
        data={result?.data ?? []}
        isPending={doctors.isPending}
        isFetching={doctors.isFetching}
        caption="Doctors"
        getRowKey={(doctor) => doctor.id}
        getRowHref={(doctor) => `/doctors/${doctor.id}`}
        renderMobileCard={(doctor) => <DoctorMobileCard doctor={doctor} />}
        emptyState={
          <EmptyState
            icon={Stethoscope}
            title="No doctors found"
            description="Try different filters, or reset the current search."
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
          disabled={doctors.isFetching}
          onPageChange={(page) => setFilters({ page })}
          onLimitChange={(limit) => setFilters({ limit, page: 1 })}
          onPrefetchPage={(page) => queryClient.prefetchQuery(doctorsQuery({ ...apiParams, page }))}
        />
      ) : null}

      {/* The URL-backed dialog is mounted only for admins; authorization is still enforced by the BFF. */}
      {canEdit ? (
        <CreateDoctorDialog
          open={createOpen}
          onOpenChange={(open) => setCreateParam(open ? 1 : null)}
          hospitals={hospitals}
        />
      ) : null}
    </section>
  );
}

function DoctorMobileCard({ doctor }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <DoctorAvatar name={doctor.name} specialization={doctor.specialization} />
        <div className="min-w-0">
          <p className="truncate font-semibold">{doctor.name}</p>
          <p className="truncate text-xs text-muted-foreground">{doctor.email}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <MobileFact label="Specialization" value={doctor.specialization} />
        <MobileFact label="Patients" value={doctor.patientCount ?? 0} />
        <MobileFact label="Hospital" value={doctor.hospital} className="col-span-2" />
      </div>
    </div>
  );
}

function MobileFact({ label, value, className = "" }) {
  return (
    <div className={className}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate font-medium">{value}</p>
    </div>
  );
}
