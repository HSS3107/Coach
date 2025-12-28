# Coach AI – Product Requirements Document (PRD)

## Version: 1.1.1
## Platform: Mobile‑first Web App (Responsive for Desktop)
## Scope: MVP (End‑to‑end UX + System Behavior)
## Status: Dev‑ready

---

## 1. Product Vision

Coach AI is a mobile‑first health and weight‑management web application that helps users build sustainable habits through:
- Simple, real‑world event logging
- Asynchronous, contextual AI coaching
- Clear progress tracking against personal goals

The product should feel like a **personal coach**, not a data‑entry system.

---

## 2. Core Product Principles

1. Mobile‑first, thumb‑friendly UX
2. Goals define all context
3. One event = one source of truth
4. AI never blocks user actions
5. Users always know what to do next

---

## 3. First‑Time User Experience (Mandatory)

### 3.1 Entry Flow

1. Google Sign‑In
2. Welcome Screen (single screen, skippable)
3. Goal Setup (mandatory)
4. Profile Setup (mandatory)
5. Land on **Progress & Analysis** screen

**Rules**
- Users cannot log any event until Goal + Profile are completed
- If user exits mid‑flow, resume from last incomplete step

---

## 4. Profile Setup (Mandatory)

**Fields**
- Gender
- Date of Birth
- Height

**Rules**
- All fields mandatory
- Used by AI for interpretation and recommendations

---

## 5. Goals System

### 5.1 Goal Creation & Editing

**Fields**
- Goal Type (Weight Loss, Maintenance, etc.)
- Goal Description (free text)
- Start Weight (optional if already logged)
- Target Weight (mandatory)
- Timeline (target date or duration)

**Actions**
- Save Goal
- Edit Goal
- Mark Goal as Completed

**Rules**
- Only one goal can be active at a time
- Completed goals move to maintenance
- User is prompted to create a new goal after completion

---

## 6. Navigation Model

### 6.1 Mobile Navigation (Primary)

- Hamburger Menu (top‑left)
- Persistent Bottom Primary CTA: **Log Event**

### 6.2 Desktop Navigation (Responsive)

- Hamburger expands into collapsible side navigation
- Primary **Log Event** CTA appears as a fixed action button

### 6.3 Navigation Items

- Progress & Analysis
- All Logs
- Goals
- Profile
- Settings

---

## 7. Core Screens

### 7.1 Progress & Analysis (Default Landing)

- Active goal status
- Weight trend graph
- AI‑generated summary (weekly/monthly context)
- Entry point to **Global Chat** (read/respond only)

---

### 7.2 Log Event (Primary Action)

User selects one event type:
- WEIGHT
- FOOD
- BODY_PHOTO
- MEDICAL
- NOTE

Saving creates **one master log and one chat**.

---

### 7.3 All Logs

- Chronological list of logs
- Tap log → open event‑bound chat
- Edit log option

---

### 7.4 Goals

- View active goal
- View completed goals
- Edit or complete goal

---

### 7.5 Profile

- View / edit gender, DOB, height

---

## 8. Event Logging System

### 8.1 Event Model

- One `master_log` per event
- A single event may contain multiple structured fields
- Composite events must never create multiple logs or chats

---

### 8.2 Mandatory Inputs by Event Type

**WEIGHT**
- Weight value (mandatory)

**FOOD**
- Minimum 1 image (mandatory)
- Description (mandatory)

**BODY_PHOTO**
- Minimum 1 image (mandatory)
- Optional weight

**MEDICAL**
- PDF or image (mandatory)

**NOTE**
- Free text (mandatory)

---

## 9. Food Logging (Explicit Requirement)

Food logging is **image + description based**.

**Validation Rules**
- `resource_ids.length >= 1`
- `structured_data.description` must be present

Text‑only food logs are not allowed.

---

## 10. Editing Logs

### 10.1 UX Flow

1. Open **All Logs**
2. Select a log
3. Tap **Edit**
4. Update data and save

### 10.2 System Behavior

- Same chat thread is reused
- AI re‑analysis triggered asynchronously
- Summaries invalidated and recomputed forward

---

## 11. Chat System

### 11.1 Event‑Bound Chats

- Exactly one chat per event
- Chat opens immediately after save
- AI message arrives asynchronously
- Chats can be reopened or archived

---

### 11.2 Global Chat

- Accessible from Progress & Analysis
- Read/respond only
- Cannot create or modify logs
- Used to discuss summaries and insights

---

## 12. AI Coaching System

### 12.1 Trigger Rules

- Every event auto‑triggers AI
- AI response is mandatory
- Execution is asynchronous

### 12.2 AI States

- PENDING
- COMPLETED
- FAILED

### 12.3 UX Behavior

- Placeholder shown while pending
- Slow response message after ~10 seconds
- Failure message with retry option

---

## 13. AI Context & Privacy

### 13.1 AI Context

AI receives:
1. Active goal (or most recently completed)
2. User profile data
3. Last 7 days of raw logs
4. All summaries (weekly → lifetime)

### 13.2 Privacy Rules

AI must NOT receive:
- Phone number
- Email address
- Exact address or PII identifiers

---

## 14. Resources & Uploads

**Images**
- JPG, PNG, HEIC
- Max 20 MB per image
- Max 5 images per event

**Documents**
- PDF only
- Max 30 MB
- OCR only for image‑based PDFs (first 10 pages)

Uploads must never block event saving.

---

## 15. Summaries System

- Weekly, Monthly, Yearly, Lifetime
- Near real‑time updates
- Editing a log invalidates summaries forward
- Users can view but not edit summaries

---

## 16. Validation Rules

**Blocking**
- Missing mandatory fields
- Unsupported or corrupted files

**Warnings**
- Extreme values (e.g., 500kg)
- Suspected wrong category uploads

---

## 17. Metrics (MVP)

1. Events logged per user per week
2. % events where AI response is viewed
3. % chats with user reply
4. Log edit rate
5. AI usefulness 👍 / 👎

---

## 18. Out of Scope (MVP)

- Video uploads
- Chat‑driven log creation
- Manual summary editing
- Advanced AI explainability
- Long‑term event versioning

---

## 19. Success Criteria

- Users complete onboarding without confusion
- Goals clearly anchor user behavior
- Logging is fast and intuitive on mobile
- Desktop experience remains equally usable
- AI responses feel timely and contextual

---

**End of PRD v1.1.1**