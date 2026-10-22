import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, CalendarDays, Mail, MapPin, Phone, Stethoscope, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DoctorAvatar } from "./doctor-avatar";

function displayDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : format(date, "dd MMM yyyy");
}

// The server-rendered profile exposes the most useful doctor facts before client JS loads.
export function DoctorProfileCard({ doctor }) {
  return (
    <Card>
      <CardHeader className="gap-4 sm:grid-cols-[1fr_auto]">
        <div className="space-y-4">
          <Button asChild variant="ghost" size="sm" className="-ml-3 w-fit">
            <Link href="/doctors">
              <ArrowLeft aria-hidden="true" />
              Doctors
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            <DoctorAvatar
              name={doctor.name}
              specialization={doctor.specialization}
              className="size-14 text-lg"
            />
            <div className="min-w-0">
              <CardTitle className="truncate text-2xl">{doctor.name}</CardTitle>
              <p className="mt-1 flex items-center gap-2 text-sm text-primary">
                <Stethoscope className="size-4" aria-hidden="true" />
                {doctor.specialization}
              </p>
            </div>
          </div>
        </div>
        <div className="flex h-fit items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-primary">
          <Users className="size-5" aria-hidden="true" />
          <div>
            <p className="text-xl leading-none font-bold">{doctor.patientCount ?? 0}</p>
            <p className="mt-1 text-xs font-medium">Assigned patients</p>
          </div>
        </div>
      </CardHeader>

      {/* Contact links use native protocols so they remain useful on both desktop and mobile. */}
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ProfileFact icon={MapPin} label="Hospital" value={doctor.hospital} />
        <ProfileFact icon={Phone} label="Phone" value={doctor.phone} href={`tel:${doctor.phone}`} />
        <ProfileFact
          icon={Mail}
          label="Email"
          value={doctor.email}
          href={`mailto:${doctor.email}`}
        />
        <ProfileFact icon={CalendarDays} label="Joined" value={displayDate(doctor.createdAt)} />
      </CardContent>
    </Card>
  );
}

function ProfileFact({ icon: Icon, label, value, href }) {
  const content = href ? (
    <a className="text-sm font-medium break-words hover:text-primary hover:underline" href={href}>
      {value}
    </a>
  ) : (
    <p className="text-sm font-medium break-words">{value}</p>
  );

  return (
    <div className="flex gap-3 rounded-lg border bg-muted/30 p-3">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0">
        <p className="mb-1 text-xs text-muted-foreground">{label}</p>
        {content}
      </div>
    </div>
  );
}
