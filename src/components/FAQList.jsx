import { useState } from 'react';

export default function FAQList({ items }) {
  const [open, setOpen] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      {items.map(([question, answer], index) => {
        const isOpen = open === index;

        return (
          <div
            className="overflow-hidden rounded-[14px] border border-slate-200 bg-white"
            key={question}
          >
            <button
              className="flex w-full cursor-pointer justify-between gap-4 border-0 bg-white px-5 py-[19px] text-left font-extrabold text-[#13231d]"
              onClick={() => setOpen(isOpen ? -1 : index)}
              type="button"
            >
              <span>{question}</span>
              <b aria-hidden="true">{isOpen ? '−' : '+'}</b>
            </button>
            {isOpen && <p className="m-0 px-5 pb-5 text-slate-500">{answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
