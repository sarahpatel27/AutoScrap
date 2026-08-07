import { useState } from 'react';
import { Link } from 'react-router';

const locations = [
    {
        city: 'London',
        slug: 'london',
        description:
            'Scrap car collection available throughout London and surrounding Greater London areas.',
        areas: [
            'Central London',
            'North London',
            'South London',
            'East London',
            'West London',
            'Croydon',
            'Enfield',
            'Harrow',
        ],
    },
    {
        city: 'Birmingham',
        slug: 'birmingham',
        description:
            'Fast vehicle collection across Birmingham and the wider West Midlands.',
        areas: [
            'Birmingham City Centre',
            'Sutton Coldfield',
            'Solihull',
            'Edgbaston',
            'Erdington',
            'Handsworth',
            'Selly Oak',
            'Yardley',
        ],
    },
    {
        city: 'Manchester',
        slug: 'manchester',
        description:
            'Reliable scrap car collection throughout Manchester and nearby towns.',
        areas: [
            'Manchester City Centre',
            'Salford',
            'Stockport',
            'Oldham',
            'Rochdale',
            'Bolton',
            'Bury',
            'Trafford',
        ],
    },
    {
        city: 'Leeds',
        slug: 'leeds',
        description:
            'Convenient scrap vehicle collection across Leeds and West Yorkshire.',
        areas: [
            'Leeds City Centre',
            'Headingley',
            'Horsforth',
            'Pudsey',
            'Morley',
            'Roundhay',
            'Beeston',
            'Chapel Allerton',
        ],
    },
    {
        city: 'Liverpool',
        slug: 'liverpool',
        description:
            'Collection services available throughout Liverpool and Merseyside.',
        areas: [
            'Liverpool City Centre',
            'Bootle',
            'Aintree',
            'Anfield',
            'Allerton',
            'Wavertree',
            'Kirkdale',
            'Toxteth',
        ],
    },
    {
        city: 'Bristol',
        slug: 'bristol',
        description:
            'Scrap car collection available across Bristol and surrounding areas.',
        areas: [
            'Bristol City Centre',
            'Clifton',
            'Bedminster',
            'Filton',
            'Fishponds',
            'Redland',
            'Southmead',
            'Kingswood',
        ],
    },
];

const containerClass = 'mx-auto w-[calc(100%-36px)] max-w-[1180px]';
const eyebrowClass =
    'mb-4 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#0f7b4f]';
const lightEyebrowClass = `${eyebrowClass} text-[#dff46b]`;
const primaryButtonClass =
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#0f7b4f] px-[22px] py-3.5 font-extrabold text-white shadow-[0_10px_25px_rgba(15,123,79,0.23)] transition hover:-translate-y-0.5 hover:bg-[#075b3a] disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0';
const secondaryButtonClass =
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-[22px] py-3.5 font-extrabold text-slate-950 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0';
const whatsAppButtonClass =
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#25d366] px-[22px] py-3.5 font-extrabold text-[#082d1c] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0';
const sectionTitleClass = 'mb-9 max-w-[700px]';
const centeredSectionTitleClass = `${sectionTitleClass} mx-auto text-center`;

