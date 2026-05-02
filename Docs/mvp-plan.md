# MechVi — MVP plan (launch-focused)

**Related docs (same folder):** `mechvi-vision.md`, `investor-pitch.md`

This file turns the product vision and pitch roadmap into a **minimal shippable MVP** and a short post-launch sequence. It is meant for execution, not fundraising narrative.

---

## 1. What the MVP must prove

1. A user can **identify a vehicle** (guided selection) and get a **credible, structured verdict** (good / mixed / lemon, risks, costs snapshot, quick checks).
2. **Free tier is intentionally limited** (~3 uses per month per user, per vision) so the funnel toward paid report or subscription is real.
3. **Accounts work** (register, login) so usage and future entitlements can attach to a person.
4. The experience is **safe to run in production** (secrets, DB, no open-ended API abuse).

Out of scope for **first public cut** (can follow quickly): real payments (Stripe), persisted “garage”, push/email alerts, marketplace, chat-by-symptoms, OBD.

---

## 2. MVP scope vs vision (`mechvi-vision.md`)

| Vision element | MVP (first release) | Later |
|----------------|---------------------|--------|
| Guided brand → model → year → specs | **Yes** (static lists OK) | Richer vehicle data / APIs |
| Quick verdict + fuller report | **Quick yes**; full report **UX yes**, payment **placeholder or manual** | Stripe + credits |
| ~3 free tries then block | **Yes** (must apply to **all** callers you allow, including anonymous if you keep anonymous access) | Tune limits via env |
| Garage + km + driving routine | **No** (not persisted) | DB models + forms |
| Personalized maintenance + notifications | **No** | Scheduler + messaging |
| Marketplace / sponsored shops | **No** | Partner integrations |

---

## 3. MVP scope vs pitch Phase 1 (`investor-pitch.md`)

Pitch “Fase 1 — MVP” lists: pre-purchase report, vehicle registration, basic maintenance plan, simple alerts.

**Pragmatic interpretation for v0:**

- **Pre-purchase report:** ship the **quick verdict** path end-to-end; treat “full report” as gated behind payment when ready.
- **Vehicle registration:** ship **account + session**; “garage” can be a **single last-used vehicle** in UI state only, or deferred.
- **Basic plan + alerts:** **defer** or stub in copy only — do not block launch on cron, email, or push.

---

## 4. Launch checklist (engineering)

1. **Database:** `DATABASE_URL` set; run migrations. For serverless hosting, use a **hosted** database (e.g. Postgres), not SQLite on ephemeral disk.
2. **Auth:** `AUTH_SECRET` (and correct public URL / trust host for your provider).
3. **OpenAI:** `OPENAI_API_KEY`; confirm model env vars match models your account can call.
4. **Build:** `npm run build` clean; smoke: register → login → vehicle → quick verdict.
5. **Production hygiene:** protect or remove debug endpoints (`/api/test-openai`, `/api/debug-usage`).
6. **Quota fairness:** increment usage **after** a successful model response (when you change app code).

---

## 5. Success criteria (first 2 weeks live)

- Median time from landing to first verdict **under 2 minutes** for a motivated user.
- No mystery 500s on core path; error messages safe (no secrets in JSON).
- Observable cost per active user within an acceptable band (limits enforced).

---

## 6. Suggested order after v0 (still small steps)

1. **Stripe** (or equivalent): one-off report + subscription; wire `tier` / `reportCredits` in DB.
2. **Anonymous policy:** require login for `/api/ask`, or enforce a strict anonymous cap — pick one and document it.
3. **Garage v1:** save one vehicle per user; optional odometer field.
4. **Alerts v0:** email digest or in-app “next service” hints — no push required.

---

## 7. Document locations

All product docs live under **`Docs/`** (capital D, project root):

- `Docs/mechvi-vision.md`
- `Docs/investor-pitch.md`
- `Docs/mvp-plan.md` (this file)
