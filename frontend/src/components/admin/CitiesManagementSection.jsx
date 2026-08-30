import { useState, useEffect, useRef } from "react";
import {
  fetchSupportedCities,
  fetchCityOptions,
  createSupportedCity,
  updateSupportedCity,
  deleteSupportedCity,
} from "../../services/adminStore";
import { showToast } from "./ToastContainer";
import Pagination from "./Pagination";

export default function CitiesManagementSection() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filterActive, setFilterActive] = useState("all");
  const [searchFilter, setSearchFilter] = useState("");

  // Add City Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [cityOptions, setCityOptions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null); // { name: string }
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [ratePerTon, setRatePerTon] = useState("235");
  const [submittingAdd, setSubmittingAdd] = useState(false);
  const [addError, setAddError] = useState("");
  const debounceTimerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Edit Rate Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [editRate, setEditRate] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Deactivate/Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCity, setDeletingCity] = useState(null);
  const [submittingDelete, setSubmittingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadCities = async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await fetchSupportedCities();
      setCities(data || []);
    } catch (err) {
      const msg = err.message || "Failed to load supported cities.";
      setLoadError(msg);
      showToast(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCities();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Open Add Modal & fetch initial 10-15 options from /api/cities/options
  const openAddModal = async () => {
    setSearchTerm("");
    setSelectedCity(null);
    setRatePerTon("235");
    setDropdownOpen(false);
    setAddError("");
    setSearchError("");
    setAddModalOpen(true);
    setIsSearching(true);

    try {
      const opts = await fetchCityOptions("");
      setCityOptions(opts || []);
    } catch (err) {
      console.error("Error loading initial city options:", err);
      setSearchError("Failed to load master city list. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced Search Handler for /api/cities/options?search=...
  const handleSearchInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setSelectedCity(null);
    setAddError("");
    setSearchError("");
    setDropdownOpen(true);
    setIsSearching(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const opts = await fetchCityOptions(val.trim());
        setCityOptions(opts || []);
      } catch (err) {
        console.error("Error searching city options:", err);
        setSearchError("Failed to search master cities. Please check network connection.");
      } finally {
        setIsSearching(false);
      }
    }, 300);
  };

  const handleSelectCityOption = (cityOpt) => {
    setSelectedCity(cityOpt);
    setSearchTerm(cityOpt.name);
    setAddError("");
    setDropdownOpen(false);
  };

  const handleAddCitySubmit = async (e) => {
    e.preventDefault();
    setAddError("");

    if (!selectedCity && !searchTerm) {
      const msg = "Please select a UK city from the master list.";
      setAddError(msg);
      showToast(msg, "error");
      return;
    }

    const cityName = selectedCity?.name || searchTerm.trim();
    const numRate = Number(ratePerTon);

    if (isNaN(numRate) || numRate <= 0) {
      const msg = "Scrap rate per tonne is required and must be greater than £0.";
      setAddError(msg);
      showToast(msg, "error");
      return;
    }

    setSubmittingAdd(true);
    try {
      const res = await createSupportedCity({
        name: cityName,
        ratePerTon: numRate,
      });
      showToast(res.message || `Added ${cityName} with rate £${numRate}/t successfully!`, "success");
      setAddModalOpen(false);
      await loadCities();
    } catch (err) {
      const errMsg = err.message || "Failed to add city.";
      setAddError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setSubmittingAdd(false);
    }
  };

  const openEditModal = (city) => {
    setEditingCity(city);
    setEditRate(String(city.ratePerTon || 235));
    setEditError("");
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError("");
    if (!editingCity) return;
    const numRate = Number(editRate);
    if (isNaN(numRate) || numRate <= 0) {
      const msg = "Scrap rate per tonne must be greater than £0.";
      setEditError(msg);
      showToast(msg, "error");
      return;
    }

    setSubmittingEdit(true);
    try {
      await updateSupportedCity(editingCity.id, { ratePerTon: numRate });
      showToast(`Updated scrap rate for ${editingCity.name} to £${numRate}/t.`, "success");
      setEditModalOpen(false);
      await loadCities();
    } catch (err) {
      const msg = err.message || "Failed to update scrap rate.";
      setEditError(msg);
      showToast(msg, "error");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleToggleStatus = async (city) => {
    try {
      const newStatus = !city.isActive;
      await updateSupportedCity(city.id, { isActive: newStatus });
      showToast(
        `${city.name} is now ${newStatus ? "Active" : "Deactivated"}.`,
        "success"
      );
      await loadCities();
    } catch (err) {
      showToast(err.message || "Failed to update city status.", "error");
    }
  };

  const openDeleteModal = (city) => {
    setDeletingCity(city);
    setDeleteError("");
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCity) return;
    setSubmittingDelete(true);
    setDeleteError("");
    try {
      await deleteSupportedCity(deletingCity.id);
      showToast(`City "${deletingCity.name}" deactivated from active coverage.`, "success");
      setDeleteModalOpen(false);
      await loadCities();
    } catch (err) {
      const msg = err.message || "Failed to remove city.";
      setDeleteError(msg);
      showToast(msg, "error");
    } finally {
      setSubmittingDelete(false);
    }
  };

  // Sorting & Pagination State
  const [sortField, setSortField] = useState("name"); // 'name' | 'rate' | 'createdAt'
  const [sortDirection, setSortDirection] = useState("asc"); // 'asc' | 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterActive, searchFilter]);

  // Filtering
  const filteredCities = cities.filter((c) => {
    if (filterActive === "active" && !c.isActive) return false;
    if (filterActive === "inactive" && c.isActive) return false;
    if (searchFilter) {
      const term = searchFilter.toLowerCase().trim();
      return (
        c.name.toLowerCase().includes(term) ||
        c.slug.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Sorting
  const sortedCities = [...filteredCities].sort((a, b) => {
    let comparison = 0;
    if (sortField === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortField === "rate") {
      const rateA = Number(a.ratePerTon) || 0;
      const rateB = Number(b.ratePerTon) || 0;
      comparison = rateA - rateB;
    } else if (sortField === "createdAt") {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      comparison = dateA - dateB;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  // Pagination slicing
  const totalPages = Math.ceil(sortedCities.length / itemsPerPage);
  const paginatedCities = sortedCities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white p-5 sm:p-6 shadow-xs border border-gray-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏙️</span>
            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              Supported Cities & Coverage
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
            Manage active UK collection areas, set dynamic scrap pricing, and monitor assigned dealers.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0f7b4f] px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-[#075b3a] transition cursor-pointer active:scale-95 shrink-0"
        >
          <span>➕</span> Add City
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-extrabold uppercase text-gray-400">Total Supported</div>
          <div className="mt-1 text-2xl font-black text-slate-900">{cities.length}</div>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 shadow-xs">
          <div className="text-[11px] font-extrabold uppercase text-emerald-700">Active Coverage</div>
          <div className="mt-1 text-2xl font-black text-emerald-900">
            {cities.filter((c) => c.isActive).length}
          </div>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-xs">
          <div className="text-[11px] font-extrabold uppercase text-amber-700">Deactivated</div>
          <div className="mt-1 text-2xl font-black text-amber-900">
            {cities.filter((c) => !c.isActive).length}
          </div>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-xs">
          <div className="text-[11px] font-extrabold uppercase text-blue-700">Dealer Accounts</div>
          <div className="mt-1 text-2xl font-black text-blue-900">
            {cities.reduce((acc, c) => acc + (c.dealerCount || 0), 0)}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-white p-4 shadow-xs border border-gray-200/80">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterActive("all")}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
              filterActive === "all"
                ? "bg-[#0f7b4f] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Cities ({cities.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterActive("active")}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
              filterActive === "active"
                ? "bg-[#0f7b4f] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Active ({cities.filter((c) => c.isActive).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterActive("inactive")}
            className={`rounded-xl px-3 py-1.5 text-xs font-black transition cursor-pointer ${
              filterActive === "inactive"
                ? "bg-[#0f7b4f] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Inactive ({cities.filter((c) => !c.isActive).length})
          </button>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search covered cities..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-gray-50 px-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-[#0f7b4f] focus:bg-white"
          />
        </div>
      </div>

      {/* Main Cities Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-gray-500 flex flex-col items-center justify-center gap-2">
            <span className="text-xl animate-spin">⏳</span>
            <span>Loading supported cities...</span>
          </div>
        ) : loadError ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="text-2xl">⚠️</div>
            <div className="text-xs font-extrabold text-red-700">{loadError}</div>
            <button
              type="button"
              onClick={loadCities}
              className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-black text-red-700 hover:bg-red-100 transition cursor-pointer"
            >
              Retry Loading Cities
            </button>
          </div>
        ) : cities.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2">
            <div className="text-2xl">🏙️</div>
            <div className="text-sm font-extrabold text-slate-800">No supported cities configured yet.</div>
            <p className="text-xs text-gray-500 max-w-sm">
              Click &quot;Add City&quot; above to select and activate your first UK collection territory from the master city list.
            </p>
          </div>
        ) : sortedCities.length === 0 ? (
          <div className="p-12 text-center text-xs font-bold text-gray-500">
            No supported cities match your current search or filter criteria.
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-900 border-collapse">
                <thead>
                  <tr className="border-b border-gray-200/80 bg-gray-50/80 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                    {/* Sort by City Name */}
                    <th
                      className="py-3.5 px-4 sm:px-6 cursor-pointer hover:bg-gray-100/80 transition select-none"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>City</span>
                        <span className="text-gray-400 font-bold">
                          {sortField === "name" ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
                        </span>
                      </div>
                    </th>

                    {/* Sort by Rate */}
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:bg-gray-100/80 transition select-none"
                      onClick={() => handleSort("rate")}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Scrap Rate Per Ton</span>
                        <span className="text-gray-400 font-bold">
                          {sortField === "rate" ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
                        </span>
                      </div>
                    </th>

                    <th className="py-3.5 px-4">Dealer Accounts</th>
                    <th className="py-3.5 px-4">Status</th>

                    {/* Sort by Date Added */}
                    <th
                      className="py-3.5 px-4 cursor-pointer hover:bg-gray-100/80 transition select-none"
                      onClick={() => handleSort("createdAt")}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>Date Added</span>
                        <span className="text-gray-400 font-bold">
                          {sortField === "createdAt" ? (sortDirection === "asc" ? "▲" : "▼") : "↕"}
                        </span>
                      </div>
                    </th>

                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedCities.map((city) => (
                    <tr key={city.id} className="hover:bg-gray-50/60 transition">
                      {/* City Column */}
                      <td className="py-3.5 px-4 sm:px-6 font-black text-slate-900">
                        <div className="flex items-center gap-2">
                          <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-50 text-xs font-black text-[#0f7b4f]">
                            📍
                          </span>
                          <div>
                            <div className="font-extrabold text-sm">{city.name}</div>
                            <div className="text-[10px] text-gray-400 font-mono">/areas-we-cover/{city.slug}</div>
                          </div>
                        </div>
                      </td>

                      {/* Scrap Rate Per Ton Column */}
                      <td className="py-3.5 px-4">
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50/80 px-2.5 py-1 text-xs font-black text-[#0f7b4f] max-sm:w-24">
                          <span>£{city.ratePerTon}</span>
                          <span className="text-[10px] font-normal text-emerald-700">/ tonne</span>
                        </div>
                      </td>

                      {/* Dealer Accounts Column */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700 max-sm:w-18">
                           {city.dealerCount} {city.dealerCount === 1 ? "Dealer" : "Dealers"}
                        </span>
                      </td>

                      {/* Status Column */}
                      <td className="py-3.5 px-4">
                        {city.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-black text-emerald-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-200 px-2.5 py-0.5 text-[11px] font-black text-gray-600">
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Date Added Column */}
                      <td className="py-3.5 px-4 text-xs font-medium text-gray-500">
                        {city.createdAt
                          ? new Date(city.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "N/A"}
                      </td>

                      {/* Actions Column */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Rate */}
                          <button
                            type="button"
                            onClick={() => openEditModal(city)}
                            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:border-gray-300 hover:bg-gray-50 transition cursor-pointer active:scale-95 shadow-2xs"
                            title="Edit Scrap Rate"
                          >
                            ✏️ Edit Rate
                          </button>

                          {/* Activate / Deactivate Toggle */}
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(city)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer active:scale-95 shadow-2xs ${
                              city.isActive
                                ? "border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                                : "border border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                            }`}
                          >
                            {city.isActive ? "⏸ Deactivate" : "▶ Activate"}
                          </button>

                          {/* Remove / Soft Delete */}
                          <button
                            type="button"
                            onClick={() => openDeleteModal(city)}
                            className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 hover:bg-red-100 transition cursor-pointer active:scale-95 shadow-2xs"
                            title="Remove City"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Component */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={sortedCities.length}
              itemsPerPage={itemsPerPage}
            />
          </div>
        )}
      </div>

      {/* Modal 1: Add City with Searchable Dropdown & Debounced API lookup */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">➕</span>
                <h3 className="text-base font-black text-slate-900">
                  Add Supported UK City
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="text-gray-400 hover:text-slate-800 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Add City Error Banner (Duplicate / Creation Failed) */}
            {addError && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700 border border-red-200 flex items-center gap-2">
                <span>⚠️</span>
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddCitySubmit} className="space-y-4">
              {/* Searchable Dropdown Field */}
              <div className="relative" ref={dropdownRef}>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  UK City <span className="text-emerald-700">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    🔍
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Search master UK cities (e.g. Manchester)..."
                    value={searchTerm}
                    onChange={handleSearchInputChange}
                    onFocus={() => setDropdownOpen(true)}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 pl-9 pr-8 py-2.5 text-xs font-black text-slate-900 outline-none focus:border-[#0f7b4f] focus:bg-white"
                  />
                  {isSearching && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-emerald-600 font-bold animate-pulse">
                      Searching...
                    </span>
                  )}
                </div>

                {/* Search Error Banner */}
                {searchError && (
                  <p className="text-[11px] text-red-600 font-bold mt-1">
                    ⚠️ {searchError}
                  </p>
                )}

                {/* Dropdown Options Menu */}
                {dropdownOpen && (
                  <div className="absolute z-20 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
                    {cityOptions.length === 0 ? (
                      <div className="p-3 text-center text-xs text-gray-400 font-semibold">
                        {isSearching ? "Searching cities..." : "No unadded matching master cities found."}
                      </div>
                    ) : (
                      cityOptions.map((opt) => (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => handleSelectCityOption(opt)}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-extrabold transition cursor-pointer ${
                            selectedCity?.name === opt.name
                              ? "bg-emerald-50 text-[#0f7b4f]"
                              : "text-slate-800 hover:bg-gray-50"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>📍</span> {opt.name}
                          </span>
                          {selectedCity?.name === opt.name && (
                            <span className="text-xs text-[#0f7b4f]">✓</span>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
                <p className="text-[11px] text-gray-400 mt-1">
                  Fetches live from official 76 UK master reference list.
                </p>
              </div>

              {/* Scrap Rate Per Ton Field */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Scrap Rate Per Ton (£/tonne) <span className="text-emerald-700">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-500">
                    £
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    placeholder="245"
                    value={ratePerTon}
                    onChange={(e) => setRatePerTon(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 pl-7 pr-3.5 py-2.5 text-xs font-black text-slate-900 outline-none focus:border-[#0f7b4f] focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Must be greater than £0. Will be used for instant scrap valuation.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd || (!selectedCity && !searchTerm)}
                  className="rounded-xl bg-[#0f7b4f] px-4 py-2 text-xs font-black text-white hover:bg-[#075b3a] transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submittingAdd ? "Saving..." : "Save City"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Scrap Rate */}
      {editModalOpen && editingCity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">✏️</span>
                <h3 className="text-base font-black text-slate-900">
                  Edit Rate for {editingCity.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="text-gray-400 hover:text-slate-800 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Scrap Rate Per Tonne (£/tonne)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-black text-gray-500">
                    £
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={editRate}
                    onChange={(e) => setEditRate(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 pl-7 pr-3.5 py-2.5 text-xs font-black text-slate-900 outline-none focus:border-[#0f7b4f] focus:bg-white"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  This live rate immediately applies to all instant customer quotes in {editingCity.name}.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="rounded-xl bg-[#0f7b4f] px-4 py-2 text-xs font-black text-white hover:bg-[#075b3a] transition disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submittingEdit ? "Saving..." : "Save New Rate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Deactivate / Remove City Confirmation */}
      {deleteModalOpen && deletingCity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-red-700 text-lg font-black shrink-0">
                🗑️
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Remove {deletingCity.name}?
                </h3>
                <p className="text-xs text-gray-500 font-medium">
                  Confirm service area deactivation
                </p>
              </div>
            </div>

            {/* City current metrics */}
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3.5 mb-4 text-xs">
              <div className="font-extrabold text-slate-900 mb-2">
                {deletingCity.name} currently has:
              </div>
              <div className="grid grid-cols-2 gap-2 text-gray-700 font-bold">
                <div className="flex items-center gap-1.5">
                  <span>💰 Scrap Rate:</span>
                  <span className="text-[#0f7b4f]">£{deletingCity.ratePerTon} / ton</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>👤 Dealer Accounts:</span>
                  <span className="text-slate-900">{deletingCity.dealerCount || 0}</span>
                </div>
              </div>
            </div>

            {/* Impact checklist */}
            <div className="text-xs text-gray-600 mb-4 space-y-1.5">
              <p className="font-extrabold text-slate-800 mb-1">
                Removing this city will:
              </p>
              <ul className="space-y-1 pl-1 text-slate-700">
                <li className="flex items-start gap-1.5">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Stop {deletingCity.name} quotes</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Remove {deletingCity.name} from Areas We Cover</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Remove {deletingCity.name} from homepage coverage</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Remove it from new dealer city selection</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Disable its scrap rate</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Disable dealer accounts associated with {deletingCity.name}</span>
                </li>
              </ul>
            </div>

            <div className="rounded-lg bg-emerald-50/70 border border-emerald-200 p-2.5 mb-5 text-[11px] text-[#0f7b4f] font-bold">
              ✓ Historical enquiries and dealer bidding history will remain preserved.
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={submittingDelete}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-black text-white hover:bg-red-700 transition disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {submittingDelete ? "Removing..." : "Remove City"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
