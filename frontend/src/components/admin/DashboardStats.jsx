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
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-5">
      {stats.map((stat, idx) => (
        <div
          key={stat.title}
          className={`flex flex-col justify-between rounded-xl sm:rounded-2xl border p-3.5 sm:p-5 shadow-xs transition hover:-translate-y-0.5 ${stat.color} ${
            idx === stats.length - 1 ? 'col-span-2 sm:col-span-1 lg:col-span-1' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider opacity-75 truncate">
              {stat.title}
            </span>
            <span className="text-xl sm:text-2xl shrink-0">{stat.icon}</span>
          </div>

          <div className="mt-2 sm:mt-3">
            <span className="text-xl sm:text-3xl font-black tracking-tight">{stat.value}</span>
            <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs font-medium opacity-80 leading-tight">{stat.subtext}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
