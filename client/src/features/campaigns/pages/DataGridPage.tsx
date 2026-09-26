import { useState } from "react";
import CityDataGrid from "../components/CityDataGrid";
import CampaignDataGrid from "../components/CampaignDataGrid";

export default function DataGridPage() {
  const [tab, setTab] = useState<"city" | "campaign">("campaign");

  return (
    <div>
      <h2 className="text-2xl font-bold text-brand-black mb-1">Raw Data Grid</h2>
      <p className="text-sm text-brand-gray mb-6">Sortable, paginated view of extracted campaign data</p>

      <div className="flex gap-1 mb-5 bg-gray-100 rounded-lg p-1 w-fit">
        {(["campaign", "city"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              tab === t ? "bg-white text-brand-black shadow-sm" : "text-brand-gray hover:text-brand-black"
            }`}
          >
            {t}-wise
          </button>
        ))}
      </div>

      {tab === "campaign" ? <CampaignDataGrid /> : <CityDataGrid />}
    </div>
  );
}