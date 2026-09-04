const { resolveSupportedCity } = require('../utils/postcodeHelper');

async function lookupAddress(req, res) {
  try {
    const rawPostcode = req.query.postcode ? String(req.query.postcode).trim() : '';
    if (!rawPostcode || rawPostcode.replace(/\s+/g, '').length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid UK postcode.',
      });
    }

    const cleanPostcode = rawPostcode.toUpperCase();
    const apiKey = process.env.VEHICLE_DATA_GLOBAL_API_KEY || process.env.VDG_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'VEHICLE_DATA_GLOBAL_API_KEY is not configured in backend environment variables.',
      });
    }

    const vdgApiUrl = process.env.VDG_API_URL || 'https://uk.api.vehicledataglobal.com/r2/lookup';
    const vdgUrl = `${vdgApiUrl}?packagename=AddressDetails&apikey=${encodeURIComponent(apiKey)}&postcode=${encodeURIComponent(cleanPostcode)}`;

    const response = await fetch(vdgUrl);
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `Address lookup HTTP error ${response.status}`,
      });
    }

    const data = await response.json();

    if (!data.ResponseInformation?.IsSuccessStatusCode || !data.Results) {
      return res.status(404).json({
        success: false,
        error: data.ResponseInformation?.StatusMessage || 'No address details found for this postcode.',
      });
    }

    const results = data.Results || {};
    const addressDetailsObj = results.AddressDetails || results;
    const locationDetails = addressDetailsObj.LocationDetails || {};
    const onsGeography = locationDetails.OnsGeography || {};
    const adminDistrict = onsGeography.AdminDistrict?.Name || '';
    const rawList = addressDetailsObj.AddressList || [];

    if (!rawList || rawList.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No addresses found for the specified postcode.',
      });
    }

    const firstFormatted = rawList[0]?.FormattedAddressLines || {};
    const postTown = firstFormatted.PostTown || adminDistrict || '';
    const adminCounty = firstFormatted.County || onsGeography.AdminCounty?.Name || '';
    const postcode = addressDetailsObj.Postcode || firstFormatted.Postcode || cleanPostcode;

    const cityResolution = await resolveSupportedCity({
      addressList: rawList,
      locationDetails,
      postcode: cleanPostcode,
      postTown,
      adminDistrict,
      adminCounty,
    });

    const isSupported = cityResolution.isSupported;
    const matchedServiceArea = cityResolution.matchedCityName;
    const ratePerTon = cityResolution.ratePerTon;
    const outwardDistrict = cityResolution.outwardDistrict;

    const addresses = rawList.map((item, idx) => ({
      udprn: item.Udprn || idx + 1,
      summaryAddress: item.SummaryAddress || '',
    }));

    return res.json({
      success: true,
      postcode,
      outwardDistrict,
      postTown,
      adminDistrict,
      isSupported,
      matchedServiceArea,
      ratePerTon,
      addresses,
    });
  } catch (err) {
    console.error('Address Lookup Error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error during address lookup',
    });
  }
}

module.exports = {
  lookupAddress,
};
