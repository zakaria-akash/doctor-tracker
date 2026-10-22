# Doctor Tracker

Doctor Tracker is a Next.js frontend for a secure portal to manage doctors, their patients, and
analytics. The frontend talks to a separate Express API through a same-origin Next.js API bridge.

## Current progress

Phases 1–5 establish the frontend foundation, secure session flow, shared data layer, responsive
application shell, and Doctors module. Doctors can be searched, filtered, paginated and created;
each doctor profile supports adding and removing assigned patients. The Patients module and full
analytics dashboard remain for later phases.

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
- Removing a patient from a doctor's profile permanently deletes that patient record. Moving a
  patient between doctors will be handled by the later patient-editing workflow.

## Checks

```bash
npm run lint
npm run format:check
npm run build
```

Run `npm start` after a successful build to serve the production build locally.
