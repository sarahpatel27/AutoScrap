import QuoteFlow from '../components/QuoteFlow';

const containerClass = 'mx-auto w-[calc(100%-36px)] max-w-[1180px]';

export default function QuotePage() {
  return (
    <>
      <section className="bg-linear-to-br from-[#0a3626] to-[#0f704a] py-[82px] text-white">
        <div className={containerClass}>
          <span className="mb-4 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#dff46b]">
            Instant quote
          </span>
          <h1 className="mb-3.5 max-w-[900px] text-[clamp(2.5rem,5vw,4.5rem)] leading-tight">
            Get your estimated scrap value
          </h1>
          <p className="m-0 max-w-[760px] text-[1.08rem] text-[#d7e9e1]">
            Complete the guided form below. The current frontend uses realistic
            mock vehicle and pricing services, ready to be replaced with your
            backend APIs.
          </p>
        </div>
      </section>

      <section className="bg-[#f7f8f3] py-[68px] sm:py-[92px]">
        <div className={containerClass}>
          <QuoteFlow />
        </div>
      </section>
    </>
  );
}
