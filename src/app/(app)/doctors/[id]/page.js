import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DoctorPatientsPanel } from "@/features/doctors/components/doctor-patients-panel";
import { DoctorProfileCard } from "@/features/doctors/components/doctor-profile-card";
import { DoctorProfileSkeleton } from "@/features/doctors/components/doctor-profile-skeleton";
import { serverFetch } from "@/lib/api/server";

export const metadata = { title: "Doctor profile" };

// Next 16 provides dynamic params as a Promise; resolving it below Suspense preserves the shell.
export default function DoctorPage({ params }) {
  return (
    <Suspense fallback={<DoctorProfileSkeleton />}>
      {params.then(({ id }) => (
        <DoctorProfile id={id} />
      ))}
    </Suspense>
  );
}

async function DoctorProfile({ id }) {
  // Reject malformed IDs locally and let the backend's authoritative 404 use the same boundary.
  if (!/^[a-f\d]{24}$/i.test(id)) notFound();

  const { data: doctor } = await serverFetch(`doctors/${id}`, { allow404: true });

  return (
    <div className="space-y-6">
      <DoctorProfileCard doctor={doctor} />
      <DoctorPatientsPanel doctorId={id} doctorName={doctor.name} />
    </div>
  );
}
