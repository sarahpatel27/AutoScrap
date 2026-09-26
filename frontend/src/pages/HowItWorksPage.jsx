import { Link } from 'react-router';
import SEO from '../components/Seo';
import { getBreadcrumbSchema } from '../config/seo.config';

const processSteps = [
  {
    number: '1',
    title: 'Get an Online Vehicle Estimate',
    shortDescription:
      'Enter your vehicle registration and collection postcode to calculate your scrap car estimate based on live UK market rates.',
    details:
      "Our online valuation calculates an estimated value using your vehicle's make, model, weight, and current scrap metal rates. If your vehicle is non-running, damaged, or missing parts, you can easily declare this for an accurate estimate.",
    icon: '⚡',
  },
  {
    number: '2',
    title: 'Confirm Vehicle & Contact Details',
    shortDescription:
      'Review your estimate breakdown with transparent pricing and confirm your collection details.',
    details:
      'Review the valuation details with no hidden fees or separate collection charges. Confirm your collection address, contact details, and provide your bank transfer information so payment can be prepared ahead of collection.',
    icon: '📝',
  },
  {
    number: '3',
    title: 'Arrange Free Vehicle Collection',
    shortDescription:
      'Our team contacts you to schedule a convenient collection date and time window that fits your schedule.',
    details:
      'We arrange free collection directly from your home, workplace, or driveway across our supported service areas. You do not need to drive or transport the vehicle yourself—our recovery vehicle handles the collection.',
    icon: '🚚',
  },
  {
    number: '4',
    title: 'Vehicle Handover & Bank-Transfer Payment',
    shortDescription:
      'Payment is issued directly by bank transfer upon collection and vehicle handover.',
    details:
      'When the recovery driver collects the vehicle, payment is issued straight into your designated bank account via bank transfer. We provide guidance on the relevant vehicle paperwork during the collection and handover process.',
    icon: '💷',
  },
];

const collectionRequirements = [
  {
    title: 'Vehicle Keys',
    description: 'Provide the vehicle keys on collection day if they are available.',
  },
  {
    title: 'V5C Logbook or Proof of Ownership',
    description:
      'Having your V5C registration document makes the handover faster. If it is misplaced or lost, valid photo ID and proof of ownership can be accepted.',
  },
  {
    title: 'Valid Photo ID',
    description:
      'A valid driving licence or passport to confirm your identity and vehicle ownership.',
  },
  {
    title: 'Clear Vehicle Access',
    description:
      'Ensure the vehicle is accessible so our recovery driver can safely load and secure it.',
  },
];

const containerClass = 'mx-auto w-[calc(100%-36px)] max-w-[1100px]';
const primaryBtnClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0f7b4f] px-7 py-4 font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-[#075b3a]';
const ghostBtnClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-4 font-black text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-50';

export default function HowItWorksPage() {
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Scrap Your Car with MyAutoScrap',
    description:
      'Learn how the MyAutoScrap process works, from getting an online vehicle estimate to arranging collection and receiving payment by bank transfer.',
    step: processSteps.map((s) => ({
      '@type': 'HowToStep',
      position: s.number,
      name: s.title,
      text: `${s.shortDescription} ${s.details}`,
    })),
  };

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'How It Works', url: '/how-it-works' },
  ]);

  return (
    <>
      <SEO
        title="How It Works | Scrap Car Collection Guide | MyAutoScrap"
        description="Learn how the MyAutoScrap process works, from getting an online vehicle estimate to arranging collection and receiving payment by bank transfer."
        canonical="/how-it-works"
        schema={[howToSchema, breadcrumbSchema]}
      />
      {/* Header */}
      <section className="bg-linear-to-br from-[#0a3626] to-[#0f704a] py-16 text-center text-white sm:py-20">
        <div className={containerClass}>
          <span className="mb-3 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#dff46b]">
            Step-by-Step Guide
          </span>
          <h1 className="mb-4 text-[clamp(2.4rem,5vw,4rem)] font-black leading-tight">
            How It Works: Step-by-Step Scrap Car Collection
          </h1>
          <p className="mx-auto m-0 max-w-[650px] text-lg text-[#d7e9e1]">
            Learn how MyAutoScrap makes scrapping your car straightforward, transparent, and hassle-free—from your initial online estimate to free collection and direct payment.
          </p>
        </div>
      </section>

      {/* 4 Process Steps Grid */}
      <section className="py-16 sm:py-24 bg-white">
        <div className={containerClass}>
          <div className="grid gap-8 sm:grid-cols-2">
            {processSteps.map((step) => (
              <div
                key={step.number}
                className="relative flex flex-col rounded-2xl border border-slate-200 bg-slate-50/60 p-8 transition hover:border-emerald-500/40 hover:bg-white hover:shadow-xl"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#edf7f2] text-2xl shadow-xs">
                    {step.icon}
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-[#0f7b4f]">
                      Step {step.number}
                    </span>
                    <h2 className="text-xl font-black text-slate-900 leading-snug">
                      {step.title}
                    </h2>
                  </div>
                </div>

                <p className="mb-3 text-sm font-semibold text-slate-700 leading-relaxed">
                  {step.shortDescription}
                </p>

                <p className="m-0 text-sm text-slate-500 leading-relaxed">
                  {step.details}
                </p>

                {step.number === '1' && (
                  <div className="mt-4 pt-3 border-t border-slate-200/80">
                    <Link
                      to="/scrap-my-car"
                      className="text-xs font-bold text-[#0f7b4f] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Try our instant quote calculator</span>
                      <span>→</span>
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* What to Prepare on Collection Day */}
          <div className="mt-16 rounded-2xl border border-slate-200 bg-white p-8 sm:p-10 shadow-xs">
            <div className="max-w-[700px] mb-8">
              <span className="mb-2 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f7b4f]">
                Collection Guidance
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">
                What You Need on Collection Day
              </h2>
              <p className="text-slate-600 text-sm sm:text-base m-0">
                To ensure a smooth collection and handover, please have the following items ready for the recovery driver:
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {collectionRequirements.map((req) => (
                <div key={req.title} className="flex gap-3.5 items-start">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald-100 text-xs font-black text-[#0f7b4f]">
                    ✓
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">{req.title}</h3>
                    <p className="text-sm text-slate-500 m-0 leading-relaxed">{req.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-xs text-slate-500 m-0">
                Have questions about missing documents or vehicle condition?
              </p>
              <Link
                to="/faqs"
                className="text-xs font-extrabold text-[#0f7b4f] hover:underline inline-flex items-center gap-1"
              >
                <span>Read our Scrap Car FAQs</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Simple CTA Box */}
          <div className="mt-12 rounded-2xl bg-[#edf7f2] border border-[#c9e8d8] p-8 text-center sm:p-12">
            <h2 className="mb-3 text-2xl sm:text-3xl font-black text-[#175c40]">
              Ready to get your scrap car quote?
            </h2>
            <p className="mb-8 text-slate-600 max-w-[500px] mx-auto text-sm sm:text-base">
              It takes less than 2 minutes. No hidden fees, no obligation.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link className={primaryBtnClass} to="/scrap-my-car">
                Get My Quote →
              </Link>
              <a className={ghostBtnClass} href="tel:+447714423293">
                Call Us (07714 423293)
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
