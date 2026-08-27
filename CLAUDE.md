# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Enterprise sample management system for Fresubin pharmaceutical nutrition products. Tracks sample requests from creation through approval, dispatch, and customer sign-off with full audit trail for compliance.

## Tech Stack

- **Backend**: Laravel 13, PHP 8.3+, PostgreSQL 16, Redis 7
- **Frontend**: React 19, TypeScript 7, Inertia.js 3, Tailwind CSS v4, shadcn/ui
- **Auth**: Custom `LoginController` with role-based middleware (sales_rep, manager, admin)
- **Package extras**: Ziggy (Laravel routes in JS), Spatie Query Builder 7, Zod 4

## Common Commands

```bash
# Docker (primary dev environment)
cp .env.example .env.docker   # Docker-specific env
docker compose up -d --build
# Note: .env is mounted as a volume. If you generate a key, you may need to clear the config cache:
docker compose exec app php artisan key:generate
docker compose exec app php artisan config:clear
docker compose exec app php artisan migrate --seed
docker compose exec app php artisan storage:link

# Frontend dev (run inside container or locally)
npm install
npm run dev          # Vite dev server with HMR
npm run build        # tsc + vite build (production)

# Backend
php artisan serve
php artisan migrate:fresh --seed   # Reset DB with seed data

# Testing (uses SQLite in-memory, configured in phpunit.xml)
php artisan test                          # Run all tests
php artisan test --filter=TestClassName   # Run single test class
php artisan test --filter=testMethodName # Run single test method
```

## Architecture

### Request Lifecycle (Status Flow)

```
Draft → Submitted → Pending Approval → Approved → Dispatched → Signed → Closed
                                          ↘
                                        Rejected (terminal)
```

Status is an enum on `sample_requests.status`. Each transition is gated by role middleware and logged via `AuditService`.

### Key Domain Rules

- **Batch allocation**: `InventoryService` enforces minimum 30-day expiry window (`expiringSoon(30)` scope). Batches with < 30 days to expiry are excluded from available stock.
- **Inventory accounting**: `on_hand` (physical count) minus `reserved` (allocated but not shipped) equals `remaining`. Dispatch decrements both.
- **Request ID format**: Auto-generated as `SR-XXXXXXXX` (8 random uppercase chars) on creation.
- **Sign-off**: Customer-facing mobile page with HTML canvas signature saved to `storage/app/public/signatures/`.

### Roles & Access

| Role | Middleware | Access |
|------|-----------|--------|
| sales_rep | `auth` | Create/submit requests, dispatch samples |
| manager | `role:manager` | Approve/reject requests (`/approvals/*`) |
| admin | `role:admin` | Compliance dashboard, CSV export (`/admin/*`) |

Role middleware is registered in `app/Http/Middleware/RoleMiddleware.php` — checks `$user->role` against allowed values.

### Services Layer

- **`AuditService::log()`** — Records every state change with before/after payloads to `audit_logs` table. Always pass the `SampleRequest` model.
- **`InventoryService`** — Handles batch allocation (`allocateBatch`), dispatch (`dispatchBatch`), and querying available batches. Uses DB transactions for dispatch.

### Frontend Structure

React pages live in `resources/js/Pages/` mirroring route groups:
- `Auth/Login.tsx` — Login page
- `Dashboard.tsx` — stats overview
- `SampleRequests/Create.tsx`, `Show.tsx` — request form and detail
- `Approvals/` — manager review queue
- `Dispatch/` — batch allocation UI
- `SignOff/` — mobile-optimized customer sign-off with canvas signature
- `Admin/` — compliance trail and export

Shared layout in `resources/js/Components/Layout.tsx`. shadcn/ui primitives in `resources/js/Components/ui/`.

### Database Key Tables

- `sample_requests` — core entity, indexes on `status` and `[requester_id, status]`
- `sample_line_items` — junction of request ↔ product with quantities and batch allocation
- `inventory_batches` — tracks `on_hand`, `reserved`, `expiry_date`, indexes on `[product_id, status]` and `expiry_date`
- `sign_offs` — one-to-one with sample_requests, stores signature file path
- `audit_logs` — immutable log with JSON `payload_before_after` column

## Seed Data

`DatabaseSeeder` creates 3 users (sales_rep, manager, admin), 8 Fresubin products (FS-001 through FS-008), 3 batches per product, and 15 sample requests across all statuses. Login emails: `aminah@samplehub.com`, `sarah@samplehub.com`, `admin@samplehub.com` (password: `password`).

## Testing

PHPUnit configured with SQLite in-memory, array cache/session, sync queue. Test directory has `Unit` and `Feature` suites with a shared `TestCase.php` base class.
