import React from 'react';
import { Trash2, Save } from 'lucide-react';

export default function ConfirmDeleteModal({
  isOpen,
  title = 'Confirm Deletion',
  itemName = '',
  loading = false,
  onDelete,
  onSave,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D2226]/55 backdrop-blur-xs px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#FDF6F5] border border-[#C8A262]/70 shadow-xl p-6 space-y-5">
        <div className="space-y-1.5">
          <span className="text-[11px] uppercase tracking-[0.18em] font-semibold text-[#B8335A]">
            Kirei Collection Admin
          </span>
          <h3
            id="delete-modal-title"
            className="text-lg font-bold text-[#2D2226]"
          >
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-[#5A4A4F] leading-relaxed">
            {itemName ? (
              <>
                Are you sure you want to delete{' '}
                <span className="font-semibold text-[#2D2226]">
                  “{itemName}”
                </span>
                ? Choose <span className="font-semibold text-[#2D2226]">Save</span>{' '}
                to keep it or <span className="font-semibold text-red-700">Delete</span>{' '}
                to remove it permanently.
              </>
            ) : (
              'Choose Save to keep this item or Delete to remove it permanently.'
            )}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-1">
          <button
            type="button"
            disabled={loading}
            onClick={onSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-[#F7E4E2] disabled:opacity-50 text-[#2D2226] border border-[#C8A262]/65 text-xs font-semibold transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-[#B8335A]" />
            <span>Save</span>
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{loading ? 'Deleting...' : 'Delete'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}