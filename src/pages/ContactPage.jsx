import { useState } from 'react';

const contactItems = [
  {
    label: 'Phone',
    value: '0800 123 4567',
    href: 'tel:08001234567',
  },
  {
    label: 'WhatsApp',
    value: 'Message the team',
    href: 'https://wa.me/447700900000',
  },
  {
    label: 'Email',
    value: 'hello@myautoscrap.co.uk',
    href: 'mailto:hello@myautoscrap.co.uk',
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

function ContactRow({ href, label, value }) {
  const content = (
    <>
      <small className="text-[#a8c0b6]">{label}</small>
      <b className="text-[1.02rem] text-white">{value}</b>
    </>
  );

  if (href) {
    return (
      <a
        className="flex flex-col border-b border-white/10 py-[17px] transition hover:text-[#dff46b]"
        href={href}
      >
        {content}
      </a>
    );
  }

  return <div className="flex flex-col border-b border-white/10 py-[17px]">{content}</div>;
}

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    setSent(true);
    event.currentTarget.reset();
  };

  return (
    <>
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
            onSubmit={submit}
          >
            <h2 className="mb-6 text-[clamp(1.8rem,3vw,2.35rem)] leading-tight">
              Send us a message
            </h2>

            <div className="grid gap-x-[18px] gap-y-[15px] md:grid-cols-2">
              <Field label="Name *">
                <input className={fieldClass} required />
              </Field>
              <Field label="Phone number *">
                <input className={fieldClass} required />
              </Field>
              <Field label="Email *">
                <input className={fieldClass} required type="email" />
              </Field>
              <Field label="Subject *">
                <input className={fieldClass} required />
              </Field>
              <Field className="md:col-span-2" label="Message *">
                <textarea className={`${fieldClass} min-h-[156px] resize-y`} required rows="6" />
              </Field>
            </div>

            {sent && (
              <div className="mt-5 rounded-xl border border-[#c9e8d8] bg-[#edf7f2] px-4 py-3 font-bold text-[#175c40]">
                Thanks - your message has been recorded in this frontend demo.
              </div>
            )}

            <button
              className="mt-6 inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#0f7b4f] px-[22px] py-3.5 font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-[#075b3a]"
              type="submit"
            >
              Submit message
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

            <ContactRow label="Business hours" value="Monday-Saturday 8:00-18:00" />
            <ContactRow
              label="Business address"
              value="Add your registered UK address here"
            />
          </aside>
        </div>
      </section>
    </>
  );
}
