import {
  Check,
  Globe2,
  ShieldCheck,
  X,
} from "lucide-react";

import { useState } from "react";

import {
  FEATURE_DESCRIPTIONS,
  FEATURE_LABELS,
  GRANTABLE_FEATURES,
  ALL_FEATURES,
  type Feature,
} from "../access";

import {
  ROLE_LABELS,
  type ManagedUser,
  type PlatformAccess,
} from "../types";

import { useGetPlatformsQuery } from "../../campaigns/dashboardApi";

interface ManageAccessModalProps {
  user: ManagedUser;
  onClose: () => void;

  onSave: (changes: {
    features: Feature[];
    platformAccess: PlatformAccess;
    platforms: string[];
  }) => Promise<void>;

  isSubmitting: boolean;
}

export default function ManageAccessModal({
  user,
  onClose,
  onSave,
  isSubmitting,
}: ManageAccessModalProps) {
  const {
    data: platforms = [],
  } = useGetPlatformsQuery();

  const isSuperAdmin =
    user.role === "super_admin";

  const [
    features,
    setFeatures,
  ] = useState<Feature[]>(
    isSuperAdmin
      ? ALL_FEATURES
      : user.features,
  );

  const [
    platformAccess,
    setPlatformAccess,
  ] =
    useState<PlatformAccess>(
      user.platformAccess,
    );

  const [
    selectedPlatforms,
    setSelectedPlatforms,
  ] = useState<string[]>(
    user.platformAccess ===
      "custom"
      ? user.platforms
      : [],
  );

  const [
    error,
    setError,
  ] = useState("");

  const toggleFeature = (
    feature: Feature,
  ) => {
    if (isSuperAdmin) {
      return;
    }

    setFeatures(
      (current) =>
        current.includes(
          feature,
        )
          ? current.filter(
              (item) =>
                item !==
                feature,
            )
          : [
              ...current,
              feature,
            ],
    );

    setError("");
  };

  const togglePlatform = (
    platform: string,
  ) => {
    setSelectedPlatforms(
      (current) =>
        current.includes(
          platform,
        )
          ? current.filter(
              (item) =>
                item !==
                platform,
            )
          : [
              ...current,
              platform,
            ],
    );

    setError("");
  };

  const save = async () => {
    if (
      !isSuperAdmin &&
      features.length === 0
    ) {
      setError(
        "Select at least one feature.",
      );
      return;
    }

    if (
      platformAccess ===
        "custom" &&
      selectedPlatforms.length ===
        0
    ) {
      setError(
        "Select at least one platform.",
      );
      return;
    }

    try {
      await onSave({
        features:
          isSuperAdmin
            ? ALL_FEATURES
            : features,

        platformAccess,

        platforms:
          platformAccess ===
          "all"
            ? []
            : selectedPlatforms,
      });
    } catch {
      // Parent displays API error.
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-[3px]">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/50 bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-brand-border-light px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-bold text-brand-ink">
                  Manage access
                </h2>

                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs text-brand-gray">
                    {user.name}
                  </span>

                  <span className="text-brand-gray-light">
                    ·
                  </span>

                  <span className="text-xs font-semibold text-brand-primary">
                    {
                      ROLE_LABELS[
                        user.role
                      ]
                    }
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                isSubmitting
              }
              className="flex h-9 w-9 items-center justify-center rounded-xl text-brand-gray transition hover:bg-brand-surface"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-7 p-6">
          {/* Features */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary">
                <ShieldCheck className="h-4 w-4" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-brand-ink">
                  Feature access
                </h3>

                <p className="text-[11px] text-brand-gray">
                  Control which parts of
                  Campaign Hub the user can
                  access.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {GRANTABLE_FEATURES.map(
                (feature) => {
                  const checked =
                    isSuperAdmin ||
                    features.includes(
                      feature,
                    );

                  return (
                    <button
                      key={
                        feature
                      }
                      type="button"
                      disabled={
                        isSuperAdmin
                      }
                      onClick={() =>
                        toggleFeature(
                          feature,
                        )
                      }
                      className={[
                        "flex items-start gap-3 rounded-2xl border p-4 text-left transition",
                        checked
                          ? "border-brand-primary/30 bg-brand-primary-soft"
                          : "border-brand-border hover:bg-brand-surface",
                        isSuperAdmin
                          ? "cursor-not-allowed"
                          : "",
                      ].join(
                        " ",
                      )}
                    >
                      <span
                        className={[
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border",
                          checked
                            ? "border-brand-primary bg-brand-primary text-white"
                            : "border-brand-border bg-white",
                        ].join(
                          " ",
                        )}
                      >
                        {checked && (
                          <Check className="h-3 w-3" />
                        )}
                      </span>

                      <div>
                        <p className="text-xs font-bold text-brand-ink">
                          {
                            FEATURE_LABELS[
                              feature
                            ]
                          }
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-brand-gray">
                          {
                            FEATURE_DESCRIPTIONS[
                              feature
                            ]
                          }
                        </p>
                      </div>
                    </button>
                  );
                },
              )}
            </div>

            {isSuperAdmin && (
              <p className="mt-3 rounded-xl bg-purple-50 px-4 py-3 text-xs font-medium text-purple-700">
                Super Admins always have full
                feature access.
              </p>
            )}
          </section>

          {/* Platform */}
          <section>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary">
                <Globe2 className="h-4 w-4" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-brand-ink">
                  Platform scope
                </h3>

                <p className="text-[11px] text-brand-gray">
                  Decide which platforms this
                  user can see.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  setPlatformAccess(
                    "all",
                  );
                  setError("");
                }}
                className={[
                  "rounded-2xl border p-4 text-left transition",
                  platformAccess ===
                    "all"
                    ? "border-brand-primary/30 bg-brand-primary-soft"
                    : "border-brand-border hover:bg-brand-surface",
                ].join(" ")}
              >
                <p className="text-xs font-bold text-brand-ink">
                  All platforms
                </p>

                <p className="mt-1 text-[11px] leading-5 text-brand-gray">
                  Access every active commerce
                  platform.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPlatformAccess(
                    "custom",
                  );
                  setError("");
                }}
                className={[
                  "rounded-2xl border p-4 text-left transition",
                  platformAccess ===
                    "custom"
                    ? "border-brand-primary/30 bg-brand-primary-soft"
                    : "border-brand-border hover:bg-brand-surface",
                ].join(" ")}
              >
                <p className="text-xs font-bold text-brand-ink">
                  Selected platforms
                </p>

                <p className="mt-1 text-[11px] leading-5 text-brand-gray">
                  Restrict access to selected
                  platforms.
                </p>
              </button>
            </div>

            {platformAccess ===
              "custom" && (
              <div className="mt-4 rounded-2xl border border-brand-border bg-brand-surface p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-bold text-brand-ink">
                    Platforms
                  </p>

                  <span className="text-[10px] font-semibold text-brand-gray">
                    {
                      selectedPlatforms.length
                    }{" "}
                    selected
                  </span>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {platforms.map(
                    (
                      platform,
                    ) => {
                      const checked =
                        selectedPlatforms.includes(
                          platform.name,
                        );

                      return (
                        <button
                          key={
                            platform.id
                          }
                          type="button"
                          onClick={() =>
                            togglePlatform(
                              platform.name,
                            )
                          }
                          className={[
                            "flex items-center gap-3 rounded-xl border bg-white px-3.5 py-3 text-left transition",
                            checked
                              ? "border-brand-primary/30 bg-brand-primary-soft"
                              : "border-brand-border",
                          ].join(
                            " ",
                          )}
                        >
                          <span
                            className={[
                              "flex h-5 w-5 items-center justify-center rounded-md border",
                              checked
                                ? "border-brand-primary bg-brand-primary text-white"
                                : "border-brand-border",
                            ].join(
                              " ",
                            )}
                          >
                            {checked && (
                              <Check className="h-3 w-3" />
                            )}
                          </span>

                          <span className="text-xs font-semibold text-brand-ink">
                            {
                              platform.name
                            }
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            )}
          </section>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-semibold text-red-600">
              {error}
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-2 border-t border-brand-border-light pt-5">
            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                isSubmitting
              }
              className="h-10 rounded-xl border border-brand-border bg-white px-4 text-xs font-bold text-brand-gray hover:bg-brand-surface disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={
                save
              }
              disabled={
                isSubmitting
              }
              className="h-10 rounded-xl bg-brand-ink px-5 text-xs font-bold text-white hover:bg-[#25201b] disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : "Save access"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}