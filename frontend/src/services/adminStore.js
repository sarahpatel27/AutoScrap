import { getCityFromPostcode } from '../utils/cityHelper';
import { getApiUrl } from '../config/api';
import { getCookie } from '../utils/cookieHelper';

const TOKEN_COOKIE_KEY = 'autoscrap_admin_token';

function getAuthHeaders(extraHeaders = {}) {
  const token = getCookie(TOKEN_COOKIE_KEY);
  const headers = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

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
let cachedPastEnquiries = [];

export async function fetchPricingConfig() {
  try {
    const res = await fetch(getApiUrl('/api/pricing'), {
      headers: getAuthHeaders(),
    });
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
    const res = await fetch(getApiUrl('/api/enquiries'), {
      headers: getAuthHeaders(),
    });
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

export async function fetchPastEnquiries() {
  try {
    const res = await fetch(getApiUrl('/api/enquiries/past'), {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        cachedPastEnquiries = data.pastEnquiries || [];
        return data;
      }
      cachedPastEnquiries = Array.isArray(data) ? data : [];
      return { pastEnquiries: cachedPastEnquiries, pastHighValueEnquiries: [] };
    }
  } catch (err) {
    console.warn('Backend fetch error for past enquiries:', err);
  }
  return { pastEnquiries: cachedPastEnquiries, pastHighValueEnquiries: [] };
}

export async function fetchHighValueEnquiries() {
  try {
    const res = await fetch(getApiUrl('/api/enquiries/high-value'), {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend fetch error for high-value enquiries:', err);
  }
  return [];
}

export async function submitDealerBid(enquiryId, amount) {
  const res = await fetch(getApiUrl('/api/enquiries/high-value/bid'), {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ enquiryId, amount }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit bid.');
  }

  return data;
}

export async function selectWinnerDealer(enquiryId, bidId) {
  const res = await fetch(getApiUrl('/api/enquiries/high-value/select-winner'), {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ enquiryId, bidId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to select winning dealer.');
  }

  return data;
}

export async function markEnquiryAsPurchased(enquiryId) {
  const res = await fetch(getApiUrl('/api/enquiries/high-value/purchase'), {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ enquiryId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to mark enquiry as purchased.');
  }

  return data;
}

export function getEnquiries() {
  fetchEnquiries();
  return cachedEnquiries;
}

export async function saveEnquiry(enquiryData) {
  try {
    const res = await fetch(getApiUrl('/api/enquiries'), {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
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
    const res = await fetch(getApiUrl(`/api/enquiries/${id}/status`), {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
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
    if (String(item.id) === String(id)) {
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

export async function updateBulkEnquiryStatus(ids, newStatus) {
  try {
    const res = await fetch(getApiUrl('/api/enquiries/bulk-status'), {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ids, status: newStatus }),
    });
    if (res.ok) {
      const updatedList = await res.json();
      cachedEnquiries = updatedList;
      return updatedList;
    }
  } catch (err) {
    console.error('Error bulk updating status on backend:', err);
  }

  const idSet = new Set(ids.map(String));
  cachedEnquiries = cachedEnquiries.map((item) => {
    if (idSet.has(String(item.id))) {
      return {
        ...item,
        status: newStatus,
      };
    }
    return item;
  });
  return cachedEnquiries;
}

export async function deleteEnquiry(id) {
  const deletedItem = cachedEnquiries.find((item) => String(item.id) === String(id));
  if (deletedItem) {
    cachedPastEnquiries = [{ ...deletedItem, status: 'archived' }, ...cachedPastEnquiries];
  }

  try {
    const res = await fetch(getApiUrl(`/api/enquiries/${id}`), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const updatedList = await res.json();
      cachedEnquiries = updatedList;
      return updatedList;
    }
  } catch (err) {
    console.error('Error deleting enquiry from backend:', err);
  }

  cachedEnquiries = cachedEnquiries.filter((item) => String(item.id) !== String(id));
  return cachedEnquiries;
}

export async function deleteBulkEnquiries(ids) {
  const idSet = new Set(ids.map(String));
  const deletedItems = cachedEnquiries.filter((item) => idSet.has(String(item.id)));
  if (deletedItems.length > 0) {
    cachedPastEnquiries = [
      ...deletedItems.map((item) => ({ ...item, status: 'archived' })),
      ...cachedPastEnquiries,
    ];
  }

  try {
    const res = await fetch(getApiUrl('/api/enquiries/bulk-delete'), {
      method: 'DELETE',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ids }),
    });
    if (res.ok) {
      const updatedList = await res.json();
      cachedEnquiries = updatedList;
      return updatedList;
    }
  } catch (err) {
    console.error('Error bulk deleting enquiries from backend:', err);
  }

  cachedEnquiries = cachedEnquiries.filter((item) => !idSet.has(String(item.id)));
  return cachedEnquiries;
}

export async function deleteHighValueEnquiry(id) {
  try {
    const res = await fetch(getApiUrl(`/api/enquiries/high-value/${id}`), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error deleting high-value enquiry from backend:', err);
  }
  return [];
}

export async function deleteBulkHighValueEnquiries(ids) {
  try {
    const res = await fetch(getApiUrl('/api/enquiries/high-value/bulk-delete'), {
      method: 'DELETE',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ids }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error bulk deleting high-value enquiries from backend:', err);
  }
  return [];
}

export async function savePricingConfig(config) {
  try {
    const res = await fetch(getApiUrl('/api/pricing'), {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
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

export async function fetchUsers() {
  try {
    const res = await fetch(getApiUrl('/api/auth/users'), {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Error fetching users:', err);
  }
  return [];
}

export async function createDealerUser(userData) {
  const res = await fetch(getApiUrl('/api/auth/users'), {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create user account.');
  }
  return data;
}

export async function deleteDealerUser(id) {
  const res = await fetch(getApiUrl(`/api/auth/users/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete user account.');
  }
  return data;
}

export async function changeUserPassword(currentPassword, newPassword) {
  const res = await fetch(getApiUrl('/api/auth/change-password'), {
    method: 'POST',
    headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update password.');
  }
  return data;
}

export async function submitContactMessage(contactData) {
  const res = await fetch(getApiUrl('/api/contact/submit'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contactData),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to submit contact message.');
  }
  return data;
}

export async function fetchContactSubmissions() {
  try {
    const res = await fetch(getApiUrl('/api/contact'), {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend fetch error for contacts:', err);
  }
  return [];
}

export async function deleteContactSubmission(id) {
  const res = await fetch(getApiUrl(`/api/contact/${id}`), {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete contact message.');
  }
  return data;
}
