# AcadTrack — Official Platform Blueprint

Status: **Official reference document** for AcadTrack development.
Version: 1.0 · Owner: AcadTrack team · Scope: product definition, current codebase audit, target architecture, and the full production plan.

This document is the single source of truth for future development. Any change to architecture, database, hosting, or scope should be made by updating this file first.

---

## 1. What AcadTrack is

AcadTrack is a multilingual **academic tracking platform (SaaS) for universities**, designed first around the Algerian university model (initial reference: Université Batna 1 — El Hadj Lakhdar, Psychology Department). It replaces scattered spreadsheets, paper attendance sheets and WhatsApp groups with one system where students, professors and department heads see the same, up-to-date academic reality.

### Core value
- **Students** always know their attendance rate, grades, modules, schedule and warnings.
- **Professors** take attendance, enter grades, manage sessions and generate exams with minimal clicks.
- **Department heads** get live analytics on attendance, results, teaching load and at-risk students, plus activity logs and reporting.
- **Platform admins** manage universities, tenants, subscriptions and system health.

### Roles (already modelled in the prototype)
| Role | Key | Purpose |
|---|---|---|
| Student | `student` | Personal academic tracking |
| Professor | `teacher` | Sessions, attendance, grades, exams |
| Department Head / Admin | `admin` | Department-wide management and analytics |
| Platform Admin | `platform-admin` | Global multi-university administration |
| Demo | `demo` | Guided, data-safe showcase mode |

### Functional modules (present as pages today)
- **Auth & onboarding**: login, signup, role selection, demo mode.
- **Student area**: dashboard, grades, modules, schedule, reports, messages, profile, settings.
- **Professor area**: dashboard, sessions (attendance), grades entry, exam generator, reports, messages, profile.
- **Department admin area**: dashboard, users, departments/specialties, monitoring, analytics, reports, activity logs, messages, settings, profile.
- **Exam generator**: builds exam papers/question sets from module content.
- **Communication**: internal messaging, contact and admin-contact forms.
- **Public site**: home, features, about, tutorials, help center, platform presentation, subscribe (pricing/plans).
- **Internationalisation**: English / French / Arabic with full RTL support (`acadtrack-lang` preference).

---

## 2. Current codebase audit (`uns2026/Acadtrack-beta`)

### Structure
```
/index.html, /home.html      Public landing page (identical content)
/404.html                    Not-found page
/favicon.ico
/assets/css/theme.css        Shared design system (~19 KB)
/assets/js/app.js            Shared runtime: i18n, role/session, demo users
/p/*.html                    35 application pages (student, teacher, dept-admin, public)
```

### Technologies used today
- **Static HTML/CSS/vanilla JavaScript**, exported from a Blogger theme (Blogger widget markup and IDs are still present in the HTML).
- **Tailwind-free hand-written CSS** design system in `theme.css`; Font Awesome 6.4 and Google Fonts (Cairo) from CDN.
- **Client-side i18n** via `data-i18n-key` attributes and language switch stored in `localStorage`.
- **`localStorage` as a mock database**: `acadtrack_currentUser`, `acadtrack_demoMode`, `acadtrack_users`, `students`, `modules`, `groups`, `specialties`, `sessions`, `attendance`, `grades`, `reports`, `messages`, `acadtrack_monitoring_logs`, notification prefs.
- **Hard-coded demo users** in `app.js` (`demoUsers`) for each role.

### Honest assessment
It is a **high-fidelity, fully navigable UI prototype** — not yet a working product.

Limitations that must be resolved for production:
1. **No backend, no database, no real authentication or authorisation** — anyone can set a role in `localStorage`.
2. **No multi-tenancy**: one hard-coded university/department.
3. **Massive duplicated HTML** (each page 100–600 KB, header/nav/translations copy-pasted 35 times) — unmaintainable and slow.
4. **Inline scripts and styles** everywhere; no build step, no bundling, no tests, no CI.
5. **Data is per-browser**: nothing is shared between users, nothing survives a cleared browser.
6. **No privacy/compliance layer** for student records (grades and attendance are sensitive personal data).

---

## 3. Target architecture (recommended)

**Stack decision: Supabase (data + auth + storage) + Cloudflare (hosting, edge, CDN, protection).**

