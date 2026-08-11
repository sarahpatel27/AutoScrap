import { getPricingConfig, saveEnquiry } from './adminStore';

const wait = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export async function lookupVehicle(registration) {
  await wait(600);
  if (!registration || registration.replace(/\s/g, '').length < 5) {
    throw new Error('Please enter a valid vehicle registration.');
  }
  if (registration.toUpperCase().includes('ERROR')) {
    throw new Error('We could not retrieve this vehicle. Please try again.');
  }
  return {
    registration: registration.toUpperCase(),
    make: 'Ford',
    model: 'Focus Zetec',
    year: 2012,
    fuelType: 'Petrol',
    engineSize: '1.6L',
    weightKg: 1270,
  };
}

export async function calculateQuote(data) {
  await wait(500);

  // Fetch live pricing rules configured from Admin Dashboard
  const config = getPricingConfig();
  const pricePerTonne = config.pricePerTonne || 235;

  const baseValue = Math.round(((data.vehicle?.weightKg || 1200) / 1000) * pricePerTonne);
  const finalValue = baseValue;

  return {
    pricePerTonne,
    baseValue,
    bonuses: [],
    deductions: [],
    finalValue,
    validUntil: '7 days from today',
  };
}

export async function submitEnquiry(data) {
  await wait(600);
  const reference = `MAS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;

  const fullData = {
    reference,
    ...data,
  };

  // Save to persistent admin store so admin sees new submission in real time
  saveEnquiry(fullData);

  return fullData;
}
