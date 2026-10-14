
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

      setError(e?.data?.message || "Invalid email or password");
    }
  };

  return (
    <main className="min-h-screen min-h-dvh w-full overflow-x-clip bg-brand-white">
      <div className="grid min-h-screen min-h-dvh w-full grid-cols-1 lg:grid-cols-[55fr_45fr]">
        {/* LEFT: BRAND PANEL */}

        <section className="relative hidden min-w-0 overflow-hidden bg-brand-primary text-white lg:flex lg:min-h-screen lg:flex-col lg:justify-between">
          {/* Background decorations */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-brand-primary-light/35 sm:h-96 sm:w-96" />

            <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-brand-primary-dark/35 sm:h-[36rem] sm:w-[36rem]" />

            <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl sm:h-80 sm:w-80" />

            <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:48px_48px]" />
          </div>

          {/* Brand header */}

          <div className="relative z-10 px-6 pt-8 sm:px-10 sm:pt-10 xl:px-14">
            <div className="inline-flex max-w-full items-center rounded-2xl bg-white px-3 py-2 shadow-lg sm:px-4 sm:py-3">
              <img
                src="/logo.svg"
                alt="Campaign Hub"
                className="h-auto max-h-12 w-36 max-w-full object-contain sm:w-[180px]"
              />
            </div>
          </div>

          {/* Main brand content */}

          <div className="relative z-10 px-6 py-10 sm:px-10 xl:px-14 xl:py-12">
            <div className="w-full max-w-xl">
              <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] sm:mb-6 sm:tracking-[0.15em]">
                <Sparkles
                  className="h-3 w-3 shrink-0"
                  aria-hidden="true"
                />
                <span>Built for better decisions</span>
              </div>

              <h1 className="text-4xl font-bold leading-[1.08] tracking-[-0.045em] xl:text-6xl">
                Turn campaign
                <span className="block text-white/80">
                  data into clarity.
                </span>
              </h1>

              <p className="mt-5 max-w-lg text-sm leading-7 text-white/75 xl:mt-6 xl:text-base">
                One workspace for campaign imports, performance analysis,
                platform visibility, and the insights your team needs to move
                faster.
              </p>

              {/* Benefits */}

              <div className="mt-7 space-y-3 sm:mt-9 sm:space-y-3.5">
                {benefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="flex min-w-0 items-center gap-3 text-sm font-medium text-white/90"
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                      <CheckCircle2
                        className="h-4 w-4"
                        aria-hidden="true"
                      />
                    </span>

                    <span className="min-w-0 break-words">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Stats */}

              <div className="mt-9 grid w-full max-w-md grid-cols-2 gap-3 sm:mt-12">
                <div className="min-w-0 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm sm:p-4">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 sm:mb-5">
                    <BarChart3
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>

                  <p className="text-2xl font-bold tracking-tight">360°</p>

                  <p className="mt-1 break-words text-[11px] font-medium text-white/60">
                    Campaign visibility
                  </p>
                </div>

                <div className="min-w-0 rounded-2xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm sm:p-4">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 sm:mb-5">
                    <ArrowUpRight
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>

                  <p className="text-2xl font-bold tracking-tight">One</p>

                  <p className="mt-1 break-words text-[11px] font-medium text-white/60">
                    Unified workspace
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop copyright */}

          <div className="relative z-10 px-6 pb-6 sm:px-10 sm:pb-8 xl:px-14">
            <p className="text-[11px] font-medium text-white/50">
              © {new Date().getFullYear()} Campaign Hub
            </p>
          </div>
        </section>

        {/* RIGHT: LOGIN PANEL */}

        <section className="relative flex min-h-screen min-h-dvh min-w-0 items-center justify-center overflow-hidden bg-brand-white px-4 py-8 sm:px-8 sm:py-10 md:px-12 lg:px-8 lg:py-12 xl:px-14 2xl:px-20">
          {/* Background decorations */}

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-brand-primary-soft blur-3xl sm:h-72 sm:w-72" />

            <div className="absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-brand-primary-muted/40 blur-3xl sm:h-72 sm:w-72" />

            <div className="absolute inset-0 opacity-[0.018] [background-image:linear-gradient(#171411_1px,transparent_1px),linear-gradient(90deg,#171411_1px,transparent_1px)] [background-size:48px_48px]" />
          </div>

          {/* Login content */}

          <div className="relative z-10 my-auto w-full min-w-0 max-w-[440px]">
            {/* Mobile branding */}

            <div className="mb-8 sm:mb-10 lg:hidden">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary text-white shadow-brand-sm sm:h-11 sm:w-11 sm:rounded-2xl">
                  <Zap
                    className="h-5 w-5 fill-current"
                    aria-hidden="true"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-sm font-bold text-brand-ink sm:text-base">
                    Campaign Hub
                  </p>

                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-brand-gray-light sm:tracking-[0.18em]">
                    Intelligence platform
                  </p>
                </div>
              </div>
            </div>

            {/* Login heading */}

            <div className="mb-6 sm:mb-8">
              <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-brand-primary-muted bg-brand-primary-soft px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-brand-primary-dark sm:tracking-[0.15em]">
                <Sparkles
                  className="h-3 w-3 shrink-0"
                  aria-hidden="true"
                />

                <span>Welcome back</span>
              </div>

              <h2 className="text-3xl font-bold leading-tight tracking-[-0.035em] text-brand-ink sm:text-4xl">
                Sign in to your
                <span className="block text-brand-primary">
                  workspace.
                </span>
              </h2>

              <p className="mt-3 max-w-md text-sm leading-6 text-brand-gray sm:mt-4">
                Access your campaign data, reports, and performance insights
                from one place.
              </p>
            </div>

            {/* Login form */}

            <div className="w-full min-w-0 rounded-2xl border border-brand-border bg-brand-white p-4 shadow-brand-md sm:rounded-3xl sm:p-6 md:p-8">
              <LoginForm
                onSubmit={handleLogin}
                loading={isLoading}
                error={error}
              />
            </div>

            {/* Support */}

            <p className="mt-6 px-1 text-center text-xs leading-5 text-brand-gray-light sm:mt-7">
              Having trouble signing in?{" "}
              <a
                href="mailto:support@yourdomain.com"
                className="font-semibold text-brand-primary transition-colors hover:text-brand-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
              >
                Contact support
              </a>
            </p>

            {/* Mobile copyright */}

            <p className="mt-7 pb-1 text-center text-[11px] text-brand-gray-light sm:mt-8 lg:hidden">
              © {new Date().getFullYear()} Campaign Hub
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
