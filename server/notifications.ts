import { notifyOwner } from "./_core/notification";

export type DeliveryNotificationKind =
  | "DRIVER_OFFER"
  | "DRIVER_ASSIGNED"
  | "DRIVER_MOVING"
  | "DELIVERED";

export type DeliveryNotification = {
  kind: DeliveryNotificationKind;
  orderId: number;
  recipientUserId: number;
  message: string;
};

/**
 * Development-safe application notification provider. It keeps the product
 * event contract independent from a future SMS/push provider and never
 * fabricates a delivery or GPS signal.
 */
export async function notifyDeliveryUser(event: DeliveryNotification) {
  console.info(`[LEMON notification] ${event.kind} order=${event.orderId} recipient=${event.recipientUserId}: ${event.message}`);
  return true;
}

export async function notifyDispatchFailure(orderId: number, message: string) {
  const delivered = await notifyOwner({
    title: `فشل توزيع طلب ليمون #${orderId}`,
    content: message,
  });
  if (!delivered) console.warn(`[LEMON notification fallback] dispatch failure order=${orderId}: ${message}`);
  return delivered;
}
