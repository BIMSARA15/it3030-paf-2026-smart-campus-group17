import { useMemo, useState } from "react";
import {
  Building2,
  CheckCircle,
  FlaskConical,
  MapPin,
  Package,
  RefreshCw,
  Search,
  ShieldAlert,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import TechnicianTopBar from "../../components/layout/TechnicianTopBar";
import { useBooking } from "../../context/BookingContext";

const TYPE_CONFIG = {
  room: {
    label: "Room",
    icon: Building2,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
  },
  lab: {
    label: "Lab",
    icon: FlaskConical,
    color: "text-violet-600",
    bg: "bg-violet-50",
    border: "border-violet-100",
  },
  equipment: {
    label: "Equipment",
    icon: Package,
    color: "text-[#2F3A52]",
    bg: "bg-[#EEF2F7]",
    border: "border-slate-200",
  },
};

const normalizeText = (value) => String(value || "").toLowerCase();

function getResourceItems(resources, utilities) {
  const resourceItems = resources.map((resource) => ({
    id: resource.id,
    name: resource.name,
    code: resource.resourceCode,
    type: resource.type,
    typeLabel: TYPE_CONFIG[resource.type]?.label || "Resource",
    location: resource.location,
    status: resource.status,
    capacity: resource.capacity,
    description: resource.description,
    features: resource.features || [],
    source: "resource",
  }));

  const utilityItems = utilities.map((utility) => ({
    id: utility.id,
    name: utility.utilityName || utility.name,
    code: utility.utilityCode,
    type: "equipment",
    typeLabel: utility.category || "Equipment",
    location: utility.location,
    status: utility.status,
    quantity: utility.quantity,
    description: utility.description,
    features: [],
    source: "utility",
  }));

  return [...resourceItems, ...utilityItems];
}

export default function TechnicianResources() {
  const {
    resources,
    resourcesLoading,
    resourcesError,
    fetchResources,
    utilities,
    utilitiesLoading,
    utilitiesError,
    fetchUtilities,
  } = useBooking();

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const items = useMemo(
    () => getResourceItems(resources || [], utilities || []),
    [resources, utilities]
  );

  const filteredItems = useMemo(() => {
    const query = normalizeText(search.trim());
    return items.filter((item) => {
      const matchesType = typeFilter === "all" || item.type === typeFilter;
      const searchable = [
        item.name,
        item.code,
        item.location,
        item.status,
        item.typeLabel,
        item.description,
        ...item.features,
      ]
        .map(normalizeText)
        .join(" ");

      return matchesType && (!query || searchable.includes(query));
    });
  }, [items, search, typeFilter]);

  const counts = {
    all: items.length,
    room: items.filter((item) => item.type === "room").length,
    lab: items.filter((item) => item.type === "lab").length,
    equipment: items.filter((item) => item.type === "equipment").length,
  };

  const isLoading = resourcesLoading || utilitiesLoading;
  const hasError = resourcesError || utilitiesError;

  const refresh = () => {
    fetchResources();
    fetchUtilities();
  };

  return (
    <>
      <TechnicianTopBar title="Resources" subtitle="Facilities Management" notifCount={1} />

      <div className="p-6 space-y-5">
        <section className="rounded-[30px] bg-gradient-to-r from-[#2F3A52] via-[#35435F] to-[#3C4C6C] px-6 py-6 text-white shadow-[0_20px_50px_rgba(47,58,82,0.18)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Resources</h1>
              <p className="mt-1 text-sm text-slate-200">
                {counts.all} campus resource{counts.all === 1 ? "" : "s"} from the shared Resources data.
              </p>
            </div>
            <button
              type="button"
              onClick={refresh}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-sm font-semibold text-[#2F3A52] shadow-sm transition hover:bg-slate-100"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search resources, equipment, location..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-700 outline-none transition focus:border-[#2F3A52] focus:bg-white focus:ring-2 focus:ring-[#2F3A52]/10"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {["all", "room", "lab", "equipment"].map((type) => {
                const active = typeFilter === type;
                const Icon = type === "all" ? SlidersHorizontal : TYPE_CONFIG[type].icon;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTypeFilter(type)}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                      active
                        ? "bg-[#2F3A52] text-white shadow-sm"
                        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {type === "all" ? "All Resources" : TYPE_CONFIG[type].label}
                    <span className={`rounded-full px-1.5 py-0.5 ${active ? "bg-white/20" : "bg-slate-100 text-slate-500"}`}>
                      {counts[type]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {hasError && (
          <div className="rounded-[20px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <div className="flex items-start gap-2">
              <ShieldAlert className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>{resourcesError || utilitiesError}</p>
            </div>
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {isLoading && items.length === 0 ? (
            [0, 1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="h-52 rounded-[24px] border border-slate-200 bg-white animate-pulse" />
            ))
          ) : filteredItems.length === 0 ? (
            <div className="col-span-full rounded-[28px] border border-dashed border-slate-200 bg-white p-10 text-center shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
              <Building2 className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">No resources found</p>
              <p className="mt-1 text-xs text-slate-500">Try changing the search or filter.</p>
            </div>
          ) : (
            filteredItems.map((item) => <ResourceCard key={`${item.source}-${item.id}`} item={item} />)
          )}
        </section>
      </div>
    </>
  );
}

function ResourceCard({ item }) {
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.room;
  const Icon = config.icon;
  const unavailable = normalizeText(item.status).includes("maintenance") ||
    normalizeText(item.status).includes("out of service") ||
    normalizeText(item.status).includes("not available");

  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl border ${config.bg} ${config.border} ${config.color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${config.bg} ${config.color}`}>
            {item.typeLabel}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            unavailable ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
          }`}>
            {item.status || "Available"}
          </span>
        </div>
      </div>

      {item.code && (
        <span className="mb-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          {item.code}
        </span>
      )}

      <h3 className="text-sm font-bold text-slate-800">{item.name || "Unnamed Resource"}</h3>

      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
        <MapPin className="h-3.5 w-3.5" />
        <span>{item.location || "Location not set"}</span>
      </div>

      {item.capacity && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <Users className="h-3.5 w-3.5" />
          <span>Capacity: {item.capacity} persons</span>
        </div>
      )}

      {item.quantity != null && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
          <Package className="h-3.5 w-3.5" />
          <span>Quantity: {item.quantity}</span>
        </div>
      )}

      {item.description && (
        <p className="mt-3 line-clamp-2 text-sm text-slate-500">{item.description}</p>
      )}

      {item.features.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {item.features.slice(0, 4).map((feature) => (
            <span key={feature} className="inline-flex items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-xs text-slate-600">
              <CheckCircle className="h-3 w-3 text-emerald-500" />
              {feature}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
