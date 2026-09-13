"use client";

import { useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  IdCard,
  MapPin,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

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
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage(null);
    }
  }

  function validatePassword(password: string) {
    if (password.length < 8) {
      return "Password must be at least 8 characters";
    }

    if (!/[A-Z]/.test(password)) {
      return "Password must contain an uppercase letter";
    }

    if (!/[a-z]/.test(password)) {
      return "Password must contain a lowercase letter";
    }

    if (!/[0-9]/.test(password)) {
      return "Password must contain a number";
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return "Password must contain a special character";
    }

    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErrorMessage(null);

    const passwordError = validatePassword(form.password);

    if (passwordError) {
      setErrorMessage(passwordError);
      return;
    }

    if (!form.name.trim()) {
      setErrorMessage("Full name is required");
      return;
    }

    if (!form.email.trim()) {
      setErrorMessage("Email is required");
      return;
    }

    if (!form.companyName.trim()) {
      setErrorMessage("Company name is required");
      return;
    }

    if (!form.contactId.trim()) {
      setErrorMessage("Contact ID is required");
      return;
    }

    if (!form.location.trim()) {
      setErrorMessage("Location is required");
      return;
    }

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
        }
      );

      let data;

      try {
        data = await res.json();
      } catch {
        data = {
          message: "Invalid response from server",
        };
      }

      if (!res.ok) {
        setErrorMessage(
          data?.message ||
            "Registration failed. Please try again."
        );

        return;
      }

      setIsSuccess(true);
      setForm(initialForm);
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "Unable to connect to the server. Please check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const fields = [
    {
      name: "name" as keyof FormState,
      label: "Full name",
      type: "text",
      placeholder: "John Doe",
      icon: User,
    },
    {
      name: "email" as keyof FormState,
      label: "Email address",
      type: "email",
      placeholder: "you@example.com",
      icon: Mail,
    },
  ];

  const vendorFields = [
    {
      name: "companyName" as keyof FormState,
      label: "Company name",
      type: "text",
      placeholder: "Acme Logistics Ltd.",
      icon: Building2,
    },
    {
      name: "contactId" as keyof FormState,
      label: "Contact ID",
      type: "text",
      placeholder: "e.g. VEN-2291",
      icon: IdCard,
    },
    {
      name: "location" as keyof FormState,
      label: "Location",
      type: "text",
      placeholder: "Kathmandu, Nepal",
      icon: MapPin,
    },
  ];

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
          lg:pt-28
        "
      >
        <div className="mx-auto w-full max-w-md">

          {/* =========================
              SUCCESS STATE
          ========================== */}
          {isSuccess ? (
            <div className="flex flex-col items-center pt-8 text-center">

              <div
                className="
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  bg-green-50
                "
              >
                <CheckCircle2
                  className="h-8 w-8 text-[#1E8449]"
                />
              </div>

              <h1
                className="
                  mt-6
                  text-3xl
                  font-bold
                  tracking-tight
                  text-[#0b1729]
                "
              >
                Account created
              </h1>

              <p
                className="
                  mt-3
                  max-w-sm
                  text-sm
                  leading-6
                  text-black/50
                "
              >
                Your vendor account has been created
                successfully. You can now sign in and start
                managing your shipments.
              </p>

              <Link
                href="/login"
                className="
                  mt-7
                  inline-flex
                  h-12
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
                "
              >
                Go to login
                <ArrowRight className="h-4 w-4" />
              </Link>

              <div
                className="
                  mt-8
                  flex
                  items-center
                  gap-2
                  text-[11px]
                  text-black/35
                "
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Secure account access</span>
              </div>
            </div>
          ) : (
            <>
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
                  Create Account
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
                  Create your account
                </h1>

                <p
                  className="
                    mt-3
                    text-sm
                    leading-6
                    text-black/50
                  "
                >
                  Register as a vendor and start managing your
                  shipments with Rocket Shipping.
                </p>
              </div>

              {/* =========================
                  ERROR
              ========================== */}
              {errorMessage && (
                <div
                  className="
                    mt-6
                    flex
                    items-start
                    gap-2.5
                    rounded-xl
                    border
                    border-red-200
                    bg-red-50
                    px-4
                    py-3
                  "
                >
                  <AlertCircle
                    className="
                      mt-0.5
                      h-4
                      w-4
                      shrink-0
                      text-red-500
                    "
                  />

                  <p
                    className="
                      text-sm
                      leading-5
                      text-red-700
                    "
                  >
                    {errorMessage}
                  </p>
                </div>
              )}

              {/* =========================
                  FORM
              ========================== */}
              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >
                {/* BASIC INFORMATION */}
                <div className="space-y-5">
                  {fields.map(
                    ({
                      name,
                      label,
                      type,
                      placeholder,
                      icon: Icon,
                    }) => (
                      <div key={name}>
                        <label
                          htmlFor={name}
                          className="
                            mb-2
                            block
                            text-sm
                            font-semibold
                            text-[#0b1729]
                          "
                        >
                          {label}
                        </label>

                        <div className="relative">
                          <Icon
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
                            id={name}
                            type={type}
                            name={name}
                            value={form[name]}
                            onChange={handleChange}
                            required
                            placeholder={placeholder}
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
                    )
                  )}
                </div>

                {/* PASSWORD */}
                <div>
                  <label
                    htmlFor="password"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-[#0b1729]
                    "
                  >
                    Password
                  </label>

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
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={8}
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
                        setShowPassword((v) => !v)
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

                  {/* Password requirements */}
                  <div
                    className="
                      mt-2
                      grid
                      grid-cols-2
                      gap-x-4
                      gap-y-1
                      text-[11px]
                      text-black/40
                    "
                  >
                    <span>• 8+ characters</span>
                    <span>• Uppercase letter</span>
                    <span>• Lowercase letter</span>
                    <span>• One number</span>
                    <span>• Special character</span>
                  </div>
                </div>

                {/* VENDOR DETAILS */}
                <div
                  className="
                    border-t
                    border-black/10
                    pt-6
                  "
                >
                  <p
                    className="
                      mb-5
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-[0.18em]
                      text-black/40
                    "
                  >
                    Vendor details
                  </p>

                  <div className="space-y-5">
                    {vendorFields.map(
                      ({
                        name,
                        label,
                        type,
                        placeholder,
                        icon: Icon,
                      }) => (
                        <div key={name}>
                          <label
                            htmlFor={name}
                            className="
                              mb-2
                              block
                              text-sm
                              font-semibold
                              text-[#0b1729]
                            "
                          >
                            {label}
                          </label>

                          <div className="relative">
                            <Icon
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
                              id={name}
                              type={type}
                              name={name}
                              value={form[name]}
                              onChange={handleChange}
                              required
                              placeholder={placeholder}
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
                      )
                    )}
                  </div>
                </div>

                {/* SUBMIT */}
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
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>

              {/* =========================
                  LOGIN LINK
              ========================== */}
              <p
                className="
                  mt-8
                  text-center
                  text-sm
                  text-black/50
                "
              >
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="
                    font-semibold
                    text-[#E23C2E]
                    transition-colors
                    hover:text-[#CE3122]
                  "
                >
                  Log in
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
            </>
          )}
        </div>
      </main>
      <Footer></Footer>
    </>
  );
}