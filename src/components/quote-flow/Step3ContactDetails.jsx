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
  error,
  setError,
  setStep,
}) {
  return (
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

        <label className={labelClass}>
          Collection postcode *
          <input
            className={inputClass}
            value={data.customer.collectionPostcode || data.postcode || ''}
            onChange={(event) =>
              updateCustomer(
                'collectionPostcode',
                event.target.value.toUpperCase().replace(/[^A-Z0-9\s]/g, ''),
              )
            }
            placeholder="e.g. SW1A 1AA"
            autoComplete="postal-code"
            maxLength={10}
          />
        </label>

        <label className={`${labelClass} sm:col-span-2`}>
          Collection address *
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
          }}
        >
          Continue to Bank Details →
        </button>
      </div>
    </div>
  );
}
