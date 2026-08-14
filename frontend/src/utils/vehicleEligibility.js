/**
 * High-value vehicle eligibility routing rule:
 * Vehicles with manufacture year > 2015 are classified as High-Value Vehicles
 * (e.g. 2016, 2020, 2025).
 * Vehicles manufactured in 2015 or earlier continue down the standard instant scrap flow.
 *
 * @param {number|string} year - Vehicle manufacture year
 * @returns {boolean} true if high-value vehicle (year > 2015), false otherwise
 */
export function isHighValueVehicle(year) {
  if (!year) return false;
  const numericYear = Number(year);
  if (isNaN(numericYear)) return false;
  return numericYear > 2015;
}
