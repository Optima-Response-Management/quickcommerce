import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
} from "lucide-react";

import {
  loginSchema,
  type LoginFormValues,
} from "../authSchema";

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  loading?: boolean;
  error?: string;
}

export default function LoginForm({
  onSubmit,
  loading,
  error,
}: LoginFormProps) {
  const [showPassword, setShowPassword] =
    useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-5"
      noValidate
    >
      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-xs font-bold uppercase tracking-wide text-brand-ink"
        >
          Email address
        </label>

        <div className="group relative">
          <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-light transition group-focus-within:text-brand-primary" />

          <input
            id="email"
            type="email"
            {...register("email")}
            className={[
              "h-12 w-full rounded-xl border bg-brand-surface pl-11 pr-4",
              "text-sm text-brand-ink placeholder:text-brand-gray-light",
              "outline-none transition-all",
              "focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10",
              errors.email
                ? "border-red-400"
                : "border-brand-border",
            ].join(" ")}
            placeholder="you@company.com"
          />
        </div>

        {errors.email && (
          <p className="mt-1.5 text-xs text-red-600">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-xs font-bold uppercase tracking-wide text-brand-ink"
          >
            Password
          </label>

          <a
            href="#"
            className="text-xs font-semibold text-brand-primary transition hover:text-brand-primary-dark"
          >
            Forgot password?
          </a>
        </div>

        <div className="group relative">
          <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-gray-light transition group-focus-within:text-brand-primary" />

          <input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className={[
              "h-12 w-full rounded-xl border bg-brand-surface pl-11 pr-11",
              "text-sm text-brand-ink placeholder:text-brand-gray-light",
              "outline-none transition-all",
              "focus:border-brand-primary focus:bg-white focus:ring-4 focus:ring-brand-primary/10",
              errors.password
                ? "border-red-400"
                : "border-brand-border",
            ].join(" ")}
            placeholder="••••••••"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword((value) => !value)
            }
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-gray-light transition hover:text-brand-ink"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {errors.password && (
          <p className="mt-1.5 text-xs text-red-600">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Remember */}
      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          id="remember"
          type="checkbox"
          className="h-4 w-4 rounded border-brand-border text-brand-primary accent-orange-500 focus:ring-brand-primary/20"
        />

        <span className="text-xs text-brand-gray">
          Keep me signed in
        </span>
      </label>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />

          <p className="text-xs leading-5 text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-ink text-sm font-bold text-white shadow-lg shadow-brand-ink/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#25201b] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
      >
        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

        <span className="relative">
          {loading ? "Signing in..." : "Continue to workspace"}
        </span>

        {!loading && (
          <ArrowRight className="relative h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        )}
      </button>
    </form>
  );
}