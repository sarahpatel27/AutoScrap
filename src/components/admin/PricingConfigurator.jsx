import { useState } from 'react';

export default function PricingConfigurator({ pricing, onSavePricing, onResetPricing }) {
  const [formData, setFormData] = useState({ ...pricing });
  const [savedMessage, setSavedMessage] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Number(value) || 0,
    }));
    setSavedMessage(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSavePricing(formData);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const handleReset = () => {
    const res = onResetPricing();
    setFormData({ ...res });
    setSavedMessage(false);
  };

  // Live calculation preview based on 1300kg sample vehicle
  const sampleWeight = 1300;
  const sampleBase = Math.round((sampleWeight / 1000) * formData.pricePerTonne);
  const sampleFinal = sampleBase;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-xs lg:col-span-2">
        <div>
          <h3 className="text-lg font-black text-slate-900">Scrap Valuation Rate</h3>
          <p className="text-xs text-gray-500">
            Adjust the scrap rate per tonne. Changes will apply immediately to all new quote calculations.
          </p>
        </div>

        {savedMessage && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800">
            ✅ Scrap pricing rules updated successfully!
          </div>
        )}

        <div>
          {/* Base Rate */}
          <div className="rounded-2xl border border-[#c9e8d8] bg-[#edf7f2] p-5">
            <label className="block text-xs font-extrabold uppercase tracking-wider text-[#0f7b4f]">
              Base Price Per Tonne (£/tonne)
            </label>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-2xl font-black text-[#0b2e21]">£</span>
              <input
                type="number"
                min="50"
                max="1000"
                value={formData.pricePerTonne}
                onChange={(e) => handleChange('pricePerTonne', e.target.value)}
                className="w-full rounded-xl border border-emerald-300 bg-white px-4 py-3 text-xl font-black text-slate-900 outline-none focus:border-[#0f7b4f]"
              />
            </div>
            <p className="mt-2 text-xs text-emerald-800">
              Current UK market scrap metal rate applied against vehicle weight.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-700 transition hover:bg-gray-100"
          >
            Reset to Defaults
          </button>

          <button
            type="submit"
            className="rounded-xl border-0 bg-[#0f7b4f] px-6 py-2.5 text-xs font-extrabold text-white shadow-xs transition hover:bg-[#075b3a]"
          >
            Save Pricing Rules
          </button>
        </div>
      </form>

      {/* Live Calculator Preview Card */}
      <div className="space-y-4 rounded-3xl border border-gray-200 bg-linear-to-b from-gray-50 to-white p-6 shadow-xs">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0f7b4f]">Calculation Preview</span>
          <h4 className="mt-1 text-base font-black text-slate-900">1,300 kg Sample Vehicle</h4>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between border-b border-gray-200 pb-2 text-gray-600">
            <span>Weight Base (1.3t × £{formData.pricePerTonne}):</span>
            <strong className="text-slate-900">£{sampleBase}</strong>
          </div>
        </div>

        <div className="rounded-2xl bg-[#0b2e21] p-4 text-center text-white">
          <span className="text-xs text-[#c8ded4]">Calculated Final Value</span>
          <div className="text-3xl font-black text-[#dff46b]">£{sampleFinal}</div>
        </div>
      </div>
    </div>
  );
}
