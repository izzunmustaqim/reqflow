# Specification — SampleHub

## 1. Purpose

SampleHub is an enterprise sample request management system for Fresubin pharmaceutical nutrition products. It tracks sample requests from creation through approval, dispatch, and customer sign-off with a full audit trail for regulatory compliance.

## 2. Users & Roles

| Role | Description | Access |
|------|-------------|--------|
| Sales Representative | Field rep who creates and dispatches sample requests | Create requests, submit for approval, dispatch samples |
| Manager | Department head who approves or rejects requests | Review pending requests, approve/reject with comments |
| Admin | Compliance officer with full system access | View all requests, audit trail, CSV export |

## 3. Request Lifecycle

```
Draft → Pending Approval → Approved → Dispatched → Signed → Closed
                ↓
            Rejected (returns to Draft)
```

| Status | Trigger | Actor |
|--------|---------|-------|
| Draft | Request created | Sales Rep |
| Pending Approval | Request submitted | Sales Rep |
| Approved | Manager approves | Manager |
| Rejected | Manager rejects (→ Draft) | Manager |
| Dispatched | Batch allocated and shipped | Sales Rep |
| Signed | Customer signs off | Customer (via link) |
| Closed | Terminal state | System |

## 4. Features

### 4.1 Authentication
- Email + password login
- Session-based (Laravel sessions)
- Role-based middleware enforces access per route
- No public registration (admin creates users)

### 4.2 Dashboard
- Stats cards: total, pending, approved, dispatched, signed requests
- Filterable request table by status (tabs)
- Paginated results (15 per page)
- Sales reps see only their own requests; managers/admins see all

### 4.3 Sample Request Creation
- Select customer site (free text)
- Enter purpose and delivery location
- Add line items: product + quantity (min 1)
- Optional remarks
- Saved as Draft status
- Request ID auto-generated: `SR-XXXXXXXX` (8 random uppercase chars)

### 4.4 Submission
- Sales rep submits draft → status becomes Pending Approval
- Only the requester can submit their own draft
- Audit log records state transition

### 4.5 Approval
- Manager sees a queue of pending requests
- Can view full request details before deciding
- Approve: sets status to Approved, records timestamp and comments
- Reject: returns to Draft status with mandatory comments
- Both actions are audit-logged

### 4.6 Dispatch
- Sales rep sees a queue of approved requests
- For each line item, select an inventory batch and quantity
- Batch rules:
  - Only Active batches with expiry ≥ 30 days are available
  - Dispatch quantity cannot exceed batch remaining (on_hand − reserved)
- Dispatch decrements both on_hand and reserved in the batch
- Confirmation dialog before final dispatch
- Audit log records state transition

### 4.7 Customer Sign-Off
- Mobile-optimized page (customer opens on their device)
- Shows request details and line items
- Customer enters name and role
- Draws signature on HTML canvas
- Optional: upload corporate stamp photo
- Signature saved as PNG to storage
- Status changes to Signed

### 4.8 Admin Compliance
- View all requests across all statuses
- Search by request ID or customer site
- Filter by status
- Full audit log viewer with actor names and timestamps
- CSV export of all request data (one row per line item)

## 5. Inventory Rules

- `remaining = on_hand − reserved`
- Batches with < 30 days to expiry are excluded from available stock
- Dispatch decrements both `on_hand` and `reserved`
- If `on_hand` reaches 0 after dispatch, batch status changes to Expired
- Minimum 30-day expiry window enforced at query level

## 6. Audit Trail

Every state transition is recorded with:
- Event type (e.g., `request_created`, `request_approved`)
- Actor (user who performed the action)
- Timestamp
- Before/after payload (full model state as JSON)

Audit logs are append-only. No edit or delete capability.

## 7. Non-Functional Requirements

- **Responsive**: Sidebar navigation works on desktop and mobile
- **Role enforcement**: Server-side middleware, not just UI hiding
- **Data integrity**: Dispatch uses DB transactions
- **Validation**: Form requests validate all inputs server-side
- **Type safety**: TypeScript on frontend, PHP 8.3+ on backend

## 8. Seed Data

On `php artisan migrate --seed`:
- 3 users (sales_rep, manager, admin)
- 8 Fresubin products (FS-001 through FS-008)
- 3 batches per product (24 total)
- 15 sample requests across all statuses

| Role | Email | Password |
|------|-------|----------|
| Sales Rep | aminah@samplehub.com | password |
| Manager | sarah@samplehub.com | password |
| Admin | admin@samplehub.com | password |