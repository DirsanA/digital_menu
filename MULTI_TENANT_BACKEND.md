# Multi-Tenant Backend Architecture — Digital Menu Platform

---

## 1. Current Frontend Overview

### Framework & Routing
- **Next.js 16** (App Router) — single-page app with file-system routing
- Two pages: `/` (customer menu/ordering), `/admin` (staff dashboard)
- Navigation via Next.js `<Link>` and `usePathname()` — no React Router
- **No authentication middleware** — `/admin` is publicly accessible

### Authentication Flow
- **Nothing implemented.** No login page, no JWT, no session storage, no protected routes
- Admin access is controlled only by URL navigation (toggle button in Navbar)
- No auth headers are sent with any API request

### API Integration
- Base URL is hardcoded as `const API_BASE = '/api'` (relative — expects same-origin proxy)
- Uses **native `fetch()`** — no Axios, no interceptors, no shared error handling
- API endpoints consumed by the frontend:

| Endpoint | Method | Where Used |
|---|---|---|
| `/api/menu` | GET | CartContext — initial menu load |
| `/api/menu` | POST | AdminView — create menu item (FormData) |
| `/api/menu/[id]` | PUT | AdminView — update item (FormData or JSON) |
| `/api/menu/[id]` | DELETE | AdminView — delete item |
| `/api/orders` | GET | AdminView — poll every 5s |
| `/api/orders` | POST | CartContext — submit order (JSON) |
| `/api/orders/[id]` | GET | CartContext — poll order status every 12s |
| `/api/orders/[id]/status` | PUT | AdminView — transition order status |
| `/api/chat` | POST | LandingChatbot — AI chat (Groq proxy) |

- No tenant ID, auth token, or restaurant identifier is sent in any request
- Response format is consistently `{ success: boolean, data: ..., message: string }`

### Data Shape (from `src/lib/db.js`)
**Menu item:**
```json
{ "id": "string", "name": "string", "price": number, "description": "string",
  "category": "string", "tags": ["string"], "available": boolean, "image": "string" }
```

**Order:**
```json
{ "id": "string", "tableNumber": number, "items": [{ "id": "string", "name": "string",
  "price": number, "image": "string", "quantity": number, "customizations": "string" }],
  "notes": "string", "status": "pending|preparing|ready|completed|cancelled",
  "totalAmount": number, "createdAt": "ISO", "updatedAt": "ISO" }
```

**Response envelope:**
```json
{ "success": true/false, "data": ..., "message": "string (on error)" }
```

---

## 2. Tenant Identification Strategy

### Recommendation: Subdomain-Based Tenant Resolution

```
https://bistronoir.digitalmenu.app  →  tenant: bistronoir
https://laperla.digitalmenu.app     →  tenant: laperla
https://admin.digitalmenu.app        →  tenant admin portal (staff login)
```

### Why Subdomain
- **QR codes on tables** scan naturally to `restaurant-slug.digitalmenu.app/menu`
- **DNS** handles routing, wildcard `*.digitalmenu.app` resolves to the load balancer
- **SSL** works via wildcard cert `*.digitalmenu.app`
- Each restaurant can later add a **custom domain** (CNAME → `digitalmenu.app`)
- Subdomain is visible in `Host` header at the reverse proxy layer

### Fallback: Custom Domain Support
- Restaurant maps `theirdomain.com` → CNAME → `digitalmenu.app`
- Backend looks up `Host` header in a `tenant_domains` table to resolve tenant
- Same middleware logic — just an additional lookup path

### Current Frontend Adaptation Required
- The `Navbar` and `CartContext` currently use fixed `/api` URLs — no change needed if backend is same-origin
- Customer view must read `window.location.hostname` to extract subdomain (for display/branding)
- Admin login page must be added (new route `/admin/login`)
- The "Bistro Noir" hardcoded brand must be replaced with dynamic tenant branding

---

## 3. Recommended Multi-Tenancy Model

### Decision: Shared Database with `tenant_id` Column

| Model | Pros | Cons | Verdict |
|---|---|---|---|
| **Shared DB + tenant_id** | Low ops cost; easy cross-tenant queries; simple migrations; single connection pool | Risk of tenant_id leak in queries; row-level security needed; harder to isolate noisy neighbors | **Recommended** for this use case |
| Schema-per-tenant | Strong isolation; separate migrations per tenant | Complex migrations at scale; connection pool multiplied; difficult analytics | Overkill for menu/ordering data |
| Database-per-tenant | Maximum isolation; backup/restore per tenant | Massive ops overhead; connection explosion; expensive at 100+ tenants | Only for enterprise compliance |

