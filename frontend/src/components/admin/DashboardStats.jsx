import { useAuth } from '../../context/AuthContext';
import { getCityFromPostcode } from '../../utils/cityHelper';

export default function DashboardStats({ enquiries, pricing }) {
  const { user } = useAuth();
  const isDealer = !!user?.assignedCity;

  const scopedEnquiries = isDealer
    ? enquiries.filter(
        (e) =>
          (e.city || getCityFromPostcode(e.postcode || e.customer?.collectionPostcode, e.customer?.collectionAddress)) ===
          user.assignedCity,
      )
    : enquiries;

  const total = scopedEnquiries.length;
  const pending = scopedEnquiries.filter((e) => e.status === 'Pending').length;
  const collected = scopedEnquiries.filter((e) => e.status === 'Collected').length;
  const totalQuotedValue = scopedEnquiries.reduce(
    (sum, e) => sum + (e.quote?.finalValue || 0),
    0,
  );
  const avgValue = total > 0 ? Math.round(totalQuotedValue / total) : 0;

  const activeCityRate = isDealer
    ? pricing?.cityRates?.[user.assignedCity] || 235
    : pricing?.defaultPricePerTonne || 235;

  const stats = [
    {
      title: isDealer ? `${user.assignedCity} Enquiries` : 'Total Enquiries',
      value: total,
      subtext: `${pending} awaiting response`,
      icon: '📋',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    {
      title: 'Pending Action',
      value: pending,
      subtext: 'Requires team call back',
      icon: '⏳',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    {
      title: 'Total Quoted Value',
      value: `£${totalQuotedValue.toLocaleString()}`,
      subtext: `Avg: £${avgValue} / vehicle`,
      icon: '💷',
      color: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    {
      title: 'Collected Vehicles',
      value: collected,
      subtext: `${total > 0 ? Math.round((collected / total) * 100) : 0}% completion rate`,
      icon: '🚚',
      color: 'bg-purple-50 text-purple-800 border-purple-200',
    },
    {
      title: isDealer ? `${user.assignedCity} Rate` : 'Active Scrap Rate',
      value: `£${activeCityRate}/t`,
      subtext: isDealer ? `Scrap rate in ${user.assignedCity}` : 'Base scrap valuation rate',
      icon: '⚖️',
      color: 'bg-[#edf7f2] text-[#0f7b4f] border-[#c9e8d8]',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className={`flex flex-col justify-between rounded-2xl border p-5 shadow-xs transition hover:-translate-y-0.5 ${stat.color}`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider opacity-75">
              {stat.title}
            </span>
            <span className="text-2xl">{stat.icon}</span>
          </div>

          <div className="mt-3">
            <span className="text-3xl font-black">{stat.value}</span>
            <p className="mt-1 text-xs font-medium opacity-80">{stat.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
