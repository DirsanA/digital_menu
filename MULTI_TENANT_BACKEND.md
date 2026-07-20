# Multi-Tenant Backend Architecture — Digital Menu Platform

---

## Architecture Overview

```
Level 1: Platform (Your Company)
├── Platform Owner (Super Admin)
│   └── Manages all tenants, pricing, feature flags, analytics
│
└── Level 2: Restaurant (Tenant) ─── Completely isolated
    ├── Owner       → Everything
    ├── Manager     → Operations, Menu, Reports, Staff
    ├── Cashier     → Payments
    ├── Waiter      → Service
    └── Kitchen     → Food preparation
```

---

## Level 1: Platform (Super Admin)

**Description:** Platform-level administrator who owns the SaaS.

### Responsibilities

| Area | Actions |
|------|---------|
| **Tenants** | Create restaurant, Suspend restaurant, Delete restaurant, View all restaurants |
| **Subscriptions** | Manage subscription plans, Assign plans to tenants, Cancel/upgrade |
| **Analytics** | View platform-wide metrics (total tenants, orders, revenue) |
| **Pricing** | Create/edit/delete pricing plans, Set feature limits per plan |
| **Feature Flags** | Toggle features globally, Override per-tenant |
| **Support** | Access any tenant's data for troubleshooting |

### Authentication

```json
POST /api/admin/auth/login
Body: { "email": "super@digitalmenu.app", "password": "admin123" }
Response: { "token": "jwt...", "admin": { "id", "email", "displayName" } }
```

Uses **separate JWT** from tenant users. Token contains `{ type: "platform", role: "super_admin" }`.

---

## Level 2: Restaurant (Tenant) Roles

Each restaurant is a completely isolated tenant. Each has its own users with scoped roles.

### 1. Owner

| Area | Permission |
|------|-----------|
| Restaurant settings | ✅ Full control |
| Invite/Remove staff | ✅ Create, update, delete users |
| Billing | ✅ View invoices, manage subscription |
| Menu | ✅ CRUD items & categories |
| Tables | ✅ CRUD tables & QR codes |
| Kitchen | ✅ View & update order status |
| Orders | ✅ View all, update status, cancel |
| QR Codes | ✅ Generate & manage |
| Reports | ✅ Sales, daily revenue, expenses, taxes |
| Analytics | ✅ View all metrics |
| Subscription | ✅ View & change plan |

**Cannot:** Nothing — Owner has full access.

### 2. Manager

| Area | Permission |
|------|-----------|
| Menu | ✅ CRUD items, categories, prices, availability, images |
| Orders | ✅ View all, update status |
| Kitchen | ✅ View orders, update status |
| Reports | ✅ Sales report, daily revenue, expenses, taxes, export CSV |
| Tables | ✅ CRUD |
| Staff Schedule | ✅ CRUD |
| Invoices | ✅ View, manage |
| Expenses | ✅ CRUD |
| Users | ✅ View staff list |

**Cannot:** ❌ Delete restaurant, ❌ Change subscription, ❌ Transfer ownership, ❌ Delete users

### 3. Cashier

| Area | Permission |
|------|-----------|
| Orders | ✅ Create order, Search customer orders |
| Payments | ✅ Take payment (cash/card/mobile), Refund (optional) |
| Receipt | ✅ Print receipt (handled by frontend) |

**Cannot:** ❌ Edit menu, ❌ Manage users, ❌ Restaurant settings, ❌ View reports

### 4. Waiter

| Area | Permission |
|------|-----------|
| Tables | ✅ View table list |
| Orders | ✅ Take order (create), Update order, Request bill |
| Kitchen | ✅ Call kitchen (update status to preparing) |
| Menu | ✅ View menu items |

**Cannot:** ❌ Delete order, ❌ Manage menu, ❌ View analytics, ❌ View payments

### 5. Kitchen Staff

| Area | Permission |
|------|-----------|
| Orders | ✅ View incoming orders, Accept order, Preparing, Ready, Completed |

**Cannot:** ❌ Payments, ❌ Menu settings, ❌ Users, ❌ Reports

Kitchen only cares about food preparation. They see orders in a dedicated kitchen view.



---

## Customer (No Account)

**Description:** Customer browses menu and places orders without any account.

| Area | Permission |
|------|-----------|
| QR Code | ✅ Scan to open menu |
| Menu | ✅ Browse, View items |
| Cart | ✅ Add/remove items |
| Order | ✅ Place order, Track order status |

**No login required.** Tenant resolved from subdomain or header.

---

## Data Model

### Entity Relationship

