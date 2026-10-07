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
import { useState } from "react";

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
    <div className="relative min-h-screen overflow-hidden bg-[#faf9f7]">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-orb absolute -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-orange-300/10 blur-3xl" />

        <div
          className="animate-orb absolute -bottom-40 -right-40 h-[36rem] w-[36rem] rounded-full bg-orange-400/10 blur-3xl"
          style={{ animationDelay: "-3s" }}
        />

        <div className="absolute inset-0 opacity-[0.025] [background-image:linear-gradient(#171411_1px,transparent_1px),linear-gradient(90deg,#171411_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <div className="relative grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* Brand panel */}
        <section className="relative hidden overflow-hidden bg-[#171411] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
          <div className="absolute inset-0">
            <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-orange-500/15 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-[30rem] w-[30rem] rounded-full bg-orange-600/10 blur-3xl" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 shadow-xl shadow-orange-950/30">
                <Zap className="h-5 w-5 fill-white" />
              </div>

              <div>
                <p className="text-sm font-bold">
                  Campaign Hub
                </p>

                <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">
                  Intelligence platform
                </p>
              </div>
            </div>
          </div>

          <div className="relative max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-orange-300">
              <Sparkles className="h-3 w-3" />
              Built for better decisions
            </div>

            <h1 className="text-5xl font-bold leading-[1.05] tracking-[-0.04em] xl:text-6xl">
              Turn campaign
              <span className="block text-orange-400">
                data into clarity.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-sm leading-7 text-white/45 xl:text-base">
              One workspace for campaign imports,
              performance analysis, platform visibility,
              and the insights your team needs to move
              faster.
            </p>

            <div className="mt-9 space-y-3">
              {benefits.map((benefit) => (
                <div
                  key={benefit}
                  className="flex items-center gap-3 text-sm text-white/70"
                >
                  <CheckCircle2 className="h-4 w-4 text-orange-400" />
                  {benefit}
                </div>
              ))}
            </div>

            <div className="mt-12 grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur">
                <BarChart3 className="mb-5 h-5 w-5 text-orange-400" />
                <p className="text-2xl font-bold">
                  360°
                </p>
                <p className="mt-1 text-[11px] text-white/35">
                  Campaign visibility
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur">
                <ArrowUpRight className="mb-5 h-5 w-5 text-orange-400" />
                <p className="text-2xl font-bold">
                  One
                </p>
                <p className="mt-1 text-[11px] text-white/35">
                  Unified workspace
                </p>
              </div>
            </div>
          </div>

          <p className="relative text-[11px] text-white/20">
            © {new Date().getFullYear()} Campaign Hub
          </p>
        </section>

        {/* Login */}
        <section className="relative flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-[420px]">
            <div className="mb-8 lg:hidden">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-lg">
                <Zap className="h-5 w-5 fill-white" />
              </div>

              <p className="text-sm font-bold text-brand-ink">
                Campaign Hub
              </p>
            </div>

            <div className="mb-9">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand-primary">
                Welcome back
              </p>

              <h2 className="text-3xl font-bold tracking-[-0.03em] text-brand-ink sm:text-4xl">
                Sign in to your
                <span className="block">
                  workspace.
                </span>
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-brand-gray">
                Access your campaign data, reports, and
                performance insights from one place.
              </p>
            </div>

            <div className="rounded-3xl border border-brand-border bg-white p-6 shadow-brand-md sm:p-8">
              <LoginForm
                onSubmit={handleLogin}
                loading={isLoading}
                error={error}
              />
            </div>

            <p className="mt-7 text-center text-xs text-brand-gray-light">
              Having trouble signing in?{" "}
              <a
                href="#"
                className="font-semibold text-brand-primary transition hover:text-brand-primary-dark"
              >
                Contact support
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}