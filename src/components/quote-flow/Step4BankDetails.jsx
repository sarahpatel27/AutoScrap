import StepHeading from './StepHeading';
import {
  labelClass,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
  alertErrorClass,
} from './constants';

export default function Step4BankDetails({
  data,
  updateBank,
  bankValid,
  loading,
  error,
  setError,
  setStep,
  submit,
}) {
  return (
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
  );
}
