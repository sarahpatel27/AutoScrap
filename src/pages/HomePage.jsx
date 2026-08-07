import { Link } from 'react-router';
import QuoteFlow from '../components/QuoteFlow';
import FAQList from '../components/FAQList';
import { cities, faqs, reviews } from '../data/siteData';

const benefits = [
  ['£', 'Competitive estimates', 'Transparent pricing based on vehicle details, weight and condition.'],
  ['🚚', 'Convenient collection', 'Arrange collection from your home, workplace or another suitable location.'],
  ['♻', 'Responsible recycling', 'Vehicles are handled through responsible recycling and disposal processes.'],
  ['☎', 'Helpful support', 'Speak to a real team member by phone or WhatsApp when you need help.'],
];

const steps = [
  ['1', 'Enter your registration', 'We retrieve or mock the vehicle details.'],
  ['2', 'Confirm the condition', 'Answer five straightforward questions.'],
  ['3', 'Receive an estimate', 'Review the price breakdown and validity.'],
  ['4', 'Arrange collection', 'Submit the enquiry and our team contacts you.'],
];

const containerClass = 'mx-auto w-[calc(100%-32px)] max-w-[1180px]';
const sectionClass = 'py-[68px] sm:py-[92px]';
const eyebrowClass =
  'mb-4 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f7b4f]';
const lightEyebrowClass = `${eyebrowClass} text-[#dff46b]`;
const sectionTitleClass = 'mx-auto mb-11 max-w-[700px] text-center';
const sectionHeadingClass = 'mb-3.5 text-[clamp(2rem,4vw,3.15rem)] leading-tight';
const primaryButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#0f7b4f] px-[22px] py-3.5 font-extrabold text-white shadow-[0_10px_25px_rgba(15,123,79,0.23)] transition hover:-translate-y-0.5 hover:bg-[#075b3a]';
const secondaryButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-[22px] py-3.5 font-extrabold text-slate-950 transition hover:-translate-y-0.5';
const lightButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#dff46b] px-[22px] py-3.5 font-extrabold text-[#13231d] transition hover:-translate-y-0.5';
const ghostButtonClass =
  'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/35 px-[22px] py-3.5 font-extrabold text-white transition hover:-translate-y-0.5';

