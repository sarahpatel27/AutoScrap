import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import DashboardStats from '../../components/admin/DashboardStats';
import EnquiriesTable from '../../components/admin/EnquiriesTable';
import PricingConfigurator from '../../components/admin/PricingConfigurator';
import {
  fetchEnquiries,
  fetchPastEnquiries,
  fetchPricingConfig,
  updateEnquiryStatus,
  updateBulkEnquiryStatus,
  deleteEnquiry,
  deleteBulkEnquiries,
  savePricingConfig,
  resetPricingConfig,
} from '../../services/adminStore';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [enquiries, setEnquiries] = useState([]);
  const [pastEnquiries, setPastEnquiries] = useState([]);
  const [pricing, setPricing] = useState({
    defaultPricePerTonne: 235,
    cityRates: {},
  });
  const [loading, setLoading] = useState(true);

  const reloadData = async () => {
    setLoading(true);
    try {
      const [fetchedEnquiries, fetchedPast, fetchedPricing] = await Promise.all([
        fetchEnquiries(),
        fetchPastEnquiries(),
        fetchPricingConfig(),
      ]);
      setEnquiries(fetchedEnquiries || []);
      setPastEnquiries(fetchedPast || []);
      if (fetchedPricing) setPricing(fetchedPricing);
    } catch (err) {
      console.error('Error reloading admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleUpdateStatus = async (id, newStatus, notes) => {
    const updated = await updateEnquiryStatus(id, newStatus, notes);
    setEnquiries(updated);
    const updatedPast = await fetchPastEnquiries();
    setPastEnquiries(updatedPast || []);
  };

  const handleUpdateBulkStatus = async (ids, newStatus) => {
    const updated = await updateBulkEnquiryStatus(ids, newStatus);
    setEnquiries(updated);
    const updatedPast = await fetchPastEnquiries();
    setPastEnquiries(updatedPast || []);
  };

  const handleDeleteEnquiry = async (id) => {
    const updated = await deleteEnquiry(id);
    setEnquiries(updated);
    const updatedPast = await fetchPastEnquiries();
    setPastEnquiries(updatedPast || []);
  };

  const handleDeleteBulkEnquiries = async (ids) => {
    const updated = await deleteBulkEnquiries(ids);
    setEnquiries(updated);
    const updatedPast = await fetchPastEnquiries();
    setPastEnquiries(updatedPast || []);
  };

  const handleSavePricing = async (newConfig) => {
    const saved = await savePricingConfig(newConfig);
    setPricing(saved);
  };

  const handleResetPricing = async () => {
    const reset = await resetPricingConfig();
    setPricing(reset);
    return reset;
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="space-y-6">
        {/* Page Title Header */}
        <div className="flex flex-row items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Manrope'] tracking-tight">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'enquiries' && 'Scrap Car Enquiries'}
              {activeTab === 'past' && 'Past Enquiries (Archived / Deleted)'}
              {activeTab === 'pricing' && 'Scrap Valuation Rules'}
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
              {activeTab === 'past'
                ? 'Read-only record repository of soft-deleted and historical scrap car enquiries.'
                : 'Live management portal for MyAutoScrap UK collections & pricing.'}
            </p>
          </div>

          <button
            type="button"
            onClick={reloadData}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl sm:rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-3 py-2 sm:px-4 sm:py-2.5 text-xs font-black text-[#0f7b4f] shadow-xs transition-all hover:bg-emerald-100 hover:scale-102 active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <span className={`text-sm transition-transform duration-700 ${loading ? 'animate-spin' : ''}`}>
              🔄
            </span>
            <span className="hidden xs:inline">{loading ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <DashboardStats enquiries={enquiries} pricing={pricing} />
            <EnquiriesTable
              enquiries={enquiries}
              onUpdateStatus={handleUpdateStatus}
              onUpdateBulkStatus={handleUpdateBulkStatus}
              onDelete={handleDeleteEnquiry}
              onDeleteBulk={handleDeleteBulkEnquiries}
            />
          </div>
        )}

        {activeTab === 'enquiries' && (
          <EnquiriesTable
            enquiries={enquiries}
            onUpdateStatus={handleUpdateStatus}
            onUpdateBulkStatus={handleUpdateBulkStatus}
            onDelete={handleDeleteEnquiry}
            onDeleteBulk={handleDeleteBulkEnquiries}
          />
        )}

        {activeTab === 'past' && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-amber-300/80 bg-amber-50/80 p-4 text-amber-900 flex items-center gap-3">
              <span className="text-xl">📁</span>
              <div className="text-xs">
                <span className="font-extrabold uppercase tracking-wide">Read-Only Past Enquiries View</span>
                <p className="font-medium text-amber-800">
                  These records have been deleted from active operations. All enquiry data is permanently stored for audit & history. No actions can be taken.
                </p>
              </div>
            </div>

            <EnquiriesTable
              enquiries={pastEnquiries}
              readOnly={true}
            />
          </div>
        )}

        {activeTab === 'pricing' && (
          <PricingConfigurator
            pricing={pricing}
            onSavePricing={handleSavePricing}
            onResetPricing={handleResetPricing}
          />
        )}
      </div>
    </AdminLayout>
  );
}
