# AcadTrack — Cloudflare Pages Deployment Guide

This guide explains how to deploy the AcadTrack project from GitHub to Cloudflare Pages and connect the official domain `acadtrack.org`.

---

# English

## 1. Before you start

AcadTrack is currently a static web prototype built with:

* HTML
* CSS
* Vanilla JavaScript
* Static assets
* No build process required
* No server-side application required for the current prototype

The project is hosted in this GitHub repository:

**GitHub repository:**
https://github.com/uns2026/Acadtrack-beta

The current production domain is:

**https://acadtrack.org**

### Important domain information

The domain **acadtrack.org is currently registered with Octenium**:

https://www.octenium.com/

The domain registrar and DNS provider do not have to be the same company.

The recommended setup is:

**Octenium = domain registrar**

**Cloudflare = DNS + CDN + security + Cloudflare Pages**

The domain should remain registered at Octenium unless the project owner specifically decides to transfer the domain later.

---

# 2. Create a Cloudflare account

Go to:

https://dash.cloudflare.com/

Create a Cloudflare account or sign in to an existing account.

Use an account that will remain accessible to the people responsible for managing AcadTrack.

Do not share the Cloudflare password with other people.

If possible, use Cloudflare's account/team permissions instead of sharing one login.

---

# 3. Add acadtrack.org to Cloudflare

After logging into Cloudflare:

1. Open the Cloudflare dashboard.
2. Click **Add a site**.
3. Enter:

```text
acadtrack.org
```

4. Select the appropriate Cloudflare plan.
5. Cloudflare will provide two authoritative nameservers.

They will look similar to:

```text
xxxx.ns.cloudflare.com
yyyy.ns.cloudflare.com
```

### Important

Do **not** guess or manually invent these nameservers.

Cloudflare generates the exact nameservers for the domain.

Copy both nameservers.

---

# 4. Send the Cloudflare nameservers to the domain owner/registrar administrator

The person managing the domain at Octenium needs to replace the current domain nameservers with the two nameservers provided by Cloudflare.

Send them a message similar to:

> Please update the nameservers for `acadtrack.org` at Octenium to the two nameservers provided by Cloudflare.
>
> Nameserver 1: `YOUR-CLOUDFLARE-NAMESERVER-1`
>
> Nameserver 2: `YOUR-CLOUDFLARE-NAMESERVER-2`
>
> Once updated, Cloudflare will become the DNS manager for `acadtrack.org`.
>
> The domain itself will remain registered at Octenium.

Do not publish the nameservers in this repository.

They should be communicated directly to the person responsible for the domain.

---

# 5. Important DNS warning

Before changing nameservers, check whether `acadtrack.org` currently has important DNS records.

For example:

* Email
* Google Workspace
* Microsoft 365
* Mail servers
* Verification records
* Other websites or services
* TXT records
* MX records
* DKIM records
* SPF records
* DMARC records

Changing nameservers moves DNS management to Cloudflare.

Therefore, any DNS records that need to continue working should be recreated in Cloudflare.

### Email is especially important

If email is currently being used on `@acadtrack.org`, make sure the MX, SPF, DKIM and DMARC records are preserved before or during the DNS migration.

Do not delete existing email-related DNS records without checking what they are used for.

---

# 6. Connect the GitHub repository to Cloudflare Pages

After the Cloudflare account and domain are ready:

1. Open the Cloudflare dashboard.
2. Go to **Workers & Pages**.
3. Choose **Create application**.
4. Choose **Pages** / **Connect to Git** depending on the current Cloudflare dashboard interface.
5. Select **GitHub**.
6. Authorize Cloudflare to access GitHub if requested.
7. Select the repository:

```text
uns2026/Acadtrack-beta
```

8. Select the production branch:

```text
master
```

---

# 7. Configure the Cloudflare Pages build settings

AcadTrack's current version is a static website.

There is currently no Node.js build process required.

Use settings equivalent to:

```text
Production branch:
master

Framework preset:
None

Build command:
leave empty

Build output directory:
/
```

The exact labels in the Cloudflare dashboard may change over time.

