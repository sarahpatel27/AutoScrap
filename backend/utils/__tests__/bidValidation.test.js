import { BID_STATUSES, validateBidAmount } from '../bidValidation';

describe('Dealer Bid Validation & Statuses', () => {
  test('defines standard bid statuses', () => {
    expect(BID_STATUSES.ACTIVE).toBe('ACTIVE');
    expect(BID_STATUSES.WINNING).toBe('WINNING');
    expect(BID_STATUSES.REJECTED).toBe('REJECTED');
    expect(BID_STATUSES.WITHDRAWN).toBe('WITHDRAWN');
    expect(BID_STATUSES.EXPIRED).toBe('EXPIRED');
  });

  test('validates valid numeric GBP bid amounts', () => {
    expect(validateBidAmount(1400)).toEqual({ isValid: true, numericAmount: 1400 });
    expect(validateBidAmount('1250.50')).toEqual({ isValid: true, numericAmount: 1250.5 });
  });

  test('rejects zero, negative, or invalid text amounts', () => {
    expect(validateBidAmount(0).isValid).toBe(false);
    expect(validateBidAmount(-100).isValid).toBe(false);
    expect(validateBidAmount('invalid_text').isValid).toBe(false);
    expect(validateBidAmount('').isValid).toBe(false);
  });

  test('rejects amounts exceeding sensible maximum limit (£250,000)', () => {
    expect(validateBidAmount(300000).isValid).toBe(false);
  });
});
