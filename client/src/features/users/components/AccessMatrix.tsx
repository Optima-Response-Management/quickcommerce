import { ROLE_ACCESS, FEATURE_LABELS, type Feature } from "../access";
import { ROLE_LABELS, ROLES } from "../types";

const features = Object.keys(FEATURE_LABELS) as Feature[];

export default function AccessMatrix() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-brand-black">What each role can access</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-xs text-brand-gray uppercase tracking-wide">
              <th className="px-5 py-3 font-medium">Role</th>
              {features.map((f) => (
                <th key={f} className="px-5 py-3 font-medium whitespace-nowrap">{FEATURE_LABELS[f]}</th>
              ))}
              <th className="px-5 py-3 font-medium">Platforms</th>
            </tr>
          </thead>
          <tbody>
            {ROLES.map((role) => (
              <tr key={role} className="border-t border-gray-100">
                <td className="px-5 py-3 font-medium text-brand-black">{ROLE_LABELS[role]}</td>
                {features.map((f) => (
                  <td key={f} className="px-5 py-3">
                    {ROLE_ACCESS[role].includes(f) ? (
                      <span className="text-brand-orange-dark font-semibold">✓</span>
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                ))}
                <td className="px-5 py-3 text-brand-gray">All or Custom, set per person</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}