"use client";

import { useEffect, useState } from "react";
import {
User,
Mail,
Phone,
MapPin,
Building2,
BadgeCheck,
CalendarDays,
Lock,
X,
Eye,
EyeOff,
ShieldCheck,
CheckCircle2,
AlertCircle,
Camera,
Save,
} from "lucide-react";

interface Vendor {
id: number;
companyName: string;
contactId: string;
location: string;
}

interface Rider {
id: number;
phone: string;
profilePicture?: string | null;
latitude?: number | null;
longitude?: number | null;
isAvailable: boolean;
}

interface Staff {
id: number;
phone: string;
profilePicture?: string | null;
}

interface UserData {
id: number;
name: string;
email: string;
role: "ADMIN" | "STAFF" | "VENDOR" | "RIDER";
isActive: boolean;
vendor?: Vendor | null;
rider?: Rider | null;
staff?: Staff | null;
createdAt: string;
updatedAt: string;
}

interface ApiResponse {
message?: string;
user?: UserData;
errors?: Record<string, string[]>;
}

export default function ProfilePage() {
const [user, setUser] = useState<UserData | null>(null);

const [loading, setLoading] = useState(true);
const [saving, setSaving] = useState(false);
const [changingPassword, setChangingPassword] = useState(false);

const [error, setError] = useState("");
const [success, setSuccess] = useState("");

const [showPasswordModal, setShowPasswordModal] = useState(false);

const [showCurrentPassword, setShowCurrentPassword] =
useState(false);

const [showNewPassword, setShowNewPassword] =
useState(false);

const [showConfirmPassword, setShowConfirmPassword] =
useState(false);

// ==========================================
// PROFILE FORM
// ==========================================

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [phone, setPhone] = useState("");
const [profilePicture, setProfilePicture] = useState("");

const [companyName, setCompanyName] = useState("");
const [contactId, setContactId] = useState("");
const [location, setLocation] = useState("");

// ==========================================
// PASSWORD FORM
// ==========================================

const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

// ==========================================
// TOKEN
// ==========================================

const getToken = () => {
const token = localStorage.getItem("token");


if (!token) {
  throw new Error("You are not logged in");
}

return token;


};

// ==========================================
// LOAD PROFILE
// ==========================================

const getProfile = async () => {
try {
setLoading(true);
setError("");


  const token = getToken();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data: ApiResponse = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to load profile"
    );
  }

  if (!data.user) {
    throw new Error("Profile data not found");
  }

  const profile = data.user;

  setUser(profile);

  setName(profile.name || "");
  setEmail(profile.email || "");

  setPhone("");
  setProfilePicture("");
  setCompanyName("");
  setContactId("");
  setLocation("");

  if (profile.rider) {
    setPhone(profile.rider.phone || "");
    setProfilePicture(
      profile.rider.profilePicture || ""
    );
  }

  if (profile.staff) {
    setPhone(profile.staff.phone || "");
    setProfilePicture(
      profile.staff.profilePicture || ""
    );
  }

  if (profile.vendor) {
    setCompanyName(
      profile.vendor.companyName || ""
    );

    setContactId(
      profile.vendor.contactId || ""
    );

    setLocation(
      profile.vendor.location || ""
    );
  }
} catch (err) {
  console.error("GET PROFILE ERROR:", err);

  setError(
    err instanceof Error
      ? err.message
      : "Failed to load profile"
  );
} finally {
  setLoading(false);
}


};

useEffect(() => {
getProfile();
}, []);

// ==========================================
// UPDATE PROFILE
// ==========================================

const updateProfile = async (
e: React.FormEvent<HTMLFormElement>
) => {
e.preventDefault();


try {
  setSaving(true);
  setError("");
  setSuccess("");

  const token = getToken();

  const body: Record<string, string> = {
    name,
    email,
  };

  if (user?.role === "VENDOR") {
    body.companyName = companyName;
    body.contactId = contactId;
    body.location = location;
  }

  if (
    user?.role === "RIDER" ||
    user?.role === "STAFF"
  ) {
    body.phone = phone;
    body.profilePicture = profilePicture;
  }

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );

  const data: ApiResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update profile"
    );
  }

  if (!data.user) {
    throw new Error(
      "Updated profile was not returned"
    );
  }

  setUser(data.user);

  setName(data.user.name || "");
  setEmail(data.user.email || "");

  if (data.user.rider) {
    setPhone(data.user.rider.phone || "");
    setProfilePicture(
      data.user.rider.profilePicture || ""
    );
  }

  if (data.user.staff) {
    setPhone(data.user.staff.phone || "");
    setProfilePicture(
      data.user.staff.profilePicture || ""
    );
  }

  if (data.user.vendor) {
    setCompanyName(
      data.user.vendor.companyName || ""
    );

    setContactId(
      data.user.vendor.contactId || ""
    );

    setLocation(
      data.user.vendor.location || ""
    );
  }

  setSuccess(
    "Your profile has been updated successfully."
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
} catch (err) {
  console.error(
    "UPDATE PROFILE ERROR:",
    err
  );

  setError(
    err instanceof Error
      ? err.message
      : "Failed to update profile"
  );
} finally {
  setSaving(false);
}


};

