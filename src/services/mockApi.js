const wait = (ms = 700) => new Promise((resolve) => setTimeout(resolve, ms));

export async function lookupVehicle(registration) {
  await wait();
  if (!registration || registration.replace(/\s/g, '').length < 5) throw new Error('Please enter a valid vehicle registration.');
  if (registration.toUpperCase().includes('ERROR')) throw new Error('We could not retrieve this vehicle. Please try again.');
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
  await wait(550);
  const pricePerTonne = 235;
  const baseValue = Math.round(((data.vehicle?.weightKg || 1200) / 1000) * pricePerTonne);
  const bonuses = data.condition.hasAlloyWheels ? [{ name: 'Alloy wheels', amount: 25 }] : [];
  const deductions = [];
  if (!data.condition.isRunning) deductions.push({ name: 'Non-running vehicle', amount: 30 });
  if (!data.condition.isComplete) deductions.push({ name: 'Incomplete vehicle', amount: 45 });
  if (!data.condition.hasCatalyticConverter) deductions.push({ name: 'Catalytic converter missing', amount: 70 });
  if (!data.condition.hasFourWheels) deductions.push({ name: 'Missing wheel(s)', amount: 35 });
  const finalValue = Math.max(50, baseValue + bonuses.reduce((a, b) => a + b.amount, 0) - deductions.reduce((a, b) => a + b.amount, 0));
  return { pricePerTonne, baseValue, bonuses, deductions, finalValue, validUntil: '7 days from today' };
}

export async function submitEnquiry(data) {
  await wait(650);
  return { reference: `MAS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`, ...data };
}
