import { Link } from 'react-router';
import { locations } from '../data/siteData';
import PostcodeCheckerForm from '../components/PostcodeCheckerForm';
import CityQuickLinkCard from '../components/CityQuickLinkCard';
import LocationCard from '../components/LocationCard';
import CoverageMapSection from '../components/CoverageMapSection';
import UnlistedAreaCTA from '../components/UnlistedAreaCTA';

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
    return (
        <>
            {/* Hero Section with Postcode Search Form */}
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

                            <a className={secondaryButtonClass} href="tel:+447714423293">
                                Call Us
                            </a>

                            <a
                                className={whatsAppButtonClass}
                                href="https://wa.me/447714423293"
                                target="_blank"
                                rel="noreferrer"
                            >
                                WhatsApp
                            </a>
                        </div>
                    </div>

                    <PostcodeCheckerForm />
                </div>
            </section>

            {/* Popular City Quick-Links Section */}
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
                            <CityQuickLinkCard key={location.slug} location={location} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Detailed Location Cards Section */}
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
                            <LocationCard key={location.slug} location={location} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Map Embed Section */}
            <CoverageMapSection locations={locations} />

            {/* Unlisted Area Call-to-Action */}
            <UnlistedAreaCTA />
        </>
    );
}
