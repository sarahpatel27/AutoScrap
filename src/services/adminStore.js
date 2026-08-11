const ENQUIRIES_KEY = 'autoscrap_admin_enquiries';
const PRICING_KEY = 'autoscrap_admin_pricing';

const initialEnquiries = [
  {
    id: '1',
    reference: 'MAS-2026-94812',
    date: '2026-08-10T14:32:00.000Z',
    status: 'Pending',
    vehicle: {
      registration: 'FD62 KLV',
      make: 'Ford',
      model: 'Focus Zetec',
      year: 2012,
      fuelType: 'Petrol',
      engineSize: '1.6L',
      weightKg: 1270,
    },
    postcode: 'SW1A 1AA',
    mileage: '84000',
    condition: {
      isRunning: true,
      hasFourWheels: true,
      isComplete: true,
      hasCatalyticConverter: true,
      hasAlloyWheels: true,
    },
    customer: {
      fullName: 'Oliver Taylor',
      phone: '07700 900123',
      email: 'oliver.t@example.co.uk',
      preferredContact: 'phone',
      notes: 'Car is parked in driveway, easy access for collection.',
    },
    quote: {
      pricePerTonne: 235,
      baseValue: 298,
      bonuses: [{ name: 'Alloy wheels', amount: 25 }],
      deductions: [],
      finalValue: 323,
      validUntil: '7 days from quote',
    },
  },
  {
    id: '2',
    reference: 'MAS-2026-83194',
    date: '2026-08-10T11:15:00.000Z',
    status: 'Contacted',
    vehicle: {
      registration: 'EO10 PKX',
      make: 'Vauxhall',
      model: 'Corsa SXI',
      year: 2010,
      fuelType: 'Petrol',
      engineSize: '1.2L',
      weightKg: 1100,
    },
    postcode: 'B1 1AA',
    mileage: '112000',
    condition: {
      isRunning: false,
      hasFourWheels: true,
      isComplete: true,
      hasCatalyticConverter: true,
      hasAlloyWheels: false,
    },
    customer: {
      fullName: 'Emma Watson',
      phone: '07700 900456',
      email: 'emma.w@example.co.uk',
      preferredContact: 'whatsapp',
      notes: 'Non-runner due to head gasket failure.',
    },
    quote: {
      pricePerTonne: 235,
      baseValue: 259,
      bonuses: [],
      deductions: [{ name: 'Non-running vehicle', amount: 30 }],
      finalValue: 229,
      validUntil: '7 days from quote',
    },
  },
  {
    id: '3',
    reference: 'MAS-2026-72940',
    date: '2026-08-09T18:45:00.000Z',
    status: 'Accepted',
    vehicle: {
      registration: 'MF09 WVT',
      make: 'Volkswagen',
      model: 'Golf TDI',
      year: 2009,
      fuelType: 'Diesel',
      engineSize: '2.0L',
      weightKg: 1350,
    },
    postcode: 'M1 2WD',
    mileage: '145000',
    condition: {
      isRunning: true,
      hasFourWheels: true,
      isComplete: true,
      hasCatalyticConverter: true,
      hasAlloyWheels: true,
    },
    customer: {
      fullName: 'Marcus Vance',
      phone: '07700 900789',
      email: 'marcus.v@example.co.uk',
      preferredContact: 'phone',
      notes: 'Customer accepted £342 quote, collection booked for Wednesday 10 AM.',
    },
    quote: {
      pricePerTonne: 235,
      baseValue: 317,
      bonuses: [{ name: 'Alloy wheels', amount: 25 }],
      deductions: [],
      finalValue: 342,
      validUntil: '7 days from quote',
    },
  },
  {
    id: '4',
    reference: 'MAS-2026-61805',
    date: '2026-08-08T09:20:00.000Z',
    status: 'Collected',
    vehicle: {
      registration: 'LS14 HGB',
      make: 'BMW',
      model: '320d SE',
      year: 2014,
      fuelType: 'Diesel',
      engineSize: '2.0L',
      weightKg: 1495,
    },
    postcode: 'LS1 5QL',
    mileage: '168000',
    condition: {
      isRunning: false,
      hasFourWheels: true,
      isComplete: false,
      hasCatalyticConverter: false,
      hasAlloyWheels: true,
    },
    customer: {
      fullName: 'Chloe Bennett',
      phone: '07700 900321',
      email: 'chloe.b@example.co.uk',
      preferredContact: 'email',
      notes: 'Collected and paid via bank transfer.',
    },
    quote: {
      pricePerTonne: 235,
      baseValue: 351,
      bonuses: [{ name: 'Alloy wheels', amount: 25 }],
      deductions: [
        { name: 'Non-running vehicle', amount: 30 },
        { name: 'Incomplete vehicle', amount: 45 },
        { name: 'Catalytic converter missing', amount: 70 },
      ],
      finalValue: 231,
      validUntil: '7 days from quote',
    },
  },
  {
    id: '5',
    reference: 'MAS-2026-50119',
    date: '2026-08-07T16:10:00.000Z',
    status: 'Cancelled',
    vehicle: {
      registration: 'BL11 FDE',
      make: 'Audi',
      model: 'A3 Sportback',
      year: 2011,
      fuelType: 'Petrol',
      engineSize: '1.4L',
      weightKg: 1260,
    },
    postcode: 'BS1 4ST',
    mileage: '99000',
    condition: {
      isRunning: true,
      hasFourWheels: true,
      isComplete: true,
      hasCatalyticConverter: true,
      hasAlloyWheels: true,
    },
    customer: {
      fullName: 'Daniel Smith',
      phone: '07700 900654',
      email: 'daniel.s@example.co.uk',
      preferredContact: 'phone',
      notes: 'Customer decided to repair car privately.',
    },
    quote: {
      pricePerTonne: 235,
      baseValue: 296,
      bonuses: [{ name: 'Alloy wheels', amount: 25 }],
      deductions: [],
      finalValue: 321,
      validUntil: '7 days from quote',
    },
  },
];

