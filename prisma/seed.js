const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ── Create Tenant ──────────────────────────────────────────────────────────
  const tenant = await prisma.tenant.upsert({
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

  console.log(`  ✓ Tenant: ${tenant.name} (${tenant.slug})`);

  // ── Create Admin User ──────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('admin123', 12);

  const admin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'admin@bistronoir.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@bistronoir.com',
      passwordHash,
      displayName: 'Admin',
      role: 'admin',
    },
  });

  console.log(`  ✓ Admin user: ${admin.email} (password: admin123)`);

  // ── Create Kitchen User ────────────────────────────────────────────────────
  await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'kitchen@bistronoir.com' } },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'kitchen@bistronoir.com',
      passwordHash,
      displayName: 'Kitchen Staff',
      role: 'kitchen',
    },
  });

  console.log(`  ✓ Kitchen user: kitchen@bistronoir.com`);

  // ── Seed Menu Items ────────────────────────────────────────────────────────
  const menuItems = [
    {
      name: 'Wagyu Burger',
      price: 24.50,
      description: 'Premium wagyu beef patty, truffle mayo, caramelized onions, brioche bun.',
      category: 'Mains',
      tags: ['Popular'],
      imageUrl: '/images/wagyu_burger.jpg',
      sortOrder: 1,
    },
    {
      name: 'Truffle Fries',
      price: 12.00,
      description: 'Crispy shoestring fries tossed in white truffle oil and parmesan.',
      category: 'Starters',
      tags: ['Vegetarian', 'Popular'],
      imageUrl: '/images/truffle_fries.jpg',
      sortOrder: 1,
    },
    {
      name: 'Wild Salmon',
      price: 28.00,
      description: 'Pan-seared wild caught salmon with asparagus and hollandaise.',
      category: 'Mains',
      tags: ['Healthy', 'Gluten-Free'],
      imageUrl: '/images/wild_salmon.jpg',
      sortOrder: 2,
    },
    {
      name: 'Chocolate Lava Cake',
      price: 14.00,
      description: 'Warm molten chocolate cake served with vanilla bean ice cream.',
      category: 'Desserts',
      tags: ['Vegetarian'],
      imageUrl: '/images/chocolate_lava_cake.jpg',
      sortOrder: 1,
    },
    {
      name: 'Passionfruit Cooler',
      price: 8.00,
      description: 'Refreshing blend of passionfruit, mint, and sparkling water.',
      category: 'Drinks',
      tags: ['Vegan', 'Cold'],
      imageUrl: '/images/passionfruit_cooler.jpg',
      sortOrder: 1,
    },
  ];

  // Fetch existing menu items to avoid duplicates (no unique constraint on name)
  const existing = await prisma.menuItem.findMany({ where: { tenantId: tenant.id } });
  const existingNames = new Set(existing.map((m) => m.name));

  for (const item of menuItems) {
    if (!existingNames.has(item.name)) {
      await prisma.menuItem.create({
        data: { tenantId: tenant.id, ...item },
      });
    }
  }

  console.log(`  ✓ Menu items seeded (${menuItems.length} items)`);
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
