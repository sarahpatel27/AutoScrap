import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchSupportedCities,
  fetchDistrictPricing,
  saveDistrictPricing,
  deleteDistrictPricing,
} from '../../services/adminStore';
import { showToast } from './ToastContainer';

const VEHICLE_PRESETS = [
  { label: 'Small Hatchback', weightKg: 1050, icon: '🚗', example: 'Fiesta, C1, Polo' },
  { label: 'Family Car', weightKg: 1350, icon: '🚙', example: 'Focus, Golf, Astra' },
  { label: 'SUV / 4x4', weightKg: 1950, icon: '🚐', example: 'X5, Range Rover, Qashqai' },
];

export default function PricingConfigurator({ pricing, onSavePricing, onResetPricing }) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';
  const dealerDistricts = (user?.coveredPostcodes || []).map((p) => String(p).trim().toUpperCase()).filter(Boolean);

  const [activeTab, setActiveTab] = useState('district'); // 'district' | 'city'
  
  // Interactive Live Preview state
  const [previewWeightKg, setPreviewWeightKg] = useState(1350);
  const [customWeightInput, setCustomWeightInput] = useState('');
  
  // District pricing states (Option B)
  const [districtData, setDistrictData] = useState({
    defaultPricePerTonne: 235,
    districtRates: {},
    activeDistricts: [],
  });
  const [selectedDistrict, setSelectedDistrict] = useState(dealerDistricts[0] || 'PE1');
  const [districtRateInput, setDistrictRateInput] = useState('235');
  const [newDistrictCode, setNewDistrictCode] = useState('');
  const [newDistrictRate, setNewDistrictRate] = useState('235');
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [savingDistrict, setSavingDistrict] = useState(false);

  // City rates states (Legacy)
  const [supportedCitiesList, setSupportedCitiesList] = useState([]);
  const [selectedCity, setSelectedCity] = useState(user?.assignedCity || '');
  const [cityRates, setCityRates] = useState({ ...(pricing?.cityRates || {}) });
  const [rateInput, setRateInput] = useState('235');
  const [savedMessage, setSavedMessage] = useState(false);

  const visibleDistricts = isSuperAdmin
    ? Array.from(
        new Set([
          ...(districtData.activeDistricts || []),
          ...Object.keys(districtData.districtRates || {}),
          ...dealerDistricts,
        ])
      ).sort()
    : dealerDistricts;

  const loadDistrictPricingData = async () => {
    setLoadingDistricts(true);
    try {
      const data = await fetchDistrictPricing();
      setDistrictData(data || { defaultPricePerTonne: 235, districtRates: {}, activeDistricts: [] });
      
      const available = isSuperAdmin
        ? (data.activeDistricts || [])
        : dealerDistricts;
      const initialDist = available.includes(selectedDistrict)
        ? selectedDistrict
        : (available[0] || '');
      setSelectedDistrict(initialDist);
      if (initialDist) {
        setDistrictRateInput(String(data.districtRates?.[initialDist] ?? data.defaultPricePerTonne ?? 235));
      }
    } catch (err) {
      console.error('Error fetching district pricing:', err);
    } finally {
      setLoadingDistricts(false);
    }
  };

  useEffect(() => {
    loadDistrictPricingData();
  }, []);

  useEffect(() => {
    async function loadCities() {
      try {
        const cities = await fetchSupportedCities({ active: 'true' });
        const cityNames = (cities || []).map((c) => c.name);
        setSupportedCitiesList(cityNames);

        if (!selectedCity && cityNames.length > 0) {
          const initial = user?.assignedCity || cityNames[0];
          setSelectedCity(initial);
        }
      } catch (err) {
        console.error('Error loading cities for pricing:', err);
      }
    }
    loadCities();
  }, [user]);

  useEffect(() => {
    const activeCity = user?.assignedCity || selectedCity;
    if (activeCity) {
      setRateInput(String(cityRates[activeCity] ?? 235));
    }
  }, [selectedCity, user, cityRates]);

  const handleDistrictChange = (dist) => {
    setSelectedDistrict(dist);
    const rate = districtData.districtRates[dist] ?? districtData.defaultPricePerTonne ?? 235;
    setDistrictRateInput(String(rate));
  };

  const handleSaveCurrentDistrict = async (e) => {
    e.preventDefault();
    if (!selectedDistrict) return;
    const numericRate = Number(districtRateInput);
    if (isNaN(numericRate) || numericRate <= 0) {
      showToast('Please enter a valid price per tonne.', 'error');
      return;
    }

    setSavingDistrict(true);
    try {
      const updated = await saveDistrictPricing({
        district: selectedDistrict,
        pricePerTonne: numericRate,
      });
      setDistrictData(updated);
      showToast(`Scrap rate for ${selectedDistrict} updated to £${numericRate}/tonne!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save district rate.', 'error');
    } finally {
      setSavingDistrict(false);
    }
  };

  const handleAddNewDistrictRate = async (e) => {
    e.preventDefault();
    const cleanDist = newDistrictCode.trim().toUpperCase();
    const numRate = Number(newDistrictRate);

    if (!cleanDist) {
      showToast('Please enter an outward district code (e.g. PE2).', 'error');
      return;
    }
    if (isNaN(numRate) || numRate <= 0) {
      showToast('Please enter a valid price per tonne.', 'error');
      return;
    }

    setSavingDistrict(true);
    try {
      const updated = await saveDistrictPricing({
        district: cleanDist,
        pricePerTonne: numRate,
      });
      setDistrictData(updated);
      setSelectedDistrict(cleanDist);
      setDistrictRateInput(String(numRate));
      setNewDistrictCode('');
      showToast(`Added rate for district ${cleanDist}: £${numRate}/tonne!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to add district rate.', 'error');
    } finally {
      setSavingDistrict(false);
    }
  };

  const handleDeleteDistrictRate = async (dist) => {
    setSavingDistrict(true);
    try {
      const updated = await deleteDistrictPricing(dist);
      setDistrictData(updated);
      showToast(`Removed custom rate for ${dist}. Reverted to base rate (£${updated.defaultPricePerTonne}/t).`, 'success');
      if (selectedDistrict === dist) {
        setDistrictRateInput(String(updated.defaultPricePerTonne || 235));
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete district rate.', 'error');
    } finally {
      setSavingDistrict(false);
    }
  };

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setRateInput(String(cityRates[city] ?? 235));
    setSavedMessage(false);
  };

  const handleCitySubmit = (e) => {
    e.preventDefault();
    const activeCity = user?.assignedCity || selectedCity;
    const numericRate = rateInput === '' ? 235 : Number(rateInput);

    const updatedRates = {
      ...cityRates,
      [activeCity]: numericRate,
    };

    onSavePricing({
      ...pricing,
      cityRates: updatedRates,
    });

    showToast(`Scrap rate for ${activeCity} updated to £${numericRate}/tonne!`, 'success');
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const currentNumericRate = activeTab === 'district'
    ? (Number(districtRateInput) || 235)
    : (rateInput === '' ? 235 : Number(rateInput));

  const activeWeightKg = customWeightInput && Number(customWeightInput) > 0
    ? Number(customWeightInput)
    : previewWeightKg;
  const tonnes = activeWeightKg / 1000;
  const calculatedQuote = (tonnes * currentNumericRate).toFixed(2);
  const activeAreaLabel = activeTab === 'district'
    ? (selectedDistrict || 'Selected District')
    : (selectedCity || 'Selected City');

  const renderLivePreview = () => (
    <div className="space-y-4 rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-5 sm:p-6 shadow-xs h-fit font-['DM_Sans',sans-serif]">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <div>
          <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5 font-['Manrope',sans-serif]">
            <span>⚡</span>
            <span>Live Quote Preview</span>
          </h4>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Real-time customer valuation for <strong className="text-slate-800 font-bold">{activeAreaLabel}</strong>
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-[#0f7b4f] border border-emerald-200">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Engine
        </span>
      </div>

      {/* Realistic Customer Quote Payout Card */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0b2e21] to-[#072117] p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none"></div>

        <div className="flex items-center justify-between text-xs text-emerald-300 font-bold mb-1">
          <span className="flex items-center gap-1">
            📍 {activeTab === 'district' ? `District ${activeAreaLabel}` : `City ${activeAreaLabel}`}
          </span>
          <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] text-emerald-200 font-semibold">
            £{currentNumericRate.toFixed(2)}/tonne
          </span>
        </div>

        <div className="my-2.5">
          <div className="text-[11px] text-emerald-200/80 font-medium">
            Customer Scrap Valuation Payout
          </div>
          <div className="text-3xl sm:text-4xl font-black text-[#dff46b] font-mono tracking-tight mt-0.5">
            £{Number(calculatedQuote).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-emerald-100/80 font-medium">
          <span>✓ 100% Guaranteed</span>
          <span>🚚 Free Collection</span>
        </div>
      </div>

      {/* Vehicle Weight Presets */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <span>Sample Vehicle Category:</span>
          {customWeightInput && (
            <button
              type="button"
              onClick={() => setCustomWeightInput('')}
              className="text-[10px] text-emerald-700 hover:underline cursor-pointer font-bold"
            >
              Reset to Preset
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {VEHICLE_PRESETS.map((preset) => {
            const isSelected = activeWeightKg === preset.weightKg && !customWeightInput;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setPreviewWeightKg(preset.weightKg);
                  setCustomWeightInput('');
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-center transition cursor-pointer border ${
                  isSelected
                    ? 'bg-emerald-50 border-[#0f7b4f] text-[#0f7b4f] shadow-xs ring-1 ring-[#0f7b4f]'
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-base">{preset.icon}</span>
                <span className="text-[10px] font-bold mt-0.5 leading-tight">{preset.label}</span>
                <span className="text-[9px] text-gray-500 font-medium">({preset.weightKg} kg)</span>
              </button>
            );
          })}
        </div>

        {/* Custom Weight Test Input */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[11px] text-gray-500 font-medium">Or test custom weight:</span>
          <div className="flex items-center gap-1">
            <input
              type="number"
              placeholder="e.g. 855"
              value={customWeightInput}
              onChange={(e) => setCustomWeightInput(e.target.value)}
              className="w-24 rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#0f7b4f]"
            />
            <span className="text-[11px] text-gray-400 font-mono">kg</span>
          </div>
        </div>
      </div>

      {/* Formula Breakdown */}
      <div className="rounded-xl border border-gray-200/80 bg-gray-50 p-3.5 space-y-2 text-xs">
        <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
          Transparent Formula Breakdown
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Vehicle Kerb Weight:</span>
          <span className="font-bold text-slate-900 font-mono">
            {activeWeightKg.toLocaleString('en-GB')} kg ({(activeWeightKg / 1000).toFixed(3)} tonnes)
          </span>
        </div>
        <div className="flex items-center justify-between text-slate-600">
          <span>Scrap Rate applied:</span>
          <span className="font-bold text-[#0f7b4f] font-mono">
            × £{currentNumericRate.toFixed(2)} / tonne
          </span>
        </div>
        <div className="pt-2 border-t border-gray-200 flex items-center justify-between text-slate-900 font-black">
          <span>Instant Quote:</span>
          <span className="font-mono text-sm text-[#0f7b4f]">
            £{Number(calculatedQuote).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <p className="text-[11px] text-gray-400 leading-relaxed">
        💡 When a vehicle owner enters a postcode in <strong className="text-slate-700">{activeAreaLabel}</strong>, their DVLA kerb weight is multiplied by your rate above.
      </p>
    </div>
  );

  const allKnownDistricts = Array.from(
    new Set([
      ...(districtData.activeDistricts || []),
      ...Object.keys(districtData.districtRates || {}),
      ...dealerDistricts,
    ])
  ).sort();

  return (
    <div className="space-y-6">
      {isSuperAdmin && (
        <div className="flex items-center gap-2 border-b border-gray-200 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('district')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'district'
                ? 'bg-[#0f7b4f] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>📮</span>
            <span>Outward District Pricing</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('city')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'city'
                ? 'bg-[#0f7b4f] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <span>🏙️</span>
            <span>City-Level Pricing</span>
          </button>
        </div>
      )}

      {activeTab === 'district' && (
        !isSuperAdmin && visibleDistricts.length === 0 ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8 text-center space-y-2.5">
            <span className="text-3xl sm:text-4xl">📮</span>
            <h4 className="text-base font-black text-amber-950">No Postcode Districts Assigned</h4>
            <p className="text-xs text-amber-800 max-w-md mx-auto leading-relaxed">
              Your dealer account currently does not have any outward postcode districts assigned. Please contact the Super Administrator to assign your coverage areas before configuring scrap rates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="space-y-4 sm:space-y-5 rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xs lg:col-span-2">
              <div className="flex flex-col gap-2.5 border-b border-gray-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                    <span>📮 District Scrap Rate:</span>
                    <span className="text-[#0f7b4f]">{selectedDistrict || 'None Selected'}</span>
                  </h3>

                  {visibleDistricts.length > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-600">Select:</span>
                      <select
                        value={selectedDistrict}
                        onChange={(e) => handleDistrictChange(e.target.value)}
                        className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-black text-slate-900 outline-none focus:border-[#0f7b4f]"
                      >
                        {visibleDistricts.map((dist) => (
                          <option key={dist} value={dist}>{dist}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Quick district pills */}
                {visibleDistricts.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {visibleDistricts.map((dist) => {
                      const currentRate = districtData.districtRates[dist] ?? districtData.defaultPricePerTonne ?? 235;
                      const isSelected = selectedDistrict === dist;
                      return (
                        <button
                          key={dist}
                          type="button"
                          onClick={() => handleDistrictChange(dist)}
                          className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#0b2e21] text-[#dff46b] shadow-sm'
                              : 'bg-emerald-50 text-[#0f7b4f] border border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          <span>📮 {dist}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-800 border border-emerald-100'
                          }`}>
                            £{currentRate}/t
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveCurrentDistrict} className="space-y-4">
                <div className="rounded-2xl border border-[#c9e8d8] bg-[#edf7f2] p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold uppercase text-[#0f7b4f]">
                      Price Per Tonne (£)
                    </label>
                  </div>
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-2xl font-black text-[#0b2e21]">£</span>
                    <input
                      type="number"
                      step="any"
                      disabled={savingDistrict || !selectedDistrict}
                      value={districtRateInput}
                      onChange={(e) => setDistrictRateInput(e.target.value)}
                      className="w-full rounded-xl border border-emerald-300 bg-white px-4 py-3 text-2xl font-black text-slate-900 outline-none focus:border-[#0f7b4f]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingDistrict || !selectedDistrict}
                    className="rounded-xl bg-[#0f7b4f] px-6 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#075b3a] cursor-pointer active:scale-95 disabled:opacity-50"
                  >
                    {savingDistrict ? 'Saving...' : `Save Rate for ${selectedDistrict}`}
                  </button>
                </div>
              </form>
            </div>

            {renderLivePreview()}
          </div>
        )
      )}

      {activeTab === 'city' && (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          <form onSubmit={handleCitySubmit} className="space-y-4 sm:space-y-5 rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xs lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-4">
              <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2 font-['Manrope',sans-serif]">
                <span>🏙️ City Scrap Rate:</span>
                <span className="text-[#0f7b4f]">{selectedCity || 'None Selected'}</span>
              </h3>

              {supportedCitiesList.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-600">Select City:</span>
                  <select
                    value={selectedCity}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-black text-slate-900 outline-none focus:border-[#0f7b4f]"
                  >
                    {supportedCitiesList.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-[#c9e8d8] bg-[#edf7f2] p-4 sm:p-5">
              <label className="block text-xs font-extrabold uppercase text-[#0f7b4f]">
                Price Per Tonne (£)
              </label>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-2xl font-black text-[#0b2e21]">£</span>
                <input
                  type="number"
                  step="any"
                  value={rateInput}
                  onChange={(e) => setRateInput(e.target.value)}
                  className="w-full rounded-xl border border-emerald-300 bg-white px-4 py-3 text-2xl font-black text-slate-900 outline-none focus:border-[#0f7b4f]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="submit"
                className="rounded-xl bg-[#0f7b4f] px-6 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#075b3a] cursor-pointer active:scale-95 shadow-xs"
              >
                Save Rate for {selectedCity}
              </button>
            </div>
          </form>

          {renderLivePreview()}
        </div>
      )}
    </div>
  );
}
