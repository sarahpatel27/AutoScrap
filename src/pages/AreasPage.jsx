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
            <section className="areas-hero">
                <div className="container areas-hero-grid">
                    <div className="areas-hero-content">
                        <span className="eyebrow">UK vehicle collection</span>

                        <h1>Areas We Cover</h1>

                        <p>
                            MyAutoScrap arranges scrap vehicle collection across major UK
                            cities and surrounding areas. Check your postcode or select your
                            nearest city to get started.
                        </p>

                        <div className="actions">
                            <Link to="/quote" className="btn btn-primary">
                                Get My Quote
                            </Link>

                            <a className="btn btn-secondary" href="tel:08001234567">
                                Call Us
                            </a>

                            <a
                                className="btn btn-whatsapp"
                                href="https://wa.me/447700900000"
                                target="_blank"
                                rel="noreferrer"
                            >
                                WhatsApp
                            </a>
                        </div>
                    </div>

                    <form className="postcode-checker-card" onSubmit={checkPostcode}>
                        <span className="eyebrow">Check your area</span>

                        <h2>Search by postcode</h2>

                        <p>
                            Enter your vehicle collection postcode to check whether our
                            collection network may cover your area.
                        </p>

                        <label htmlFor="coverage-postcode">
                            Collection postcode
                        </label>

                        <div className="postcode-input-group">
                            <input
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

                            <button className="btn btn-primary" type="submit">
                                Check Coverage
                            </button>
                        </div>

                        {result && (
                            <div className={`coverage-result ${resultType}`}>
                                {result}
                            </div>
                        )}

                        {resultType === 'success' && (
                            <Link
                                className="btn btn-primary btn-block"
                                to={`/quote?postcode=${encodeURIComponent(postcode.trim())}`}
                            >
                                Get a Quote for {postcode.trim()}
                            </Link>
                        )}
                    </form>
                </div>
            </section>

            <section className="section covered-cities-section">
                <div className="container">
                    <div className="section-title center">
                        <span className="eyebrow">Covered cities</span>

                        <h2>Popular Collection Locations</h2>

                        <p>
                            Select a city to view its covered areas or begin a location-based
                            scrap car quotation.
                        </p>
                    </div>

                    <div className="city-list">
                        {locations.map((location) => (
                            <a
                                key={location.slug}
                                href={`#${location.slug}`}
                                className="city-list-item"
                            >
                                <span className="city-list-icon">📍</span>
                                <span>{location.city}</span>
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section area-cards-section">
                <div className="container">
                    <div className="section-title">
                        <span className="eyebrow">Local collection</span>

                        <h2>Browse Covered Areas</h2>

                        <p>
                            Our collection network covers major cities and many surrounding
                            districts.
                        </p>
                    </div>

                    <div className="area-cards-grid">
                        {locations.map((location) => (
                            <article
                                className="area-card"
                                id={location.slug}
                                key={location.slug}
                            >
                                <div className="area-card-header">
                                    <div className="area-card-icon">📍</div>

                                    <div>
                                        <span className="area-card-label">
                                            Vehicle collection
                                        </span>

                                        <h3>{location.city}</h3>
                                    </div>
                                </div>

                                <p>{location.description}</p>

                                <div className="covered-area-list">
                                    <h4>Areas covered</h4>

                                    <div className="area-tags">
                                        {location.areas.map((area) => (
                                            <span key={area}>{area}</span>
                                        ))}
                                    </div>
                                </div>

                                <div className="area-actions">
                                    <Link
                                        to={`/quote?location=${encodeURIComponent(location.city)}`}
                                        className="btn btn-primary"
                                    >
                                        Scrap My Car in {location.city}
                                    </Link>

                                    <Link
                                        to={`/areas-we-cover/${location.slug}`}
                                        className="btn btn-secondary"
                                    >
                                        View {location.city} Areas
                                    </Link>
                                </div>

                                <div className="area-contact-actions">
                                    <a href="tel:08001234567">
                                        Call for {location.city}
                                    </a>

                                    <a
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

            <section className="section coverage-map-section">
                <div className="container">
                    <div className="section-title center">
                        <span className="eyebrow">Coverage map</span>

                        <h2>Vehicle Collection Across the UK</h2>

                        <p>
                            View our major service locations and surrounding collection
                            areas.
                        </p>
                    </div>

                    <div className="map-wrapper">
                        <iframe
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

                    <div className="map-location-buttons">
                        {locations.map((location) => (
                            <a
                                key={location.slug}
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    `${location.city}, UK`,
                                )}`}
                                target="_blank"
                                rel="noreferrer"
                                className="map-location-button"
                            >
                                View {location.city} on Map
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section locations-cta-section">
                <div className="container">
                    <div className="locations-cta">
                        <div>
                            <span className="eyebrow">Cannot see your area?</span>

                            <h2>We may still be able to collect your vehicle</h2>

                            <p>
                                Enter your postcode or contact our team to confirm collection
                                availability in your location.
                            </p>
                        </div>

                        <div className="actions">
                            <Link to="/quote" className="btn btn-primary">
                                Check My Vehicle
                            </Link>

                            <a className="btn btn-secondary" href="tel:08001234567">
                                Call 0800 123 4567
                            </a>

                            <a
                                className="btn btn-whatsapp"
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