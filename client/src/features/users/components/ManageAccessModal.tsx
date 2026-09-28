import { useState } from "react";
import { X } from "lucide-react";
import { PLATFORMS } from "../../campaigns/filterOptions";
import {
  ALL_FEATURES,
  GRANTABLE_FEATURES,
  FEATURE_LABELS,
  FEATURE_DESCRIPTIONS,
  type Feature,
  type GrantableFeature,
} from "../access";
import { ROLE_LABELS, type ManagedUser, type PlatformAccess } from "../types";

interface ManageAccessModalProps {
  user: ManagedUser;
  onClose: () => void;
  onSave: (changes: { features: Feature[]; platformAccess: PlatformAccess; platforms: string[] }) => void;
}

const cardClass = (active: boolean) =>
  `rounded-lg border px-4 py-3 text-left transition-colors ${
    active ? "border-brand-orange bg-orange-50" : "border-gray-300 hover:border-gray-400"
  }`;

export default function ManageAccessModal({ user, onClose, onSave }: ManageAccessModalProps) {
  const isSuperAdmin = user.role === "super_admin";

  const [features, setFeatures] = useState<GrantableFeature[]>(
    GRANTABLE_FEATURES.filter((f) => user.features.includes(f))
  );
  const [access, setAccess] = useState<PlatformAccess>(user.platformAccess);
  const [selected, setSelected] = useState<string[]>(user.platformAccess === "custom" ? user.platforms : []);
  const [error, setError] = useState("");

  const toggleFeature = (f: GrantableFeature) => {
    setError("");
    setFeatures((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));
  };

  const togglePlatform = (p: string) => {
    setError("");
    setSelected((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const save = () => {
    if (!isSuperAdmin && features.length === 0) {
      setError("Select at least one feature");
      return;
    }
    if (access === "custom" && selected.length === 0) {
      setError("Select at least one platform");
      return;
    }
    onSave({
      features: isSuperAdmin ? ALL_FEATURES : features,
      platformAccess: access,
      platforms: access === "all" ? [...PLATFORMS] : selected,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-brand-black">Manage Access</h3>
            <p className="text-xs text-brand-gray mt-0.5">
              {user.name} · {ROLE_LABELS[user.role]}
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-md text-brand-gray hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* Features */}
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1.5">Feature access</label>
            <div className="space-y-2">
              {GRANTABLE_FEATURES.map((f) => (
                <label
                  key={f}
                  className={`flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    isSuperAdmin
                      ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                      : "border-gray-300 cursor-pointer hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSuperAdmin || features.includes(f)}
                    disabled={isSuperAdmin}
                    onChange={() => toggleFeature(f)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange/40"
                  />
                  <div>
                    <p className="text-sm font-medium text-brand-black">{FEATURE_LABELS[f]}</p>
                    <p className="text-xs text-brand-gray">{FEATURE_DESCRIPTIONS[f]}</p>
                  </div>
                </label>
              ))}
            </div>
            {isSuperAdmin && (
              <p className="text-xs text-brand-gray mt-1.5">Super Admins always have full feature access.</p>
            )}
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1.5">Platform access</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => { setAccess("all"); setError(""); }} className={cardClass(access === "all")}>
                <p className="text-sm font-semibold text-brand-black">All Platforms</p>
                <p className="text-xs text-brand-gray mt-0.5">See data from every platform</p>
              </button>
              <button type="button" onClick={() => setAccess("custom")} className={cardClass(access === "custom")}>
                <p className="text-sm font-semibold text-brand-black">Custom</p>
                <p className="text-xs text-brand-gray mt-0.5">Pick specific platforms</p>
              </button>
            </div>

            {access === "custom" && (
              <div className="mt-3">
                <p className="text-xs text-brand-gray mb-2">Tick to give access to a platform, untick to remove it.</p>
                <div className="grid grid-cols-2 gap-2">
                  {PLATFORMS.map((p) => (
                    <label
                      key={p}
                      className="flex items-center gap-2.5 rounded-lg border border-gray-300 px-3.5 py-2.5 cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(p)}
                        onChange={() => togglePlatform(p)}
                        className="w-4 h-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange/40"
                      />
                      <span className="text-sm text-brand-black">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-brand-gray hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-brand-orange hover:bg-brand-orange-dark text-white transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}