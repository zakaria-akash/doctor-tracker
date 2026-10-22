import { Suspense } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { TableSkeleton } from "@/components/data-table";
import { DoctorsView } from "@/features/doctors/components/doctors-view";

export const metadata = { title: "Doctors" };

// Keep the page shell server-rendered while URL-driven filters hydrate in a small client island.
export default function DoctorsPage() {
  return (
    <>
      <PageHeader
        title="Doctors"
        description="Manage doctors, their specializations and assigned patients."
      />
      {/* nuqs reads the browser URL, so its client boundary must remain inside Suspense. */}
      <Suspense fallback={<TableSkeleton columns={7} rows={10} />}>
        <DoctorsView />
      </Suspense>
    </>
  );
}
