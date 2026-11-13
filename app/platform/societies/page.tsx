import { db } from "@/db";
import { societies, societyLimits, plans } from "@/db/schema";
import { requirePlatformAdmin } from "@/lib/auth/context";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { SocietiesClient } from "@/components/platform/SocietiesClient";

export const instant = false;

export default async function PlatformSocietiesPage() {
  try {
    await requirePlatformAdmin();
  } catch {
    redirect("/login");
  }

  const societyRows = await db
    .select({
      id: societies.id,
      code: societies.code,
      name: societies.name,
      registrationNumber: societies.registrationNumber,
      city: societies.city,
      state: societies.state,
      status: societies.status,
      createdAt: societies.createdAt,
      maxFlats: societyLimits.maxFlats,
      maxUsers: societyLimits.maxUsers,
    })
    .from(societies)
    .leftJoin(societyLimits, eq(societyLimits.societyId, societies.id));

  const planOptions = await db
    .select({
      id: plans.id,
      code: plans.code,
      name: plans.name,
      priceInr: plans.priceInr,
      maxFlatsDefault: plans.maxFlatsDefault,
      maxUsersDefault: plans.maxUsersDefault,
    })
    .from(plans);

  // Serialize timestamps for Client Component
  const serializedSocieties = societyRows.map((s) => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
  }));

  return (
    <SocietiesClient
      initialSocieties={serializedSocieties}
      availablePlans={planOptions}
    />
  );
}
