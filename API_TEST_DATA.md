# API Test Data

Base URL: `http://localhost:3000`

---

## Authentication

### POST /api/auth/login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@bistronoir.com",
    "password": "admin123",
    "tenantSlug": "bistronoir"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NmE1ZjE1NS0xZGFlLTQ4Y2YtOWIwOS02Y2FhZjJlMzFkNDYiLCJ0ZW5hbnRfaWQiOiIwZWQxZWZiMi03OGQ0LTQ0ZjQtOWFmMC1hZjZlMjI2MGM5OTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODM0MjkxMjksImV4cCI6MTc4MzQzMDAyOX0.iTCP2IkZv65n4pMIb5ho41bOifHYgPTdThFLodMX8Fs",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NmE1ZjE1NS0xZGFlLTQ4Y2YtOWIwOS02Y2FhZjJlMzFkNDYiLCJ0ZW5hbnRfaWQiOiIwZWQxZWZiMi03OGQ0LTQ0ZjQtOWFmMC1hZjZlMjI2MGM5OTYiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4MzQyOTEyOSwiZXhwIjoxNzg0MDMzOTI5fQ.LANsm70BEfQxzWKYGfMQkfwNs0KeyjZ3NHymwq3T-P8",
    "user": {
      "id": "46a5f155-1dae-48cf-9b09-6caaf2e31d46",
      "email": "admin@bistronoir.com",
      "displayName": "Admin",
      "role": "admin",
      "tenantId": "0ed1efb2-78d4-44f4-9af0-af6e2260c996",
      "tenantSlug": "bistronoir",
      "tenantName": "Bistro Noir"
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "email, password, and tenantSlug are required"
}
```

---

### POST /api/auth/refresh

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NmE1ZjE1NS0xZGFlLTQ4Y2YtOWIwOS02Y2FhZjJlMzFkNDYiLCJ0ZW5hbnRfaWQiOiIwZWQxZWZiMi03OGQ0LTQ0ZjQtOWFmMC1hZjZlMjI2MGM5OTYiLCJ0eXBlIjoicmVmcmVzaCIsImlhdCI6MTc4MzQyOTEyOSwiZXhwIjoxNzg0MDMzOTI5fQ.LANsm70BEfQxzWKYGfMQkfwNs0KeyjZ3NHymwq3T-P8"
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "refreshToken is required"
}
```

---

### GET /api/auth/me

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NmE1ZjE1NS0xZGFlLTQ4Y2YtOWIwOS02Y2FhZjJlMzFkNDYiLCJ0ZW5hbnRfaWQiOiIwZWQxZWZiMi03OGQ0LTQ0ZjQtOWFmMC1hZjZlMjI2MGM5OTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODM0MjkxMjksImV4cCI6MTc4MzQzMDAyOX0.iTCP2IkZv65n4pMIb5ho41bOifHYgPTdThFLodMX8Fs"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "46a5f155-1dae-48cf-9b09-6caaf2e31d46",
    "email": "admin@bistronoir.com",
    "displayName": "Admin",
    "role": "admin",
    "tenantId": "0ed1efb2-78d4-44f4-9af0-af6e2260c996",
    "tenantSlug": "bistronoir",
    "tenantName": "Bistro Noir"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Authentication required"
}
```

---

## Chat / AI Assistant

### POST /api/chat

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "system", "content": "You are a helpful restaurant assistant." },
      { "role": "user", "content": "What is today'\''s special?" }
    ]
  }'
```

**Success Response (200):**
```json
{
  "content": "I'd be happy to help you with today's specials! However, I don't have access to your restaurant's menu data directly. Could you please check your menu items or let me know what you'd like to know?"
}
```

**Error Response (400):**
```json
{
  "error": "Body must include a non-empty messages array."
}
```

---

## Conversations (Chat History)

### GET /api/conversations?sessionId=<sessionId>

