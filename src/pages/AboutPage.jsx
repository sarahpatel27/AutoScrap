import {
    CTA,
    PageHero,
    SectionTitle,
} from '../components/Common';

export default function AboutPage() {
    return (
        <>
            <PageHero
                eyebrow="About MyAutoScrap"
                title="Making vehicle disposal clearer and easier"
                text="A professional digital experience built around transparent estimates, responsible vehicle recycling and helpful customer service."
            />

            {/* Company introduction and mission */}
            <section className="section">
                <div className="container about-grid">
                    <div>
                        <span className="eyebrow">Who we are</span>

                        <h2>
                            A simpler way to scrap your vehicle
                        </h2>

                        <p>
                            MyAutoScrap helps customers receive an estimated
                            scrap value for their vehicle through a simple and
                            guided online process. Customers can enter their
                            vehicle registration, confirm the vehicle details,
                            answer a few condition-related questions and submit
                            an enquiry to the MyAutoScrap team.
                        </p>

                        <p>
                            The platform is designed to make vehicle disposal
                            easier to understand by bringing vehicle information,
                            condition details, pricing calculations and customer
                            enquiries together in one convenient experience.
                        </p>

                        <div className="about-mission">
                            <span className="eyebrow">Our mission</span>

                            <h2>
                                Remove the stress from scrapping a vehicle
                            </h2>

                            <p>
                                Our mission is to provide customers with a clear,
                                respectful and convenient way to understand their
                                vehicle's estimated scrap value before arranging
                                collection.
                            </p>

                            <p>
                                We aim to make every stage, from the first
                                registration search to the final enquiry, simple,
                                transparent and easy to complete.
                            </p>
                        </div>
                    </div>

                    <div className="about-panel">
                        <h3>
                            Why customers can trust MyAutoScrap
                        </h3>

                        <ul>
                            <li>
                                Clear estimated price breakdowns
                            </li>

                            <li>
                                No-obligation online enquiries
                            </li>

                            <li>
                                Secure handling of customer details
                            </li>

                            <li>
                                Transparent bonuses and deductions
                            </li>

                            <li>
                                Support by phone, WhatsApp and email
                            </li>

                            <li>
                                Responsible vehicle recycling focus
                            </li>

                            <li>
                                Straightforward collection process
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Experience section */}
            <section className="section alt">
                <div className="container">
                    <SectionTitle
                        eyebrow="Our experience"
                        title="A process designed around vehicle collection"
                        text="MyAutoScrap combines vehicle information, customer details and condition data to help the collection team respond efficiently."
                    />

                    <div className="benefit-grid">
                        <article className="benefit-card">
                            <div className="icon-box">🚗</div>

                            <h3>Vehicle knowledge</h3>

                            <p>
                                Vehicle registration details, specifications and
                                condition information are brought together to
                                support a more accurate estimated quotation.
                            </p>
                        </article>

                        <article className="benefit-card">
                            <div className="icon-box">£</div>

                            <h3>Pricing experience</h3>

                            <p>
                                Estimated values can consider vehicle weight,
                                current pricing rules, bonuses, missing parts and
                                condition-related deductions.
                            </p>
                        </article>

                        <article className="benefit-card">
                            <div className="icon-box">📍</div>

                            <h3>Collection support</h3>

                            <p>
                                Customer and collection details are gathered in one
                                structured enquiry so the team can arrange the next
                                steps efficiently.
                            </p>
                        </article>

                        <article className="benefit-card">
                            <div className="icon-box">✓</div>

                            <h3>Clear communication</h3>

                            <p>
                                Customers receive a clear vehicle summary,
                                estimated quote and enquiry reference before being
                                contacted by the MyAutoScrap team.
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            {/* Environmental recycling section */}
            <section className="section">
                <div className="container about-grid">
                    <div>
                        <span className="eyebrow">
                            Responsible vehicle recycling
                        </span>

                        <h2>
                            Supporting environmentally responsible disposal
                        </h2>

                        <p>
                            End-of-life vehicles contain metals, parts, fluids and
                            other materials that should be handled carefully.
                            MyAutoScrap promotes responsible vehicle recycling and
                            the recovery of materials that may be reused or
                            recycled.
                        </p>

                        <p>
                            The objective is to reduce unnecessary waste and help
                            ensure that vehicles are handled through an organised
                            and environmentally responsible process.
                        </p>

                        <p>
                            Where applicable, reusable parts and recyclable
                            materials may be recovered, while unsuitable
                            components should be handled and disposed of
                            appropriately.
                        </p>
                    </div>

                    <div className="about-panel">
                        <h3>
                            Our recycling priorities
                        </h3>

                        <ul>
                            <li>
                                Responsible handling of end-of-life vehicles
                            </li>

                            <li>
                                Recovery of recyclable metals and materials
                            </li>

                            <li>
                                Reuse of suitable vehicle parts where possible
                            </li>

                            <li>
                                Reduction of unnecessary vehicle waste
                            </li>

                            <li>
                                Proper handling of fluids and hazardous materials
                            </li>

                            <li>
                                Environmentally conscious collection processes
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Customer service section */}
            <section className="section alt">
                <div className="container">
                    <SectionTitle
                        eyebrow="Customer service"
                        title="Helpful support throughout the journey"
                        text="Customers can contact the MyAutoScrap team before, during or after submitting an enquiry."
                    />

                    <div className="benefit-grid">
                        <article className="benefit-card">
                            <div className="icon-box">☎</div>

                            <h3>Phone support</h3>

                            <p>
                                Speak directly with the team if you need help with
                                your vehicle, quotation or collection enquiry.
                            </p>
                        </article>

                        <article className="benefit-card">
                            <div className="icon-box">💬</div>

                            <h3>WhatsApp support</h3>

                            <p>
                                Contact the team quickly through WhatsApp for
                                questions about quotations, vehicle details or
                                collection availability.
                            </p>
                        </article>

                        <article className="benefit-card">
                            <div className="icon-box">✉</div>

                            <h3>Email assistance</h3>

                            <p>
                                Send detailed questions or additional information
                                through email or the website contact form.
                            </p>
                        </article>

                        <article className="benefit-card">
                            <div className="icon-box">♥</div>

                            <h3>Customer-focused service</h3>

                            <p>
                                The process is designed to keep customers informed,
                                answer questions clearly and make collection
                                arrangements easier.
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            {/* Commitments section */}
            <section className="section">
                <div className="container">
                    <SectionTitle
                        eyebrow="Our commitments"
                        title="Built around service and responsibility"
                    />

                    <div className="benefit-grid">
                        <article className="benefit-card">
                            <div className="icon-box">♻</div>

                            <h3>Environmental care</h3>

                            <p>
                                Promote responsible vehicle recycling and proper
                                handling of reusable and recyclable materials.
                            </p>
                        </article>

                        <article className="benefit-card">
                            <div className="icon-box">✓</div>

                            <h3>Transparent pricing</h3>

                            <p>
                                Show customers how the estimate is calculated,
                                including the base value, bonuses and deductions.
                            </p>
                        </article>

                        <article className="benefit-card">
                            <div className="icon-box">♥</div>

                            <h3>Customer support</h3>

                            <p>
                                Keep phone, WhatsApp and email support available
                                throughout the customer journey.
                            </p>
                        </article>

                        <article className="benefit-card">
                            <div className="icon-box">⚙</div>

                            <h3>Reliable operations</h3>

                            <p>
                                Prepare each enquiry with the vehicle, condition and
                                customer information needed by the collection team.
                            </p>
                        </article>
                    </div>
                </div>
            </section>

            {/* Contact call-to-action */}
            <CTA />
        </>
    );
}