### Rationale
- Each restaurant's data volume is small (hundreds of menu items, thousands of orders/day)
- Schema is identical across tenants — no per-tenant customization
- Row-level security (RLS) in PostgreSQL provides adequate isolation
- Cross-tenant analytics (popular items across restaurants, platform-wide revenue) are easy
- Operationally simpler for a startup — one DB to manage, back up, and tune

### Isolation Enforcement
- **Every** table has a `tenant_id` column as part of the primary key or composite index
- All queries are scoped via middleware-injected `tenant_id` — never omitted
- PostgreSQL **Row-Level Security (RLS)** as a defense-in-depth layer:
  ```sql
  ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
  CREATE POLICY tenant_isolation ON menu_items
    USING (tenant_id = current_setting('app.tenant_id')::UUID);
  ```

---

## 4. Data Model Design

```sql
-- ============================================================
-- TENANTS
-- ============================================================
CREATE TABLE tenants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            VARCHAR(100) UNIQUE NOT NULL,      -- "bistronoir"
    name            VARCHAR(255) NOT NULL,              -- "Bistro Noir"
    description     TEXT,
    logo_url        TEXT,
    cover_image_url TEXT,
    primary_color   VARCHAR(7) DEFAULT '#6366f1',       -- brand color
    accent_color    VARCHAR(7) DEFAULT '#f59e0b',
    custom_domain   VARCHAR(255) UNIQUE,               -- optional: "bistronoir.com"
    timezone        VARCHAR(50) DEFAULT 'UTC',
    currency        VARCHAR(3) DEFAULT 'USD',
    service_charge  DECIMAL(5,2) DEFAULT 10.00,        -- percentage (e.g. 10.00 = 10%)
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- USERS (staff accounts, scoped per tenant)
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email           VARCHAR(255) NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    display_name    VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL DEFAULT 'staff'
                    CHECK (role IN ('admin', 'kitchen', 'server', 'manager')),
    is_active       BOOLEAN DEFAULT true,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE (tenant_id, email)
);

-- ============================================================
-- MENU ITEMS
-- ============================================================
CREATE TABLE menu_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name            VARCHAR(255) NOT NULL,
    price           DECIMAL(10,2) NOT NULL,
    description     TEXT DEFAULT '',
    category        VARCHAR(100) NOT NULL,
    tags            TEXT[] DEFAULT '{}',                -- {"Popular","Vegetarian"}
    image_url       TEXT DEFAULT '/images/default_food.jpg',
    available       BOOLEAN DEFAULT true,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_menu_items_tenant ON menu_items(tenant_id, category, sort_order);

-- ============================================================
-- ORDERS
-- ============================================================
CREATE TABLE orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_number    SERIAL,                             -- per-tenant sequential
    table_number    INTEGER NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','preparing','ready','completed','cancelled')),
    notes           TEXT DEFAULT '',
    items           JSONB NOT NULL,                     -- snapshot of ordered items with prices
    subtotal        DECIMAL(10,2) NOT NULL,
    service_charge  DECIMAL(10,2) NOT NULL,
    total_amount    DECIMAL(10,2) NOT NULL,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_orders_tenant_status ON orders(tenant_id, status, created_at DESC);
CREATE INDEX idx_orders_tenant_table  ON orders(tenant_id, table_number, created_at DESC);

-- ============================================================
-- CHAT CONVERSATIONS (AI chatbot history)
-- ============================================================
CREATE TABLE conversations (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    session_id      VARCHAR(255) NOT NULL,              -- browser session
    messages        JSONB DEFAULT '[]'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT now(),
    updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conversations_tenant_session ON conversations(tenant_id, session_id);

-- ============================================================
-- TENANT DOMAINS (for custom domain resolution)
-- ============================================================
CREATE TABLE tenant_domains (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    domain          VARCHAR(255) UNIQUE NOT NULL,       -- "bistronoir.com"
    verified        BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now()
);
```

### Tenant Scoping Strategy
- Every data table includes `tenant_id NOT NULL REFERENCES tenants(id)`
- Primary keys are **UUIDs** (no sequential IDs leaking tenant information)
- `order_number` is per-tenant sequential (using `SERIAL` — scoped implicitly by query)
- Composite indexes always lead with `tenant_id` to enable partition pruning

