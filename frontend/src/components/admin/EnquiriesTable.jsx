import { useState, useEffect } from 'react';
import EnquiryDetailModal from './EnquiryDetailModal';
import { TARGET_CITIES, getCityFromPostcode } from '../../utils/cityHelper';
import { useAuth } from '../../context/AuthContext';

export default function EnquiriesTable({ enquiries, onUpdateStatus, onDelete }) {
  const { user } = useAuth();
  const isDealer = !!user?.assignedCity;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState(user?.assignedCity || 'All');
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  useEffect(() => {
    if (user?.assignedCity) {
      setCityFilter(user.assignedCity);
    }
  }, [user]);

  const statuses = ['All', 'Pending', 'Contacted', 'Accepted', 'Collected', 'Cancelled'];
  const cities = ['All', ...TARGET_CITIES];

  const filteredEnquiries = enquiries.filter((e) => {
    const itemCity = e.city || getCityFromPostcode(e.postcode || e.customer?.collectionPostcode, e.customer?.collectionAddress);

    // Dealer scope constraint
    if (isDealer && itemCity !== user.assignedCity) {
      return false;
    }

    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchesCity = cityFilter === 'All' || itemCity === cityFilter;

    const term = searchTerm.toLowerCase().trim();
    if (!term) return matchesStatus && matchesCity;

    const matchesSearch =
      (e.reference && e.reference.toLowerCase().includes(term)) ||
      (e.vehicle?.registration && e.vehicle.registration.toLowerCase().includes(term)) ||
      (e.customer?.fullName && e.customer.fullName.toLowerCase().includes(term)) ||
      (e.customer?.phone && e.customer.phone.toLowerCase().includes(term)) ||
      (e.customer?.email && e.customer.email.toLowerCase().includes(term)) ||
      (e.postcode && e.postcode.toLowerCase().includes(term)) ||
      itemCity.toLowerCase().includes(term);

    return matchesStatus && matchesCity && matchesSearch;
  });

  const getBadgeClass = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Contacted':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Accepted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Collected':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getCityBadgeClass = (city) => {
    switch (city) {
      case 'Doncaster':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'Leicester':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'Peterborough':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'London':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Cambridge':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      case 'Liverpool':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'Manchester':
        return 'bg-violet-50 text-violet-800 border-violet-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white shadow-xs">
      {/* Header controls */}
      <div className="flex flex-col gap-4 border-b border-gray-200 p-5">
        {/* City Filter Bar / Dealer Notice */}
        {isDealer ? (
          <div className="flex items-center justify-between rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
            <div className="flex items-center gap-2">
              <span className="text-xl">📍</span>
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                  {user.assignedCity} Dealer View
                </span>
                <p className="text-xs text-amber-800 font-medium">
                  Showing customer scrap enquiries strictly assigned to the <strong>{user.assignedCity}</strong> territory.
                </p>
              </div>
            </div>
            <span className="rounded-xl bg-amber-400 px-3 py-1 text-xs font-black text-slate-950 uppercase">
              {filteredEnquiries.length} Enquiries
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              📍 Filter by City Location:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
              {cities.map((city) => {
                const count =
                  city === 'All'
                    ? enquiries.length
                    : enquiries.filter(
                        (item) =>
                          (item.city || getCityFromPostcode(item.postcode || item.customer?.collectionPostcode, item.customer?.collectionAddress)) === city,
                      ).length;

                return (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setCityFilter(city)}
                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
                      cityFilter === city
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{city === 'All' ? 'All Cities' : city}</span>
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                        cityFilter === city ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Status Tabs & Search */}
        <div className="flex flex-col gap-4 pt-2 border-t border-gray-100 lg:flex-row lg:items-center lg:justify-between">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
            {statuses.map((s) => {
              const count =
                s === 'All'
                  ? filteredEnquiries.length
                  : filteredEnquiries.filter((item) => item.status === s).length;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-extrabold transition cursor-pointer ${
                    statusFilter === s
                      ? 'bg-[#0f7b4f] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{s}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      statusFilter === s ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-72">
            <span className="absolute left-3.5 top-2.5 text-sm text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search reg, ref, postcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-gray-50 py-2 pl-9 pr-3.5 text-xs outline-none focus:border-[#0f7b4f] focus:bg-white focus:shadow-[0_0_0_3px_rgba(15,123,79,0.1)]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table View */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-gray-200 bg-gray-50/80 font-extrabold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-5 py-3.5">Reference</th>
              <th className="px-5 py-3.5">Date</th>
              <th className="px-5 py-3.5">Customer</th>
              <th className="px-5 py-3.5">Vehicle</th>
              <th className="px-5 py-3.5">City / Location</th>
              <th className="px-5 py-3.5">Quote</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 font-medium">
            {filteredEnquiries.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-5 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-3xl">🔍</span>
                    <p className="font-extrabold text-gray-700">No enquiries found</p>
                    <p className="text-xs text-gray-400">
                      {isDealer
                        ? `No ${user.assignedCity} enquiries match your active filters.`
                        : 'Try selecting a different city or clearing your search filter.'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredEnquiries.map((e) => {
                const itemCity = e.city || getCityFromPostcode(e.postcode || e.customer?.collectionPostcode, e.customer?.collectionAddress);

                return (
                  <tr
                    key={e.id}
                    className="transition hover:bg-emerald-50/40 cursor-pointer"
                    onClick={() => setSelectedEnquiry(e)}
                  >
                    <td className="px-5 py-4">
                      <span className="font-mono font-black text-slate-900">{e.reference}</span>
                    </td>

                    <td className="px-5 py-4 text-gray-500">
                      {new Date(e.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit',
                      })}
                    </td>

                    <td className="px-5 py-4">
                      <div className="font-extrabold text-slate-900">{e.customer?.fullName || 'N/A'}</div>
                      <div className="text-[11px] text-gray-500">{e.customer?.phone}</div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-[#d1aa16] bg-[#f8ce3d] px-2 py-0.5 font-mono font-black text-[10px] text-black uppercase shrink-0">
                          {e.vehicle?.registration}
                        </span>
                        <span className="font-bold text-gray-800">
                          {e.vehicle?.make} {e.vehicle?.model}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`rounded-lg border px-2 py-0.5 font-black text-[11px] ${getCityBadgeClass(itemCity)}`}>
                          📍 {itemCity}
                        </span>
                        {e.postcode && (
                          <span className="font-mono text-[10px] text-gray-500 uppercase">
                            ({e.postcode})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="text-sm font-black text-[#0f7b4f]">
                        £{e.quote?.finalValue || 'N/A'}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className={`inline-block rounded-full border px-2.5 py-1 text-[11px] font-black ${getBadgeClass(e.status)}`}>
                        {e.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right" onClick={(event) => event.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => setSelectedEnquiry(e)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-extrabold text-gray-700 shadow-2xs hover:border-[#0f7b4f] hover:text-[#0f7b4f] cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal View */}
      {selectedEnquiry && (
        <EnquiryDetailModal
          enquiry={selectedEnquiry}
          onClose={() => setSelectedEnquiry(null)}
          onUpdateStatus={onUpdateStatus}
          onDelete={onDelete}
        />
      )}
    </div>
  );
}
