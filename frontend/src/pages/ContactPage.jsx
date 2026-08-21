import { useState } from 'react';
import SEO from '../components/Seo';
import { getOrganizationSchema } from '../config/seo.config';
import { submitContactMessage } from '../services/adminStore';
import { showToast } from '../components/admin/ToastContainer';

const contactItems = [
  {
    label: 'Phone',
    value: '+44 7714423293',
    href: 'tel:+447714423293',
  },
  {
    label: 'WhatsApp',
    value: '+44 7714423293',
    href: 'https://wa.me/447714423293',
  },
  {
    label: 'Email',
    value: 'info@myautoscrap.co.uk',
    href: 'mailto:info@myautoscrap.co.uk',
  },
  {
    label: 'Google Business Profile',
    value: 'View on Google Maps & Reviews',
    href: 'https://share.google/lppdUTbhDohi0FX8O',
    external: true,
  },
];

const fieldClass =
  'rounded-[10px] border border-slate-200 bg-white px-3.5 py-[13px] outline-none transition focus:border-[#0f7b4f] focus:shadow-[0_0_0_3px_rgba(15,123,79,0.1)]';
const labelClass = 'flex flex-col gap-[7px] text-sm font-bold text-slate-950';

function Field({ children, className = '', label }) {
  return (
    <label className={`${labelClass} ${className}`}>
      {label}
      {children}
    </label>
  );
}

function ContactRow({ href, label, value, external = false }) {
  const content = (
    <>
      <small className="text-[#a8c0b6]">{label}</small>
      <b className="text-[1.02rem] text-white flex items-center justify-between gap-2">
        <span>{value}</span>
        {external && <span className="text-xs text-[#dff46b]">↗</span>}
      </b>
    </>
  );

  if (href) {
    return (
      <a
        className="flex flex-col border-b border-white/10 py-[17px] transition hover:text-[#dff46b]"
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
      >
        {content}
      </a>
    );
  }

  return <div className="flex flex-col border-b border-white/10 py-[17px]">{content}</div>;
}

export default function ContactPage() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await submitContactMessage({
        name,
        phone,
        email,
        subject,
        message,
      });

      setSent(true);
      showToast('Message submitted successfully! Our team will get back to you shortly.', 'success');

      // Reset form
      setName('');
      setPhone('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err.message || 'Failed to submit contact message.');
      showToast(err.message || 'Failed to submit message.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const orgSchema = getOrganizationSchema();

  return (
    <>
      <SEO
        title="Contact Us | MyAutoScrap | Free Scrap Car Collection UK"
        description="Contact the MyAutoScrap team via phone, WhatsApp or email for queries regarding instant scrap car estimates and free vehicle collection."
        canonical="/contact-us"
        schema={orgSchema}
      />

      <section className="bg-linear-to-br from-[#0a3626] to-[#0f704a] py-[82px] text-white">
        <div className="mx-auto w-[calc(100%-36px)] max-w-[1180px]">
          <span className="mb-4 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#dff46b]">
            Contact us
          </span>
          <h1 className="mb-3.5 max-w-[900px] text-[clamp(2.5rem,5vw,4.5rem)] leading-tight">
            Speak with the MyAutoScrap team
          </h1>
          <p className="m-0 max-w-[760px] text-[1.08rem] text-[#d7e9e1]">
            Ask about a quote, collection, documents, an existing enquiry or
            anything else.
          </p>
        </div>
      </section>

      <section className="py-[68px] sm:py-[92px]">
        <div className="mx-auto grid w-[calc(100%-36px)] max-w-[1180px] gap-[30px] lg:grid-cols-[1.25fr_0.75fr]">
          <form
            className="rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(30,70,50,0.05)] sm:p-8"
            onSubmit={handleSubmit}
          >
            <h2 className="mb-6 text-[clamp(1.8rem,3vw,2.35rem)] leading-tight">
              Send us a message
            </h2>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-bold text-red-800">
                ⚠️ {error}
              </div>
            )}

            <div className="grid gap-x-[18px] gap-y-[15px] md:grid-cols-2">
              <Field label="Name *">
                <input
                  className={fieldClass}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </Field>
              <Field label="Phone number *">
                <input
                  className={fieldClass}
                  type="tel"
                  inputMode="numeric"
                  required
                  placeholder="e.g. 07714 423293"
                  maxLength={15}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
              <Field label="Email *">
                <input
                  className={fieldClass}
                  required
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field label="Subject *">
                <input
                  className={fieldClass}
                  required
                  placeholder="Enquiry subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </Field>
              <Field className="md:col-span-2" label="Message *">
                <textarea
                  className={`${fieldClass} min-h-[156px] resize-y`}
                  required
                  rows="6"
                  placeholder="How can we help you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </Field>
            </div>

            {sent && (
              <div className="mt-5 rounded-xl border border-[#c9e8d8] bg-[#edf7f2] px-4 py-3 font-bold text-[#175c40]">
                ✅ Thank you - your message has been sent to our team!
              </div>
            )}

            <button
              disabled={loading}
              className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#0f7b4f] px-[22px] py-3.5 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#075b3a] disabled:opacity-50"
              type="submit"
            >
              {loading ? 'Submitting message...' : 'Submit message'}
            </button>
          </form>

          <aside className="flex flex-col gap-2.5 rounded-[20px] bg-[#103a2b] p-6 text-white sm:p-8">
            <span className="mb-2 inline-block text-xs font-extrabold uppercase tracking-[0.16em] text-[#dff46b]">
              Direct contact
            </span>
            <h2 className="mb-2 text-[clamp(1.8rem,3vw,2.4rem)] leading-tight">
              We are here to help
            </h2>

            {contactItems.map((item) => (
              <ContactRow key={item.label} {...item} />
            ))}

            <ContactRow label="Business hours" value="Monday-Saturday 9:00 AM to 6:00 PM" />
            <ContactRow
              label="Business address"
              value=" Carrington's Drove, Peterborough PE60GA, United Kingdom"
            />

            <div className="mt-4 rounded-xl border border-[#dff46b]/30 bg-white/10 p-4">
              <span className="block text-xs font-black uppercase text-[#dff46b] tracking-wider mb-1">
                Google Business Profile
              </span>
              <p className="text-xs text-[#d7e9e1] mb-3 leading-relaxed">
                Visit our official Google profile to view business locations, opening hours, customer reviews & directions.
              </p>
              <a
                href="https://share.google/lppdUTbhDohi0FX8O"
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 font-extrabold text-slate-900 transition hover:bg-[#dff46b]"
              >
                <span>📍 View on Google Maps</span>
                <span className="text-xs">↗</span>
              </a>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