```
                      ┌──────────────────────────────────────────┐
   Users (web/PWA) ──▶ │ Cloudflare: DNS, CDN, WAF, Bot Mgmt,     │
                      │ Turnstile, Cache, Rate limiting          │
                      └───────────────┬──────────────────────────┘
                                      ▼
                      ┌──────────────────────────────────────────┐
                      │ App: React + TypeScript (Vite) SSR on    │
                      │ Cloudflare Workers  (TanStack Start)     │
                      │  · server functions = the backend API    │
                      │  · /api/public/* = webhooks & cron       │
                      └───────┬───────────────────────┬──────────┘
                              ▼                       ▼
                ┌──────────────────────────┐  ┌───────────────────────┐
                │ Supabase                 │  │ Cloudflare add-ons    │
                │ · Postgres (+RLS)        │  │ · R2 (exports/backups)│
                │ · Auth (email, OAuth,    │  │ · KV (config/flags)   │
                │   MFA, magic link)       │  │ · Queues (jobs)       │
                │ · Storage (files/avatars)│  │ · Cron triggers       │
                │ · Realtime (live boards) │  │ · Images (avatars)    │
                │ · pg_cron / Edge for jobs│  │ · Analytics/Logpush   │
                └──────────────────────────┘  └───────────────────────┘
```

### Frontend
- **React 19 + TypeScript + Vite**, **TanStack Router/Start** for file-based routing and SSR (SEO for the public marketing pages, fast app shell for dashboards).
- **Tailwind CSS v4 + shadcn/ui**, with `theme.css` tokens ported into semantic design tokens so the current visual identity is preserved.
- **i18n**: `i18next` + `react-i18next`, JSON catalogues per locale (`en`, `fr`, `ar`) extracted from existing `data-i18n-key` attributes; `dir="rtl"` handled at the layout level.
- **Data layer**: TanStack Query with Supabase; realtime subscriptions for live attendance/messages.
- **Charts**: Recharts. **PDF/Excel exports**: server-side generation (see §7).
- **PWA**: installable, offline attendance-taking with a local queue that syncs when back online (critical for weak campus Wi-Fi).

### Backend
- **Server functions on Cloudflare Workers** (co-located with the frontend) for all business logic: attendance rules, grade computation (moyenne, coefficients, credits, rattrapage), exam generation, report building, notification fan-out.
- **`/api/public/*` routes** for external callers: payment webhooks, email/SMS webhooks, cron endpoints, university SIS imports — every one signature-verified.
- **Supabase is never called directly from the browser for sensitive writes**; browser reads go through RLS-protected policies only.

### Why this stack
- Cloudflare gives global low latency (important for Algeria/MENA), free-tier-friendly bandwidth, DDoS/WAF protection and a single deploy target.
- Supabase gives Postgres with row-level security — the right primitive for multi-tenant academic data — plus auth, storage and realtime without operating servers.
- Both have generous startup pricing and a clear exit path (Postgres is portable; Workers code is standard JS).

### Professional alternatives (for the record)
| Layer | Recommended | Strong alternatives | When to switch |
|---|---|---|---|
| Hosting | Cloudflare Workers/Pages | Vercel, Netlify, Fly.io | Need Node-only libs or long-running jobs |
| Database | Supabase Postgres | Neon, Railway Postgres, AWS RDS/Aurora, self-hosted Postgres | Data-residency law requires local hosting |
| Auth | Supabase Auth | Clerk, Auth0, Keycloak (self-host), university SSO via SAML/Shibboleth | University demands SSO/LDAP integration |
| Files | Supabase Storage + Cloudflare R2 | AWS S3, Backblaze B2 | Very large media volumes |
| Jobs/queues | Cloudflare Queues + Cron, pg_cron | Inngest, Trigger.dev, Temporal | Complex multi-step workflows |
| Email | Resend | Postmark, SendGrid, Amazon SES | High volume / deliverability tuning |
| SMS/WhatsApp | Twilio | Vonage, local Algerian SMS gateway | Local number/cost requirements |
| Payments | Stripe (intl.) | Paddle (merchant of record), local bank/CIB/Edahabia integration, offline invoicing | Algerian institutional purchasing is invoice-based |
| Errors/monitoring | Sentry | Better Stack, Datadog, Grafana Cloud | Deeper infra observability |
| Analytics | Cloudflare Web Analytics + PostHog | Plausible, Matomo (self-host) | Privacy/self-hosting requirement |
| Search | Postgres full-text | Meilisearch, Typesense, Algolia | Large catalogues, fuzzy search |
| AI (exam generator) | Lovable AI Gateway / OpenAI | Anthropic, Mistral, Azure OpenAI | Cost or data-residency constraints |

---

## 4. Suggested database schema (Supabase Postgres)

