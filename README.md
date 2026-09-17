<div align="center">

# AcadTrack

**Academic Tracking Platform for Universities** · **منصة المتابعة الأكاديمية للجامعات**

Attendance · Grades · Modules · Schedules · Exams · Reports
الحضور · النقاط · المقاييس · جداول الحصص · الامتحانات · التقارير

`EN` · `FR` · `AR (RTL)` — Multilingual by design

[Official Blueprint / المخطط الرسمي](./BLUEPRINT.md)

</div>

---

## Table of Contents / جدول المحتويات

**English**
1. [Overview](#1-overview)
2. [Who it is for](#2-who-it-is-for)
3. [Features](#3-features)
4. [Project structure](#4-project-structure)
5. [Technologies used today](#5-technologies-used-today)
6. [Current status & limitations](#6-current-status--limitations)
7. [Target production architecture](#7-target-production-architecture)
8. [Database (planned)](#8-database-planned)
9. [Roadmap](#9-roadmap)
10. [Run locally](#10-run-locally)
11. [Documentation](#11-documentation)
12. [Contributing & license](#12-contributing--license)

**العربية**
1. [نظرة عامة](#١-نظرة-عامة)
2. [لمن هذه المنصة](#٢-لمن-هذه-المنصة)
3. [الميزات](#٣-الميزات)
4. [هيكل المشروع](#٤-هيكل-المشروع)
5. [التقنيات المستخدمة حاليا](#٥-التقنيات-المستخدمة-حاليا)
6. [الحالة الحالية والقيود](#٦-الحالة-الحالية-والقيود)
7. [المعمارية المستهدفة للإنتاج](#٧-المعمارية-المستهدفة-للإنتاج)
8. [قاعدة البيانات المقترحة](#٨-قاعدة-البيانات-المقترحة)
9. [خطة الطريق](#٩-خطة-الطريق)
10. [التشغيل محليا](#١٠-التشغيل-محليا)
11. [الوثائق](#١١-الوثائق)
12. [المساهمة والرخصة](#١٢-المساهمة-والرخصة)

---

# English

## 1. Overview

AcadTrack is a multilingual academic tracking platform (SaaS) for universities. It replaces scattered spreadsheets, paper attendance sheets and messaging groups with one shared system where students, professors and department heads see the same, up-to-date academic reality.

The platform is designed around the Algerian university model, with **Université Batna 1 — El Hadj Lakhdar (Department of Psychology)** as the reference pilot, and is built to scale to any university as a multi-tenant product.

## 2. Who it is for

| Role | What they get |
|---|---|
| **Student** | Attendance rate, grades, modules, schedule, reports, messages |
| **Professor** | Sessions, attendance taking, grade entry, exam generator, reports |
| **Department Head** | Users, departments, specialties, analytics, monitoring, activity logs, reports |
| **Platform Admin** | Universities, tenants, subscriptions, system health |
| **Demo mode** | Guided, data-safe showcase of every role |

## 3. Features

- **Authentication & onboarding** — login, signup, role selection, demo mode
- **Attendance** — sessions, present/absent/late/excused, justifications, absence thresholds and warnings
- **Grades & results** — evaluations, coefficients and credits, semester averages, resit (rattrapage), transcripts
- **Modules & organisation** — departments, specialties, groups, modules, teaching assignments
- **Schedules** — weekly timetables with conflict detection
- **Exam generator** — question banks, exam building, answer keys, print-ready papers
- **Analytics & reporting** — department dashboards, at-risk students, PDF/Excel reports, activity logs
- **Communication** — internal messaging, notifications, contact forms
- **Public site** — home, features, about, tutorials, help center, platform presentation, subscription plans
- **Internationalisation** — English, French, Arabic with full right-to-left support

## 4. Project structure

```
index.html / home.html       Public landing page
404.html                     Not-found page
assets/css/theme.css         Shared design system
assets/js/app.js             Shared runtime: i18n, roles, session, demo data
p/                           35 application pages
  ├── student-*.html         Dashboard, grades, modules, schedule, reports, messages, profile, settings
  ├── teacher-*.html         Dashboard, sessions, reports, messages, profile
  ├── dept-admin-*.html      Dashboard, users, departments, analytics, monitoring, logs, reports, settings
  ├── exams-generator.html   Exam generation tool
  ├── login/signup.html      Authentication screens
  └── about, features, contact, tutorials, help-center, platform-presentation, subscribe
BLUEPRINT.md                 Official architecture & production plan
```

## 5. Technologies used today

- Static **HTML + CSS + vanilla JavaScript** (exported from a Blogger theme)
- Hand-written CSS design system (`theme.css`), **Font Awesome 6.4**, **Google Fonts (Cairo)**
- Client-side internationalisation via `data-i18n-key` attributes
- **`localStorage`** used as a temporary mock database, with hard-coded demo users per role

## 6. Current status & limitations

This repository is a **high-fidelity, fully navigable UI prototype — not yet a working product**.

- No backend, no database, no real authentication or authorisation
- No multi-tenancy: one hard-coded university and department
- Heavy HTML duplication (header, navigation and translations copied across 35 pages)
- Data lives per browser: nothing is shared between users or survives a cleared browser
- No build step, tests, CI/CD, or data-protection layer for sensitive student records

The prototype is treated as the **visual and functional specification**; the production app is being rebuilt against it.

## 7. Target production architecture

**Supabase (data, auth, storage, realtime) + Cloudflare (hosting, edge, protection).**

```
Users ─▶ Cloudflare (DNS, CDN, WAF, Turnstile, rate limiting)
          └─▶ React 19 + TypeScript app with SSR on Cloudflare Workers
                 · server functions = backend API
                 · /api/public/* = webhooks & cron (signature-verified)
                 ├─▶ Supabase: Postgres + RLS, Auth (MFA/OAuth), Storage, Realtime
                 └─▶ Cloudflare R2, KV, Queues, Cron, Images, Logpush
```

- **Frontend**: React + TypeScript, TanStack Router/Start, Tailwind CSS + shadcn/ui, i18next, Recharts, PWA with offline attendance queue
- **Backend**: server functions on Cloudflare Workers for all business logic (attendance rules, grade computation, exam generation, reports, notifications)
- **Alternatives considered**: Vercel/Netlify (hosting), Neon/RDS (database), Clerk/Auth0/university SSO (auth), Resend/Postmark (email), Twilio (SMS), Stripe/Paddle plus offline institutional invoicing (payments), Sentry + PostHog (monitoring and analytics)

Full comparison and rationale: [BLUEPRINT.md](./BLUEPRINT.md).

## 8. Database (planned)

PostgreSQL on Supabase, multi-tenant by `university_id`, **row-level security on every table**, and roles stored in a dedicated `user_roles` table (never on profiles) checked through a `has_role()` security-definer function.

Main groups of tables:

- **Identity & tenancy** — universities, academic_years, semesters, departments, specialties, groups, profiles, user_roles, students, teachers
- **Academics** — modules, module_assignments, schedules, sessions, attendance, absence_justifications, evaluations, grades, module_results, transcripts
- **Operations** — exams, exam_questions, conversations, messages, notifications, reports, activity_logs, files, subscriptions, invoices, feature_flags, contact_requests

Access rules: students see only their own records; professors only their assigned modules and groups; department heads only their department; platform admins across tenants. Sensitive computations and publishing run server-side with a full audit trail.

## 9. Roadmap

| Phase | Scope |
|---|---|
| 0 | Foundation: monorepo, tooling, CI/CD, environments |
| 1 | Identity & tenancy: auth, roles, RLS, invitations, CSV import |
| 2 | Academic core: modules, schedules, sessions, attendance, justifications |
| 3 | Evaluation: grade entry, computation engine, publication, transcripts |
| 4 | Insight & communication: analytics, reports, messaging, notifications |
| 5 | Exam generator with AI assistance |
| 6 | Commercial layer: plans, subscriptions, invoicing |
| 7 | Hardening & launch: security, performance, accessibility, docs, pilot |
| 8 | Scale: multi-university, university SSO, mobile apps, advanced analytics |

Detailed tasks, exit criteria and risks: [BLUEPRINT.md](./BLUEPRINT.md).

## 10. Run locally

The current prototype is fully static — any static server works:

```bash
git clone https://github.com/uns2026/Acadtrack-beta.git
cd Acadtrack-beta
python3 -m http.server 8080
# open http://localhost:8080
```

Then use the role switcher to explore the student, professor, department-head and platform-admin experiences in demo mode.

## 11. Documentation

- [BLUEPRINT.md](./BLUEPRINT.md) — official platform blueprint: full description, audit, architecture, database schema, hosting, migration and production plan
- In-app: `p/help-center.html`, `p/tutorials.html`, `p/platform-presentation.html`

## 12. Contributing & license

- The blueprint is the source of truth: update [BLUEPRINT.md](./BLUEPRINT.md) in the same pull request as any architectural change.
- Never commit secrets, service keys, or real student data.
- License: to be defined by the project owner.

---
---

<div dir="rtl">

# العربية

## ١. نظرة عامة

**AcadTrack** منصة متابعة أكاديمية متعددة اللغات (SaaS) موجهة للجامعات. تُغني عن الجداول المتفرقة وأوراق الحضور الورقية ومجموعات المراسلة، وتجمع الطلبة والأساتذة ورؤساء الأقسام في نظام واحد يعرض الوضع الأكاديمي نفسه ومحدَّثاً للجميع.

صُممت المنصة وفق نموذج الجامعة الجزائرية، مع **جامعة باتنة ١ – الحاج لخضر (قسم علم النفس)** كنموذج تجريبي مرجعي، وهي مبنية للتوسع إلى أي جامعة أخرى كمنتج متعدد المؤسسات.

## ٢. لمن هذه المنصة

| الدور | ما يحصل عليه |
|---|---|
| **الطالب** | نسبة الحضور، النقاط، المقاييس، جدول الحصص، التقارير، الرسائل |
| **الأستاذ** | الحصص، تسجيل الحضور، إدخال النقاط، مولّد الامتحانات، التقارير |
| **رئيس القسم** | المستخدمون، الأقسام، التخصصات، التحليلات، المتابعة، سجل النشاطات، التقارير |
| **مدير النظام** | الجامعات، المؤسسات المشتركة، الاشتراكات، صحة النظام |
| **وضع العرض** | استعراض آمن وموجَّه لكل الأدوار |

## ٣. الميزات

- **الدخول والتسجيل** — تسجيل الدخول، إنشاء حساب، اختيار الدور، وضع العرض
- **الحضور** — الحصص، حاضر/غائب/متأخر/بعذر، التبريرات، حدود الغياب والإنذارات
- **النقاط والنتائج** — التقييمات، المعاملات والأرصدة، معدلات السداسي، الاستدراك، كشوف النقاط
- **المقاييس والتنظيم** — الأقسام، التخصصات، الأفواج، المقاييس، توزيع الأساتذة
- **جداول الحصص** — جداول أسبوعية مع كشف التعارضات
- **مولّد الامتحانات** — بنك أسئلة، بناء الامتحان، سلّم التصحيح، أوراق قابلة للطباعة
- **التحليلات والتقارير** — لوحات القسم، الطلبة المعرّضون للخطر، تقارير PDF/Excel، سجل النشاطات
- **التواصل** — الرسائل الداخلية، الإشعارات، استمارات الاتصال
- **الموقع العام** — الرئيسية، الميزات، من نحن، الدروس، مركز المساعدة، تقديم المنصة، خطط الاشتراك
- **تعدد اللغات** — الإنجليزية والفرنسية والعربية بدعم كامل للكتابة من اليمين إلى اليسار

## ٤. هيكل المشروع

```
index.html / home.html       الصفحة العامة الرئيسية
404.html                     صفحة الخطأ ٤٠٤
assets/css/theme.css         نظام التصميم المشترك
assets/js/app.js             الترجمة والأدوار والجلسة وبيانات العرض
p/                           ٣٥ صفحة تطبيقية
  ├── student-*.html         لوحة الطالب، النقاط، المقاييس، الجدول، التقارير، الرسائل، الحساب
  ├── teacher-*.html         لوحة الأستاذ، الحصص، التقارير، الرسائل، الحساب
  ├── dept-admin-*.html      لوحة القسم، المستخدمون، الأقسام، التحليلات، المتابعة، السجلات
  ├── exams-generator.html   أداة توليد الامتحانات
  ├── login/signup.html      شاشات الدخول والتسجيل
  └── about, features, contact, tutorials, help-center, platform-presentation, subscribe
BLUEPRINT.md                 المخطط الرسمي للمعمارية وخطة الإنتاج
```

## ٥. التقنيات المستخدمة حاليا

- **HTML وCSS وJavaScript** ثابتة (مُصدَّرة من قالب Blogger)
- نظام تصميم مكتوب يدوياً في `theme.css`، مع **Font Awesome 6.4** وخط **Cairo** من Google Fonts
- ترجمة في المتصفح عبر خصائص `data-i18n-key`
- استخدام **`localStorage`** كقاعدة بيانات مؤقتة وهمية، مع مستخدمين تجريبيين مكتوبين مباشرة في الكود

## ٦. الحالة الحالية والقيود

هذا المستودع **نموذج أولي للواجهة عالي الدقة وقابل للتنقل بالكامل — وليس منتجاً عاملاً بعد**.

- لا يوجد خلفية (backend) ولا قاعدة بيانات ولا مصادقة أو صلاحيات حقيقية
- لا دعم لتعدد المؤسسات: جامعة وقسم واحد مكتوبان في الكود
- تكرار كبير في HTML (الترويسة والتنقل والترجمات منسوخة في ٣٥ صفحة)
- البيانات محلية في كل متصفح: لا تُشارك بين المستخدمين ولا تبقى بعد حذف بيانات المتصفح
- لا توجد عملية بناء ولا اختبارات ولا CI/CD ولا طبقة حماية للبيانات الشخصية للطلبة

يُعتمد النموذج الأولي **كمواصفة بصرية ووظيفية**، ويُعاد بناء التطبيق الإنتاجي على أساسه.

## ٧. المعمارية المستهدفة للإنتاج

**Supabase (البيانات، المصادقة، التخزين، الزمن الحقيقي) + Cloudflare (الاستضافة، الحافة، الحماية).**

```
المستخدمون ─▶ Cloudflare (DNS، CDN، WAF، Turnstile، تحديد المعدل)
              └─▶ تطبيق React 19 + TypeScript مع SSR على Cloudflare Workers
                     · دوال الخادم = واجهة الخلفية
                     · ‎/api/public/* = الويب هوك والمهام المجدولة (بتحقق التوقيع)
                     ├─▶ Supabase: Postgres + RLS، المصادقة، التخزين، الزمن الحقيقي
                     └─▶ Cloudflare R2، KV، Queues، Cron، Images، Logpush
```

- **الواجهة**: React وTypeScript، TanStack Router/Start، Tailwind CSS وshadcn/ui، i18next، Recharts، تطبيق PWA مع تسجيل حضور يعمل دون اتصال ويتزامن لاحقاً
- **الخلفية**: دوال خادم على Cloudflare Workers لكل منطق العمل (قواعد الحضور، حساب المعدلات، توليد الامتحانات، التقارير، الإشعارات)
- **بدائل مدروسة**: Vercel/Netlify للاستضافة، Neon/RDS لقاعدة البيانات، Clerk/Auth0 أو الدخول الموحّد الجامعي للمصادقة، Resend/Postmark للبريد، Twilio للرسائل القصيرة، Stripe/Paddle مع الفاتورة المؤسسية للدفع، Sentry وPostHog للمراقبة والتحليلات

المقارنة الكاملة والمبررات في [BLUEPRINT.md](./BLUEPRINT.md).

## ٨. قاعدة البيانات المقترحة

PostgreSQL على Supabase، متعددة المؤسسات عبر `university_id`، مع **أمن على مستوى الصفوف (RLS) لكل جدول**، وتخزين الأدوار في جدول مستقل `user_roles` (وليس في جدول الملفات الشخصية) يُتحقق منه عبر دالة `has_role()` بصلاحيات المالك.

مجموعات الجداول الرئيسية:

- **الهوية والمؤسسات** — universities، academic_years، semesters، departments، specialties، groups، profiles، user_roles، students، teachers
- **الشأن الأكاديمي** — modules، module_assignments، schedules، sessions، attendance، absence_justifications، evaluations، grades، module_results، transcripts
- **التشغيل** — exams، exam_questions، conversations، messages، notifications، reports، activity_logs، files، subscriptions، invoices، feature_flags، contact_requests

قواعد الوصول: الطالب يرى بياناته فقط، والأستاذ مقاييسه وأفواجه المكلَّف بها، ورئيس القسم قسمه، ومدير النظام كل المؤسسات. الحسابات الحساسة ونشر النقاط تُنفَّذ في الخادم مع سجل تدقيق كامل.

## ٩. خطة الطريق

| المرحلة | النطاق |
|---|---|
| ٠ | الأساس: مستودع موحّد، أدوات التطوير، CI/CD، البيئات |
| ١ | الهوية والمؤسسات: المصادقة، الأدوار، RLS، الدعوات، استيراد CSV |
| ٢ | النواة الأكاديمية: المقاييس، الجداول، الحصص، الحضور، التبريرات |
| ٣ | التقييم: إدخال النقاط، محرك حساب المعدلات، النشر، كشوف النقاط |
| ٤ | التحليل والتواصل: اللوحات، التقارير، الرسائل، الإشعارات |
| ٥ | مولّد الامتحانات بمساعدة الذكاء الاصطناعي |
| ٦ | الطبقة التجارية: الخطط، الاشتراكات، الفوترة |
| ٧ | التحصين والإطلاق: الأمن، الأداء، إمكانية الوصول، الوثائق، التجربة النموذجية |
| ٨ | التوسع: تعدد الجامعات، الدخول الموحّد، تطبيقات الهاتف، تحليلات متقدمة |

المهام التفصيلية ومعايير الإنجاز والمخاطر في [BLUEPRINT.md](./BLUEPRINT.md).

## ١٠. التشغيل محليا

النموذج الحالي ثابت بالكامل، ويكفي أي خادم ملفات ثابتة:

```bash
git clone https://github.com/uns2026/Acadtrack-beta.git
cd Acadtrack-beta
python3 -m http.server 8080
# افتح http://localhost:8080
```

ثم استخدم مبدّل الأدوار لاستعراض تجربة الطالب والأستاذ ورئيس القسم ومدير النظام في وضع العرض.

## ١١. الوثائق

- [BLUEPRINT.md](./BLUEPRINT.md) — المخطط الرسمي للمنصة: الوصف الكامل، التقييم، المعمارية، قاعدة البيانات، الاستضافة، خطة الترحيل والإنتاج
- داخل المنصة: `p/help-center.html` و`p/tutorials.html` و`p/platform-presentation.html`

## ١٢. المساهمة والرخصة

- المخطط هو المرجع: حدِّث [BLUEPRINT.md](./BLUEPRINT.md) في نفس طلب الدمج مع أي تغيير معماري.
- لا تُرفع أبداً المفاتيح السرية أو بيانات الطلبة الحقيقية إلى المستودع.
- الرخصة: تُحدَّد من قِبل مالك المشروع.

</div>


## 11. Documentation

- [BLUEPRINT.md](./BLUEPRINT.md) — official platform blueprint: full description, audit, architecture, database schema, hosting, migration and production plan
- [Cloudflare Pages Deployment Guide](./CLOUDFLARE_PAGES_DEPLOYMENT.md) — English and Arabic instructions for connecting GitHub to Cloudflare Pages, testing the project on the default `pages.dev` subdomain, and connecting `acadtrack.org` when the project is ready for production
- In-app: `p/help-center.html`, `p/tutorials.html`, `p/platform-presentation.html`

## ١١. الوثائق

- [BLUEPRINT.md](./BLUEPRINT.md) — المخطط الرسمي للمنصة: الوصف الكامل، التقييم، المعمارية، قاعدة البيانات، الاستضافة، خطة الترحيل والإنتاج
- [دليل النشر على Cloudflare Pages](./CLOUDFLARE_PAGES_DEPLOYMENT.md) — دليل باللغتين الإنجليزية والعربية لربط GitHub مع Cloudflare Pages، واختبار المشروع باستخدام نطاق `pages.dev` الافتراضي، ثم ربط `acadtrack.org` عند جاهزية المشروع للنشر الرسمي
- داخل المنصة: `p/help-center.html` و`p/tutorials.html` و`p/platform-presentation.html`
