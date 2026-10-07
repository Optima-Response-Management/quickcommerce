import {
  AlertTriangle,
  Trash2,
  X,
} from "lucide-react";

interface ConfirmDeleteModalProps {
  userName: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export default function ConfirmDeleteModal({
  userName,
  onCancel,
  onConfirm,
  isDeleting,
}: ConfirmDeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 backdrop-blur-[3px]">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl">
        <div className="border-b border-brand-border-light px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 className="h-5 w-5" />
            </div>

            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-brand-gray hover:bg-brand-surface"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-lg font-bold text-brand-ink">
            Delete user?
          </h2>

          <p className="mt-2 text-sm leading-6 text-brand-gray">
            You are about to remove{" "}
            <span className="font-bold text-brand-ink">
              {userName}
            </span>{" "}
            from Campaign Hub.
          </p>

          <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

            <p className="text-xs leading-5 text-amber-700">
              This action permanently removes
              the account and its access. Make
              sure this user no longer needs
              access before continuing.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="h-10 rounded-xl border border-brand-border bg-white px-4 text-xs font-bold text-brand-gray hover:bg-brand-surface disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />

              {isDeleting
                ? "Deleting..."
                : "Delete user"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}