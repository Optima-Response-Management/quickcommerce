import { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import LoginForm from "../components/LoginForm";
import { mockLogin } from "../mockAuth";
import { setCredentials } from "../authSlice";
import type { LoginFormValues } from "../authSchema";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (values: LoginFormValues) => {
    setError("");
    setLoading(true); 
    try {
      const result = await mockLogin(values);
dispatch(setCredentials({ user: result.user, token: result.token }));
navigate("/dashboard");
    } catch { 
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-black relative overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #FF6B00 0%, transparent 40%), radial-gradient(circle at 80% 80%, #FF6B00 0%, transparent 40%)",
          }}
        />
        <div className="relative">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-brand-primary">
            <span className="text-brand-black font-bold text-lg">C</span>
          </div>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Campaign insights,
            <br />
            all in one place.
          </h2>
          <p className="text-gray-400 text-base max-w-md">
            Upload, track, and analyze campaign performance across every
            advertising platform from a single dashboard.
          </p>
        </div>

        <p className="relative text-sm text-gray-500">
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center bg-brand-offwhite px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-xl bg-brand-black mb-8">
            <span className="text-brand-primary font-bold text-lg">C</span>
          </div>

          <h1 className="text-3xl font-bold text-brand-black mb-2">
            Welcome back
          </h1>
          <p className="text-sm text-brand-gray mb-8">
            Sign in to your campaign dashboard
          </p>

          <LoginForm onSubmit={handleLogin} loading={loading} error={error} />

          <p className="text-center text-sm text-brand-gray mt-8">
            Having trouble signing in?{" "}
            <a href="#" className="text-brand-primary font-medium hover:underline">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}