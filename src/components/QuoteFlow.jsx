import { useState } from 'react';
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
  'Confirm',
  'Condition',
  'Your details',
  'Quote',
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
        Step {number} of 6
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
    setStep(2);
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

  const customerValid =
    data.customer.fullName.trim() &&
    data.customer.phone.trim() &&
    /\S+@\S+\.\S+/.test(data.customer.email) &&
    String(data.mileage).trim() &&
    Number(data.mileage) > 0 &&
    data.postcode.trim() &&
    data.customer.privacy &&
    data.customer.terms;

  const getQuote = async () => {
    setError('');

    if (!customerValid) {
      setError(
        'Please complete all required fields and accept the Privacy Policy and Terms and Conditions.',
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

      setStep(4);

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

    try {
      setLoading(true);

      const enquiry = await submitEnquiry(data);

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

  if (compact) {
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
              update('registration', event.target.value.toUpperCase())
            }
            placeholder="AB12 CDE"
            autoComplete="off"
          />
        </label>

        <label className={labelClass}>
          Collection postcode
          <input
            className={inputClass}
            value={data.postcode}
            onChange={(event) =>
              update('postcode', event.target.value.toUpperCase())
            }
            placeholder="SW1A 1AA"
            autoComplete="postal-code"
          />
        </label>

        <label className={labelClass}>
          Mileage
          <input
            className={inputClass}
            type="number"
            min="0"
            value={data.mileage}
            onChange={(event) => update('mileage', event.target.value)}
            placeholder="e.g. 85000"
          />
        </label>

        <div className="mb-[18px] flex items-center gap-2">
          <span className="mr-auto font-bold">Vehicle running?</span>

          <ChoiceButton
            selected={data.condition.isRunning === true}
            onClick={() => updateCondition('isRunning', true)}
          >
            Yes
          </ChoiceButton>

          <ChoiceButton
            negative
            selected={data.condition.isRunning === false}
            onClick={() => updateCondition('isRunning', false)}
          >
            No
          </ChoiceButton>
        </div>

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
    <div className="mx-auto max-w-[980px]">
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
                    update('registration', event.target.value.toUpperCase())
                  }
                  placeholder="AB12 CDE"
                  autoComplete="off"
                />
              </label>

              <label className={labelClass}>
                Collection postcode
                <input
                  className={inputClass}
                  value={data.postcode}
                  onChange={(event) =>
                    update('postcode', event.target.value.toUpperCase())
                  }
                  placeholder="SW1A 1AA"
                  autoComplete="postal-code"
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
            <StepHeading number="2" title="Is this your vehicle?">
              Check the details retrieved for {data.vehicle.registration}.
            </StepHeading>

            <div className="grid items-center gap-7 rounded-[18px] border border-slate-200 p-[26px] sm:grid-cols-[180px_1fr]">
              <div className="grid h-[120px] place-items-center rounded-[15px] bg-[#f7f8f3] text-6xl sm:h-[150px]">
                🚗
              </div>

              <div>
                <b className="mb-[15px] inline-block rounded-md bg-[#f6cf3c] px-3.5 py-[7px] font-mono tracking-[0.12em] text-[#111]">
                  {data.vehicle.registration}
                </b>

                <h3 className="mb-3.5 text-[1.18rem]">
                  {data.vehicle.make} {data.vehicle.model}
                </h3>

                <div className="grid gap-[15px] sm:grid-cols-2 lg:grid-cols-4">
                  <DetailItem label="Year">{data.vehicle.year}</DetailItem>
                  <DetailItem label="Fuel">{data.vehicle.fuelType}</DetailItem>
                  <DetailItem label="Engine">{data.vehicle.engineSize}</DetailItem>
                  <DetailItem label="Weight">
                    {data.vehicle.weightKg} kg
                  </DetailItem>
                </div>
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                className={primaryButtonClass}
                onClick={handleCorrectVehicle}
              >
                Yes, this is my vehicle
              </button>

              <button
                type="button"
                className={dangerButtonClass}
                onClick={handleWrongVehicle}
              >
                No, this is not my vehicle
              </button>

              <button
                type="button"
                className={secondaryButtonClass}
                onClick={handleEditRegistration}
              >
                Edit registration
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <StepHeading number="3" title="Tell us about its condition">
              Accurate answers help us provide a more reliable estimate.
            </StepHeading>

            <div className="flex flex-col gap-3">
              {questions.map(([key, question]) => (
                <div
                  className="flex flex-col gap-[15px] rounded-[13px] border border-slate-200 px-[19px] py-[17px] sm:flex-row sm:items-center sm:justify-between"
                  key={key}
                >
                  <b>{question}</b>

                  <div className="flex gap-2">
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

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => {
                  setError('');
                  setStep(1);
                }}
              >
                Back
              </button>

              <button
                type="button"
                className={primaryButtonClass}
                disabled={!conditionValid}
                onClick={() => {
                  setError('');
                  setStep(3);
                }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <StepHeading number="4" title="Your contact details">
              We use these details to send the enquiry and arrange collection.
            </StepHeading>

            <div className="grid gap-x-[18px] sm:grid-cols-2">
              <label className={labelClass}>
                Full name *
                <input
                  className={inputClass}
                  value={data.customer.fullName}
                  onChange={(event) =>
                    updateCustomer('fullName', event.target.value)
                  }
                  autoComplete="name"
                />
              </label>

              <label className={labelClass}>
                Phone number *
                <input
                  className={inputClass}
                  type="tel"
                  value={data.customer.phone}
                  onChange={(event) =>
                    updateCustomer('phone', event.target.value)
                  }
                  autoComplete="tel"
                />
              </label>

              <label className={labelClass}>
                Email address *
                <input
                  className={inputClass}
                  type="email"
                  value={data.customer.email}
                  onChange={(event) =>
                    updateCustomer('email', event.target.value)
                  }
                  autoComplete="email"
                />
              </label>

              <label className={labelClass}>
                Mileage *
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  value={data.mileage}
                  onChange={(event) => update('mileage', event.target.value)}
                />
              </label>

              <label className={labelClass}>
                Collection postcode *
                <input
                  className={inputClass}
                  value={data.postcode}
                  onChange={(event) =>
                    update('postcode', event.target.value.toUpperCase())
                  }
                  autoComplete="postal-code"
                />
              </label>

              <label className={labelClass}>
                Preferred contact
                <select
                  className={inputClass}
                  value={data.customer.preferredContact}
                  onChange={(event) =>
                    updateCustomer('preferredContact', event.target.value)
                  }
                >
                  <option value="phone">Phone</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                </select>
              </label>

              <label className={`${labelClass} sm:col-span-2`}>
                Additional notes
                <textarea
                  className={inputClass}
                  rows="4"
                  value={data.customer.notes}
                  onChange={(event) =>
                    updateCustomer('notes', event.target.value)
                  }
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
                Back
              </button>

              <button
                type="button"
                className={primaryButtonClass}
                onClick={getQuote}
                disabled={loading}
              >
                {loading ? 'Calculating…' : 'Calculate My Quote'}
              </button>
            </div>
          </div>
        )}

        {step === 4 && data.quote && data.vehicle && (
          <div className="w-full">
            <StepHeading number="5" title="Your estimated scrap quote" center>
              Based on your vehicle details and the condition information
              provided.
            </StepHeading>

            <div className="mb-7 rounded-[18px] border border-[#c9e8d8] bg-[#edf7f2] px-4 py-6 text-center sm:px-5 sm:py-7">
              <span className="mb-1.5 block text-[15px] font-bold text-[#175c40]">
                Estimated scrap value
              </span>

              <div className="my-2 text-[clamp(42px,7vw,64px)] font-extrabold leading-none text-[#0f7b4f]">
                £{data.quote.finalValue}
              </div>

              <p className="mt-3 mb-0 text-slate-600">
                This estimated quote is valid for{' '}
                <strong>{data.quote.validUntil}</strong>.
              </p>
            </div>

            <div className="mt-7">
              <div className="mb-3.5">
                <h3 className="mb-[5px] text-[21px] text-gray-900">
                  Vehicle summary
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

                    <h3 className="mt-2.5 mb-0 text-[1.18rem]">
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
                <h3 className="mb-[5px] text-[21px] text-gray-900">
                  Quote breakdown
                </h3>
                <p className="m-0 text-sm text-slate-500">
                  A complete breakdown of how your estimate was calculated.
                </p>
              </div>

              <div className="mx-auto max-w-[650px] rounded-2xl border border-slate-200 px-[22px] py-2">
                <div className="flex justify-between gap-5 border-b border-slate-200 py-3.5">
                  <span className="text-slate-500">Estimated scrap value</span>
                  <b>£{data.quote.baseValue}</b>
                </div>

                <div className="flex justify-between gap-5 border-b border-slate-200 py-3.5">
                  <span className="text-slate-500">Price per tonne used</span>
                  <b>£{data.quote.pricePerTonne}</b>
                </div>

                <div className="flex justify-between gap-5 border-b border-slate-200 py-3.5">
                  <span className="text-slate-500">Vehicle weight</span>
                  <b>{data.vehicle.weightKg} kg</b>
                </div>

                <div className="mt-2 flex justify-between gap-5 border-b border-gray-200 bg-gray-50 py-3.5">
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

                <div className="mt-2 flex justify-between gap-5 border-b border-gray-200 bg-gray-50 py-3.5">
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

                <div className="flex justify-between gap-5 py-3.5 text-lg">
                  <span className="text-slate-500">Final estimated quote</span>
                  <b>£{data.quote.finalValue}</b>
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
                <p className="m-0 leading-[1.6] text-amber-900">
                  Your estimated quote is valid for {data.quote.validUntil}.
                  Submit your enquiry before this period ends to allow our team
                  to confirm the offer.
                </p>
              </div>
            </div>

            <div className={`${alertInfoClass} mt-[18px] leading-[1.6]`}>
              <strong>Important:</strong> This is an estimated scrap value. The
              final price may change following vehicle inspection and
              confirmation that the registration, mileage, vehicle condition,
              missing parts and other submitted details are accurate.
            </div>

            {error && <div className={alertErrorClass}>{error}</div>}

            <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap sm:justify-center">
              <button
                type="button"
                className={`${primaryButtonClass} min-w-[170px]`}
                onClick={submit}
                disabled={loading}
              >
                {loading ? 'Submitting enquiry…' : 'Submit My Enquiry'}
              </button>

              <a
                className={`${secondaryButtonClass} min-w-[170px]`}
                href="tel:08001234567"
              >
                Call Us
              </a>

              <a
                className={`${whatsAppButtonClass} min-w-[170px]`}
                href="https://wa.me/447700900000"
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            </div>
          </div>
        )}

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

              <a className={secondaryButtonClass} href="tel:08001234567">
                Call Us
              </a>

              <a
                className={whatsAppButtonClass}
                href="https://wa.me/447700900000"
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
