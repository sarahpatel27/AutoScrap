import { Link } from 'react-router';

const steps = [
  [
    '1',
    'Enter vehicle registration',
    'Provide the registration and collection postcode so the system can locate the vehicle.',
  ],
  [
    '2',
    'Confirm vehicle details',
    'Review the make, model, year, fuel type, engine and weight information.',
  ],
  [
    '3',
    'Answer condition questions',
    'Tell us whether it runs and whether important components are present.',
  ],
  [
    '4',
    'Receive an instant quote',
    'The system applies the configured rate, bonuses and deductions.',
  ],
  [
    '5',
    'Submit the enquiry',
    'Add your contact details and confirm the privacy and terms agreements.',
  ],
  [
    '6',
    'Arrange collection',
    'Our team contacts you to confirm access, timing and any final checks.',
  ],
  [
    '7',
    'Receive payment',
    'Payment is completed using the agreed approved process after collection.',
  ],
];

const containerClass = 'mx-auto w-[calc(100%-36px)] max-w-[1180px]';
const lightEyebrowClass =
  'mb-4 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#dff46b]';
const lightButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#dff46b] px-[22px] py-3.5 font-extrabold text-slate-950 transition hover:-translate-y-0.5';
const ghostButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/35 px-[22px] py-3.5 font-extrabold text-white transition hover:-translate-y-0.5';

export default function HowItWorksPage() {
  return (
    <>
      <section className="bg-linear-to-br from-[#0a3626] to-[#0f704a] py-[82px] text-white">
        <div className={containerClass}>
          <span className={lightEyebrowClass}>The process</span>
          <h1 className="mb-3.5 max-w-[900px] text-[clamp(2.5rem,5vw,4.5rem)] leading-tight">
            Simple from quote to collection
          </h1>
          <p className="m-0 max-w-[760px] text-[1.08rem] text-[#d7e9e1]">
            Every stage is designed to be easy to understand on desktop,
            tablet and mobile.
          </p>
        </div>
      </section>

      <section className="py-[68px] sm:py-[92px]">
        <div className={`${containerClass} max-w-[880px]`}>
          {steps.map(([number, title, description], index) => (
            <article
              className="relative grid grid-cols-[55px_1fr] gap-4 pb-[45px] sm:grid-cols-[80px_1fr] sm:gap-[30px]"
              key={number}
            >
              {index < steps.length - 1 && (
                <div className="absolute top-[55px] bottom-0 left-[23px] w-0.5 bg-slate-200 sm:left-[29px]" />
              )}

              <span className="relative z-10 grid h-12 w-12 place-items-center rounded-[17px] bg-[#0f7b4f] font-['Manrope'] text-xl font-black text-white sm:h-[60px] sm:w-[60px] sm:text-[1.4rem]">
                {number}
              </span>

              <div>
                <h2 className="mb-3.5 text-[1.6rem] leading-tight">{title}</h2>
                <p className="m-0 text-slate-500">{description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-[#0f7b4f] py-[62px] text-white">
        <div className={`${containerClass} flex flex-col items-center justify-between gap-10 text-center lg:flex-row lg:text-left`}>
          <div>
            <span className={lightEyebrowClass}>Ready when you are</span>
            <h2 className="mb-3.5 text-[clamp(2rem,4vw,3.2rem)] leading-tight">
              Get your scrap-car estimate today
            </h2>
            <p className="m-0 text-[#d8ebe2]">
              Enter your registration and answer a few simple questions.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link className={lightButtonClass} to="/quote">
              Get My Quote
            </Link>
            <a className={ghostButtonClass} href="tel:08001234567">
              Call Us
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
