import { Link } from 'react-router';

const containerClass = 'mx-auto w-[calc(100%-36px)] max-w-[1180px]';
const lightEyebrowClass =
    'mb-4 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#dff46b]';
const primaryButtonClass =
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#0f7b4f] px-[22px] py-3.5 font-extrabold text-white shadow-[0_10px_25px_rgba(15,123,79,0.23)] transition hover:-translate-y-0.5 hover:bg-[#075b3a] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0';
const secondaryButtonClass =
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-[22px] py-3.5 font-extrabold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0';
const whatsAppButtonClass =
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#25d366] px-[22px] py-3.5 font-extrabold text-[#082d1c] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0';

export default function UnlistedAreaCTA() {
    return (
        <section className="bg-slate-50 py-[68px] sm:py-[92px]">
            <div className={containerClass}>
                <div className="flex flex-col items-start gap-9 rounded-3xl bg-emerald-950 px-[22px] py-7 text-white min-[1100px]:flex-row min-[1100px]:items-center min-[1100px]:justify-between sm:p-10">
                    <div>
                        <span className={lightEyebrowClass}>
                            Cannot see your area?
                        </span>

                        <h2 className="my-2 max-w-[650px] text-[clamp(28px,4vw,40px)]">
                            We may still be able to collect your vehicle
                        </h2>

                        <p className="m-0 max-w-[650px] leading-[1.7] text-white/80">
                            Enter your postcode or contact our team to confirm collection
                            availability in your location.
                        </p>
                    </div>

                    <div className="grid w-full shrink-0 grid-cols-1 gap-3 min-[1100px]:flex min-[1100px]:w-auto min-[1100px]:flex-wrap">
                        <Link
                            to="/quote"
                            className={`${primaryButtonClass} w-full min-[1100px]:w-auto`}
                        >
                            Check My Vehicle
                        </Link>

                        <a
                            className={`${secondaryButtonClass} w-full min-[1100px]:w-auto`}
                            href="tel:+447714423293"
                        >
                            Call +44 7714423293
                        </a>

                        <a
                            className={`${whatsAppButtonClass} w-full min-[1100px]:w-auto`}
                            href="https://wa.me/447714423293"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Ask on WhatsApp
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
