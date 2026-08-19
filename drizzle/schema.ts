import {
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  index,
  json,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

export const userRoleValues = ["CUSTOMER", "DRIVER", "ADMIN"] as const;
export const orderStatusValues = [
  "PENDING",
  "SEARCHING_DRIVER",
  "DRIVER_ASSIGNED",
  "DRIVER_GOING_TO_PICKUP",
  "ARRIVED_AT_PICKUP",
  "ORDER_PICKED_UP",
  "IN_DELIVERY",
  "ARRIVED_AT_DESTINATION",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "FAILED_DELIVERY",
] as const;
export const driverStatusValues = ["OFFLINE", "ONLINE", "BUSY"] as const;
export const vehicleTypeValues = ["MOTORCYCLE", "TUKTUK", "CAR", "VAN", "PICKUP_TRUCK"] as const;

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 128 }).notNull().unique(),
  name: varchar("name", { length: 150 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 30 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", userRoleValues).default("CUSTOMER").notNull(),
  accountStatus: mysqlEnum("accountStatus", ["ACTIVE", "SUSPENDED", "PENDING", "DELETED"]).default("ACTIVE").notNull(),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
}, table => ({ roleIdx: index("users_role_idx").on(table.role), statusIdx: index("users_status_idx").on(table.accountStatus) }));

