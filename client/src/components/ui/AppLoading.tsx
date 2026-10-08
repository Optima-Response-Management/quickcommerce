import { Loader2 } from "lucide-react";

export default function AppLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-surface">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg">
          <Loader2
            className="h-6 w-6 animate-spin"
            aria-hidden="true"
          />
        </div>

        <div className="text-center">
          <p className="text-sm font-bold text-brand-ink">
            Campaign Hub
          </p>

          <p className="mt-1 text-xs text-brand-gray">
            Loading workspace...
          </p>
        </div>
      </div>
    </div>
  );
}