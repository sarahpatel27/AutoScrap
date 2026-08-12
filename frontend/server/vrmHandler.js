

export async function getVrmDetails(vrm) {
  const cleanVrm = vrm ? String(vrm).replace(/\s+/g, '').toUpperCase() : '';
  if (!cleanVrm || cleanVrm.length < 2) {
    throw new Error('Please enter a valid vehicle registration.');
  }

  const apiKey = process.env.VDG_API_KEY || '36964D16-DC80-4774-8E87-2A5623F87014';
  const url = `https://uk.api.vehicledataglobal.com/r2/lookup?packagename=VehicleDetailsWithImage&apikey=${encodeURIComponent(apiKey)}&vrm=${encodeURIComponent(cleanVrm)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Vehicle lookup failed with status code ${response.status}`);
  }

  const data = await response.json();

  if (!data.ResponseInformation?.IsSuccessStatusCode || !data.Results) {
    throw new Error(
      data.ResponseInformation?.StatusMessage ||
        'We could not retrieve details for this registration. Please check and try again.',
    );
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

  // ModelDetails.Weights.KerbWeightKg as requested
  const weightKg =
    weights.KerbWeightKg ||
    techDetails.MassInServiceKg ||
    techDetails.GrossWeightKg ||
    1200;

  const imageUrl = imageList.length > 0 ? imageList[0].ImageUrl : null;

  return {
    registration: cleanVrm,
    make,
    model,
    year,
    fuelType,
    engineSize,
    weightKg,
    imageUrl,
  };
}
