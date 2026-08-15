import { useState, useEffect } from 'react';
import { fetchContactSubmissions, deleteContactSubmission } from '../../services/adminStore';
import { showToast } from './ToastContainer';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function ContactSubmissionsSection() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Detail State
  const [activeModalContact, setActiveModalContact] = useState(null);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  const loadContacts = async () => {
    setLoading(true);
    try {
      const data = await fetchContactSubmissions();
      setContacts(data || []);
    } catch (err) {
      console.error('Failed to load contact submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const openDeleteModal = (contact) => {
    setContactToDelete(contact);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;
    try {
      const remaining = await deleteContactSubmission(contactToDelete.id);
      setContacts(remaining);
      if (activeModalContact?.id === contactToDelete.id) {
        setActiveModalContact(null);
      }
      showToast('Contact message deleted successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete contact message.', 'error');
    } finally {
      setContactToDelete(null);
    }
  };

  return (
    <div className="space-y-6">

      {/* Messages List Table */}
      <div className="rounded-2xl sm:rounded-3xl border border-gray-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 bg-gray-50/80 font-extrabold uppercase tracking-wider text-gray-500">
              <tr>
                <th className="px-3.5 py-3">Date</th>
                <th className="px-3.5 py-3">Sender Details</th>
                <th className="px-3.5 py-3">Subject</th>
                <th className="px-3.5 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 font-medium">
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-12 text-center text-gray-400">
                    <span className="text-3xl block mb-2">📭</span>
                    No contact messages submitted yet.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setActiveModalContact(c)}
                    className="cursor-pointer hover:bg-emerald-50/70 transition"
                  >
                    <td className="px-3.5 py-3.5 whitespace-nowrap text-gray-500 font-mono text-[11px]">
                      {new Date(c.date).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className="px-3.5 py-3.5">
                      <div className="font-extrabold text-slate-900">{c.name}</div>
                      <div className="text-[11px] text-gray-500">{c.email} • {c.phone}</div>
                    </td>

                    <td className="px-3.5 py-3.5 max-w-[250px] truncate font-bold text-slate-800">
                      {c.subject}
                    </td>

                    <td className="px-3.5 py-3.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveModalContact(c)}
                          className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-extrabold text-[#0f7b4f] hover:bg-emerald-100 transition cursor-pointer"
                        >
                          👁️ View
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(c)}
                          className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-extrabold text-red-700 hover:bg-red-100 transition cursor-pointer"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Full Contact Record Details Modal */}
      {activeModalContact && (
        <div
          onClick={() => setActiveModalContact(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto cursor-default"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-[#0f7b4f] text-2xl shrink-0">
                  📬
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900 font-['Manrope']">
                    Contact Message Details
                  </h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    Submitted {new Date(activeModalContact.date).toLocaleString('en-GB')}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveModalContact(null)}
                className="grid h-8 w-8 place-items-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-slate-900 text-sm font-bold cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 text-xs">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/80 p-4 space-y-3">
                <div>
                  <span className="text-gray-400 uppercase font-black tracking-wider text-[10px] block">Sender Full Name</span>
                  <span className="font-black text-slate-900 text-base">{activeModalContact.name}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-gray-400 uppercase font-black tracking-wider text-[10px] block">Phone Number</span>
                    <a href={`tel:${activeModalContact.phone}`} className="font-bold text-[#0f7b4f] hover:underline text-xs flex items-center gap-1 mt-0.5">
                      📞 {activeModalContact.phone}
                    </a>
                  </div>

                  <div>
                    <span className="text-gray-400 uppercase font-black tracking-wider text-[10px] block">Email Address</span>
                    <a href={`mailto:${activeModalContact.email}`} className="font-bold text-[#0f7b4f] hover:underline text-xs truncate flex items-center gap-1 mt-0.5">
                      ✉️ {activeModalContact.email}
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <span className="text-gray-400 uppercase font-black tracking-wider text-[10px] block mb-1">Subject</span>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 font-extrabold text-slate-900 text-xs">
                  {activeModalContact.subject}
                </div>
              </div>

              <div>
                <span className="text-gray-400 uppercase font-black tracking-wider text-[10px] block mb-1">Message Body</span>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-slate-800 font-medium leading-relaxed whitespace-pre-wrap shadow-xs">
                  {activeModalContact.message}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  const target = activeModalContact;
                  setActiveModalContact(null);
                  openDeleteModal(target);
                }}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-black text-red-700 hover:bg-red-100 transition cursor-pointer"
              >
                🗑️ Delete Record
              </button>

              <button
                type="button"
                onClick={() => setActiveModalContact(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-black text-white shadow-md hover:bg-slate-800 transition cursor-pointer"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Contact Message?"
        subtitle="Contact Entry Removal"
        warningText={
          contactToDelete
            ? `The message submitted by ${contactToDelete.name} (${contactToDelete.email}) will be permanently deleted.`
            : 'This contact submission will be permanently deleted.'
        }
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