```bash
curl -X GET "http://localhost:3000/api/conversations?sessionId=abc-123-session" \
  -H "x-tenant-slug: bistronoir"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "messages": [
      { "role": "user", "content": "What is today's special?", "timestamp": "2026-07-07T12:00:00Z" },
      { "role": "assistant", "content": "Here are today's specials...", "timestamp": "2026-07-07T12:00:05Z" }
    ]
  }
}
```

---

### POST /api/conversations

```bash
curl -X POST http://localhost:3000/api/conversations \
  -H "Content-Type: application/json" \
  -H "x-tenant-slug: bistronoir" \
  -d '{
    "sessionId": "abc-123-session",
    "role": "user",
    "content": "What is today'\''s special?"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "conversation-uuid",
    "sessionId": "abc-123-session",
    "messages": [
      { "role": "user", "content": "What is today's special?" }
    ]
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "sessionId, role, and content are required"
}
```

---

## Domains (Admin only)

### GET /api/domains

```bash
curl -X GET http://localhost:3000/api/domains \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NmE1ZjE1NS0xZGFlLTQ4Y2YtOWIwOS02Y2FhZjJlMzFkNDYiLCJ0ZW5hbnRfaWQiOiIwZWQxZWZiMi03OGQ0LTQ0ZjQtOWFmMC1hZjZlMjI2MGM5OTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODM0MzAwNzcsImV4cCI6MTc4MzQzMDk3N30.ShPnu7ZIbPJbbS0jM9VIRC_0LHGL1Zx_N1efM53jJHE"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "domain-uuid",
      "domain": "menu.bistronoir.com",
      "verified": false,
      "createdAt": "2026-07-07T00:00:00Z"
    }
  ]
}
```

---

### POST /api/domains

```bash
curl -X POST http://localhost:3000/api/domains \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NmE1ZjE1NS0xZGFlLTQ4Y2YtOWIwOS02Y2FhZjJlMzFkNDYiLCJ0ZW5hbnRfaWQiOiIwZWQxZWZiMi03OGQ0LTQ0ZjQtOWFmMC1hZjZlMjI2MGM5OTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODM0MjkxMjksImV4cCI6MTc4MzQzMDAyOX0.iTCP2IkZv65n4pMIb5ho41bOifHYgPTdThFLodMX8Fs" \
  -d '{
    "domain": "menu.bistronoir.com"
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "domain-uuid",
    "domain": "menu.bistronoir.com",
    "verified": false,
    "createdAt": "2026-07-07T00:00:00Z"
  }
}
```

---

### DELETE /api/domains/[id]

```bash
curl -X DELETE http://localhost:3000/api/domains/domain-uuid \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NmE1ZjE1NS0xZGFlLTQ4Y2YtOWIwOS02Y2FhZjJlMzFkNDYiLCJ0ZW5hbnRfaWQiOiIwZWQxZWZiMi03OGQ0LTQ0ZjQtOWFmMC1hZjZlMjI2MGM5OTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODM0MjkxMjksImV4cCI6MTc4MzQzMDAyOX0.iTCP2IkZv65n4pMIb5ho41bOifHYgPTdThFLodMX8Fs"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Domain removed"
}
```

---

## Menu Items

### GET /api/menu

```bash
curl -X GET http://localhost:3000/api/menu \
  -H "x-tenant-slug: bistronoir"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "menu-item-uuid",
      "name": "Margherita Pizza",
      "price": 12.99,
      "category": "Pizza",
      "description": "Classic tomato, mozzarella, and basil",
      "tags": ["vegetarian", "popular"],
      "imageUrl": "/images/default_food.jpg",
      "available": true,
      "sortOrder": 0
    }
  ]
}
```

---

### POST /api/menu

```bash
curl -X POST http://localhost:3000/api/menu \
  -H "Content-Type: application/json" \
  -H "x-tenant-slug: bistronoir" \
  -d '{
    "name": "Margherita Pizza",
    "price": 12.99,
    "category": "Pizza",
    "description": "Classic tomato, mozzarella, and basil",
    "tags": ["vegetarian", "popular"],
    "available": true,
    "imageUrl": "https://example.com/pizza.jpg"
  }'
```