Multi-tenant by `university_id`, with department scoping. All tables in `public`, **RLS enabled**, explicit `GRANT`s, and roles stored in a **separate** `user_roles` table (never on profiles).

### Identity & tenancy
- `universities` (id, name, code, country, locale_default, logo_url, settings jsonb, created_at)
- `academic_years` (id, university_id, label `2025/2026`, starts_on, ends_on, is_current)
- `semesters` (id, academic_year_id, index 1|2, starts_on, ends_on)
- `departments` (id, university_id, name, code, head_user_id)
- `specialties` (id, department_id, name, level `L1..M2|PhD`, code)
- `groups` (id, specialty_id, semester_id, name `L3 Psycho Clinique G1`, capacity)
- `profiles` (id → auth.users, university_id, first_name, last_name, display_name, email, phone, avatar_url, locale, status)
- `user_roles` (id, user_id, university_id, department_id, role `app_role` enum: `student|teacher|dept_admin|platform_admin`, unique(user_id, role, university_id, department_id))
- `students` (id, profile_id, student_number, specialty_id, group_id, enrollment_year, status `active|repeating|suspended|graduated`)
- `teachers` (id, profile_id, grade/title, department_id, hire_date)

### Academics
- `modules` (id, specialty_id, semester_id, name, code, coefficient, credits, exam_weight, td_weight, type `cours|td|tp`)
- `module_assignments` (id, module_id, teacher_id, group_id, role `lecturer|td|tp`)
- `schedules` (id, group_id, module_id, teacher_id, room, weekday, starts_at, ends_at, recurrence, valid_from, valid_to)
- `sessions` (id, module_id, teacher_id, group_id, scheduled_at, duration_min, room, type, status `planned|held|cancelled`, notes)
- `attendance` (id, session_id, student_id, status `present|absent|late|excused`, justified bool, justification_file_id, recorded_by, recorded_at, unique(session_id, student_id))
- `absence_justifications` (id, student_id, session_id, file_id, reason, status `pending|approved|rejected`, reviewed_by, reviewed_at)
- `evaluations` (id, module_id, group_id, kind `td|tp|interro|exam|rattrapage`, weight, max_score, date, published bool)
- `grades` (id, evaluation_id, student_id, score, comment, entered_by, entered_at, unique(evaluation_id, student_id))
- `module_results` (id, student_id, module_id, semester_id, td_avg, exam_score, final_avg, credits_earned, status `validated|debt|failed`) — materialised/derived
- `transcripts` (id, student_id, semester_id, avg, credits, decision, pdf_file_id, generated_at)

### Operations
- `exams` (id, module_id, created_by, title, duration_min, instructions, config jsonb, status)
- `exam_questions` (id, exam_id, order, type `mcq|open|true_false|matching`, prompt, options jsonb, answer jsonb, points, bloom_level)
- `conversations` / `conversation_members` / `messages` (id, conversation_id, sender_id, body, attachments, read_at)
- `notifications` (id, user_id, type, payload jsonb, read_at, channel `in_app|email|sms|push`)
- `reports` (id, university_id, department_id, kind, params jsonb, file_id, requested_by, status, generated_at)
- `activity_logs` (id, university_id, actor_id, action, entity, entity_id, ip, user_agent, metadata jsonb, created_at) — append-only audit trail
- `files` (id, university_id, bucket, path, mime, size, uploaded_by, created_at)
- `subscriptions` (id, university_id, plan, seats, status, provider, provider_customer_id, current_period_end)
- `invoices` (id, subscription_id, amount, currency, status, issued_at, paid_at, pdf_file_id)
- `feature_flags` (key, university_id, enabled, payload jsonb)
- `contact_requests` (id, name, email, university, role, message, source, status, created_at)

### Security model
- `app_role` enum + `public.has_role(_user_id uuid, _role app_role)` **security definer** function; every policy uses it (never a role column on `profiles`).
- Helper functions: `current_university_id()`, `is_department_member(dept_id)`, `is_teacher_of_module(module_id)`, `is_student(student_id)`.
- Policy pattern:
  - students read only their own `grades`, `attendance`, `schedules`, `messages`;
  - teachers read/write only for their assigned modules/groups;
  - department admins scoped to their `department_id`;
  - platform admins scoped by `has_role(..., 'platform_admin')`;
  - `activity_logs`: insert-only from server, readable by admins.
- Every `CREATE TABLE` ships with `GRANT` statements for `authenticated` / `service_role` (and `anon` only for genuinely public tables such as published marketing content).
- Sensitive computations (final averages, publishing grades, generating transcripts) run **server-side only** with audited writes.

