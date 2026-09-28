import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { createUserSchema, type CreateUserFormValues } from "../userSchema";
import { ROLES, ROLE_LABELS, type PlatformAccess, type Role } from "../types";
// Import feature constants
import { FEATURE_LABELS, ROLE_ACCESS, type Feature } from "../access"; 
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
      // Set default features based on the default 'user' role
      features: ROLE_ACCESS["user"], 
    },
  });

  const role = watch("role");
  const platformAccess = watch("platformAccess");
  const platforms = watch("platforms");
  const selectedFeatures = watch("features") || [];

  // Automatically update features when the selected role changes
  useEffect(() => {
    if (role) {
      setValue("features", ROLE_ACCESS[role] || []);
    }
  }, [role, setValue]);

  if (!open) return null;

  const features = Object.keys(FEATURE_LABELS) as Feature[];

  const handleAccessChange = (type: PlatformAccess) => {
    setValue("platformAccess", type);
    if (type === "all") clearErrors("platforms");
  };

  const togglePlatform = (p: string) => {
    const next = platforms.includes(p) ? platforms.filter((x) => x !== p) : [...platforms, p];
    setValue("platforms", next, { shouldValidate: true });
  };

  const toggleFeature = (f: Feature) => {
    const next = selectedFeatures.includes(f)
      ? selectedFeatures.filter((x) => x !== f)
      : [...selectedFeatures, f];
    setValue("features", next, { shouldValidate: true });
  };

  const submit = (values: CreateUserFormValues) => {
    onCreate({
      ...values,
      platforms: values.platformAccess === "all" ? PLATFORMS : values.platforms,
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-brand-black">Create User</h3>
          <button onClick={handleClose} className="p-1.5 rounded-md text-brand-gray hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} noValidate className="px-6 py-5 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1.5">Full name</label>
            <input
              {...register("name")}
              placeholder="e.g. Priya Sharma"
              className={`${inputClass} ${errors.name ? "border-red-400" : "border-gray-300 focus:border-brand-orange"}`}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1.5">{errors.name.message}</p>}
          </div>

          {/* Email */}
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

          {/* Password */}
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

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1.5">Role</label>
            <div className="grid grid-cols-3 gap-3">
              {ROLES.map((r: Role) => (
                <button key={r} type="button" onClick={() => setValue("role", r)} className={cardClass(role === r)}>
                  <p className="text-sm font-semibold text-brand-black">{ROLE_LABELS[r]}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 🌟 NEW: Feature Access Section 🌟 */}
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1.5">Feature Access</label>
            <p className="text-xs text-brand-gray mb-2.5">Auto-filled based on role, but you can customize it.</p>
            <div className="grid grid-cols-2 gap-2">
              {features.map((f) => (
                <label
                  key={f}
                  className="flex items-center gap-2.5 rounded-lg border border-gray-300 px-3.5 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedFeatures.includes(f)}
                    onChange={() => toggleFeature(f)}
                    className="w-4 h-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange/40"
                  />
                  <span className="text-sm text-brand-black">{FEATURE_LABELS[f]}</span>
                </label>
              ))}
            </div>
            {errors.features && <p className="text-xs text-red-600 mt-1.5">{errors.features.message}</p>}
          </div>

          {/* Platform access */}
          <div>
            <label className="block text-sm font-medium text-brand-black mb-1.5">Platform access</label>
            <div className="grid grid-cols-2 gap-3 mb-3">
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
              <div className="grid grid-cols-2 gap-2">
                {PLATFORMS.map((p) => (
                  <label
                    key={p}
                    className="flex items-center gap-2.5 rounded-lg border border-gray-300 px-3.5 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
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

          {/* Actions */}
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