export default function CustomerDashboardPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-black mb-1">Campaign Overview</h2>
      <p className="text-sm text-brand-gray mb-6">Processed data and insights across your campaigns</p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {["Total Spend", "Total Clicks", "Avg. CTR"].map((label) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-xs text-brand-gray font-medium mb-1">{label}</p>
            <p className="text-2xl font-bold text-brand-black">—</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm text-brand-gray">Data grid + charts go here</p>
      </div>
    </div>
  );
}