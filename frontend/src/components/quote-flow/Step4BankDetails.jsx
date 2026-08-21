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
  isModal = false,
}) {
  return (
    <div className="space-y-4">
      <StepHeading number={isModal ? undefined : "5"} title="Bank payout details">
        Under UK law (Scrap Metal Dealers Act), scrap payments are made via electronic bank transfer upon collection.
      </StepHeading>


      <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-xs font-semibold text-amber-900 flex items-start gap-2">
        <span className="text-sm shrink-0">⚠️</span>
        <span>
          <strong>Bank Transfer</strong> (incorrect bank details or Payee name may result in a delayed payment)
        </span>
      </div>

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
        <label className={`${labelClass} sm:col-span-2 mb-0`}>
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
            placeholder="Full name on bank account or ID"
            autoComplete="name"
            maxLength={60}
          />
        </label>

        <label className={`${labelClass} mb-0`}>
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

        <label className={`${labelClass} mb-0`}>
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
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 leading-relaxed">
        🔒 <strong>Privacy Guaranteed:</strong> Encrypted & used exclusively by MyAutoScrap for your vehicle scrap payout.
      </div>

      {error && <div className={alertErrorClass}>{error}</div>}

      <div className="pt-2 flex flex-col-reverse gap-2.5 sm:flex-row">
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={() => {
            if (setError) setError('');
            if (setStep) setStep(4);
          }}
        >
          {isModal ? 'Cancel' : 'Back to Thank You page'}
        </button>

        <button
          type="button"
          className={`${primaryButtonClass} flex-1`}
          onClick={submit}
          disabled={loading || !bankValid}
        >
          {loading ? 'Saving details…' : 'Save & Confirm Payout'}
        </button>
      </div>
    </div>
  );
}
