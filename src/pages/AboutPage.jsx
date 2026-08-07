import { Link } from 'react-router';

const trustItems = [
  'Clear estimated price breakdowns',
  'No-obligation online enquiries',
  'Secure handling of customer details',
  'Transparent bonuses and deductions',
  'Support by phone, WhatsApp and email',
  'Responsible vehicle recycling focus',
  'Straightforward collection process',
];

const recyclingItems = [
  'Responsible handling of end-of-life vehicles',
  'Recovery of recyclable metals and materials',
  'Reuse of suitable vehicle parts where possible',
  'Reduction of unnecessary vehicle waste',
  'Proper handling of fluids and hazardous materials',
  'Environmentally conscious collection processes',
];

const experienceCards = [
  [
    'CAR',
    'Vehicle knowledge',
    'Vehicle registration details, specifications and condition information are brought together to support a more accurate estimated quotation.',
  ],
  [
    'GBP',
    'Pricing experience',
    'Estimated values can consider vehicle weight, current pricing rules, bonuses, missing parts and condition-related deductions.',
  ],
  [
    'PIN',
    'Collection support',
    'Customer and collection details are gathered in one structured enquiry so the team can arrange the next steps efficiently.',
  ],
  [
    '✓',
    'Clear communication',
    'Customers receive a clear vehicle summary, estimated quote and enquiry reference before being contacted by the MyAutoScrap team.',
  ],
];

const supportCards = [
  [
    'TEL',
    'Phone support',
    'Speak directly with the team if you need help with your vehicle, quotation or collection enquiry.',
  ],
  [
    'WA',
    'WhatsApp support',
    'Contact the team quickly through WhatsApp for questions about quotations, vehicle details or collection availability.',
  ],
  [
    'MAIL',
    'Email assistance',
    'Send detailed questions or additional information through email or the website contact form.',
  ],
  [
    'CARE',
    'Customer-focused service',
    'The process is designed to keep customers informed, answer questions clearly and make collection arrangements easier.',
  ],
];

const commitmentCards = [
  [
    'REC',
    'Environmental care',
    'Promote responsible vehicle recycling and proper handling of reusable and recyclable materials.',
  ],
  [
    '✓',
    'Transparent pricing',
    'Show customers how the estimate is calculated, including the base value, bonuses and deductions.',
  ],
  [
    'HELP',
    'Customer support',
    'Keep phone, WhatsApp and email support available throughout the customer journey.',
  ],
  [
    'OPS',
    'Reliable operations',
    'Prepare each enquiry with the vehicle, condition and customer information needed by the collection team.',
  ],
];

const containerClass = 'mx-auto w-[calc(100%-36px)] max-w-[1180px]';
const sectionClass = 'py-[68px] sm:py-[92px]';
const eyebrowClass =
  'mb-4 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f7b4f]';
const lightEyebrowClass = `${eyebrowClass} text-[#dff46b]`;
const headingClass = 'mb-3.5 text-[clamp(2rem,4vw,3.15rem)] leading-tight';
const sectionTitleClass = 'mx-auto mb-11 max-w-[700px] text-center';
const cardClass =
  'h-full rounded-[18px] border border-slate-200 bg-white p-[26px] shadow-[0_8px_30px_rgba(30,70,50,0.05)]';
const iconClass =
  'mb-[22px] grid h-12 w-12 place-items-center rounded-[13px] bg-emerald-50 text-[0.72rem] font-black text-[#0f7b4f]';
const lightButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#dff46b] px-[22px] py-3.5 font-extrabold text-slate-950 transition hover:-translate-y-0.5';
const ghostButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/35 px-[22px] py-3.5 font-extrabold text-white transition hover:-translate-y-0.5';

function SectionTitle({ eyebrow, title, text }) {
  return (
    <div className={sectionTitleClass}>
      <span className={eyebrowClass}>{eyebrow}</span>
      <h2 className={headingClass}>{title}</h2>
      {text && <p className="m-0 text-[1.06rem] leading-[1.7] text-slate-500">{text}</p>}
    </div>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <article className={cardClass}>
      <div className={iconClass}>{icon}</div>
      <h3 className="mb-3.5 text-[1.18rem]">{title}</h3>
      <p className="m-0 text-slate-500">{text}</p>
    </article>
  );
}

