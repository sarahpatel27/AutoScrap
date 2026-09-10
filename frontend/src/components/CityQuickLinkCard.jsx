import { Link } from 'react-router';

export default function CityQuickLinkCard({ location }) {
    const postcodesText = location.postcodes && location.postcodes.length > 0
        ? location.postcodes.join(', ')
        : (location.code || '');

    return (
        <Link
            to={`/areas-we-cover/${location.slug}`}
            className="flex min-h-[110px] flex-col items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center text-slate-800 transition hover:-translate-y-0.5 hover:border-[#0f7b4f] hover:bg-emerald-50/50 hover:shadow-xs sm:min-h-[125px]"
        >
            <span className="text-[24px]">📍</span>
            <span className="font-bold text-slate-900 text-[15px]">{location.city}</span>
            {postcodesText && (
                <span className="text-[11px] font-extrabold text-[#0f7b4f] bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {postcodesText}
                </span>
            )}
        </Link>
    );
}