**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "new-menu-item-uuid",
    "name": "Margherita Pizza",
    "price": 12.99,
    "category": "Pizza",
    "description": "Classic tomato, mozzarella, and basil",
    "tags": ["vegetarian", "popular"],
    "imageUrl": "data:image/jpeg;base64,...",
    "available": true,
    "sortOrder": 0
  }
}
```

---

### PUT /api/menu/[id]

```bash
curl -X PUT http://localhost:3000/api/menu/menu-item-uuid \
  -H "Content-Type: application/json" \
  -H "x-tenant-slug: bistronoir" \
  -d '{
    "name": "Margherita Pizza (Updated)",
    "price": 14.99,
    "available": false
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "menu-item-uuid",
    "name": "Margherita Pizza (Updated)",
    "price": 14.99,
    "category": "Pizza",
    "description": "Classic tomato, mozzarella, and basil",
    "tags": ["vegetarian", "popular"],
    "imageUrl": "/images/default_food.jpg",
    "available": false,
    "sortOrder": 0
  }
}
```

---

### DELETE /api/menu/[id]

```bash
curl -X DELETE http://localhost:3000/api/menu/menu-item-uuid \
  -H "x-tenant-slug: bistronoir"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Item deleted"
}
```

---

## Orders

### GET /api/orders

```bash
curl -X GET "http://localhost:3000/api/orders?status=pending&tableNumber=5" \
  -H "x-tenant-slug: bistronoir"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "order-uuid",
      "orderNumber": 1,
      "tableNumber": 5,
      "status": "pending",
      "notes": "No onions please",
      "items": [
        { "menuItemId": "item-uuid", "name": "Margherita Pizza", "quantity": 2, "unitPrice": 12.99 }
      ],
      "subtotal": 25.98,
      "serviceCharge": 2.60,
      "totalAmount": 28.58,
      "createdAt": "2026-07-07T12:00:00Z"
    }
  ]
}
```

---

### POST /api/orders

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -H "x-tenant-slug: bistronoir" \
  -d '{
    "tableNumber": 5,
    "notes": "No onions please",
    "items": [
      { "menuItemId": "item-uuid-1", "name": "Margherita Pizza", "quantity": 2, "unitPrice": 12.99 },
      { "menuItemId": "item-uuid-2", "name": "Caesar Salad", "quantity": 1, "unitPrice": 9.99 }
    ],
    "subtotal": 35.97,
    "serviceCharge": 3.60,
    "totalAmount": 39.57
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "new-order-uuid",
    "orderNumber": 1,
    "tableNumber": 5,
    "status": "pending",
    "notes": "No onions please",
    "items": [
      { "menuItemId": "item-uuid-1", "name": "Margherita Pizza", "quantity": 2, "unitPrice": 12.99 },
      { "menuItemId": "item-uuid-2", "name": "Caesar Salad", "quantity": 1, "unitPrice": 9.99 }
    ],
    "subtotal": 35.97,
    "serviceCharge": 3.60,
    "totalAmount": 39.57,
    "createdAt": "2026-07-07T12:00:00Z"
  }
}
```

---

### GET /api/orders/[id]

```bash
curl -X GET http://localhost:3000/api/orders/order-uuid \
  -H "x-tenant-slug: bistronoir"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "orderNumber": 1,
    "tableNumber": 5,
    "status": "pending",
    "notes": "No onions please",
    "items": [
      { "menuItemId": "item-uuid-1", "name": "Margherita Pizza", "quantity": 2, "unitPrice": 12.99 }
    ],
    "subtotal": 25.98,
    "serviceCharge": 2.60,
    "totalAmount": 28.58,
    "createdAt": "2026-07-07T12:00:00Z"
  }
}
```

---

