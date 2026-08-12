import { Link } from 'react-router';

export default function CityQuickLinkCard({ location }) {
    return (
        <Link
            to={`/areas-we-cover/${location.slug}`}
            className="flex min-h-[105px] flex-col items-center justify-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-slate-800 transition hover:-translate-y-0.5 hover:border-[#0f7b4f] hover:bg-emerald-50/50 hover:shadow-xs sm:min-h-[120px]"
        >
            <span className="mb-2 text-[28px]">📍</span>
            <span>{location.city}</span>
        </Link>
    );
}
