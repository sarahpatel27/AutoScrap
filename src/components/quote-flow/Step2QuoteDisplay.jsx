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
  return (
    <div className="w-full">
      <StepHeading number="3" title="Your estimated scrap quote" center>
        Based on your vehicle specifications and condition information provided.
      </StepHeading>

      <div className="mb-7 rounded-[22px] border border-[#c9e8d8] bg-linear-to-b from-[#edf7f2] to-white p-6 text-center shadow-sm sm:p-8">
        <span className="mb-1.5 block text-xs uppercase tracking-wider font-extrabold text-[#175c40]">
          Instant Estimated Scrap Value
        </span>

        <div className="my-2 text-[clamp(44px,8vw,68px)] font-black leading-none text-[#0f7b4f]">
          £{data.quote.finalValue}
        </div>

        <p className="mt-3 mb-0 text-sm font-medium text-slate-600">
          This estimate is valid for{' '}
          <strong className="text-slate-900">{data.quote.validUntil}</strong>.
        </p>
      </div>

      <div className="mt-7">
        <div className="mb-3.5">
          <h3 className="mb-[5px] text-[21px] font-bold text-gray-900">
            Vehicle Summary
          </h3>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-[22px]">
          <div className="flex items-start gap-4 border-b border-gray-200 pb-[18px] sm:items-center">
            <div className="grid h-[62px] w-[62px] shrink-0 place-items-center rounded-[14px] bg-[#edf7f2] text-3xl">
              🚗
            </div>

            <div>
              <b className="mb-[15px] inline-block rounded-md bg-[#f6cf3c] px-3.5 py-[7px] font-mono tracking-[0.12em] text-[#111]">
                {data.vehicle.registration}
              </b>

              <h3 className="mt-2.5 mb-0 text-[1.18rem] font-extrabold text-slate-900">
                {data.vehicle.make} {data.vehicle.model}
              </h3>
            </div>
          </div>

          <div className="mt-5 grid gap-[15px] sm:grid-cols-2 lg:grid-cols-4">
            <DetailItem label="Registration">
              {data.vehicle.registration}
            </DetailItem>
            <DetailItem label="Make">{data.vehicle.make}</DetailItem>
            <DetailItem label="Model">{data.vehicle.model}</DetailItem>
            <DetailItem label="Year">{data.vehicle.year}</DetailItem>
            <DetailItem label="Fuel type">
              {data.vehicle.fuelType}
            </DetailItem>
            <DetailItem label="Engine size">
              {data.vehicle.engineSize}
            </DetailItem>
            <DetailItem label="Vehicle weight">
              {data.vehicle.weightKg} kg
            </DetailItem>
            <DetailItem label="Mileage">
              {Number(data.mileage).toLocaleString()} miles
            </DetailItem>
          </div>
        </div>
      </div>

      <div className="mt-7">
        <div className="mb-3.5">
          <h3 className="mb-[5px] text-[21px] font-bold text-gray-900">
            Quote Breakdown
          </h3>
          <p className="m-0 text-sm text-slate-500">
            A transparent breakdown of how your scrap value was calculated.
          </p>
        </div>

        <div className="mx-auto max-w-[650px] rounded-2xl border border-slate-200 px-[22px] py-2 bg-white">
          <div className="flex justify-between gap-5 border-b border-slate-200 py-3.5">
            <span className="text-slate-500">Base scrap value</span>
            <b>£{data.quote.baseValue}</b>
          </div>

          <div className="flex justify-between gap-5 border-b border-slate-200 py-3.5">
            <span className="text-slate-500">Scrap price per tonne</span>
            <b>£{data.quote.pricePerTonne}</b>
          </div>

          <div className="flex justify-between gap-5 border-b border-slate-200 py-3.5">
            <span className="text-slate-500">Vehicle weight</span>
            <b>{data.vehicle.weightKg} kg</b>
          </div>

          <div className="mt-2 flex justify-between gap-5 border-b border-gray-200 bg-gray-50 px-3 py-2.5 rounded-md">
            <span className="text-sm font-extrabold text-gray-900">
              Bonuses applied
            </span>
          </div>

          {data.quote.bonuses?.length > 0 ? (
            data.quote.bonuses.map((bonus) => (
              <div
                className="flex justify-between gap-5 border-b border-slate-200 py-3.5"
                key={bonus.name}
              >
                <span className="text-slate-500">{bonus.name}</span>
                <b className="text-[#0f7b4f]">+£{bonus.amount}</b>
              </div>
            ))
          ) : (
            <div className="flex justify-between gap-5 border-b border-slate-200 py-3.5 text-slate-500">
              <span>No bonuses applied</span>
              <b>£0</b>
            </div>
          )}

          <div className="mt-2 flex justify-between gap-5 border-b border-gray-200 bg-gray-50 px-3 py-2.5 rounded-md">
            <span className="text-sm font-extrabold text-gray-900">
              Deductions applied
            </span>
          </div>

          {data.quote.deductions?.length > 0 ? (
            data.quote.deductions.map((deduction) => (
              <div
                className="flex justify-between gap-5 border-b border-slate-200 py-3.5"
                key={deduction.name}
              >
                <span className="text-slate-500">{deduction.name}</span>
                <b className="text-red-700">−£{deduction.amount}</b>
              </div>
            ))
          ) : (
            <div className="flex justify-between gap-5 border-b border-slate-200 py-3.5 text-slate-500">
              <span>No deductions applied</span>
              <b>£0</b>
            </div>
          )}

          <div className="flex justify-between gap-5 py-3.5 text-lg font-black">
            <span className="text-slate-900">Final estimated quote</span>
            <b className="text-[#0f7b4f]">£{data.quote.finalValue}</b>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col items-start gap-3.5 rounded-[14px] border border-amber-200 bg-amber-50 p-[18px] sm:flex-row">
        <div className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-full bg-amber-100">
          ⏱
        </div>

        <div>
          <strong className="mb-1 block text-amber-800">
            Quote validity
          </strong>
          <p className="m-0 leading-[1.6] text-amber-900 text-sm">
            Your estimated quote is valid for {data.quote.validUntil}.
            Click <strong>Accept Quote & Enter Details</strong> to proceed with your enquiry.
          </p>
        </div>
      </div>

      {error && <div className={alertErrorClass}>{error}</div>}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={() => {
            setError('');
            setStep(1);
          }}
        >
          Back to condition
        </button>

        <button
          type="button"
          className={`${primaryButtonClass} min-w-[220px]`}
          onClick={() => {
            setError('');
            setStep(3);
          }}
        >
          Accept Quote & Enter Details →
        </button>
      </div>
    </div>
  );
}
