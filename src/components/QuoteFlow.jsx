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
  [
    'hasCatalyticConverter',
    'Is the catalytic converter present?',
  ],
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
      <form className="hero-form" onSubmit={findVehicle}>
        <h3>Get an instant estimate</h3>

        <label>
          Vehicle registration
          <input
            className="reg-input"
            value={data.registration}
            onChange={(event) =>
              update(
                'registration',
                event.target.value.toUpperCase(),
              )
            }
            placeholder="AB12 CDE"
            autoComplete="off"
          />
        </label>

        <label>
          Collection postcode
          <input
            value={data.postcode}
            onChange={(event) =>
              update(
                'postcode',
                event.target.value.toUpperCase(),
              )
            }
            placeholder="SW1A 1AA"
            autoComplete="postal-code"
          />
        </label>

        <label>
          Mileage
          <input
            type="number"
            min="0"
            value={data.mileage}
            onChange={(event) =>
              update('mileage', event.target.value)
            }
            placeholder="e.g. 85000"
          />
        </label>

        <div className="inline-choice">
          <span>Vehicle running?</span>

          <button
            type="button"
            className={
              data.condition.isRunning === true
                ? 'selected'
                : ''
            }
            onClick={() =>
              updateCondition('isRunning', true)
            }
          >
            Yes
          </button>

          <button
            type="button"
            className={
              data.condition.isRunning === false
                ? 'selected no'
                : ''
            }
            onClick={() =>
              updateCondition('isRunning', false)
            }
          >
            No
          </button>
        </div>

        {error && (
          <div className="alert error">{error}</div>
        )}

        <button
          type="submit"
          className="btn btn-primary btn-block"
          disabled={loading}
        >
          {loading
            ? 'Finding vehicle…'
            : 'Get My Quote'}
        </button>

        <small>
          No obligation. Your details are handled securely.
        </small>
      </form>
    );
  }

  return (
    <div className="quote-shell">
      <div className="progress">
        {steps.map((stepName, index) => (
          <div
            className={
              index <= step
                ? 'progress-step done'
                : 'progress-step'
            }
            key={stepName}
          >
            <span>{index + 1}</span>
            <small>{stepName}</small>
          </div>
        ))}
      </div>

      <div className="quote-card">
        {step === 0 && (
          <form onSubmit={findVehicle}>
            <div className="step-heading">
              <span>Step 1 of 6</span>
              <h2>Find your vehicle</h2>
              <p>
                Enter your registration and collection
                postcode.
              </p>
            </div>

            <div className="form-grid two">
              <label>
                Vehicle registration
                <input
                  className="reg-input"
                  value={data.registration}
                  onChange={(event) =>
                    update(
                      'registration',
                      event.target.value.toUpperCase(),
                    )
                  }
                  placeholder="AB12 CDE"
                  autoComplete="off"
                />
              </label>

              <label>
                Collection postcode
                <input
                  value={data.postcode}
                  onChange={(event) =>
                    update(
                      'postcode',
                      event.target.value.toUpperCase(),
                    )
                  }
                  placeholder="SW1A 1AA"
                  autoComplete="postal-code"
                />
              </label>
            </div>

            {error && (
              <div className="alert error">{error}</div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading
                ? 'Searching…'
                : 'Find My Vehicle'}
            </button>
          </form>
        )}

        {step === 1 && data.vehicle && (
          <div>
            <div className="step-heading">
              <span>Step 2 of 6</span>
              <h2>Is this your vehicle?</h2>
              <p>
                Check the details retrieved for{' '}
                {data.vehicle.registration}.
              </p>
            </div>

            <div className="vehicle-card">
              <div className="vehicle-visual">🚗</div>

              <div>
                <b className="plate">
                  {data.vehicle.registration}
                </b>

                <h3>
                  {data.vehicle.make}{' '}
                  {data.vehicle.model}
                </h3>

                <div className="detail-grid">
                  <span>
                    <small>Year</small>
                    {data.vehicle.year}
                  </span>

                  <span>
                    <small>Fuel</small>
                    {data.vehicle.fuelType}
                  </span>

                  <span>
                    <small>Engine</small>
                    {data.vehicle.engineSize}
                  </span>

                  <span>
                    <small>Weight</small>
                    {data.vehicle.weightKg} kg
                  </span>
                </div>
              </div>
            </div>

            <div className="actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCorrectVehicle}
              >
                Yes, this is my vehicle
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={handleWrongVehicle}
              >
                No, this is not my vehicle
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleEditRegistration}
              >
                Edit registration
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="step-heading">
              <span>Step 3 of 6</span>
              <h2>Tell us about its condition</h2>
              <p>
                Accurate answers help us provide a more
                reliable estimate.
              </p>
            </div>

            <div className="question-list">
              {questions.map(([key, question]) => (
                <div
                  className="condition-row"
                  key={key}
                >
                  <b>{question}</b>

                  <div>
                    <button
                      type="button"
                      className={
                        data.condition[key] === true
                          ? 'selected'
                          : ''
                      }
                      onClick={() =>
                        updateCondition(key, true)
                      }
                    >
                      Yes
                    </button>

                    <button
                      type="button"
                      className={
                        data.condition[key] === false
                          ? 'selected no'
                          : ''
                      }
                      onClick={() =>
                        updateCondition(key, false)
                      }
                    >
                      No
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setError('');
                  setStep(1);
                }}
              >
                Back
              </button>

              <button
                type="button"
                className="btn btn-primary"
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
            <div className="step-heading">
              <span>Step 4 of 6</span>
              <h2>Your contact details</h2>
              <p>
                We use these details to send the enquiry and
                arrange collection.
              </p>
            </div>

            <div className="form-grid two">
              <label>
                Full name *
                <input
                  value={data.customer.fullName}
                  onChange={(event) =>
                    updateCustomer(
                      'fullName',
                      event.target.value,
                    )
                  }
                  autoComplete="name"
                />
              </label>

              <label>
                Phone number *
                <input
                  type="tel"
                  value={data.customer.phone}
                  onChange={(event) =>
                    updateCustomer(
                      'phone',
                      event.target.value,
                    )
                  }
                  autoComplete="tel"
                />
              </label>

              <label>
                Email address *
                <input
                  type="email"
                  value={data.customer.email}
                  onChange={(event) =>
                    updateCustomer(
                      'email',
                      event.target.value,
                    )
                  }
                  autoComplete="email"
                />
              </label>

              <label>
                Mileage *
                <input
                  type="number"
                  min="0"
                  value={data.mileage}
                  onChange={(event) =>
                    update(
                      'mileage',
                      event.target.value,
                    )
                  }
                />
              </label>

              <label>
                Collection postcode *
                <input
                  value={data.postcode}
                  onChange={(event) =>
                    update(
                      'postcode',
                      event.target.value.toUpperCase(),
                    )
                  }
                  autoComplete="postal-code"
                />
              </label>

              <label>
                Preferred contact
                <select
                  value={
                    data.customer.preferredContact
                  }
                  onChange={(event) =>
                    updateCustomer(
                      'preferredContact',
                      event.target.value,
                    )
                  }
                >
                  <option value="phone">Phone</option>
                  <option value="whatsapp">
                    WhatsApp
                  </option>
                  <option value="email">Email</option>
                </select>
              </label>

              <label className="full">
                Additional notes
                <textarea
                  rows="4"
                  value={data.customer.notes}
                  onChange={(event) =>
                    updateCustomer(
                      'notes',
                      event.target.value,
                    )
                  }
                />
              </label>
            </div>

            <label className="check">
              <input
                type="checkbox"
                checked={data.customer.privacy}
                onChange={(event) =>
                  updateCustomer(
                    'privacy',
                    event.target.checked,
                  )
                }
              />
              I agree to the Privacy Policy.
            </label>

            <label className="check">
              <input
                type="checkbox"
                checked={data.customer.terms}
                onChange={(event) =>
                  updateCustomer(
                    'terms',
                    event.target.checked,
                  )
                }
              />
              I agree to the Terms and Conditions.
            </label>

            {error && (
              <div className="alert error">{error}</div>
            )}

            <div className="actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setError('');
                  setStep(2);
                }}
              >
                Back
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={getQuote}
                disabled={loading}
              >
                {loading
                  ? 'Calculating…'
                  : 'Calculate My Quote'}
              </button>
            </div>
          </div>
        )}

       {step === 4 && data.quote && data.vehicle && (
  <div className="quote-result">
    <div className="step-heading center">
      <span>Step 5 of 6</span>
      <h2>Your estimated scrap quote</h2>
      <p>
        Based on your vehicle details and the condition information
        provided.
      </p>
    </div>

    {/* Estimated scrap value */}
    <div className="estimated-value-card">
      <span className="estimated-value-label">
        Estimated scrap value
      </span>

      <div className="quote-price">
        £{data.quote.finalValue}
      </div>

      <p className="quote-validity">
        This estimated quote is valid for{' '}
        <strong>{data.quote.validUntil}</strong>.
      </p>
    </div>

    {/* Vehicle summary */}
    <div className="quote-section">
      <div className="quote-section-heading">
        <h3>Vehicle summary</h3>
      </div>

      <div className="vehicle-summary-card">
        <div className="vehicle-summary-top">
          <div className="vehicle-summary-icon">
            🚗
          </div>

          <div>
            <b className="plate">
              {data.vehicle.registration}
            </b>

            <h3>
              {data.vehicle.make} {data.vehicle.model}
            </h3>
          </div>
        </div>

        <div className="detail-grid quote-vehicle-details">
          <span>
            <small>Registration</small>
            {data.vehicle.registration}
          </span>

          <span>
            <small>Make</small>
            {data.vehicle.make}
          </span>

          <span>
            <small>Model</small>
            {data.vehicle.model}
          </span>

          <span>
            <small>Year</small>
            {data.vehicle.year}
          </span>

          <span>
            <small>Fuel type</small>
            {data.vehicle.fuelType}
          </span>

          <span>
            <small>Engine size</small>
            {data.vehicle.engineSize}
          </span>

          <span>
            <small>Vehicle weight</small>
            {data.vehicle.weightKg} kg
          </span>

          <span>
            <small>Mileage</small>
            {Number(data.mileage).toLocaleString()} miles
          </span>
        </div>
      </div>
    </div>

    {/* Quote breakdown */}
    <div className="quote-section">
      <div className="quote-section-heading">
        <h3>Quote breakdown</h3>
        <p>
          A complete breakdown of how your estimate was calculated.
        </p>
      </div>

      <div className="summary-box">
        <div>
          <span>Estimated scrap value</span>
          <b>£{data.quote.baseValue}</b>
        </div>

        <div>
          <span>Price per tonne used</span>
          <b>£{data.quote.pricePerTonne}</b>
        </div>

        <div>
          <span>Vehicle weight</span>
          <b>{data.vehicle.weightKg} kg</b>
        </div>

        {/* Bonuses applied */}
        <div className="summary-subheading">
          <span>Bonuses applied</span>
        </div>

        {data.quote.bonuses?.length > 0 ? (
          data.quote.bonuses.map((bonus) => (
            <div
              className="positive"
              key={bonus.name}
            >
              <span>{bonus.name}</span>
              <b>+£{bonus.amount}</b>
            </div>
          ))
        ) : (
          <div className="summary-empty">
            <span>No bonuses applied</span>
            <b>£0</b>
          </div>
        )}

        {/* Deductions applied */}
        <div className="summary-subheading">
          <span>Deductions applied</span>
        </div>

        {data.quote.deductions?.length > 0 ? (
          data.quote.deductions.map((deduction) => (
            <div
              className="negative"
              key={deduction.name}
            >
              <span>{deduction.name}</span>
              <b>−£{deduction.amount}</b>
            </div>
          ))
        ) : (
          <div className="summary-empty">
            <span>No deductions applied</span>
            <b>£0</b>
          </div>
        )}

        {/* Final estimated quote */}
        <div className="total">
          <span>Final estimated quote</span>
          <b>£{data.quote.finalValue}</b>
        </div>
      </div>
    </div>

    {/* Quote validity */}
    <div className="quote-validity-message">
      <div className="quote-message-icon">
        ⏱
      </div>

      <div>
        <strong>Quote validity</strong>
        <p>
          Your estimated quote is valid for{' '}
          {data.quote.validUntil}. Submit your enquiry before
          this period ends to allow our team to confirm the offer.
        </p>
      </div>
    </div>

    {/* Inspection disclaimer */}
    <div className="alert info quote-disclaimer">
      <strong>Important:</strong> This is an estimated scrap value.
      The final price may change following vehicle inspection and
      confirmation that the registration, mileage, vehicle condition,
      missing parts and other submitted details are accurate.
    </div>

    {error && (
      <div className="alert error">
        {error}
      </div>
    )}

    {/* Actions */}
    <div className="actions center quote-actions">
      <button
        type="button"
        className="btn btn-primary"
        onClick={submit}
        disabled={loading}
      >
        {loading
          ? 'Submitting enquiry…'
          : 'Submit My Enquiry'}
      </button>

      <a
        className="btn btn-secondary"
        href="tel:08001234567"
      >
        Call Us
      </a>

      <a
        className="btn btn-whatsapp"
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
  <div className="success">
    <div className="success-icon">✓</div>

    <span className="eyebrow">
      Enquiry submitted
    </span>

    <h2>
      Thank you
      {data.customer.fullName
        ? `, ${data.customer.fullName}`
        : ''}
      !
    </h2>

    <p>
      Your enquiry has been submitted successfully. Our team
      will contact you using your preferred contact method.
    </p>

    <div className="success-details">
      <div>
        <span>Enquiry reference</span>
        <b>
          {data.enquiry?.reference ||
            'Reference being generated'}
        </b>
      </div>

      <div>
        <span>Customer name</span>
        <b>{data.customer.fullName || 'Not provided'}</b>
      </div>

      <div>
        <span>Vehicle registration</span>
        <b>
          {data.vehicle?.registration ||
            data.registration ||
            'Not available'}
        </b>
      </div>

      <div>
        <span>Vehicle</span>
        <b>
          {data.vehicle
            ? `${data.vehicle.make} ${data.vehicle.model}`
            : 'Not available'}
        </b>
      </div>

      <div>
        <span>Estimated quote</span>
        <b>
          {data.quote?.finalValue !== undefined
            ? `£${data.quote.finalValue}`
            : 'Not available'}
        </b>
      </div>

      <div>
        <span>Preferred contact</span>
        <b>
          {data.customer.preferredContact
            ? data.customer.preferredContact
                .charAt(0)
                .toUpperCase() +
              data.customer.preferredContact.slice(1)
            : 'Phone'}
        </b>
      </div>
    </div>

    <div className="alert info success-message">
      Your enquiry has been received. A member of the
      MyAutoScrap team will contact you shortly to confirm
      your vehicle details, final price and collection.
    </div>

    <div className="actions center">
      <a
        className="btn btn-primary"
        href="/"
      >
        Back to homepage
      </a>

      <a
        className="btn btn-secondary"
        href="tel:08001234567"
      >
        Call Us
      </a>

      <a
        className="btn btn-whatsapp"
        href="https://wa.me/447700900000"
        target="_blank"
        rel="noreferrer"
      >
        WhatsApp
      </a>
    </div>
  </div>
)}   </div>
    </div>
  );
}