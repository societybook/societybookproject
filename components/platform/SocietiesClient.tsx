"use client";

import { useState } from "react";
import { Building2, Plus, ShieldCheck, X, Loader2 } from "lucide-react";

interface SocietyRow {
  id: string;
  code: string;
  name: string;
  registrationNumber: string | null;
  city: string | null;
  state: string | null;
  status: string;
  createdAt: string;
  maxFlats: number | null;
  maxUsers: number | null;
}

interface PlanOption {
  id: string;
  code: string;
  name: string;
  priceInr: string;
  maxFlatsDefault: number;
  maxUsersDefault: number;
}

export function SocietiesClient({
  initialSocieties,
  availablePlans,
}: {
  initialSocieties: SocietyRow[];
  availablePlans: PlanOption[];
}) {
  const [societies, setSocieties] = useState<SocietyRow[]>(initialSocieties);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form inputs
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [state, setState] = useState("Maharashtra");
  const [contactEmail, setContactEmail] = useState("");
  const [planId, setPlanId] = useState(availablePlans[0]?.id || "");
  const [customMaxFlats, setCustomMaxFlats] = useState("");

  async function handleCreateSociety(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/platform/societies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          name: name.trim(),
          registrationNumber: registrationNumber.trim() || undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          contactEmail: contactEmail.trim() || undefined,
          planId,
          customMaxFlats: customMaxFlats ? parseInt(customMaxFlats, 10) : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create society");
      }

      setSocieties((prev) => [
        {
          id: data.society.id,
          code: data.society.code,
          name: data.society.name,
          registrationNumber: data.society.registrationNumber,
          city: data.society.city,
          state: data.society.state,
          status: data.society.status,
          createdAt: data.society.createdAt,
          maxFlats: customMaxFlats
            ? parseInt(customMaxFlats, 10)
            : availablePlans.find((p) => p.id === planId)?.maxFlatsDefault ?? 50,
          maxUsers: availablePlans.find((p) => p.id === planId)?.maxUsersDefault ?? 5,
        },
        ...prev,
      ]);

      // Reset form & close
      setCode("");
      setName("");
      setRegistrationNumber("");
      setCustomMaxFlats("");
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creating society");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Societies &amp; Quotas</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Create tenant societies, allocate flat &amp; user limits, and assign subscription plans.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-950 font-medium text-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Onboard New Society
        </button>
      </div>

      {/* Societies Table */}
      <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 font-mono">
              <th className="py-3 px-4 font-medium">Tenant Code</th>
              <th className="py-3 px-4 font-medium">Society Name</th>
              <th className="py-3 px-4 font-medium">Location</th>
              <th className="py-3 px-4 font-medium">Reg Number</th>
              <th className="py-3 px-4 font-medium">Flat Quota</th>
              <th className="py-3 px-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
            {societies.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-zinc-500 font-mono">
                  No tenant societies onboarded yet. Click &ldquo;Onboard New Society&rdquo; to begin.
                </td>
              </tr>
            ) : (
              societies.map((soc) => (
                <tr key={soc.id} className="hover:bg-zinc-900/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-white">
                    {soc.code}
                  </td>
                  <td className="py-3 px-4 font-medium text-zinc-200">
                    {soc.name}
                  </td>
                  <td className="py-3 px-4 text-zinc-400">
                    {[soc.city, soc.state].filter(Boolean).join(", ") || "—"}
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-400">
                    {soc.registrationNumber || "Pending"}
                  </td>
                  <td className="py-3 px-4 font-mono text-zinc-300">
                    {soc.maxFlats ?? "—"} flats
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1 h-1 rounded-full bg-emerald-400" />
                      {soc.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Onboard Society Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl text-zinc-100">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-white">Onboard New Society</h2>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSociety} className="mt-4 space-y-4 text-xs">
              {error && (
                <div className="p-2.5 rounded-md border border-red-500/20 bg-red-500/10 text-red-400 font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">
                    Tenant Code (e.g. GREENVALLEY)
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="GREENVALLEY"
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-white font-mono uppercase focus:ring-1 focus:ring-zinc-600 focus:outline-none"
                  />
                  <p className="text-[10px] text-zinc-500 mt-0.5">Used for flat usernames</p>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">
                    Society Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Green Valley CHS Ltd"
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-white focus:ring-1 focus:ring-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">
                    Registration Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="BOM/HSG/12345/2020"
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-white font-mono focus:ring-1 focus:ring-zinc-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">
                    City / State
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-1/2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-white focus:ring-1 focus:ring-zinc-600 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State"
                      className="w-1/2 px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-white focus:ring-1 focus:ring-zinc-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">
                    SaaS Subscription Plan
                  </label>
                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-white focus:ring-1 focus:ring-zinc-600 focus:outline-none"
                  >
                    {availablePlans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} (Max {plan.maxFlatsDefault} flats)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-medium">
                    Custom Max Flats (Optional)
                  </label>
                  <input
                    type="number"
                    value={customMaxFlats}
                    onChange={(e) => setCustomMaxFlats(e.target.value)}
                    placeholder="Defaults to plan quota"
                    className="w-full px-2.5 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-white font-mono focus:ring-1 focus:ring-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-[11px] text-zinc-400 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Creating a society initializes a separate tenant boundary, subscription record, and strict flat quota limit in the shared database.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-md border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-zinc-950 font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Provision Society
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
