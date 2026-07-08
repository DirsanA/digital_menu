export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Digital Menu API',
    version: '1.0.0',
    description: `API for the Digital Menu multi-tenant restaurant management system.
Supports menu management, order processing, AI chat, staff management, and tenant customization.

Base URL: \`http://localhost:3000\`

## Authentication
Most endpoints require a JWT Bearer token obtained via \`POST /api/auth/login\`.
Include it as: \`Authorization: Bearer <accessToken>\`

## Multi-Tenant
Tenant-resolved endpoints use the \`x-tenant-slug\` header (e.g. \`x-tenant-slug: bistronoir\`)
or fall back to the \`NEXT_PUBLIC_DEFAULT_TENANT\` environment variable.`,
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
        description: 'JWT access token from POST /api/auth/login',
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
      Tenant: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '0ed1efb2-78d4-44f4-9af0-af6e2260c996' },
          slug: { type: 'string', example: 'bistronoir' },
          name: { type: 'string', example: 'Bistro Noir' },
          description: { type: 'string', nullable: true, example: null },
          logoUrl: { type: 'string', nullable: true, example: null },
          coverImageUrl: { type: 'string', nullable: true, example: null },
          primaryColor: { type: 'string', example: '#6366f1' },
          accentColor: { type: 'string', example: '#f59e0b' },
          customDomain: { type: 'string', nullable: true, example: null },
          timezone: { type: 'string', example: 'UTC' },
          currency: { type: 'string', example: 'USD' },
          serviceCharge: { type: 'number', example: 10.00 },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '46a5f155-1dae-48cf-9b09-6caaf2e31d46' },
          email: { type: 'string', format: 'email', example: 'admin@bistronoir.com' },
          displayName: { type: 'string', example: 'Admin' },
          role: { type: 'string', enum: ['admin', 'manager', 'kitchen', 'server'], example: 'admin' },
          isActive: { type: 'boolean', example: true },
          lastLoginAt: { type: 'string', format: 'date-time', nullable: true, example: null },
          createdAt: { type: 'string', format: 'date-time', example: '2026-07-07T00:00:00Z' },
        },
      },
      CreateUserInput: {
        type: 'object',
        required: ['email', 'password', 'displayName', 'role'],
        properties: {
          email: { type: 'string', format: 'email', example: 'newstaff@example.com' },
          password: { type: 'string', format: 'password', example: 'securePass123' },
          displayName: { type: 'string', example: 'New Staff' },
          role: { type: 'string', enum: ['admin', 'manager', 'kitchen', 'server'], example: 'server' },
        },
      },
      UpdateUserInput: {
        type: 'object',
        properties: {
          displayName: { type: 'string', example: 'Admin (Updated)' },
          role: { type: 'string', enum: ['admin', 'manager', 'kitchen', 'server'], example: 'manager' },
          isActive: { type: 'boolean', example: true },
        },
      },
      MenuItem: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'menu-item-uuid' },
          name: { type: 'string', example: 'Margherita Pizza' },
          price: { type: 'number', example: 12.99 },
          description: { type: 'string', example: 'Classic tomato, mozzarella, and basil' },
          category: { type: 'string', example: 'Pizza' },
          tags: { type: 'array', items: { type: 'string' }, example: ['vegetarian', 'popular'] },
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
          category: { type: 'string', example: 'Pizza' },
          description: { type: 'string', example: 'Classic tomato, mozzarella, and basil' },
          tags: { type: 'array', items: { type: 'string' }, example: ['vegetarian', 'popular'] },
          available: { type: 'boolean', example: true },
          imageUrl: { type: 'string', example: 'https://example.com/pizza.jpg' },
        },
      },
      UpdateMenuItemInput: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Margherita Pizza (Updated)' },
          price: { type: 'number', example: 14.99 },
          category: { type: 'string', example: 'Pizza' },
          description: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          available: { type: 'boolean', example: false },
          imageUrl: { type: 'string' },
        },
      },
      OrderItem: {
        type: 'object',
        properties: {
          menuItemId: { type: 'string', format: 'uuid', example: 'item-uuid-1' },
          name: { type: 'string', example: 'Margherita Pizza' },
          quantity: { type: 'integer', example: 2 },
          unitPrice: { type: 'number', example: 12.99 },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'order-uuid' },
          orderNumber: { type: 'integer', example: 1 },
          tableNumber: { type: 'integer', example: 5 },
          status: { type: 'string', enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'], example: 'pending' },
          notes: { type: 'string', example: 'No onions please' },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          subtotal: { type: 'number', example: 25.98 },
          serviceCharge: { type: 'number', example: 2.60 },
          totalAmount: { type: 'number', example: 28.58 },
          createdAt: { type: 'string', format: 'date-time', example: '2026-07-07T12:00:00Z' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateOrderInput: {
        type: 'object',
        required: ['tableNumber', 'items', 'subtotal', 'serviceCharge', 'totalAmount'],
        properties: {
          tableNumber: { type: 'integer', example: 5 },
          notes: { type: 'string', example: 'No onions please' },
          items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
          subtotal: { type: 'number', example: 35.97 },
          serviceCharge: { type: 'number', example: 3.60 },
          totalAmount: { type: 'number', example: 39.57 },
        },
      },
      ConversationMessage: {
        type: 'object',
        properties: {
          role: { type: 'string', enum: ['user', 'assistant', 'system'], example: 'user' },
          content: { type: 'string', example: "What is today's special?" },
          timestamp: { type: 'string', format: 'date-time', example: '2026-07-07T12:00:00Z' },
        },
      },
      Conversation: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'conversation-uuid' },
          sessionId: { type: 'string', example: 'abc-123-session' },
          messages: { type: 'array', items: { $ref: '#/components/schemas/ConversationMessage' } },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      TenantDomain: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: 'domain-uuid' },
          domain: { type: 'string', example: 'menu.bistronoir.com' },
          verified: { type: 'boolean', example: false },
          createdAt: { type: 'string', format: 'date-time', example: '2026-07-07T00:00:00Z' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string', format: 'email' },
              displayName: { type: 'string' },
              role: { type: 'string' },
              tenantId: { type: 'string', format: 'uuid' },
              tenantSlug: { type: 'string' },
              tenantName: { type: 'string' },
            },
          },
        },
      },
      ChatRequest: {
        type: 'object',
        required: ['messages'],
        properties: {
          messages: {
            type: 'array',
            description: 'Array of chat messages (system + user)',
            items: {
              type: 'object',
              properties: {
                role: { type: 'string', enum: ['system', 'user', 'assistant'] },
                content: { type: 'string' },
              },
            },
          },
        },
      },
      ChatResponse: {
        type: 'object',
        properties: {
          content: { type: 'string', example: "I'd be happy to help you with today's specials!" },
          fallback: { type: 'boolean', example: false },
          reason: { type: 'string' },
        },
      },
      CreateTenantInput: {
        type: 'object',
        required: ['slug', 'name'],
        properties: {
          slug: { type: 'string', example: 'new-restaurant' },
          name: { type: 'string', example: 'New Restaurant' },
          description: { type: 'string', example: 'A brand new restaurant' },
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
          name: { type: 'string', example: 'Bistro Noir (Updated)' },
          description: { type: 'string', example: 'Updated description' },
          primaryColor: { type: 'string', example: '#ef4444' },
          accentColor: { type: 'string' },
          timezone: { type: 'string' },
          currency: { type: 'string' },
          serviceCharge: { type: 'number', example: 12.50 },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password', 'tenantSlug'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@bistronoir.com' },
          password: { type: 'string', format: 'password', example: 'admin123' },
          tenantSlug: { type: 'string', example: 'bistronoir' },
        },
      },
      RefreshTokenInput: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
        },
      },
      AppendMessageInput: {
        type: 'object',
        required: ['sessionId', 'role', 'content'],
        properties: {
          sessionId: { type: 'string', example: 'abc-123-session' },
          role: { type: 'string', enum: ['user', 'assistant', 'system'], example: 'user' },
          content: { type: 'string', example: "What is today's special?" },
        },
      },
      CreateDomainInput: {
        type: 'object',
        required: ['domain'],
        properties: {
          domain: { type: 'string', example: 'menu.bistronoir.com' },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Operation successful' },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Authentication and token management' },
    { name: 'Tenants', description: 'Tenant (restaurant) CRUD (admin only)' },
    { name: 'Users', description: 'Staff user management' },
    { name: 'Menu', description: 'Menu item management' },
    { name: 'Orders', description: 'Order creation and tracking' },
    { name: 'Domains', description: 'Custom domain management (admin only)' },
    { name: 'Chat', description: 'AI chatbot powered by Groq (Llama 3)' },
    { name: 'Conversations', description: 'Chat conversation persistence' },
  ],
  paths: {
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate user',
        description: 'Login with email, password, and tenant slug. Returns JWT access and refresh tokens.',
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
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/AuthResponse' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Missing required fields',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'email, password, and tenantSlug are required' },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Invalid credentials',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
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
          '200': {
            description: 'Token refreshed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIs...' },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Missing refresh token',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        description: 'Returns the authenticated user profile. Requires a valid JWT token.',
        operationId: 'authMe',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'User profile',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email', example: 'admin@bistronoir.com' },
                        displayName: { type: 'string', example: 'Admin' },
                        role: { type: 'string', example: 'admin' },
                        tenantId: { type: 'string', format: 'uuid' },
                        tenantSlug: { type: 'string', example: 'bistronoir' },
                        tenantName: { type: 'string', example: 'Bistro Noir' },
                      },
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Missing or invalid token',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    message: { type: 'string', example: 'Authentication required' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/chat': {
      post: {
        tags: ['Chat'],
        summary: 'Send message to AI assistant',
        description: 'Sends a chat messages array to the Groq-powered AI assistant. Does not require authentication.',
        operationId: 'chatSend',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChatRequest' },
            },
          },
        },
        responses: {
          '200': {
            description: 'AI response',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ChatResponse' },
              },
            },
          },
          '400': {
            description: 'Invalid request body',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'Body must include a non-empty messages array.' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/conversations': {
      get: {
        tags: ['Conversations'],
        summary: 'Get conversation history',
        description: 'Retrieves chat messages for a given session. Tenant-resolved via x-tenant-slug header.',
        operationId: 'getConversation',
        parameters: [
          {
            name: 'sessionId',
            in: 'query',
            required: true,
            schema: { type: 'string' },
            description: 'Unique session identifier',
            example: 'abc-123-session',
          },
          {
            name: 'x-tenant-slug',
            in: 'header',
            required: false,
            schema: { type: 'string' },
            description: 'Tenant slug (defaults to NEXT_PUBLIC_DEFAULT_TENANT)',
            example: 'bistronoir',
          },
        ],
        responses: {
          '200': {
            description: 'Conversation messages',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        messages: { type: 'array', items: { $ref: '#/components/schemas/ConversationMessage' } },
                      },
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Missing sessionId',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
      post: {
        tags: ['Conversations'],
        summary: 'Append message to conversation',
        description: 'Appends a message to a chat conversation session. Tenant-resolved via x-tenant-slug header.',
        operationId: 'appendMessage',
        parameters: [
          {
            name: 'x-tenant-slug',
            in: 'header',
            required: false,
            schema: { type: 'string' },
            description: 'Tenant slug',
            example: 'bistronoir',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AppendMessageInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Message appended',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Conversation' },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Missing required fields',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
          },
        },
      },
    },
    '/api/domains': {
      get: {
        tags: ['Domains'],
        summary: 'List tenant domains',
        description: 'Returns all custom domains for the authenticated user tenant. Admin only.',
        operationId: 'listDomains',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of domains',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/TenantDomain' },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Insufficient permissions (admin only)' },
        },
      },
      post: {
        tags: ['Domains'],
        summary: 'Add custom domain',
        description: 'Registers a new custom domain for the tenant. Admin only.',
        operationId: 'createDomain',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateDomainInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Domain created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/TenantDomain' },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Insufficient permissions' },
        },
      },
    },
    '/api/domains/{id}': {
      delete: {
        tags: ['Domains'],
        summary: 'Remove custom domain',
        description: 'Deletes a custom domain by ID. Admin only.',
        operationId: 'deleteDomain',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Domain ID',
            example: 'domain-uuid',
          },
        ],
        responses: {
          '200': {
            description: 'Domain removed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Domain removed' },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Insufficient permissions' },
        },
      },
    },
    '/api/menu': {
      get: {
        tags: ['Menu'],
        summary: 'List menu items',
        description: 'Returns all menu items for the resolved tenant. Tenant-resolved via x-tenant-slug header.',
        operationId: 'listMenuItems',
        parameters: [
          {
            name: 'x-tenant-slug',
            in: 'header',
            required: false,
            schema: { type: 'string' },
            description: 'Tenant slug',
            example: 'bistronoir',
          },
        ],
        responses: {
          '200': {
            description: 'List of menu items',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/MenuItem' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Menu'],
        summary: 'Create menu item',
        description: 'Creates a new menu item. Accepts JSON or multipart/form-data (for image upload). Tenant-resolved.',
        operationId: 'createMenuItem',
        parameters: [
          {
            name: 'x-tenant-slug',
            in: 'header',
            required: false,
            schema: { type: 'string' },
            description: 'Tenant slug',
            example: 'bistronoir',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateMenuItemInput' },
            },
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  price: { type: 'number' },
                  category: { type: 'string' },
                  description: { type: 'string' },
                  tags: { type: 'string', description: 'Comma-separated tags' },
                  available: { type: 'string', description: 'true or false' },
                  image: { type: 'string', format: 'binary', description: 'Image file upload' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Menu item created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/MenuItem' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/menu/{id}': {
      put: {
        tags: ['Menu'],
        summary: 'Update menu item',
        description: 'Updates a menu item by ID. Accepts JSON or multipart/form-data. Tenant-resolved.',
        operationId: 'updateMenuItem',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Menu item ID',
            example: 'menu-item-uuid',
          },
          {
            name: 'x-tenant-slug',
            in: 'header',
            required: false,
            schema: { type: 'string' },
            description: 'Tenant slug',
            example: 'bistronoir',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateMenuItemInput' },
            },
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  price: { type: 'number' },
                  category: { type: 'string' },
                  description: { type: 'string' },
                  tags: { type: 'string', description: 'Comma-separated tags' },
                  available: { type: 'string', description: 'true or false' },
                  image: { type: 'string', format: 'binary', description: 'Image file upload' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Menu item updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/MenuItem' },
                  },
                },
              },
            },
          },
          '404': { description: 'Menu item not found' },
        },
      },
      delete: {
        tags: ['Menu'],
        summary: 'Delete menu item',
        description: 'Deletes a menu item by ID. Tenant-resolved.',
        operationId: 'deleteMenuItem',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Menu item ID',
            example: 'menu-item-uuid',
          },
          {
            name: 'x-tenant-slug',
            in: 'header',
            required: false,
            schema: { type: 'string' },
            description: 'Tenant slug',
            example: 'bistronoir',
          },
        ],
        responses: {
          '200': {
            description: 'Menu item deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Item deleted' },
                  },
                },
              },
            },
          },
          '404': { description: 'Menu item not found' },
        },
      },
    },
    '/api/orders': {
      get: {
        tags: ['Orders'],
        summary: 'List orders',
        description: 'Returns orders for the resolved tenant. Optional filters by status and tableNumber. Tenant-resolved.',
        operationId: 'listOrders',
        parameters: [
          {
            name: 'status',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'] },
            description: 'Filter by order status',
            example: 'pending',
          },
          {
            name: 'tableNumber',
            in: 'query',
            required: false,
            schema: { type: 'integer' },
            description: 'Filter by table number',
            example: 5,
          },
          {
            name: 'x-tenant-slug',
            in: 'header',
            required: false,
            schema: { type: 'string' },
            description: 'Tenant slug',
            example: 'bistronoir',
          },
        ],
        responses: {
          '200': {
            description: 'List of orders',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Order' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Orders'],
        summary: 'Create order',
        description: 'Creates a new order for the resolved tenant. Tenant-resolved.',
        operationId: 'createOrder',
        parameters: [
          {
            name: 'x-tenant-slug',
            in: 'header',
            required: false,
            schema: { type: 'string' },
            description: 'Tenant slug',
            example: 'bistronoir',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateOrderInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Order created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Order' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get order by ID',
        description: 'Returns a single order by ID. Tenant-resolved.',
        operationId: 'getOrder',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Order ID',
            example: 'order-uuid',
          },
          {
            name: 'x-tenant-slug',
            in: 'header',
            required: false,
            schema: { type: 'string' },
            description: 'Tenant slug',
            example: 'bistronoir',
          },
        ],
        responses: {
          '200': {
            description: 'Order details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Order' },
                  },
                },
              },
            },
          },
          '404': { description: 'Order not found' },
        },
      },
    },
    '/api/orders/{id}/status': {
      put: {
        tags: ['Orders'],
        summary: 'Update order status',
        description: 'Updates the status of an order. Valid statuses: pending, preparing, ready, completed, cancelled.',
        operationId: 'updateOrderStatus',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Order ID',
            example: 'order-uuid',
          },
          {
            name: 'x-tenant-slug',
            in: 'header',
            required: false,
            schema: { type: 'string' },
            description: 'Tenant slug',
            example: 'bistronoir',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
                    example: 'preparing',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Status updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Order' },
                  },
                },
              },
            },
          },
          '404': { description: 'Order not found' },
        },
      },
    },
    '/api/tenants': {
      get: {
        tags: ['Tenants'],
        summary: 'List all tenants',
        description: 'Returns all tenants. Admin only.',
        operationId: 'listTenants',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of tenants',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Tenant' },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Insufficient permissions (admin only)' },
        },
      },
      post: {
        tags: ['Tenants'],
        summary: 'Create tenant',
        description: 'Creates a new tenant (restaurant). Admin only.',
        operationId: 'createTenant',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateTenantInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Tenant created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Tenant' },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Insufficient permissions' },
        },
      },
    },
    '/api/tenants/{id}': {
      get: {
        tags: ['Tenants'],
        summary: 'Get tenant by ID',
        description: 'Returns a single tenant by ID. Admin only.',
        operationId: 'getTenant',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Tenant ID',
            example: '0ed1efb2-78d4-44f4-9af0-af6e2260c996',
          },
        ],
        responses: {
          '200': {
            description: 'Tenant details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Tenant' },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Insufficient permissions' },
          '404': { description: 'Tenant not found' },
        },
      },
      put: {
        tags: ['Tenants'],
        summary: 'Update tenant',
        description: 'Updates a tenant by ID. Admin only.',
        operationId: 'updateTenant',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Tenant ID',
            example: '0ed1efb2-78d4-44f4-9af0-af6e2260c996',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateTenantInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Tenant updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/Tenant' },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Insufficient permissions' },
          '404': { description: 'Tenant not found' },
        },
      },
      delete: {
        tags: ['Tenants'],
        summary: 'Delete tenant',
        description: 'Deletes a tenant by ID. Admin only.',
        operationId: 'deleteTenant',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'Tenant ID',
            example: '0ed1efb2-78d4-44f4-9af0-af6e2260c996',
          },
        ],
        responses: {
          '200': {
            description: 'Tenant deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'Tenant deleted' },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Insufficient permissions' },
          '404': { description: 'Tenant not found' },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List users',
        description: 'Returns all staff users for the authenticated user tenant. Admin or Manager role required.',
        operationId: 'listUsers',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of users',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Insufficient permissions (admin or manager required)' },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Create user',
        description: 'Creates a new staff user within the authenticated user tenant. Admin only.',
        operationId: 'createUser',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUserInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Insufficient permissions (admin only)' },
        },
      },
    },
    '/api/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        description: 'Returns a single staff user by ID. Cross-tenant access is forbidden. Admin or Manager role required.',
        operationId: 'getUser',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'User ID',
            example: '46a5f155-1dae-48cf-9b09-6caaf2e31d46',
          },
        ],
        responses: {
          '200': {
            description: 'User details (passwordHash excluded)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden (cross-tenant) or insufficient permissions' },
          '404': { description: 'User not found' },
        },
      },
      put: {
        tags: ['Users'],
        summary: 'Update user',
        description: 'Updates a staff user by ID. Cross-tenant access is forbidden. Admin only.',
        operationId: 'updateUser',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'User ID',
            example: '46a5f155-1dae-48cf-9b09-6caaf2e31d46',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'User updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden or insufficient permissions' },
          '404': { description: 'User not found' },
        },
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user',
        description: 'Deletes a staff user by ID. Cross-tenant access is forbidden. Admin only.',
        operationId: 'deleteUser',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
            description: 'User ID',
            example: '46a5f155-1dae-48cf-9b09-6caaf2e31d46',
          },
        ],
        responses: {
          '200': {
            description: 'User deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    message: { type: 'string', example: 'User deleted' },
                  },
                },
              },
            },
          },
          '401': { description: 'Unauthorized' },
          '403': { description: 'Forbidden or insufficient permissions' },
          '404': { description: 'User not found' },
        },
      },
    },
  },
};