export default function AreasPage() {
    const [postcode, setPostcode] = useState('');
    const [result, setResult] = useState('');
    const [resultType, setResultType] = useState('');

    const checkPostcode = (event) => {
        event.preventDefault();

        const cleanedPostcode = postcode.trim();

        if (!cleanedPostcode) {
            setResult('Please enter your collection postcode.');
            setResultType('error');
            return;
        }

        if (cleanedPostcode.length < 5) {
            setResult('Please enter a valid UK postcode.');
            setResultType('error');
            return;
        }

        setResult(
            `Great news! We may be able to collect a vehicle from ${cleanedPostcode}. Request a quote to confirm availability.`,
        );
        setResultType('success');
    };

    return (
        <>
            <section className="bg-linear-to-br from-emerald-950/95 to-[#0f704a]/90 py-16 text-white sm:py-[90px]">
                <div
                    className={`${containerClass} grid items-center gap-9 lg:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] lg:gap-14`}
                >
                    <div>
                        <span className={lightEyebrowClass}>UK vehicle collection</span>

                        <h1 className="my-2.5 text-[42px] leading-[1.05] sm:mb-[18px] sm:text-[clamp(42px,6vw,68px)]">
                            Areas We Cover
                        </h1>

                        <p className="mb-7 max-w-[650px] text-lg leading-[1.7] text-white/85">
                            MyAutoScrap arranges scrap vehicle collection across major UK
                            cities and surrounding areas. Check your postcode or select your
                            nearest city to get started.
                        </p>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                            <Link to="/quote" className={primaryButtonClass}>
                                Get My Quote
                            </Link>

                            <a className={secondaryButtonClass} href="tel:08001234567">
                                Call Us
                            </a>

                            <a
                                className={whatsAppButtonClass}
                                href="https://wa.me/447700900000"
                                target="_blank"
                                rel="noreferrer"
                            >
                                WhatsApp
                            </a>
                        </div>
                    </div>

                    <form
                        className="w-full max-w-[650px] rounded-[22px] bg-white p-[22px] text-gray-900 shadow-[0_24px_60px_rgba(0,0,0,0.2)] sm:p-[30px]"
                        onSubmit={checkPostcode}
                    >
                        <span className={eyebrowClass}>Check your area</span>

                        <h2 className="my-2 text-[clamp(30px,4vw,44px)]">
                            Search by postcode
                        </h2>

                        <p className="mb-5 leading-[1.6] text-gray-500">
                            Enter your vehicle collection postcode to check whether our
                            collection network may cover your area.
                        </p>

                        <label
                            className="mb-2 block font-bold"
                            htmlFor="coverage-postcode"
                        >
                            Collection postcode
                        </label>

                        <div className="flex flex-col gap-2.5 sm:flex-row">
                            <input
                                className="min-w-0 flex-1 rounded-[10px] border border-gray-300 px-4 py-3.5 text-base uppercase outline-none focus:border-[#0f7b4f] focus:shadow-[0_0_0_3px_rgba(15,123,79,0.1)]"
                                id="coverage-postcode"
                                type="text"
                                value={postcode}
                                onChange={(event) => {
                                    setPostcode(event.target.value.toUpperCase());
                                    setResult('');
                                    setResultType('');
                                }}
                                placeholder="SW1A 1AA"
                                autoComplete="postal-code"
                            />

                            <button
                                className={`${primaryButtonClass} w-full sm:w-auto`}
                                type="submit"
                            >
                                Check Coverage
                            </button>
                        </div>

                        {result && (
                            <div
                                className={`mt-3.5 rounded-[10px] px-[15px] py-[13px] leading-normal ${
                                    resultType === 'success'
                                        ? 'border border-[#c9e8d8] bg-[#edf7f2] text-[#175c40]'
                                        : 'border border-red-200 bg-red-50 text-red-800'
                                }`}
                            >
                                {result}
                            </div>
                        )}

                        {resultType === 'success' && (
                            <Link
                                className={`${primaryButtonClass} mt-3.5 w-full`}
                                to={`/quote?postcode=${encodeURIComponent(postcode.trim())}`}
                            >
                                Get a Quote for {postcode.trim()}
                            </Link>
                        )}
                    </form>
                </div>
            </section>

            <section className="bg-white py-[68px] sm:py-[92px]">
                <div className={containerClass}>
                    <div className={centeredSectionTitleClass}>
                        <span className={eyebrowClass}>Covered cities</span>

                        <h2 className="my-2 text-[clamp(30px,4vw,44px)]">
                            Popular Collection Locations
                        </h2>

                        <p className="m-0 leading-[1.7] text-gray-500">
                            Select a city to view its covered areas or begin a location-based
                            scrap car quotation.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5 min-[1100px]:grid-cols-6 sm:grid-cols-3">
                        {locations.map((location) => (
                            <a
                                key={location.slug}
                                href={`#${location.slug}`}
                                className="flex min-h-[105px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-[18px] text-center text-gray-900 transition hover:-translate-y-1 hover:border-[#0f7b4f] hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] sm:min-h-[120px]"
                            >
                                <span className="mb-2 text-[28px]">📍</span>
                                <span>{location.city}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-slate-50 py-[68px] sm:py-[92px]">
                <div className={containerClass}>
                    <div className={sectionTitleClass}>
                        <span className={eyebrowClass}>Local collection</span>

                        <h2 className="my-2 text-[clamp(30px,4vw,44px)]">
                            Browse Covered Areas
                        </h2>

                        <p className="m-0 leading-[1.7] text-gray-500">
                            Our collection network covers major cities and many surrounding
                            districts.
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {locations.map((location) => (
                            <article
                                className="flex scroll-mt-[110px] flex-col rounded-[20px] border border-gray-200 bg-white p-[22px] shadow-[0_12px_30px_rgba(15,23,42,0.05)] sm:p-7"
                                id={location.slug}
                                key={location.slug}
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
                                        href="tel:08001234567"
                                    >
                                        Call for {location.city}
                                    </a>

                                    <a
                                        className="text-[13px] font-bold text-[#0f7b4f] hover:underline"
                                        href={`https://wa.me/447700900000?text=${encodeURIComponent(
                                            `Hello, I would like a scrap car quote in ${location.city}.`,
                                        )}`}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        WhatsApp {location.city} Team
                                    </a>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

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
                                href="tel:08001234567"
                            >
                                Call 0800 123 4567
                            </a>

                            <a
                                className={`${whatsAppButtonClass} w-full min-[1100px]:w-auto`}
                                href="https://wa.me/447700900000"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Ask on WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
