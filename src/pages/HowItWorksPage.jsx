import { Link } from 'react-router';

const simpleSteps = [
  {
    number: '1',
    title: 'Get an Instant Quote',
    description:
      'Enter your vehicle registration and postcode to receive your instant scrap estimate in seconds.',
    icon: '⚡',
  },
  {
    number: '2',
    title: 'Accept & Enter Details',
    description:
      'Review your quote breakdown, confirm your details, and provide your bank transfer info for payment.',
    icon: '📝',
  },
  {
    number: '3',
    title: 'Free Collection & Payment',
    description:
      'We collect your car for free at your preferred time and pay the money straight into your bank account.',
    icon: '🚚',
  },
];

const containerClass = 'mx-auto w-[calc(100%-36px)] max-w-[1100px]';
const primaryBtnClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0f7b4f] px-7 py-4 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#075b3a]';
const ghostBtnClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-4 font-black text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-50';

export default function HowItWorksPage() {
  return (
    <>
      {/* Header */}
      <section className="bg-linear-to-br from-[#0a3626] to-[#0f704a] py-16 text-center text-white sm:py-20">
        <div className={containerClass}>
          <span className="mb-3 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#dff46b]">
            Simple 3-Step Process
          </span>
          <h1 className="mb-4 text-[clamp(2.4rem,5vw,4rem)] font-black leading-tight">
            Scrap your car in 3 easy steps
          </h1>
          <p className="mx-auto m-0 max-w-[580px] text-lg text-[#d7e9e1]">
            Fast, transparent, and completely free collection across our supported locations.
          </p>
        </div>
      </section>

      {/* 3 Simple Steps Grid */}
      <section className="py-16 sm:py-24 bg-white">
        <div className={containerClass}>
          <div className="grid gap-8 sm:grid-cols-3">
            {simpleSteps.map((step) => (
              <div
                key={step.number}
                className="relative flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50/60 p-8 text-center transition hover:border-emerald-500/40 hover:bg-white hover:shadow-xl"
              >
                <div className="mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-[#edf7f2] text-3xl shadow-sm">
                  {step.icon}
                </div>

                <span className="mb-2 text-xs font-black uppercase tracking-wider text-[#0f7b4f]">
                  Step {step.number}
                </span>

                <h3 className="mb-3 text-xl font-black text-slate-900">
                  {step.title}
                </h3>

                <p className="m-0 text-sm text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Simple CTA Box */}
          <div className="mt-16 rounded-2xl bg-[#edf7f2] border border-[#c9e8d8] p-8 text-center sm:p-12">
            <h2 className="mb-3 text-2xl sm:text-3xl font-black text-[#175c40]">
              Ready to get your scrap car quote?
            </h2>
            <p className="mb-8 text-slate-600 max-w-[500px] mx-auto text-sm sm:text-base">
              It takes less than 2 minutes. No hidden fees, no obligation.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link className={primaryBtnClass} to="/quote">
                Get My Quote →
              </Link>
              <a className={ghostBtnClass} href="tel:+447714423293">
                Call Us (+44 7714423293)
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
