# Sample Management System

Enterprise Sample Management System for Fresubin pharmaceutical nutrition products. Tracks sample requests from creation through approval, dispatch, and customer sign-off with full audit trail for compliance.

## Tech Stack

- **Backend**: Laravel 13, PHP 8.3+, PostgreSQL 16, Redis 7
- **Frontend**: React 19, TypeScript 7, Inertia.js 3, Tailwind CSS v4, shadcn/ui
- **Auth**: Custom `LoginController` with role-based middleware (sales_rep, manager, admin)
- **Extras**: Ziggy (Laravel routes in JS), Spatie Query Builder 7, Zod 4
- **Containerization**: Docker multi-stage build (Node → Composer → PHP-FPM + Nginx)

## Quick Start (Docker)

```bash
cp .env.example .env.docker   # Docker-specific env (or use .env)
docker compose up -d --build
docker compose exec app php artisan key:generate
docker compose exec app php artisan config:clear
docker compose exec app php artisan migrate --seed
docker compose exec app php artisan storage:link
```

Access: http://localhost:8000

## Authentication & Login Credentials

Authentication is handled via a custom `LoginController` and `Auth/Login.tsx` React component.

| Role | Email | Password |
|------|-------|----------|
| Sales Rep | aminah@samplehub.com | password |
| Manager | sarah@samplehub.com | password |
| Admin | admin@samplehub.com | password |

## Workflow

```
Draft → Submitted → Pending Approval → Approved → Dispatched → Signed → Closed
                                          ↘
                                        Rejected (terminal)
```

1. **Sales Rep** creates a Draft sample request with Fresubin SKUs
2. **Sales Rep** submits → status becomes "Pending Approval"
3. **Manager** reviews, approves or rejects with comments
4. **Sales Rep** dispatches with batch allocation (expiry ≥ 30 days enforced)
5. **Customer** signs off on a mobile-optimized page with canvas signature
6. **Admin** views full compliance trail and exports CSV

## Development

```bash
npm install
npm run dev          # Vite dev server with HMR
npm run build        # tsc + vite build (production)
php artisan serve    # Laravel dev server
```

### Adding shadcn/ui Components

```bash
npx shadcn@latest add avatar
npx shadcn@latest add dropdown-menu
npx shadcn@latest add skeleton
```

## Testing

PHPUnit with SQLite in-memory (configured in `phpunit.xml`).

```bash
php artisan test                          # Run all tests
php artisan test --filter=TestClassName   # Run single test class
php artisan test --filter=testMethodName  # Run single test method
```

## Project Structure

```
app/Http/Controllers/    → Inertia controllers (per route group)
app/Http/Middleware/      → RoleMiddleware, HandleInertiaRequests
app/Models/              → Eloquent models with relationships
app/Services/            → AuditService, InventoryService
resources/js/Pages/      → React pages (Inertia), mirrors route groups
resources/js/components/ → Layout.tsx + shadcn/ui primitives (ui/)
database/migrations/     → Full schema (11 migrations)
database/seeders/        → Realistic sample data (3 users, 8 products, 15 requests)
docker/                  → nginx.conf + supervisord.conf
tests/                   → Unit + Feature suites (PHPUnit, SQLite in-memory)
```
