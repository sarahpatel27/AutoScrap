import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <section className="grid min-h-[70vh] place-items-center px-5 text-center">
      <div>
        <span className="block font-['Manrope'] text-8xl font-black leading-none text-[#d9e8e0]">
          404
        </span>
        <h1 className="mb-3.5 mt-6 text-[clamp(2.5rem,6vw,5.2rem)] leading-tight">
          Page not found
        </h1>
        <p className="mb-[18px] text-slate-500">
          The page you requested does not exist.
        </p>
        <Link
          className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border-0 bg-[#0f7b4f] px-[22px] py-3.5 font-extrabold text-white shadow-[0_10px_25px_rgba(15,123,79,0.23)] transition hover:-translate-y-0.5 hover:bg-[#075b3a]"
          to="/"
        >
          Return home
        </Link>
      </div>
    </section>
  );
}
