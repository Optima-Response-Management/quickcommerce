import {
  Check,
  Globe2,
  ShieldCheck,
  Users,
} from "lucide-react";

import {
  FEATURE_LABELS,
  ROLE_ACCESS,
} from "../access";

import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  ROLES,
} from "../types";

export default function AccessMatrix() {
  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-brand-border bg-white shadow-brand-sm">
      <div className="border-b border-brand-border-light bg-[#fdfcfb] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary">
            <ShieldCheck className="h-4 w-4" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-brand-ink">
              Permission model
            </h2>

            <p className="mt-1 text-xs text-brand-gray">
              Role defaults are starting points.
              Individual access can be customized
              for each user.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 p-5 lg:grid-cols-3">
        {ROLES.map((role) => {
          const features =
            ROLE_ACCESS[role];

          return (
            <div
              key={role}
              className="rounded-2xl border border-brand-border bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-brand-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-surface text-brand-primary">
                  {role ===
                  "super_admin" ? (
                    <ShieldCheck className="h-4 w-4" />
                  ) : role === "admin" ? (
                    <Users className="h-4 w-4" />
                  ) : (
                    <Globe2 className="h-4 w-4" />
                  )}
                </div>

                <span className="rounded-full bg-brand-surface px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-brand-gray">
                  Default
                </span>
              </div>

              <h3 className="mt-4 text-sm font-bold text-brand-ink">
                {ROLE_LABELS[role]}
              </h3>

              <p className="mt-1 text-[11px] leading-5 text-brand-gray">
                {
                  ROLE_DESCRIPTIONS[
                    role
                  ]
                }
              </p>

              <div className="mt-4 space-y-2">
                {Object.entries(
                  FEATURE_LABELS,
                ).map(
                  ([
                    feature,
                    label,
                  ]) => {
                    const enabled =
                      features.includes(
                        feature as any,
                      );

                    return (
                      <div
                        key={
                          feature
                        }
                        className="flex items-center justify-between"
                      >
                        <span className="text-[11px] text-brand-gray">
                          {label}
                        </span>

                        {enabled ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-brand-border" />
                        )}
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}