// ==========================================
// CHANGE PASSWORD
// ==========================================

const handleChangePassword = async (
e: React.FormEvent<HTMLFormElement>
) => {
e.preventDefault();


setError("");
setSuccess("");

if (!currentPassword) {
  setError("Enter your current password.");
  return;
}

if (!newPassword) {
  setError("Enter a new password.");
  return;
}

if (newPassword !== confirmPassword) {
  setError(
    "New password and confirmation do not match."
  );
  return;
}

if (newPassword.length < 8) {
  setError(
    "Password must be at least 8 characters."
  );
  return;
}

if (!/[A-Z]/.test(newPassword)) {
  setError(
    "Password must contain an uppercase letter."
  );
  return;
}

if (!/[a-z]/.test(newPassword)) {
  setError(
    "Password must contain a lowercase letter."
  );
  return;
}

if (!/[0-9]/.test(newPassword)) {
  setError(
    "Password must contain a number."
  );
  return;
}

if (!/[^A-Za-z0-9]/.test(newPassword)) {
  setError(
    "Password must contain a special character."
  );
  return;
}

try {
  setChangingPassword(true);

  const token = getToken();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/users/profile/password`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    }
  );

  const data: ApiResponse =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ||
        "Failed to change password"
    );
  }

  setCurrentPassword("");
  setNewPassword("");
  setConfirmPassword("");

  setShowPasswordModal(false);

  setSuccess(
    "Your password has been changed successfully."
  );
} catch (err) {
  console.error(
    "CHANGE PASSWORD ERROR:",
    err
  );

  setError(
    err instanceof Error
      ? err.message
      : "Failed to change password"
  );
} finally {
  setChangingPassword(false);
}


};

// ==========================================
// PASSWORD CHECKS
// ==========================================

const passwordChecks = {
length: newPassword.length >= 8,
uppercase: /[A-Z]/.test(newPassword),
lowercase: /[a-z]/.test(newPassword),
number: /[0-9]/.test(newPassword),
special: /[^A-Za-z0-9]/.test(newPassword),
};

// ==========================================
// ROLE LABEL
// ==========================================

const getRoleLabel = (
role: UserData["role"]
) => {
switch (role) {
case "ADMIN":
return "Administrator";


  case "STAFF":
    return "Staff";

  case "VENDOR":
    return "Vendor";

  case "RIDER":
    return "Rider";

  default:
    return role;
}


};

// ==========================================
// PROFILE IMAGE
// ==========================================

const profileImage =
profilePicture ||
user?.rider?.profilePicture ||
user?.staff?.profilePicture ||
"";

// ==========================================
// LOADING
// ==========================================

if (loading) {
return ( <div className="flex min-h-screen items-center justify-center"> <div className="text-center"> <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />


      <p className="mt-4 text-sm font-medium text-slate-500">
        Loading your profile...
      </p>
    </div>
  </div>
);


}

// ==========================================
// ERROR / NO USER
// ==========================================

if (!user) {
return ( <div className="flex min-h-screen items-center justify-center  p-6"> <div className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm"> <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50"> <AlertCircle className="h-7 w-7 text-red-500" /> </div>

```
      <h2 className="mt-5 text-lg font-semibold text-slate-900">
        Unable to load profile
      </h2>

      <p className="mt-2 text-sm text-slate-500">
        {error || "Something went wrong."}
      </p>

      <button
        onClick={getProfile}
        className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Try Again
      </button>
    </div>
  </div>
);


}

// ==========================================
// PAGE
// ==========================================

