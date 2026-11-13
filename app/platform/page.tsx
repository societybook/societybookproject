import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { societies, subscriptions, plans, platformAuditLogs } from "@/db/schema";
import { requirePlatformAdmin } from "@/lib/auth/context";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Building2, ShieldCheck, ArrowUpRight, Activity } from "lucide-react";

export const instant = false;

export default async function PlatformDashboardPage() {
  try {
    await requirePlatformAdmin();
  } catch {
    redirect("/login");
  }

  const [societyCount] = await db.select({ val: count() }).from(societies);
  const [activeSubsCount] = await db
    .select({ val: count() })
    .from(subscriptions)
    .where(eq(subscriptions.status, "active"));
  const [plansCount] = await db.select({ val: count() }).from(plans);

  const recentLogs = await db
    .select({
      id: platformAuditLogs.id,
      action: platformAuditLogs.action,
      entityType: platformAuditLogs.entityType,
      createdAt: platformAuditLogs.createdAt,
    })
    .from(platformAuditLogs)
    .limit(6);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Multi-Tenant SaaS Foundation
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">Platform Overview</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage tenant societies, plan quotas, and platform operational state.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-mono">
            <span>Onboarded Societies</span>
            <Building2 className="w-4 h-4 text-zinc-500" />
          </div>
          <div className="text-3xl font-semibold text-white tracking-tight">
            {societyCount?.val ?? 0}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Isolated database tenants</p>
        </div>

        <div className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-mono">
            <span>Active Subscriptions</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-semibold text-white tracking-tight">
            {activeSubsCount?.val ?? 0}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">SaaS subscription billing</p>
        </div>

        <div className="p-5 rounded-xl border border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2 font-mono">
            <span>Configured Plans</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">Tiers</span>
          </div>
          <div className="text-3xl font-semibold text-white tracking-tight">
            {plansCount?.val ?? 0}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Flat &amp; user limits defined</p>
        </div>
      </div>

      {/* Quick Launch & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick actions */}
        <div className="p-6 rounded-xl border border-zinc-800/80 bg-zinc-900/20 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Operator Quick Actions</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Provision new cooperative societies or configure SaaS subscription plans.
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/platform/societies"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-zinc-950 font-medium text-xs hover:bg-zinc-200 transition-colors"
            >
              Onboard Society
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/platform/plans"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 font-medium text-xs hover:bg-zinc-800 transition-colors"
            >
              Manage Plans
            </Link>
          </div>
        </div>

        {/* Audit stream preview */}
        <div className="p-6 rounded-xl border border-zinc-800/80 bg-zinc-900/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Platform Audit Stream</h2>
            <span className="text-[10px] font-mono text-zinc-500">Milestone 1</span>
          </div>
          {recentLogs.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-600 font-mono">
              No platform operator actions recorded yet.
            </div>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-zinc-900 last:border-0"
                >
                  <span className="font-mono text-zinc-300">{log.action}</span>
                  <span className="text-zinc-500 text-[11px]">
                    {log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
