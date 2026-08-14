import { useState } from 'react';
import StepHeading from './StepHeading';
import {
  labelClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  alertErrorClass,
} from './constants';
import { getCityFromPostcode } from '../../utils/cityHelper';

export const VEHICLE_CONDITIONS = [
  { value: 'Excellent', label: 'Excellent', description: 'Clean bodywork, smooth engine, full service history', icon: '✨' },
  { value: 'Good', label: 'Good', description: 'Minor cosmetic wear, running well, reliable', icon: '👍' },
  { value: 'Fair', label: 'Fair', description: 'Average wear and tear, high mileage or minor faults', icon: '⚙️' },
  { value: 'Poor', label: 'Poor', description: 'Major mechanical issues, body damage, or high repair costs', icon: '🔧' },
  { value: 'Damaged', label: 'Damaged', description: 'Accident damage, write-off, or structural damage', icon: '💥' },
  { value: 'Non-runner', label: 'Non-runner', description: 'Does not start or run, engine/gearbox failure', icon: '🚫' },
];

export default function Step1HighValueForm({
  data,
  updateCustomer,
  update,
  onBack,
  onSubmitHighValueEnquiry,
  loading,
  error,
  setError,
}) {
  const vehicle = data.vehicle || {};
  const customer = data.customer || {};

  // Base estimated value calculated or default
  const estimatedValue = Number(data.quote?.finalValue || data.estimatedValue || 1250);

  // Form State
  const [mileage, setMileage] = useState(data.mileage || '');
  const [mileageError, setMileageError] = useState('');
  const [condition, setCondition] = useState(data.vehicleCondition || 'Good');
  const [photos, setPhotos] = useState(data.photos || []);
  const [photoError, setPhotoError] = useState('');
  const [postcode, setPostcode] = useState(customer.collectionPostcode || data.postcode || '');
  const [postcodeError, setPostcodeError] = useState('');

  // Value preference state: 'ESTIMATED_VALUE' | 'CUSTOM_VALUE'
  const [valuePreference, setValuePreference] = useState(
    data.valuePreference || 'ESTIMATED_VALUE'
  );
  const [customValue, setCustomValue] = useState(
    data.customerExpectedValue && data.valuePreference === 'CUSTOM_VALUE'
      ? String(data.customerExpectedValue)
      : ''
  );
  const [customValueError, setCustomValueError] = useState('');

  // UK Postcode regex validation
  const ukPostcodeRegex = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
  const detectedCity = getCityFromPostcode(postcode, customer.collectionAddress);

  // Mileage Validation
  const handleMileageChange = (e) => {
    const val = e.target.value.replace(/\D/g, '');
    setMileage(val);
    update('mileage', val);

    if (val && (Number(val) < 0 || Number(val) > 999999)) {
      setMileageError('Please enter a valid mileage between 0 and 999,999.');
    } else {
      setMileageError('');
    }
  };

  // Custom Value Validation
  const handleCustomValueChange = (e) => {
    const rawVal = e.target.value.replace(/[^0-9.]/g, '');
    setCustomValue(rawVal);

    if (valuePreference === 'CUSTOM_VALUE') {
      const num = Number(rawVal);
      if (!rawVal || isNaN(num) || num <= 0) {
        setCustomValueError('Please enter a valid positive GBP amount (greater than £0).');
      } else if (num > 100000) {
        setCustomValueError('Please enter a realistic expected value under £100,000.');
      } else {
        setCustomValueError('');
      }
    }
  };

  // Value Preference Radio Change
  const handlePreferenceChange = (pref) => {
    setValuePreference(pref);
    setCustomValueError('');
    if (pref === 'ESTIMATED_VALUE') {
      setCustomValue('');
    }
  };

  // Postcode Validation
  const handlePostcodeChange = (e) => {
    const formatted = e.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, '');
    setPostcode(formatted);
    updateCustomer('collectionPostcode', formatted);
    update('postcode', formatted);

    if (formatted.length >= 4 && !ukPostcodeRegex.test(formatted.trim())) {
      setPostcodeError('Please enter a valid UK postcode (e.g. SW1A 1AA or M1 1AA).');
    } else {
      setPostcodeError('');
    }
  };

  // Photo Upload Handler with validation (Max 8 images, max 10MB each)
  const handlePhotoUpload = (e) => {
    setPhotoError('');
    const files = Array.from(e.target.files || []);
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxFiles = 8;
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB

    if (photos.length + files.length > maxFiles) {
      setPhotoError(`You can upload a maximum of ${maxFiles} photos.`);
      return;
    }

    const validNewPhotos = [];
    for (const file of files) {
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setPhotoError('Invalid format. Please upload JPG, JPEG, PNG, or WEBP images.');
        return;
      }
      if (file.size > maxSizeBytes) {
        setPhotoError(`File "${file.name}" exceeds the 10MB size limit.`);
        return;
      }

      validNewPhotos.push({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
        previewUrl: URL.createObjectURL(file),
        file,
      });
    }

    const updatedPhotos = [...photos, ...validNewPhotos];
    setPhotos(updatedPhotos);
    update('photos', updatedPhotos);
  };

  const handleRemovePhoto = (photoId) => {
    const updated = photos.filter((p) => p.id !== photoId);
    setPhotos(updated);
    update('photos', updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (setError) setError('');

    // Validations
    if (!mileage || isNaN(Number(mileage)) || Number(mileage) <= 0) {
      setMileageError('Please enter a valid positive vehicle mileage.');
      return;
    }

    // Custom Value Validation
    let customerExpectedValue = estimatedValue;
    if (valuePreference === 'CUSTOM_VALUE') {
      const num = Number(customValue);
      if (!customValue || isNaN(num) || num <= 0) {
        setCustomValueError('Please enter a valid positive expected value greater than £0.');
        return;
      }
      if (num > 100000) {
        setCustomValueError('Please enter a realistic expected value under £100,000.');
        return;
      }
      customerExpectedValue = num;
    }

    if (!postcode || !ukPostcodeRegex.test(postcode.trim())) {
      setPostcodeError('Please provide a valid UK collection postcode.');
      return;
    }

    if (!customer.fullName || !customer.phone || !customer.email) {
      if (setError) setError('Please complete your name, phone number, and email address.');
      return;
    }

    if (onSubmitHighValueEnquiry) {
      onSubmitHighValueEnquiry({
        mileage: Number(mileage),
        vehicleCondition: condition,
        photos,
        postcode: postcode.trim(),
        city: detectedCity,
        estimatedValue,
        customerExpectedValue,
        valuePreference,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <StepHeading number="2" title="High-Value Vehicle Valuation Form">
        Complete vehicle condition details & photos for high-value valuation.
      </StepHeading>

      {/* High Value Badge / Banner */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/90 p-5 text-amber-950 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 font-bold text-white shadow-sm">
            ⭐
          </div>
          <div>
            <h4 className="font-extrabold text-amber-900 text-base">
              High-Value Vehicle Detected ({vehicle.year})
            </h4>
            <p className="mt-1 text-sm text-amber-800 leading-relaxed">
              Vehicles manufactured after 2015 qualify for our specialized high-value appraisal.
            </p>
          </div>
        </div>
      </div>

      {/* Pre-populated Vehicle Information */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-200/80 pb-2">
          <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Retrieved Vehicle Details (Pre-filled)
          </h5>
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-[#0f7b4f]">
            ✓ UKVD Verified
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <div>
            <span className="block text-xs text-slate-500 font-medium">Registration</span>
            <strong className="font-mono text-slate-900 text-base">{data.registration || vehicle.registration}</strong>
          </div>
          <div>
            <span className="block text-xs text-slate-500 font-medium">Make & Model</span>
            <strong className="text-slate-900">{vehicle.make} {vehicle.model}</strong>
          </div>
          <div>
            <span className="block text-xs text-slate-500 font-medium">Year</span>
            <strong className="text-slate-900">{vehicle.year}</strong>
          </div>
          <div>
            <span className="block text-xs text-slate-500 font-medium">Fuel & Engine</span>
            <strong className="text-slate-900">{vehicle.fuelType || 'N/A'} {vehicle.engineSize || ''}</strong>
          </div>
        </div>
      </div>

      {/* Estimated Vehicle Value & Value Preference Options */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between border-b border-emerald-200/80 pb-3 mb-4">
          <div>
            <span className="text-xs uppercase tracking-wider font-extrabold text-slate-500">
              Estimated Vehicle Value
            </span>
            <div className="text-2xl font-black text-[#0f7b4f]">
              £{estimatedValue.toLocaleString('en-GB')}
            </div>
          </div>
          <span className="rounded-full bg-[#0f7b4f] px-3 py-1 text-xs font-extrabold text-white">
            System Estimate
          </span>
        </div>

        <label className="block text-sm font-bold text-slate-900 mb-3">
          Select Your Expected Value Option
        </label>

        <div className="space-y-3">
          {/* Option 1: Use estimated value */}
          <label
            onClick={() => handlePreferenceChange('ESTIMATED_VALUE')}
            className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition ${
              valuePreference === 'ESTIMATED_VALUE'
                ? 'border-[#0f7b4f] bg-white shadow-xs ring-2 ring-[#0f7b4f]/20'
                : 'border-slate-200 bg-white/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="valuePreference"
                value="ESTIMATED_VALUE"
                checked={valuePreference === 'ESTIMATED_VALUE'}
                onChange={() => handlePreferenceChange('ESTIMATED_VALUE')}
                className="h-4 w-4 text-[#0f7b4f] focus:ring-[#0f7b4f]"
              />
              <span className="text-sm font-bold text-slate-800">
                Use estimated value: <strong className="text-[#0f7b4f]">£{estimatedValue.toLocaleString('en-GB')}</strong>
              </span>
            </div>
          </label>

          {/* Option 2: Enter my own expected value */}
          <label
            onClick={() => handlePreferenceChange('CUSTOM_VALUE')}
            className={`flex flex-col rounded-xl border p-4 cursor-pointer transition ${
              valuePreference === 'CUSTOM_VALUE'
                ? 'border-[#0f7b4f] bg-white shadow-xs ring-2 ring-[#0f7b4f]/20'
                : 'border-slate-200 bg-white/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="valuePreference"
                value="CUSTOM_VALUE"
                checked={valuePreference === 'CUSTOM_VALUE'}
                onChange={() => handlePreferenceChange('CUSTOM_VALUE')}
                className="h-4 w-4 text-[#0f7b4f] focus:ring-[#0f7b4f]"
              />
              <span className="text-sm font-bold text-slate-800">
                I have a different amount in mind
              </span>
            </div>

            {valuePreference === 'CUSTOM_VALUE' && (
              <div className="mt-4 pt-3 border-t border-slate-100 pl-7" onClick={(e) => e.stopPropagation()}>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Your Expected Value (GBP £) *
                </label>
                <div className="relative max-w-xs">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500 font-extrabold">
                    £
                  </span>
                  <input
                    className={`${inputClass} pl-8 font-extrabold text-slate-900`}
                    type="text"
                    inputMode="numeric"
                    value={customValue}
                    onChange={handleCustomValueChange}
                    placeholder="e.g. 1400"
                    autoFocus
                    required
                  />
                </div>
                {customValueError && (
                  <p className="mt-1.5 text-xs text-red-600 font-semibold">{customValueError}</p>
                )}
              </div>
            )}
          </label>
        </div>
      </div>

      {/* Mileage Input */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <label className={labelClass}>
          Current Mileage (Miles) *
          <input
            className={inputClass}
            type="text"
            inputMode="numeric"
            value={mileage}
            onChange={handleMileageChange}
            placeholder="e.g. 45000"
            required
          />
        </label>
        {mileageError && <p className="mt-1 text-xs text-red-600 font-semibold">{mileageError}</p>}
      </div>

      {/* Vehicle Condition Selection */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <label className="block text-sm font-bold text-slate-900 mb-3">
          Vehicle Condition *
        </label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {VEHICLE_CONDITIONS.map((item) => {
            const isSelected = condition === item.value;
            return (
              <button
                type="button"
                key={item.value}
                onClick={() => {
                  setCondition(item.value);
                  update('vehicleCondition', item.value);
                }}
                className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition cursor-pointer ${
                  isSelected
                    ? 'border-[#0f7b4f] bg-emerald-50/70 shadow-xs ring-2 ring-[#0f7b4f]/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 font-extrabold text-slate-900 text-sm">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500 leading-snug">
                  {item.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Vehicle Photos Upload */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <label className="block text-sm font-bold text-slate-900 mb-1">
          Vehicle Photos (Optional)
        </label>
        <p className="text-xs text-slate-500 mb-3">
          Upload clear photos (front, rear, interior, any damage). Supported formats: JPG, JPEG, PNG, WEBP (Max 8 photos, 10MB each).
        </p>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50/60 p-6 transition hover:border-[#0f7b4f] hover:bg-emerald-50/30">
          <span className="text-3xl mb-2">📷</span>
          <span className="text-sm font-bold text-slate-700">Click to upload photos</span>
          <span className="text-xs text-slate-400 mt-1">or drag & drop files here</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handlePhotoUpload}
            className="hidden"
          />
        </label>

        {photoError && <p className="mt-2 text-xs text-red-600 font-semibold">{photoError}</p>}

        {photos.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-100">
                <img
                  src={photo.previewUrl}
                  alt={photo.name}
                  className="h-24 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white text-xs hover:bg-red-700 shadow-xs"
                  title="Remove photo"
                >
                  ✕
                </button>
                <div className="p-1.5 text-[10px] text-slate-600 truncate bg-white/90">
                  {photo.name} ({photo.size})
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Location / Postcode */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <label className={labelClass}>
          Collection UK Postcode *
          <input
            className={inputClass}
            value={postcode}
            onChange={handlePostcodeChange}
            placeholder="e.g. SW1A 1AA or M1 1AA"
            required
          />
        </label>
        {postcodeError && <p className="mt-1 text-xs text-red-600 font-semibold">{postcodeError}</p>}
        {detectedCity && detectedCity !== 'Other' && detectedCity !== 'Unassigned' && (
          <p className="mt-1.5 text-xs text-emerald-800 font-semibold">
            📍 Identified Collection Area: <strong>{detectedCity}</strong>
          </p>
        )}
      </div>

      {/* Contact Details */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
        <h4 className="text-sm font-extrabold text-slate-900 border-b pb-2">
          Your Contact Information
        </h4>
        <div className="grid gap-x-[18px] gap-y-3 sm:grid-cols-2">
          <label className={labelClass}>
            Full Name *
            <input
              className={inputClass}
              value={customer.fullName}
              onChange={(e) => updateCustomer('fullName', e.target.value)}
              placeholder="John Smith"
              required
            />
          </label>

          <label className={labelClass}>
            Phone Number *
            <input
              className={inputClass}
              type="tel"
              value={customer.phone}
              onChange={(e) => updateCustomer('phone', e.target.value)}
              placeholder="07123 456789"
              required
            />
          </label>
        </div>

        <label className={labelClass}>
          Email Address *
          <input
            className={inputClass}
            type="email"
            value={customer.email}
            onChange={(e) => updateCustomer('email', e.target.value)}
            placeholder="john@example.com"
            required
          />
        </label>
      </div>

      {error && <div className={alertErrorClass}>{error}</div>}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className={secondaryButtonClass}
          disabled={loading}
        >
          ← Change Registration
        </button>

        <button
          type="submit"
          className={primaryButtonClass}
          disabled={loading}
        >
          {loading ? 'Submitting…' : 'Submit High-Value Enquiry →'}
        </button>
      </div>
    </form>
  );
}
