const containerClass = 'mx-auto w-[calc(100%-36px)] max-w-[1180px]';
const paragraphClass = 'mb-[18px] text-slate-500';
const headingClass = 'mb-3.5 mt-[30px] text-[1.4rem] leading-tight first:mt-0';

export default function LegalPage({ type = 'Privacy Policy' }) {
  return (
    <>
      <section className="bg-linear-to-br from-[#0a3626] to-[#0f704a] py-[82px] text-white">
        <div className={containerClass}>
          <span className="mb-4 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#dff46b]">
            Legal
          </span>
          <h1 className="mb-3.5 text-[clamp(2.5rem,6vw,5.2rem)] leading-tight">
            {type}
          </h1>
          <p className="m-0 max-w-[760px] text-[1.08rem] text-[#d7e9e1]">
            Replace this placeholder content with text reviewed and approved
            for your operating company.
          </p>
        </div>
      </section>

      <section className="py-[68px] sm:py-[92px]">
        <article className={`${containerClass} max-w-[820px]`}>
          <h2 className={headingClass}>1. Introduction</h2>
          <p className={paragraphClass}>
            This frontend includes placeholder legal content for design and
            routing purposes. It is not legal advice and should not be published
            as your final policy.
          </p>

          <h2 className={headingClass}>2. Information and enquiries</h2>
          <p className={paragraphClass}>
            The website may collect registration details, vehicle condition,
            contact information, postcode, mileage and customer messages to
            calculate estimates and manage enquiries.
          </p>

          <h2 className={headingClass}>3. Estimates</h2>
          <p className={paragraphClass}>
            Online values are estimates. Final pricing may depend on inspection,
            ownership checks, documentation, location, market rates and the
            accuracy of submitted information.
          </p>

          <h2 className={headingClass}>4. Contact</h2>
          <p className={paragraphClass}>
            Add your legal company name, registration number, data-controller
            information, address and official contact details before launch.
          </p>
        </article>
      </section>
    </>
  );
}
