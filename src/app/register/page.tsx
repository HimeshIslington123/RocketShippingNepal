"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  IdCard,
  MapPin,
  Rocket,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

type FormState = {
  name: string;
  email: string;
  password: string;
  companyName: string;
  contactId: string;
  location: string;
};

const initialForm: FormState = {
  name: "",
  email: "",
  password: "",
  companyName: "",
  contactId: "",
  location: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

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
  `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
        body: JSON.stringify({
          ...form,
          role: "VENDOR",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          data.message || "Registration failed. Please try again.",
        );
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      setForm(initialForm);
    } catch (err) {
      console.log(err);
      setErrorMessage(
        "Something went wrong. Check your connection and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const fields: {
    name: keyof FormState;
    label: string;
    type: string;
    placeholder: string;
    icon: React.ElementType;
  }[] = [
    {
      name: "name",
      label: "Full name",
      type: "text",
      placeholder: "John Doe",
      icon: User,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "john@gmail.com",
      icon: Mail,
    },
  ];

  const vendorFields: {
    name: keyof FormState;
    label: string;
    type: string;
    placeholder: string;
    icon: React.ElementType;
  }[] = [
    {
      name: "companyName",
      label: "Company name",
      type: "text",
      placeholder: "Acme Logistics Ltd.",
      icon: Building2,
    },
    {
      name: "contactId",
      label: "Contact ID",
      type: "text",
      placeholder: "e.g. VEN-2291",
      icon: IdCard,
    },
    {
      name: "location",
      label: "Location",
      type: "text",
      placeholder: "Kathmandu, Nepal",
      icon: MapPin,
    },
  ];

  return (
    <main className="min-h-screen bg-[#0b0e14] px-4 py-8 sm:py-12 lg:flex lg:items-center lg:justify-center">
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-2xl shadow-2xl shadow-black/40 lg:flex lg:min-h-[640px]">
        {/* Left / Brand panel */}
        <div className="relative isolate hidden overflow-hidden bg-[#0f1b33] px-8 py-10 lg:flex lg:w-[45%] lg:flex-col lg:justify-between">
          {/* Route-line signature graphic */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full opacity-40"
            viewBox="0 0 400 640"
            fill="none"
          >
            <path
              d="M -20 520 C 80 460, 120 380, 90 300 C 60 210, 160 200, 210 130 C 250 75, 340 60, 420 20"
              stroke="#F97316"
              strokeOpacity="0.35"
              strokeWidth="2"
              strokeDasharray="6 10"
            />
            <circle cx="90" cy="300" r="3.5" fill="#F97316" fillOpacity="0.8" />
            <circle
              cx="210"
              cy="130"
              r="3.5"
              fill="#F97316"
              fillOpacity="0.8"
            />
            <circle cx="-20" cy="520" r="4.5" fill="#F97316" />
            <circle cx="420" cy="20" r="4.5" fill="#F97316" />
          </svg>

          <div className="relative flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500">
              <Rocket className="h-5 w-5 text-white" strokeWidth={2.25} />
            </div>
            <h2 className="text-xl font-semibold tracking-tight text-white">
              Rocket Shipping
            </h2>
          </div>

          <div className="relative mt-10">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-orange-400">
              Vendor onboarding
            </p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
              Join our logistics network
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Create your vendor account to manage shipments, track deliveries,
              and coordinate with the Rocket Shipping network from anywhere.
            </p>
          </div>

          <div className="relative mt-10 overflow-hidden rounded-xl">
            <Image
              src="/air.png"
              alt="Cargo plane in flight"
              width={500}
              height={280}
              className="h-40 w-full rounded-xl object-cover opacity-90"
            />
          </div>
        </div>

        {/* Right / Form panel */}
        <div className="w-full bg-[#f7f6f3] px-6 py-8 sm:px-10 sm:py-10 lg:w-[55%]">
          {/* Mobile-only compact header */}
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500">
              <Rocket className="h-4 w-4 text-white" strokeWidth={2.25} />
            </div>
            <span className="text-lg font-semibold tracking-tight text-slate-900">
              Rocket Shipping
            </span>
          </div>

          <div className="mx-auto max-w-md">
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle2 className="h-7 w-7 text-green-600" />
                </div>
                <h1 className="mt-5 text-2xl font-bold text-slate-900">
                  Account created
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Your vendor account is ready. You can now sign in and start
                  managing shipments.
                </p>
                <Link
                  href="/login"
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Go to login
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Create your account
                </h1>
                <p className="mt-2 text-sm text-slate-500">
                  Register as a vendor on Rocket Shipping.
                </p>

                {errorMessage && (
                  <div className="mt-6 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                    <p className="text-sm text-red-700">{errorMessage}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-7 space-y-4">
                  {fields.map(
                    ({ name, label, type, placeholder, icon: Icon }) => (
                      <div key={name}>
                        <label
                          htmlFor={name}
                          className="mb-1.5 block text-sm font-medium text-slate-700"
                        >
                          {label}
                        </label>
                        <div className="relative">
                          <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            id={name}
                            type={type}
                            name={name}
                            value={form[name]}
                            onChange={handleChange}
                            required
                            placeholder={placeholder}
                            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                          />
                        </div>
                      </div>
                    ),
                  )}

                  {/* Password */}
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-1.5 block text-sm font-medium text-slate-700"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                        placeholder="At least 8 characters"
                        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
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

                  {/* Vendor fields */}
                  <div className="border-t border-slate-200 pt-4">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Vendor details
                    </p>
                    <div className="space-y-4">
                      {vendorFields.map(
                        ({ name, label, type, placeholder, icon: Icon }) => (
                          <div key={name}>
                            <label
                              htmlFor={name}
                              className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                              {label}
                            </label>
                            <div className="relative">
                              <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                              <input
                                id={name}
                                type={type}
                                name={name}
                                value={form[name]}
                                onChange={handleChange}
                                required
                                placeholder={placeholder}
                                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                              />
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating account…
                      </>
                    ) : (
                      "Create account"
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-sm text-slate-500">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-orange-500 hover:text-orange-600"
                  >
                    Log in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
