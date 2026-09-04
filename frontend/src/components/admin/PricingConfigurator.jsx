import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  fetchSupportedCities,
  fetchDistrictPricing,
  saveDistrictPricing,
  deleteDistrictPricing,
} from '../../services/adminStore';
import { showToast } from './ToastContainer';

export default function PricingConfigurator({ pricing, onSavePricing, onResetPricing }) {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'Super Admin';
  const dealerDistricts = (user?.coveredPostcodes || []).map((p) => String(p).trim().toUpperCase());

  const [activeTab, setActiveTab] = useState('district'); // 'district' | 'city'
  
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

  const loadDistrictPricingData = async () => {
    setLoadingDistricts(true);
    try {
      const data = await fetchDistrictPricing();
      setDistrictData(data || { defaultPricePerTonne: 235, districtRates: {}, activeDistricts: [] });
      
      const activeList = data.activeDistricts || [];
      const initialDist = dealerDistricts[0] || activeList[0] || (Object.keys(data.districtRates || {})[0]) || 'PE1';
      setSelectedDistrict(initialDist);
      setDistrictRateInput(String(data.districtRates?.[initialDist] ?? data.defaultPricePerTonne ?? 235));
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

  const sampleWeight = 1300;
  const sampleBase = ((sampleWeight / 1000) * currentNumericRate).toFixed(2);

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
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          <div className="space-y-4 sm:space-y-5 rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xs lg:col-span-2">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>📮 District Scrap Rate:</span>
                  <span className="text-[#0f7b4f]">{selectedDistrict}</span>
                </h3>
              </div>

              {allKnownDistricts.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-600">Select:</span>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-black text-slate-900 outline-none focus:border-[#0f7b4f]"
                  >
                    {allKnownDistricts.map((dist) => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
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
                    disabled={!isSuperAdmin}
                    value={districtRateInput}
                    onChange={(e) => setDistrictRateInput(e.target.value)}
                    className="w-full rounded-xl border border-emerald-300 bg-white px-4 py-3 text-2xl font-black text-slate-900 outline-none focus:border-[#0f7b4f]"
                  />
                </div>
              </div>

              {isSuperAdmin && (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="submit"
                    className="rounded-xl bg-[#0f7b4f] px-6 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#075b3a]"
                  >
                    Save Rate
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="space-y-4 rounded-2xl sm:rounded-3xl border border-gray-200 bg-gray-50 p-6 shadow-xs h-fit">
            <h4 className="text-sm font-black text-slate-900">Live Preview</h4>
            <div className="rounded-2xl bg-[#0b2e21] p-4 text-center text-white">
              <div className="text-3xl font-black text-[#dff46b]">£{sampleBase}</div>
              <p className="text-xs text-[#c8ded4] mt-1">Quote for {selectedDistrict}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'city' && (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
          <form onSubmit={handleCitySubmit} className="space-y-4 sm:space-y-5 rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xs lg:col-span-2">
            <h3 className="text-lg font-black text-slate-900">📍 City Scrap Rate</h3>
            <div className="rounded-2xl border border-[#c9e8d8] bg-[#edf7f2] p-5">
              <input
                type="number"
                value={rateInput}
                onChange={(e) => setRateInput(e.target.value)}
                className="w-full rounded-xl border border-emerald-300 bg-white px-4 py-3 text-2xl font-black"
              />
            </div>
            <button type="submit" className="rounded-xl bg-[#0f7b4f] px-6 py-2.5 text-xs font-extrabold text-white">Save</button>
          </form>
        </div>
      )}
    </div>
  );
}
