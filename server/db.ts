import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  auditLogs,
  driverOffers,
  driverProfiles,
  driverStatusValues,
  InsertUser,
  orderStatusHistory,
  orders,
  OrderStatus,
  pricingRules,
  ratings,
  serviceAreas,
  users,
  vehicles,
  VehicleType,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb(); if (!db) return;
  const values: InsertUser = { openId: user.openId, role: user.role ?? (user.openId === ENV.ownerOpenId ? "ADMIN" : "CUSTOMER") };
  const updateSet: Record<string, unknown> = { lastSignedIn: user.lastSignedIn ?? new Date() };
  for (const field of ["name", "email", "phone", "loginMethod", "avatarUrl"] as const) {
    if (user[field] !== undefined) { values[field] = user[field] ?? null; updateSet[field] = user[field] ?? null; }
  }
  if (user.role !== undefined || user.openId === ENV.ownerOpenId) updateSet.role = values.role;
  await db.insert(users).values({ ...values, lastSignedIn: user.lastSignedIn ?? new Date() }).onDuplicateKeyUpdate({ set: updateSet });
}
export async function getUserByOpenId(openId: string) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(users).where(eq(users.openId, openId)).limit(1); return rows[0]; }
export async function getPricingRule(vehicleType: VehicleType) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(pricingRules).where(and(eq(pricingRules.vehicleType, vehicleType), eq(pricingRules.isActive, true))).limit(1); return rows[0]; }
export function calculateFare(rule: typeof pricingRules.$inferSelect | undefined, distanceKm: number, weightKg: number, waitingMinutes = 0) {
  if (!rule) return { fare: 0, distanceKm };
  const base = Number(rule.baseFare), perKm = Number(rule.perKm), minimum = Number(rule.minimumFare), waiting = Number(rule.waitingPerMinute) * waitingMinutes;
  const extra = rule.extraWeightThresholdKg && weightKg > Number(rule.extraWeightThresholdKg) ? Number(rule.extraWeightFee) : 0;
  return { fare: Math.max(minimum, base + perKm * distanceKm + extra + waiting), distanceKm };
}
export async function listCustomerOrders(customerId: number) { const db = await getDb(); if (!db) return []; return db.select().from(orders).where(eq(orders.customerId, customerId)).orderBy(desc(orders.createdAt)); }
export async function listDriverOffers(driverId: number) { const db = await getDb(); if (!db) return []; return db.select({ offer: driverOffers, order: orders }).from(driverOffers).innerJoin(orders, eq(driverOffers.orderId, orders.id)).where(and(eq(driverOffers.driverId, driverId), eq(driverOffers.status, "PENDING"))).orderBy(desc(driverOffers.createdAt)); }
export async function listDriverTrips(driverId: number) { const db = await getDb(); if (!db) return []; return db.select().from(orders).where(and(eq(orders.driverId, driverId), inArray(orders.status, ["DELIVERED", "COMPLETED", "CANCELLED", "FAILED_DELIVERY"]))).orderBy(desc(orders.updatedAt)).limit(50); }
export async function getDriverProfile(userId: number) { const db = await getDb(); if (!db) return undefined; const rows = await db.select().from(driverProfiles).where(eq(driverProfiles.userId, userId)).limit(1); return rows[0]; }
export async function appendStatus(orderId: number, fromStatus: OrderStatus | null, toStatus: OrderStatus, changedByUserId: number, note?: string) { const db = await getDb(); if (!db) return; await db.insert(orderStatusHistory).values({ orderId, fromStatus, toStatus, changedByUserId, note }); await db.insert(auditLogs).values({ adminId: changedByUserId, action: "ORDER_STATUS_CHANGED", entityType: "ORDER", entityId: orderId, details: { fromStatus, toStatus, note } }); }
export async function createAudit(adminId: number, action: string, entityType: string, entityId: number, details?: unknown) { const db = await getDb(); if (!db) return; await db.insert(auditLogs).values({ adminId, action, entityType, entityId, details: details as Record<string, unknown> | undefined }); }
export async function listAdminOrders() { const db = await getDb(); if (!db) return []; return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100); }
export async function getDashboardStats() { const db = await getDb(); if (!db) return { orders: 0, activeOrders: 0, onlineDrivers: 0, customers: 0 }; const [all, active, online, customerCount] = await Promise.all([db.select({ count: sql<number>`count(*)` }).from(orders), db.select({ count: sql<number>`count(*)` }).from(orders).where(inArray(orders.status, ["SEARCHING_DRIVER", "DRIVER_ASSIGNED", "IN_DELIVERY"])), db.select({ count: sql<number>`count(*)` }).from(driverProfiles).where(eq(driverProfiles.driverStatus, "ONLINE")), db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "CUSTOMER"))]); return { orders: Number(all[0]?.count ?? 0), activeOrders: Number(active[0]?.count ?? 0), onlineDrivers: Number(online[0]?.count ?? 0), customers: Number(customerCount[0]?.count ?? 0) }; }

export { driverStatusValues, serviceAreas, vehicles, driverProfiles, orders, ratings, driverOffers, users, pricingRules, auditLogs, orderStatusHistory };