### PUT /api/orders/[id]/status

```bash
curl -X PUT http://localhost:3000/api/orders/order-uuid/status \
  -H "Content-Type: application/json" \
  -H "x-tenant-slug: bistronoir" \
  -d '{
    "status": "preparing"
  }'
```

**Valid statuses:** `pending`, `preparing`, `ready`, `completed`, `cancelled`

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "order-uuid",
    "orderNumber": 1,
    "tableNumber": 5,
    "status": "preparing",
    "items": [...],
    "subtotal": 25.98,
    "serviceCharge": 2.60,
    "totalAmount": 28.58,
    "createdAt": "2026-07-07T12:00:00Z"
  }
}
```

---

## Tenants (Admin only)

### GET /api/tenants

```bash
curl -X GET http://localhost:3000/api/tenants \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NmE1ZjE1NS0xZGFlLTQ4Y2YtOWIwOS02Y2FhZjJlMzFkNDYiLCJ0ZW5hbnRfaWQiOiIwZWQxZWZiMi03OGQ0LTQ0ZjQtOWFmMC1hZjZlMjI2MGM5OTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODM0MjkxMjksImV4cCI6MTc4MzQzMDAyOX0.iTCP2IkZv65n4pMIb5ho41bOifHYgPTdThFLodMX8Fs"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "0ed1efb2-78d4-44f4-9af0-af6e2260c996",
      "slug": "bistronoir",
      "name": "Bistro Noir",
      "description": null,
      "logoUrl": null,
      "coverImageUrl": null,
      "primaryColor": "#6366f1",
      "accentColor": "#f59e0b",
      "customDomain": null,
      "timezone": "UTC",
      "currency": "USD",
      "serviceCharge": 10.00,
      "isActive": true
    }
  ]
}
```

---

### POST /api/tenants

```bash
curl -X POST http://localhost:3000/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NmE1ZjE1NS0xZGFlLTQ4Y2YtOWIwOS02Y2FhZjJlMzFkNDYiLCJ0ZW5hbnRfaWQiOiIwZWQxZWZiMi03OGQ0LTQ0ZjQtOWFmMC1hZjZlMjI2MGM5OTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODM0MjkxMjksImV4cCI6MTc4MzQzMDAyOX0.iTCP2IkZv65n4pMIb5ho41bOifHYgPTdThFLodMX8Fs" \
  -d '{
    "slug": "new-restaurant",
    "name": "New Restaurant",
    "description": "A brand new restaurant",
    "primaryColor": "#10b981",
    "accentColor": "#f97316",
    "timezone": "America/New_York",
    "currency": "USD",
    "serviceCharge": 8.50
  }'
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "new-tenant-uuid",
    "slug": "new-restaurant",
    "name": "New Restaurant",
    "description": "A brand new restaurant",
    "logoUrl": null,
    "coverImageUrl": null,
    "primaryColor": "#10b981",
    "accentColor": "#f97316",
    "customDomain": null,
    "timezone": "America/New_York",
    "currency": "USD",
    "serviceCharge": 8.50,
    "isActive": true
  }
}
```

---

### GET /api/tenants/[id]

```bash
curl -X GET http://localhost:3000/api/tenants/0ed1efb2-78d4-44f4-9af0-af6e2260c996 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NmE1ZjE1NS0xZGFlLTQ4Y2YtOWIwOS02Y2FhZjJlMzFkNDYiLCJ0ZW5hbnRfaWQiOiIwZWQxZWZiMi03OGQ0LTQ0ZjQtOWFmMC1hZjZlMjI2MGM5OTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODM0MjkxMjksImV4cCI6MTc4MzQzMDAyOX0.iTCP2IkZv65n4pMIb5ho41bOifHYgPTdThFLodMX8Fs"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "0ed1efb2-78d4-44f4-9af0-af6e2260c996",
    "slug": "bistronoir",
    "name": "Bistro Noir",
    "description": null,
    "primaryColor": "#6366f1",
    "accentColor": "#f59e0b",
    "timezone": "UTC",
    "currency": "USD",
    "serviceCharge": 10.00,
    "isActive": true
  }
}
```

---

### PUT /api/tenants/[id]

```bash
curl -X PUT http://localhost:3000/api/tenants/0ed1efb2-78d4-44f4-9af0-af6e2260c996 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NmE1ZjE1NS0xZGFlLTQ4Y2YtOWIwOS02Y2FhZjJlMzFkNDYiLCJ0ZW5hbnRfaWQiOiIwZWQxZWZiMi03OGQ0LTQ0ZjQtOWFmMC1hZjZlMjI2MGM5OTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODM0MjkxMjksImV4cCI6MTc4MzQzMDAyOX0.iTCP2IkZv65n4pMIb5ho41bOifHYgPTdThFLodMX8Fs" \
  -d '{
    "name": "Bistro Noir (Updated)",
    "description": "Updated description",
    "primaryColor": "#ef4444",
    "serviceCharge": 12.50
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "0ed1efb2-78d4-44f4-9af0-af6e2260c996",
    "slug": "bistronoir",
    "name": "Bistro Noir (Updated)",
    "description": "Updated description",
    "primaryColor": "#ef4444",
    "accentColor": "#f59e0b",
    "timezone": "UTC",
    "currency": "USD",
    "serviceCharge": 12.50,
    "isActive": true
  }
}
```

---

### DELETE /api/tenants/[id]

```bash
curl -X DELETE http://localhost:3000/api/tenants/0ed1efb2-78d4-44f4-9af0-af6e2260c996 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NmE1ZjE1NS0xZGFlLTQ4Y2YtOWIwOS02Y2FhZjJlMzFkNDYiLCJ0ZW5hbnRfaWQiOiIwZWQxZWZiMi03OGQ0LTQ0ZjQtOWFmMC1hZjZlMjI2MGM5OTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODM0MjkxMjksImV4cCI6MTc4MzQzMDAyOX0.iTCP2IkZv65n4pMIb5ho41bOifHYgPTdThFLodMX8Fs"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Tenant deleted"
}
```

---

## Users (Staff)

### GET /api/users

```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NmE1ZjE1NS0xZGFlLTQ4Y2YtOWIwOS02Y2FhZjJlMzFkNDYiLCJ0ZW5hbnRfaWQiOiIwZWQxZWZiMi03OGQ0LTQ0ZjQtOWFmMC1hZjZlMjI2MGM5OTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODM0MjkxMjksImV4cCI6MTc4MzQzMDAyOX0.iTCP2IkZv65n4pMIb5ho41bOifHYgPTdThFLodMX8Fs"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "46a5f155-1dae-48cf-9b09-6caaf2e31d46",
      "email": "admin@bistronoir.com",
      "displayName": "Admin",
      "role": "admin",
      "isActive": true,
      "lastLoginAt": null,
      "createdAt": "2026-07-07T00:00:00Z"
    }
  ]
}
```

---

### POST /api/users

```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NmE1ZjE1NS0xZGFlLTQ4Y2YtOWIwOS02Y2FhZjJlMzFkNDYiLCJ0ZW5hbnRfaWQiOiIwZWQxZWZiMi03OGQ0LTQ0ZjQtOWFmMC1hZjZlMjI2MGM5OTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODM0MjkxMjksImV4cCI6MTc4MzQzMDAyOX0.iTCP2IkZv65n4pMIb5ho41bOifHYgPTdThFLodMX8Fs" \
  -d '{
    "email": "newstaff@example.com",
    "password": "securePass123",
    "displayName": "New Staff",
    "role": "server"
  }'
