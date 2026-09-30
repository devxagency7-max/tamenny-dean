# Dean & Supervisor — Complete API Guide

> **Audience:** Frontend team building the Faculty Dean web dashboard and the Supervisor
> ("معيد") screens. Also the Admin/Backend team, since a lot of the Academic module was
> just restructured.
>
> **Base URL (current):** `http://187.7.30.23`
> **Auth on every endpoint:** `Authorization: Bearer <FIREBASE_ID_TOKEN>`
> **API version prefix:** `/api/v1`

---

## 1. What changed and why (read this first)

Before this deploy, the "Supervisor" was a `Pharmacist` with a `SupervisorProfile` row bolted on. There was no real separation between a working pharmacist who dispenses medication and a faculty pharmacist who teaches interns — the same role, same permissions, same login path.

That's now split:

| Aspect | Before | After |
|---|---|---|
| Role in the enum | `Pharmacist` (3) with a SupervisorProfile | Dedicated `Supervisor` (8) |
| Who creates the account | Admin, only after the person already exists as a Pharmacist | **Faculty Dean** (email + password minted in one call) |
| Who assigns interns to supervisors | Admin | **Faculty Dean** (scoped to their faculty) |
| Auth policy on `/supervisor/*` | `PharmacistOnly` | `SupervisorOnly` |
| Application-approval path | Admin approves intern applications | **Unchanged — still Admin** |
| Where interns show up next | Nowhere formal — Admin had to manually route them | Dean's `unassigned` queue for their faculty |

The Admin's original endpoints (`POST /admin/supervisors`, `POST /admin/internship-assignments`) still work — they're now an **override / escalation** path, not the day-to-day flow.

## 2. The three roles at a glance

```
                ┌───────────────────────────────────────────────┐
                │  Admin (role 1)                                │
                │  • Approves intern applications                │
                │  • Governs universities, faculties, deans      │
                │  • Override: /admin/supervisors,               │
                │              /admin/internship-assignments     │
                │  • Not involved in day-to-day intern placement │
                └────────────────────┬──────────────────────────┘
                                     │  creates
                                     ▼
                ┌───────────────────────────────────────────────┐
                │  Faculty Dean (role 7 / FacultyDean)           │
                │  • One dean per faculty                        │
                │  • Creates Supervisors for their faculty       │
                │  • Sees approved interns in their faculty      │
                │  • Assigns interns → supervisors               │
                │  • Read-access to everything in their faculty  │
                └────────────────────┬──────────────────────────┘
                                     │  creates + assigns
                                     ▼
                ┌───────────────────────────────────────────────┐
                │  Supervisor (role 8 / Supervisor)              │
                │  ("معيد" — teaching pharmacist, senior rank)   │
                │  • Sees ONLY the interns assigned to them      │
                │  • Reviews their drafts, verifies hours,       │
                │    submits evaluations                         │
                │  • No independent patient roster — reaches     │
                │    prescriptions/patients only through the     │
                │    intern's draft submissions                  │
                └────────────────────┬──────────────────────────┘
                                     │  supervises
                                     ▼
                ┌───────────────────────────────────────────────┐
                │  Intern (role 4 / PharmacyIntern)              │
                │  • Applies via /pharmacist/apply?type=Intern   │
                │  • Approved by Admin                           │
                │  • Placed with a Supervisor by their Dean      │
                │  • Submits clinical drafts, logs hours         │
                │  • Full flow: INTERN_API_GUIDE.md              │
                └───────────────────────────────────────────────┘
```

**Supervisor vs Pharmacist** — deliberately separate:

- A **Pharmacist** works in a real dispensing pharmacy, has their own patient roster (`/pharmacists/my-patients`), reviews their patients' prescriptions directly, uses the AI assistant on real patient data.
- A **Supervisor** works at a pharmacy college. They don't have a patient roster or dispense — their entire job is teaching interns. They see real patient data only through the lens of an intern's draft review. Think Attending Physician in a teaching hospital vs. a community pharmacist — same profession, very different role.

## 3. End-to-end lifecycle (one full flow)

