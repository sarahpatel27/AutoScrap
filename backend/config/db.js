const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initDb() {
  try {
    // 1. Cities & city pricing seeds (disabled so database remains completely clean and controlled via dealer accounts)
    /*
    const initialSupportedCities = [
      { name: 'Doncaster', slug: 'doncaster', isActive: true },
      { name: 'Leicester', slug: 'leicester', isActive: true },
      { name: 'Peterborough', slug: 'peterborough', isActive: true },
      { name: 'London', slug: 'london', isActive: true },
      { name: 'Cambridge', slug: 'cambridge', isActive: true },
      { name: 'Liverpool', slug: 'liverpool', isActive: true },
      { name: 'Manchester', slug: 'manchester', isActive: true },
    ];

    for (const cityItem of initialSupportedCities) {
      await prisma.city.upsert({
        where: { name: cityItem.name },
        update: { isActive: true },
        create: cityItem,
      });
    }

    // 2. Seed / Migrate City Pricing (linked by cityId)
    const defaultRates = [
      { name: 'Doncaster', pricePerTonne: 235 },
      { name: 'Leicester', pricePerTonne: 240 },
      { name: 'Peterborough', pricePerTonne: 230 },
      { name: 'London', pricePerTonne: 260 },
      { name: 'Cambridge', pricePerTonne: 245 },
      { name: 'Liverpool', pricePerTonne: 238 },
      { name: 'Manchester', pricePerTonne: 245 },
    ];

    for (const rate of defaultRates) {
      const city = await prisma.city.findUnique({ where: { name: rate.name } });
      if (city) {
        await prisma.cityPricing.upsert({
          where: { cityId: city.id },
          update: { pricePerTonne: rate.pricePerTonne },
          create: {
            cityId: city.id,
            pricePerTonne: rate.pricePerTonne,
          },
        });
      }
    }
    */

    // 2. Seed Super Admin User
    // const superAdminEmail = 'admin@myautoscrap.co.uk';
    // const superAdminPasswordHash = await bcrypt.hash('admin123', 10);

    // await prisma.user.upsert({
    //   where: { email: superAdminEmail },
    //   update: {},
    //   create: {
    //     email: superAdminEmail,
    //     password: superAdminPasswordHash,
    //     name: 'Super Administrator',
    //     role: 'Super Admin',
    //     assignedCity: null,
    //   },
    // });

    // // 3. Seed City Dealer Accounts
    // const targetCities = [
    //   'Doncaster',
    //   'Leicester',
    //   'Peterborough',
    //   'London',
    //   'Cambridge',
    //   'Liverpool',
    //   'Manchester',
    // ];

    // const dealerPasswordHash = await bcrypt.hash('dealer123', 10);

    // for (const city of targetCities) {
    //   const email = `${city.toLowerCase()}@autoscrap.co.uk`;
    //   await prisma.user.upsert({
    //     where: { email },
    //     update: {},
    //     create: {
    //       email,
    //       password: dealerPasswordHash,
    //       name: `${city} Dealer`,
    //       role: 'City Dealer',
    //       assignedCity: city,
    //     },
    //   });
    // }

    console.log('✅ Prisma ORM database tables & default accounts initialized successfully.');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  }
}

module.exports = {
  prisma,
  initDb,
};
