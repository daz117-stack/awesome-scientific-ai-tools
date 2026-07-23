# Change Management Portal

An enterprise IT Change Management portal in the style used by large regulated banks: change requests move through
triage, risk assessment, and Change Advisory Board (CAB) approval before they can be scheduled, implemented, and
closed — with role-based access control, a full audit trail, and KPI/calendar reporting throughout.

> This is a standalone application scaffolded inside the `awesome-scientific-ai-tools` repository at the user's
> request. It is unrelated to that repository's curated-list content and lives entirely under this directory.

## Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS + Vite, React Router, Recharts
- **Backend:** Node.js + TypeScript + Express, Prisma ORM, Zod validation, JWT auth
- **Database:** PostgreSQL 16
- **Infra:** Docker Compose (Postgres + API + Nginx-served SPA)

## Architecture

```
change-management-portal/
├── backend/                 Express API (TypeScript)
│   ├── prisma/schema.prisma Data model (users, change requests, risk, CAB, audit, notifications)
│   └── src/
│       ├── modules/         One folder per domain: auth, users, changeRequests, cab, calendar, kpi, auditLogs, notifications
│       ├── middleware/      JWT auth, RBAC, audit logging, centralized error handling
│       └── config/          Env loading, Prisma client
├── frontend/                Vite + React SPA (TypeScript)
│   └── src/
│       ├── pages/           One page per route (login, dashboard, change requests, CAB, calendar, KPI, audit log)
│       ├── components/      Layout shell, workflow/risk/CAB widgets, shared UI primitives
│       ├── api/             Typed Axios clients per backend module
│       └── context/         Auth context (JWT session)
└── docker-compose.yml
```

### Domain model & workflow

A change request moves through an explicit state machine (`backend/src/modules/changeRequests/changeRequest.stateMachine.ts`):

```
DRAFT → SUBMITTED → RISK_ASSESSMENT → [CAB_REVIEW] → APPROVED → SCHEDULED → IN_PROGRESS → IMPLEMENTED → CLOSED
                                     ↘ (auto-approved if STANDARD type + LOW risk) ↗
CAB_REVIEW → REJECTED
any pre-implementation state → CANCELLED
```

- **Risk assessment** (`risk.util.ts`) scores impact × probability + urgency (1–5 each) into LOW/MEDIUM/HIGH/CRITICAL.
  Standard, low-risk changes skip CAB and auto-approve; everything else requires CAB review.
- **CAB approval** requires a quorum of 2 non-abstaining votes; any REJECT vote in that quorum rejects the change,
  otherwise it's approved. Votes, comments, and outcomes are all persisted.
- **Audit log**: every state transition, vote, and user-management action is written to an immutable `audit_logs`
  table with actor, action, and a JSON diff of what changed.
- **Notifications**: workflow transitions notify the relevant role (e.g. all Change Managers on submission, all CAB
  members when a review opens, the requester on approval/rejection/scheduling/implementation).
- **RBAC roles**: `REQUESTER`, `IMPLEMENTER`, `CHANGE_MANAGER`, `CAB_MEMBER`, `ADMIN`, `AUDITOR` — enforced per-route
  via `requireRole()` middleware, and mirrored in the frontend via `RoleGuard` / conditional workflow actions.

## Running locally with Docker Compose

```bash
cd change-management-portal
cp .env.example .env   # set a real JWT_SECRET
docker compose up --build
```

Then, once the backend container is healthy, apply the schema and seed demo data:

```bash
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npm run seed
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api
- Postgres: localhost:5432 (`cmp_user` / `cmp_password` / `change_management`)

## Running without Docker

**Backend**

```bash
cd backend
cp .env.example .env        # point DATABASE_URL at your own Postgres instance
npm install
npx prisma migrate deploy   # or `npx prisma migrate dev` for local iteration
npm run seed                # optional demo data
npm run dev                 # http://localhost:4000
```

**Frontend**

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173, proxies /api to localhost:4000
```

## Demo accounts

After running the seed script, every account below shares the password `ChangeMe123!`:

| Email | Role |
|---|---|
| admin@bank.example | Administrator |
| change.manager@bank.example | Change Manager |
| requester@bank.example | Requester |
| implementer@bank.example | Implementer |
| cab1@bank.example / cab2@bank.example | CAB Member |
| auditor@bank.example | Auditor |

## Notable design choices / trade-offs

- **No live-database verification in this environment**: the Docker daemon was unavailable when this was built, so
  the Prisma schema was validated via `prisma validate` and the initial migration SQL was generated via
  `prisma migrate diff --from-empty`, but end-to-end migration + seed against a running Postgres has not been
  exercised here. Run the Docker Compose steps above to do that.
- **CAB quorum is a fixed constant** (`QUORUM = 2` in `cab.service.ts`) rather than configurable per change — a real
  bank deployment would likely make this configurable per CAB or per risk tier.
- **Reference numbers** (`CHG-2026-00001`) are generated by counting existing rows per year, which is not race-safe
  under concurrent creates; a production system would use a DB sequence.
- **No email/SMS delivery** — notifications are in-app only (stored in Postgres, polled by the frontend). Wiring a
  real notification channel (SES, SendGrid, Twilio) would hang off `notification.service.ts`.