```
Day 0. Admin sets up institutional data (once per organization)
       POST /api/v1/admin/universities        → University row
       POST /api/v1/admin/faculties           → Faculty row
       POST /api/v1/admin/deans               → creates the Dean's User
                                                  (role=FacultyDean) + Firebase
                                                  account + FacultyDean row.
                                                  Response includes the one-time
                                                  password.

Day 1. Dean logs in for the first time
       GET  /api/v1/dean/me                   → confirms profile / faculty
       PUT  /api/v1/dean/me                   → sets phone, office, etc.

Day 2. Dean prepares to receive interns
       GET  /api/v1/admin/training-programs?facultyId=…    ← (Admin creates these)
        OR  POST /api/v1/admin/training-programs          ← if none exist yet

Day 3. Dean creates their supervisors
       POST /api/v1/dean/supervisors
       body: { email, name, phone, syndicateLicenseNumber,
               yearsOfExperience, maxInternCapacity,
               affiliatedPharmacyBranchId? }
       → response.generatedPassword    (relay to the Supervisor OOB, once)

Day 4. An intern signs up in the mobile app
       POST /api/v1/pharmacist/apply?applicationType=Intern
       (the intern picks their University + Faculty from the picker)
       → application row created, status = Pending, faculty populated

Day 5. Admin reviews the intern's application
       GET  /api/v1/admin/pharmacist-applications?status=Pending
       POST /api/v1/admin/pharmacists/{id}/approve
       → intern's user is promoted to PharmacyIntern

Day 6. Dean sees the newly-approved intern in their queue
       GET  /api/v1/dean/interns/unassigned
       → returns the intern with { userId, applicationId, universityName, ... }

Day 7. Dean assigns the intern to a Supervisor
       POST /api/v1/dean/internship-assignments
       body: { internUserId, facultyId (= your faculty),
               trainingProgramId, pharmacyId, branchId,
               supervisorId, startDate, expectedEndDate? }
       → InternshipAssignment row (Active); intern's /intern/progress now returns 200

Day 8. Supervisor logs in, sees the intern
       GET  /api/v1/supervisor/my-interns
       → the intern shows up with hours + progress metrics

Day 9+. Ongoing operation
        Intern:     POST /prescriptions/{id}/draft-recommendation
                    POST /medications/draft
                    POST /intern/activities/log-hours
                    GET  /intern/progress
        Supervisor: GET  /supervisor/drafts
                    POST /supervisor/drafts/{id}/approve
                    POST /supervisor/activities/{logId}/verify
                    POST /supervisor/evaluations
        Dean:       Everything under /api/v1/dean (see below)
```

## 4. Faculty Dean — every endpoint

All endpoints are under `[Authorize(Policy = "FacultyDeanOnly")]` and internally scoped to the caller's own faculty via `IAcademicIdentityService.GetCurrentDeanFacultyIdAsync()`. Passing another faculty's id in a request body is either ignored (reads) or rejected 403 (writes).

### 4.1 Dean self-service

| Method | Path | What it does | Response |
|---|---|---|---|
| GET | `/api/v1/dean/me` | Returns the caller Dean's profile — id, userId, name, email, faculty id/name, academic title, phone, office, appointment date. | `DeanMeResponse` |
| PUT | `/api/v1/dean/me` | Updates `academicTitle`, `phone`, `office` on the caller's own record. Everything else (email/faculty) is immutable from here. | `DeanMeResponse` |

### 4.2 Supervisor management (NEW)

| Method | Path | What it does | Notes |
|---|---|---|---|
| POST | `/api/v1/dean/supervisors` | Create a fresh Supervisor account for the Dean's faculty. Body: `{ email, name, phone, syndicateLicenseNumber, yearsOfExperience, maxInternCapacity, affiliatedPharmacyBranchId? }`. Server creates the Firebase login + User row (role=Supervisor, status=Active, MembershipNumber=syndicate license, CreatedByUserId=this Dean) + SupervisorProfile — all in one transaction with Firebase-user cleanup on DB rollback. **Returns the generated password ONCE.** | 409 if the email is already in use anywhere (our DB or Firebase). No promote-existing path here — Admin owns that. |
| GET | `/api/v1/dean/supervisors` | List the Supervisors this Dean has created. Faculty-scoping is derived from `User.CreatedByUserId == thisDean.UserId` (there is intentionally no cross-faculty shared pool right now). Each row includes `currentActiveInternCount` so the Dean can balance load. | Supervisors that Admin created via `/admin/supervisors` won't appear here — those are visible via `/admin/supervisors`. |