function HomeSectionTitle({ eyebrow, title, text, light = false }) {
  return (
    <div className={sectionTitleClass}>
      <span className={light ? lightEyebrowClass : eyebrowClass}>{eyebrow}</span>
      <h2 className={`${sectionHeadingClass} ${light ? 'text-white' : ''}`}>
        {title}
      </h2>
      {text && (
        <p className={`m-0 text-[1.06rem] leading-[1.7] ${light ? 'text-white/75' : 'text-slate-500'}`}>
          {text}
        </p>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="relative flex min-h-0 items-center overflow-hidden bg-linear-115 from-[#0c3d2a] from-0% via-[#0f6b47] via-60% to-[#1b8a5d] text-white lg:min-h-[690px]">
        <div className="absolute -top-[100px] -right-40 h-[520px] w-[520px] rounded-full border-[90px] border-[#dff46b]/10" />

        <div className={`${containerClass} relative z-10 grid items-center gap-7 py-[55px] text-center lg:grid-cols-[1.08fr_0.92fr] lg:gap-[70px] lg:py-[70px] lg:text-left`}>
          <div className="min-w-0">
            <span className={lightEyebrowClass}>Fast · Simple · No obligation</span>

            <h1 className="mb-[18px] text-[3.1rem] leading-[1.05] tracking-[-0.055em] sm:text-[clamp(2.5rem,6vw,5.2rem)]">
              Scrap Your Car <em className="not-italic text-[#dff46b]">Today</em>
            </h1>

            <p className="mx-auto max-w-[610px] text-[1.16rem] leading-[1.7] text-[#dcece5] lg:mx-0">
              Get an estimated value in minutes. Enter your registration,
              confirm your car and arrange convenient collection.
            </p>

            <div className="my-6 flex flex-wrap justify-center gap-2.5 text-sm font-bold sm:gap-[22px] sm:text-base lg:justify-start">
              <span>✓ Free estimate</span>
              <span>✓ Fast response</span>
              <span>✓ UK coverage</span>
            </div>

            <div className="mx-auto flex w-max max-w-full flex-wrap items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/10 px-[15px] py-3 lg:mx-0">
              <b>4.8/5</b>
              <span className="tracking-[2px] text-yellow-300">★★★★★</span>
              <span className="text-sm text-[#d5e5de]">
                Based on verified customer feedback
              </span>
            </div>
          </div>

          <QuoteFlow compact />
        </div>
      </section>

      <section className="border-b border-slate-200 bg-[#f5f8f5]">
        <div className={`${containerClass} grid gap-5 py-[19px] text-center text-sm font-extrabold text-[#355146] sm:grid-cols-2 lg:grid-cols-4`}>
          <span>✓ No hidden enquiry fee</span>
          <span>✓ Non-running cars accepted</span>
          <span>✓ Secure customer details</span>
          <span>✓ Friendly UK support</span>
        </div>
      </section>

      <section className={sectionClass}>
        <div className={containerClass}>
          <HomeSectionTitle
            eyebrow="Simple from start to finish"
            title="How it works"
            text="Turn an unwanted vehicle into a completed enquiry in a few clear steps."
          />

          <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([number, title, description]) => (
              <div
                className="h-full min-w-0 rounded-[18px] border border-slate-200 bg-white p-[26px]"
                key={number}
              >
                <span className="mb-[22px] grid h-11 w-11 place-items-center rounded-xl bg-[#dff46b] font-black">
                  {number}
                </span>
                <h3 className="mb-3.5 text-[1.18rem]">{title}</h3>
                <p className="m-0 text-slate-500">{description}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link className={`${secondaryButtonClass} w-full text-center sm:w-auto`} to="/how-it-works">
              See the full process
            </Link>
          </div>
        </div>
      </section>

      <section className={`${sectionClass} bg-[#f7f8f3]`}>
        <div className={containerClass}>
          <HomeSectionTitle
            eyebrow="Why MyAutoScrap"
            title="A better way to handle your old car"
          />

          <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(([icon, title, description]) => (
              <article
                className="h-full min-w-0 rounded-[18px] border border-slate-200 bg-white p-[26px] shadow-[0_8px_30px_rgba(30,70,50,0.05)]"
                key={title}
              >
                <div className="mb-[22px] grid h-12 w-12 place-items-center rounded-[13px] bg-emerald-50 text-xl font-black text-[#0f7b4f]">
                  {icon}
                </div>
                <h3 className="mb-3.5 text-[1.18rem]">{title}</h3>
                <p className="m-0 text-slate-500">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={sectionClass}>
        <div className={containerClass}>
          <HomeSectionTitle
            eyebrow="Nationwide network"
            title="Popular areas we cover"
            text="Search your postcode or explore example service areas."
          />

          <div className="grid gap-[22px] md:grid-cols-3">
            {cities.map((city) => (
              <article
                className="relative overflow-hidden rounded-[18px] border border-slate-200 bg-white p-[26px]"
                key={city.name}
              >
                <div className="absolute top-1 right-4 font-['Manrope'] text-[3.4rem] font-black text-slate-100">
                  {city.code}
                </div>
                <h3 className="relative mb-3.5 text-[1.18rem]">{city.name}</h3>
                <p className="relative text-slate-500">{city.areas}</p>
                <Link className="relative font-extrabold text-[#0f7b4f]" to="/quote">
                  Get a local quote →
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link className={`${secondaryButtonClass} w-full text-center sm:w-auto`} to="/areas-we-cover">
              Explore all coverage
            </Link>
          </div>
        </div>
      </section>

      <section className={`${sectionClass} bg-[#102f24]`}>
        <div className={containerClass}>
          <HomeSectionTitle
            eyebrow="Customer experiences"
            title="What drivers say"
            light
          />

          <div className="grid gap-[22px] md:grid-cols-3">
            {reviews.map((review) => (
              <article
                className="rounded-[18px] border border-slate-200 bg-white p-[26px]"
                key={review.name}
              >
                <div className="tracking-[2px] text-yellow-300">
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(5 - review.rating)}
                </div>
                <p className="text-base text-slate-600">“{review.text}”</p>
                <div className="flex flex-col">
                  <b>{review.name}</b>
                  <span className="text-sm text-slate-500">
                    {review.vehicle} · {review.date}
                  </span>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-9 flex items-center justify-center gap-[18px] text-white">
            <strong className="text-5xl">4.8</strong>
            <div>
              <span className="tracking-[2px] text-yellow-300">★★★★★</span>
              <p className="m-0 text-[#c8d8d1]">
                Excellent overall customer rating
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={`${sectionClass} bg-[#f7f8f3]`}>
        <div className={`${containerClass} max-w-[820px]`}>
          <HomeSectionTitle
            eyebrow="Questions answered"
            title="Frequently asked questions"
          />
          <FAQList items={faqs.slice(0, 5)} />

          <div className="mt-8 flex justify-center">
            <Link className={`${secondaryButtonClass} w-full text-center sm:w-auto`} to="/faqs">
              View all FAQs
            </Link>
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
