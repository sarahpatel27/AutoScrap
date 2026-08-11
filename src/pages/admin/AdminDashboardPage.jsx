import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import DashboardStats from '../../components/admin/DashboardStats';
import EnquiriesTable from '../../components/admin/EnquiriesTable';
import PricingConfigurator from '../../components/admin/PricingConfigurator';
import {
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
  getPricingConfig,
  savePricingConfig,
  resetPricingConfig,
} from '../../services/adminStore';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [enquiries, setEnquiries] = useState([]);
  const [pricing, setPricing] = useState(getPricingConfig());

  // Load enquiries & listen for changes
  const reloadData = () => {
    setEnquiries(getEnquiries());
    setPricing(getPricingConfig());
  };

  useEffect(() => {
    reloadData();
  }, []);

  const handleUpdateStatus = (id, newStatus, notes) => {
    const updated = updateEnquiryStatus(id, newStatus, notes);
    setEnquiries(updated);
  };

  const handleDeleteEnquiry = (id) => {
    const updated = deleteEnquiry(id);
    setEnquiries(updated);
  };

  const handleSavePricing = (newConfig) => {
    const saved = savePricingConfig(newConfig);
    setPricing(saved);
  };

  const handleResetPricing = () => {
    const reset = resetPricingConfig();
    setPricing(reset);
    return reset;
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <div className="space-y-6">
        {/* Page Title Header */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-['Manrope']">
              {activeTab === 'overview' && 'Dashboard Overview'}
              {activeTab === 'enquiries' && 'Scrap Car Enquiries'}
              {activeTab === 'pricing' && 'Scrap Valuation Rules'}
            </h1>
            <p className="text-xs text-gray-500">
              Live management portal for MyAutoScrap UK collections & pricing.
            </p>
          </div>

          <button
            type="button"
            onClick={reloadData}
            className="inline-flex items-center gap-1.5 self-start rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-extrabold text-gray-700 shadow-xs transition hover:bg-gray-50"
          >
            🔄 Refresh Data
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <DashboardStats enquiries={enquiries} pricing={pricing} />
            <EnquiriesTable
              enquiries={enquiries}
              onUpdateStatus={handleUpdateStatus}
              onDelete={handleDeleteEnquiry}
            />
          </div>
        )}

        {activeTab === 'enquiries' && (
          <EnquiriesTable
            enquiries={enquiries}
            onUpdateStatus={handleUpdateStatus}
            onDelete={handleDeleteEnquiry}
          />
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
