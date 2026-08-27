import {
  Package,
  CheckCircle2,
  Truck,
  AlertTriangle,
  MapPin,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

type Tone = "blue" | "emerald" | "amber" | "rose";

const TONE_STYLES: Record<
  Tone,
  { chip: string; tag: string; dot: string }
> = {
  blue: {
    chip: "bg-blue-50 text-blue-600",
    tag: "bg-blue-50 text-blue-600",
    dot: "bg-blue-500",
  },
  emerald: {
    chip: "bg-emerald-50 text-emerald-600",
    tag: "bg-emerald-50 text-emerald-600",
    dot: "bg-emerald-500",
  },
  amber: {
    chip: "bg-amber-50 text-amber-600",
    tag: "bg-amber-50 text-amber-600",
    dot: "bg-amber-500",
  },
  rose: {
    chip: "bg-rose-50 text-rose-600",
    tag: "bg-rose-50 text-rose-600",
    dot: "bg-rose-500",
  },
};

const STATS: {
  label: string;
  value: string;
  tag: string;
  tone: Tone;
  icon: LucideIcon;
}[] = [
  {
    label: "Assigned Today",
    value: "18",
    tag: "Pickups",
    tone: "blue",
    icon: Package,
  },
  {
    label: "Completed",
    value: "12",
    tag: "On track",
    tone: "emerald",
    icon: CheckCircle2,
  },
  {
    label: "In Progress",
    value: "4",
    tag: "Active",
    tone: "amber",
    icon: Truck,
  },
  {
    label: "Issues Flagged",
    value: "2",
    tag: "Needs attention",
    tone: "rose",
    icon: AlertTriangle,
  },
];

const ASSIGNED_SHIPMENTS = [
  {
    id: "RT-98240-KTM",
    destination: "Kathmandu, NP",
    status: "In Transit",
    time: "10:30 AM",
    tone: "blue" as Tone,
  },
  {
    id: "RT-77312-PKR",
    destination: "Pokhara, NP",
    status: "Delivered",
    time: "9:15 AM",
    tone: "emerald" as Tone,
  },
  {
    id: "RT-11204-BTR",
    destination: "Biratnagar, NP",
    status: "Pending",
    time: "1:00 PM",
    tone: "amber" as Tone,
  },
];

export default function StaffOverviewPage() {
  return (
    <div className="mx-auto max-w-6xl text-black">
      <div>
        <h1 className="font-display text-xl font-extrabold text-ink sm:text-2xl">
          Today's Route
        </h1>

        <p className="mt-1 text-sm text-ink/50">
          Your assigned pickups and deliveries for today.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => {
          const tone = TONE_STYLES[stat.tone];
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone.chip}`}
                >
                  <Icon className="h-5 w-5" />
                </span>

                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${tone.tag}`}
                >
                  {stat.tag}
                </span>
              </div>

              <p className="mt-4 text-sm text-ink/50">{stat.label}</p>

              <p className="font-display mt-1 text-3xl font-extrabold text-ink">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Shipments */}
      <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 md:p-6">
        <h2 className="font-display text-lg font-bold text-ink">
          Assigned Shipments
        </h2>

        {/* MOBILE CARDS */}
        <div className="mt-5 space-y-4 md:hidden">
          {ASSIGNED_SHIPMENTS.map((s) => {
            const tone = TONE_STYLES[s.tone];

            return (
              <div
                key={s.id}
                className="rounded-xl border border-black/5 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-semibold break-all">{s.id}</h3>

                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${tone.tag}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${tone.dot}`}
                    />
                    {s.status}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-sm text-ink/60">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0" />
                    <span>{s.destination}</span>
                  </div>

                  <p>
                    <span className="font-medium text-ink">Time:</span>{" "}
                    {s.time}
                  </p>
                </div>

                <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-2.5 font-semibold text-white transition hover:bg-accent-dark">
                  Update
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* DESKTOP TABLE */}
        <div className="mt-5 hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-black/5 text-xs uppercase tracking-wide text-ink/40">
                <th className="pb-3">Tracking ID</th>
                <th className="pb-3">Destination</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Time</th>
                <th className="pb-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {ASSIGNED_SHIPMENTS.map((s) => {
                const tone = TONE_STYLES[s.tone];

                return (
                  <tr
                    key={s.id}
                    className="border-b border-black/5 last:border-0"
                  >
                    <td className="py-4 font-semibold">{s.id}</td>

                    <td className="py-4">
                      <div className="flex items-center gap-2 text-ink/60">
                        <MapPin className="h-4 w-4" />
                        {s.destination}
                      </div>
                    </td>

                    <td className="py-4">
                      <span
                        className={` text-center gap-2 rounded-full px-2  py-1 text-xs font-semibold ${tone.tag}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full `}
                        />
                        {s.status}
                      </span>
                    </td>

                    <td className="py-4 text-ink/60">{s.time}</td>

                    <td className="py-4">
                      <button className="flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-accent-dark">
                        Update
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}