```
PlatformAdmin (super admins, no tenant)
PricingPlan (platform-level)
FeatureFlag (platform-level)

Tenant ──1:N──> User
Tenant ──1:N──> Category
Tenant ──1:N──> Table
Tenant ──1:N──> MenuItem
Tenant ──1:N──> Order ──1:N──> Payment
Tenant ──1:N──> Expense
Tenant ──1:N──> Invoice
Tenant ──1:N──> StaffSchedule
Tenant ──1:N──> QrCode
Tenant ──1:N──> Conversation
Tenant ──1:N──> TenantDomain
Tenant ──1:1──> Subscription ──N:1──> PricingPlan
```

### Role Enum

```
UserRole: super_admin | owner | manager | cashier | waiter | kitchen_staff
```

### Key Models

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `Tenant` | Restaurant | slug, name, branding, currency, serviceCharge, isActive |
| `User` | Staff account | tenantId, email, passwordHash, role (UserRole), isActive |
| `User` (super_admin role) | Platform owner | email (unique), passwordHash, role=super_admin, tenantId=null |
| `PricingPlan` | Subscription tier | name, price, maxUsers, maxOrders, features (JSON) |
| `Subscription` | Tenant's plan | tenantId (unique), planId, status, autoRenew |
| `FeatureFlag` | Feature toggle | key (unique), enabled, tenantOverrides (JSON) |
| `Category` | Menu category | tenantId, name, sortOrder |
| `Table` | Dining table | tenantId, tableNumber, capacity, qrCode |
| `MenuItem` | Food/drink item | tenantId, name, price, category, tags, imageUrl, available |
| `Order` | Customer order | tenantId, orderNumber, tableNumber, status, items (JSONB), totals |
| `Payment` | Payment record | tenantId, orderId, amount, method, status |
| `Expense` | Business expense | tenantId, description, amount, category, date |
| `Invoice` | Billing document | tenantId, invoiceNumber, amount, tax, status |
| `StaffSchedule` | Staff shifts | tenantId, userId, dayOfWeek, startTime, endTime |
| `QrCode` | Table QR codes | tenantId, tableId, url, label |
| `Conversation` | AI chat history | tenantId, sessionId, messages (JSONB) |
| `TenantDomain` | Custom domain | tenantId, domain (unique), verified |

---

## API Endpoints & RBAC Matrix

### Public (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/menu` | List menu items for a tenant |
| POST | `/api/orders` | Create a new order |
| GET | `/api/orders/[id]` | Get order status |
| GET | `/api/categories` | List menu categories |
| POST | `/api/chat` | AI chatbot |

### Tenant Staff (JWT Required)

| Method | Endpoint | Roles |
|--------|----------|-------|
| GET | `/api/menu` | Public (no auth) |
| POST | `/api/menu` | manager, owner |
| PUT | `/api/menu/[id]` | manager, owner |
| DELETE | `/api/menu/[id]` | manager, owner |
| GET | `/api/orders` | owner, manager, cashier, waiter, kitchen_staff |
| PUT | `/api/orders/[id]/status` | owner, manager, waiter, kitchen_staff |
| GET | `/api/categories` | Public (no auth) |
| POST | `/api/categories` | manager, owner |
| PUT | `/api/categories/[id]` | manager, owner |
| DELETE | `/api/categories/[id]` | manager, owner |
| GET | `/api/tables` | owner, manager, waiter |
| POST | `/api/tables` | owner, manager |
| PUT | `/api/tables/[id]` | owner, manager |
| DELETE | `/api/tables/[id]` | owner, manager |
| GET | `/api/payments` | owner, manager, cashier |
| POST | `/api/payments` | owner, manager, cashier |
| POST | `/api/payments/[id]/refund` | owner, manager, cashier |
| GET | `/api/expenses` | owner, manager |
| POST | `/api/expenses` | owner, manager |
| PUT | `/api/expenses/[id]` | owner, manager |
| DELETE | `/api/expenses/[id]` | owner, manager |
| GET | `/api/invoices` | owner, manager |
| POST | `/api/invoices` | owner, manager |
| PUT | `/api/invoices/[id]` | owner, manager |
| PATCH | `/api/invoices/[id]` | owner, manager (mark-paid) |
| GET | `/api/staff-schedules` | owner, manager |
| POST | `/api/staff-schedules` | owner, manager |
| PUT | `/api/staff-schedules/[id]` | owner, manager |
| DELETE | `/api/staff-schedules/[id]` | owner, manager |
| GET | `/api/qrcodes` | owner |
| POST | `/api/qrcodes` | owner |
| PUT | `/api/qrcodes/[id]` | owner |
| DELETE | `/api/qrcodes/[id]` | owner |
| GET | `/api/kitchen/orders` | kitchen_staff, manager, owner |
| GET | `/api/subscriptions` | owner |
| GET | `/api/reports/sales` | owner, manager |
| GET | `/api/reports/daily-revenue` | owner, manager |
| GET | `/api/reports/expenses` | owner, manager |
| GET | `/api/reports/taxes` | owner, manager |
| GET | `/api/users` | owner, manager |
| POST | `/api/users` | owner |
| PUT | `/api/users/[id]` | owner |
| DELETE | `/api/users/[id]` | owner |
| GET | `/api/domains` | owner |
| POST | `/api/domains` | owner |
| DELETE | `/api/domains/[id]` | owner |

