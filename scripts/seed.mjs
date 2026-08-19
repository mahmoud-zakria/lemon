import mysql from "mysql2/promise";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
await connection.execute(
  "INSERT INTO service_areas (name, description, isActive) SELECT ?, ?, true FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM service_areas WHERE name = ?)",
  ["Sabih", "منطقة الخدمة الابتدائية: قرية صبيح، ههيا، الشرقية، مصر", "Sabih"],
);
const rules = [
  ["تسعير الدراجة النارية - قابل للتعديل", "MOTORCYCLE", 5],
  ["تسعير التروسيكل - قابل للتعديل", "TUKTUK", 10],
  ["تسعير السيارة - قابل للتعديل", "CAR", 15],
  ["تسعير الفان - قابل للتعديل", "VAN", 20],
  ["تسعير البيك أب - قابل للتعديل", "PICKUP_TRUCK", 25],
];
for (const [name, vehicleType, minimumFare] of rules) {
  await connection.execute(
    "INSERT INTO pricing_rules (name, vehicleType, baseFare, perKm, minimumFare, waitingPerMinute, extraWeightThresholdKg, extraWeightFee, isActive) SELECT ?, ?, 0, 0, ?, 0, ?, 0, true FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM pricing_rules WHERE vehicleType = ?)",
    [name, vehicleType, minimumFare, vehicleType === "MOTORCYCLE" ? 5 : vehicleType === "TUKTUK" ? 15 : vehicleType === "CAR" ? 25 : vehicleType === "VAN" ? 50 : 100, vehicleType],
  );
}
await connection.end();
console.log("LEMON seed applied: Sabih service area and configurable vehicle pricing rules.");
