import QuoteFlow from '../components/QuoteFlow';

const containerClass = 'mx-auto w-[calc(100%-36px)] max-w-[1180px]';

export default function QuotePage() {
  return (
    <div className="flex flex-col">
      {/* Hero header section: order-2 on mobile screens, order-1 on lg screens */}
      <section className="order-2 lg:order-1 bg-linear-to-br from-[#0a3626] to-[#0f704a] py-[50px] lg:py-[82px] text-white">
        <div className={containerClass}>
          <span className="mb-4 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#dff46b]">
            Instant quote
          </span>
          <h1 className="mb-3.5 max-w-[900px] text-[clamp(2.2rem,5vw,4.5rem)] leading-tight">
            Get your estimated scrap value
          </h1>
          <p className="m-0 max-w-[760px] text-[1.08rem] text-[#d7e9e1]">
            Complete the guided form to get an instant scrap vehicle estimate.
          </p>
        </div>
      </section>

      {/* QuoteFlow form section: order-1 on mobile screens, order-2 on lg screens */}
      <section className="order-1 lg:order-2 bg-[#f7f8f3] py-6 lg:py-[92px]">
        <div className={containerClass}>
          <QuoteFlow />
        </div>
      </section>
    </div>
  );
}
