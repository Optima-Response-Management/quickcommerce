import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { createUserSchema, type CreateUserFormValues } from "../userSchema";
import { ROLES, ROLE_LABELS, type PlatformAccess, type Role } from "../types";
import {
  GRANTABLE_FEATURES,
  FEATURE_LABELS,
  FEATURE_DESCRIPTIONS,
  defaultFeatures,
  type GrantableFeature,
} from "../access";
import { PLATFORMS } from "../../campaigns/filterOptions";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (values: CreateUserFormValues) => void;
}

const inputClass =
  "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-orange/40 transition-all";

const cardClass = (active: boolean) =>
  `rounded-lg border px-4 py-3 text-left transition-colors ${
    active ? "border-brand-orange bg-orange-50" : "border-gray-300 hover:border-gray-400"
  }`;

export default function CreateUserModal({ open, onClose, onCreate }: CreateUserModalProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
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

  const role = watch("role");
  const platformAccess = watch("platformAccess");
  const platforms = watch("platforms");
  const features = watch("features");

  if (!open) return null;

  const isSuperAdmin = role === "super_admin";

  const handleRoleChange = (r: Role) => {
    setValue("role", r);
    setValue("features", defaultFeatures(r)); // pre-tick that role's defaults
    clearErrors("features");
  };

  const handleAccessChange = (type: PlatformAccess) => {
    setValue("platformAccess", type);
    if (type === "all") clearErrors("platforms");
  };

  const togglePlatform = (p: string) => {
    const next = platforms.includes(p) ? platforms.filter((x) => x !== p) : [...platforms, p];
    setValue("platforms", next, { shouldValidate: true });
  };

  const toggleFeature = (f: GrantableFeature) => {
    const next = features.includes(f) ? features.filter((x) => x !== f) : [...features, f];
    setValue("features", next, { shouldValidate: true });
  };

  const submit = (values: CreateUserFormValues) => {
    onCreate({
      ...values,
      platforms: values.platformAccess === "all" ? [...PLATFORMS] : values.platforms,
    });
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-brand-black">Create User</h3>
          <button onClick={handleClose} className="p-1.5 rounded-md text-brand-gray hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} noValidate className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1.5">Full name</label>
            <input
              {...register("name")}
              placeholder="e.g. Priya Sharma"
              className={`${inputClass} ${errors.name ? "border-red-400" : "border-gray-300 focus:border-brand-orange"}`}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1.5">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-black mb-1.5">Email address</label>
            <input
              type="email"
              {...register("email")}
              placeholder="user@company.com"
              className={`${inputClass} ${errors.email ? "border-red-400" : "border-gray-300 focus:border-brand-orange"}`}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1.5">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-black mb-1.5">Temporary password</label>
            <input
              type="password"
              {...register("password")}
              placeholder="••••••••"
              className={`${inputClass} ${errors.password ? "border-red-400" : "border-gray-300 focus:border-brand-orange"}`}
            />
            {errors.password && <p className="text-xs text-red-600 mt-1.5">{errors.password.message}</p>}
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1.5">Role</label>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((r) => (
                <button key={r} type="button" onClick={() => handleRoleChange(r)} className={cardClass(role === r)}>
                  <p className="text-sm font-semibold text-brand-black">{ROLE_LABELS[r]}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Feature access */}
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
                    checked={features.includes(f)}
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
            {errors.features && <p className="text-xs text-red-600 mt-1.5">{errors.features.message}</p>}
          </div>

          {/* Platform access */}
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1.5">Platform access</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => handleAccessChange("all")} className={cardClass(platformAccess === "all")}>
                <p className="text-sm font-semibold text-brand-black">All Platforms</p>
                <p className="text-xs text-brand-gray mt-0.5">See data from every platform</p>
              </button>
              <button type="button" onClick={() => handleAccessChange("custom")} className={cardClass(platformAccess === "custom")}>
                <p className="text-sm font-semibold text-brand-black">Custom</p>
                <p className="text-xs text-brand-gray mt-0.5">Pick specific platforms</p>
              </button>
            </div>

            {platformAccess === "custom" && (
              <div className="grid grid-cols-2 gap-2 mt-3">
                {PLATFORMS.map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-2.5 rounded-lg border border-gray-300 px-3.5 py-2.5 cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={platforms.includes(p)}
                      onChange={() => togglePlatform(p)}
                      className="w-4 h-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange/40"
                    />
                    <span className="text-sm text-brand-black">{p}</span>
                  </label>
                ))}
              </div>
            )}
            {errors.platforms && <p className="text-xs text-red-600 mt-1.5">{errors.platforms.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-300 text-brand-gray hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-brand-orange hover:bg-brand-orange-dark text-white transition-colors"
            >
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}