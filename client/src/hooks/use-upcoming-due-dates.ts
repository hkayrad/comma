import { useQuery } from "@tanstack/react-query";
import { ReceivableDebtApi, PayableDebtApi } from "@/lib/api/debt";
import { ReceivablePaymentApi, PayablePaymentApi } from "@/lib/api/payment";
import type { UpcomingDueDate } from "@comma/common";

export type DueDateItemType = "receivable" | "payable" | "receivableCheck" | "payableCheck";
export type DueDateWithType = UpcomingDueDate & { type: DueDateItemType };

export function useUpcomingDueDates() {
    return useQuery({
        queryKey: ["upcoming-due-dates"],
        queryFn: async () => {
            const [receivables, payables, receivableChecks, payableChecks] = await Promise.all([
                ReceivableDebtApi.GetUpcomingDueDates(7),
                PayableDebtApi.GetUpcomingDueDates(7),
                ReceivablePaymentApi.GetUpcomingChecks(7),
                PayablePaymentApi.GetUpcomingChecks(7),
            ]);

            const receivablesWithType: DueDateWithType[] = receivables.map((item) => ({
                ...item,
                type: "receivable" as const,
            }));

            const payablesWithType: DueDateWithType[] = payables.map((item) => ({
                ...item,
                type: "payable" as const,
            }));

            const receivableChecksWithType: DueDateWithType[] = receivableChecks.map((item) => ({
                ...item,
                type: "receivableCheck" as const,
            }));

            const payableChecksWithType: DueDateWithType[] = payableChecks.map((item) => ({
                ...item,
                type: "payableCheck" as const,
            }));

            return [...receivablesWithType, ...payablesWithType, ...receivableChecksWithType, ...payableChecksWithType].sort(
                (a, b) => a.days_remaining - b.days_remaining
            );
        },
        staleTime: 30000,
    });
}
