import { useState } from 'react';
import StepHeading from './StepHeading';
import {
  labelClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  alertErrorClass,
} from './constants';

export default function Step3ContactDetails({
  data,
  updateCustomer,
  customerValid,
  loading,
  error,
  setError,
  setStep,
  submitContactStep,
}) {
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  const handlePhoneBlur = () => {
    const val = data.customer.phone ? data.customer.phone.trim() : '';
    if (!val || !/^\d{11,12}$/.test(val)) {
      setPhoneError('Please enter a valid phone number');
    } else {
      setPhoneError('');
    }
  };

  const handleEmailBlur = () => {
    const val = data.customer.email ? data.customer.email.trim() : '';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!val || !emailRegex.test(val)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const phoneVal = data.customer.phone ? data.customer.phone.trim() : '';
    const isPhoneOk = Boolean(phoneVal && /^\d{11,12}$/.test(phoneVal));
    const emailVal = data.customer.email ? data.customer.email.trim() : '';
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const isEmailOk = Boolean(emailVal && emailRegex.test(emailVal));

    if (!isPhoneOk) {
      setPhoneError('Please enter a valid phone number');
    }
    if (!isEmailOk) {
      setEmailError('Please enter a valid email address');
    }

    if (!isPhoneOk || !isEmailOk) {
      return;
    }

    submitContactStep();
  };

  return (
    <div>
      <StepHeading number="3" title="Your contact details">
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

      <div className="grid gap-x-[18px] gap-y-3 sm:grid-cols-2 w-full max-w-full min-w-0">
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
          Phone number *
          <input
            className={`${inputClass} ${phoneError ? 'border-red-500 focus:border-red-500' : ''}`}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={data.customer.phone}
            onKeyDown={(e) => {
              if (
                [
                  'Backspace',
                  'Delete',
                  'Tab',
                  'Escape',
                  'Enter',
                  'ArrowLeft',
                  'ArrowRight',
                  'ArrowUp',
                  'ArrowDown',
                  'Home',
                  'End',
                ].includes(e.key) ||
                ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x', 'z'].includes(e.key.toLowerCase()))
              ) {
                return;
              }
              if (!/^[0-9]$/.test(e.key)) {
                e.preventDefault();
              }
            }}
            onPaste={(e) => {
              e.preventDefault();
              const pasted = e.clipboardData?.getData('text') || '';
              const digits = pasted.replace(/\D/g, '').slice(0, 12);
              updateCustomer('phone', digits);
              if (phoneError) setPhoneError('');
            }}
            onChange={(event) => {
              const digits = event.target.value.replace(/\D/g, '');
              updateCustomer('phone', digits.slice(0, 12));
              if (phoneError) setPhoneError('');
            }}
            onBlur={handlePhoneBlur}
            placeholder="e.g. 07714 423293"
            autoComplete="tel"
            maxLength={12}
          />
          {phoneError && (
            <p className="mt-1 text-xs text-red-600 font-semibold">{phoneError}</p>
          )}
        </label>

        <label className={labelClass}>
          Email address *
          <input
            className={`${inputClass} ${emailError ? 'border-red-500 focus:border-red-500' : ''}`}
            type="email"
            value={data.customer.email}
            onChange={(event) => {
              updateCustomer('email', event.target.value.trim());
              if (emailError) setEmailError('');
            }}
            onBlur={handleEmailBlur}
            placeholder="e.g. john@example.com"
            autoComplete="email"
          />
          {emailError && (
            <p className="mt-1 text-xs text-red-600 font-semibold">{emailError}</p>
          )}
        </label>

        <label className={`${labelClass} sm:col-span-2`}>
          Collection postcode *
          <input
            className={`${inputClass} bg-slate-100/80 text-slate-600 cursor-not-allowed font-mono font-bold`}
            value={data.customer.collectionPostcode || data.postcode || ''}
            disabled
            readOnly
            placeholder="e.g. SW1A 1AA"
            autoComplete="postal-code"
            maxLength={10}
          />
        </label>

        <label className={`${labelClass} sm:col-span-2`}>
          Collection address *
          {((data.addresses && data.addresses.length > 0) || (data.addressList && data.addressList.length > 0)) ? (
            <select
              className={`${inputClass} truncate`}
              value={
                (data.addresses || data.addressList).find(
                  (a) => a.summaryAddress === data.customer.collectionAddress
                )?.udprn || ''
              }
              onChange={(event) => {
                const selectedUdprn = event.target.value;
                const addressOptions = data.addresses || data.addressList || [];
                const found = addressOptions.find(
                  (item) => String(item.udprn) === selectedUdprn
                );
                if (found) {
                  updateCustomer('collectionAddress', found.summaryAddress);
                  updateCustomer('collectionAddressUdprn', found.udprn);
                } else {
                  updateCustomer('collectionAddress', '');
                  updateCustomer('collectionAddressUdprn', null);
                }
              }}
            >
              <option value="">Select your collection address</option>
              {(data.addresses || data.addressList).map((address) => (
                <option key={address.udprn || address.summaryAddress} value={address.udprn}>
                  {address.summaryAddress}
                </option>
              ))}
            </select>
          ) : (
            <input
              className={inputClass}
              value={data.customer.collectionAddress}
              onChange={(event) =>
                updateCustomer('collectionAddress', event.target.value)
              }
              placeholder="House name/number, street name, town"
              autoComplete="street-address"
              maxLength={120}
            />
          )}
        </label>

        <label className={`${labelClass} sm:col-span-2`}>
          Flat, house number or additional address details (Optional)
          <input
            className={inputClass}
            value={data.customer.additionalAddressDetails || ''}
            onChange={(event) =>
              updateCustomer('additionalAddressDetails', event.target.value)
            }
            placeholder="e.g. Flat 3B, House 12, Gate Code or access instructions"
            maxLength={120}
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
            setStep(1);
          }}
        >
          Back to quote
        </button>

        <button
          type="button"
          className={`${primaryButtonClass} flex-1`}
          disabled={!customerValid || loading}
          onClick={handleSubmit}
        >
          {loading ? 'Submitting Details...' : 'Submit Details & Proceed →'}
        </button>
      </div>
    </div>
  );
}