return ( <div className="min-h-screen  px-4 py-8 text-slate-900 sm:px-6 lg:px-8"> <div className="mx-auto max-w-6xl">

    {/* ================================== */}
    {/* PAGE HEADER */}
    {/* ================================== */}

    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-sm font-semibold text-slate-500">
          ACCOUNT SETTINGS
        </p>

        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          My Profile
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Manage your personal information and account security.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowPasswordModal(true)}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        <Lock className="h-4 w-4" />
        Change Password
      </button>
    </div>

    {/* ================================== */}
    {/* ALERTS */}
    {/* ================================== */}

    {error && (
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

        <div className="flex-1">
          <p className="font-medium">
            Something went wrong
          </p>

          <p className="mt-0.5">
            {error}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setError("")}
          className="rounded-lg p-1 hover:bg-red-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )}

    {success && (
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-sm text-emerald-700">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

        <div className="flex-1">
          <p className="font-medium">
            Success
          </p>

          <p className="mt-0.5">
            {success}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSuccess("")}
          className="rounded-lg p-1 hover:bg-emerald-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    )}

    {/* ================================== */}
    {/* PROFILE HERO */}
    {/* ================================== */}

    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="relative bg-slate-950 px-6 py-8 sm:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.12),transparent_35%)]" />

        <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">

          {/* AVATAR */}

          <div className="relative shrink-0">
            <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white/10 bg-white text-3xl font-bold text-slate-700 shadow-xl">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                user.name
                  .charAt(0)
                  .toUpperCase()
              )}
            </div>

            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full border-4 border-slate-950 bg-emerald-500">
              <CheckCircle2 className="h-4 w-4 text-white" />
            </div>
          </div>

          {/* USER INFO */}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold text-white">
                {user.name}
              </h2>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  user.isActive
                    ? "bg-emerald-400/15 text-emerald-300"
                    : "bg-red-400/15 text-red-300"
                }`}
              >
                {user.isActive
                  ? "Active"
                  : "Frozen"}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-400">
              {user.email}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white">
                <ShieldCheck className="h-3.5 w-3.5" />
                {getRoleLabel(user.role)}
              </span>

              {user.role === "RIDER" &&
                user.rider && (
                  <span className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-300">
                    {user.rider.isAvailable
                      ? "Available for delivery"
                      : "Currently unavailable"}
                  </span>
                )}
            </div>
          </div>
        </div>
      </div>

      {/* ACCOUNT STATS */}

      <div className="grid grid-cols-1 divide-y border-t border-slate-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">

        <div className="flex items-center gap-3 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <User className="h-5 w-5 text-slate-600" />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              User ID
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900">
              #{user.id}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <BadgeCheck className="h-5 w-5 text-slate-600" />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Account Type
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900">
              {getRoleLabel(user.role)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <CalendarDays className="h-5 w-5 text-slate-600" />
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Member Since
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900">
              {new Date(
                user.createdAt
              ).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

      </div>
    </div>

    {/* ================================== */}
    {/* PROFILE FORM */}
    {/* ================================== */}

    <form
      onSubmit={updateProfile}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >

      {/* FORM HEADER */}

      <div className="border-b border-slate-200 px-6 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <User className="h-5 w-5 text-slate-700" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-950">
              Personal Information
            </h2>

            <p className="mt-0.5 text-sm text-slate-500">
              Keep your account information up to date.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 sm:p-8">

        <div className="grid gap-6 md:grid-cols-2">

          {/* NAME */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Full Name
            </label>

            <div className="relative">
              <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
              />
            </div>
          </div>

          {/* EMAIL */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email Address
            </label>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="email"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
              />
            </div>
          </div>

          {/* PHONE */}

          {(user.role === "RIDER" ||
            user.role === "STAFF") && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Phone Number
              </label>

              <div className="relative">
                <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="tel"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                />
              </div>
            </div>
          )}

          {/* PROFILE PICTURE */}

          {(user.role === "RIDER" ||
            user.role === "STAFF") && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Profile Picture URL
              </label>

              <div className="relative">
                <Camera className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="url"
                  value={profilePicture}
                  onChange={(e) =>
                    setProfilePicture(
                      e.target.value
                    )
                  }
                  placeholder="https://example.com/photo.jpg"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                />
              </div>
            </div>
          )}

          {/* VENDOR */}

          {user.role === "VENDOR" && (
            <>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Company Name
                </label>

                <div className="relative">
                  <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) =>
                      setCompanyName(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Contact ID
                </label>

                <div className="relative">
                  <BadgeCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={contactId}
                    onChange={(e) =>
                      setContactId(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Location
                </label>

                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="text"
                    value={location}
                    onChange={(e) =>
                      setLocation(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                  />
                </div>
              </div>
            </>
          )}

        </div>

        {/* RIDER INFO */}

        {user.role === "RIDER" &&
          user.rider && (
            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                  <ShieldCheck className="h-5 w-5 text-slate-700" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Rider Status
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Your availability is managed by the rider delivery system.
                  </p>

                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        user.rider.isAvailable
                          ? "bg-emerald-500"
                          : "bg-slate-400"
                      }`}
                    />

                    {user.rider.isAvailable
                      ? "Available"
                      : "Unavailable"}
                  </div>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* SAVE FOOTER */}

      <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-xs text-slate-400">
          Changes will be saved to your account.
        </p>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>

    {/* ================================== */}
    {/* SECURITY CARD */}
    {/* ================================== */}

    <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
            <Lock className="h-5 w-5 text-slate-700" />
          </div>

          <div>
            <h3 className="font-semibold text-slate-950">
              Account Security
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Update your password regularly to keep your account secure.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowPasswordModal(true)}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Change Password
        </button>
      </div>
    </div>
  </div>

  {/* ========================================== */}
  {/* CHANGE PASSWORD MODAL */}
  {/* ========================================== */}

  {showPasswordModal && (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setShowPasswordModal(false);
        }
      }}
    >
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* MODAL HEADER */}

        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
              <Lock className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                Change Password
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                Update your account password.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setShowPasswordModal(false)
            }
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* MODAL FORM */}

        <form
          onSubmit={handleChangePassword}
          className="p-6"
        >

          {/* CURRENT PASSWORD */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Current Password
            </label>

            <div className="relative">
              <input
                type={
                  showCurrentPassword
                    ? "text"
                    : "password"
                }
                value={currentPassword}
                onChange={(e) =>
                  setCurrentPassword(
                    e.target.value
                  )
                }
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-12 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                placeholder="Enter current password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowCurrentPassword(
                    !showCurrentPassword
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* NEW PASSWORD */}

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              New Password
            </label>

            <div className="relative">
              <input
                type={
                  showNewPassword
                    ? "text"
                    : "password"
                }
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-12 text-sm outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                placeholder="Create a strong password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowNewPassword(
                    !showNewPassword
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {/* PASSWORD CHECKS */}

            <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-3">
              {[
                [
                  passwordChecks.length,
                  "8+ characters",
                ],
                [
                  passwordChecks.uppercase,
                  "Uppercase letter",
                ],
                [
                  passwordChecks.lowercase,
                  "Lowercase letter",
                ],
                [
                  passwordChecks.number,
                  "Number",
                ],
                [
                  passwordChecks.special,
                  "Special character",
                ],
              ].map(([valid, label]) => (
                <div
                  key={String(label)}
                  className="flex items-center gap-2 text-xs"
                >
                  <CheckCircle2
                    className={`h-4 w-4 ${
                      valid
                        ? "text-emerald-500"
                        : "text-slate-300"
                    }`}
                  />

                  <span
                    className={
                      valid
                        ? "text-emerald-700"
                        : "text-slate-500"
                    }
                  >
                    {String(label)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* CONFIRM PASSWORD */}

          <div className="mt-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Confirm New Password
            </label>

            <div className="relative">
              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(
                    e.target.value
                  )
                }
                autoComplete="new-password"
                className={`w-full rounded-xl border bg-slate-50 py-3 pl-4 pr-12 text-sm outline-none transition focus:bg-white focus:ring-4 ${
                  confirmPassword &&
                  confirmPassword !==
                    newPassword
                    ? "border-red-300 focus:border-red-400 focus:ring-red-50"
                    : "border-slate-200 focus:border-slate-400 focus:ring-slate-100"
                }`}
                placeholder="Repeat your new password"
              />

              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {confirmPassword &&
              confirmPassword !==
                newPassword && (
                <p className="mt-2 text-xs font-medium text-red-600">
                  Passwords do not match.
                </p>
              )}
          </div>

          {/* MODAL ERROR */}

          {error && (
            <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>{error}</span>
            </div>
          )}

          {/* MODAL FOOTER */}

          <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                setShowPasswordModal(false);
                setError("");
              }}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={changingPassword}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {changingPassword ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Updating...
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Update Password
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )}
</div>


);
}
