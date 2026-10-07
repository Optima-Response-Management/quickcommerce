
import {
  Activity,
  FileCheck2,
  ShieldCheck,
  UploadCloud,
} from "lucide-react";

import UploadExcel from "../components/UploadExcel";

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-[1500px] space-y-6">
      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div
        className="
          flex flex-col gap-5
          lg:flex-row lg:items-end lg:justify-between
        "
      >
        <div>
          <div
            className="
              mb-2 inline-flex items-center gap-2
              text-xs font-semibold
              uppercase tracking-[0.14em]
              text-brand-primary
            "
          >
            <UploadCloud size={14} />
            Data management
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-brand-ink">
            Upload Campaign Data
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-brand-gray">
            Import platform reports, validate their structure, and securely
            publish campaign rows into the reporting workspace.
          </p>
        </div>

        {/* =====================================================
            STATUS MINI CARDS
        ===================================================== */}

        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div
            className="
              rounded-xl
              border border-brand-border
              bg-white
              px-3 py-2.5
              shadow-sm
            "
          >
            <div className="mb-1 flex items-center gap-1.5 text-brand-gray">
              <FileCheck2 size={14} />
              <span className="text-[10px] font-semibold uppercase tracking-wide">
                Validation
              </span>
            </div>

            <p className="text-xs font-semibold text-brand-ink">
              Enabled
            </p>
          </div>

          <div
            className="
              rounded-xl
              border border-brand-border
              bg-white
              px-3 py-2.5
              shadow-sm
            "
          >
            <div className="mb-1 flex items-center gap-1.5 text-brand-gray">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-semibold uppercase tracking-wide">
                Security
              </span>
            </div>

            <p className="text-xs font-semibold text-brand-ink">
              Protected
            </p>
          </div>

          <div
            className="
              rounded-xl
              border border-brand-border
              bg-white
              px-3 py-2.5
              shadow-sm
            "
          >
            <div className="mb-1 flex items-center gap-1.5 text-brand-gray">
              <Activity size={14} />
              <span className="text-[10px] font-semibold uppercase tracking-wide">
                Pipeline
              </span>
            </div>

            <p className="text-xs font-semibold text-brand-ink">
              Live
            </p>
          </div>
        </div>
      </div>

      <UploadExcel />
    </div>
  );
}