### Relationship Summary
```
tenants ──1:N──> users
tenants ──1:N──> menu_items
tenants ──1:N──> orders
tenants ──1:N──> conversations
tenants ──1:N──> tenant_domains
```

---

## 5. Authentication & Authorization

### Customer Flow (Unauthenticated)
- Customers browse menu and place orders **without any account**
- Tenant context is resolved from the subdomain (extracted at the reverse proxy or API gateway)
- No JWT, no session — just tenant-scoped public endpoints
- Rate limiting per IP / session prevents abuse

### Staff Flow (Authenticated)
```
POST /api/v1/auth/login
  Body: { email: string, password: string, tenantSlug: string }
  Response: { token: string, user: { id, displayName, role, tenantId } }
```

1. Staff navigates to `admin.digitalmenu.app/login`
2. Login form includes restaurant slug or email auto-detects tenant
3. Server validates credentials, issues a **JWT** containing:
   ```json
   {
     "sub": "user-uuid",
     "tenant_id": "tenant-uuid",
     "role": "admin",
     "iat": 1680000000,
     "exp": 1680086400
   }
   ```
4. Frontend stores JWT in `localStorage` (or `httpOnly` cookie for XSS protection)
5. JWT is sent as `Authorization: Bearer <token>` on every authenticated request

### Role-Based Access Control (RBAC)

| Role | Permissions |
|---|---|
| `admin` | Full CRUD on menu, orders, users, settings, analytics |
| `manager` | CRUD on menu, view orders, analytics — no user management |
| `kitchen` | Read orders, update status (pending → preparing → ready) |
| `server` | Read orders, submit orders on behalf, update to completed |

### Middleware Enforcement
```javascript
// Backend middleware pseudocode
function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;                          // contains tenant_id, role, sub
    req.tenant_id = decoded.tenant_id;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  };
}
```

### Session / Token Strategy
- **Access token:** Short-lived JWT (15 minutes) — stored in memory + localStorage
- **Refresh token:** Long-lived (7 days) — stored in `httpOnly` cookie
- On 401, frontend calls `POST /api/v1/auth/refresh` to get a new access token
- No server-side session store — fully stateless JWT

---

## 6. API Design

### Endpoint Structure

**Base URL:** `https://{tenant}.digitalmenu.app/api/v1`

```
Public (no auth required — tenant-scoped by subdomain):
  GET    /api/v1/menu                  → List menu items for the tenant
  POST   /api/v1/orders                → Create order
  GET    /api/v1/orders/:id            → Get order status
  POST   /api/v1/chat                  → Send chat message to AI

Authenticated (staff — JWT required):
  GET    /api/v1/admin/orders          → List all orders (filterable by status)
  PUT    /api/v1/admin/orders/:id/status  → Update order status
  POST   /api/v1/admin/menu            → Create menu item (multipart/form-data)
  PUT    /api/v1/admin/menu/:id        → Update menu item
  DELETE /api/v1/admin/menu/:id        → Delete menu item
  GET    /api/v1/admin/analytics       → Revenue, order counts, avg ticket

Auth:
  POST   /api/v1/auth/login            → Authenticate staff
  POST   /api/v1/auth/refresh          → Refresh access token
  POST   /api/v1/auth/logout           → Invalidate refresh token

Admin (platform-level — superadmin only):
  GET    /api/v1/admin/tenants         → List all tenants
  POST   /api/v1/admin/tenants         → Provision new tenant
  GET    /api/v1/admin/tenants/:id     → Tenant details
  PUT    /api/v1/admin/tenants/:id     → Update tenant
```

### Comparison to Current Frontend Endpoints

| Current Frontend | Proposed Backend | Notes |
|---|---|---|
| `GET /api/menu` | `GET /api/v1/menu` | Same — just versioned prefix |
| `POST /api/menu` | `POST /api/v1/admin/menu` | Moved to admin namespace |
| `PUT /api/menu/[id]` | `PUT /api/v1/admin/menu/[id]` | Moved to admin namespace |
| `DELETE /api/menu/[id]` | `DELETE /api/v1/admin/menu/[id]` | Moved to admin namespace |
| `GET /api/orders` | `GET /api/v1/admin/orders` | Moved to admin namespace |
| `POST /api/orders` | `POST /api/v1/orders` | Same — public ordering |
| `GET /api/orders/[id]` | `GET /api/v1/orders/[id]` | Same — public status check |
| `PUT /api/orders/[id]/status` | `PUT /api/v1/admin/orders/[id]/status` | Moved to admin namespace |
| `POST /api/chat` | `POST /api/v1/chat` | Same |

