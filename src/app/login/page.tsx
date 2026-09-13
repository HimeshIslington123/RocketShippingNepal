"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
      localStorage.setItem("role", data.role);

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
    <>
      <Navbar />

      <main
        className="
          min-h-[calc(100vh-76px)]
          bg-[#f5f6f8]
          px-6
          pb-16
          pt-24
          sm:px-10
          sm:pb-20
          sm:pt-28
          lg:flex
          lg:items-center
          lg:justify-center
          lg:pt-28
        "
      >
        <div className="w-full max-w-md">

          {/* =========================
              HEADER
          ========================== */}
          <div>
            <p
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.2em]
                text-[#E23C2E]
              "
            >
              Account Login
            </p>

            <h1
              className="
                mt-3
                text-3xl
                font-bold
                tracking-tight
                text-[#0b1729]
                sm:text-4xl
              "
            >
              Welcome back
            </h1>

            <p
              className="
                mt-3
                text-sm
                leading-6
                text-black/50
              "
            >
              Sign in to manage your shipments and access your
              Rocket Shipping account.
            </p>
          </div>

          {/* =========================
              ERROR MESSAGE
          ========================== */}
          {errorMessage && (
            <div
              className="
                mt-6
                rounded-xl
                border
                border-red-200
                bg-red-50
                px-4
                py-3
                text-sm
                leading-6
                text-red-600
              "
            >
              {errorMessage}
            </div>
          )}

          {/* =========================
              LOGIN FORM
          ========================== */}
          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >

            {/* =========================
                EMAIL
            ========================== */}
            <div>
              <label
                htmlFor="email"
                className="
                  mb-2
                  block
                  text-sm
                  font-semibold
                  text-[#0b1729]
                "
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-black/35
                  "
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-black/10
                    bg-white
                    pl-11
                    pr-4
                    text-sm
                    text-[#0b1729]
                    outline-none
                    transition-all
                    placeholder:text-black/30
                    focus:border-[#E23C2E]
                    focus:ring-4
                    focus:ring-[#E23C2E]/10
                  "
                />
              </div>
            </div>

            {/* =========================
                PASSWORD
            ========================== */}
            <div>
              <div
                className="
                  mb-2
                  flex
                  items-center
                  justify-between
                "
              >
                <label
                  htmlFor="password"
                  className="
                    text-sm
                    font-semibold
                    text-[#0b1729]
                  "
                >
                  Password
                </label>

                <Link
                  href="#"
                  className="
                    text-xs
                    font-semibold
                    text-[#E23C2E]
                    transition-colors
                    hover:text-[#CE3122]
                  "
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <Lock
                  className="
                    pointer-events-none
                    absolute
                    left-4
                    top-1/2
                    h-4
                    w-4
                    -translate-y-1/2
                    text-black/35
                  "
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-black/10
                    bg-white
                    pl-11
                    pr-12
                    text-sm
                    text-[#0b1729]
                    outline-none
                    transition-all
                    placeholder:text-black/30
                    focus:border-[#E23C2E]
                    focus:ring-4
                    focus:ring-[#E23C2E]/10
                  "
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
                  className="
                    absolute
                    right-4
                    top-1/2
                    -translate-y-1/2
                    cursor-pointer
                    text-black/35
                    transition-colors
                    hover:text-[#0b1729]
                  "
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* =========================
                REMEMBER ME
            ========================== */}
            <label
              className="
                flex
                cursor-pointer
                items-center
                gap-2.5
                text-sm
                text-black/50
              "
            >
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) =>
                  setRemember(e.target.checked)
                }
                className="
                  h-4
                  w-4
                  cursor-pointer
                  rounded
                  border-black/20
                  accent-[#E23C2E]
                "
              />

              <span>
                Remember this device for 30 days
              </span>
            </label>

            {/* =========================
                LOGIN BUTTON
            ========================== */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="
                flex
                h-12
                w-full
                cursor-pointer
                items-center
                justify-center
                gap-2
                rounded-full
                border
                border-[#E23C2E]
                bg-[#E23C2E]
                px-6
                text-sm
                font-semibold
                text-white
                transition-colors
                duration-200
                hover:border-[#CE3122]
                hover:bg-[#CE3122]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {isSubmitting ? "Signing in..." : "Log in"}

              {!isSubmitting && (
                <ArrowRight className="h-4 w-4" />
              )}
            </button>
          </form>

          {/* =========================
              REGISTER
          ========================== */}
          <p
            className="
              mt-8
              text-center
              text-sm
              text-black/50
            "
          >
            New to Rocket Shipping?{" "}
            <Link
              href="/register"
              className="
                font-semibold
                text-[#E23C2E]
                transition-colors
                hover:text-[#CE3122]
              "
            >
              Create account
            </Link>
          </p>

          {/* =========================
              SECURITY
          ========================== */}
          <div
            className="
              mt-8
              flex
              items-center
              justify-center
              gap-2
              text-[11px]
              text-black/35
            "
          >
            <ShieldCheck className="h-3.5 w-3.5" />

            <span>
              Secure account access
            </span>
          </div>
        </div>
      </main>
      <Footer></Footer>
    </>
  );
}