### Auth Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Staff login (requires tenantSlug) |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user profile |

### Super Admin (Same JWT, different role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Super Admin login (no tenantSlug) |
| GET | `/api/tenants` | List all tenants |
| POST | `/api/tenants` | Create tenant |
| GET | `/api/tenants/[id]` | Get tenant details |
| PUT | `/api/tenants/[id]` | Update tenant (suspend, etc.) |
| DELETE | `/api/tenants/[id]` | Delete tenant |
| GET | `/api/admin/analytics` | Platform-wide analytics |
| GET | `/api/admin/pricing` | List pricing plans |
| POST | `/api/admin/pricing` | Create pricing plan |
| PUT | `/api/admin/pricing/[id]` | Update pricing plan |
| DELETE | `/api/admin/pricing/[id]` | Delete pricing plan |
| GET | `/api/admin/feature-flags` | List feature flags |
| POST | `/api/admin/feature-flags` | Create feature flag |
| PUT | `/api/admin/feature-flags/[key]` | Update feature flag |
| DELETE | `/api/admin/feature-flags/[key]` | Delete feature flag |
| PATCH | `/api/admin/feature-flags/[key]` | Set tenant override |

---

## Authentication Flow

### Tenant Staff Login

```
POST /api/auth/login
Body: { email, password, tenantSlug }

1. Resolve tenant from slug
2. Find user by email within tenant
3. Verify password with bcrypt
4. Generate access token (15 min) + refresh token (7 days)
5. JWT payload: { sub: userId, tenant_id, role }
6. Return { accessToken, refreshToken, user: { id, email, displayName, role, tenantId, tenantSlug, tenantName } }
```

### Super Admin Login

```
POST /api/admin/login  (or POST /api/auth/login without tenantSlug)
Body: { email, password }

1. Find user by email with role=super_admin
2. Verify password with bcrypt
3. Generate JWT (2 hours, no tenant_id)
4. JWT payload: { sub: userId, role: "super_admin", email }
5. Return { accessToken, user: { id, email, displayName, role } }
```

### Middleware Enforcement

```javascript
// All routes use the same authenticate() function
await authenticate(request);  // Verifies JWT, returns { sub, tenant_id?, role }

// Tenant staff routes
authorize(ROLES.MANAGER, ROLES.OWNER)(user);

// Super admin routes  
authorize(ROLES.SUPER_ADMIN)(user);
```

---

## Tenant Isolation Strategy

- **Shared database** with `tenant_id` column on every tenant-scoped table
- All queries scoped via **middleware-injected** `tenant_id` (from JWT or header)
- **Composite indexes** lead with `tenant_id` for partition pruning
- UUID primary keys prevent information leakage between tenants
- `@@unique([tenantId, email])` on User ensures email uniqueness per tenant
- `@@unique([tenantId, tableNumber])` on Table ensures table uniqueness per tenant

---

## Seed Data

The seed script (`prisma/seed.js`) creates:

| Entity | Details |
|--------|---------|
| Super Admin | super@digitalmenu.app / admin123 |
| Pricing Plans | Free ($0), Pro ($29.99) |
| Feature Flags | ai_chatbot, advanced_reports, multi_language, table_management |
| Tenants | Bistro Noir, Cafe Aroma |
| Subscriptions | Bistro Noir → Pro, Cafe Aroma → Free |
| Users | 7 users per tenant (all roles) |
| Categories | 4 per tenant (Starters/Mains/Desserts/Drinks, Coffee/Pastries/Breakfast/Lunch) |
| Tables | 8 for Bistro Noir, 5 for Cafe Aroma |
| Menu Items | 5 per tenant |

All users share password: `admin123`

---

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **DB Strategy** | Shared + tenant_id | Low ops cost, easy analytics, simple migrations |
| **Tenant Resolution** | `x-tenant-slug` header | Simple, works for same-origin deployment |
| **Auth** | JWT (stateless) | No session store, easy to scale |
| **Super Admin** | Unified User model with role=super_admin | Single auth flow, same JWT, tenantId=null |
| **Roles** | Enum in schema | Type safety, DB-level validation |
| **Orders** | Items as JSONB | Flexible schema, no separate order_items table |
| **Payments** | Separate model | Track payment history, support refunds |

---

## Running the Backend

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database
npm run prisma:seed

# Start development server
npm run dev
```
