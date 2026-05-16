# Goodwell Service OS

## What This Is

An all-in-one business management platform for the Goodwell.uz after-sales service center — a single branch of the Goodwell Group specializing in kitchen appliance repairs, spare parts management, and customer service in Central Asia. The platform replaces a fragmented mix of paper records, phone calls, and spreadsheets with a unified digital system covering the full service lifecycle: from customer intake through repair completion, parts tracking, invoicing, and management analytics.

## Core Value

A master (technician) can open their phone, see their assigned jobs, check what spare parts are available for that appliance model, take a part from stock, and log it against the job — all without asking anyone or writing anything on paper.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Staff can log in via phone number + OTP (no passwords)
- [ ] Role-based access: Admin, Receptionist, Master/Technician, Warehouse Manager, Executive (read-only dashboard)
- [ ] Customer profiles with contact history and appliance records
- [ ] Service orders created for both walk-in and remote (phone) customers
- [ ] Service order lifecycle: Intake → Assigned → Diagnosed → Parts Requested → In Repair → Ready → Closed
- [ ] Masters assigned to service orders and can update job status from their device
- [ ] Product catalog: appliance types, models, and modifications tracked by year/Proforma Invoice
- [ ] BOM (Bill of Materials) per model version: PDF exploded view + Excel spare parts list stored and searchable
- [ ] Masters can search spare parts by appliance model/part code directly in the app
- [ ] Spare parts inventory with stock levels (bulk stock + per-order tracking)
- [ ] Part usage logged per service order: which master, which job, which model, supplier, cost price
- [ ] Warehouse receives both bulk stock orders and per-job special orders
- [ ] Invoice generation per service order with payment tracking
- [ ] Expense tracking for parts and labor costs
- [ ] Customer satisfaction ratings — displayed on dashboard, staff can respond, auto+manual updates
- [ ] Executive dashboard: KPIs, order volume, revenue, master performance, parts consumption
- [ ] Reports: per master, per appliance model, per period, parts usage analytics
- [ ] Multilingual UI: Uzbek (primary), Russian, English

### Out of Scope

- Native mobile app (iOS/Android) — responsive web is sufficient for v1
- Public customer portal — internal staff use only for v1
- Real-time chat between customers and staff — phone/WhatsApp for now
- Automated SMS notifications to customers — manual contact in v1
- Multi-branch support — single Goodwell.uz service branch for v1
- E-commerce / online spare parts store — internal inventory only
- Integration with supplier ordering systems — manual procurement in v1

## Context

**Business domain:** After-sales service for Goodwell-branded OEM kitchen appliances (refrigerators, washing machines, ovens, etc.). Products are manufactured by OEM partners in China, Turkey, and EU countries under the Goodwell brand for the Central Asian market.

**Product complexity:** The same appliance model can have different internal configurations depending on the production year and Proforma Invoice (supplier contract version). This means BOM files are version-specific — a 2022 and 2024 refrigerator of the same model may have different spare parts.

**Current workflow:** Paper-based intake forms, phone/WhatsApp coordination between receptionist and masters, Excel spreadsheets for inventory, no unified customer history. Pain points: lost order history, unknown stock levels, no master accountability for parts usage, no analytics.

**Repair workflow:** Two entry points — (1) customer calls, receptionist creates order, assigns master, master diagnoses remotely or customer brings device in; (2) customer walks in, on-site diagnosis, quote given, repair proceeds. Both flows converge at the same order lifecycle.

**Team size:** 10–50 internal users across roles. No public-facing features in v1.

**Tech stack (decided):** Next.js 16 + TypeScript + App Router, Tailwind CSS 4, PostgreSQL + Prisma ORM, tRPC, next-intl (uz/ru/en), shadcn/ui. Phone OTP auth via Eskiz.uz SMS provider.

## Constraints

- **Language**: Uzbek-first UI with Russian and English — all user-facing strings must be translatable via next-intl
- **Auth**: Phone number + OTP only — no email/password, no OAuth
- **Deployment**: Single-tenant — one installation for one service center branch
- **File storage**: BOM files (PDF + Excel) must be stored and served — requires file storage solution (local or cloud)
- **Offline**: No offline requirement — stable internet assumed at service center
- **Existing codebase**: Next.js 16 scaffold in `goodwell-service-os/` subdirectory — all new code lives there

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Phone OTP auth (Eskiz.uz) | Local Uzbekistan market, staff don't use work emails consistently | — Pending |
| Multilingual from day one | Staff mix of Uzbek/Russian speakers; future-proofing for English-speaking management | — Pending |
| BOM searchable (not just stored) | Masters need to look up parts by code during a job — file download alone is too slow | — Pending |
| Responsive web only (no native app) | Faster to build, masters have smartphones with browsers | — Pending |
| Single-tenant deployment | One branch, one database — simpler, cheaper, faster for v1 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-16 after initialization*
