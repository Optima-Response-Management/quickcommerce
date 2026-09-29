import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { loginSchema, type LoginFormValues } from "../authSchema";

interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void;
  loading?: boolean;
  error?: string;
}

export default function LoginForm({ onSubmit, loading, error }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-brand-black mb-1.5">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            id="email"
            type="email"
            {...register("email")}
            className={`w-full rounded-lg border bg-white pl-11 pr-4 py-3 text-sm
                       placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-brand-primary/40
                       transition-all
                       ${errors.email ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-brand-primary"}`}
            placeholder="you@company.com"
          />
        </div>
        {errors.email && (
          <p className="text-xs text-red-600 mt-1.5">{errors.email.message}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-brand-black">
            Password
          </label>
          <a href="#" className="text-xs text-brand-primary font-medium hover:underline">
            Forgot password?
          </a>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            {...register("password")}
            className={`w-full rounded-lg border bg-white pl-11 pr-11 py-3 text-sm
                       placeholder:text-gray-400
                       focus:outline-none focus:ring-2 focus:ring-brand-primary/40
                       transition-all
                       ${errors.password ? "border-red-400 focus:border-red-400" : "border-gray-300 focus:border-brand-primary"}`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-black transition-colors"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-600 mt-1.5">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center">
        <input
          id="remember"
          type="checkbox"
          className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary/40"
        />
        <label htmlFor="remember" className="ml-2 text-sm text-brand-gray">
          Remember me
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-primary hover:bg-brand-primary-dark active:scale-[0.98]
                   text-white font-semibold text-sm py-3 rounded-lg
                   shadow-sm shadow-orange-500/20
                   transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}