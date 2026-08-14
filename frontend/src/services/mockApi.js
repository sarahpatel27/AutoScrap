import { fetchPricingConfig, saveEnquiry } from './adminStore';
import { getCityFromPostcode } from '../utils/cityHelper';
import { getApiUrl } from '../config/api';

export async function lookupVehicle(registration) {
  if (!registration || registration.replace(/\s/g, '').length < 2) {
    throw new Error('Please enter a valid vehicle registration.');
  }

  const cleanReg = registration.replace(/\s/g, '').toUpperCase();
  const response = await fetch(getApiUrl(`/api/vrm-lookup?vrm=${encodeURIComponent(cleanReg)}`));
  const data = await response.json();

  if (!response.ok || data.error) {
    throw new Error(
      data.error || 'We could not retrieve this vehicle. Please check your registration and try again.',
    );
  }

  return {
    registration: cleanReg,
    make: data.make,
    model: data.model,
    year: data.year,
    fuelType: data.fuelType,
    engineSize: data.engineSize,
    weightKg: data.weightKg,
    imageUrl: data.imageUrl,
  };
}

export async function calculateQuote(data) {
  const pricingConfig = await fetchPricingConfig();
  const postcode = data.postcode || data.customer?.collectionPostcode || data.vehicle?.postcode || '';
  const city = getCityFromPostcode(postcode, data.customer?.collectionAddress);

  let pricePerTonne = pricingConfig.defaultPricePerTonne || 235;
  if (city && pricingConfig.cityRates && pricingConfig.cityRates[city]) {
    pricePerTonne = pricingConfig.cityRates[city];
  }

  const kerbWeightKg = data.vehicle?.weightKg || 1200;
  const tonnes = kerbWeightKg / 1000;
  const exactAmount = tonnes * pricePerTonne;
  const baseValue = Number(exactAmount.toFixed(2));
  const finalValue = baseValue;

  return {
    city,
    pricePerTonne,
    kerbWeightKg,
    tonnes,
    baseValue,
    bonuses: [],
    deductions: [],
    finalValue,
    validUntil: '7 days from today',
  };
}

export async function submitEnquiry(data) {
  const reference = `MAS-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;

  const fullData = {
    reference,
    ...data,
  };

  const saved = await saveEnquiry(fullData);
  return saved || fullData;
}
