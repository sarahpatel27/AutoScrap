export default function CityQuickLinkCard({ location }) {
    return (
        <a
            href={`#${location.slug}`}
            className="flex min-h-[105px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 p-[18px] text-center text-gray-900 transition hover:-translate-y-1 hover:border-[#0f7b4f] hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)] sm:min-h-[120px]"
        >
            <span className="mb-2 text-[28px]">📍</span>
            <span>{location.city}</span>
        </a>
    );
}
