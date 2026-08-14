import { useState, useEffect } from 'react';
import { useLocation } from 'react-router';
import AdminLayout from '../../components/admin/AdminLayout';
import DashboardStats from '../../components/admin/DashboardStats';
import EnquiriesTable from '../../components/admin/EnquiriesTable';
import PricingConfigurator from '../../components/admin/PricingConfigurator';
import UserManagementSection from '../../components/admin/UserManagementSection';
import AccountSettingsSection from '../../components/admin/AccountSettingsSection';
import ContactSubmissionsSection from '../../components/admin/ContactSubmissionsSection';
import HighValueBiddingSection from '../../components/admin/HighValueBiddingSection';
import DealerBiddingDashboard from '../../components/admin/DealerBiddingDashboard';
import { useAuth } from '../../context/AuthContext';
import {
  fetchEnquiries,
  fetchHighValueEnquiries,
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
  const location = useLocation();
  const { user } = useAuth();

  const getTabFromPath = (path) => {
    switch (path) {
      case '/admin/high-value-bidding':
        return 'high-value';
      case '/admin/enquiries':
        return 'enquiries';
      case '/admin/past-enquiries':
        return 'past';
      case '/admin/scrap-rates':
        return 'pricing';
      case '/admin/contact-messages':
        return 'contacts';
      case '/admin/dealer-accounts':
        return 'users';
      case '/admin/account-settings':
        return 'settings';
      case '/admin/dashboard':
      default:
        return 'overview';
    }
  };

  const activeTab = getTabFromPath(location.pathname);
  const [enquiries, setEnquiries] = useState([]);
  const [highValueEnquiries, setHighValueEnquiries] = useState([]);
  const [pastEnquiries, setPastEnquiries] = useState([]);
  const [pricing, setPricing] = useState({
    defaultPricePerTonne: 235,
    cityRates: {},
  });
  const [loading, setLoading] = useState(true);

  const reloadData = async () => {
    setLoading(true);
    try {
      const [fetchedEnquiries, fetchedHighValue, fetchedPast, fetchedPricing] = await Promise.all([
        fetchEnquiries(),
        fetchHighValueEnquiries(),
        fetchPastEnquiries(),
        fetchPricingConfig(),
      ]);
      setEnquiries(fetchedEnquiries || []);
      setHighValueEnquiries(fetchedHighValue || []);
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
    <AdminLayout activeTab={activeTab}>
      <div className="space-y-6">
        {/* Page Title Header */}
        <div className="flex flex-row items-center justify-between gap-3 bg-white/80 backdrop-blur-md p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-200/80 shadow-xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-['Manrope'] tracking-tight">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'high-value' && (user?.role === 'City Dealer' ? 'Dealer Territory Bidding' : 'High Value Bidding Management')}
              {activeTab === 'enquiries' && 'Scrap Car Enquiries'}
              {activeTab === 'past' && 'Past Enquiries (Archived / Deleted)'}
              {activeTab === 'contacts' && 'Website Contact Messages (Super Admin Only)'}
              {activeTab === 'users' && 'Dealer Accounts Manager'}
              {activeTab === 'settings' && 'Account Settings'}
              {activeTab === 'pricing' && 'Scrap Valuation Rules'}
            </h1>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium">
              {activeTab === 'past'
                ? 'Read-only record repository of soft-deleted and historical scrap car enquiries.'
                : activeTab === 'contacts'
                ? 'Exclusive Super Admin view of public inquiries submitted through the Contact Us page.'
                : activeTab === 'users'
                ? 'Manage city dealer login credentials and territory permissions.'
                : activeTab === 'settings'
                ? 'Manage your portal security credentials and password.'
                : 'Live management portal for MyAutoScrap UK collections & pricing.'}
            </p>
          </div>

          <button
            type="button"
            onClick={reloadData}
            disabled={loading}
            title="Refresh Data"
            aria-label="Refresh Dashboard Data"
            className="grid h-10 w-10 place-items-center rounded-xl sm:rounded-2xl border border-emerald-200/80 bg-emerald-50/90 text-[#0f7b4f] shadow-xs transition-all hover:bg-emerald-100 hover:scale-105 active:scale-95 cursor-pointer shrink-0 disabled:opacity-50"
          >
            <svg
              className={`h-4 w-4 transition-transform duration-700 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
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

        {activeTab === 'high-value' && (
          user?.role === 'City Dealer' ? (
            <DealerBiddingDashboard enquiries={highValueEnquiries} onBidSubmitted={reloadData} />
          ) : (
            <HighValueBiddingSection enquiries={highValueEnquiries} onWinnerSelected={reloadData} />
          )
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

        {activeTab === 'contacts' && (
          <ContactSubmissionsSection />
        )}

        {activeTab === 'users' && (
          <UserManagementSection />
        )}

        {activeTab === 'settings' && (
          <AccountSettingsSection />
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
