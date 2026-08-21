const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initDb() {
  try {
    // 1. Seed City Pricing
    const defaultRates = [
      { city: 'Default', pricePerTonne: 235 },
      { city: 'Doncaster', pricePerTonne: 235 },
      { city: 'Leicester', pricePerTonne: 240 },
      { city: 'Peterborough', pricePerTonne: 230 },
      { city: 'London', pricePerTonne: 260 },
      { city: 'Cambridge', pricePerTonne: 245 },
      { city: 'Liverpool', pricePerTonne: 238 },
      { city: 'Manchester', pricePerTonne: 245 },
    ];

    for (const rate of defaultRates) {
      await prisma.cityPricing.upsert({
        where: { city: rate.city },
        update: {},
        create: rate,
      });
    }

    // 2. Seed Super Admin User
    const superAdminEmail = 'admin@myautoscrap.co.uk';
    const superAdminPasswordHash = await bcrypt.hash('admin123', 10);

    await prisma.user.upsert({
      where: { email: superAdminEmail },
      update: {},
      create: {
        email: superAdminEmail,
        password: superAdminPasswordHash,
        name: 'Super Administrator',
        role: 'Super Admin',
        assignedCity: null,
      },
    });

    // 3. Seed City Dealer Accounts
    const targetCities = [
      'Doncaster',
      'Leicester',
      'Peterborough',
      'London',
      'Cambridge',
      'Liverpool',
      'Manchester',
    ];

    const dealerPasswordHash = await bcrypt.hash('dealer123', 10);

    for (const city of targetCities) {
      const email = `${city.toLowerCase()}@autoscrap.co.uk`;
      await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          password: dealerPasswordHash,
          name: `${city} Dealer`,
          role: 'City Dealer',
          assignedCity: city,
        },
      });
    }

    console.log('✅ Prisma ORM database tables & default accounts initialized successfully.');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  }
}

module.exports = {
  prisma,
  initDb,
};
