const containerClass = 'mx-auto w-[calc(100%-36px)] max-w-[1180px]';
const eyebrowClass =
    'mb-4 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f7b4f]';
const centeredSectionTitleClass = 'mb-9 max-w-[700px] mx-auto text-center';

export default function CoverageMapSection({ locations }) {
    return (
        <section className="bg-white py-[68px] sm:py-[92px]">
            <div className={containerClass}>
                <div className={centeredSectionTitleClass}>
                    <span className={eyebrowClass}>Coverage map</span>

                    <h2 className="my-2 text-[clamp(30px,4vw,44px)]">
                        Vehicle Collection Across the UK
                    </h2>

                    <p className="m-0 leading-[1.7] text-gray-500">
                        View our major service locations and surrounding collection
                        areas.
                    </p>
                </div>

                <div className="overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.09)]">
                    <iframe
                        className="block min-h-[360px] w-full sm:min-h-[480px]"
                        title="MyAutoScrap UK collection coverage map"
                        src="https://www.google.com/maps?q=United+Kingdom&output=embed"
                        width="100%"
                        height="480"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>

                <div className="mt-6 flex flex-wrap justify-center gap-2.5">
                    {locations.map((location) => (
                        <a
                            key={location.slug}
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                `${location.city}, UK`,
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-[#c9e8d8] bg-[#edf7f2] px-4 py-2.5 text-sm font-bold text-[#175c40] transition hover:bg-[#0f7b4f] hover:text-white"
                        >
                            View {location.city} on Map
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
}
