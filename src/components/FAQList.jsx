import { useState } from 'react';
export default function FAQList({ items }) {
  const [open, setOpen] = useState(0);
  return <div className="faq-list">{items.map(([q,a], i) => <div className="faq-item" key={q}><button onClick={() => setOpen(open === i ? -1 : i)}><span>{q}</span><b>{open === i ? '−' : '+'}</b></button>{open === i && <p>{a}</p>}</div>)}</div>;
}
