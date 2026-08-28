# Tasks — SampleHub

## Completed

- [x] Project setup: Laravel 13 + Inertia.js 3 + React 19 + TypeScript + Vite 8
- [x] Database migrations: users, products, inventory_batches, sample_requests, sample_line_items, sign_offs, audit_logs
- [x] Eloquent models with relationships and scopes
- [x] Seed data: 3 users, 8 products, 24 batches, 15 sample requests
- [x] Authentication: LoginController with session-based login
- [x] Role middleware: sales_rep, manager, admin
- [x] HandleInertiaRequests middleware: share auth + flash
- [x] Dashboard: stats cards, filtered table, pagination
- [x] Sample request creation: form with line items
- [x] Request submission: draft → pending approval
- [x] Approval queue: manager review, approve/reject with comments
- [x] Dispatch: batch allocation with search popover, confirmation dialog
- [x] Sign-off: mobile canvas signature, stamp upload
- [x] Admin: compliance view, search, filter, CSV export
- [x] AuditService: append-only state change logging
- [x] InventoryService: batch allocation, dispatch, expiry filtering
- [x] Sidebar navigation: desktop fixed + mobile sheet
- [x] shadcn/ui: initialized with 15 components, components.json configured
- [x] Tailwind CSS v4: theme variables, dark mode ready
- [x] TypeScript types: all interfaces defined in types/index.d.ts

## In Progress

_None._

## To Do — CRUD (Core Missing Features)

### Sample Requests
- [ ] Edit request — update customer_site, purpose, delivery_location, remarks while in Draft
- [ ] Edit line items — add/remove/edit products and quantities while in Draft
- [ ] Delete request — soft delete Draft requests only

### Users (Admin only)
- [ ] User list page — table with name, email, role, created date
- [ ] Create user — form with name, email, password, role select
- [ ] Edit user — update name, email, role
- [ ] Delete user — soft delete, prevent self-deletion
- [ ] Reset user password — admin can set new password

### Products (Admin only)
- [ ] Product list page — table with sku, name, storage, active status
- [ ] Create product — form with sku, name, description, storage_requirement
- [ ] Edit product — update details, toggle is_active
- [ ] Delete product — soft delete, prevent if linked to requests

### Inventory Batches (Admin only)
- [ ] Batch list page — table with batch_no, product, expiry, on_hand, reserved, status
- [ ] Create batch — form with product select, batch_no, expiry, quantity, location
- [ ] Edit batch — adjust on_hand count, update location
- [ ] Delete batch — soft delete, prevent if has active reservations
- [ ] Bulk import — CSV upload for batch data

## To Do — UI Improvements

- [ ] Add `Avatar` shadcn component — replace manual initial-letter divs
- [ ] Add `Skeleton` loading states — dashboard stats and tables flash empty
- [ ] Add `Toast` integration with flash messages — `flash.success`/`flash.error` in props but never displayed
- [ ] Add `Pagination` component — replace hand-rolled pagination in Dashboard
- [ ] Add `Breadcrumb` — nested pages lack navigation context
- [ ] Add `DropdownMenu` — user avatar menu (currently plain logout button)
- [ ] Add responsive table wrapper — tables overflow on small screens

## To Do — Error Handling

- [ ] Create 404 page — broken links show Laravel default error page
- [ ] Create global error boundary — React errors crash the entire page
- [ ] Add flash message toast notifications — redirect with `->with('success', ...)` but no UI feedback

## To Do — Auth & Security

- [ ] Add password reset flow — currently no self-service recovery
- [ ] Add email verification — `verified` middleware is active but no verification flow
- [ ] Add rate limiting on login endpoint — prevent brute force
- [ ] Add session timeout — auto-logout after inactivity
- [ ] Add CSRF token validation on sign-off form — signature submission is sensitive

## To Do — Inventory

- [ ] Add low-stock alerts — warn when batch remaining < threshold
- [ ] Add batch expiry warnings — highlight batches approaching 30-day cutoff
- [ ] Add inventory dashboard widget — show stock levels per product
- [ ] Add batch status toggle — manual mark as Expired without waiting for dispatch

## To Do — Admin

- [ ] Add user management page — create/edit users, assign roles
- [ ] Add product management page — add/edit products, toggle active status
- [ ] Add batch management page — add batches, adjust stock counts
- [ ] Add CSV import for batch data — bulk upload inventory
- [ ] Add audit log filtering — by date range, event type, actor

## To Do — Notifications

- [ ] Add in-app notification bell — manager alerted when requests need approval
- [ ] Add email notifications — notify requester on approval/rejection
- [ ] Add email notifications — notify requester on dispatch
- [ ] Add email notifications — send sign-off link to customer

## To Do — Reporting

- [ ] Add dashboard charts — requests over time, status distribution
- [ ] Add per-rep metrics — requests created, approval rate, average time
- [ ] Add product usage report — which products are sampled most
- [ ] Add compliance report — requests missing sign-off, overdue approvals

## To Do — Mobile

- [ ] Optimize sign-off page for mobile devices — test on real devices
- [ ] Add PWA manifest — installable on customer phones
- [ ] Add offline support for signature canvas — save locally if no connection

## To Do — Testing

- [ ] Add feature tests for request lifecycle — create, submit, approve, dispatch, sign-off
- [ ] Add feature tests for role enforcement — each role can only access allowed routes
- [ ] Add feature tests for inventory rules — expiry window, insufficient stock
- [ ] Add feature tests for audit logging — every transition produces a log entry
- [ ] Add unit tests for InventoryService — allocate, dispatch, available batches
- [ ] Add unit tests for AuditService — log creation, payload structure

## To Do — DevOps

- [ ] Add CI pipeline — run tests + build on push
- [ ] Add PHPStan or Larastan — static analysis
- [ ] Add Pint config — code style enforcement
- [ ] Add production Docker optimization — opcache, cached config