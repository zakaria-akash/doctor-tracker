<div align="center">

# 🩺 Doctor Tracker · Frontend

### A calmer workspace for the people coordinating care

**Find doctors. Keep patient records connected. See the bigger picture.**

<br />

![Next.js](https://img.shields.io/badge/Next.js-16.4.2-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-19-149ECA?style=for-the-badge&logo=react&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-3-22B5BF?style=for-the-badge)
![Status](https://img.shields.io/badge/status-live-16A34A?style=for-the-badge)
![Hosting](https://img.shields.io/badge/hosting-Hostinger_KVM_4_VPS-673DE6?style=for-the-badge&logo=hostinger&logoColor=white)

**Companion project:** Doctor Tracker REST API · Express 5 · MongoDB · maintained in a separate repository

</div>

---

> [!NOTE]
> **In plain English:** this is the web interface for a clinic operations tracker. Authorized staff can browse doctors and patients, keep assignments up to date, and review operational trends. It is a coordination tool—not an electronic medical record or a substitute for clinical judgment.

> [!TIP]
> **Live demo:** [doctor-tracker.58def4e4.nip.io](https://doctor-tracker.58def4e4.nip.io) · API docs: [doctor-tracker-api.58def4e4.nip.io/api/docs](https://doctor-tracker-api.58def4e4.nip.io/api/docs). On the sign-in page, choose **Use admin demo** or **Use viewer demo**. The demo runs on synthetic data, so please don't enter real patient information.

## 🧭 At a glance

| 👥 Who uses it                              | ✨ What they can do                                                       | 🔐 Who can change records                                |
| ------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------- |
| Clinic administrators and read-only viewers | Review dashboards, search and filter directories, inspect doctor profiles | Admins can create or edit records; viewers are read-only |

### The day-to-day workflow

1. **Sign in** to the workspace.
2. **Review the dashboard** for current clinic trends.
3. **Find a doctor or patient** with search and filters.
4. **Review profiles and assignments**, then make changes if authorized.
5. **Return to analytics** to see the latest overview.

### What is in the workspace

| 🟦 Dashboard                                                            | 🟩 Doctors                                                                     | 🟨 Patients                                                                               | 🟪 Settings                                                      |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| Five headline indicators and visual trends, with selectable date ranges | Search, filters, sorting, pagination, doctor profiles, and patient assignments | Search, filters, pagination, patient editing, doctor reassignment, and confirmed deletion | Browser-local appearance and default dashboard range preferences |

**Responsive by design:** the desktop sidebar becomes a mobile navigation drawer; wide data tables become compact cards where appropriate. Light and dark appearance are supported.

## 🏗️ How the pieces work together

1. A staff member uses the **Next.js website** in a browser.
2. The website sends same-origin requests through the **Next.js API bridge**; private server-rendered reads also call the API from the server.
3. The bridge forwards authorized requests to the **Express API**.
4. Express validates and authorizes the request before reading or updating **MongoDB**.
5. Developers can inspect the API contract in **Swagger** at `/api/docs`.

- **Session safety:** a signed session is stored in an HttpOnly cookie; browser JavaScript cannot read the JWT.
- **Access control:** Express is the final authority for identity, roles, validation, and data changes.
- **Interface state:** TanStack Query manages server data; URL-backed filters make useful views bookmarkable and shareable.
- **Settings scope:** personal preferences stay in this browser; they do not change shared clinic settings.

## 🌐 Live deployment

Since 22 October 2026, the app has been self-hosted on a Hostinger KVM 4 VPS (Ubuntu 24.04). It shares the server with other websites but stays isolated from them.

| Item          | Details                                                                                                                |
| ------------- | ---------------------------------------------------------------------------------------------------------------------- |
| 🖥️ Web app    | [doctor-tracker.58def4e4.nip.io](https://doctor-tracker.58def4e4.nip.io)                                               |
| 🔌 API · docs | [doctor-tracker-api.58def4e4.nip.io/api/docs](https://doctor-tracker-api.58def4e4.nip.io/api/docs)                     |
| 🧱 Stack      | Nginx (Let's Encrypt TLS, HTTP/2) → Next.js `next start` on loopback → Express on loopback → MongoDB 8 on loopback     |
| ⚙️ Operations | Two sandboxed systemd services, health-checked releases with automatic rollback, and nightly verified database backups |

The browser only ever talks to the web host: Nginx forwards every path to Next.js, whose same-origin bridge calls the API privately on the server. The [deployment record](VPS_DEPLOYMENT_AND_MIGRATION_PLAN.md) documents the setup, the Atlas → VPS data migration, the verification results, and how to deploy or roll back a release.

## 🚀 Run locally

### Prerequisites

- Node.js `24.x` and npm
- The companion backend API running in development mode (see its repository README for setup)
- A backend development database configured and seeded if you want realistic demo records

### Start the frontend

```bash
npm ci
```

Create `.env.local` from the safe template:

```powershell
Copy-Item .env.example .env.local
```

```bash
cp .env.example .env.local
```

Set `API_URL` to the backend API base URL. Configure the same `JWT_SECRET`, `JWT_ISSUER`, and `JWT_AUDIENCE` values in both projects. Use a strong secret locally, never commit it, and do not paste credentials into an issue or README.

```bash
npm run dev
```

Open the URL printed by `npm run dev`. Sign-in and live records require the backend to be available.

| Command                | What it does                            |
| ---------------------- | --------------------------------------- |
| `npm run dev`          | Start Next.js in development mode       |
| `npm run lint`         | Check JavaScript and JSX with ESLint    |
| `npm run format:check` | Check formatting with Prettier          |
| `npm run build`        | Create the optimized production build   |
| `npm start`            | Serve a previously built production app |

## 🧩 Main routes and source map

| Route                        | Purpose                                                                  | Access           |
| ---------------------------- | ------------------------------------------------------------------------ | ---------------- |
| `/`                          | Public landing-page component exists; see the current routing note below | Public by design |
| `/login`                     | Sign in to the workspace                                                 | Public           |
| `/dashboard`                 | Analytics overview                                                       | Signed-in users  |
| `/doctors` · `/doctors/[id]` | Doctor directory and profile                                             | Signed-in users  |
| `/patients`                  | Patient directory and record actions                                     | Signed-in users  |
| `/settings`                  | Personal appearance and dashboard defaults                               | Signed-in users  |

```text
src/
├── app/                 Routes, layouts, server-rendered pages, and API bridge
├── components/          Shared navigation, tables, feedback, providers, and UI primitives
├── features/
│   ├── dashboard/       KPI cards, charts, range controls, and loading states
│   ├── doctors/         Directory, profiles, and doctor-related interactions
│   ├── patients/        Directory, filtering, and record editing
│   └── settings/        Browser-local user preferences
├── hooks/               Small reusable browser and date helpers
└── lib/                 API clients, authentication, validation, and shared utilities
```

## 🧠 Two important design choices

### 1. A server-side bridge for sessions and API calls

The browser uses the frontend's own origin; Next.js forwards requests to Express. This keeps API credentials and JWT handling on the server and avoids exposing the session token to browser scripts. Express still validates every protected request and enforces administrator/viewer permissions.

### 2. Match state to its job

| State                                        | Tool                  | Benefit                                                     |
| -------------------------------------------- | --------------------- | ----------------------------------------------------------- |
| Server data                                  | TanStack Query        | Request deduplication, caching, and mutation feedback       |
| Search, filters, pagination, dashboard range | URL state (`nuqs`)    | Refreshable, bookmarkable views and browser history         |
| Form input                                   | React Hook Form + Zod | Consistent client-side validation and useful error messages |

## ✅ Quality checks

Run these before sharing a change or preparing a release:

```bash
npm run lint
npm run format:check
npm run build
```

For a complete manual review, test both roles; create, edit, reassign, and delete only disposable demo records; exercise filters and dashboard ranges; and check keyboard navigation and narrow mobile widths. The frontend build alone does not verify a live backend connection.

## 🛡️ Privacy and safe use

- Use synthetic or approved test data during development; do not place real patient data in screenshots, public repositories, or demo environments.
- Keep `.env.local` private. Rotate any secret that has been disclosed outside its intended secret store.
- The API is the source of truth for access control. Hiding a button in the interface is not a security boundary.
- Any new environment needs HTTPS, trusted proxy headers, backups, and private environment secrets. The [deployment record](VPS_DEPLOYMENT_AND_MIGRATION_PLAN.md) shows how the live server provides them.

## 🗺️ Current notes

- **Public landing route:** `src/app/page.js` contains a public-facing landing page, but `next.config.mjs` currently redirects `/` to `/dashboard`. Remove or change that redirect when the marketing page should be the public entry point.
- **Settings scope:** preferences are local to one browser. Clinic-wide settings require backend storage and authorization work.
- **Deployment evidence:** the live site passed external HTTPS checks and real-browser tests on desktop and mobile on 22 October 2026 (see the [deployment record](VPS_DEPLOYMENT_AND_MIGRATION_PLAN.md)). UI screenshots are not committed yet.
- **Data meaning:** dashboard counts and records reflect the configured API database. Local development and the public demo both use synthetic data. Anyone with the public demo accounts can change it, and nightly backups allow a restore.
- **App icons:** `src/app/icon.svg` (a white stethoscope on deep blue) is the source of the tab icon. `favicon.ico` (16/32/48 px) and `apple-icon.png` (180 px) are rendered from it, so regenerate them if the SVG changes.

## 🔗 Project links

- [Live web app](https://doctor-tracker.58def4e4.nip.io) · [Live API docs](https://doctor-tracker-api.58def4e4.nip.io/api/docs)
- Backend API README: in the separate `doctor-tracker-backend` repository
- [VPS deployment and migration record](VPS_DEPLOYMENT_AND_MIGRATION_PLAN.md)
- [Frontend implementation runbook](RUNBOOK.md)

<div align="center">

**Built for clearer coordination—and with careful attention to privacy. 💙**

</div>
