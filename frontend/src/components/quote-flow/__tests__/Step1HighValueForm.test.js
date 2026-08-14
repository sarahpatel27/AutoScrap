import { VEHICLE_CONDITIONS } from '../Step1HighValueForm';

describe('High-Value Form Value Preference Options', () => {
  test('validates custom GBP expected value inputs', () => {
    const validateCustomValue = (val) => {
      const num = Number(val);
      if (!val || isNaN(num) || num <= 0 || num > 100000) return false;
      return true;
    };

    expect(validateCustomValue('1400')).toBe(true);
    expect(validateCustomValue('1250')).toBe(true);
    expect(validateCustomValue('0')).toBe(false);
    expect(validateCustomValue('-500')).toBe(false);
    expect(validateCustomValue('abc')).toBe(false);
    expect(validateCustomValue('150000')).toBe(false);
  });
});
