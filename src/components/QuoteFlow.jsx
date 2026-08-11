import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  calculateQuote,
  lookupVehicle,
  submitEnquiry,
} from '../services/mockApi';

const initial = {
  registration: '',
  postcode: '',
  mileage: '',
  vehicle: null,

  condition: {
    isRunning: null,
    hasFourWheels: null,
    isComplete: null,
    hasCatalyticConverter: null,
    hasAlloyWheels: null,
  },

  customer: {
    fullName: '',
    phone: '',
    email: '',
    preferredContact: 'phone',
    notes: '',
    privacy: false,
    terms: false,
  },

  bank: {
    accountName: '',
    sortCode: '',
    accountNumber: '',
    bankName: '',
  },

  quote: null,
  enquiry: null,
};

const questions = [
  ['isRunning', 'Is the vehicle running?'],
  ['hasFourWheels', 'Does it have all four wheels?'],
  ['isComplete', 'Is the vehicle complete?'],
  ['hasCatalyticConverter', 'Is the catalytic converter present?'],
  ['hasAlloyWheels', 'Does the vehicle have alloy wheels?'],
];

const steps = [
  'Vehicle',
  'Condition',
  'Estimated Quote',
  'Your details',
  'Bank details',
  'Success',
];

const labelClass = 'mb-[15px] flex flex-col gap-[7px] text-sm font-bold';
const inputClass =
  'rounded-[10px] border border-slate-200 bg-white px-3.5 py-[13px] outline-none focus:border-[#0f7b4f] focus:shadow-[0_0_0_3px_rgba(15,123,79,0.1)]';
const regInputClass = `rounded-[10px] border border-slate-200 px-3.5 py-[13px] outline-none focus:border-[#0f7b4f] focus:shadow-[0_0_0_3px_rgba(15,123,79,0.1)] border-[#d1aa16] bg-[#f8ce3d] font-mono font-black uppercase tracking-[0.13em] text-[#111]`;
const primaryButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#0f7b4f] px-[22px] py-3.5 font-extrabold text-white shadow-[0_10px_25px_rgba(15,123,79,0.23)] transition hover:-translate-y-0.5 hover:bg-[#075b3a] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0';
const secondaryButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-[22px] py-3.5 font-extrabold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0';
const dangerButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-600 bg-red-600 px-[22px] py-3.5 font-extrabold text-white transition hover:-translate-y-0.5 hover:border-red-700 hover:bg-red-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-red-600/25 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0';
const whatsAppButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#25d366] px-[22px] py-3.5 font-extrabold text-[#082d1c] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0';
const alertErrorClass =
  'my-[15px] rounded-[10px] border border-red-200 bg-red-50 px-[15px] py-[13px] text-sm text-red-700';
const alertInfoClass =
  'my-[15px] rounded-[10px] border border-emerald-200 bg-emerald-50 px-[15px] py-[13px] text-sm text-emerald-900';

function StepHeading({ number, title, children, center = false }) {
  return (
    <div className={`mb-[30px] ${center ? 'text-center' : ''}`}>
      <span className="text-xs font-extrabold uppercase tracking-[0.13em] text-[#0f7b4f]">
        Step {number} of {steps.length}
      </span>
      <h2 className="mt-2 mb-3.5 text-[clamp(2rem,4vw,3.15rem)] leading-tight">
        {title}
      </h2>
      <p className="m-0 text-slate-500">{children}</p>
    </div>
  );
}

function ChoiceButton({ selected, negative = false, children, ...props }) {
  return (
    <button
      className={`cursor-pointer rounded-lg border px-4 py-2 font-extrabold ${
        selected
          ? negative
            ? 'border-orange-800 bg-orange-800 text-white'
            : 'border-[#0f7b4f] bg-[#0f7b4f] text-white'
          : 'border-slate-200 bg-white text-slate-950'
      }`}
      type="button"
      {...props}
    >
      {children}
    </button>
  );
}

function DetailItem({ label, children }) {
  return (
    <span className="flex flex-col">
      <small className="text-slate-500">{label}</small>
      {children}
    </span>
  );
}

