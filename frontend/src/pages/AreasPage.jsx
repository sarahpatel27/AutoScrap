import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { formatCityLocation } from '../data/siteData';
import { fetchSupportedCities } from '../services/adminStore';
import PostcodeCheckerForm from '../components/PostcodeCheckerForm';
import CityQuickLinkCard from '../components/CityQuickLinkCard';
import LocationCard from '../components/LocationCard';
import CoverageMapSection from '../components/CoverageMapSection';
import UnlistedAreaCTA from '../components/UnlistedAreaCTA';
import SEO from '../components/Seo';
import { getBreadcrumbSchema } from '../config/seo.config';

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
    const [locationsList, setLocationsList] = useState([]);

    useEffect(() => {
        async function loadCities() {
            try {
                const data = await fetchSupportedCities({ active: 'true' });
                if (data && data.length > 0) {
                    setLocationsList(data.map(formatCityLocation));
                }
            } catch (err) {
                console.error('Error loading cities in AreasPage:', err);
            }
        }
        loadCities();
    }, []);

    const breadcrumbSchema = getBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Areas We Cover', url: '/areas-we-cover' }
    ]);

    return (
        <>
            <SEO
                title="Scrap Car Collection Areas UK | Nationwide Vehicle Recovery"
                description="Check MyAutoScrap coverage across our active supported UK cities and surrounding areas."
                canonical="/areas-we-cover"
                schema={breadcrumbSchema}
            />
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
                            <Link to="/scrap-my-car" className={primaryButtonClass}>
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
                        <span className={eyebrowClass}>Active Coverage</span>

                        <h2 className="my-2 text-[clamp(30px,4vw,44px)]">
                            Active Collection Areas
                        </h2>

                        <p className="m-0 leading-[1.7] text-gray-500">
                            Select an active city or district to view its covered postcodes and begin an instant scrap car quotation.
                        </p>
                    </div>

                    {locationsList.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                            <p className="font-semibold m-0">Our active service areas are updated dynamically based on active dealer coverage.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3.5 min-[1100px]:grid-cols-6 sm:grid-cols-3">
                            {locationsList.map((location) => (
                                <CityQuickLinkCard key={location.slug} location={location} />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* Detailed Location Cards Section */}
            <section className="bg-slate-50 py-[68px] sm:py-[92px]">
                <div className={containerClass}>
                    <div className={sectionTitleClass}>
                        <span className={eyebrowClass}>Verified dealer network</span>

                        <h2 className="my-2 text-[clamp(30px,4vw,44px)]">
                            Browse Covered Areas & Postcodes
                        </h2>

                        <p className="m-0 leading-[1.7] text-gray-500">
                            Our recovery network operates across active outward postcode districts with verified local dealer collection.
                        </p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {locationsList.map((location) => (
                            <LocationCard key={location.slug} location={location} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Map Embed Section */}
            <CoverageMapSection locations={locationsList} />

            {/* Unlisted Area Call-to-Action */}
            <UnlistedAreaCTA />
        </>
    );
}
