import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { TARGET_CITIES } from '../../utils/cityHelper';

export default function PricingConfigurator({ pricing, onSavePricing, onResetPricing }) {
  const { user } = useAuth();
  const isDealer = !!user?.assignedCity;

  const [selectedCity, setSelectedCity] = useState(user?.assignedCity || 'London');
  const [cityRates, setCityRates] = useState({ ...(pricing?.cityRates || {}) });
  
  // Keep rateInput as a string so user can clear the field completely and type freely
  const [rateInput, setRateInput] = useState(
    String(pricing?.cityRates?.[user?.assignedCity || 'London'] ?? 235),
  );
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    const activeCity = user?.assignedCity || selectedCity;
    setRateInput(String(cityRates[activeCity] ?? 235));
  }, [selectedCity, user, cityRates]);

  const handleCityChange = (city) => {
    setSelectedCity(city);
    setRateInput(String(cityRates[city] ?? 235));
    setSavedMessage(false);
  };

  const handleRateInputChange = (val) => {
    setRateInput(val);
    setSavedMessage(false);
    
    // Update cityRates state in real time if input is a valid number
    if (val !== '' && !isNaN(val)) {
      const activeCity = user?.assignedCity || selectedCity;
      setCityRates((prev) => ({
        ...prev,
        [activeCity]: Number(val),
      }));
    }
  };

  const handleSubmit = (e) => {
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

    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleReset = () => {
    const res = onResetPricing();
    setCityRates({ ...(res.cityRates || {}) });
    const activeCity = user?.assignedCity || selectedCity;
    setRateInput(String(res.cityRates?.[activeCity] ?? 235));
    setSavedMessage(false);
  };

  const activeCityName = user?.assignedCity || selectedCity;
  const currentNumericRate = rateInput === '' ? 0 : Number(rateInput);

  // Live Calculation Preview based on 1,300 kg sample vehicle
  const sampleWeight = 1300;
  const sampleBase = ((sampleWeight / 1000) * currentNumericRate).toFixed(2);

  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-4 sm:p-6 shadow-xs lg:col-span-2">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <span>📍 Scrap Rate:</span>
              <span className="text-[#0f7b4f]">{activeCityName}</span>
            </h3>
            <p className="text-xs text-gray-500">
              {isDealer
                ? `Configure live scrap price per tonne for ${activeCityName} customer quotes.`
                : `Select a city dealer territory to adjust its scrap valuation rate.`}
            </p>
          </div>

          {!isDealer && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-600">Select City:</span>
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-extrabold text-slate-900 outline-none focus:border-[#0f7b4f]"
              >
                {TARGET_CITIES.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* City Selector Pills for Super Admin */}
        {!isDealer && (
          <div className="flex items-center gap-1.5 pt-2 border-t border-gray-100 overflow-x-auto pb-1 scrollbar-none">
            {TARGET_CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleCityChange(city)}
                className={`rounded-xl px-2.5 py-1 text-xs font-black transition cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedCity === city
                    ? 'bg-[#0f7b4f] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📍 {city} (£{cityRates[city] ?? 235}/t)
              </button>
            ))}
          </div>
        )}

        {savedMessage && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-800">
            ✅ Scrap rate for <strong>{activeCityName}</strong> updated to £{currentNumericRate}/tonne!
          </div>
        )}

        <div>
          {/* Base Rate Input */}
          <div className="rounded-2xl border border-[#c9e8d8] bg-[#edf7f2] p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#0f7b4f]">
                {activeCityName} Price Per Tonne (£/tonne)
              </label>
              <span className="rounded-md bg-[#0f7b4f] px-2 py-0.5 text-[9px] sm:text-[10px] font-black text-white uppercase">
                {activeCityName} Territory
              </span>
            </div>

            <div className="mt-2.5 flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-[#0b2e21]">£</span>
              <input
                type="number"
                step="any"
                placeholder="e.g. 250"
                value={rateInput}
                onChange={(e) => handleRateInputChange(e.target.value)}
                className="w-full rounded-xl border border-emerald-300 bg-white px-3.5 py-2.5 sm:px-4 sm:py-3 text-xl sm:text-2xl font-black text-slate-900 outline-none focus:border-[#0f7b4f]"
              />
            </div>
            <p className="mt-2 text-xs text-emerald-800 leading-tight">
              Quotes for vehicles collected in <strong>{activeCityName}</strong> calculate as: <code className="font-mono bg-emerald-100/80 px-1 py-0.5 rounded text-emerald-950 font-bold break-all">(KerbWeightKg / 1000) × £{rateInput || 0}</code>.
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-100 cursor-pointer text-center"
          >
            Reset All Cities to Defaults
          </button>

          <button
            type="submit"
            className="rounded-xl border-0 bg-[#0f7b4f] px-6 py-2.5 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#075b3a] cursor-pointer text-center"
          >
            Save {activeCityName} Scrap Rate
          </button>
        </div>
      </form>

      {/* Live Calculator Preview Card */}
      <div className="space-y-4 rounded-2xl sm:rounded-3xl border border-gray-200 bg-linear-to-b from-gray-50 to-white p-4 sm:p-6 shadow-xs">
        <div>
          <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-[#0f7b4f]">
            {activeCityName} Live Preview
          </span>
          <h4 className="mt-1 text-base font-black text-slate-900">1,300 kg Sample Vehicle</h4>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between border-b border-gray-200 pb-2 text-gray-600">
            <span>Territory:</span>
            <strong className="text-[#0f7b4f]">📍 {activeCityName}</strong>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2 text-gray-600">
            <span>Active Rate:</span>
            <strong className="text-slate-900">£{rateInput || 0} / tonne</strong>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2 text-gray-600">
            <span>Calculation (1.3t × £{rateInput || 0}):</span>
            <strong className="text-slate-900">£{sampleBase}</strong>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0b2e21] p-4 text-center text-white">
          <span className="text-xs text-[#c8ded4]">Calculated Quote in {activeCityName}</span>
          <div className="text-2xl sm:text-3xl font-black text-[#dff46b]">£{sampleBase}</div>
        </div>
      </div>
    </div>
  );
}