export const driverProfiles = mysqlTable("driver_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  nationalIdLast4: varchar("nationalIdLast4", { length: 4 }),
  driverStatus: mysqlEnum("driverStatus", driverStatusValues).default("OFFLINE").notNull(),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("5.00").notNull(),
  totalTrips: int("totalTrips").default(0).notNull(),
  totalEarnings: decimal("totalEarnings", { precision: 12, scale: 2 }).default("0.00").notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  currentLat: decimal("currentLat", { precision: 10, scale: 7 }),
  currentLng: decimal("currentLng", { precision: 10, scale: 7 }),
  lastLocationAt: timestamp("lastLocationAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ statusIdx: index("driver_profiles_status_idx").on(table.driverStatus) }));

export const vehicles = mysqlTable("vehicles", {
  id: int("id").autoincrement().primaryKey(),
  driverId: int("driverId").notNull().references(() => driverProfiles.id, { onDelete: "cascade" }),
  vehicleType: mysqlEnum("vehicleType", vehicleTypeValues).notNull(),
  make: varchar("make", { length: 100 }),
  model: varchar("model", { length: 100 }),
  plateNumber: varchar("plateNumber", { length: 50 }),
  capacityKg: decimal("capacityKg", { precision: 8, scale: 2 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ driverIdx: index("vehicles_driver_idx").on(table.driverId), typeIdx: index("vehicles_type_idx").on(table.vehicleType) }));

export const serviceAreas = mysqlTable("service_areas", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  description: text("description"),
  centerLat: decimal("centerLat", { precision: 10, scale: 7 }),
  centerLng: decimal("centerLng", { precision: 10, scale: 7 }),
  radiusKm: decimal("radiusKm", { precision: 8, scale: 2 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const pricingRules = mysqlTable("pricing_rules", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 150 }).notNull(),
  vehicleType: mysqlEnum("vehicleType", vehicleTypeValues),
  baseFare: decimal("baseFare", { precision: 10, scale: 2 }).default("0.00").notNull(),
  perKm: decimal("perKm", { precision: 10, scale: 2 }).default("0.00").notNull(),
  minimumFare: decimal("minimumFare", { precision: 10, scale: 2 }).default("0.00").notNull(),
  waitingPerMinute: decimal("waitingPerMinute", { precision: 10, scale: 2 }).default("0.00").notNull(),
  extraWeightThresholdKg: decimal("extraWeightThresholdKg", { precision: 8, scale: 2 }),
  extraWeightFee: decimal("extraWeightFee", { precision: 10, scale: 2 }).default("0.00").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull().references(() => users.id),
  driverId: int("driverId").references(() => driverProfiles.id),
  serviceAreaId: int("serviceAreaId").references(() => serviceAreas.id),
  status: mysqlEnum("status", orderStatusValues).default("PENDING").notNull(),
  pickupAddress: varchar("pickupAddress", { length: 500 }).notNull(),
  pickupLat: decimal("pickupLat", { precision: 10, scale: 7 }),
  pickupLng: decimal("pickupLng", { precision: 10, scale: 7 }),
  dropoffAddress: varchar("dropoffAddress", { length: 500 }).notNull(),
  dropoffLat: decimal("dropoffLat", { precision: 10, scale: 7 }),
  dropoffLng: decimal("dropoffLng", { precision: 10, scale: 7 }),
  packageCategory: varchar("packageCategory", { length: 80 }).notNull().default("PARCEL"),
  packageDescription: text("packageDescription").notNull(),
  weightKg: decimal("weightKg", { precision: 8, scale: 2 }).notNull(),
  vehicleType: mysqlEnum("vehicleType", vehicleTypeValues).notNull(),
  estimatedDistanceKm: decimal("estimatedDistanceKm", { precision: 8, scale: 2 }),
  estimatedFare: decimal("estimatedFare", { precision: 10, scale: 2 }),
  finalFare: decimal("finalFare", { precision: 10, scale: 2 }),
  paymentMethod: mysqlEnum("paymentMethod", ["CASH_ON_DELIVERY", "ONLINE"]).default("CASH_ON_DELIVERY").notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["UNPAID", "PENDING", "PAID", "FAILED", "REFUNDED"]).default("UNPAID").notNull(),
  driverOfferExpiresAt: timestamp("driverOfferExpiresAt"),
  cancelledReason: text("cancelledReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ customerIdx: index("orders_customer_idx").on(table.customerId), driverIdx: index("orders_driver_idx").on(table.driverId), statusIdx: index("orders_status_idx").on(table.status) }));

export const orderStatusHistory = mysqlTable("orderStatusHistory", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
  fromStatus: varchar("fromStatus", { length: 40 }),
  toStatus: varchar("toStatus", { length: 40 }).notNull(),
  changedByUserId: int("changedByUserId").notNull().references(() => users.id),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ orderIdx: index("order_history_order_idx").on(table.orderId, table.createdAt) }));

export const driverOffers = mysqlTable("driverOffers", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().references(() => orders.id, { onDelete: "cascade" }),
  driverId: int("driverId").notNull().references(() => driverProfiles.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["PENDING", "ACCEPTED", "REJECTED", "EXPIRED"]).default("PENDING").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  respondedAt: timestamp("respondedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ driverStatusIdx: index("driver_offers_driver_status_idx").on(table.driverId, table.status), orderIdx: index("driver_offers_order_idx").on(table.orderId) }));

export const ratings = mysqlTable("ratings", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull().unique().references(() => orders.id, { onDelete: "cascade" }),
  customerId: int("customerId").notNull().references(() => users.id),
  driverId: int("driverId").notNull().references(() => driverProfiles.id),
  score: int("score").notNull(),
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull().references(() => users.id),
  action: varchar("action", { length: 120 }).notNull(),
  entityType: varchar("entityType", { length: 80 }),
  entityId: int("entityId"),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({ driverProfile: one(driverProfiles), customerOrders: many(orders), ratings: many(ratings), history: many(orderStatusHistory) }));
export const driverProfilesRelations = relations(driverProfiles, ({ one, many }) => ({ user: one(users, { fields: [driverProfiles.userId], references: [users.id] }), vehicles: many(vehicles), orders: many(orders), offers: many(driverOffers), ratings: many(ratings) }));
export const ordersRelations = relations(orders, ({ one, many }) => ({ customer: one(users, { fields: [orders.customerId], references: [users.id] }), driver: one(driverProfiles, { fields: [orders.driverId], references: [driverProfiles.id] }), serviceArea: one(serviceAreas, { fields: [orders.serviceAreaId], references: [serviceAreas.id] }), statusHistory: many(orderStatusHistory), offers: many(driverOffers), rating: one(ratings) }));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type DriverProfile = typeof driverProfiles.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type VehicleType = (typeof vehicleTypeValues)[number];
export type OrderStatus = (typeof orderStatusValues)[number];
export type DriverStatus = (typeof driverStatusValues)[number];
