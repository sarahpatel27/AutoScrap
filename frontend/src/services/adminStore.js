import { getCityFromPostcode } from '../utils/cityHelper';

let cachedPricing = {
  defaultPricePerTonne: 235,
  cityRates: {
    Doncaster: 235,
    Leicester: 240,
    Peterborough: 230,
    London: 260,
    Cambridge: 245,
    Liverpool: 238,
    Manchester: 245,
  },
};

let cachedEnquiries = [];

export async function fetchPricingConfig() {
  try {
    const res = await fetch('/api/pricing');
    if (res.ok) {
      const data = await res.json();
      cachedPricing = data;
      return data;
    }
  } catch (err) {
    console.warn('Backend fetch error, using cached pricing:', err);
  }
  return cachedPricing;
}

export function getPricingConfig() {
  fetchPricingConfig();
  return cachedPricing;
}

export function getCityPricePerTonne(city) {
  if (city && cachedPricing.cityRates && cachedPricing.cityRates[city]) {
    return cachedPricing.cityRates[city];
  }
  return cachedPricing.defaultPricePerTonne || 235;
}

export async function fetchEnquiries() {
  try {
    const res = await fetch('/api/enquiries');
    if (res.ok) {
      const data = await res.json();
      cachedEnquiries = data;
      return data;
    }
  } catch (err) {
    console.warn('Backend fetch error, using cached enquiries:', err);
  }
  return cachedEnquiries;
}

export function getEnquiries() {
  fetchEnquiries();
  return cachedEnquiries;
}

export async function saveEnquiry(enquiryData) {
  try {
    const res = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(enquiryData),
    });
    if (res.ok) {
      const saved = await res.json();
      await fetchEnquiries();
      return saved;
    }
  } catch (err) {
    console.error('Error saving enquiry to backend:', err);
  }

  const postcode = enquiryData.postcode || enquiryData.customer?.collectionPostcode || '';
  const address = enquiryData.customer?.collectionAddress || '';
  const city = getCityFromPostcode(postcode, address);

  const fallback = {
    id: String(Date.now()),
    reference:
      enquiryData.reference ||
      `MAS-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`,
    date: new Date().toISOString(),
    status: 'Pending',
    postcode,
    city,
    ...enquiryData,
  };
  cachedEnquiries = [fallback, ...cachedEnquiries];
  return fallback;
}

export async function updateEnquiryStatus(id, newStatus, notes) {
  try {
    const res = await fetch(`/api/enquiries/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, notes }),
    });
    if (res.ok) {
      const updatedList = await res.json();
      cachedEnquiries = updatedList;
      return updatedList;
    }
  } catch (err) {
    console.error('Error updating status on backend:', err);
  }

  cachedEnquiries = cachedEnquiries.map((item) => {
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
  return cachedEnquiries;
}

export async function deleteEnquiry(id) {
  try {
    const res = await fetch(`/api/enquiries/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      const updatedList = await res.json();
      cachedEnquiries = updatedList;
      return updatedList;
    }
  } catch (err) {
    console.error('Error deleting enquiry from backend:', err);
  }

  cachedEnquiries = cachedEnquiries.filter((item) => item.id !== id);
  return cachedEnquiries;
}

export async function savePricingConfig(config) {
  try {
    const res = await fetch('/api/pricing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });
    if (res.ok) {
      const updated = await res.json();
      cachedPricing = updated;
      return updated;
    }
  } catch (err) {
    console.error('Error saving pricing to backend:', err);
  }

  cachedPricing = { ...cachedPricing, ...config };
  return cachedPricing;
}

export function resetPricingConfig() {
  savePricingConfig({
    defaultPricePerTonne: 235,
    cityRates: {
      Doncaster: 235,
      Leicester: 240,
      Peterborough: 230,
      London: 260,
      Cambridge: 245,
      Liverpool: 238,
      Manchester: 245,
    },
  });
  return cachedPricing;
}
