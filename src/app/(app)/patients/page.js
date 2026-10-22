import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TableSkeleton } from "@/components/data-table";
import { PatientsView } from "@/features/patients/components/patients-view";

export const metadata = { title: "Patients" };

// Keep the route shell static while the URL-driven directory loads inside its client boundary.
export default function PatientsPage() {
  return (
    <>
      <PageHeader
        title="Patients"
        description="Find patients, review admissions and manage their care assignments."
      />
      {/* nuqs needs a Suspense boundary so reading query parameters does not block prerendering. */}
      <Suspense fallback={<TableSkeleton columns={7} rows={10} />}>
        <PatientsView />
      </Suspense>
    </>
  );
}
