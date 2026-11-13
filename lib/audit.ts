import { db } from "@/db";
import { platformAuditLogs, auditLogs } from "@/db/schema";

export async function logPlatformAction(params: {
  platformUserId?: string;
  societyId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    await db.insert(platformAuditLogs).values({
      platformUserId: params.platformUserId,
      societyId: params.societyId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadataJson: params.metadata,
      ipAddress: params.ipAddress,
    });
  } catch (error) {
    console.error("Failed to log platform action:", error);
  }
}

export async function logSocietyAction(params: {
  societyId: string;
  actorType: "staff" | "resident" | "system";
  actorId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  try {
    await db.insert(auditLogs).values({
      societyId: params.societyId,
      actorType: params.actorType,
      actorId: params.actorId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      metadataJson: params.metadata,
      ipAddress: params.ipAddress,
    });
  } catch (error) {
    console.error("Failed to log society action:", error);
  }
}