**Response contract for `POST /dean/supervisors`:**

```json
{
  "success": true,
  "message": "Supervisor account created. Share the password with them now — it will not be shown again.",
  "data": {
    "userId": "…",
    "supervisorProfileId": "…",
    "email": "…",
    "name": "…",
    "generatedPassword": "8311a803ac48X1!"
  }
}
```

`generatedPassword` is null only if the email already had a Firebase login (that case currently 409s at the top — this field is left in the schema for a possible future "reserve without creating" flow).

### 4.3 Training programs (read-only for Dean)

| Method | Path | What it does |
|---|---|---|
| GET | `/api/v1/dean/training-programs` | List programs in this Dean's faculty (id, name, academic year, semester, required hours, targets, dates, status). Populate the picker in the assign-intern form. |

Programs themselves are created by Admin at `POST /admin/training-programs`. If the Dean needs a new program, they ask Admin.

### 4.4 Intern queue & assignment (NEW / repurposed)

| Method | Path | What it does |
|---|---|---|
| GET | `/api/v1/dean/interns/unassigned` | Every PharmacyIntern whose most-recent approved application has `FacultyId == thisDean.FacultyId` AND has no `Active` `InternshipAssignment`. This is the "place these" queue the Dean's dashboard opens on. Returns `[]` when everyone is placed. Includes `applicationId` + `applicationApprovedAt` so the UI can sort/filter by wait time. |
| POST | `/api/v1/dean/internship-assignments` | Place an intern with a Supervisor. Body is the same `CreateInternshipAssignmentRequest` Admin uses, but `facultyId` MUST equal this Dean's own faculty — otherwise 403. Fields: `internUserId`, `facultyId`, `trainingProgramId`, `pharmacyId`, `branchId`, `supervisorId`, `startDate`, `expectedEndDate?`. Downstream validation: intern must hold PharmacyIntern role, supervisor profile must exist, pharmacy/branch/program must exist, program must belong to that faculty. |

### 4.5 Roster & drill-down (existed before, unchanged)

| Method | Path | What it does |
|---|---|---|
| GET | `/api/v1/dean/interns` | Paginated roster of ALL interns in this faculty — filters: `page`, `pageSize`, `trainingStatus`, `academicYear`, `search`, `pharmacyId`. |
| GET | `/api/v1/dean/interns/{assignmentId}` | Full dossier for one intern (their profile + assignment + supervisor + program + running counters). Note the id is the **`InternshipAssignment.Id`**, not the user's id. |
| GET | `/api/v1/dean/interns/{assignmentId}/clinical-operations` | The list of clinical draft submissions this intern has made, with status + supervisor decision. |
| GET | `/api/v1/dean/interns/{assignmentId}/activity-logs` | The intern's logged training hours + verification status. |
| GET | `/api/v1/dean/interns/{assignmentId}/chats` | Summaries of the intern's conversations (patient chats + AI chat if the intern is using the AI). |

### 4.6 Dashboards (existed before, unchanged)

| Method | Path | What it does |
|---|---|---|
| GET | `/api/v1/dean/dashboard/summary` | Counts + KPIs for the top of the dean's landing page. |
| GET | `/api/v1/dean/dashboard/internship-progress` | Per-intern progress bars against `TrainingProgram.RequiredTrainingHours` / target reviews / target plans. |
| GET | `/api/v1/dean/dashboard/activity-feed` | Time-ordered feed of the latest events in the faculty (draft submissions, hour logs, evaluations). Query: `limit` (default 20). |
| GET | `/api/v1/dean/partner-pharmacies` | The pharmacies that host interns from this faculty. Feed the pharmacy-branch picker in the assignment form. |

### 4.7 What the Dean cannot do (by design)

- **Cannot approve intern applications.** That stays with Admin. The intern must be `PharmacyIntern` before the Dean can even see them.
- **Cannot reset a Supervisor's password.** No `POST /dean/supervisors/{id}/reset-password` yet — Admin's Supervisor-reset lives under `/admin/supervisors` (if/when we add it). For now, use Firebase's own "forgot password" flow.
- **Cannot delete a Supervisor.** Deactivating an assignment is enough for the operational case. Hard-deleting a Supervisor account is Admin-only.
- **Cannot touch other faculties.** Every write validates `FacultyId == thisDean.FacultyId` before dispatching to the shared services.

