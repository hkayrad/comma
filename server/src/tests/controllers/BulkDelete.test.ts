import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "@/index";
import jwt from "jsonwebtoken";
import { UserRole } from "@comma/common/enums";
import { ADMIN_COMPANY_ID, ADMIN_USER_ID } from "@comma/common/constants";
import ReceivableDebtsService from "@/services/Receivable/DebtsService";
import PayableDebtsService from "@/services/Payable/DebtsService";
import ReceivablePaymentsService from "@/services/Receivable/PaymentsService";
import PayablePaymentsService from "@/services/Payable/PaymentsService";
import { BaseCustomerService } from "@/services/Generic/BaseCustomerService";

import ReceivableCustomersService from "@/services/Receivable/CustomersService";

describe("Bulk Delete Controllers API", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const authToken = jwt.sign(
    { id: ADMIN_USER_ID, role: UserRole.ADMIN, companyId: ADMIN_COMPANY_ID },
    process.env.JWT_SECRET as string
  );

  const validUuids = [
    "11111111-1111-4111-8111-111111111111",
    "22222222-2222-4222-8222-222222222222",
  ];

  describe("POST /receivables/debts/bulk-delete", () => {
    it("should return 400 when body is invalid", async () => {
      const response = await request(app)
        .post("/receivables/debts/bulk-delete")
        .set("Cookie", [`access_token=${authToken}`])
        .send({ ids: [] });

      expect(response.status).toBe(400);
    });

    it("should bulk delete receivable debts successfully", async () => {
      vi.spyOn(ReceivableDebtsService, "DeleteBatch").mockResolvedValue(2 as any);

      const response = await request(app)
        .post("/receivables/debts/bulk-delete")
        .set("Cookie", [`access_token=${authToken}`])
        .send({ ids: validUuids });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(2);
      expect(ReceivableDebtsService.DeleteBatch).toHaveBeenCalledWith(
        validUuids,
        ADMIN_USER_ID,
        ADMIN_COMPANY_ID
      );
    });
  });

  describe("POST /payables/debts/bulk-delete", () => {
    it("should bulk delete payable debts successfully", async () => {
      vi.spyOn(PayableDebtsService, "DeleteBatch").mockResolvedValue(2 as any);

      const response = await request(app)
        .post("/payables/debts/bulk-delete")
        .set("Cookie", [`access_token=${authToken}`])
        .send({ ids: validUuids });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(2);
    });
  });

  describe("POST /receivables/payments/bulk-delete", () => {
    it("should bulk delete receivable payments successfully", async () => {
      vi.spyOn(ReceivablePaymentsService, "DeleteBatch").mockResolvedValue(2 as any);

      const response = await request(app)
        .post("/receivables/payments/bulk-delete")
        .set("Cookie", [`access_token=${authToken}`])
        .send({ ids: validUuids });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(2);
    });
  });

  describe("POST /payables/payments/bulk-delete", () => {
    it("should bulk delete payable payments successfully", async () => {
      vi.spyOn(PayablePaymentsService, "DeleteBatch").mockResolvedValue(2 as any);

      const response = await request(app)
        .post("/payables/payments/bulk-delete")
        .set("Cookie", [`access_token=${authToken}`])
        .send({ ids: validUuids });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(2);
    });
  });

  describe("POST /receivables/customers/bulk-delete", () => {
    it("should bulk delete receivable customers successfully", async () => {
      vi.spyOn(ReceivableCustomersService, "DeleteBatch").mockResolvedValue(2 as any);

      const response = await request(app)
        .post("/receivables/customers/bulk-delete")
        .set("Cookie", [`access_token=${authToken}`])
        .send({ ids: validUuids });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.count).toBe(2);
    });
  });
});
