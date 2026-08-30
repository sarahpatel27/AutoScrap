import { fetchSupportedCities } from "../services/adminStore";

export const STATUS_OPTIONS = [
  { value: "Pending", label: "Pending", icon: "⏳" },
  { value: "Contacted", label: "Contacted", icon: "📞" },
  { value: "Accepted", label: "Accepted", icon: "🤝" },
  { value: "Collected", label: "Collected", icon: "🚚" },
  { value: "Cancelled", label: "Cancelled", icon: "❌" },
];

/**
 * Normalises a value by trimming and converting to uppercase.
 */
export function normaliseText(value) {
  return String(value || "").trim().toUpperCase();
}

/**
 * Derives a city name from postcode / address strings.
 */
export function getCityFromPostcode(postcode = "", address = "") {
  if (!postcode && !address) return "Unassigned";

  const normAddress = normaliseText(address);
  const normPostcode = normaliseText(postcode);

  if (normAddress) {
    // If address contains a recognized town/city word, title case it
    const parts = normAddress.split(/[\s,]+/);
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart.length > 2) {
      return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).toLowerCase();
    }
  }

  return "Other";
}
