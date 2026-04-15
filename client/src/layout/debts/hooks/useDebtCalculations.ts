import { useCallback, useEffect, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { DebtFormValues } from "@/lib/schemas/debtSchema";

export function useDebtCalculations(form: UseFormReturn<DebtFormValues>) {
  const [total, setTotal] = useState(0);

  const handleVatButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, vatPercentage: number) => {
      e.preventDefault();
      const amount = form.getValues("amount");
      const discount = form.getValues("discount");
      form.setValue(
        "vat",
        Number(((amount - discount) * vatPercentage).toFixed(2)),
      );
    },
    [form],
  );

  const handleDiscountButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, discountPercentage: number) => {
      e.preventDefault();
      const amount = form.getValues("amount");
      form.setValue(
        "discount",
        Number((amount * discountPercentage).toFixed(2)),
      );
    },
    [form],
  );

  const handleSetWithholdingButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, percentage: number) => {
      e.preventDefault();
      const vat = form.getValues("vat");
      form.setValue(
        "withholding",
        Number((vat * percentage).toFixed(2)),
      );
    },
    [form],
  );

  const handleSetExchangeRateButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const exchangeRatesString = sessionStorage.getItem("exchangeRates");
      const exchangeRates = exchangeRatesString && JSON.parse(exchangeRatesString);

      const selectedCurrency = form.watch("currency").toLowerCase();

      if (exchangeRates && exchangeRates[selectedCurrency]) {
        form.setValue(
          "exchange_rate",
          parseFloat(exchangeRates[selectedCurrency].forexBuying),
        );
      }
    },
    [form],
  );

  const selectedCurrency = form.watch("currency");
  useEffect(() => {
    if (selectedCurrency === "TRY") {
      form.setValue("exchange_rate", 1);
    }
  }, [form, selectedCurrency]);

  const watchedAmount = form.watch("amount");
  const watchedVat = form.watch("vat");
  const watchedDiscount = form.watch("discount");
  const watchedWithholding = form.watch("withholding");

  useEffect(() => {
    const valAmount = watchedAmount || 0;
    const valVat = watchedVat || 0;
    const valDiscount = watchedDiscount || 0;
    const valWithholding = watchedWithholding || 0;
    const newTotal = valAmount - valDiscount + valVat - valWithholding;
    setTotal(Number(newTotal.toFixed(2)));
  }, [watchedAmount, watchedVat, watchedDiscount, watchedWithholding]);

  return {
    total,
    handleVatButtonClick,
    handleDiscountButtonClick,
    handleSetWithholdingButtonClick,
    handleSetExchangeRateButtonClick,
  };
}
