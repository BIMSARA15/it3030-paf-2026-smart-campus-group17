import { MapPin, Package, Pencil, Trash2 } from 'lucide-react';

export default function UtilityCard({ utility, onEdit, onDelete, deleting }) {
  return (
    <article className="group h-full rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_32px_rgba(37,99,235,0.1)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-[#2563EB]">
          <Package className="h-5 w-5" />
        </div>
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-[#2563EB]">
          {utility.category}
        </span>
      </div>

      <div className="mb-1">
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {utility.utilityCode}
        </span>
      </div>

      <h3 className="text-xl font-semibold leading-tight text-slate-900">
        {utility.utilityName}
      </h3>

      <div className="mt-3 space-y-2.5 text-slate-500">
        <div className="text-sm">
          <span className="font-medium text-slate-600">Quantity:</span>{' '}
          <span>{utility.quantity}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          <span>{utility.location}</span>
        </div>
      </div>

      {utility.description && (
        <p className="mt-3 line-clamp-2 text-sm leading-5 text-slate-500">
          {utility.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {utility.status}
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(utility)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(utility)}
            disabled={deleting}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}
