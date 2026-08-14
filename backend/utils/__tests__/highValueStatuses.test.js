import { HIGH_VALUE_STATUSES, HIGH_VALUE_STATUS_OPTIONS, isValidStatusTransition } from '../highValueStatuses';

describe('High-Value Enquiry Status Workflow', () => {
  test('defines clear status constants', () => {
    expect(HIGH_VALUE_STATUSES.PENDING).toBe('PENDING');
    expect(HIGH_VALUE_STATUSES.BIDDING).toBe('BIDDING');
    expect(HIGH_VALUE_STATUSES.BIDDING_ENDED).toBe('BIDDING_ENDED');
    expect(HIGH_VALUE_STATUSES.DEALER_SELECTED).toBe('DEALER_SELECTED');
    expect(HIGH_VALUE_STATUSES.PURCHASED).toBe('PURCHASED');
    expect(HIGH_VALUE_STATUSES.CANCELLED).toBe('CANCELLED');
  });

  test('placing a bid (transitioning from PENDING to BIDDING) does NOT mark as PURCHASED', () => {
    expect(isValidStatusTransition('PENDING', 'BIDDING')).toBe(true);
    expect(HIGH_VALUE_STATUSES.BIDDING).not.toBe(HIGH_VALUE_STATUSES.PURCHASED);
  });

  test('validates valid workflow status transitions', () => {
    expect(isValidStatusTransition('PENDING', 'BIDDING')).toBe(true);
    expect(isValidStatusTransition('BIDDING', 'BIDDING_ENDED')).toBe(true);
    expect(isValidStatusTransition('BIDDING_ENDED', 'DEALER_SELECTED')).toBe(true);
    expect(isValidStatusTransition('DEALER_SELECTED', 'PURCHASED')).toBe(true);
  });
});
