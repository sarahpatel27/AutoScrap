const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function initDb() {
  try {
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

    console.log('✅ Prisma ORM database tables & default rates initialized successfully.');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  }
}

module.exports = {
  prisma,
  initDb,
};
