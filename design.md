# Technical Design — SampleHub

## 1. Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (SPA)                     │
│  React 19 + Inertia.js 3 + Tailwind CSS v4         │
│  shadcn/ui components (components/ui/)              │
│  Vite 8 (HMR in dev, bundled in production)         │
└──────────────────────┬──────────────────────────────┘
                       │ Inertia protocol (JSON)
┌──────────────────────▼──────────────────────────────┐
│                 Laravel 13 (PHP 8.3+)                │
│  Routes → Middleware → Controllers → Services        │
│  Inertia::render() bridges to React pages            │
│  Eloquent ORM → PostgreSQL 16                        │
│  Redis 7 (cache, sessions)                          │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              PostgreSQL 16 + Redis 7                 │
│              (via Docker Compose)                    │
└─────────────────────────────────────────────────────┘
```

No separate API layer. Inertia.js serves as the bridge — Laravel returns `Inertia::render()` responses which the React client hydrates as page components.

## 2. Directory Structure

```
app/
├── Http/
│   ├── Controllers/          # 7 controllers (one per route group)
│   │   ├── Auth/LoginController.php
│   │   ├── DashboardController.php
│   │   ├── SampleRequestController.php
│   │   ├── ApprovalController.php
│   │   ├── DispatchController.php
│   │   ├── SignOffController.php
│   │   └── AdminController.php
│   ├── Middleware/
│   │   ├── HandleInertiaRequests.php   # Shares auth + flash with React
│   │   └── RoleMiddleware.php          # Checks user->role against allowed list
│   └── Requests/             # Form request validation classes
│       ├── StoreSampleRequest.php
│       ├── UpdateApproval.php
│       ├── DispatchSample.php
│       └── StoreSignOff.php
├── Models/                   # 7 Eloquent models
├── Services/
│   ├── AuditService.php      # Append-only audit logging
│   └── InventoryService.php  # Batch allocation + dispatch logic
└── Providers/

resources/js/
├── app.tsx                   # Inertia app bootstrap
├── components/
│   ├── Layout.tsx            # Sidebar layout (desktop + mobile)
│   └── ui/                   # 15 shadcn/ui primitives
├── lib/utils.ts              # cn(), statusColor(), formatDate()
├── Pages/                    # React pages (mirrors route groups)
│   ├── Auth/Login.tsx
│   ├── Dashboard.tsx
│   ├── SampleRequests/{Create,Show}.tsx
│   ├── Approvals/{Index,Show}.tsx
│   ├── Dispatch/{Index,Show}.tsx
│   ├── SignOff/{Show,Receipt}.tsx
│   └── Admin/Index.tsx
└── types/index.d.ts          # TypeScript interfaces

