import React, { useEffect, useState } from 'react';
import { Check, X, Trash2, Star } from 'lucide-react';
import { supabase } from '../supabaseClient';
import ConfirmDeleteModal from './ConfirmDeleteModal';

export default function AdminFeedbackQueue() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [message, setMessage] = useState('');
  const [pendingFeedbackDelete, setPendingFeedbackDelete] = useState(null);
  const [deletingFeedback, setDeletingFeedback] = useState(false);

  async function loadFeedback() {
    setLoading(true);
    setMessage('');
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setMessage(`Could not load feedback: ${error.message}`);
    } else {
      setItems(data ?? []);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadFeedback();
  }, []);

  async function updateStatus(id, nextStatus) {
    setMessage('');
    const { error } = await supabase
      .from('feedback')
      .update({ status: nextStatus })
      .eq('id', id);

    if (error) {
      setMessage(`Update failed: ${error.message}`);
      return;
    }

    setItems((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status: nextStatus } : row))
    );
    setMessage(`Feedback marked as ${nextStatus}.`);
  }

  async function confirmDeleteFeedback() {
    if (!pendingFeedbackDelete) return;
    const id = pendingFeedbackDelete.id;

    setDeletingFeedback(true);
    setMessage('');

    const { error } = await supabase.from('feedback').delete().eq('id', id);

    setDeletingFeedback(false);
    setPendingFeedbackDelete(null);

    if (error) {
      setMessage(`Delete failed: ${error.message}`);
      return;
    }

    setItems((prev) => prev.filter((row) => row.id !== id));
    setMessage('Feedback deleted.');
  }

  const filtered =
    statusFilter === 'all'
      ? items
      : items.filter((item) => item.status === statusFilter);

  const pendingCount = items.filter((i) => i.status === 'pending').length;

  return (
    <section className="max-w-5xl mx-auto px-4 pb-12">
      <div className="rounded-2xl bg-white border border-[#C8A262]/55 shadow-sm p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#2D2226]">
              Customer Feedback Moderation
              {pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#B8335A] text-[#FDF6F5]">
                  {pendingCount} pending
                </span>
              )}
            </h2>
            <p className="text-xs text-[#5A4A4F]">
              Only approved feedback is visible on the storefront.
            </p>
          </div>

          <div className="flex gap-1.5 text-xs">
            {['pending', 'approved', 'rejected', 'all'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1 rounded-full capitalize border transition-colors ${
                  statusFilter === tab
                    ? 'bg-[#B8335A] text-[#FDF6F5] border-[#B8335A] font-semibold'
                    : 'bg-[#FDF6F5] text-[#2D2226] border-[#C8A262]/55 hover:border-[#B8335A]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {message && (
          <p className="text-xs font-medium text-[#9E2448] bg-[#F7E4E2] border border-[#C8A262]/60 rounded-lg px-3 py-2">
            {message}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-[#5A4A4F]">Loading feedback...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-[#5A4A4F] bg-[#FDF6F5] rounded-xl p-6 text-center border border-[#C8A262]/35">
            No {statusFilter === 'all' ? '' : statusFilter} feedback items.
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-xl bg-[#FDF6F5] border border-[#C8A262]/45 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-[#2D2226]">
                      {item.customer_name}
                    </span>
                    <span className="text-[11px] uppercase px-2 py-0.5 rounded-full bg-[#F7E4E2] text-[#2D2226] border border-[#C8A262]/40">
                      {item.store_type}
                    </span>
                    <span className="text-[11px] uppercase px-2 py-0.5 rounded-full font-semibold bg-white text-[#9E2448] border border-[#C8A262]/50">
                      {item.status}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-xs text-[#2D2226] font-medium">
                      <Star className="w-3.5 h-3.5 fill-[#C8A262] text-[#C8A262]" />
                      {item.rating}/5
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-[#2D2226]">
                    “{item.comment}”
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => updateStatus(item.id, 'approved')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#B8335A] hover:bg-[#9E2448] text-[#FDF6F5] text-xs font-semibold transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  )}
                  {item.status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => updateStatus(item.id, 'rejected')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-white hover:bg-[#F7E4E2] text-[#2D2226] border border-[#C8A262]/60 text-xs font-medium transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setPendingFeedbackDelete(item)}
                    className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
                    aria-label="Delete feedback"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={Boolean(pendingFeedbackDelete)}
        title="Delete Customer Feedback"
        itemName={pendingFeedbackDelete?.customer_name}
        loading={deletingFeedback}
        onSave={() => setPendingFeedbackDelete(null)}
        onDelete={confirmDeleteFeedback}
      />
    </section>
  );
}