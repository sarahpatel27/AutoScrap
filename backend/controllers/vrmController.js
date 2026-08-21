async function lookupVehicle(req, res) {
  try {
    const vrm = req.query.vrm ? String(req.query.vrm).replace(/\s+/g, '').toUpperCase() : '';
    if (!vrm || vrm.length < 2) {
      return res.status(400).json({ error: 'Please enter a valid vehicle registration.' });
    }

    const apiKey = process.env.VDG_API_KEY;
    if (!apiKey) {
      throw new Error('VDG_API_KEY is not configured in backend environment variables.');
    }
    const vdgApiUrl = process.env.VDG_API_URL || 'https://uk.api.vehicledataglobal.com/r2/lookup';
    const vdgUrl = `${vdgApiUrl}?packagename=VehicleDetailsWithImage&apikey=${encodeURIComponent(apiKey)}&vrm=${encodeURIComponent(vrm)}`;

    const vdgRes = await fetch(vdgUrl);
    if (!vdgRes.ok) {
      return res.status(vdgRes.status).json({ error: `VDG lookup HTTP error ${vdgRes.status}` });
    }

    const data = await vdgRes.json();

    if (!data.ResponseInformation?.IsSuccessStatusCode || !data.Results) {
      return res.status(404).json({
        error:
          data.ResponseInformation?.StatusMessage ||
          'We could not retrieve details for this registration. Please check and try again.',
      });
    }

    const results = data.Results;
    const vehicleDetails = results.VehicleDetails || {};
    const modelDetails = results.ModelDetails || {};
    const imageDetails = results.VehicleImageDetails || {};

    const vIdentification = vehicleDetails.VehicleIdentification || {};
    const mIdentification = modelDetails.ModelIdentification || {};
    const powertrain = modelDetails.Powertrain || {};
    const iceDetails = powertrain.IceDetails || {};
    const weights = modelDetails.Weights || {};
    const techDetails = vehicleDetails.DvlaTechnicalDetails || {};
    const imageList = imageDetails.VehicleImageList || [];

    const make = mIdentification.Make || vIdentification.DvlaMake || 'Unknown Make';
    const model = mIdentification.Model || vIdentification.DvlaModel || 'Unknown Model';
    const year =
      vIdentification.YearOfManufacture ||
      (vIdentification.DateFirstRegistered
        ? new Date(vIdentification.DateFirstRegistered).getFullYear()
        : null);

    const fuelType = powertrain.FuelType || vIdentification.DvlaFuelType || '';

    let engineSize = '';
    if (iceDetails.EngineCapacityLitres) {
      engineSize = `${iceDetails.EngineCapacityLitres}L`;
    } else if (iceDetails.EngineCapacityCc || techDetails.EngineCapacityCc) {
      const cc = iceDetails.EngineCapacityCc || techDetails.EngineCapacityCc;
      engineSize = `${(cc / 1000).toFixed(1)}L`;
    }

    const weightKg =
      weights.KerbWeightKg ||
      techDetails.MassInServiceKg ||
      techDetails.GrossWeightKg ||
      1200;

    const imageUrl = imageList.length > 0 ? imageList[0].ImageUrl : null;

    res.json({
      registration: vrm,
      make,
      model,
      year,
      fuelType,
      engineSize,
      weightKg,
      imageUrl,
    });
  } catch (err) {
    console.error('VRM Controller Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
}

module.exports = {
  lookupVehicle,
};