const initialPricingConfig = {
  pricePerTonne: 235,
  alloyWheelBonus: 25,
  nonRunningDeduction: 30,
  incompleteDeduction: 45,
  missingCatDeduction: 70,
  missingWheelDeduction: 35,
  minimumValue: 50,
};

export function getEnquiries() {
  const stored = localStorage.getItem(ENQUIRIES_KEY);
  if (!stored) {
    localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(initialEnquiries));
    return initialEnquiries;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return initialEnquiries;
  }
}

export function saveEnquiry(enquiryData) {
  const current = getEnquiries();
  const newEnquiry = {
    id: String(Date.now()),
    reference: enquiryData.reference || `MAS-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`,
    date: new Date().toISOString(),
    status: 'Pending',
    ...enquiryData,
  };
  const updated = [newEnquiry, ...current];
  localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(updated));
  return newEnquiry;
}

export function updateEnquiryStatus(id, newStatus, notes) {
  const current = getEnquiries();
  const updated = current.map((item) => {
    if (item.id === id) {
      return {
        ...item,
        status: newStatus,
        customer: {
          ...item.customer,
          notes: notes !== undefined ? notes : item.customer?.notes,
        },
      };
    }
    return item;
  });
  localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteEnquiry(id) {
  const current = getEnquiries();
  const updated = current.filter((item) => item.id !== id);
  localStorage.setItem(ENQUIRIES_KEY, JSON.stringify(updated));
  return updated;
}

export function getPricingConfig() {
  const stored = localStorage.getItem(PRICING_KEY);
  if (!stored) {
    localStorage.setItem(PRICING_KEY, JSON.stringify(initialPricingConfig));
    return initialPricingConfig;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return initialPricingConfig;
  }
}

export function savePricingConfig(config) {
  localStorage.setItem(PRICING_KEY, JSON.stringify(config));
  return config;
}

export function resetPricingConfig() {
  localStorage.setItem(PRICING_KEY, JSON.stringify(initialPricingConfig));
  return initialPricingConfig;
}