```

**Valid roles:** `admin`, `manager`, `kitchen`, `server`

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "new-user-uuid",
    "email": "newstaff@example.com",
    "displayName": "New Staff",
    "role": "server",
    "isActive": true,
    "createdAt": "2026-07-07T12:00:00Z"
  }
}
```

---

### GET /api/users/[id]

```bash
curl -X GET http://localhost:3000/api/users/46a5f155-1dae-48cf-9b09-6caaf2e31d46 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NmE1ZjE1NS0xZGFlLTQ4Y2YtOWIwOS02Y2FhZjJlMzFkNDYiLCJ0ZW5hbnRfaWQiOiIwZWQxZWZiMi03OGQ0LTQ0ZjQtOWFmMC1hZjZlMjI2MGM5OTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODM0MjkxMjksImV4cCI6MTc4MzQzMDAyOX0.iTCP2IkZv65n4pMIb5ho41bOifHYgPTdThFLodMX8Fs"
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "46a5f155-1dae-48cf-9b09-6caaf2e31d46",
    "email": "admin@bistronoir.com",
    "displayName": "Admin",
    "role": "admin",
    "isActive": true,
    "lastLoginAt": null,
    "createdAt": "2026-07-07T00:00:00Z"
  }
}
```

*Note: `passwordHash` is excluded from the response.*

