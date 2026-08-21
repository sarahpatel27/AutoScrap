import StepHeading from './StepHeading';
import ChoiceButton from './ChoiceButton';
import {
  questions,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  alertErrorClass,
} from './constants';

export default function Step1ConditionForm({
  data,
  update,
  updateCondition,
  step2Valid,
  loading,
  error,
  setError,
  setStep,
  handleCalculateQuoteFromCondition,
  handleEditRegistration,
}) {
  return (
    <div>
      <StepHeading number="2" title="Vehicle details & condition">
        We retrieved your vehicle information from UKVD API. Please answer the condition questions below.
      </StepHeading>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
        {/* Left Column: Questionnaire & Mileage (order-2 on mobile, order-1 on lg) */}
        <div className="flex flex-col gap-4 order-2 lg:order-1">
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
            <h3 className="text-base font-extrabold text-slate-900 mb-1">
              Vehicle Condition Questionnaire
            </h3>
            <p className="text-xs text-slate-500 m-0 leading-relaxed">
              Please answer all questions accurately to receive an accurate scrap estimate.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {questions.map(([key, question]) => (
              <div
                className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs hover:border-slate-300 transition"
                key={key}
              >
                <span className="text-sm font-bold text-slate-800">{question}</span>

                <div className="flex gap-2 shrink-0">
                  <ChoiceButton
                    selected={data.condition[key] === true}
                    onClick={() => updateCondition(key, true)}
                  >
                    Yes
                  </ChoiceButton>

                  <ChoiceButton
                    negative
                    selected={data.condition[key] === false}
                    onClick={() => updateCondition(key, false)}
                  >
                    No
                  </ChoiceButton>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <label className="flex flex-col gap-1.5 text-sm font-bold text-slate-800">
              <span className="flex items-center justify-between">
                <span>Vehicle Mileage</span>
                <span className="text-xs font-medium text-slate-500">Optional</span>
              </span>
              <input
                className={inputClass}
                type="text"
                inputMode="numeric"
                value={data.mileage}
                onChange={(event) =>
                  update('mileage', event.target.value.replace(/\D/g, ''))
                }
                placeholder="e.g. 75000"
                maxLength={7}
              />
            </label>
          </div>

          {error && <div className={alertErrorClass}>{error}</div>}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() => {
                setError('');
                setStep(0);
              }}
            >
              Back
            </button>

            <button
              type="button"
              className={`${primaryButtonClass} flex-1`}
              disabled={!step2Valid || loading}
              onClick={handleCalculateQuoteFromCondition}
            >
              {loading ? 'Calculating quote…' : 'Calculate My Quote →'}
            </button>
          </div>
        </div>

        {/* Right Column: UKVD API Vehicle Display (order-1 on mobile, order-2 on lg) */}
        <div className="rounded-[22px] border border-slate-200 bg-white p-6 text-slate-900 shadow-xl shadow-slate-100 lg:sticky lg:top-6 order-1 lg:order-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-extrabold text-[#0f7b4f]">
              <span className="h-2 w-2 rounded-full bg-[#0f7b4f] animate-pulse" />
              UKVD API Data
            </span>

            <div className="inline-flex items-center overflow-hidden rounded-md border border-amber-300 bg-[#f6cf3c] font-mono text-sm font-black text-black shadow-xs">
              <span className="bg-[#003399] px-2 py-1 text-[10px] font-bold text-white flex flex-col items-center leading-none">
                <span className="text-yellow-300 text-[8px]">★</span>
                UK
              </span>
              <span className="px-3 py-1 tracking-[0.14em]">
                {data.vehicle.registration}
              </span>
            </div>
          </div>

          <div className="my-5 flex items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#0f7b4f] text-white text-2xl shadow-md shadow-emerald-700/20">
              🚗
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-500">
                Vehicle Identified
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 m-0 leading-snug">
                {data.vehicle.make} <span className="text-[#0f7b4f]">{data.vehicle.model}</span>
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 my-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 transition hover:border-slate-300 hover:bg-slate-100/70">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Year
              </span>
              <span className="mt-1 flex items-center gap-1.5 text-lg font-black text-slate-900">
                📅 {data.vehicle.year}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 transition hover:border-slate-300 hover:bg-slate-100/70">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Weight
              </span>
              <span className="mt-1 flex items-center gap-1.5 text-lg font-black text-slate-900">
                ⚖️ {data.vehicle.weightKg} kg
              </span>
            </div>
          </div>

          <div className="mt-5 text-center border-t border-slate-100 pt-4">
            <button
              type="button"
              className="text-xs font-bold text-slate-500 hover:text-[#0f7b4f] underline transition cursor-pointer"
              onClick={handleEditRegistration}
            >
              Not your vehicle? Search another registration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
