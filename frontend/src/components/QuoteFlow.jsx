import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router';
import {
  calculateQuote,
  lookupVehicle,
  submitEnquiry,
  lookupAddress,
} from '../services/mockApi';
import { isHighValueVehicle } from '../utils/vehicleEligibility';
import { showToast } from './admin/ToastContainer';

import { initial, steps } from './quote-flow/constants';
import Step0VehicleLookup from './quote-flow/Step0VehicleLookup';
import Step1HighValueForm from './quote-flow/Step1HighValueForm';
import Step2QuoteDisplay from './quote-flow/Step2QuoteDisplay';
import Step3ContactDetails from './quote-flow/Step3ContactDetails';
import Step5SuccessConfirmation from './quote-flow/Step5SuccessConfirmation';

export default function QuoteFlow({ compact = false }) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const containerRef = useRef(null);
  const initialParamsHandledRef = useRef(false);

  useEffect(() => {
    if (step > 0 && containerRef.current) {
      const yOffset = -85;
      const element = containerRef.current;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
    }
  }, [step]);

  useEffect(() => {
    if (step > 0 && (!data.vehicle || !data.postcode)) {
      setStep(0);
    }
  }, [step, data.vehicle, data.postcode]);

  useEffect(() => {
    if (compact || initialParamsHandledRef.current) return;

    const stateReg = location.state?.reg || location.state?.registration;
    const statePostcode = location.state?.postcode;
    const regParam = searchParams.get('reg') || stateReg;
    const postcodeParam = searchParams.get('postcode') || statePostcode;

    if (regParam && postcodeParam) {
      initialParamsHandledRef.current = true;

      // Clear location state and URL query params immediately so the URL is clean (/scrap-my-car)
      // and page refresh won't re-trigger API calls for the previous reg/postcode.
      navigate(location.pathname, { replace: true, state: null });

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

          let addressRes;
          if (data.addresses && data.addresses.length > 0 && data.postcode === formattedPostcode) {
            addressRes = {
              isSupported: true,
              addresses: data.addresses,
              postTown: data.postTown,
              postcode: formattedPostcode,
            };
          } else {
            try {
              addressRes = await lookupAddress(formattedPostcode);
            } catch (addrErr) {
              const msg = addrErr?.message || "We couldn't check your postcode right now. Please try again.";
              setError(msg);
              showToast(msg, 'error');
              return;
            }
          }

          if (!addressRes.isSupported) {
            const msg = "Sorry, we don't currently collect vehicles from this area.";
            setError(msg);
            showToast(msg, 'error');
            return;
          }

          if (!addressRes.addresses || addressRes.addresses.length === 0) {
            const msg = "We couldn't find that postcode. Please check it and try again.";
            setError(msg);
            showToast(msg, 'error');
            return;
          }

          const vehicle = await lookupVehicle(formattedReg);
          const highValue = isHighValueVehicle(vehicle?.year);

          const quote = await calculateQuote({ vehicle, postcode: addressRes.postcode });

          if (highValue) {
            setData((prev) => ({
              ...prev,
              registration: formattedReg,
              postcode: addressRes.postcode,
              addresses: addressRes.addresses,
              addressList: addressRes.addresses,
              postTown: addressRes.postTown,
              vehicle,
              isHighValue: true,
              quote,
              estimatedValue: quote.finalValue,
              enquiry: null,
              customer: {
                ...prev.customer,
                collectionPostcode: addressRes.postcode,
              },
            }));
            setStep(1);
          } else {
            setData((prev) => ({
              ...prev,
              registration: formattedReg,
              postcode: addressRes.postcode,
              addresses: addressRes.addresses,
              addressList: addressRes.addresses,
              postTown: addressRes.postTown,
              vehicle,
              isHighValue: false,
              quote,
              enquiry: null,
              customer: {
                ...prev.customer,
                collectionPostcode: addressRes.postcode,
              },
            }));
            setStep(1);
          }
        } catch (err) {
          const msg =
            err?.message ||
            'We cannot find the car registered with this number. Please check your registration and try again.';
          setError(msg);
          showToast(msg, 'error');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [searchParams, compact, location.state, location.pathname, navigate]);

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

      let addressRes;
      try {
        addressRes = await lookupAddress(postcode);
      } catch (addrErr) {
        let msg = "We couldn't check your postcode right now. Please try again.";
        if (addrErr.type === 'NOT_FOUND' || addrErr.message?.includes("couldn't find")) {
          msg = "We couldn't find that postcode. Please check it and try again.";
        } else if (addrErr.message) {
          msg = addrErr.message;
        }
        setError(msg);
        showToast(msg, 'error');
        return;
      }

      if (!addressRes.isSupported) {
        const msg = "Sorry, we don't currently collect vehicles from this area.";
        setError(msg);
        showToast(msg, 'error');
        return;
      }

      if (!addressRes.addresses || addressRes.addresses.length === 0) {
        const msg = "We couldn't find that postcode. Please check it and try again.";
        setError(msg);
        showToast(msg, 'error');
        return;
      }

      const cleanPostcode = addressRes.postcode || postcode.toUpperCase();

      if (compact) {
        navigate('/scrap-my-car', {
          state: {
            reg: registration,
            postcode: cleanPostcode,
          },
        });
        return;
      }

      const vehicle = await lookupVehicle(registration);
      const highValue = isHighValueVehicle(vehicle?.year);
      const quote = await calculateQuote({ vehicle, postcode: cleanPostcode });

      if (highValue) {
        // High-Value Vehicle (> 2015): Route into separate high-value form with pre-calculated quote
        setData((previousData) => ({
          ...previousData,
          registration,
          postcode: cleanPostcode,
          addresses: addressRes.addresses,
          addressList: addressRes.addresses,
          postTown: addressRes.postTown,
          vehicle,
          isHighValue: true,
          quote,
          estimatedValue: quote.finalValue,
          enquiry: null,
          customer: {
            ...previousData.customer,
            collectionPostcode: cleanPostcode,
          },
        }));
        setStep(1);
      } else {
        // Standard Scrap Vehicle (<= 2015): Continue existing instant quote flow
        setData((previousData) => ({
          ...previousData,
          registration,
          postcode: cleanPostcode,
          addresses: addressRes.addresses,
          addressList: addressRes.addresses,
          postTown: addressRes.postTown,
          vehicle,
          isHighValue: false,
          quote,
          enquiry: null,
          customer: {
            ...previousData.customer,
            collectionPostcode: cleanPostcode,
          },
        }));
        setStep(1);
      }
    } catch (err) {
      const msg =
        err?.message ||
        'We cannot find the car registered with this number. Please check your registration and try again.';
      setError(msg);
      showToast(msg, 'error');
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
      isHighValue: false,
    }));

    setError('');
    setStep(0);
  };

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

  const submitHighValueRequest = async (formDataPayload = {}) => {
    setError('');

    try {
      setLoading(true);

      const estimatedQuote = data.quote || (await calculateQuote({ vehicle: data.vehicle, postcode: formDataPayload.postcode || data.postcode }));
      const estimatedVal = Number(formDataPayload.estimatedValue || estimatedQuote.finalValue || 1250);
      const expectedVal = Number(formDataPayload.customerExpectedValue || estimatedVal);
      const pref = formDataPayload.valuePreference || 'ESTIMATED_VALUE';

      const formattedData = {
        ...data,
        isHighValue: true,
        mileage: formDataPayload.mileage || data.mileage,
        vehicleCondition: formDataPayload.vehicleCondition || data.vehicleCondition || 'Good',
        photos: formDataPayload.photos || data.photos || [],
        postcode: formDataPayload.postcode || data.postcode,
        estimatedValue: estimatedVal,
        customerExpectedValue: expectedVal,
        valuePreference: pref,
        quote: {
          ...estimatedQuote,
          finalValue: expectedVal,
        },
        customer: {
          ...data.customer,
          collectionPostcode: formDataPayload.postcode || data.customer.collectionPostcode || data.postcode,
        },
      };

      const enquiry = await submitEnquiry(formattedData);

      setData((previousData) => ({
        ...previousData,
        ...formattedData,
        enquiry,
      }));

      // Advance to success confirmation screen
      setStep(3);
    } catch (err) {
      setError(
        err?.message ||
          'We could not submit your high-value vehicle request. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const submitContactStep = async () => {
    setError('');

    if (!customerValid) {
      setError('Please complete all required contact details before continuing.');
      return;
    }

    try {
      setLoading(true);

      const formattedData = {
        ...data,
        customer: {
          ...data.customer,
          collectionPostcode: effectiveCollectionPostcode,
          phone: data.customer.phone ? data.customer.phone.trim() : '',
        },
      };

      const enquiry = await submitEnquiry(formattedData);

      setData((previousData) => ({
        ...previousData,
        enquiry,
      }));

      setStep(3);
    } catch (err) {
      setError(
        err?.message ||
          'We could not save your request. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const submitBankDetails = async () => {
    setError('');

    if (!bankValid) {
      setError('Please enter a valid Account Name, 6-digit Sort Code, and 8-digit Account Number.');
      return;
    }

    try {
      setLoading(true);

      const formattedData = {
        ...data,
        bank: {
          accountName: data.bank.accountName.trim(),
          sortCode: data.bank.sortCode.replace(/\D/g, ''),
          accountNumber: data.bank.accountNumber.replace(/\D/g, ''),
          bankName: data.bank.bankName.trim(),
        },
      };

      const enquiry = await submitEnquiry(formattedData);

      setData((previousData) => ({
        ...previousData,
        enquiry,
      }));

      setStep(3);
    } catch (err) {
      setError(
        err?.message ||
          'We could not save your bank details. Please try again.',
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

      <div className="min-h-[480px] w-full max-w-full min-w-0 overflow-hidden rounded-[22px] bg-white px-[18px] py-6 shadow-[0_18px_50px_rgba(13,52,37,0.11)] sm:p-10">
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

        {/* STEP 1: High-Value vehicle form route if year > 2015 */}
        {step === 1 && data.isHighValue && data.vehicle && (
          <Step1HighValueForm
            data={data}
            updateCustomer={updateCustomer}
            update={update}
            onBack={handleEditRegistration}
            onSubmitHighValueEnquiry={submitHighValueRequest}
            loading={loading}
            error={error}
          />
        )}

        {/* STEP 1: Normal Instant Scrap Quote route if year <= 2015 */}
        {step === 1 && !data.isHighValue && data.quote && data.vehicle && (
          <Step2QuoteDisplay
            data={data}
            error={error}
            setError={setError}
            setStep={setStep}
          />
        )}

        {step === 2 && (
          <Step3ContactDetails
            data={data}
            updateCustomer={updateCustomer}
            customerValid={customerValid}
            loading={loading}
            error={error}
            setError={setError}
            setStep={setStep}
            submitContactStep={submitContactStep}
          />
        )}

        {step === 3 && (
          <Step5SuccessConfirmation
            data={data}
            updateBank={updateBank}
            bankValid={bankValid}
            loading={loading}
            error={error}
            setError={setError}
            submitBankDetails={submitBankDetails}
          />
        )}
      </div>
    </div>
  );
}