The important point is that the repository is already a static HTML/CSS/JavaScript website, so Cloudflare does not need to run a framework build.

The repository contains the main `index.html`, shared assets, and application pages.

---

# 8. Deploy the project

Click **Save and Deploy**.

Cloudflare will:

1. Clone the GitHub repository.
2. Deploy the files.
3. Give the project a temporary Cloudflare Pages address.
4. Automatically redeploy when new commits are pushed to the configured GitHub branch.

Test the temporary Cloudflare address before connecting the custom domain.

Make sure:

* The homepage loads.
* CSS loads correctly.
* JavaScript works.
* Images/assets load.
* Navigation works.
* The different application pages work.

---

# 9. Connect acadtrack.org to Cloudflare Pages

After the Pages deployment works:

1. Open the Cloudflare Pages project.
2. Go to **Custom domains**.
3. Choose **Set up a custom domain**.
4. Enter:

```text
acadtrack.org
```

5. Follow Cloudflare's instructions.

Also add:

```text
www.acadtrack.org
```

if the project is intended to support the `www` version.

Choose one preferred canonical domain and redirect the other version to it.

For example:

```text
https://acadtrack.org
```

can be the primary domain, while:

```text
https://www.acadtrack.org
```

redirects to it.

---

# 10. DNS management

Once the domain is delegated to Cloudflare, Cloudflare becomes the place where DNS records are managed.

This means the people managing AcadTrack can manage things such as:

* A/AAAA records
* CNAME records
* TXT records
* MX records
* SPF
* DKIM
* DMARC
* Domain verification
* Cloudflare Pages
* Other Cloudflare services

The domain registration itself remains at Octenium.

The architecture becomes:

```text
Domain registration
        │
        ▼
    Octenium
        │
        │ nameservers
        ▼
    Cloudflare
        │
        ├── DNS
        ├── CDN
        ├── Security
        └── Pages
              │
              ▼
       GitHub repository
       uns2026/Acadtrack-beta
```

---

# 11. GitHub → Cloudflare automatic deployment

Once GitHub and Cloudflare Pages are connected, normal development becomes very simple.

The workflow is:

```text
Developer
   │
   ▼
GitHub
   │
   ▼
master branch
   │
   ▼
Cloudflare Pages
   │
   ▼
acadtrack.org
```

When changes are pushed to the configured production branch, Cloudflare Pages can automatically create a new deployment.

For example:

```bash
git add .
git commit -m "Update AcadTrack"
git push origin master
```

Cloudflare Pages then deploys the new version.

---

# 12. Recommended access arrangement

The people responsible for the project should have access to:

### GitHub

Repository:

```text
https://github.com/uns2026/Acadtrack-beta
```

### Cloudflare

Cloudflare account containing:

* `acadtrack.org`
* Cloudflare Pages project
* DNS configuration

### Octenium

The domain registrar account remains responsible for:

* Domain ownership
* Domain renewal
* Registrar settings
* Nameserver changes

The preferred arrangement is:

```text
GitHub
  → source code

Cloudflare
  → DNS
  → Pages hosting
  → CDN
  → security

Octenium
  → domain registration
```

This separation allows the project team to manage DNS and Cloudflare services without needing to move the domain registration away from Octenium.

---

# 13. Important security recommendations

Never commit any of the following to GitHub:

* Passwords
* API keys
* Cloudflare API tokens
* Database passwords
* Supabase service-role keys
* Authentication secrets
* Private certificates
* Real student information

The current repository is a prototype and uses browser-side/demo data rather than a production backend. It should therefore not be treated as a production system for real student records yet.

---

# 14. Current project status

The current AcadTrack repository is a high-fidelity static UI prototype.

It currently does **not** contain:

* A production backend
* A production database
* Real authentication/authorization
* Multi-tenant production infrastructure
* Production student-data protection

The repository README describes the planned production architecture using Cloudflare together with Supabase and Cloudflare Workers.

Cloudflare Pages deployment therefore provides hosting for the current prototype. It does not by itself turn the prototype into the planned production SaaS platform.

---

# العربية

# دليل نشر AcadTrack على Cloudflare Pages

