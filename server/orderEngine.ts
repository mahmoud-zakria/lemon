import type { OrderStatus } from "../drizzle/schema";

export const workflowTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["SEARCHING_DRIVER", "CANCELLED"],
  SEARCHING_DRIVER: ["DRIVER_ASSIGNED", "FAILED_DELIVERY", "CANCELLED"],
  DRIVER_ASSIGNED: ["DRIVER_GOING_TO_PICKUP", "CANCELLED"],
  DRIVER_GOING_TO_PICKUP: ["ARRIVED_AT_PICKUP", "CANCELLED"],
  ARRIVED_AT_PICKUP: ["ORDER_PICKED_UP"],
  ORDER_PICKED_UP: ["IN_DELIVERY"],
  IN_DELIVERY: ["ARRIVED_AT_DESTINATION"],
  ARRIVED_AT_DESTINATION: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
  FAILED_DELIVERY: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus, actor: "CUSTOMER" | "DRIVER" | "ADMIN") {
  if (actor === "ADMIN") return true;
  if (actor === "CUSTOMER") return to === "CANCELLED" && ["PENDING", "SEARCHING_DRIVER", "DRIVER_ASSIGNED"].includes(from);
  return workflowTransitions[from].includes(to);
}

export function nextDriverStatus(status: OrderStatus) {
  return status === "DELIVERED" || status === "COMPLETED" ? "ONLINE" : "BUSY";
}