### Data protection
- Student grades and attendance are personal data: minimum-necessary exposure, audit every read of bulk exports, retention policy per academic year, encrypted backups, documented DPA with universities, GDPR-aligned practices (and Algerian Law 18-07 on personal data protection).

---

## 5. Hosting & environments

| Environment | Frontend/API | Database | Domain |
|---|---|---|---|
| Local | Vite dev server | Supabase local (CLI) or dev project | localhost |
| Preview (per PR) | Cloudflare Workers preview | Supabase `dev` project | `pr-<n>.dev.acadtrack.app` |
| Staging | Cloudflare Workers | Supabase `staging` project (anonymised data) | `staging.acadtrack.app` |
| Production | Cloudflare Workers, multi-region edge | Supabase `prod` (EU region, PITR on) | `acadtrack.app` / `app.acadtrack.app` |

Cloudflare configuration: proxied DNS, full-strict TLS, HSTS, WAF managed rules, rate limiting on `/api/*` and auth endpoints, Turnstile on signup/contact, Bot Management, Cache Rules for static assets, Logpush to R2, Web Analytics.
Secrets: Cloudflare Workers secrets + Supabase project secrets. Never in the repo. Service-role key server-only.
Backups: Supabase daily backups + PITR; weekly logical dump to R2 with restore drills each quarter.

---

## 6. Migration plan — prototype → product

**Principle: keep the design, rebuild the delivery.** The HTML is the specification; the React app is the implementation.

1. **Freeze the prototype** as `beta-static` branch/tag (this repo becomes the reference UI).
2. Scaffold the new app (`apps/web`, TanStack Start + Tailwind + shadcn).
3. Port `assets/css/theme.css` into design tokens (colors, radii, shadows, typography — Cairo) and shadcn variants.
4. Extract layout once: header, sidebar per role, footer, language switcher — replacing 35 duplicated copies.
5. Extract all `data-i18n-key` strings into `locales/{en,fr,ar}.json` with a script.
6. Rebuild pages route by route in dependency order (§7 phases), replacing `localStorage` reads with server functions.
7. Keep a `demo` tenant seeded with the current mock data (Batna 1 Psychology) so demo mode survives — served from the database, not `localStorage`.
8. Delete a static page only when its React equivalent is verified.

---

## 7. Production plan (phased, ~16–20 weeks)

### Phase 0 — Foundation (week 1–2)
- Repo restructure to a monorepo (`apps/web`, `packages/ui`, `packages/config`, `supabase/`).
- Tooling: TypeScript strict, ESLint, Prettier, Vitest, Playwright, Husky.
- CI/CD: GitHub Actions → typecheck, lint, test, build, preview deploy to Cloudflare; migrations applied via Supabase CLI on merge.
- Create Supabase projects (dev/staging/prod), Cloudflare account/zone, domains, Sentry.
- **Exit criteria**: green pipeline, preview URL per PR, empty app deployed.

### Phase 1 — Identity & tenancy (week 3–4)
- Migrations for §4 identity tables + `app_role`, `has_role`, RLS, GRANTs.
- Supabase Auth: email/password, magic link, Google OAuth, MFA for admins, password policy, email templates in 3 languages.
- Invite-based onboarding: department admin invites teachers/students (CSV import), university self-serve signup for pilots.
- Role-based app shell and route guards; profile & settings pages.
- **Exit criteria**: a real user can sign up, be assigned a role, and see the right shell; RLS verified with tests per role.

### Phase 2 — Academic core (week 5–8)
- Departments, specialties, groups, modules, module assignments, academic years/semesters CRUD.
- Schedules (weekly timetable, conflict detection for room/teacher/group).
- Sessions + **attendance taking** (fast UI: group roster, one tap per student, offline queue, late/excused states).
- Absence justifications workflow with file upload (Supabase Storage).
- Absence thresholds → automatic warnings (e.g. exclusion rules per module).
- **Exit criteria**: a professor completes a real session and every student sees it instantly.

### Phase 3 — Evaluation & results (week 9–11)
- Evaluations and grade entry (grid entry, bulk paste, import/export, validation rules).
- Configurable computation engine: coefficients, credits, TD/exam weights, semester average, compensation, rattrapage, decisions.
- Grade publication workflow (draft → reviewed → published) with audit log.
- Student grade views, module results, transcripts (server-generated PDF, stored in Storage/R2).
- **Exit criteria**: a semester can be closed and transcripts issued that match manual calculation exactly.

