import { useState } from 'react';
import Step4BankDetails from './Step4BankDetails';
import { showToast } from '../admin/ToastContainer';
import {
  primaryButtonClass,
  secondaryButtonClass,
  whatsAppButtonClass,
  alertInfoClass,
} from './constants';

export default function Step5SuccessConfirmation({
  data,
  updateBank,
  bankValid,
  loading,
  error,
  setError,
  submitBankDetails,
}) {
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankAdded, setBankAdded] = useState(false);
  const [journeyCompleted, setJourneyCompleted] = useState(false);

  const handleOpenBankModal = () => {
    if (setError) setError('');
    setShowBankModal(true);
  };

  const handleSaveBank = async () => {
    if (submitBankDetails) {
      await submitBankDetails();
      setBankAdded(true);
      setShowBankModal(false);
      setJourneyCompleted(true);
      showToast('Payment & Bank details added successfully! Your scrap payout is registered.', 'success');
    }
  };

  const handleSkipAndFinish = () => {
    setJourneyCompleted(true);
    showToast('Your quote journey is complete! Our recovery driver will confirm payout during pickup.', 'success');
  };

  return (
    <div className="px-0 py-5 text-center">
      <div className="mx-auto mb-6 grid h-[72px] w-[72px] place-items-center rounded-full bg-[#0f7b4f] text-[2.6rem] text-white shadow-lg">
        ✓
      </div>

      <span className="mb-3 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f7b4f]">
        Enquiry Submitted Successfully
      </span>

      <h2 className="mb-3.5 text-[clamp(2rem,4vw,3.15rem)] leading-tight font-black text-slate-900">
        Thank you{data.customer.fullName ? `, ${data.customer.fullName}` : ''}!
      </h2>

      <p className="text-slate-600 max-w-lg mx-auto leading-relaxed text-base">
        Your scrap vehicle enquiry has been logged. Our recovery team will contact you shortly to confirm collection details.
      </p>

      {/* Two Large Action Buttons / Status banner */}
      {!journeyCompleted ? (
        <div className="my-8 max-w-2xl mx-auto rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/50 p-6 sm:p-8 shadow-xs">
          <h3 className="text-lg font-black text-emerald-950 mb-2">
            Would you like to add your Bank Payout details now?
          </h3>
          <p className="text-sm text-slate-600 mb-6 max-w-md mx-auto">
            Adding your bank details accelerates payment processing when our driver collects your vehicle. Under UK law, scrap payouts are paid via secure bank transfer.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleOpenBankModal}
              className="flex items-center justify-center gap-2 rounded-xl bg-[#0f7b4f] px-6 py-4 font-black text-white shadow-md hover:bg-[#075b3a] hover:-translate-y-0.5 transition cursor-pointer text-base"
            >
              <span>💳 Add Payment Details</span>
              <span>→</span>
            </button>

            <button
              type="button"
              onClick={handleSkipAndFinish}
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-4 font-black text-slate-800 hover:bg-slate-50 hover:-translate-y-0.5 transition cursor-pointer text-base"
            >
              <span>Skip & Finish</span>
              <span>✓</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="my-8 max-w-2xl mx-auto rounded-2xl border border-emerald-300 bg-emerald-50 p-6 text-emerald-900 font-bold text-center shadow-xs">
          {bankAdded ? (
            <div className="flex items-center justify-center gap-3 text-emerald-800">
              <span className="text-2xl">✅</span>
              <div>
                <span className="block text-lg font-black text-emerald-950">Payment Details Added Successfully!</span>
                <span className="text-sm font-medium text-emerald-800">Your bank transfer payout is registered for vehicle collection.</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3 text-emerald-900">
              <span className="text-2xl">🎉</span>
              <div>
                <span className="block text-lg font-black text-slate-900">Journey Completed!</span>
                <span className="text-sm font-normal text-slate-600">Our collection manager will arrange payment details directly during pickup.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Summary Grid */}
      <div className="mx-auto my-6 grid max-w-[650px] grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left">
        <div className="flex flex-col rounded-xl bg-[#f7f8f3] p-4 min-w-0">
          <span className="text-xs text-slate-500">Enquiry reference</span>
          <b className="text-slate-900 text-sm sm:text-base break-words">{data.enquiry?.reference || 'Reference generated'}</b>
        </div>

        <div className="flex flex-col rounded-xl bg-[#f7f8f3] p-4 min-w-0">
          <span className="text-xs text-slate-500">Customer name</span>
          <b className="text-slate-900 text-sm sm:text-base break-words">{data.customer.fullName || 'Not provided'}</b>
        </div>

        <div className="flex flex-col rounded-xl bg-[#f7f8f3] p-4 min-w-0">
          <span className="text-xs text-slate-500">Vehicle reg</span>
          <b className="text-slate-900 text-sm sm:text-base break-words">
            {data.vehicle?.registration || data.registration || 'Not available'}
          </b>
        </div>

        <div className="flex flex-col rounded-xl bg-[#f7f8f3] p-4 min-w-0">
          <span className="text-xs text-slate-500">Vehicle</span>
          <b className="text-slate-900 text-sm sm:text-base break-words">
            {data.vehicle
              ? `${data.vehicle.make} ${data.vehicle.model}`
              : 'Not available'}
          </b>
        </div>

        <div className="flex flex-col rounded-xl bg-[#f7f8f3] p-4 min-w-0">
          <span className="text-xs text-slate-500">Estimated quote</span>
          <b className="text-[#0f7b4f] text-base sm:text-lg font-black break-words">
            {data.quote?.finalValue !== undefined
              ? `£${data.quote.finalValue}`
              : 'Not available'}
          </b>
        </div>

        <div className="flex flex-col rounded-xl bg-[#f7f8f3] p-4 min-w-0">
          <span className="text-xs text-slate-500">Collection address</span>
          <b className="text-slate-900 text-sm sm:text-base break-words">
            {data.customer.collectionAddress
              ? `${data.customer.collectionAddress}, ${data.customer.collectionPostcode || data.postcode}`
              : data.customer.collectionPostcode || data.postcode || 'Not available'}
          </b>
          {data.customer.additionalAddressDetails && (
            <span className="mt-1 text-xs text-slate-600 font-medium">
              Flat / House / Notes: {data.customer.additionalAddressDetails}
            </span>
          )}
        </div>
      </div>

      <div className={alertInfoClass}>
        A member of the MyAutoScrap team will contact you shortly to confirm collection time and answer any questions.
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

      {/* Payment Details Modal */}
      {showBankModal && (
        <div
          onClick={() => setShowBankModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in duration-200 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 text-left shadow-2xl max-h-[90vh] overflow-y-auto cursor-default"
          >
            <button
              type="button"
              onClick={() => setShowBankModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-xl h-8 w-8 grid place-items-center rounded-full bg-slate-100 cursor-pointer"
            >
              ✕
            </button>

            <Step4BankDetails
              data={data}
              updateBank={updateBank}
              bankValid={bankValid}
              loading={loading}
              error={error}
              setError={setError}
              setStep={() => setShowBankModal(false)}
              submit={handleSaveBank}
              isModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
