
import { useEffect } from "react";
import type { ReactNode } from "react";
import {
  Check,
  ChevronRight,
  Globe2,
  KeyRound,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import {
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  createUserSchema,
  type CreateUserFormInput,
  type CreateUserFormValues,
} from "../userSchema";

import {
  defaultFeatures,
  FEATURE_DESCRIPTIONS,
  FEATURE_LABELS,
  GRANTABLE_FEATURES,
  type Feature,
} from "../access";

import {
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  ROLES,
  type Role,
} from "../types";

import { useGetPlatformsQuery } from "../../campaigns/dashboardApi";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (values: CreateUserFormValues) => Promise<void>;
  isSubmitting: boolean;
}

const inputClass =
  "h-11 w-full rounded-xl border border-brand-border bg-brand-surface px-3.5 text-sm font-medium text-brand-ink outline-none transition focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10";

export default function CreateUserModal({
  open,
  onClose,
  onCreate,
  isSubmitting,
}: CreateUserModalProps) {
  const { data: platforms = [] } = useGetPlatformsQuery();

  const {
    control,
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<
    CreateUserFormInput,
    unknown,
    CreateUserFormValues
  >({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
      platformAccess: "all",
      platforms: [],
      features: defaultFeatures("user"),
    },
  });

  const role = useWatch({
    control,
    name: "role",
  });

  const platformAccess = useWatch({
    control,
    name: "platformAccess",
  });
  
  const selectedPlatforms =
    useWatch({
      control,
      name: "platforms",
    }) ?? [];
  
  const features =
    useWatch({
      control,
      name: "features",
    }) ?? [];

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  if (!open) {
    return null;
  }

  const isSuperAdmin = role === "super_admin";

  const handleRoleChange = (nextRole: Role) => {
    setValue("role", nextRole, {
      shouldValidate: true,
    });

    setValue("features", defaultFeatures(nextRole), {
      shouldValidate: true,
    });
  };

  const toggleFeature = (feature: Feature) => {
    const currentFeatures = features;

    const nextFeatures = currentFeatures.includes(feature)
      ? currentFeatures.filter((item) => item !== feature)
      : [...currentFeatures, feature];

    setValue("features", nextFeatures, {
      shouldValidate: true,
    });
  };

  const togglePlatform = (platform: string) => {
    const nextPlatforms = selectedPlatforms.includes(platform)
      ? selectedPlatforms.filter((item) => item !== platform)
      : [...selectedPlatforms, platform];

    setValue("platforms", nextPlatforms, {
      shouldValidate: true,
    });
  };

  const submit: SubmitHandler<CreateUserFormValues> = async (
    values,
  ) => {
    await onCreate(values);
    reset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-[3px]">
      <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/50 bg-white shadow-2xl">
        {/* Header */}
        <div className="relative overflow-hidden border-b border-brand-border-light px-6 py-5">
          <div className="pointer-events-none absolute -right-10 -top-20 h-40 w-40 rounded-full bg-orange-200/20 blur-3xl" />

          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary-soft text-brand-primary">
                <UserRound className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-base font-bold text-brand-ink">
                  Create user
                </h2>

                <p className="mt-1 text-xs text-brand-gray">
                  Create an account and define exactly what it can
                  access.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              aria-label="Close create user dialog"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-brand-gray transition hover:bg-brand-surface disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(submit)}
          className="min-h-0 flex-1 overflow-y-auto"
          noValidate
        >
          <div className="space-y-7 p-6">
            {/* Identity */}
            <section>
              <SectionHeading
                number="01"
                icon={UserRound}
                title="Identity"
                description="Basic account information."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" error={errors.name?.message}>
                  <input
                    {...register("name")}
                    placeholder="e.g. Priya Sharma"
                    autoComplete="name"
                    className={`${inputClass} ${
                      errors.name ? "border-red-300" : ""
                    }`}
                  />
                </Field>

                <Field
                  label="Email address"
                  error={errors.email?.message}
                >
                  <input
                    type="email"
                    {...register("email")}
                    placeholder="user@company.com"
                    autoComplete="email"
                    className={`${inputClass} ${
                      errors.email ? "border-red-300" : ""
                    }`}
                  />
                </Field>

                <Field
                  label="Temporary password"
                  error={errors.password?.message}
                >
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-light" />

                    <input
                      type="password"
                      {...register("password")}
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                      className={`${inputClass} pl-10 ${
                        errors.password ? "border-red-300" : ""
                      }`}
                    />
                  </div>
                </Field>
              </div>
            </section>

            {/* Role */}
            <section>
              <SectionHeading
                number="02"
                icon={ShieldCheck}
                title="Role"
                description="Choose the account's starting permission profile."
              />

              <div className="grid gap-3 md:grid-cols-3">
                {ROLES.map((item) => {
                  const active = role === item;

                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => handleRoleChange(item)}
                      aria-pressed={active}
                      className={[
                        "group relative rounded-2xl border p-4 text-left transition-all duration-200",
                        active
                          ? "border-brand-primary bg-brand-primary-soft shadow-sm"
                          : "border-brand-border bg-white hover:-translate-y-0.5 hover:border-brand-primary/30 hover:bg-brand-surface",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className={[
                            "flex h-9 w-9 items-center justify-center rounded-xl",
                            active
                              ? "bg-white text-brand-primary"
                              : "bg-brand-surface text-brand-gray",
                          ].join(" ")}
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </div>

                        {active && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        )}
                      </div>

                      <p className="mt-4 text-sm font-bold text-brand-ink">
                        {ROLE_LABELS[item]}
                      </p>

                      <p className="mt-1 text-[11px] leading-5 text-brand-gray">
                        {ROLE_DESCRIPTIONS[item]}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Features */}
            <section>
              <SectionHeading
                number="03"
                icon={ShieldCheck}
                title="Feature access"
                description="Control which areas of Campaign Hub this user can open."
              />

              <div className="grid gap-3 md:grid-cols-2">
                {GRANTABLE_FEATURES.map((feature) => {
                  const checked =
                    isSuperAdmin || features.includes(feature);

                  return (
                    <button
                      key={feature}
                      type="button"
                      disabled={isSuperAdmin}
                      onClick={() => toggleFeature(feature)}
                      aria-pressed={checked}
                      className={[
                        "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all",
                        isSuperAdmin
                          ? "cursor-not-allowed border-brand-border bg-brand-surface"
                          : checked
                            ? "border-brand-primary/30 bg-brand-primary-soft"
                            : "border-brand-border bg-white hover:border-brand-primary/30 hover:bg-brand-surface",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition",
                          checked
                            ? "border-brand-primary bg-brand-primary text-white"
                            : "border-brand-border bg-white",
                        ].join(" ")}
                      >
                        {checked && <Check className="h-3 w-3" />}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-brand-ink">
                          {FEATURE_LABELS[feature]}
                        </p>

                        <p className="mt-1 text-[11px] leading-5 text-brand-gray">
                          {FEATURE_DESCRIPTIONS[feature]}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {isSuperAdmin && (
                <div className="mt-3 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-xs font-medium text-purple-700">
                  Super Admins automatically receive full feature
                  access.
                </div>
              )}

              {errors.features?.message && (
                <p className="mt-2 text-xs font-semibold text-red-600">
                  {errors.features.message}
                </p>
              )}
            </section>

            {/* Platforms */}
            <section>
              <SectionHeading
                number="04"
                icon={Globe2}
                title="Platform scope"
                description="Decide which commerce platforms this user can see."
              />

              <div className="grid gap-3 sm:grid-cols-2">
                <AccessChoice
                  active={platformAccess === "all"}
                  title="All platforms"
                  description="User can access every available platform."
                  onClick={() =>
                    setValue("platformAccess", "all", {
                      shouldValidate: true,
                    })
                  }
                />

                <AccessChoice
                  active={platformAccess === "custom"}
                  title="Selected platforms"
                  description="Restrict access to specific platforms."
                  onClick={() =>
                    setValue("platformAccess", "custom", {
                      shouldValidate: true,
                    })
                  }
                />
              </div>

              {platformAccess === "custom" && (
                <div className="mt-4 rounded-2xl border border-brand-border bg-brand-surface p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-bold text-brand-ink">
                      Available platforms
                    </p>

                    <span className="text-[10px] font-semibold text-brand-gray">
                      {selectedPlatforms.length} selected
                    </span>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    {platforms.map((platform) => {
                      const checked = selectedPlatforms.includes(
                        platform.name,
                      );

                      return (
                        <button
                          key={platform.id}
                          type="button"
                          onClick={() =>
                            togglePlatform(platform.name)
                          }
                          aria-pressed={checked}
                          className={[
                            "flex items-center gap-3 rounded-xl border bg-white px-3.5 py-3 text-left transition",
                            checked
                              ? "border-brand-primary/30 bg-brand-primary-soft"
                              : "border-brand-border hover:border-brand-primary/20",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "flex h-5 w-5 items-center justify-center rounded-md border",
                              checked
                                ? "border-brand-primary bg-brand-primary text-white"
                                : "border-brand-border",
                            ].join(" ")}
                          >
                            {checked && (
                              <Check className="h-3 w-3" />
                            )}
                          </span>

                          <span className="text-xs font-semibold text-brand-ink">
                            {platform.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {errors.platforms?.message && (
                <p className="mt-2 text-xs font-semibold text-red-600">
                  {errors.platforms.message}
                </p>
              )}
            </section>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 flex items-center justify-between border-t border-brand-border bg-white/95 px-6 py-4 backdrop-blur">
            <p className="hidden text-[11px] text-brand-gray sm:block">
              Access can be changed later.
            </p>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-10 rounded-xl border border-brand-border bg-white px-4 text-xs font-bold text-brand-gray transition hover:bg-brand-surface disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-ink px-5 text-xs font-bold text-white transition hover:bg-[#25201b] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create user
                    <ChevronRight className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   REUSABLE COMPONENTS
============================================================ */

function SectionHeading({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string;
  icon: typeof UserRound;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-ink text-[10px] font-bold text-white">
        {number}
      </div>

      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary-soft text-brand-primary">
        <Icon className="h-4 w-4" />
      </div>

      <div>
        <h3 className="text-sm font-bold text-brand-ink">
          {title}
        </h3>

        <p className="text-[11px] text-brand-gray">
          {description}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.13em] text-brand-gray">
        {label}
      </label>

      {children}

      {error && (
        <p className="mt-1.5 text-[11px] font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function AccessChoice({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "rounded-2xl border p-4 text-left transition-all",
        active
          ? "border-brand-primary/30 bg-brand-primary-soft"
          : "border-brand-border bg-white hover:border-brand-primary/20 hover:bg-brand-surface",
      ].join(" ")}
    >
      <div className="flex items-center gap-3">
        <span
          className={[
            "flex h-5 w-5 items-center justify-center rounded-full border",
            active
              ? "border-brand-primary bg-brand-primary"
              : "border-brand-border",
          ].join(" ")}
        >
          {active && (
            <span className="h-2 w-2 rounded-full bg-white" />
          )}
        </span>

        <div>
          <p className="text-xs font-bold text-brand-ink">
            {title}
          </p>

          <p className="mt-1 text-[11px] leading-5 text-brand-gray">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
