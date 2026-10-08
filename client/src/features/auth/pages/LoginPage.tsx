import { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";

import LoginForm from "../components/LoginForm";
import { useLoginMutation } from "../authApi";
import { setCredentials } from "../authSlice";
import type { LoginFormValues } from "../authSchema";

const benefits = [
  "Unified campaign visibility",
  "Cross-platform performance tracking",
  "Fast data imports and reporting",
];

export default function LoginPage() {
  const [error, setError] = useState("");

  const [login, { isLoading }] = useLoginMutation();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (values: LoginFormValues) => {
    setError("");

    try {
      const result = await login(values).unwrap();

      dispatch(
        setCredentials({
          user: result.user,
        }),
      );

      navigate("/dashboard");
    } catch (err) {
      const e = err as {
        data?: {
          message?: string;
        };
      };

      setError(
        e?.data?.message ||
          "Invalid email or password",
      );
    }
  };

  return (
    <main className="min-h-screen bg-brand-white">
      <div className="grid min-h-screen lg:grid-cols-[55%_45%]">
        {/* ================================================================== */}
        {/* LEFT - BRAND PANEL                                                 */}
        {/* ================================================================== */}

        <section className="relative hidden min-h-screen overflow-hidden bg-brand-primary text-white lg:flex lg:flex-col lg:justify-between">
          {/* Background decoration */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            {/* Top right glow */}

            <div className="absolute -right-32 -top-32 h-[32rem] w-[32rem] rounded-full bg-brand-primary-light/35" />

            {/* Bottom left glow */}

            <div className="absolute -bottom-40 -left-40 h-[36rem] w-[36rem] rounded-full bg-brand-primary-dark/35" />

            {/* Center glow */}

            <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />

            {/* Grid */}

            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:48px_48px]" />
          </div>

          {/* Brand header */}

          <div className="relative z-10 p-10 xl:p-14">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-brand-primary shadow-lg">
                <Zap
                  className="h-5 w-5 fill-current"
                  aria-hidden="true"
                />
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  Campaign Hub
                </p>

                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/60">
                  Intelligence platform
                </p>
              </div>
            </div>
          </div>

          {/* Main brand content */}

          <div className="relative z-10 px-10 pb-10 xl:px-14 xl:pb-14">
            <div className="max-w-xl">
              {/* Badge */}

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-white">
                <Sparkles
                  className="h-3 w-3"
                  aria-hidden="true"
                />

                Built for better decisions
              </div>

              {/* Heading */}

              <h1 className="text-5xl font-bold leading-[1.04] tracking-[-0.045em] xl:text-6xl">
                Turn campaign
                <span className="block text-white/80">
                  data into clarity.
                </span>
              </h1>

              {/* Description */}

              <p className="mt-6 max-w-lg text-sm leading-7 text-white/75 xl:text-base">
                One workspace for campaign imports,
                performance analysis, platform visibility,
                and the insights your team needs to move
                faster.
              </p>

              {/* Benefits */}

              <div className="mt-9 space-y-3.5">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex items-center gap-3 text-sm font-medium text-white/90"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <CheckCircle2
                        className="h-4 w-4 text-white"
                        aria-hidden="true"
                      />
                    </span>

                    <span>{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}

              <div className="mt-12 grid max-w-md grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                    <BarChart3
                      className="h-5 w-5 text-white"
                      aria-hidden="true"
                    />
                  </div>

                  <p className="text-2xl font-bold tracking-tight">
                    360°
                  </p>

                  <p className="mt-1 text-[11px] font-medium text-white/60">
                    Campaign visibility
                  </p>
                </div>

                <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
                  <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                    <ArrowUpRight
                      className="h-5 w-5 text-white"
                      aria-hidden="true"
                    />
                  </div>

                  <p className="text-2xl font-bold tracking-tight">
                    One
                  </p>

                  <p className="mt-1 text-[11px] font-medium text-white/60">
                    Unified workspace
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}

          <div className="relative z-10 px-10 pb-8 xl:px-14">
            <p className="text-[11px] font-medium text-white/50">
              © {new Date().getFullYear()} Campaign Hub
            </p>
          </div>
        </section>

        {/* ================================================================== */}
        {/* RIGHT - LOGIN PANEL                                                */}
        {/* ================================================================== */}

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-brand-white px-6 py-12 sm:px-10 lg:px-14 xl:px-20">
          {/* Background decoration */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -right-32 -top-32 h-72 w-72 rounded-full bg-brand-primary-soft blur-3xl" />

            <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-brand-primary-muted/40 blur-3xl" />

            <div className="absolute inset-0 opacity-[0.018] [background-image:linear-gradient(#171411_1px,transparent_1px),linear-gradient(90deg,#171411_1px,transparent_1px)] [background-size:48px_48px]" />
          </div>

          <div className="relative z-10 w-full max-w-[440px]">
            {/* Mobile branding */}

            <div className="mb-10 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-brand-sm">
                  <Zap
                    className="h-5 w-5 fill-current"
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <p className="text-sm font-bold text-brand-ink">
                    Campaign Hub
                  </p>

                  <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-brand-gray-light">
                    Intelligence platform
                  </p>
                </div>
              </div>
            </div>

            {/* Heading */}

            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-primary-muted bg-brand-primary-soft px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-primary-dark">
                <Sparkles
                  className="h-3 w-3"
                  aria-hidden="true"
                />

                Welcome back
              </div>

              <h2 className="text-3xl font-bold leading-tight tracking-[-0.035em] text-brand-ink sm:text-4xl">
                Sign in to your
                <span className="block text-brand-primary">
                  workspace.
                </span>
              </h2>

              <p className="mt-4 max-w-md text-sm leading-6 text-brand-gray">
                Access your campaign data, reports, and
                performance insights from one place.
              </p>
            </div>

            {/* Login form */}

            <div className="rounded-3xl border border-brand-border bg-brand-white p-6 shadow-brand-md sm:p-8">
              <LoginForm
                onSubmit={handleLogin}
                loading={isLoading}
                error={error}
              />
            </div>

            {/* Support */}

            <p className="mt-7 text-center text-xs text-brand-gray-light">
              Having trouble signing in?{" "}
              <a
                href="#"
                className="font-semibold text-brand-primary transition-colors hover:text-brand-primary-dark"
              >
                Contact support
              </a>
            </p>

            {/* Mobile copyright */}

            <p className="mt-8 text-center text-[11px] text-brand-gray-light lg:hidden">
              © {new Date().getFullYear()} Campaign Hub
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}