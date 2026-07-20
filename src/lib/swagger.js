export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Digital Menu API',
    version: '2.0.0',
    description: `Multi-tenant restaurant management API.

## Roles
| Role | Level | Description |
|------|-------|-------------|
| super_admin | Platform | Manage all tenants, pricing, feature flags |
| manager | Tenant | Full restaurant access — menu, staff, reports, subscription, settings |
| cashier | Tenant | Create orders, take payments, refund |
| waiter | Tenant | View tables, take/update orders, call kitchen |
| kitchen_staff | Tenant | View incoming orders, update food status |

## Authentication
- **Staff:** \`POST /api/auth/login\` with \`{ email, password, tenantSlug }\`
- **Super Admin:** \`POST /api/auth/login\` or \`/api/admin/login\` with \`{ email, password }\` (no tenantSlug)

## Multi-Tenant
Public endpoints use \`x-tenant-slug\` header (e.g. \`x-tenant-slug: bistronoir\`).
Staff endpoints derive tenant from JWT.`,
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Development server' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT from POST /api/auth/login or /api/admin/login',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Error message' },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation successful' },
        },
      },
      Tenant: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          slug: { type: 'string', example: 'bistronoir' },
          name: { type: 'string', example: 'Bistro Noir' },
          description: { type: 'string', nullable: true },
          logoUrl: { type: 'string', nullable: true },
          coverImageUrl: { type: 'string', nullable: true },
          primaryColor: { type: 'string', example: '#6366f1' },
          accentColor: { type: 'string', example: '#f59e0b' },
          customDomain: { type: 'string', nullable: true },
          timezone: { type: 'string', example: 'UTC' },
          currency: { type: 'string', example: 'USD' },
          serviceCharge: { type: 'number', example: 10.00 },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateTenantInput: {
        type: 'object',
        required: ['slug', 'name'],
        properties: {
          slug: { type: 'string', example: 'new-restaurant' },
          name: { type: 'string', example: 'New Restaurant' },
          description: { type: 'string' },
          primaryColor: { type: 'string', example: '#10b981' },
          accentColor: { type: 'string', example: '#f97316' },
          timezone: { type: 'string', example: 'America/New_York' },
          currency: { type: 'string', example: 'USD' },
          serviceCharge: { type: 'number', example: 8.50 },
        },
      },
      UpdateTenantInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          isActive: { type: 'boolean' },
          primaryColor: { type: 'string' },
          accentColor: { type: 'string' },
          timezone: { type: 'string' },
          currency: { type: 'string' },
          serviceCharge: { type: 'number' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          displayName: { type: 'string' },
          role: { type: 'string', enum: ['super_admin', 'manager', 'cashier', 'waiter', 'kitchen_staff'] },
          isActive: { type: 'boolean' },
          lastLoginAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          tenantId: { type: 'string', format: 'uuid', nullable: true },
        },
      },
      CreateUserInput: {
        type: 'object',
        required: ['email', 'password', 'displayName', 'role'],
        properties: {
          email: { type: 'string', format: 'email', example: 'newstaff@example.com' },
          password: { type: 'string', format: 'password', example: 'securePass123' },
          displayName: { type: 'string', example: 'New Staff' },
          role: { type: 'string', enum: ['manager', 'cashier', 'waiter', 'kitchen_staff'], example: 'waiter' },
        },
      },
      UpdateUserInput: {
        type: 'object',
        properties: {
          displayName: { type: 'string' },
          role: { type: 'string', enum: ['manager', 'cashier', 'waiter', 'kitchen_staff'] },
          isActive: { type: 'boolean' },
          password: { type: 'string', format: 'password' },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'manager@bistronoir.com' },
          password: { type: 'string', format: 'password', example: 'admin123' },
          tenantSlug: { type: 'string', example: 'bistronoir', description: 'Required for staff, omit for super_admin' },
        },
      },
      AdminLoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'super@digitalmenu.app' },
          password: { type: 'string', format: 'password', example: 'admin123' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
          refreshToken: { type: 'string', nullable: true },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string' },
              displayName: { type: 'string' },
              role: { type: 'string' },
              tenantId: { type: 'string', format: 'uuid', nullable: true },
              tenantSlug: { type: 'string', nullable: true },
              tenantName: { type: 'string', nullable: true },
            },
          },
        },
      },
      RefreshTokenInput: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        },
      },
      MenuItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Margherita Pizza' },
          price: { type: 'number', example: 12.99 },
          description: { type: 'string' },
          category: { type: 'string', example: 'Mains' },
          tags: { type: 'array', items: { type: 'string' } },
          image: { type: 'string', example: '/images/default_food.jpg' },
          available: { type: 'boolean', example: true },
          sortOrder: { type: 'integer', example: 0 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateMenuItemInput: {
        type: 'object',
        required: ['name', 'price', 'category'],
        properties: {
          name: { type: 'string', example: 'Margherita Pizza' },
          price: { type: 'number', example: 12.99 },
          category: { type: 'string', example: 'Mains' },
          description: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          available: { type: 'boolean', example: true },
          imageUrl: { type: 'string' },
        },
      },
      UpdateMenuItemInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          price: { type: 'number' },
          category: { type: 'string' },
          description: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          available: { type: 'boolean' },
          imageUrl: { type: 'string' },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          menuItemId: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Margherita Pizza' },
          quantity: { type: 'integer', example: 2 },
          unitPrice: { type: 'number', example: 12.99 },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          orderNumber: { type: 'integer', example: 1 },
          tableNumber: { type: 'integer', example: 5 },
          status: { type: 'string', enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'] },
          notes: { type: 'string' },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          subtotal: { type: 'number', example: 25.98 },
          serviceCharge: { type: 'number', example: 2.60 },
          totalAmount: { type: 'number', example: 28.58 },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateOrderInput: {
        type: 'object',
        required: ['tableNumber', 'items'],
        properties: {
          tableNumber: { type: 'integer', example: 5 },
          notes: { type: 'string', example: 'No onions please' },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
        },
      },
      UpdateOrderStatusInput: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'], example: 'preparing' },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Starters' },
          sortOrder: { type: 'integer', example: 1 },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateCategoryInput: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Desserts' },
          sortOrder: { type: 'integer', example: 4 },
        },
      },
      Table: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          tableNumber: { type: 'integer', example: 1 },
          capacity: { type: 'integer', example: 4 },
          qrCode: { type: 'string', nullable: true },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateTableInput: {
        type: 'object',
        required: ['tableNumber'],
        properties: {
          tableNumber: { type: 'integer', example: 6 },
          capacity: { type: 'integer', example: 4 },
          qrCode: { type: 'string' },
        },
      },
      Payment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          orderId: { type: 'string', format: 'uuid' },
          amount: { type: 'number', example: 28.58 },
          method: { type: 'string', enum: ['cash', 'card', 'mobile', 'other'] },
          status: { type: 'string', enum: ['pending', 'completed', 'failed', 'refunded'] },
          reference: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreatePaymentInput: {
        type: 'object',
        required: ['orderId', 'amount'],
        properties: {
          orderId: { type: 'string', format: 'uuid', example: 'order-uuid' },
          amount: { type: 'number', example: 28.58 },
          method: { type: 'string', enum: ['cash', 'card', 'mobile', 'other'], example: 'card' },
          status: { type: 'string', enum: ['pending', 'completed', 'failed'], example: 'completed' },
          reference: { type: 'string' },
        },
      },
      Expense: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          description: { type: 'string', example: 'Weekly ingredient restock' },
          amount: { type: 'number', example: 450.00 },
          category: { type: 'string', example: 'Supplies' },
          date: { type: 'string', format: 'date' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateExpenseInput: {
        type: 'object',
        required: ['description', 'amount', 'category'],
        properties: {
          description: { type: 'string', example: 'Weekly ingredient restock' },
          amount: { type: 'number', example: 450.00 },
          category: { type: 'string', example: 'Supplies' },
          date: { type: 'string', format: 'date', example: '2026-07-10' },
        },
      },
      Invoice: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          invoiceNumber: { type: 'string', example: 'INV-001' },
          orderId: { type: 'string', format: 'uuid', nullable: true },
          amount: { type: 'number', example: 150.00 },
          tax: { type: 'number', example: 12.00 },
          status: { type: 'string', example: 'draft' },
          dueDate: { type: 'string', format: 'date', nullable: true },
          paidAt: { type: 'string', format: 'date-time', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateInvoiceInput: {
        type: 'object',
        required: ['invoiceNumber', 'amount'],
        properties: {
          invoiceNumber: { type: 'string', example: 'INV-002' },
          orderId: { type: 'string', format: 'uuid' },
          amount: { type: 'number', example: 250.00 },
          tax: { type: 'number', example: 20.00 },
          status: { type: 'string', example: 'draft' },
          dueDate: { type: 'string', format: 'date' },
        },
      },
      StaffSchedule: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          dayOfWeek: { type: 'integer', example: 1, description: '0=Sun, 1=Mon, ... 6=Sat' },
          startTime: { type: 'string', example: '09:00' },
          endTime: { type: 'string', example: '17:00' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              displayName: { type: 'string' },
              role: { type: 'string' },
            },
          },
        },
      },
      CreateScheduleInput: {
        type: 'object',
        required: ['userId', 'dayOfWeek', 'startTime', 'endTime'],
        properties: {
          userId: { type: 'string', format: 'uuid', example: 'user-uuid' },
          dayOfWeek: { type: 'integer', example: 1 },
          startTime: { type: 'string', example: '09:00' },
          endTime: { type: 'string', example: '17:00' },
        },
      },
      QrCode: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          tableId: { type: 'string', format: 'uuid', nullable: true },
          url: { type: 'string', example: 'https://bistronoir.digitalmenu.app/menu?table=1' },
          label: { type: 'string', nullable: true },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateQrCodeInput: {
        type: 'object',
        required: ['url'],
        properties: {
          tableId: { type: 'string', format: 'uuid' },
          url: { type: 'string', example: 'https://bistronoir.digitalmenu.app/menu?table=1' },
          label: { type: 'string', example: 'Table 1' },
        },
      },
      PricingPlan: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Pro' },
          description: { type: 'string', nullable: true },
          price: { type: 'number', example: 29.99 },
          maxUsers: { type: 'integer', example: 10 },
          maxOrders: { type: 'integer', example: 5000 },
          features: { type: 'array', items: { type: 'string' } },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreatePricingPlanInput: {
        type: 'object',
        required: ['name', 'price'],
        properties: {
          name: { type: 'string', example: 'Enterprise' },
          description: { type: 'string' },
          price: { type: 'number', example: 99.99 },
          maxUsers: { type: 'integer', example: 50 },
          maxOrders: { type: 'integer', example: 50000 },
          features: { type: 'array', items: { type: 'string' } },
        },
      },
      FeatureFlag: {
        type: 'object',
        properties: {
          key: { type: 'string', example: 'ai_chatbot' },
          label: { type: 'string', example: 'AI Chatbot' },
          description: { type: 'string' },
          enabled: { type: 'boolean' },
          tenantOverrides: { type: 'object', example: { 'tenant-uuid': true } },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateFeatureFlagInput: {
        type: 'object',
        required: ['key', 'label'],
        properties: {
          key: { type: 'string', example: 'multi_language' },
          label: { type: 'string', example: 'Multi-language Menu' },
          description: { type: 'string' },
          enabled: { type: 'boolean', example: false },
        },
      },
      Subscription: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          tenantId: { type: 'string', format: 'uuid' },
          planId: { type: 'string', format: 'uuid' },
          status: { type: 'string', enum: ['active', 'trialing', 'past_due', 'cancelled', 'expired'] },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time', nullable: true },
          autoRenew: { type: 'boolean' },
          plan: { $ref: '#/components/schemas/PricingPlan' },
        },
      },
      TenantDomain: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          domain: { type: 'string', example: 'menu.bistronoir.com' },
          verified: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateDomainInput: {
        type: 'object',
        required: ['domain'],
        properties: {
          domain: { type: 'string', example: 'menu.bistronoir.com' },
        },
      },
      PlatformAnalytics: {
        type: 'object',
        properties: {
          totalTenants: { type: 'integer', example: 2 },
          activeTenants: { type: 'integer', example: 2 },
          totalOrders: { type: 'integer', example: 0 },
          totalRevenue: { type: 'number', example: 0 },
          tenants: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', format: 'uuid' },
                name: { type: 'string' },
                slug: { type: 'string' },
                isActive: { type: 'boolean' },
                _count: {
                  type: 'object',
                  properties: {
                    users: { type: 'integer' },
                    orders: { type: 'integer' },
                    menuItems: { type: 'integer' },
                  },
                },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      SalesReport: {
        type: 'object',
        properties: {
          totalRevenue: { type: 'number', example: 1250.00 },
          totalOrders: { type: 'integer', example: 42 },
          avgTicket: { type: 'number', example: 29.76 },
          orders: { type: 'array', items: { $ref: '#/components/schemas/Order' } },
        },
      },
      DailyRevenue: {
        type: 'object',
        properties: {
          date: { type: 'string', format: 'date-time' },
          revenue: { type: 'number', example: 450.00 },
          orderCount: { type: 'integer', example: 15 },
        },
      },
      ExpensesSummary: {
        type: 'object',
        properties: {
          totalExpenses: { type: 'number', example: 1200.00 },
          byCategory: { type: 'object', example: { Supplies: 600, Labor: 400, Utilities: 200 } },
          count: { type: 'integer', example: 8 },
        },
      },
      TaxSummary: {
        type: 'object',
        properties: {
          totalTax: { type: 'number', example: 95.00 },
          totalRevenue: { type: 'number', example: 1250.00 },
          invoiceCount: { type: 'integer', example: 5 },
        },
      },
      UploadResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          data: {
            type: 'object',
            properties: {
              url: { type: 'string', example: 'https://res.cloudinary.com/.../image/upload/v1/digital_menu/sample.jpg' },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Authentication and token management' },
    { name: 'Menu', description: 'Menu item CRUD' },
    { name: 'Categories', description: 'Menu categories' },
    { name: 'Orders', description: 'Order creation, tracking, and kitchen display' },
    { name: 'Tables', description: 'Dining table management' },
    { name: 'Payments', description: 'Payment processing and refunds' },
    { name: 'Expenses', description: 'Business expense tracking (manager)' },
    { name: 'Invoices', description: 'Invoice management (manager)' },
    { name: 'Staff Schedules', description: 'Staff shift scheduling (manager)' },
    { name: 'QR Codes', description: 'Restaurant QR code management (manager)' },
    { name: 'Reports', description: 'Sales, expense, and tax reports' },
    { name: 'Kitchen', description: 'Kitchen order display' },
    { name: 'Users', description: 'Staff user management (manager)' },
    { name: 'Domains', description: 'Custom domain management (manager)' },
    { name: 'Subscriptions', description: 'Tenant subscription (manager)' },
    { name: 'Upload', description: 'Image upload to Cloudinary' },
    { name: 'Tenants', description: 'Tenant CRUD (super_admin only)' },
    { name: 'Pricing', description: 'Pricing plan management (super_admin only)' },
    { name: 'Feature Flags', description: 'Feature flag management (super_admin only)' },
    { name: 'Platform', description: 'Platform analytics (super_admin only)' },
  ],
  paths: {
    // ─── Auth ──────────────────────────────────────────────────────────────────
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Staff or Super Admin login',
        description: 'Login with email + password. Include tenantSlug for staff, omit for super_admin.',
        operationId: 'authLogin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginInput' },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/AuthResponse' } } } } } },
          '400': { description: 'Missing fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/admin/login': {
      post: {
        tags: ['Auth'],
        summary: 'Super Admin login (alias)',
        description: 'Super admin login without tenantSlug.',
        operationId: 'adminLogin',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AdminLoginInput' },
            },
          },
        },
        responses: {
          '200': { description: 'Login successful', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/AuthResponse' } } } } } },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        description: 'Exchange a valid refresh token for a new access token.',
        operationId: 'authRefresh',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenInput' },
            },
          },
        },
        responses: {
          '200': { description: 'Token refreshed', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'object', properties: { accessToken: { type: 'string' } } } } } } } },
          '401': { description: 'Invalid refresh token', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user',
        description: 'Returns the authenticated user profile.',
        operationId: 'authMe',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Current user profile', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/User' } } } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },

    // ─── Menu ──────────────────────────────────────────────────────────────────
    '/api/menu': {
      get: {
        tags: ['Menu'],
        summary: 'List menu items',
        description: 'Public. Returns all menu items for the tenant resolved from x-tenant-slug header.',
        operationId: 'listMenuItems',
        parameters: [
          { name: 'x-tenant-slug', in: 'header', schema: { type: 'string', example: 'bistronoir' }, description: 'Tenant slug (defaults to NEXT_PUBLIC_DEFAULT_TENANT)' },
        ],
        responses: {
          '200': { description: 'List of menu items', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/MenuItem' } } } } } } },
        },
      },
      post: {
        tags: ['Menu'],
        summary: 'Create menu item',
        description: 'Requires manager role.',
        operationId: 'createMenuItem',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/CreateMenuItemInput' } },
            'multipart/form-data': { schema: { type: 'object', properties: { name: { type: 'string' }, price: { type: 'number' }, category: { type: 'string' }, description: { type: 'string' }, tags: { type: 'string' }, available: { type: 'boolean' }, image: { type: 'string', format: 'binary' } } } },
          },
        },
        responses: {
          '201': { description: 'Menu item created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/MenuItem' } } } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/menu/{id}': {
      put: {
        tags: ['Menu'],
        summary: 'Update menu item',
        description: 'Requires manager role.',
        operationId: 'updateMenuItem',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/UpdateMenuItemInput' } },
          },
        },
        responses: {
          '200': { description: 'Menu item updated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/MenuItem' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Menu'],
        summary: 'Delete menu item',
        description: 'Requires manager role.',
        operationId: 'deleteMenuItem',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Menu item deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Not found' },
        },
      },
    },

    // ─── Categories ────────────────────────────────────────────────────────────
    '/api/categories': {
      get: {
        tags: ['Categories'],
        summary: 'List categories',
        description: 'Public. Returns menu categories for the tenant.',
        operationId: 'listCategories',
        parameters: [
          { name: 'x-tenant-slug', in: 'header', schema: { type: 'string', example: 'bistronoir' } },
        ],
        responses: {
          '200': { description: 'List of categories', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Category' } } } } } } },
        },
      },
      post: {
        tags: ['Categories'],
        summary: 'Create category',
        description: 'Requires manager role.',
        operationId: 'createCategory',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCategoryInput' } } },
        },
        responses: {
          '201': { description: 'Category created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Category' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/api/categories/{id}': {
      put: {
        tags: ['Categories'],
        summary: 'Update category',
        operationId: 'updateCategory',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateCategoryInput' } } },
        },
        responses: {
          '200': { description: 'Category updated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Category' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete category',
        operationId: 'deleteCategory',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Category deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },

    // ─── Orders ────────────────────────────────────────────────────────────────
    '/api/orders': {
      get: {
        tags: ['Orders'],
        summary: 'List orders (staff)',
        description: 'Requires manager, cashier, waiter, or kitchen_staff role.',
        operationId: 'listOrders',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'] } },
          { name: 'tableNumber', in: 'query', schema: { type: 'integer' } },
        ],
        responses: {
          '200': { description: 'List of orders', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } } } },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Orders'],
        summary: 'Create order (public)',
        description: 'Public. Customer places an order. Tenant resolved from header.',
        operationId: 'createOrder',
        parameters: [
          { name: 'x-tenant-slug', in: 'header', schema: { type: 'string', example: 'bistronoir' } },
        ],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateOrderInput' } } },
        },
        responses: {
          '201': { description: 'Order created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Order' } } } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order by ID (public)',
        description: 'Public. Customer tracks their order status.',
        operationId: 'getOrder',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'x-tenant-slug', in: 'header', schema: { type: 'string', example: 'bistronoir' } },
        ],
        responses: {
          '200': { description: 'Order details', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Order' } } } } } },
          '404': { description: 'Not found' },
        },
      },
    },
    '/api/orders/{id}/status': {
      put: {
        tags: ['Orders'],
        summary: 'Update order status',
        description: 'Requires manager, waiter, or kitchen_staff. Kitchen staff can only set preparing/ready/completed.',
        operationId: 'updateOrderStatus',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateOrderStatusInput' } } },
        },
        responses: {
          '200': { description: 'Order status updated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Order' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Not found' },
        },
      },
    },

    // ─── Tables ────────────────────────────────────────────────────────────────
    '/api/tables': {
      get: {
        tags: ['Tables'],
        summary: 'List tables',
        description: 'Requires manager or waiter role.',
        operationId: 'listTables',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'List of tables', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Table' } } } } } } },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Tables'],
        summary: 'Create table',
        description: 'Requires manager role.',
        operationId: 'createTable',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTableInput' } } },
        },
        responses: {
          '201': { description: 'Table created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Table' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/api/tables/{id}': {
      put: {
        tags: ['Tables'],
        summary: 'Update table',
        operationId: 'updateTable',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTableInput' } } },
        },
        responses: {
          '200': { description: 'Table updated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Table' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
      delete: {
        tags: ['Tables'],
        summary: 'Delete table',
        operationId: 'deleteTable',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Table deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },

    // ─── Payments ──────────────────────────────────────────────────────────────
    '/api/payments': {
      get: {
        tags: ['Payments'],
        summary: 'List payments',
        description: 'Requires manager or cashier role.',
        operationId: 'listPayments',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'orderId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'completed', 'failed', 'refunded'] } },
          { name: 'method', in: 'query', schema: { type: 'string', enum: ['cash', 'card', 'mobile', 'other'] } },
        ],
        responses: {
          '200': { description: 'List of payments', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Payment' } } } } } } },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Payments'],
        summary: 'Create payment',
        description: 'Requires manager or cashier role.',
        operationId: 'createPayment',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePaymentInput' } } },
        },
        responses: {
          '201': { description: 'Payment created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Payment' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Order not found' },
        },
      },
    },
    '/api/payments/{id}/refund': {
      post: {
        tags: ['Payments'],
        summary: 'Refund payment',
        description: 'Requires manager or cashier role.',
        operationId: 'refundPayment',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Payment refunded', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Payment' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Payment not found' },
        },
      },
    },

    // ─── Expenses ──────────────────────────────────────────────────────────────
    '/api/expenses': {
      get: {
        tags: ['Expenses'],
        summary: 'List expenses',
        description: 'Requires manager role.',
        operationId: 'listExpenses',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          '200': { description: 'List of expenses', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Expense' } } } } } } },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Expenses'],
        summary: 'Create expense',
        description: 'Requires manager role.',
        operationId: 'createExpense',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateExpenseInput' } } },
        },
        responses: {
          '201': { description: 'Expense created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Expense' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/api/expenses/{id}': {
      put: {
        tags: ['Expenses'],
        summary: 'Update expense',
        operationId: 'updateExpense',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateExpenseInput' } } },
        },
        responses: {
          '200': { description: 'Expense updated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Expense' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
      delete: {
        tags: ['Expenses'],
        summary: 'Delete expense',
        operationId: 'deleteExpense',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Expense deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },

    // ─── Invoices ──────────────────────────────────────────────────────────────
    '/api/invoices': {
      get: {
        tags: ['Invoices'],
        summary: 'List invoices',
        description: 'Requires manager role.',
        operationId: 'listInvoices',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', example: 'draft' } },
        ],
        responses: {
          '200': { description: 'List of invoices', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Invoice' } } } } } } },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Invoices'],
        summary: 'Create invoice',
        description: 'Requires manager role.',
        operationId: 'createInvoice',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateInvoiceInput' } } },
        },
        responses: {
          '201': { description: 'Invoice created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Invoice' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/api/invoices/{id}': {
      put: {
        tags: ['Invoices'],
        summary: 'Update invoice',
        operationId: 'updateInvoice',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateInvoiceInput' } } },
        },
        responses: {
          '200': { description: 'Invoice updated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Invoice' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
      patch: {
        tags: ['Invoices'],
        summary: 'Mark invoice as paid',
        description: 'Send { "action": "mark-paid" } to mark invoice as paid.',
        operationId: 'markInvoicePaid',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { action: { type: 'string', enum: ['mark-paid'], example: 'mark-paid' } } } } },
        },
        responses: {
          '200': { description: 'Invoice marked as paid', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Invoice' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },

    // ─── Staff Schedules ───────────────────────────────────────────────────────
    '/api/staff-schedules': {
      get: {
        tags: ['Staff Schedules'],
        summary: 'List staff schedules',
        description: 'Requires manager role.',
        operationId: 'listSchedules',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'userId', in: 'query', schema: { type: 'string', format: 'uuid' } },
          { name: 'dayOfWeek', in: 'query', schema: { type: 'integer', description: '0=Sun, 1=Mon...6=Sat' } },
        ],
        responses: {
          '200': { description: 'List of schedules', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/StaffSchedule' } } } } } } },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Staff Schedules'],
        summary: 'Create staff schedule',
        operationId: 'createSchedule',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateScheduleInput' } } },
        },
        responses: {
          '201': { description: 'Schedule created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/StaffSchedule' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/api/staff-schedules/{id}': {
      put: {
        tags: ['Staff Schedules'],
        summary: 'Update staff schedule',
        operationId: 'updateSchedule',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateScheduleInput' } } },
        },
        responses: {
          '200': { description: 'Schedule updated' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
      delete: {
        tags: ['Staff Schedules'],
        summary: 'Delete staff schedule',
        operationId: 'deleteSchedule',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Schedule deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },

    // ─── QR Codes ──────────────────────────────────────────────────────────────
    '/api/qrcodes': {
      get: {
        tags: ['QR Codes'],
        summary: 'List QR codes',
        description: 'Requires manager role.',
        operationId: 'listQrCodes',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'List of QR codes', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/QrCode' } } } } } } },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['QR Codes'],
        summary: 'Create QR code',
        operationId: 'createQrCode',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateQrCodeInput' } } },
        },
        responses: {
          '201': { description: 'QR code created' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/api/qrcodes/{id}': {
      put: {
        tags: ['QR Codes'],
        summary: 'Update QR code',
        operationId: 'updateQrCode',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'QR code updated' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
      delete: {
        tags: ['QR Codes'],
        summary: 'Delete QR code',
        operationId: 'deleteQrCode',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'QR code deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },

    // ─── Kitchen ───────────────────────────────────────────────────────────────
    '/api/kitchen/orders': {
      get: {
        tags: ['Kitchen'],
        summary: 'List kitchen orders',
        description: 'Requires kitchen_staff or manager role. Optionally filter by status.',
        operationId: 'listKitchenOrders',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'] } },
        ],
        responses: {
          '200': { description: 'Kitchen orders', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } } } } },
          '401': { description: 'Unauthorized' },
        },
      },
    },

    // ─── Reports ───────────────────────────────────────────────────────────────
    '/api/reports/sales': {
      get: {
        tags: ['Reports'],
        summary: 'Sales report',
        description: 'Requires manager role.',
        operationId: 'salesReport',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          '200': { description: 'Sales report', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/SalesReport' } } } } } },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/reports/daily-revenue': {
      get: {
        tags: ['Reports'],
        summary: 'Daily revenue',
        description: 'Requires manager role.',
        operationId: 'dailyRevenue',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          '200': { description: 'Daily revenue', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/DailyRevenue' } } } } } },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/reports/expenses': {
      get: {
        tags: ['Reports'],
        summary: 'Expenses summary',
        description: 'Requires manager role.',
        operationId: 'expensesSummary',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          '200': { description: 'Expenses summary', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/ExpensesSummary' } } } } } },
          '401': { description: 'Unauthorized' },
        },
      },
    },
    '/api/reports/taxes': {
      get: {
        tags: ['Reports'],
        summary: 'Tax summary',
        description: 'Requires manager role.',
        operationId: 'taxSummary',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'dateFrom', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'dateTo', in: 'query', schema: { type: 'string', format: 'date' } },
        ],
        responses: {
          '200': { description: 'Tax summary', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/TaxSummary' } } } } } },
          '401': { description: 'Unauthorized' },
        },
      },
    },

    // ─── Users ─────────────────────────────────────────────────────────────────
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List staff users',
        description: 'Requires manager role.',
        operationId: 'listUsers',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'List of staff', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/User' } } } } } } },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Create staff user',
        description: 'Requires manager role.',
        operationId: 'createUser',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUserInput' } } },
        },
        responses: {
          '201': { description: 'User created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/User' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get staff user',
        description: 'Requires manager role.',
        operationId: 'getUser',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'User details', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/User' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Not found' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update staff user',
        description: 'Requires manager role.',
        operationId: 'updateUser',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUserInput' } } },
        },
        responses: {
          '200': { description: 'User updated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/User' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete staff user',
        description: 'Requires manager role.',
        operationId: 'deleteUser',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'User deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },

    // ─── Domains ───────────────────────────────────────────────────────────────
    '/api/domains': {
      get: {
        tags: ['Domains'],
        summary: 'List custom domains',
        description: 'Requires manager role.',
        operationId: 'listDomains',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'List of domains', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/TenantDomain' } } } } } } },
          '401': { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Domains'],
        summary: 'Add custom domain',
        description: 'Requires manager role.',
        operationId: 'createDomain',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateDomainInput' } } },
        },
        responses: {
          '201': { description: 'Domain added', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/TenantDomain' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/api/domains/{id}': {
      delete: {
        tags: ['Domains'],
        summary: 'Remove custom domain',
        description: 'Requires manager role.',
        operationId: 'deleteDomain',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Domain removed', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },

    // ─── Subscriptions ─────────────────────────────────────────────────────────
    '/api/subscriptions': {
      get: {
        tags: ['Subscriptions'],
        summary: 'Get tenant subscription',
        description: 'Requires manager role.',
        operationId: 'getSubscription',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Subscription details', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Subscription' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },

    // ─── Upload ────────────────────────────────────────────────────────────────
    '/api/upload': {
      post: {
        tags: ['Upload'],
        summary: 'Upload image',
        description: 'Upload an image file to Cloudinary. Requires authentication.',
        operationId: 'uploadImage',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: { type: 'string', format: 'binary', description: 'Image file (max 5MB, jpg/png/webp)' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Image uploaded', content: { 'application/json': { schema: { $ref: '#/components/schemas/UploadResponse' } } } },
          '400': { description: 'Invalid file', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          '401': { description: 'Unauthorized' },
        },
      },
    },

    // ─── Super Admin: Tenants ──────────────────────────────────────────────────
    '/api/tenants': {
      get: {
        tags: ['Tenants'],
        summary: 'List all tenants',
        description: 'Super admin only.',
        operationId: 'listTenants',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'All tenants', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/Tenant' } } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
      post: {
        tags: ['Tenants'],
        summary: 'Create tenant',
        description: 'Super admin only. Provision a new restaurant.',
        operationId: 'createTenant',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateTenantInput' } } },
        },
        responses: {
          '201': { description: 'Tenant created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Tenant' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/api/tenants/{id}': {
      get: {
        tags: ['Tenants'],
        summary: 'Get tenant details',
        description: 'Super admin only.',
        operationId: 'getTenant',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Tenant details', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Tenant' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
          '404': { description: 'Not found' },
        },
      },
      put: {
        tags: ['Tenants'],
        summary: 'Update tenant',
        description: 'Super admin only. Can suspend (set isActive=false) or modify tenant.',
        operationId: 'updateTenant',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateTenantInput' } } },
        },
        responses: {
          '200': { description: 'Tenant updated', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/Tenant' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
      delete: {
        tags: ['Tenants'],
        summary: 'Delete tenant',
        description: 'Super admin only. Permanently deletes a tenant and all related data.',
        operationId: 'deleteTenant',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Tenant deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },

    // ─── Super Admin: Pricing Plans ────────────────────────────────────────────
    '/api/admin/pricing': {
      get: {
        tags: ['Pricing'],
        summary: 'List pricing plans',
        description: 'Super admin only.',
        operationId: 'listPricingPlans',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'All pricing plans', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/PricingPlan' } } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
      post: {
        tags: ['Pricing'],
        summary: 'Create pricing plan',
        operationId: 'createPricingPlan',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePricingPlanInput' } } },
        },
        responses: {
          '201': { description: 'Pricing plan created', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/PricingPlan' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/api/admin/pricing/{id}': {
      put: {
        tags: ['Pricing'],
        summary: 'Update pricing plan',
        operationId: 'updatePricingPlan',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreatePricingPlanInput' } } },
        },
        responses: {
          '200': { description: 'Pricing plan updated' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
      delete: {
        tags: ['Pricing'],
        summary: 'Delete pricing plan',
        operationId: 'deletePricingPlan',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
        responses: {
          '200': { description: 'Pricing plan deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },

    // ─── Super Admin: Feature Flags ────────────────────────────────────────────
    '/api/admin/feature-flags': {
      get: {
        tags: ['Feature Flags'],
        summary: 'List feature flags',
        description: 'Super admin only.',
        operationId: 'listFeatureFlags',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'All feature flags', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { type: 'array', items: { $ref: '#/components/schemas/FeatureFlag' } } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
      post: {
        tags: ['Feature Flags'],
        summary: 'Create feature flag',
        operationId: 'createFeatureFlag',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateFeatureFlagInput' } } },
        },
        responses: {
          '201': { description: 'Feature flag created' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
    '/api/admin/feature-flags/{key}': {
      put: {
        tags: ['Feature Flags'],
        summary: 'Update feature flag',
        operationId: 'updateFeatureFlag',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'key', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateFeatureFlagInput' } } },
        },
        responses: {
          '200': { description: 'Feature flag updated' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
      delete: {
        tags: ['Feature Flags'],
        summary: 'Delete feature flag',
        operationId: 'deleteFeatureFlag',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'key', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Feature flag deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
      patch: {
        tags: ['Feature Flags'],
        summary: 'Set tenant override or toggle',
        description: 'Send { "enabled": true/false } to toggle globally, or { "tenantId": "...", "enabled": true } for per-tenant override.',
        operationId: 'patchFeatureFlag',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'key', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': {
            schema: {
              type: 'object',
              properties: {
                tenantId: { type: 'string', format: 'uuid', description: 'Tenant UUID for per-tenant override' },
                enabled: { type: 'boolean', example: true },
              },
            },
          } },
        },
        responses: {
          '200': { description: 'Feature flag updated' },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },

    // ─── Super Admin: Platform Analytics ───────────────────────────────────────
    '/api/admin/analytics': {
      get: {
        tags: ['Platform'],
        summary: 'Platform analytics',
        description: 'Super admin only. Returns platform-wide metrics.',
        operationId: 'platformAnalytics',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': { description: 'Platform analytics', content: { 'application/json': { schema: { type: 'object', properties: { success: { type: 'boolean', example: true }, data: { $ref: '#/components/schemas/PlatformAnalytics' } } } } } },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden' },
        },
      },
    },
  },
};
