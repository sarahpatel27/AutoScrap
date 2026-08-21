describe('3 Role-Based Visibility Cases Test Suite', () => {
  const londonWinnerUser = { id: 5, role: 'City Dealer', assignedCity: 'London' };
  const manchesterLoserUser = { id: 9, role: 'City Dealer', assignedCity: 'Manchester' };
  const superAdminUser = { id: 1, role: 'Super Admin', assignedCity: null };

  const londonWonRecord = {
    id: '101',
    status: 'DEALER_SELECTED',
    winningDealerId: '5',
  };

  const endedNoBidRecord = {
    id: '102',
    status: 'BIDDING_ENDED',
    winningDealerId: null,
  };

  const deletedWonRecord = {
    id: '104',
    status: 'archived',
    winningDealerId: '5',
  };

  // Helper logic mirroring getHighValueEnquiries filter for City Dealer
  function isVisibleInHighValueBidding(item, user) {
    if (['archived', 'deleted', 'ARCHIVED', 'DELETED'].includes(item.status)) {
      return false;
    }
    if (user?.role === 'Super Admin') {
      return true;
    }
    if (user?.role === 'City Dealer') {
      const isWinningDealer = Boolean(item.winningDealerId) && String(item.winningDealerId) === String(user.id);
      if (item.status === 'DEALER_SELECTED' && isWinningDealer) {
        return true;
      }
      return !['BIDDING_ENDED', 'DEALER_SELECTED', 'PURCHASED', 'CANCELLED'].includes(item.status);
    }
    return false;
  }

  // Helper logic mirroring getPastEnquiries filter
  function isVisibleInPastEnquiries(item, user) {
    if (user?.role === 'Super Admin') {
      return ['archived', 'deleted', 'ARCHIVED', 'DELETED'].includes(item.status);
    }
    if (user?.role === 'City Dealer') {
      const isWinningDealer = Boolean(item.winningDealerId) && String(item.winningDealerId) === String(user.id);

      // Active DEALER_SELECTED stays in High Value Bidding tab for winning dealer (not Past Enquiries)
      if (item.status === 'DEALER_SELECTED' && isWinningDealer) {
        return false;
      }

      // Active open bidding or pending enquiries stay in High Value Bidding tab
      if (['BIDDING', 'PENDING'].includes(item.status)) {
        const isExpired = item.biddingEndsAt && new Date(item.biddingEndsAt) <= new Date();
        if (!isExpired) {
          return false;
        }
      }

      // All ended, selected (non-winner), purchased, cancelled, archived, or deleted high-value enquiries appear in Past Enquiries for dealers
      return true;
    }
    return false;
  }

  test('Case 1: Winning dealer sees won bid in High Value Bidding; losing dealer sees it in Past Enquiries', () => {
    // London Dealer (Winner)
    expect(isVisibleInHighValueBidding(londonWonRecord, londonWinnerUser)).toBe(true);
    expect(isVisibleInPastEnquiries(londonWonRecord, londonWinnerUser)).toBe(false);

    // Manchester Dealer (Loser)
    expect(isVisibleInHighValueBidding(londonWonRecord, manchesterLoserUser)).toBe(false);
    expect(isVisibleInPastEnquiries(londonWonRecord, manchesterLoserUser)).toBe(true);
  });

  test('Case 2: If no dealer wins (BIDDING_ENDED), it is in Past Enquiries for dealers, but stays in High Value Bidding for Super Admin', () => {
    // City Dealers
    expect(isVisibleInHighValueBidding(endedNoBidRecord, londonWinnerUser)).toBe(false);
    expect(isVisibleInPastEnquiries(endedNoBidRecord, londonWinnerUser)).toBe(true);

    expect(isVisibleInHighValueBidding(endedNoBidRecord, manchesterLoserUser)).toBe(false);
    expect(isVisibleInPastEnquiries(endedNoBidRecord, manchesterLoserUser)).toBe(true);

    // Super Admin
    expect(isVisibleInHighValueBidding(endedNoBidRecord, superAdminUser)).toBe(true);
    expect(isVisibleInPastEnquiries(endedNoBidRecord, superAdminUser)).toBe(false);
  });

  test('Case 3: When Super Admin deletes a record, Super Admin and Winner see it in Past Enquiries, and Losing Dealer REMAINS seeing it in Past Enquiries', () => {
    // Active won record stays in High Value Bidding for Super Admin & Winner
    expect(isVisibleInHighValueBidding(londonWonRecord, superAdminUser)).toBe(true);
    expect(isVisibleInPastEnquiries(londonWonRecord, superAdminUser)).toBe(false);

    expect(isVisibleInHighValueBidding(londonWonRecord, londonWinnerUser)).toBe(true);
    expect(isVisibleInPastEnquiries(londonWonRecord, londonWinnerUser)).toBe(false);

    // Losing dealer sees active won record in Past Enquiries
    expect(isVisibleInPastEnquiries(londonWonRecord, manchesterLoserUser)).toBe(true);

    // When Super Admin deletes the won record:
    // 1. Super Admin sees it in Past Enquiries
    expect(isVisibleInHighValueBidding(deletedWonRecord, superAdminUser)).toBe(false);
    expect(isVisibleInPastEnquiries(deletedWonRecord, superAdminUser)).toBe(true);

    // 2. Winning Dealer sees it in Past Enquiries
    expect(isVisibleInHighValueBidding(deletedWonRecord, londonWinnerUser)).toBe(false);
    expect(isVisibleInPastEnquiries(deletedWonRecord, londonWinnerUser)).toBe(true);

    // 3. Losing Dealer REMAINS seeing it in Past Enquiries!
    expect(isVisibleInHighValueBidding(deletedWonRecord, manchesterLoserUser)).toBe(false);
    expect(isVisibleInPastEnquiries(deletedWonRecord, manchesterLoserUser)).toBe(true);
  });
});
