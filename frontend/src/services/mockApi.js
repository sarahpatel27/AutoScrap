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
    let errMsg = data.error || 'We cannot find the car registered with this number. Please check your registration and try again.';
    if (
      errMsg.toLowerCase().includes('invalid search term') ||
      errMsg.toLowerCase().includes('not found') ||
      errMsg.toLowerCase().includes('could not retrieve')
    ) {
      errMsg = 'We cannot find the car registered with this number. Please check your registration and try again.';
    }
    throw new Error(errMsg);
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
  
  // Use matchedServiceArea if provided from address lookup or fallback to address text
  let city = data.matchedServiceArea || data.city || data.postTown || '';
  if (!city) {
    city = getCityFromPostcode(postcode, data.customer?.collectionAddress);
  }

  // 1. Direct rate from backend address lookup
  let pricePerTonne = data.ratePerTon || null;

  // 2. Or match city name in live database cityRates from /api/pricing
  if (!pricePerTonne && city && pricingConfig.cityRates) {
    const matchedKey = Object.keys(pricingConfig.cityRates).find(
      (k) => k.toLowerCase() === city.toLowerCase(),
    );
    if (matchedKey) {
      pricePerTonne = pricingConfig.cityRates[matchedKey];
      city = matchedKey;
    }
  }

  // 3. Fallback default
  if (!pricePerTonne || isNaN(pricePerTonne)) {
    pricePerTonne = pricingConfig.defaultPricePerTonne || 235;
  }

  const kerbWeightKg = data.vehicle?.weightKg || 1200;
  const tonnes = kerbWeightKg / 1000;
  const exactAmount = tonnes * pricePerTonne;
  const baseValue = Number(exactAmount.toFixed(2));
  const finalValue = baseValue;

  return {
    city: city || 'UK',
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

  if (typeof FormData !== 'undefined' && data instanceof FormData) {
    if (!data.has('reference')) {
      data.append('reference', reference);
    }
    const saved = await saveEnquiry(data);
    return saved || { reference };
  }

  const fullData = {
    reference,
    ...data,
  };

  const saved = await saveEnquiry(fullData);
  return saved || fullData;
}

export async function lookupAddress(postcode) {
  if (!postcode || !postcode.trim()) {
    throw new Error('Please enter a collection postcode.');
  }

  const cleanPostcode = postcode.trim().toUpperCase();
  const url = getApiUrl(`/api/address-lookup?postcode=${encodeURIComponent(cleanPostcode)}`);

  let response;
  try {
    response = await fetch(url);
  } catch (err) {
    const error = new Error("We couldn't check your postcode right now. Please try again.");
    error.type = 'NETWORK_ERROR';
    throw error;
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    const error = new Error("We couldn't check your postcode right now. Please try again.");
    error.type = 'SERVER_ERROR';
    throw error;
  }

  if (response.status === 404 || data.error === 'NoResultsFound' || (data.error && data.error.toLowerCase().includes('not found'))) {
    const error = new Error("We couldn't find that postcode. Please check it and try again.");
    error.type = 'NOT_FOUND';
    throw error;
  }

  if (!response.ok || data.success === false) {
    const error = new Error(data.error || "We couldn't check your postcode right now. Please try again.");
    error.type = response.status === 404 ? 'NOT_FOUND' : 'SERVER_ERROR';
    throw error;
  }

  return data;
}
