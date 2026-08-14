/**
 * High-Value Enquiry Status Constants & Workflow
 *
 * Workflow Lifecycle:
 * 1. PENDING         - Form submitted by customer; awaiting review / opening for dealer bidding.
 * 2. BIDDING         - Open for dealer bidding.
 * 3. BIDDING_ENDED   - Bidding timer elapsed or manually closed; top bid under evaluation.
 * 4. DEALER_SELECTED - Winning dealer selected; customer / dealer notification sent.
 * 5. PURCHASED       - Deal finalized, payment settled & vehicle collection completed.
 * 6. CANCELLED       - Enquiry cancelled by admin or customer.
 */

export const HIGH_VALUE_STATUSES = {
  PENDING: 'PENDING',
  BIDDING: 'BIDDING',
  BIDDING_ENDED: 'BIDDING_ENDED',
  DEALER_SELECTED: 'DEALER_SELECTED',
  PURCHASED: 'PURCHASED',
  CANCELLED: 'CANCELLED',
};

export const HIGH_VALUE_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending Review', icon: '⏳', color: 'amber' },
  { value: 'BIDDING', label: 'Bidding Active', icon: '⚡', color: 'emerald' },
  { value: 'BIDDING_ENDED', label: 'Bidding Ended', icon: '🏁', color: 'blue' },
  { value: 'DEALER_SELECTED', label: 'Dealer Selected', icon: '🤝', color: 'purple' },
  { value: 'PURCHASED', label: 'Purchased / Collected', icon: '✅', color: 'green' },
  { value: 'CANCELLED', label: 'Cancelled', icon: '❌', color: 'red' },
];

/**
 * Checks if status transition is valid according to business rules.
 * Rule: placing a bid does NOT automatically set status to PURCHASED.
 *
 * @param {string} currentStatus
 * @param {string} newStatus
 * @returns {boolean}
 */
export function isValidStatusTransition(currentStatus, newStatus) {
  if (currentStatus === newStatus) return true;
  if (currentStatus === HIGH_VALUE_STATUSES.CANCELLED) return false;

  const validTransitions = {
    [HIGH_VALUE_STATUSES.PENDING]: [HIGH_VALUE_STATUSES.BIDDING, HIGH_VALUE_STATUSES.CANCELLED],
    [HIGH_VALUE_STATUSES.BIDDING]: [HIGH_VALUE_STATUSES.BIDDING_ENDED, HIGH_VALUE_STATUSES.DEALER_SELECTED, HIGH_VALUE_STATUSES.CANCELLED],
    [HIGH_VALUE_STATUSES.BIDDING_ENDED]: [HIGH_VALUE_STATUSES.DEALER_SELECTED, HIGH_VALUE_STATUSES.BIDDING, HIGH_VALUE_STATUSES.CANCELLED],
    [HIGH_VALUE_STATUSES.DEALER_SELECTED]: [HIGH_VALUE_STATUSES.PURCHASED, HIGH_VALUE_STATUSES.CANCELLED],
    [HIGH_VALUE_STATUSES.PURCHASED]: [],
  };

  return (validTransitions[currentStatus] || []).includes(newStatus);
}