يشرح هذا الدليل كيفية نشر مشروع AcadTrack الموجود على GitHub باستخدام Cloudflare Pages، ثم ربط النطاق الرسمي `acadtrack.org`.

---

## ١. قبل البدء

النسخة الحالية من AcadTrack عبارة عن نموذج أولي ثابت مبني باستخدام:

* HTML
* CSS
* JavaScript عادي (Vanilla JavaScript)
* ملفات وموارد ثابتة
* لا يحتاج حالياً إلى عملية Build
* لا يحتاج حالياً إلى خادم Backend لتشغيل الواجهة

مستودع المشروع على GitHub:

**GitHub:**

https://github.com/uns2026/Acadtrack-beta

النطاق الحالي:

**https://acadtrack.org**

### معلومات مهمة حول النطاق

النطاق **acadtrack.org مسجل حالياً لدى Octenium**:

https://www.octenium.com/

ليس من الضروري أن يكون مسجل النطاق ومزود DNS نفس الشركة.

الإعداد المقترح هو:

```text
Octenium
→ تسجيل وملكية النطاق

Cloudflare
→ DNS + CDN + الحماية + Cloudflare Pages

GitHub
→ ملفات المشروع والكود
```

يبقى النطاق مسجلاً لدى Octenium، بينما تتم إدارة DNS من خلال Cloudflare.

---

# ٢. إنشاء حساب Cloudflare

ادخل إلى:

https://dash.cloudflare.com/

أنشئ حساب Cloudflare أو سجل الدخول إلى حساب موجود.

يفضل أن يكون الحساب مملوكاً أو متاحاً للفريق المسؤول عن إدارة AcadTrack.

لا تشارك كلمة المرور مع الآخرين.

استخدم صلاحيات الفريق والحسابات المنفصلة عندما يكون ذلك ممكناً.

---

# ٣. إضافة acadtrack.org إلى Cloudflare

بعد تسجيل الدخول إلى Cloudflare:

1. افتح لوحة التحكم.
2. اختر **Add a site**.
3. أدخل:

```text
acadtrack.org
```

4. اختر الخطة المناسبة.
5. سيعطيك Cloudflare خادمي أسماء Nameservers.

سيكونان شبيهين بـ:

```text
xxxx.ns.cloudflare.com
yyyy.ns.cloudflare.com
```

### مهم جداً

لا تقم بتخمين أسماء الـ Nameservers.

Cloudflare هو الذي يعطيك القيم الصحيحة الخاصة بنطاقك.

انسخ الـ Nameservers الاثنين.

---

# ٤. إرسال Nameservers إلى المسؤول عن النطاق في Octenium

الشخص الذي يدير نطاق `acadtrack.org` في Octenium يجب أن يستبدل Nameservers الحالية بالـ Nameservers التي أعطاها Cloudflare.

يمكن إرسال رسالة مثل:

> يرجى تحديث Nameservers الخاصة بالنطاق `acadtrack.org` في Octenium إلى Nameservers التي أعطاها Cloudflare.
>
> Nameserver 1: `YOUR-CLOUDFLARE-NAMESERVER-1`
>
> Nameserver 2: `YOUR-CLOUDFLARE-NAMESERVER-2`
>
> بعد تحديثها، ستصبح إدارة DNS الخاصة بالنطاق عبر Cloudflare، بينما يبقى النطاق مسجلاً لدى Octenium.

لا تضع Nameservers الخاصة بالحساب الحقيقي داخل مستودع GitHub.

أرسلها مباشرة إلى الشخص المسؤول عن النطاق.

---

# ٥. تنبيه مهم بخصوص DNS

قبل تغيير Nameservers، يجب التأكد من وجود أي خدمات تستخدم النطاق حالياً.

خصوصاً:

* البريد الإلكتروني
* Google Workspace
* Microsoft 365
* خوادم البريد
* سجلات التحقق
* MX
* TXT
* SPF
* DKIM
* DMARC
* أي موقع أو خدمة أخرى مرتبطة بالنطاق

