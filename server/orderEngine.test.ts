import { describe, expect, it } from "vitest";
import { calculateFare } from "./db";
import { canTransition, nextDriverStatus } from "./orderEngine";

describe("LEMON order workflow", () => {
  it("allows the driver workflow in the documented order", () => {
    expect(canTransition("DRIVER_ASSIGNED", "DRIVER_GOING_TO_PICKUP", "DRIVER")).toBe(true);
    expect(canTransition("ARRIVED_AT_PICKUP", "ORDER_PICKED_UP", "DRIVER")).toBe(true);
    expect(canTransition("ORDER_PICKED_UP", "DELIVERED", "DRIVER")).toBe(false);
  });

  it("limits customer cancellation to early states and gives admin override", () => {
    expect(canTransition("SEARCHING_DRIVER", "CANCELLED", "CUSTOMER")).toBe(true);
    expect(canTransition("IN_DELIVERY", "CANCELLED", "CUSTOMER")).toBe(false);
    expect(canTransition("IN_DELIVERY", "CANCELLED", "ADMIN")).toBe(true);
  });

  it("returns the correct driver availability after delivery", () => {
    expect(nextDriverStatus("DELIVERED")).toBe("ONLINE");
    expect(nextDriverStatus("IN_DELIVERY")).toBe("BUSY");
  });
});

describe("LEMON pricing", () => {
  it("uses the greater of minimum fare and calculated fare", () => {
    const result = calculateFare({ baseFare: "10", perKm: "4", minimumFare: "20", waitingPerMinute: "2", extraWeightThresholdKg: "5", extraWeightFee: "7" } as never, 3, 6, 4);
    expect(result.fare).toBe(37);
  });

  it("does not invent a commercial price when no rule exists", () => {
    expect(calculateFare(undefined, 9, 2).fare).toBe(0);
  });
});
