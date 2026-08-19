import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function customerContext(): TrpcContext {
  const now = new Date();
  return { user: { id: 7, openId: "customer-test", name: "عميل اختبار", email: null, phone: null, loginMethod: "test", role: "CUSTOMER", accountStatus: "ACTIVE", avatarUrl: null, createdAt: now, updatedAt: now, lastSignedIn: now }, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

describe("LEMON role access", () => {
  it("rejects customer access to admin procedures", async () => {
    const caller = appRouter.createCaller(customerContext());
    await expect(caller.admin.stats()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
