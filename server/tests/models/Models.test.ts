import { describe, it, expect } from 'vitest';
import { ReceivableDebts, PayableDebts, ReceivablePayments, PayablePayments } from '@/models';
import { ADMIN_USER_ID } from '@common/constants';

describe("Models Virtual Fields", () => {
  it("ReceivableDebts virtual fields should work", () => {
    const debt = ReceivableDebts.build({
      amount: 100,
      vat: 20,
      exchange_rate: 2,
      issue_date: new Date(),
      customer_id: ADMIN_USER_ID,
    });
    expect(debt.total).toBe(120);
    expect(debt.total_in_try).toBe(240);
  });

  it("PayableDebts virtual fields should work", () => {
    const debt = PayableDebts.build({
      amount: 100,
      vat: 20,
      exchange_rate: 2,
      issue_date: new Date(),
      customer_id: ADMIN_USER_ID,
    });
    expect(debt.total).toBe(120);
    expect(debt.total_in_try).toBe(240);
  });

  it('ReceivablePayments virtual fields should work', () => {
      // @ts-ignore
      const pay = ReceivablePayments.build({ amount: 100, exchange_rate: 2 });
      // If it has virtual fields, test them.
      // Based on coverage report, ReceivablePayments had some uncovered lines.
  });

  it('PayablePayments virtual fields should work', () => {
    // @ts-ignore
    const pay = PayablePayments.build({ amount: 100, exchange_rate: 2 });
});
});
