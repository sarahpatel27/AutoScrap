import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import {
  calculateQuote,
  lookupVehicle,
  submitEnquiry,
} from '../services/mockApi';

import { initial, questions, steps } from './quote-flow/constants';
import Step0VehicleLookup from './quote-flow/Step0VehicleLookup';
import Step1ConditionForm from './quote-flow/Step1ConditionForm';
import Step2QuoteDisplay from './quote-flow/Step2QuoteDisplay';
import Step3ContactDetails from './quote-flow/Step3ContactDetails';
import Step4BankDetails from './quote-flow/Step4BankDetails';
import Step5SuccessConfirmation from './quote-flow/Step5SuccessConfirmation';

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

  const handleEditRegistration = () => {
    setData((previousData) => ({
      ...previousData,
      vehicle: null,
      quote: null,
      enquiry: null,
    }));

    setError('');
    setStep(0);
  };

  const conditionValid = questions.every(
    ([key]) => typeof data.condition[key] === 'boolean',
  );

  const isMileageValid =
    !String(data.mileage).trim() ||
    (/^\d{1,7}$/.test(String(data.mileage).trim()) &&
      Number(data.mileage) >= 0);

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

  const effectiveCollectionPostcode =
    data.customer.collectionPostcode.trim() || data.postcode.trim();

  const isCollectionPostcodeValid =
    /^[A-Z0-9\s]{4,10}$/i.test(effectiveCollectionPostcode);

  const isCollectionAddressValid =
    data.customer.collectionAddress.trim().length >= 3;

  const customerValid =
    isFullNameValid &&
    isEmailValid &&
    isPhoneValid &&
    isCollectionPostcodeValid &&
    isCollectionAddressValid &&
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
      setError('Please answer all 4 condition questions to calculate your quote.');
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
          collectionPostcode: effectiveCollectionPostcode,
          phone: data.customer.phone ? `+44 ${data.customer.phone.trim()}` : '',
        },
      };

      const enquiry = await submitEnquiry(formattedData);

      setData((previousData) => ({
        ...previousData,
        enquiry,
      }));

      setStep(5);
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
      <Step0VehicleLookup
        compact={true}
        data={data}
        update={update}
        findVehicle={findVehicle}
        loading={loading}
        error={error}
      />
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
          <Step0VehicleLookup
            compact={false}
            data={data}
            update={update}
            findVehicle={findVehicle}
            loading={loading}
            error={error}
          />
        )}

        {step === 1 && data.vehicle && (
          <Step1ConditionForm
            data={data}
            update={update}
            updateCondition={updateCondition}
            step2Valid={step2Valid}
            loading={loading}
            error={error}
            setError={setError}
            setStep={setStep}
            handleCalculateQuoteFromCondition={handleCalculateQuoteFromCondition}
            handleEditRegistration={handleEditRegistration}
          />
        )}

        {step === 2 && data.quote && data.vehicle && (
          <Step2QuoteDisplay
            data={data}
            error={error}
            setError={setError}
            setStep={setStep}
          />
        )}

        {step === 3 && (
          <Step3ContactDetails
            data={data}
            updateCustomer={updateCustomer}
            customerValid={customerValid}
            error={error}
            setError={setError}
            setStep={setStep}
          />
        )}

        {step === 4 && (
          <Step4BankDetails
            data={data}
            updateBank={updateBank}
            bankValid={bankValid}
            loading={loading}
            error={error}
            setError={setError}
            setStep={setStep}
            submit={submit}
          />
        )}

        {step === 5 && <Step5SuccessConfirmation data={data} />}
      </div>
    </div>
  );
}