## 5. Supervisor — every endpoint

All endpoints are under `[Authorize(Policy = "SupervisorOnly")]`. The service layer additionally requires an active `SupervisorProfile` with `IsInternshipSupervisor = true` — a user with the `Supervisor` role but a soft-deleted or inactive profile still gets rejected.

| Method | Path | What it does | Access notes |
|---|---|---|---|
| GET | `/api/v1/supervisor/my-interns` | **NEW.** List the interns whose Active `InternshipAssignment` points at the caller's `SupervisorProfile`. Returns `assignmentId`, intern name/email/phone, university + faculty names, dates, logged/verified hours, status. Only Active — history is via the Dean dashboard. | The Supervisor never sees interns they don't mentor. |
| GET | `/api/v1/supervisor/drafts` | Draft queue: every `InternClinicalDraft` submitted by any of the caller's assigned interns. Query: `page`, `pageSize`, `status` (`PendingSupervisorReview`, `Accepted`, `Rejected`). | Filtered server-side by `Assignment.SupervisorId == myProfileId`. |
| POST | `/api/v1/supervisor/drafts/{id}/approve` | Approve or reject a draft. Body: `{ decision: "Accepted"|"Rejected", feedback?: string }`. "Approve" for either decision is the misleading route name — kept for backward compatibility. | Only drafts belonging to this Supervisor's interns. |
| POST | `/api/v1/supervisor/activities/{logId}/verify` | Mark a training-hour log entry as verified — feeds the intern's `VerifiedHours` counter. | Log must belong to one of this Supervisor's interns. |
| POST | `/api/v1/supervisor/evaluations` | Submit a periodic evaluation of an intern (scores across knowledge, skills, communication, ethics + overall + comments). | Intern must be one of this Supervisor's own. |

## 6. Full request/response reference (Dean-side new endpoints)

### 6.1 `POST /api/v1/dean/supervisors`

**Request**
```json
{
  "email": "dr.mona@beni-suef-pharma.edu",
  "name": "Dr. Mona El-Sayed",
  "phone": "01001234567",
  "syndicateLicenseNumber": "SYN-2026-88213",
  "yearsOfExperience": 12,
  "maxInternCapacity": 5,
  "affiliatedPharmacyBranchId": null
}
```

**Success (200)**
```json
{
  "success": true,
  "message": "Supervisor account created. Share the password with them now — it will not be shown again.",
  "data": {
    "userId": "8fbeaa30-1c74-4bce-8a09-7fe32d5f88b1",
    "supervisorProfileId": "b1a7c92e-4a44-4731-afc0-6dfb52a2c81f",
    "email": "dr.mona@beni-suef-pharma.edu",
    "name": "Dr. Mona El-Sayed",
    "generatedPassword": "a91f4c8e771bX1!"
  }
}
```

**Failures**
- **400** — request validation (missing required field, malformed email, out-of-range experience/capacity).
- **404** — `affiliatedPharmacyBranchId` was provided but doesn't exist.
- **409** — email already exists in our DB, or already has a Firebase login.

### 6.2 `GET /api/v1/dean/supervisors`

**Success (200)**
```json
{
  "success": true,
  "message": "Success",
  "data": [
    {
      "id": "b1a7c92e-…",
      "userId": "8fbeaa30-…",
      "name": "Dr. Mona El-Sayed",
      "email": "dr.mona@beni-suef-pharma.edu",
      "phone": "01001234567",
      "syndicateLicenseNumber": "SYN-2026-88213",
      "yearsOfExperience": 12,
      "maxInternCapacity": 5,
      "currentActiveInternCount": 2,
      "affiliatedPharmacyBranchId": null,
      "isActive": true,
      "createdAt": "2026-09-30T04:12:33Z"
    }
  ]
}
```

### 6.3 `GET /api/v1/dean/training-programs`

