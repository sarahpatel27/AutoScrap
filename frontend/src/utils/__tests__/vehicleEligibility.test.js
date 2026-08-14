import { isHighValueVehicle } from '../vehicleEligibility';

describe('isHighValueVehicle routing utility', () => {
  test('vehicle manufactured in 2012 routes to standard scrap flow (false)', () => {
    expect(isHighValueVehicle(2012)).toBe(false);
  });

  test('vehicle manufactured in 2015 routes to standard scrap flow (false)', () => {
    expect(isHighValueVehicle(2015)).toBe(false);
    expect(isHighValueVehicle('2015')).toBe(false);
  });

  test('vehicle manufactured in 2016 routes to high-value flow (true)', () => {
    expect(isHighValueVehicle(2016)).toBe(true);
    expect(isHighValueVehicle('2016')).toBe(true);
  });

  test('vehicle manufactured in 2020 routes to high-value flow (true)', () => {
    expect(isHighValueVehicle(2020)).toBe(true);
  });

  test('vehicle manufactured in 2025 routes to high-value flow (true)', () => {
    expect(isHighValueVehicle(2025)).toBe(true);
  });

  test('handles null, undefined or invalid year gracefully', () => {
    expect(isHighValueVehicle(null)).toBe(false);
    expect(isHighValueVehicle(undefined)).toBe(false);
    expect(isHighValueVehicle('')).toBe(false);
  });
});
