const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...\n');

  const passwordHash = await bcrypt.hash('admin123', 12);

  // ── Super Admin (Platform Owner) ──────────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'super@digitalmenu.app' },
    update: {},
    create: {
      email: 'super@digitalmenu.app',
      passwordHash,
      displayName: 'Super Admin',
      role: 'super_admin',
      isActive: true,
    },
  });
  console.log('  ✓ Super Admin: super@digitalmenu.app (password: admin123)');

  // ── Pricing Plans ──────────────────────────────────────────────────────────
  const freePlan = await prisma.pricingPlan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'Free',
      description: 'For small restaurants just getting started.',
      price: 0,
      maxUsers: 3,
      maxOrders: 500,
      features: ['menu_management', 'order_tracking', 'basic_reports'],
    },
  });

  const proPlan = await prisma.pricingPlan.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      name: 'Pro',
      description: 'For growing restaurants with advanced needs.',
      price: 29.99,
      maxUsers: 10,
      maxOrders: 5000,
      features: ['menu_management', 'order_tracking', 'advanced_reports', 'staff_management', 'qr_codes', 'ai_chatbot'],
    },
  });
  console.log('  ✓ Pricing plans: Free, Pro');

  // ── Feature Flags ──────────────────────────────────────────────────────────
  const flags = [
    { key: 'ai_chatbot', label: 'AI Chatbot', description: 'Enable AI-powered customer chatbot', enabled: true },
    { key: 'advanced_reports', label: 'Advanced Reports', description: 'Enable detailed sales and expense reports', enabled: false },
    { key: 'multi_language', label: 'Multi-language Menu', description: 'Support for multiple languages', enabled: false },
    { key: 'table_management', label: 'Table Management', description: 'Full table and QR code management', enabled: true },
  ];

  for (const flag of flags) {
    await prisma.featureFlag.upsert({
      where: { key: flag.key },
      update: {},
      create: flag,
    });
  }
  console.log('  ✓ Feature flags seeded');

  // ── Tenant: Bistro Noir ────────────────────────────────────────────────────
  const tenant1 = await prisma.tenant.upsert({
    where: { slug: 'bistronoir' },
    update: {},
    create: {
      slug: 'bistronoir',
      name: 'Bistro Noir',
      description: 'A premium dining experience with a dark, elegant atmosphere.',
      primaryColor: '#6366f1',
      accentColor: '#f59e0b',
      timezone: 'America/New_York',
      currency: 'USD',
      serviceCharge: 10.00,
      domains: {
        create: { domain: 'bistronoir.com', verified: true },
      },
    },
  });

  // ── Tenant: Cafe Aroma ─────────────────────────────────────────────────────
  const tenant2 = await prisma.tenant.upsert({
    where: { slug: 'cafearoma' },
    update: {},
    create: {
      slug: 'cafearoma',
      name: 'Cafe Aroma',
      description: 'Cozy neighborhood cafe serving artisan coffee and pastries.',
      primaryColor: '#10b981',
      accentColor: '#f43f5e',
      timezone: 'America/New_York',
      currency: 'USD',
      serviceCharge: 0,
    },
  });

  console.log(`  ✓ Tenant: ${tenant1.name} (${tenant1.slug})`);
  console.log(`  ✓ Tenant: ${tenant2.name} (${tenant2.slug})`);

  // ── Subscriptions ──────────────────────────────────────────────────────────
  await prisma.subscription.upsert({
    where: { tenantId: tenant1.id },
    update: {},
    create: {
      tenantId: tenant1.id,
      planId: proPlan.id,
      status: 'active',
      autoRenew: true,
    },
  });

  await prisma.subscription.upsert({
    where: { tenantId: tenant2.id },
    update: {},
    create: {
      tenantId: tenant2.id,
      planId: freePlan.id,
      status: 'active',
      autoRenew: true,
    },
  });
  console.log('  ✓ Subscriptions created');

  // ── Users for Bistro Noir (one of each role) ──────────────────────────────
  const users1 = [
    { email: 'manager@bistronoir.com', displayName: 'Mr. Daniel', role: 'manager' },
    { email: 'manager2@bistronoir.com', displayName: 'Sarah Johnson', role: 'manager' },
    { email: 'cashier@bistronoir.com', displayName: 'Mike Chen', role: 'cashier' },
    { email: 'waiter@bistronoir.com', displayName: 'Emma Wilson', role: 'waiter' },
    { email: 'kitchen@bistronoir.com', displayName: 'Chef Marco', role: 'kitchen_staff' },
    { email: 'menu-editor@bistronoir.com', displayName: 'Lisa Park', role: 'manager' },
    { email: 'accountant@bistronoir.com', displayName: 'Tom Rivera', role: 'manager' },
  ];

  for (const u of users1) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { tenantId: tenant1.id },
      create: {
        tenantId: tenant1.id,
        email: u.email,
        passwordHash,
        displayName: u.displayName,
        role: u.role,
      },
    });
  }
  console.log('  ✓ Bistro Noir users: manager, cashier, waiter, kitchen_staff');

  // ── Users for Cafe Aroma (subset of roles) ────────────────────────────────
  const users2 = [
    { email: 'manager@cafearoma.com', displayName: 'Elena Rodriguez', role: 'manager' },
    { email: 'manager2@cafearoma.com', displayName: 'James Kim', role: 'manager' },
    { email: 'cashier@cafearoma.com', displayName: 'Priya Sharma', role: 'cashier' },
    { email: 'waiter@cafearoma.com', displayName: 'Alex Turner', role: 'waiter' },
    { email: 'kitchen@cafearoma.com', displayName: 'Baker Sam', role: 'kitchen_staff' },
  ];

  for (const u of users2) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { tenantId: tenant2.id },
      create: {
        tenantId: tenant2.id,
        email: u.email,
        passwordHash,
        displayName: u.displayName,
        role: u.role,
      },
    });
  }
  console.log('  ✓ Cafe Aroma users: manager, cashier, waiter, kitchen_staff');

  // ── Categories (Bistro Noir) ───────────────────────────────────────────────
  const categories1 = ['Starters', 'Mains', 'Desserts', 'Drinks'];
  for (let i = 0; i < categories1.length; i++) {
    await prisma.category.upsert({
      where: { tenantId_name: { tenantId: tenant1.id, name: categories1[i] } },
      update: {},
      create: { tenantId: tenant1.id, name: categories1[i], sortOrder: i + 1 },
    });
  }

  // ── Categories (Cafe Aroma) ────────────────────────────────────────────────
  const categories2 = ['Coffee', 'Pastries', 'Breakfast', 'Lunch'];
  for (let i = 0; i < categories2.length; i++) {
    await prisma.category.upsert({
      where: { tenantId_name: { tenantId: tenant2.id, name: categories2[i] } },
      update: {},
      create: { tenantId: tenant2.id, name: categories2[i], sortOrder: i + 1 },
    });
  }
  console.log('  ✓ Categories seeded');

  // ── Tables ─────────────────────────────────────────────────────────────────
  for (let i = 1; i <= 8; i++) {
    await prisma.table.upsert({
      where: { tenantId_tableNumber: { tenantId: tenant1.id, tableNumber: i } },
      update: {},
      create: { tenantId: tenant1.id, tableNumber: i, capacity: i <= 2 ? 2 : i <= 4 ? 4 : 6 },
    });
  }

  for (let i = 1; i <= 5; i++) {
    await prisma.table.upsert({
      where: { tenantId_tableNumber: { tenantId: tenant2.id, tableNumber: i } },
      update: {},
      create: { tenantId: tenant2.id, tableNumber: i, capacity: 4 },
    });
  }
  console.log('  ✓ Tables seeded');

  // ── Menu Items (Bistro Noir) ──────────────────────────────────────────────
  const menuItems1 = [
    { name: 'Wagyu Burger', price: 24.50, description: 'Premium wagyu beef patty, truffle mayo, caramelized onions, brioche bun.', category: 'Mains', tags: ['Popular'], imageUrl: '/images/wagyu_burger.jpg', sortOrder: 1 },
    { name: 'Truffle Fries', price: 12.00, description: 'Crispy shoestring fries tossed in white truffle oil and parmesan.', category: 'Starters', tags: ['Vegetarian', 'Popular'], imageUrl: '/images/truffle_fries.jpg', sortOrder: 1 },
    { name: 'Wild Salmon', price: 28.00, description: 'Pan-seared wild caught salmon with asparagus and hollandaise.', category: 'Mains', tags: ['Healthy', 'Gluten-Free'], imageUrl: '/images/wild_salmon.jpg', sortOrder: 2 },
    { name: 'Chocolate Lava Cake', price: 14.00, description: 'Warm molten chocolate cake served with vanilla bean ice cream.', category: 'Desserts', tags: ['Vegetarian'], imageUrl: '/images/chocolate_lava_cake.jpg', sortOrder: 1 },
    { name: 'Passionfruit Cooler', price: 8.00, description: 'Refreshing blend of passionfruit, mint, and sparkling water.', category: 'Drinks', tags: ['Vegan', 'Cold'], imageUrl: '/images/passionfruit_cooler.jpg', sortOrder: 1 },
  ];

  const existing1 = await prisma.menuItem.findMany({ where: { tenantId: tenant1.id } });
  const existingNames1 = new Set(existing1.map((m) => m.name));
  for (const i of menuItems1) {
    if (!existingNames1.has(i.name)) {
      await prisma.menuItem.create({ data: { tenantId: tenant1.id, ...i } });
    }
  }
  console.log('  ✓ Menu items (Bistro Noir)');

  // ── Menu Items (Cafe Aroma) ────────────────────────────────────────────────
  const menuItems2 = [
    { name: 'Espresso', price: 3.50, description: 'Double shot of our signature dark roast.', category: 'Coffee', tags: ['Vegan'], imageUrl: '/images/default_food.jpg', sortOrder: 1 },
    { name: 'Cappuccino', price: 4.50, description: 'Espresso with steamed milk and thick foam.', category: 'Coffee', tags: ['Vegetarian'], imageUrl: '/images/default_food.jpg', sortOrder: 2 },
    { name: 'Croissant', price: 4.00, description: 'Buttery, flaky French croissant baked fresh daily.', category: 'Pastries', tags: ['Vegetarian', 'Popular'], imageUrl: '/images/default_food.jpg', sortOrder: 1 },
    { name: 'Avocado Toast', price: 11.00, description: 'Sourdough with smashed avocado, cherry tomatoes, and poached egg.', category: 'Breakfast', tags: ['Healthy'], imageUrl: '/images/default_food.jpg', sortOrder: 1 },
    { name: 'Turkey Sandwich', price: 10.00, description: 'Oven-roasted turkey with Swiss, lettuce, and tomato on ciabatta.', category: 'Lunch', tags: ['Popular'], imageUrl: '/images/default_food.jpg', sortOrder: 1 },
  ];

  const existing2 = await prisma.menuItem.findMany({ where: { tenantId: tenant2.id } });
  const existingNames2 = new Set(existing2.map((m) => m.name));
  for (const i of menuItems2) {
    if (!existingNames2.has(i.name)) {
      await prisma.menuItem.create({ data: { tenantId: tenant2.id, ...i } });
    }
  }
  console.log('  ✓ Menu items (Cafe Aroma)');

  console.log('\nSeed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