**Frontend changes:** The `API_BASE` in both `CartContext.jsx` and `AdminView.jsx` would change from `/api` to `/api/v1`. Admin endpoints would need the `/admin` prefix and include `Authorization` header.

### Tenant Resolution Middleware

```javascript
// Pseudocode — runs on every request
async function resolveTenant(req, res, next) {
  const host = req.headers.host;  // e.g. "bistronoir.digitalmenu.app"

  // Strategy 1: Extract subdomain
  const match = host.match(/^(.+)\.digitalmenu\.app$/);
  if (match) {
    const slug = match[1];
    if (slug === 'admin') {
      req.tenant_id = null;  // admin console — tenant resolved after login
      return next();
    }
    const tenant = await db.tenants.findUnique({ where: { slug, is_active: true } });
    if (!tenant) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    req.tenant = tenant;
    req.tenant_id = tenant.id;
    return next();
  }

  // Strategy 2: Look up custom domain
  const domain = await db.tenant_domains.findUnique({
    where: { domain: host, verified: true },
    include: { tenant: true }
  });
  if (domain?.tenant?.is_active) {
    req.tenant = domain.tenant;
    req.tenant_id = domain.tenant.id;
    return next();
  }

  return res.status(404).json({ success: false, message: 'Unknown tenant' });
}
```

### Request/Response Conventions

**Consistent response envelope** (matching current pattern):
```json
{
  "success": true,
  "data": { ... },
  "message": null
}
```

**Error response:**
```json
{
  "success": false,
  "data": null,
  "message": "Human-readable error description"
}
```