---

### PUT /api/users/[id]

```bash
curl -X PUT http://localhost:3000/api/users/46a5f155-1dae-48cf-9b09-6caaf2e31d46 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NmE1ZjE1NS0xZGFlLTQ4Y2YtOWIwOS02Y2FhZjJlMzFkNDYiLCJ0ZW5hbnRfaWQiOiIwZWQxZWZiMi03OGQ0LTQ0ZjQtOWFmMC1hZjZlMjI2MGM5OTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODM0MjkxMjksImV4cCI6MTc4MzQzMDAyOX0.iTCP2IkZv65n4pMIb5ho41bOifHYgPTdThFLodMX8Fs" \
  -d '{
    "displayName": "Admin (Updated)",
    "role": "manager",
    "isActive": true
  }'
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "46a5f155-1dae-48cf-9b09-6caaf2e31d46",
    "email": "admin@bistronoir.com",
    "displayName": "Admin (Updated)",
    "role": "manager",
    "isActive": true,
    "createdAt": "2026-07-07T00:00:00Z"
  }
}
```

---

### DELETE /api/users/[id]

```bash
curl -X DELETE http://localhost:3000/api/users/46a5f155-1dae-48cf-9b09-6caaf2e31d46 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI0NmE1ZjE1NS0xZGFlLTQ4Y2YtOWIwOS02Y2FhZjJlMzFkNDYiLCJ0ZW5hbnRfaWQiOiIwZWQxZWZiMi03OGQ0LTQ0ZjQtOWFmMC1hZjZlMjI2MGM5OTYiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3ODM0MjkxMjksImV4cCI6MTc4MzQzMDAyOX0.iTCP2IkZv65n4pMIb5ho41bOifHYgPTdThFLodMX8Fs"
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User deleted"
}
```

---

## Quick Reference: Testing Flow

1. **Login** → `POST /api/auth/login` → save `accessToken` and `refreshToken`
2. **Get profile** → `GET /api/auth/me` (use `accessToken`)
3. **Refresh token** → `POST /api/auth/refresh` (use `refreshToken`)
4. **List/Create tenants** (admin) → `GET|POST /api/tenants`
5. **List/Create menu items** → `GET|POST /api/menu`
6. **Create/List orders** → `GET|POST /api/orders`
7. **Update order status** → `PUT /api/orders/[id]/status`
8. **Chat** → `POST /api/chat`
9. **Conversations** → `GET|POST /api/conversations`
10. **Manage domains** (admin) → `GET|POST|DELETE /api/domains`
11. **Manage users** (admin/manager) → `GET|POST|PUT|DELETE /api/users`

### Tenant Header

For endpoints marked "Tenant-resolved", include:
```
x-tenant-slug: bistronoir
```
Or set `NEXT_PUBLIC_DEFAULT_TENANT=bistronoir` env var.