**Success (200)**
```json
{
  "success": true,
  "data": [
    {
      "id": "…",
      "facultyId": "…",
      "facultyName": "Faculty of Pharmacy — Beni Suef University",
      "programName": "Spring 2026 Community-Pharmacy Internship",
      "academicYear": "2025-2026",
      "semester": "Spring",
      "requiredTrainingHours": 240,
      "targetPrescriptionReviews": 40,
      "targetMedicationPlans": 20,
      "startDate": "2026-02-01T00:00:00Z",
      "endDate": "2026-05-30T23:59:59Z",
      "status": "Active"
    }
  ]
}
```

### 6.4 `GET /api/v1/dean/interns/unassigned`

**Success (200)**
```json
{
  "success": true,
  "data": [
    {
      "userId": "7451e524-…",
      "name": "Hassan Alaa",
      "email": "lahsn7709@gmail.com",
      "phone": "01113927464",
      "universityName": "Beni Suef University",
      "applicationId": "fdd70769-…",
      "applicationApprovedAt": "2026-09-29T21:00:30Z"
    }
  ]
}
```

Empty array (`data: []`) means everyone in the faculty is placed. Not a 404.

### 6.5 `POST /api/v1/dean/internship-assignments`

**Request**
```json
{
  "internUserId": "7451e524-…",
  "facultyId": "<must equal your faculty id>",
  "trainingProgramId": "…",
  "pharmacyId": "44aa98a2-…",
  "branchId": "…",
  "supervisorId": "b1a7c92e-…",
  "startDate": "2026-10-01T00:00:00Z",
  "expectedEndDate": "2027-01-31T23:59:59Z"
}
```

**Success (200)**
```json
{
  "success": true,
  "message": "Intern assigned to supervisor successfully.",
  "data": {
    "id": "…",
    "internUserId": "7451e524-…",
    "internName": "Hassan Alaa",
    "facultyId": "…",
    "trainingProgramId": "…",
    "pharmacyId": "…",
    "branchId": "…",
    "supervisorId": "b1a7c92e-…",
    "startDate": "2026-10-01T00:00:00Z",
    "expectedEndDate": "2027-01-31T23:59:59Z",
    "loggedHours": 0,
    "verifiedHours": 0,
    "status": "Active"
  }
}
```

**Failures**
- **403** — `facultyId` in the body isn't your faculty.
- **404** — `internUserId` / `trainingProgramId` / `pharmacyId` / `branchId` / `supervisorId` doesn't exist.
- **400** — intern doesn't hold the PharmacyIntern role; program belongs to a different faculty; branch belongs to a different pharmacy.

## 7. Supervisor-side new endpoint

### 7.1 `GET /api/v1/supervisor/my-interns`

**Success (200)**
```json
{
  "success": true,
  "data": [
    {
      "assignmentId": "…",
      "internUserId": "7451e524-…",
      "internName": "Hassan Alaa",
      "internEmail": "lahsn7709@gmail.com",
      "internPhone": "01113927464",
      "universityName": "Beni Suef University",
      "facultyName": "Faculty of Pharmacy — Beni Suef University",
      "startDate": "2026-10-01T00:00:00Z",
      "expectedEndDate": "2027-01-31T23:59:59Z",
      "loggedHours": 42,
      "verifiedHours": 30,
      "status": "Active"
    }
  ]
}
```

Empty array when no interns are currently placed with this Supervisor. Not 404.

**Failures**
- **401** — no/expired token.
- **403** — token valid, but the user isn't a Supervisor (`"Access denied. Required roles: Supervisor."`) or their SupervisorProfile is inactive/soft-deleted (`"This account is not authorized as an internship supervisor."`).

## 8. Auth model recap

- Every request carries `Authorization: Bearer <Firebase ID token>`.
- `FirebaseAuthMiddleware` verifies the token against `pharmacare-73`, looks up the User row by FirebaseUid, and populates `HttpContext.User` with claims including every role the DB says they hold.
- ASP.NET Authorization then enforces the controller's `[Authorize(Policy = "…")]`.
- Role changes require a fresh ID token. When Admin approves an intern, or a Dean creates a Supervisor's account, or Admin adds/removes SuperAdmin — the ID token the client is holding doesn't reflect the new role until it's refreshed (`user.getIdToken(true)` in Firebase Web/Flutter SDK). The DB-side authorization is instantly correct; the client-side claims are not.
- Status enforcement: `Banned`, `Suspended`, `Rejected` users get 403 on every protected endpoint via `FirebaseAuthMiddleware`, regardless of role.