**Pagination:**
```json
// Request: GET /api/v1/admin/orders?page=1&limit=20&status=pending
// Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

---

## 7. Migration & Implementation Plan

### Phase 0 — Foundation (Week 1-2)

1. **Choose backend stack** (recommended: Node.js/Express + PostgreSQL, or Python/FastAPI + PostgreSQL)
   - Node.js aligns with existing frontend team
   - PostgreSQL for RLS support and JSONB for flexible order storage
2. **Set up project structure:**
   ```
   backend/
   ├── src/
   │   ├── middleware/     (auth, tenant-resolution, error-handler)
   │   ├── routes/         (v1/ — menu, orders, chat, auth, admin)
   │   ├── models/         (Prisma or Drizzle ORM schemas)
   │   ├── services/       (business logic)
   │   ├── lib/            (db client, jwt, config)
   │   └── app.js          (Express/Fastify entry)
   ├── migrations/         (SQL migration files)
   ├── tests/
   ├── docker-compose.yml  (PostgreSQL + app + Redis)
   └── package.json
   ```
3. **Create tenant table + seed script**
4. **Implement tenant resolution middleware** (subdomain + custom domain)
5. **Set up PostgreSQL + RLS policies**

### Phase 1 — Public API (Week 3-4)

1. **Implement `GET /api/v1/menu`** — tenant-scoped menu listing
   - Replace current `db.js` in-memory store
   - Mirror exact response shape: `{ success, data: [{ id, name, price, ... }] }`
2. **Implement `POST /api/v1/orders`** — create order
   - Accept `{ tableNumber, items, notes }`
   - Calculate subtotal, service charge, total on server side
   - Return order with status tracking fields
3. **Implement `GET /api/v1/orders/:id`** — order status polling
4. **Implement `POST /api/v1/chat`** — Groq AI proxy (keep current logic, add tenant context)
5. **Verify frontend compatibility** — point existing frontend at new backend, test menu load and order flow

### Phase 2 — Admin API & Auth (Week 5-6)

1. **Build `users` table + seeded admin user per tenant**
2. **Implement `POST /api/v1/auth/login`**
   - Validate credentials, issue JWT with `{ sub, tenant_id, role }`
3. **Implement auth middleware** — extract and verify JWT, attach user+tenant to request
4. **Implement admin CRUD endpoints:**
   - `GET/POST /api/v1/admin/menu`
   - `PUT/DELETE /api/v1/admin/menu/:id`
   - `GET /api/v1/admin/orders`
   - `PUT /api/v1/admin/orders/:id/status`
5. **Implement role-based access** — `kitchen` cannot create menu items, etc.

### Phase 3 — Frontend Adaptation (Week 7-8)

1. **Add login page** (`/admin/login`) — email + password form, stores JWT
2. **Update `AdminView.jsx`** — read JWT from localStorage, attach `Authorization` header
3. **Update `CartContext.jsx`** and `AdminView.jsx` — change `API_BASE` to `/api/v1`
4. **Dynamic branding** — replace "Bistro Noir" with `tenant.name` from context
   - Expose `GET /api/v1/tenant` (public) returning brand config
   - Load brand colors, logo, restaurant name into React context
5. **Admin route protection** — check JWT presence; redirect to login if absent
6. **Add `/admin/logout`** — clear token, redirect to login

### Phase 4 — Real-Time & Production (Week 9-10)

1. **Replace polling with WebSockets** — implement Socket.IO rooms per tenant:
   - Customer room: `order-{orderId}` — status updates pushed
   - Admin room: `tenant-{tenantId}` — new order alerts, status changes
2. **File uploads** — migrate from base64 data URLs to cloud storage (S3/Cloudinary)
3. **Rate limiting** — per-tenant + per-IP for public endpoints
4. **Audit logging** — log all admin actions with `{ tenant_id, user_id, action, timestamp }`
5. **Multi-DC/read replicas** — if latency is a concern across regions

---

## 8. Risks & Open Questions

### Risks

| Risk | Severity | Mitigation |
|---|---|---|
| **tenant_id leak in queries** | High | RLS as defense-in-depth; automated query linting; integration tests that assert every query filters by tenant |
| **Subdomain collisions** | Low | Validate slug uniqueness at signup; reserve common slugs (admin, api, www, app, support) |
| **Custom domain SSL** | Medium | Auto-provision Let's Encrypt certs via ACME; use reverse proxy (nginx/Caddy) with automatic HTTPS |
| **Noisy neighbor (one tenant consumes all DB IO)** | Low-Medium | Connection pooling with per-tenant limits; PG queue for writes; separate read replicas at scale |
| **JWT compromise** (stolen token) | Medium | Short TTL (15 min); refresh token rotation; `/auth/logout` adds refresh to blocklist |
| **Frontend coupling to `/api` base path** | Low | Next.js rewrites can proxy `/api/*` → backend; no frontend changes needed for base URL |

### Open Questions

1. **Self-serve tenant provisioning?** Should restaurant owners sign up via a web form (requiring frontend) or is provisioning done manually by the platform team initially?
2. **File/image storage:** Base64 in DB works for small scale but fails at 100+ tenants with 50+ menu items each. What cloud storage provider (S3, Cloudinary, R2)?
3. **Offline resilience:** Should orders be queued client-side if the backend is unreachable?
4. **Tenant-level feature flags:** Will some tenants need different feature sets (e.g., catering vs. dine-in only)?
5. **GDPR / data deletion:** Does deactivating a tenant require hard-deleting all data, or is soft-delete sufficient?
6. **Monorepo vs. separate repo:** Should the backend live in this same monorepo (packages/backend) or a separate repository?
7. **Next.js API routes removal:** The current `src/app/api/` routes implement the same logic. Should they be removed entirely, or kept as a dev fallback?
8. **Menu item categories:** Currently hardcoded (Starters, Mains, Desserts, Drinks). Should categories be configurable per tenant via a `categories` table?
9. **Table management:** Currently `tableNumber` is a free-form integer. Should there be a `tables` table per tenant with assigned numbers and QR codes?
10. **Multi-language menu:** Future requirement? The data model's `tags` array and `description` field should consider localization (e.g., JSONB for i18n).

### Recommended Next Actions

1. Decide backend stack (Node.js/PostgreSQL is recommended for alignment with existing JS skill set)
2. Set up the repository structure (monorepo with `backend/` alongside `frontend/`)
3. Implement Phase 0 (tenant resolution + DB schema + migrations)
4. Implement Phase 1 (public API — enough to unblock frontend development)
5. Begin frontend changes (auth page, API version bump, dynamic branding)

---

*Document generated from analysis of `digital_menu` frontend codebase (Next.js 16, in-memory db, no auth, relative `/api` base paths).*