routes/web.php                # All web routes (Inertia pages)
database/
├── migrations/               # 11 migrations
└── seeders/DatabaseSeeder.php
```

## 3. Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | auto-increment |
| name | varchar | |
| email | varchar unique | |
| password | varchar | hashed |
| role | enum | `sales_rep`, `manager`, `admin` |
| created_at / updated_at | timestamp | |

### products
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| sku | varchar unique | e.g., `FS-001` |
| name | varchar | e.g., `Fresubin Original` |
| description | varchar nullable | |
| storage_requirement | varchar | default: `Room temp` |
| is_active | boolean | default: true |

### inventory_batches
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| product_id | FK → products | cascade on delete |
| batch_no | varchar | e.g., `FS-001-B1042` |
| expiry_date | date | |
| on_hand | integer | physical count |
| reserved | integer | allocated but not shipped |
| location | varchar | e.g., `A-1-01` |
| status | enum | `Active`, `Expired` |

**Computed**: `remaining = on_hand - reserved`

**Indexes**: `[product_id, status]`, `expiry_date`

### sample_requests
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| request_id | varchar unique | auto: `SR-XXXXXXXX` |
| requester_id | FK → users | |
| customer_site | varchar | |
| purpose | varchar | |
| status | enum | 7 values (see lifecycle) |
| delivery_location | varchar | |
| remarks | text nullable | |
| manager_comments | text nullable | |
| approved_at | timestamp nullable | |
| dispatched_at | timestamp nullable | |
| signed_at | timestamp nullable | |

**Indexes**: `status`, `[requester_id, status]`

### sample_line_items
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| sample_request_id | FK → sample_requests | |
| product_id | FK → products | |
| inventory_batch_id | FK → inventory_batches nullable | set on dispatch |
| qty_requested | integer | |
| qty_dispatched | integer nullable | set on dispatch |

### sign_offs
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| sample_request_id | FK → sample_requests | unique |
| signer_name | varchar | |
| role | varchar | e.g., `Head of Nutrition` |
| signed_at | timestamp | |
| signature_path | varchar | file path in storage |
| stamp_path | varchar nullable | optional stamp photo |

### audit_logs
| Column | Type | Notes |
|--------|------|-------|
| id | bigint PK | |
| event_type | varchar | e.g., `request_approved` |
| actor_id | FK → users | |
| timestamp | timestamp | |
| payload_before_after | json | `{ before: {...}, after: {...} }` |
| sample_request_id | FK → sample_requests | cascade on delete |

**Indexes**: `event_type`, `sample_request_id`

## 4. Services Layer

### AuditService
```
log(eventType, sampleRequest, before?, after?) → AuditLog
```
- Always receives the SampleRequest model
- Records `Auth::id()` as actor
- Append-only, no update or delete methods

### InventoryService
```
allocateBatch(batch, quantity) → bool    // increments reserved
dispatchBatch(batch, quantity) → bool    // decrements on_hand + reserved
getAvailableBatches() → Collection       // active, ≥30 days expiry, remaining > 0
```
- `dispatchBatch` uses DB transaction
- `getAvailableBatches` filters at query + collection level

## 5. Frontend Architecture

### Inertia.js Bridge
- `HandleInertiaRequests` middleware shares `auth.user` and `flash` messages globally
- Each controller returns `Inertia::render('PageName', [...props])`
- React pages receive props as typed interfaces
- Ziggy provides Laravel route() helper in JavaScript

### Component Library
- 15 shadcn/ui components in `components/ui/`
- Configured via `components.json` (base-nova style, CSS variables)
- Theme defined in `resources/css/app.css` with Tailwind v4 `@theme` directive
- Dark mode CSS variables ready (not yet toggled in UI)

### Layout
- Fixed sidebar on desktop (lg+): 256px width, nav with icons
- Mobile: hamburger button → Sheet slide-in from left
- Active page highlighted based on `page.url`
- User info + logout at sidebar bottom

### Page Components
- Each page is a standalone React component
- Props are typed via `types/index.d.ts`
- Forms use Inertia's `useForm` hook for validation + submission
- Toast notifications via custom `useToast` hook

## 6. Routing

```php
// Guest
GET  /login              → LoginController@create
POST /login              → LoginController@store
POST /logout             → LoginController@destroy

// Authenticated
GET  /dashboard          → DashboardController@index
GET  /requests/create    → SampleRequestController@create
POST /requests           → SampleRequestController@store
POST /requests/{id}/submit → SampleRequestController@submit
GET  /requests/{id}      → SampleRequestController@show

// Manager only (role:manager)
GET  /approvals          → ApprovalController@index
GET  /approvals/{id}     → ApprovalController@show
PUT  /approvals/{id}     → ApprovalController@update

// Dispatch
GET  /dispatch           → DispatchController@index
GET  /dispatch/{id}      → DispatchController@show
POST /dispatch/{id}      → DispatchController@dispatch

// Sign-Off
GET  /sign-off/{id}      → SignOffController@show
POST /sign-off/{id}      → SignOffController@store

// Admin only (role:admin)
GET  /admin              → AdminController@index
GET  /admin/export       → AdminController@export (CSV download)
```

## 7. Validation

Form Request classes enforce rules server-side:

| Request | Key Rules |
|---------|-----------|
| StoreSampleRequest | customer_site required, line_items required (min 1), qty ≥ 1 |
| UpdateApproval | action must be `approve` or `reject`, comments required on reject |
| DispatchSample | allocations required, batch and line item must exist |
| StoreSignOff | signer_name + role required, signature_data required, stamp ≤ 5MB |

## 8. Infrastructure

- **Docker Compose**: app (PHP-FPM + Nginx), postgres, redis
- **Vite**: HMR on port 5173, build outputs to `public/build/`
- **Sessions**: database-backed (PostgreSQL)
- **Cache**: Redis
- **Storage**: local filesystem (`storage/app/public/`) with symlink to `public/storage/`