import { Link } from 'react-router';

const primaryButtonClass =
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#0f7b4f] px-[22px] py-3.5 font-extrabold text-white shadow-[0_10px_25px_rgba(15,123,79,0.23)] transition hover:-translate-y-0.5 hover:bg-[#075b3a] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0';
const secondaryButtonClass =
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-[22px] py-3.5 font-extrabold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0';

export default function LocationCard({ location }) {
    return (
        <article
            className="flex scroll-mt-[110px] flex-col rounded-[20px] border border-gray-200 bg-white p-[22px] shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-7"
            id={location.slug}
        >
            <div className="flex items-center gap-[15px]">
                <div className="grid h-[54px] w-[54px] shrink-0 place-items-center rounded-[14px] bg-[#edf7f2] text-[26px]">
                    📍
                </div>

                <div>
                    <span className="text-[13px] font-extrabold uppercase tracking-[0.05em] text-[#0f7b4f]">
                        Vehicle collection
                    </span>

                    <h3 className="mt-[3px] mb-0 text-[26px]">
                        {location.city}
                    </h3>
                </div>
            </div>

            <p className="my-[18px] leading-[1.65] text-gray-500">
                {location.description}
            </p>

            <div className="flex-1">
                <h4 className="mb-3 text-[15px]">Areas covered</h4>

                <div className="flex flex-wrap gap-2">
                    {location.areas.map((area) => (
                        <span
                            className="rounded-full bg-gray-100 px-[11px] py-[7px] text-[13px] text-gray-700"
                            key={area}
                        >
                            {area}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mt-6 grid gap-[11px] sm:grid-cols-2">
                <Link
                    to={`/quote?location=${encodeURIComponent(location.city)}`}
                    className={`${primaryButtonClass} min-h-[46px] px-3.5 py-[11px] text-center`}
                >
                    Scrap My Car in {location.city}
                </Link>

                <Link
                    to={`/areas-we-cover/${location.slug}`}
                    className={`${secondaryButtonClass} min-h-[46px] px-3.5 py-[11px] text-center`}
                >
                    View {location.city} Areas
                </Link>
            </div>

            <div className="mt-4 flex flex-col items-start gap-2 border-t border-gray-200 pt-4 sm:flex-row sm:justify-between sm:gap-4">
                <a
                    className="text-[13px] font-bold text-[#0f7b4f] hover:underline"
                    href="tel:+447714423293"
                >
                    Call for {location.city}
                </a>

                <a
                    className="text-[13px] font-bold text-[#0f7b4f] hover:underline"
                    href={`https://wa.me/447714423293?text=${encodeURIComponent(
                        `Hello, I would like a scrap car quote in ${location.city}.`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                >
                    WhatsApp {location.city} Team
                </a>
            </div>
        </article>
    );
}
