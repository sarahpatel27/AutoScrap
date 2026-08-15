import { useState } from 'react';
import StepHeading from './StepHeading';
import DetailItem from './DetailItem';
import {
  primaryButtonClass,
  secondaryButtonClass,
  alertErrorClass,
} from './constants';

export default function Step2QuoteDisplay({
  data,
  error,
  setError,
  setStep,
}) {
  const [imageError, setImageError] = useState(false);

  const vehicle = data.vehicle || {};
  const hasImage = vehicle.imageUrl && !imageError;

  return (
    <div className="w-full">
      <StepHeading number="2" title="Estimated Value">
        Based on your vehicle weight and live UK scrap rates.
      </StepHeading>

      <div className="-mt-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-[22px]">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            {hasImage ? (
              <img
                src={vehicle.imageUrl}
                alt={`${vehicle.make || ''} ${vehicle.model || ''}`}
                onError={() => setImageError(true)}
                className="h-[100px] w-[140px] shrink-0 rounded-[14px]  object-contain "
              />
            ) : (
              <div className="grid h-[62px] w-[62px] shrink-0 place-items-center rounded-[14px] bg-[#edf7f2] text-3xl">
                🚗
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="mb-1.5 inline-flex items-center overflow-hidden rounded-md border border-amber-300 bg-[#f6cf3c] font-mono text-sm font-black text-black shadow-xs">
                <span className="bg-[#003399] px-2 py-1 text-[10px] font-bold text-white flex flex-col items-center leading-none select-none">
                  <span className="text-yellow-300 text-[8px]">★</span>
                  UK
                </span>
                <span className="px-3 py-1 tracking-[0.14em]">
                  {vehicle.registration}
                </span>
              </div>

              <h3 className="mt-1 mb-1 text-[1.25rem] font-extrabold text-slate-900 leading-tight">
                {vehicle.year ? `${vehicle.year} ` : ''}{vehicle.make} {vehicle.model}
              </h3>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-xs font-semibold text-slate-600">
                {vehicle.fuelType && <span>{vehicle.fuelType}</span>}
                {vehicle.engineSize && <span>• {vehicle.engineSize}</span>}
                {vehicle.weightKg && (
                  <span>
                    • Kerb Weight: {vehicle.weightKg} kg ({(vehicle.weightKg / 1000).toFixed(2)} tonnes)
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-[22px] border border-[#c9e8d8] bg-linear-to-b from-[#edf7f2] to-white p-6 text-center shadow-sm sm:p-8">
        <span className="mb-1.5 block text-xs uppercase tracking-wider font-extrabold text-[#175c40]">
          Instant Estimated Scrap Value
        </span>

        <div className="my-2 text-[clamp(44px,8vw,68px)] font-black leading-none text-[#0f7b4f]">
          £{data.quote.finalValue}
        </div>
      </div>

      {error && <div className={alertErrorClass}>{error}</div>}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          className={`${primaryButtonClass} min-w-[220px]`}
          onClick={() => {
            setError('');
            setStep(2);
          }}
        >
          Accept £{data.quote.finalValue} and Arrange a Collection
        </button>
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={() => {
            setError('');
            setStep(0);
          }}
        >
          Back to vehicle search
        </button>
      </div>
    </div>
  );
}
