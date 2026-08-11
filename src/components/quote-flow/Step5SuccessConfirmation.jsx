import {
  primaryButtonClass,
  secondaryButtonClass,
  whatsAppButtonClass,
  alertInfoClass,
} from './constants';

export default function Step5SuccessConfirmation({ data }) {
  return (
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
  );
}
