# Sample Management System

Enterprise Sample Management System for Fresubin products built with Laravel 11, Inertia.js, React, TypeScript, and shadcn/ui.

## Tech Stack
- **Backend**: Laravel 11 + PHP 8.3
- **Frontend**: React 19 + TypeScript + Inertia.js
- **UI**: shadcn/ui components + Tailwind CSS v4
- **Database**: PostgreSQL 16
- **Cache/Queue**: Redis 7
- **Containerization**: Docker (multi-stage build)

## Quick Start (Docker)
```bash
cp .env.example .env
# Generate APP_KEY after container is running, or set it in .env
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
1. **Sales Rep** creates a Draft sample request with Fresubin SKUs
2. **Sales Rep** submits → status becomes "Pending Approval"
3. **Manager** reviews, approves or rejects with comments
4. **Sales Rep** dispatches with batch allocation (expiry ≥ 30 days enforced)
5. **Customer** signs off on a mobile-optimized page with canvas signature
6. **Admin** views full compliance trail and exports CSV

## Development
```bash
npm install
npm run dev  # Vite dev server
php artisan serve  # Laravel dev server
```

## Structure
```
app/Http/Controllers/    → Inertia controllers
app/Models/              → Eloquent models with relationships
app/Services/            → AuditService, InventoryService
resources/js/Pages/      → React pages (Inertia)
resources/js/Components/ → Layout + shadcn/ui primitives
database/migrations/     → Full schema
database/seeders/        → Realistic sample data
docker/                  → Nginx + Supervisor configs
```