function ChecklistPanel({ title, items }) {
  return (
    <aside className="rounded-[20px] bg-[#103a2b] p-8 text-white sm:p-9">
      <h3 className="mb-3.5 text-[28px] leading-tight">{title}</h3>
      <ul className="mt-5 space-y-3 p-0">
        {items.map((item) => (
          <li className="flex gap-3 leading-[1.55] text-[#d5e5de]" key={item}>
            <span className="font-extrabold text-[#25d366]">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default function AboutPage() {
  return (
    <>
      <section className="bg-linear-to-br from-[#0a3626] to-[#0f704a] py-[82px] text-white">
        <div className={containerClass}>
          <span className={lightEyebrowClass}>About MyAutoScrap</span>
          <h1 className="mb-3.5 max-w-[900px] text-[clamp(2.5rem,5vw,4.5rem)] leading-tight">
            Making vehicle disposal clearer and easier
          </h1>
          <p className="m-0 max-w-[760px] text-[1.08rem] text-[#d7e9e1]">
            A professional digital experience built around transparent
            estimates, responsible vehicle recycling and helpful customer
            service.
          </p>
        </div>
      </section>

      <section className={sectionClass}>
        <div className={`${containerClass} grid items-center gap-[70px] lg:grid-cols-[1.3fr_0.7fr]`}>
          <div>
            <span className={eyebrowClass}>Who we are</span>
            <h2 className={headingClass}>A simpler way to scrap your vehicle</h2>
            <p className="text-slate-500">
              MyAutoScrap helps customers receive an estimated scrap value for
              their vehicle through a simple and guided online process.
              Customers can enter their vehicle registration, confirm the
              vehicle details, answer a few condition-related questions and
              submit an enquiry to the MyAutoScrap team.
            </p>
            <p className="text-slate-500">
              The platform is designed to make vehicle disposal easier to
              understand by bringing vehicle information, condition details,
              pricing calculations and customer enquiries together in one
              convenient experience.
            </p>

            <div className="mt-10">
              <span className={eyebrowClass}>Our mission</span>
              <h2 className={headingClass}>
                Remove the stress from scrapping a vehicle
              </h2>
              <p className="text-slate-500">
                Our mission is to provide customers with a clear, respectful and
                convenient way to understand their vehicle's estimated scrap
                value before arranging collection.
              </p>
              <p className="text-slate-500">
                We aim to make every stage, from the first registration search
                to the final enquiry, simple, transparent and easy to complete.
              </p>
            </div>
          </div>

          <ChecklistPanel
            title="Why customers can trust MyAutoScrap"
            items={trustItems}
          />
        </div>
      </section>

      <section className={`${sectionClass} bg-[#f7f8f3]`}>
        <div className={containerClass}>
          <SectionTitle
            eyebrow="Our experience"
            title="A process designed around vehicle collection"
            text="MyAutoScrap combines vehicle information, customer details and condition data to help the collection team respond efficiently."
          />

          <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-4">
            {experienceCards.map(([icon, title, text]) => (
              <FeatureCard icon={icon} key={title} text={text} title={title} />
            ))}
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className={`${containerClass} grid items-center gap-[70px] lg:grid-cols-[1.3fr_0.7fr]`}>
          <div>
            <span className={eyebrowClass}>Responsible vehicle recycling</span>
            <h2 className={headingClass}>
              Supporting environmentally responsible disposal
            </h2>
            <p className="text-slate-500">
              End-of-life vehicles contain metals, parts, fluids and other
              materials that should be handled carefully. MyAutoScrap promotes
              responsible vehicle recycling and the recovery of materials that
              may be reused or recycled.
            </p>
            <p className="text-slate-500">
              The objective is to reduce unnecessary waste and help ensure that
              vehicles are handled through an organised and environmentally
              responsible process.
            </p>
            <p className="text-slate-500">
              Where applicable, reusable parts and recyclable materials may be
              recovered, while unsuitable components should be handled and
              disposed of appropriately.
            </p>
          </div>

          <ChecklistPanel
            title="Our recycling priorities"
            items={recyclingItems}
          />
        </div>
      </section>

      <section className={`${sectionClass} bg-[#f7f8f3]`}>
        <div className={containerClass}>
          <SectionTitle
            eyebrow="Customer service"
            title="Helpful support throughout the journey"
            text="Customers can contact the MyAutoScrap team before, during or after submitting an enquiry."
          />

          <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-4">
            {supportCards.map(([icon, title, text]) => (
              <FeatureCard icon={icon} key={title} text={text} title={title} />
            ))}
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className={containerClass}>
          <SectionTitle
            eyebrow="Our commitments"
            title="Built around service and responsibility"
          />

          <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-4">
            {commitmentCards.map(([icon, title, text]) => (
              <FeatureCard icon={icon} key={title} text={text} title={title} />
            ))}
          </div>
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
