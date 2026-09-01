"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Rocket,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const initialForm = {
    email: "",
    password: "",
  };

  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        }
      );

      const data = await res.json();

      // Login failed
      if (!res.ok) {
        setErrorMessage(
          data.message || "Invalid email or password."
        );
        return;
      }



      // Save JWT token
      localStorage.setItem("token", data.token);

      // Get role from backend response
      const role = data.role;

   

      // Redirect based on role
      if (role === "VENDOR") {
        router.replace("/vendor");
      } else if (role === "STAFF") {
        router.replace("/staff");
      } else if (role === "RIDER") {
        router.replace("/rider");
      } else if (role === "ADMIN") {
        router.replace("/admin");
      } else {
        setErrorMessage("Unknown user role.");
      }

      setForm(initialForm);
    } catch (err) {
      console.error(err);
      setErrorMessage(
        "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0e14] text-black px-4 py-8 sm:py-12 lg:flex lg:items-center lg:justify-center">
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl shadow-black/40 lg:flex lg:min-h-[640px]">

        {/* Left / Brand panel */}
        <div className="relative isolate hidden overflow-hidden bg-[#0f1b33] px-8 py-10 lg:flex lg:w-[45%] lg:flex-col lg:justify-between">

          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 15%, rgba(249,115,22,0.18), transparent 45%), radial-gradient(circle at 80% 85%, rgba(255,255,255,0.08), transparent 40%)",
            }}
          />

          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500">
              <Rocket
                className="h-5 w-5 text-white"
                strokeWidth={2.25}
              />
            </div>

            <span className="text-xl font-semibold tracking-tight text-white">
              Rocket Shipping
            </span>
          </div>

          <div className="relative mt-10">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-orange-400">
              Vendor control center
            </p>

            <h2 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
              Precision logistics for the global frontier.
            </h2>

            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-semibold tracking-wide text-slate-400">
              {["Fast", "Reliable", "Global"].map((f) => (
                <li
                  key={f}
                  className="flex items-center gap-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                  {f.toUpperCase()}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-8 overflow-hidden rounded-xl ring-1 ring-white/10">
            <Image
              src="/air.png"
              alt="Cargo plane in flight"
              width={640}
              height={340}
              className="h-44 w-full object-cover lg:h-52"
            />

            <div className="flex items-center gap-2 bg-[#0f1b33]/95 px-3.5 py-2.5 text-[12px] text-slate-300 backdrop-blur">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-orange-400" />
              Real-time trans-pacific tracking active — 99.6% on-time
            </div>
          </div>

          <p className="relative mt-8 text-[11px] text-white/35">
            © 2024 Rocket Shipping Nepal. All rights reserved.
          </p>
        </div>

        {/* Right / Form panel */}
        <div className="flex w-full flex-col justify-center bg-[#f7f6f3] px-6 py-10 sm:px-10 lg:w-[55%] lg:px-12">

          <div className="mx-auto w-full max-w-sm">

            {/* Mobile header */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500">
                <Rocket
                  className="h-4 w-4 text-white"
                  strokeWidth={2.25}
                />
              </div>

              <span className="text-lg font-semibold tracking-tight text-slate-900">
                Rocket Shipping
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Access your logistics control center to manage
              shipments and fleets.
            </p>

            {/* Error message */}
            {errorMessage && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {errorMessage}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-8 space-y-5"
            >

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Corporate email address
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@rocketshipping.com"
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <Link
                    href="#"
                    className="text-xs font-semibold text-orange-500 hover:text-orange-600"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword ? "text" : "password"
                    }
                    required
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-11 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((s) => !s)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember */}
              <label className="flex items-center gap-2 text-sm text-slate-500">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) =>
                    setRemember(e.target.checked)
                  }
                  className="h-4 w-4 rounded border-slate-300 text-orange-500 focus:ring-orange-400"
                />

                Remember this device for 30 days
              </label>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting
                  ? "Signing in…"
                  : "Log in to dashboard"}

                {!isSubmitting && (
                  <ArrowRight className="h-4 w-4" />
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              New to Rocket Shipping?{" "}
              <Link
                href="/register"
                className="font-semibold text-orange-500 hover:text-orange-600"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}