عند نقل Nameservers إلى Cloudflare، تصبح Cloudflare هي المسؤولة عن DNS.

لذلك يجب إعادة إنشاء سجلات DNS المهمة داخل Cloudflare.

### البريد الإلكتروني مهم جداً

إذا كان هناك بريد إلكتروني يعمل باستخدام:

```text
@acadtrack.org
```

يجب المحافظة على سجلات:

```text
MX
SPF
DKIM
DMARC
```

حتى لا يتوقف البريد الإلكتروني بعد تغيير Nameservers.

---

# ٦. ربط GitHub مع Cloudflare Pages

بعد تجهيز حساب Cloudflare:

1. افتح Cloudflare Dashboard.
2. اذهب إلى **Workers & Pages**.
3. اختر **Create application**.
4. اختر **Pages** أو خيار **Connect to Git** حسب واجهة Cloudflare الحالية.
5. اختر **GitHub**.
6. اسمح لـ Cloudflare بالوصول إلى GitHub عند طلب ذلك.
7. اختر المستودع:

```text
uns2026/Acadtrack-beta
```

8. اختر الفرع الرئيسي للإنتاج:

```text
master
```

---

# ٧. إعدادات Cloudflare Pages

المشروع الحالي هو مشروع Static Website.

لا يحتاج حالياً إلى Node.js أو React build.

استخدم إعدادات مشابهة لـ:

```text
Production branch:
master

Framework preset:
None

Build command:
فارغ

Build output directory:
/
```

قد تختلف أسماء الخيارات قليلاً حسب تحديثات Cloudflare.

المهم أن Cloudflare يتعامل مع المستودع كموقع Static، لأن المشروع يحتوي على HTML/CSS/JavaScript جاهزة للنشر.

---

# ٨. نشر المشروع

اضغط:

**Save and Deploy**

سيقوم Cloudflare بـ:

1. جلب المستودع من GitHub.
2. نشر الملفات.
3. إعطائك رابط Cloudflare مؤقت.
4. إعادة النشر تلقائياً عند دفع تحديثات جديدة إلى الفرع المرتبط.

اختبر الموقع المؤقت قبل ربط النطاق.

تأكد من:

* الصفحة الرئيسية تعمل.
* CSS يعمل.
* JavaScript يعمل.
* الصور والملفات تعمل.
* الروابط تعمل.
* صفحات النظام تعمل.
* تبديل اللغات يعمل.

---

# ٩. ربط acadtrack.org

بعد التأكد من أن Cloudflare Pages يعمل:

1. افتح مشروع Pages.
2. اذهب إلى **Custom domains**.
3. اختر **Set up a custom domain**.
4. أدخل:

```text
acadtrack.org
```

5. اتبع تعليمات Cloudflare.

ويُفضّل أيضاً إضافة:

```text
www.acadtrack.org
```

إذا كان المشروع سيستخدم نسخة `www`.

حدد نطاقاً أساسياً واحداً، واجعل النسخة الأخرى تحول إليه.

مثلاً:

```text
https://acadtrack.org
```

هو النطاق الأساسي.

و:

```text
https://www.acadtrack.org
```

يتم تحويله إليه.

---

# ١٠. إدارة DNS

بعد نقل Nameservers إلى Cloudflare، ستصبح Cloudflare مسؤولة عن DNS الخاص بـ:

```text
acadtrack.org
```

وبالتالي يمكن للفريق إدارة:

* A
* AAAA
* CNAME
* TXT
* MX
* SPF
* DKIM
* DMARC
* سجلات التحقق
* Cloudflare Pages
* خدمات Cloudflare الأخرى

أما تسجيل النطاق نفسه فيبقى لدى Octenium.

الهيكل يصبح:

```text
تسجيل النطاق
      │
      ▼
   Octenium
      │
      │ Nameservers
      ▼
   Cloudflare
      │
      ├── DNS
      ├── CDN
      ├── Security
      └── Pages
             │
             ▼
          GitHub
             │
             ▼
    Acadtrack-beta
```

---

# ١١. النشر التلقائي من GitHub

بعد ربط GitHub مع Cloudflare Pages، تصبح عملية التحديث بسيطة.

