export default function InfoCard({ icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-start gap-3 hover:-translate-y-0.5 hover:shadow-md transition-all cursor-default">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${accent || "bg-indigo-50 text-indigo-500"}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] text-gray-400 mb-0.5 uppercase tracking-wide font-bold">{label}</p>
        <p className="text-sm text-gray-800 font-semibold whitespace-pre-wrap break-words">{value}</p>
      </div>
    </div>
  );
}