# Dr. Sunday Okafor — Portfolio Backend

## Stack
- **Next.js 15** (App Router, TypeScript)
- **Resend** — Transactional email
- **Zod** — Form validation

No database. No auth. When someone fills the contact form:
1. An email lands in the doctor's inbox with full message details + a Reply button
2. The visitor gets a confirmation email

---

## Setup (2 Steps)

### Step 1 — Environment Variables
```bash
cp .env.example .env.local
```
Fill in `.env.local`:
- `RESEND_API_KEY` — from https://resend.com → API Keys
- `DOCTOR_EMAIL` — Dr. Okafor's actual inbox
- `FROM_EMAIL` — use `onboarding@resend.dev` for dev, a verified domain for prod

### Step 2 — Run
```bash
npm install
npm run dev
```

---

## API

### `POST /api/contact`
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "subject": "Consultation Request",
  "message": "I would like to schedule..."
}
```
**Response:** `{ "success": true, "message": "Your message has been sent successfully." }`

---

## Deployment (Vercel)
1. Push to GitHub
2. Import in Vercel
3. Add the 3 env vars from `.env.example` under Environment Variables
4. Deploy