## 9. Error envelope (same for every endpoint)

Success:
```json
{ "success": true, "message": "…", "data": { … }, "errors": null, "errorCode": null, "details": null }
```

Failure (typical):
```json
{ "success": false, "message": "…", "errors": null, "errorCode": null, "details": null }
```

Failure with structured details (currently used on withdraw-application state mismatch — will grow to other rules over time):
```json
{
  "success": false,
  "message": "Only a pending application can be withdrawn. Current status: Approved.",
  "errorCode": "APPLICATION_NOT_PENDING",
  "details": { "currentStatus": "Approved", "reviewedAt": "…" }
}
```

Prefer switching on `errorCode` over matching `message` strings. Messages are copy-editable; codes are stable.

## 10. Common failure modes to expect

| Symptom | Likely cause | Fix |
|---|---|---|
| `POST /dean/supervisors` → 409 email exists | The address is already in Firebase Auth (Patient signup, previous invite, another faculty's Dean created them) | Change email, or ask Admin to promote the existing account |
| `POST /dean/internship-assignments` → 403 "You can only create assignments inside your own faculty" | `facultyId` in body doesn't match the caller Dean's faculty | Read `/dean/me` and use its `facultyId` |
| `POST /dean/internship-assignments` → 400 "Training program does not belong to the specified faculty" | The picker used a program from another faculty | Filter `/dean/training-programs` — that endpoint is already faculty-scoped |
| `POST /dean/internship-assignments` → 400 "The specified user does not hold the PharmacyIntern role" | You picked an unapproved application | Only take intern userIds from `/dean/interns/unassigned` |
| `GET /supervisor/my-interns` → 403 "This account is not authorized as an internship supervisor" | The SupervisorProfile has `IsInternshipSupervisor = false` or is soft-deleted | Ask Admin to reactivate the profile |
| `GET /intern/progress` → 403 "No active internship assignment found for this account" | The Dean hasn't placed this intern yet | Show a "waiting on your faculty" state (already handled in the app per INTERN_API_GUIDE.md) |

## 11. Quick curl reference

```bash
TOKEN='<Firebase ID token>'
BASE='http://187.7.30.23'

# --- Dean ---
curl -H "Authorization: Bearer $TOKEN" "$BASE/api/v1/dean/me"

curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "email":"dr.mona@example.com","name":"Dr. Mona","phone":"01001234567",
    "syndicateLicenseNumber":"SYN-88213","yearsOfExperience":12,
    "maxInternCapacity":5
  }' "$BASE/api/v1/dean/supervisors"

curl -H "Authorization: Bearer $TOKEN" "$BASE/api/v1/dean/supervisors"
curl -H "Authorization: Bearer $TOKEN" "$BASE/api/v1/dean/training-programs"
curl -H "Authorization: Bearer $TOKEN" "$BASE/api/v1/dean/interns/unassigned"

curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{
    "internUserId":"7451e524-e61e-4cf9-a02a-08df0cd17019",
    "facultyId":"<your faculty id>",
    "trainingProgramId":"…","pharmacyId":"…","branchId":"…",
    "supervisorId":"…",
    "startDate":"2026-10-01T00:00:00Z"
  }' "$BASE/api/v1/dean/internship-assignments"

# --- Supervisor ---
curl -H "Authorization: Bearer $TOKEN" "$BASE/api/v1/supervisor/my-interns"
curl -H "Authorization: Bearer $TOKEN" "$BASE/api/v1/supervisor/drafts?status=PendingSupervisorReview"

curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"decision":"Accepted","feedback":"Well-reasoned. Approved as-is."}' \
  "$BASE/api/v1/supervisor/drafts/<draftId>/approve"
```

## 12. Companion docs

- **INTERN_API_GUIDE.md** — everything on the intern side of this flow.
- **SUPER_ADMIN_MASTER.md / SUPER_ADMIN_GUIDE.md** — anything that requires the Super Admin.
- **DEPLOYMENT.md** — how the API is packaged and served.

## 13. Base URL note

Everything above runs on `http://187.7.30.23`. HTTPS is coming as soon as a domain is set up — the change to `https://api.<domain>` will be announced separately and should be a build-config flip on the client side, not a code change.