### Phase 4 — Insight & communication (week 12–13)
- Department dashboards: attendance rates, pass rates, at-risk students, teaching load, module health.
- Reports engine: parameterised reports → PDF/Excel, queued generation, download centre.
- Activity logs & monitoring pages backed by `activity_logs`.
- Messaging (conversations, realtime), notifications (in-app + email via Resend, optional SMS), announcement broadcasts.
- **Exit criteria**: department head runs the month without leaving AcadTrack.

### Phase 5 — Exam generator & AI (week 14)
- Question bank per module, exam builder, versions/shuffling, answer keys, print-ready PDF layouts (LaTeX-quality typography, RTL support).
- AI assist: generate/rephrase questions from module syllabus, difficulty and Bloom-level tagging, plagiarism-aware review; human approval required before use.
- **Exit criteria**: a professor produces a printable exam in under 10 minutes.

### Phase 6 — Commercial layer (week 15)
- Plans/pricing, subscription and seat management, invoices; Stripe or Paddle for cards, **plus offline institutional invoicing** (Algerian universities buy by convention/bon de commande) — both reconcile into `subscriptions`/`invoices`.
- Webhooks under `/api/public/*` with signature verification; dunning emails; trial and pilot flags.
- **Exit criteria**: a university can be onboarded and billed end to end.

### Phase 7 — Hardening & launch (week 16–18)
- Security: RLS test suite, dependency scanning, secret scanning, pen-test pass, rate limits, Turnstile, CSP headers, session policies, PII audit.
- Performance: Lighthouse ≥ 95 public pages, LCP < 2 s on 3G, dashboards < 1.5 s, DB indexes and query review, edge caching.
- Accessibility: WCAG 2.1 AA, keyboard nav, RTL verification, screen-reader pass.
- Reliability: uptime monitoring, error budgets, Sentry alerts, status page, backup/restore drill, incident runbook.
- Docs: admin guide, professor guide, student guide, API docs, onboarding videos (reuse existing tutorials/help-center content).
- **Exit criteria**: pilot department (Batna 1 Psychology) runs a full month in production with no data incident.

### Phase 8 — Scale (post-launch)
- Multi-university rollout, per-tenant branding and domains.
- University SSO (SAML/Shibboleth/LDAP), SIS/Progres import connectors.
- Mobile apps (React Native or PWA-first), push notifications.
- Advanced analytics/predictive at-risk detection, QR/NFC attendance check-in, parent portal, plagiarism and LMS integrations.

---

## 8. Definition of "fully functional"

AcadTrack is production-ready when **all** of the following hold:
1. Real authentication with roles; no client-side privilege possible; RLS proven by automated per-role tests.
2. All data persists in Postgres, shared across users and devices; zero business `localStorage`.
3. Multi-tenant: two universities coexist with strict data isolation (verified by tests).
4. Attendance, grades, schedules, transcripts, messaging and reports are complete round-trip flows with audit logs.
5. Grade computation matches the university's official rules, validated against a real past semester.
6. Three languages complete, RTL correct, no untranslated string.
7. CI/CD with migrations, preview environments, rollback path; monitored errors and uptime; tested backups.
8. Security review passed, data-protection documentation signed with the pilot university.
9. Documented pricing, subscription and invoicing path.
10. User documentation and support channel live.

---

## 9. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Rebuild scope creep (35 pages) | Phase by user journey; prototype stays live as the spec |
| Grade rules differ per university | Configuration-driven computation engine per specialty/module |
| Weak campus connectivity | PWA + offline attendance queue + light payloads |
| Sensitive student data | RLS, least privilege, audit logs, encryption, retention policy, DPA |
| Payment friction in Algeria | Offline institutional invoicing alongside card payments |
| Single-maintainer bus factor | This blueprint, ADRs, typed code, tests, documented runbooks |
| Vendor lock-in | Portable Postgres, standard JS, exports to R2/S3 |

---

## 10. Immediate next steps (do these first)

1. Tag the current repo as `v0.1-static-prototype` and keep it deployed on Cloudflare Pages as the public demo.
2. Create Cloudflare zone + Supabase dev project; register `acadtrack.app` (or chosen domain).
3. Scaffold the monorepo and Phase 0 CI/CD.
4. Write the Phase 1 migration (identity, tenancy, `user_roles`, `has_role`, RLS, GRANTs) and its RLS test suite.
5. Port the design tokens and the shared layout; ship the login → role-based shell path end to end.
6. Extract the i18n catalogues from the existing pages.
7. Pick the pilot department and collect its official grading rules and timetable as Phase 2/3 input.

---

*This blueprint is official. Update it in the same pull request as any architectural change.*