العملية:

```text
المطور
   │
   ▼
GitHub
   │
   ▼
master
   │
   ▼
Cloudflare Pages
   │
   ▼
acadtrack.org
```

عند رفع تحديث جديد إلى الفرع المرتبط، يستطيع Cloudflare Pages نشر النسخة الجديدة تلقائياً.

مثال:

```bash
git add .
git commit -m "Update AcadTrack"
git push origin master
```

ثم يقوم Cloudflare Pages بعملية Deploy تلقائياً.

---

# ١٢. توزيع الصلاحيات المقترح

### GitHub

المستودع:

https://github.com/uns2026/Acadtrack-beta

يستخدم لإدارة:

* الكود
* الملفات
* الإصدارات
* التعديلات

### Cloudflare

يستخدم لإدارة:

* `acadtrack.org`
* DNS
* Cloudflare Pages
* CDN
* الحماية
* الخدمات المستقبلية

### Octenium

يبقى مسؤولاً عن:

* تسجيل النطاق
* ملكية النطاق
* تجديد النطاق
* إعدادات المسجل
* تغيير Nameservers

والإعداد المفضل:

```text
GitHub
→ الكود

Cloudflare
→ DNS
→ الاستضافة
→ CDN
→ الحماية

Octenium
→ تسجيل النطاق
```

بهذه الطريقة يمكن للفريق إدارة DNS وCloudflare بدون الحاجة إلى نقل تسجيل النطاق من Octenium.

---

# ١٣. نصائح أمنية مهمة

لا تقم أبداً برفع الأمور التالية إلى GitHub:

* كلمات المرور
* API Keys
* Cloudflare API Tokens
* كلمات مرور قواعد البيانات
* Supabase Service Role Keys
* مفاتيح المصادقة
* الشهادات الخاصة
* بيانات الطلبة الحقيقية

النسخة الحالية من AcadTrack هي نموذج أولي، وتستخدم بيانات تجريبية محلية في المتصفح وليست Backend إنتاجياً.

---

# ١٤. حالة المشروع الحالية

النسخة الحالية من AcadTrack هي **High-Fidelity Static UI Prototype**.

حالياً لا تحتوي على:

* Backend إنتاجي
* قاعدة بيانات إنتاجية
* نظام مصادقة حقيقي
* نظام صلاحيات إنتاجي
* Multi-tenancy إنتاجي
* بنية حماية لبيانات الطلبة الحقيقية

README الحالي يوضح أن البنية الإنتاجية المخطط لها تعتمد على Supabase مع Cloudflare وCloudflare Workers.

لذلك فإن Cloudflare Pages في المرحلة الحالية يوفر **استضافة للنموذج الأولي**، لكنه لا يحول المشروع تلقائياً إلى نظام SaaS إنتاجي متكامل.

---

# الخلاصة

الترتيب المطلوب هو:

```text
                    ┌─────────────────────┐
                    │       GitHub        │
                    │ Acadtrack-beta repo │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Cloudflare Pages    │
                    │      Hosting        │
                    └──────────┬──────────┘
                               │
                               ▼
                       acadtrack.org
                               ▲
                               │
                    ┌──────────┴──────────┐
                    │     Cloudflare      │
                    │        DNS          │
                    └──────────┬──────────┘
                               │
                         Nameservers
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Octenium       │
                    │ Domain Registrar     │
                    └─────────────────────┘
```

**Octenium يحتفظ بتسجيل النطاق، وCloudflare يدير DNS والاستضافة والحماية، وGitHub يحتفظ بالكود.**

# Testing the project before connecting acadtrack.org

## English

You do **not** need to connect `acadtrack.org` when you first deploy the project.

Cloudflare Pages provides a default Cloudflare Pages subdomain for the project. After the first deployment, you can use that address to test the website while development is still in progress.

For example, Cloudflare may provide an address similar to:

```text
https://acadtrack-beta.pages.dev
```

The exact `pages.dev` address will be assigned by Cloudflare.

You can use this temporary/default address to:

* Test the homepage
* Test navigation
* Test login and signup pages
* Test student pages
* Test teacher pages
* Test responsive layouts
* Check CSS and JavaScript
* Test new changes after every GitHub deployment
* Share the development version with other people for testing

This means there is **no need to change the real `acadtrack.org` domain while the project is still being built**.

### Recommended development workflow

```text
GitHub
   │
   ▼
Cloudflare Pages
   │
   ▼
acadtrack-beta.pages.dev
   │
   ├── Development
   ├── Testing
   ├── Bug fixing
   └── Review
```

Continue developing and testing the project using the Cloudflare-provided `pages.dev` address.

When the project is ready for its real public launch, connect:

```text
acadtrack.org
```

to the Cloudflare Pages project.

The final workflow becomes:

```text
GitHub
   │
   ▼
Cloudflare Pages
   │
   ├── pages.dev → testing/development
   │
   └── acadtrack.org → official public website
```

### When the project is ready

Once development and testing are finished:

1. Open the Cloudflare Pages project.
2. Go to **Custom domains**.
3. Add:

```text
acadtrack.org
```

4. Follow Cloudflare's instructions.
5. If required, configure `www.acadtrack.org`.
6. Make sure the DNS and nameservers are correctly configured.
7. Test the final website using the real domain.

This allows the project to be built and tested safely before making `acadtrack.org` the public production address.

---

# الاختبار قبل ربط نطاق acadtrack.org

## العربية

**لا تحتاج إلى ربط `acadtrack.org` منذ البداية.**

بعد ربط مستودع GitHub مع Cloudflare Pages ونشر المشروع، سيعطيك Cloudflare رابطاً افتراضياً على نطاق `pages.dev`.

قد يكون الرابط مثلاً:

```text
https://acadtrack-beta.pages.dev
```

الرابط الفعلي سيتم إنشاؤه من طرف Cloudflare.

يمكن استخدام هذا الرابط أثناء تطوير المشروع من أجل:

* اختبار الصفحة الرئيسية
* اختبار التنقل بين الصفحات
* اختبار صفحات تسجيل الدخول والتسجيل
* اختبار صفحات الطالب
* اختبار صفحات الأستاذ
* اختبار التصميم على الهاتف والكمبيوتر
* التأكد من عمل CSS وJavaScript
* اختبار كل تحديث جديد يتم رفعه إلى GitHub
* مشاركة نسخة التطوير مع أشخاص آخرين للاختبار

وبالتالي **لا توجد حاجة لتغيير أو ربط النطاق الحقيقي `acadtrack.org` أثناء مرحلة التطوير**.

### طريقة العمل المقترحة

```text
GitHub
   │
   ▼
Cloudflare Pages
   │
   ▼
acadtrack-beta.pages.dev
   │
   ├── التطوير
   ├── الاختبار
   ├── إصلاح الأخطاء
   └── المراجعة
```

استمر في تطوير المشروع واختباره باستخدام رابط `pages.dev` الذي يوفره Cloudflare.

وعندما يصبح المشروع جاهزاً للنشر الرسمي، يمكن إضافة:

```text
acadtrack.org
```

إلى مشروع Cloudflare Pages.

وبذلك تصبح البنية:

```text
GitHub
   │
   ▼
Cloudflare Pages
   │
   ├── pages.dev → للتطوير والاختبار
   │
   └── acadtrack.org → الموقع الرسمي
```

### عند الانتهاء من المشروع

عندما يصبح المشروع جاهزاً للنشر الرسمي:

1. افتح مشروع Cloudflare Pages.
2. اذهب إلى **Custom domains**.
3. أضف:

```text
acadtrack.org
```

4. اتبع تعليمات Cloudflare.
5. أضف `www.acadtrack.org` إذا كان مطلوباً.
6. تأكد من إعداد DNS وNameservers بشكل صحيح.
7. اختبر الموقع النهائي باستخدام النطاق الحقيقي.

بهذه الطريقة يمكن بناء المشروع واختباره بالكامل على Cloudflare Pages أولاً، وبعد الانتهاء فقط يتم ربط `acadtrack.org` كموقع الإنتاج الرسمي.
