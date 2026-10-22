# Doctor Tracker

Doctor Tracker is a Next.js frontend for a secure portal to manage doctors, their patients, and
analytics. The frontend talks to a separate Express API through a same-origin Next.js API bridge.

## Current progress

Phases 1–8 cover the frontend foundation, secure session flow, responsive application shell,
Doctors and Patients modules, and analytics dashboard. Doctors can be searched, filtered,
paginated and created; each doctor profile supports adding and removing assigned patients.
Patients have shareable filters, an edit sheet with doctor reassignment, and confirmed deletion.
The dashboard displays five KPI cards and five charts from one analytics request per selected range.
Meaningful code blocks include comments explaining state, API contracts and accessibility choices.

## Setup

1. Use Node.js 24 and install dependencies with `npm ci`.
2. Copy `.env.example` to `.env.local` if it does not already exist.
3. Set `API_URL` to the Express API URL and use the same `JWT_SECRET`, `JWT_ISSUER`, and
   `JWT_AUDIENCE` as the backend. Keep `.env.local` private and use a strong secret.
4. Run `npm run dev` and open <http://localhost:3000>.

The frontend can be built without a running backend, but signing in and loading real data require
the configured API to be available. Passwords are not stored; the session uses an HttpOnly cookie.
The demo sign-in buttons are for seeded demo accounts, not real patient data.

For production, keep Next.js behind a trusted reverse proxy that sets `Host` and
`X-Forwarded-Proto`; the API bridge uses those headers to check request origins.

## Current assumptions

- Every patient belongs to exactly one doctor.
- Removing a patient permanently deletes that record. Use the Patients edit sheet to reassign
  the patient to another doctor instead.
- Dashboard totals for doctors, patients, critical patients and average patients per doctor are
  all-time/current values. Admissions, trends, top doctors, conditions and statuses use the selected
  range; the specialization chart covers all doctors. Labels distinguish these scopes.
- Frontend work does not modify the separate backend project. Real-data testing requires a running
  backend with matching authentication settings.

## Checks

```bash
npm run lint
npm run format:check
npm run build
```

Run `npm start` after a successful build to serve the production build locally.

## Phases 6–8: quick manual test

1. Sign in as an admin and open `/patients`. Try search, condition/status/gender, doctor, admission
   dates and age filters. Check pagination, reset filters, and reload a filtered URL.
2. Edit a patient: change one field, clear an optional contact field, and reassign the doctor.
   Save and confirm the list/profile reflect the changes. Reload a URL containing `?edit=<patient-id>`
   to check direct access to the editor. An unchanged admission date must stay unchanged.
3. Cancel a deletion first, then confirm deletion of a disposable test patient. Interrupt the API
   during a deletion to check error feedback and restoration of the optimistic row.
4. Open `/dashboard` and select each date range. Check the five KPI cards, all five charts,
   empty-data messages, and range persistence after reload.
5. Repeat as a viewer: lists and charts remain available; create/edit/delete controls are hidden.
6. At phone and tablet widths, test navigation/filter drawers, card layouts and edit sheets.
   Check light/dark themes, Tab navigation, Escape, focus returning after dialogs, and reduced motion.

Before deployment, run Lighthouse against `npm start` with representative data. The runbook targets
Performance ≥ 90, Accessibility ≥ 95 and Best Practices ≥ 95; these are targets, not certified scores.

Verified for this phase: lint, formatting and production build, plus production-browser smoke checks
using an isolated synthetic API. Checks covered sparse edits, optional-field clearing, reassignment,
delete rollback/success, dashboard range requests and empty states, viewer restrictions, theme switching,
375px layouts and dialog keyboard focus. Real-backend integration and Lighthouse remain deployment checks.