export default function QuoteFlow({ compact = false }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const containerRef = useRef(null);

  useEffect(() => {
    if (step > 0 && containerRef.current) {
      const yOffset = -85;
      const element = containerRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  }, [step]);

  useEffect(() => {
    const regParam = searchParams.get('reg');
    const postcodeParam = searchParams.get('postcode');

    if (regParam && postcodeParam && !compact) {
      const formattedReg = regParam.trim().toUpperCase();
      const formattedPostcode = postcodeParam.trim().toUpperCase();

      setData((prev) => ({
        ...prev,
        registration: formattedReg,
        postcode: formattedPostcode,
      }));

      (async () => {
        try {
          setLoading(true);
          const vehicle = await lookupVehicle(formattedReg);
          setData((prev) => ({
            ...prev,
            registration: formattedReg,
            postcode: formattedPostcode,
            vehicle,
            quote: null,
            enquiry: null,
          }));
          setStep(1);
        } catch (err) {
          setError(
            err?.message ||
              'We could not retrieve your vehicle. Please try again.',
          );
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [searchParams, compact]);

  const update = (key, value) => {
    setData((previousData) => ({
      ...previousData,
      [key]: value,
    }));
  };

  const updateCustomer = (key, value) => {
    setData((previousData) => ({
      ...previousData,
      customer: {
        ...previousData.customer,
        [key]: value,
      },
    }));
  };

  const updateBank = (key, value) => {
    setData((previousData) => ({
      ...previousData,
      bank: {
        ...previousData.bank,
        [key]: value,
      },
    }));
  };

  const updateCondition = (key, value) => {
    setData((previousData) => ({
      ...previousData,
      condition: {
        ...previousData.condition,
        [key]: value,
      },
    }));
  };

  const findVehicle = async (event) => {
    event?.preventDefault();

    setError('');

    const registration = data.registration.trim();
    const postcode = data.postcode.trim();

    if (!registration) {
      setError('Please enter your vehicle registration.');
      return;
    }

    if (!postcode) {
      setError('Please enter your collection postcode.');
      return;
    }

    if (compact) {
      navigate(
        `/quote?reg=${encodeURIComponent(registration)}&postcode=${encodeURIComponent(postcode)}`,
      );
      return;
    }

    try {
      setLoading(true);

      const vehicle = await lookupVehicle(registration);

      setData((previousData) => ({
        ...previousData,
        registration,
        postcode,
        vehicle,
        quote: null,
        enquiry: null,
      }));

      setStep(1);
    } catch (err) {
      setError(
        err?.message ||
          'We could not retrieve your vehicle. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCorrectVehicle = () => {
    setError('');
    setStep(1);
  };

  const handleWrongVehicle = () => {
    setData((previousData) => ({
      ...previousData,
      vehicle: null,
      quote: null,
      enquiry: null,
    }));

    setError(
      "The retrieved vehicle doesn't match your car. Please check or update the registration number and search again.",
    );

    setStep(0);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleEditRegistration = () => {
    setData((previousData) => ({
      ...previousData,
      vehicle: null,
      quote: null,
      enquiry: null,
    }));

    setError('');
    setStep(0);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const conditionValid = Object.values(data.condition).every(
    (value) => typeof value === 'boolean',
  );

  const isMileageValid =
    String(data.mileage).trim() !== '' &&
    /^\d{1,7}$/.test(data.mileage.trim()) &&
    Number(data.mileage) >= 0;

  const step2Valid = conditionValid && isMileageValid;

  const isFullNameValid = /^[A-Za-z\s'\-]{2,60}$/.test(
    data.customer.fullName.trim(),
  );
  const isEmailValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
    data.customer.email.trim(),
  );
  const isPhoneValid =
    !data.customer.phone.trim() ||
    data.customer.phone.replace(/\D/g, '').length >= 9;

  const customerValid =
    isFullNameValid &&
    isEmailValid &&
    isPhoneValid &&
    data.customer.privacy &&
    data.customer.terms;

  const isAccountNameValid = /^[A-Za-z\s'\-]{2,60}$/.test(
    data.bank.accountName.trim(),
  );
  const isSortCodeValid = data.bank.sortCode.replace(/\D/g, '').length === 6;
  const isAccountNumberValid = /^\d{8}$/.test(
    data.bank.accountNumber.replace(/\D/g, ''),
  );

  const bankValid =
    isAccountNameValid && isSortCodeValid && isAccountNumberValid;

  const handleCalculateQuoteFromCondition = async () => {
    setError('');

    if (!step2Valid) {
      setError(
        'Please answer all 5 condition questions and enter a valid numeric mileage.',
      );
      return;
    }

    try {
      setLoading(true);

      const quote = await calculateQuote(data);

      setData((previousData) => ({
        ...previousData,
        quote,
      }));

      setStep(2);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (err) {
      setError(
        err?.message ||
          'We could not calculate your quote. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const submit = async () => {
    setError('');

    if (!bankValid) {
      setError(
        'Please provide a valid Account Holder Name (letters only), 6-digit Sort Code, and exactly 8-digit Account Number (numbers only) for your scrap payment.',
      );
      return;
    }

    try {
      setLoading(true);

      const formattedData = {
        ...data,
        customer: {
          ...data.customer,
          phone: data.customer.phone ? `+44 ${data.customer.phone.trim()}` : '',
        },
      };

      const enquiry = await submitEnquiry(formattedData);

      setData((previousData) => ({
        ...previousData,
        enquiry,
      }));

      setStep(5);

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } catch (err) {
      setError(
        err?.message ||
          'We could not submit your enquiry. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  if (compact && step === 0) {
    return (
      <form
        className="mx-auto w-full max-w-[620px] rounded-[20px] bg-white p-[22px] text-slate-950 shadow-[0_30px_80px_rgba(0,0,0,0.25)] sm:p-[30px]"
        onSubmit={findVehicle}
      >
        <h3 className="mb-3.5 text-[1.55rem]">Get an instant estimate</h3>

        <label className={labelClass}>
          Vehicle registration
          <input
            className={regInputClass}
            value={data.registration}
            onChange={(event) =>
              update(
                'registration',
                event.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, ''),
              )
            }
            placeholder="AB12 CDE"
            autoComplete="off"
            maxLength={10}
          />
        </label>

        <label className={labelClass}>
          Collection postcode
          <input
            className={inputClass}
            value={data.postcode}
            onChange={(event) =>
              update(
                'postcode',
                event.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, ''),
              )
            }
            placeholder="SW1A 1AA"
            autoComplete="postal-code"
            maxLength={10}
          />
        </label>

        {error && <div className={alertErrorClass}>{error}</div>}

        <button
          type="submit"
          className={`${primaryButtonClass} w-full`}
          disabled={loading}
        >
          {loading ? 'Finding vehicle…' : 'Get My Quote'}
        </button>

        <small className="mt-2.5 block text-center text-slate-500">
          No obligation. Your details are handled securely.
        </small>
      </form>
    );
  }

  return (
    <div ref={containerRef} className="mx-auto max-w-[980px]">
      <div className="relative mb-[26px] flex justify-between before:absolute before:top-5 before:right-[7%] before:left-[7%] before:h-0.5 before:bg-[#cfdbd4]">
        {steps.map((stepName, index) => (
          <div
            className="relative z-10 flex flex-col items-center gap-[7px]"
            key={stepName}
          >
            <span
              className={`grid h-[42px] w-[42px] place-items-center rounded-full border-[5px] border-[#f7f8f3] font-black ${
                index <= step
                  ? 'bg-[#0f7b4f] text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {index + 1}
            </span>
            <small className="hidden font-bold text-slate-500 sm:inline">
              {stepName}
            </small>
          </div>
        ))}
      </div>

      <div className="min-h-[480px] rounded-[22px] bg-white px-[18px] py-6 shadow-[0_18px_50px_rgba(13,52,37,0.11)] sm:p-10">
        {step === 0 && (
          <form onSubmit={findVehicle}>
            <StepHeading number="1" title="Find your vehicle">
              Enter your registration and collection postcode.
            </StepHeading>

            <div className="grid gap-x-[18px] sm:grid-cols-2">
              <label className={labelClass}>
                Vehicle registration
                <input
                  className={regInputClass}
                  value={data.registration}
                  onChange={(event) =>
                    update(
                      'registration',
                      event.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, ''),
                    )
                  }
                  placeholder="AB12 CDE"
                  autoComplete="off"
                  maxLength={10}
                />
              </label>

              <label className={labelClass}>
                Collection postcode
                <input
                  className={inputClass}
                  value={data.postcode}
                  onChange={(event) =>
                    update(
                      'postcode',
                      event.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, ''),
                    )
                  }
                  placeholder="SW1A 1AA"
                  autoComplete="postal-code"
                  maxLength={10}
                />
              </label>
            </div>

            {error && <div className={alertErrorClass}>{error}</div>}

            <button
              type="submit"
              className={primaryButtonClass}
              disabled={loading}
            >
              {loading ? 'Searching…' : 'Find My Vehicle'}
            </button>
          </form>
        )}

        {step === 1 && data.vehicle && (
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
                      <span className="text-xs font-semibold text-emerald-700">Required *</span>
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
              <div className="rounded-[22px] border border-slate-800 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl lg:sticky lg:top-6 order-1 lg:order-2">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    UKVD API Data
                  </span>

                  <div className="inline-flex items-center overflow-hidden rounded-md border border-amber-300 bg-[#f6cf3c] font-mono text-sm font-black text-black shadow-sm">
                    <span className="bg-[#003399] px-2 py-1 text-[10px] font-bold text-white flex flex-col items-center leading-none">
                      <span className="text-yellow-300 text-[8px]">★</span>
                      UK
                    </span>
                    <span className="px-3 py-1 tracking-[0.14em]">
                      {data.vehicle.registration}
                    </span>
                  </div>
                </div>

                <div className="my-5 flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xs">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl border border-emerald-400/30 bg-emerald-500/20 text-4xl shadow-inner">
                    🚗
                  </div>
                  <div>
                    <span className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400">
                      Vehicle Identified
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white m-0 leading-snug">
                      {data.vehicle.make} <span className="text-[#dff46b]">{data.vehicle.model}</span>
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 my-5">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs transition hover:bg-white/10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Year
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-lg font-black text-white">
                      📅 {data.vehicle.year}
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs transition hover:bg-white/10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Fuel
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-lg font-black text-white">
                      ⛽ {data.vehicle.fuelType}
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs transition hover:bg-white/10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Engine
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-lg font-black text-white">
                      ⚙️ {data.vehicle.engineSize}
                    </span>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-xs transition hover:bg-white/10">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Weight
                    </span>
                    <span className="mt-1 flex items-center gap-1.5 text-lg font-black text-white">
                      ⚖️ {data.vehicle.weightKg} kg
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-200 flex items-center gap-2">
                  <span className="text-base">✓</span>
                  <span>Vehicle record retrieved live from UKVD database.</span>
                </div>

                <div className="mt-5 text-center border-t border-white/10 pt-4">
                  <button
                    type="button"
                    className="text-xs font-bold text-slate-400 hover:text-white underline transition cursor-pointer"
                    onClick={handleEditRegistration}
                  >
                    Not your vehicle? Search another registration
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Estimated Scrap Quote Display */}
        {step === 2 && data.quote && data.vehicle && (
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
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                  });
                }}
              >
                Accept Quote & Enter Details →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Your Contact Details Form */}
        {step === 3 && (
          <div>
            <StepHeading number="4" title="Your contact details">
              Accepting estimate for {data.vehicle ? `${data.vehicle.make} ${data.vehicle.model}` : 'your vehicle'} (£{data.quote?.finalValue}). Please enter your contact details below.
            </StepHeading>

            {data.quote && (
              <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/80 p-4">
                <div>
                  <span className="text-xs font-extrabold uppercase text-emerald-800 tracking-wider">
                    Accepted Quote Estimate
                  </span>
                  <div className="text-2xl font-black text-[#0f7b4f]">
                    £{data.quote.finalValue}
                  </div>
                </div>
                <div className="text-right text-xs text-emerald-900 font-medium">
                  {data.vehicle?.registration} • {data.vehicle?.make} {data.vehicle?.model}
                </div>
              </div>
            )}

            <div className="grid gap-x-[18px] sm:grid-cols-2">
              <label className={`${labelClass} sm:col-span-2`}>
                Full name *
                <input
                  className={inputClass}
                  value={data.customer.fullName}
                  onChange={(event) =>
                    updateCustomer(
                      'fullName',
                      event.target.value.replace(/[^A-Za-z\s'\-]/g, ''),
                    )
                  }
                  placeholder="e.g. John Smith"
                  autoComplete="name"
                  maxLength={60}
                />
              </label>

              <label className={labelClass}>
                Phone number
                <div className="flex items-center rounded-[10px] border border-slate-200 bg-white overflow-hidden focus-within:border-[#0f7b4f] focus-within:shadow-[0_0_0_3px_rgba(15,123,79,0.1)]">
                  <span className="flex items-center gap-1.5 bg-slate-100 px-3.5 py-[13px] text-sm font-bold text-slate-700 border-r border-slate-200 shrink-0 select-none">
                    🇬🇧 +44
                  </span>
                  <input
                    className="w-full bg-transparent px-3.5 py-[13px] outline-none text-slate-950 font-medium"
                    type="tel"
                    inputMode="numeric"
                    value={data.customer.phone}
                    onChange={(event) => {
                      let digits = event.target.value.replace(/\D/g, '');
                      if (digits.startsWith('0')) {
                        digits = digits.slice(1);
                      }
                      updateCustomer('phone', digits.slice(0, 10));
                    }}
                    placeholder="7714 423293"
                    autoComplete="tel-national"
                    maxLength={11}
                  />
                </div>
              </label>

              <label className={labelClass}>
                Email address *
                <input
                  className={inputClass}
                  type="email"
                  value={data.customer.email}
                  onChange={(event) =>
                    updateCustomer('email', event.target.value.trim())
                  }
                  placeholder="e.g. john@example.com"
                  autoComplete="email"
                />
              </label>
            </div>

            <label className="my-2.5 flex cursor-pointer items-center gap-2 text-[#42534c]">
              <input
                className="m-0 shrink-0"
                type="checkbox"
                checked={data.customer.privacy}
                onChange={(event) =>
                  updateCustomer('privacy', event.target.checked)
                }
              />
              <span>I agree to the Privacy Policy.</span>
            </label>

            <label className="my-2.5 flex cursor-pointer items-center gap-2 text-[#42534c]">
              <input
                className="m-0 shrink-0"
                type="checkbox"
                checked={data.customer.terms}
                onChange={(event) =>
                  updateCustomer('terms', event.target.checked)
                }
              />
              <span>I agree to the Terms and Conditions.</span>
            </label>

            {error && <div className={alertErrorClass}>{error}</div>}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => {
                  setError('');
                  setStep(2);
                }}
              >
                Back to quote
              </button>

              <button
                type="button"
                className={`${primaryButtonClass} flex-1`}
                disabled={!customerValid}
                onClick={() => {
                  setError('');
                  setStep(4);
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                  });
                }}
              >
                Continue to Bank Details →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Bank Payout Details Form */}
        {step === 4 && (
          <div>
            <StepHeading number="5" title="Bank payout details">
              Under UK law (Scrap Metal Dealers Act), scrap payments are made via electronic bank transfer upon collection.
            </StepHeading>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-300/60 bg-emerald-50 p-4 text-emerald-950">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white text-xl">
                  🔒
                </span>
                <div>
                  <span className="block text-xs font-black uppercase tracking-wider text-emerald-800">
                    Secure 256-Bit Encrypted Transfer
                  </span>
                  <span className="text-sm font-semibold">
                    Your scrap payout (£{data.quote?.finalValue || '0'}) will be transferred directly to this account.
                  </span>
                </div>
              </div>
            </div>

            <div className="grid gap-x-[18px] sm:grid-cols-2">
              <label className={`${labelClass} sm:col-span-2`}>
                Account holder name *
                <input
                  className={inputClass}
                  value={data.bank.accountName}
                  onChange={(event) =>
                    updateBank(
                      'accountName',
                      event.target.value.replace(/[^A-Za-z\s'\-]/g, ''),
                    )
                  }
                  placeholder="Full name matching your bank account or ID"
                  autoComplete="name"
                  maxLength={60}
                />
              </label>

              <label className={labelClass}>
                Sort code * (6 digits)
                <input
                  className={inputClass}
                  type="text"
                  inputMode="numeric"
                  value={data.bank.sortCode}
                  onChange={(event) => {
                    const digits = event.target.value.replace(/\D/g, '').slice(0, 6);
                    let formatted = digits;
                    if (digits.length > 4) {
                      formatted = `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}`;
                    } else if (digits.length > 2) {
                      formatted = `${digits.slice(0, 2)}-${digits.slice(2)}`;
                    }
                    updateBank('sortCode', formatted);
                  }}
                  placeholder="e.g. 12-34-56"
                  maxLength={8}
                />
              </label>

              <label className={labelClass}>
                Account number * (8 digits)
                <input
                  className={inputClass}
                  type="text"
                  inputMode="numeric"
                  value={data.bank.accountNumber}
                  onChange={(event) =>
                    updateBank(
                      'accountNumber',
                      event.target.value.replace(/\D/g, '').slice(0, 8),
                    )
                  }
                  placeholder="e.g. 12345678"
                  maxLength={8}
                />
              </label>

              <label className={`${labelClass} sm:col-span-2`}>
                Bank or Building Society name (optional)
                <input
                  className={inputClass}
                  value={data.bank.bankName}
                  onChange={(event) =>
                    updateBank(
                      'bankName',
                      event.target.value.replace(/[^A-Za-z\s'&\-]/g, ''),
                    )
                  }
                  placeholder="e.g. Barclays, Monzo, Lloyds, HSBC"
                  maxLength={50}
                />
              </label>
            </div>

            <div className="my-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 leading-relaxed">
              <strong>Notice:</strong> Your bank details are encrypted and used solely by MyAutoScrap to execute your vehicle scrap payout. We will never share or store raw payment details outside secured transaction channels.
            </div>

            {error && <div className={alertErrorClass}>{error}</div>}

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => {
                  setError('');
                  setStep(3);
                }}
              >
                Back to contact details
              </button>

              <button
                type="button"
                className={`${primaryButtonClass} flex-1`}
                onClick={submit}
                disabled={loading || !bankValid}
              >
                {loading ? 'Submitting enquiry…' : 'Submit My Enquiry & Confirm Payout'}
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Success Confirmation */}
        {step === 5 && (
          <div className="px-0 py-5 text-center">
            <div className="mx-auto mb-6 grid h-[72px] w-[72px] place-items-center rounded-full bg-[#0f7b4f] text-[2.6rem] text-white">
              ✓
            </div>

            <span className="mb-4 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f7b4f]">
              Enquiry submitted
            </span>

            <h2 className="mb-3.5 text-[clamp(2rem,4vw,3.15rem)] leading-tight">
              Thank you
              {data.customer.fullName ? `, ${data.customer.fullName}` : ''}!
            </h2>

            <p className="text-slate-500">
              Your enquiry has been submitted successfully. Our team will
              contact you using your preferred contact method.
            </p>

            <div className="mx-auto my-6 grid max-w-[600px] gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col rounded-xl bg-[#f7f8f3] p-[18px]">
                <span className="text-xs text-slate-500">Enquiry reference</span>
                <b>{data.enquiry?.reference || 'Reference being generated'}</b>
              </div>

              <div className="flex flex-col rounded-xl bg-[#f7f8f3] p-[18px]">
                <span className="text-xs text-slate-500">Customer name</span>
                <b>{data.customer.fullName || 'Not provided'}</b>
              </div>

              <div className="flex flex-col rounded-xl bg-[#f7f8f3] p-[18px]">
                <span className="text-xs text-slate-500">
                  Vehicle registration
                </span>
                <b>
                  {data.vehicle?.registration ||
                    data.registration ||
                    'Not available'}
                </b>
              </div>

              <div className="flex flex-col rounded-xl bg-[#f7f8f3] p-[18px]">
                <span className="text-xs text-slate-500">Vehicle</span>
                <b>
                  {data.vehicle
                    ? `${data.vehicle.make} ${data.vehicle.model}`
                    : 'Not available'}
                </b>
              </div>

              <div className="flex flex-col rounded-xl bg-[#f7f8f3] p-[18px]">
                <span className="text-xs text-slate-500">Estimated quote</span>
                <b>
                  {data.quote?.finalValue !== undefined
                    ? `£${data.quote.finalValue}`
                    : 'Not available'}
                </b>
              </div>

              <div className="flex flex-col rounded-xl bg-[#f7f8f3] p-[18px]">
                <span className="text-xs text-slate-500">Preferred contact</span>
                <b>
                  {data.customer.preferredContact
                    ? data.customer.preferredContact.charAt(0).toUpperCase() +
                      data.customer.preferredContact.slice(1)
                    : 'Phone'}
                </b>
              </div>
            </div>

            <div className={alertInfoClass}>
              Your enquiry has been received. A member of the MyAutoScrap team
              will contact you shortly to confirm your vehicle details, final
              price and collection.
            </div>

            <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap sm:justify-center">
              <a className={primaryButtonClass} href="/">
                Back to homepage
              </a>

              <a className={secondaryButtonClass} href="tel:+447714423293">
                Call Us
              </a>

              <a
                className={whatsAppButtonClass}
                href="https://wa.me/447714423293"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
