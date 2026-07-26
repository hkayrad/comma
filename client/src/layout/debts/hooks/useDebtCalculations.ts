import { useCallback, useEffect, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";

export function useDebtCalculations(form: UseFormReturn<any>, index?: number) {
  const prefix = index !== undefined ? `entries.${index}.` : "";

  const handleVatButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, vatPercentage: number) => {
      e.preventDefault();
      const amount = form.getValues(`${prefix}amount`);
      const discount = form.getValues(`${prefix}discount`);
      form.setValue(
        `${prefix}vat`,
        Number(((amount - discount) * vatPercentage).toFixed(2)),
      );
    },
    [form, prefix],
  );

  const handleDiscountButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, discountPercentage: number) => {
      e.preventDefault();
      const amount = form.getValues(`${prefix}amount`);
      form.setValue(
        `${prefix}discount`,
        Number((amount * discountPercentage).toFixed(2)),
      );
    },
    [form, prefix],
  );

  const handleSetWithholdingButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, percentage: number) => {
      e.preventDefault();
      const vat = form.getValues(`${prefix}vat`);
      form.setValue(
        `${prefix}withholding`,
        Number((vat * percentage).toFixed(2)),
      );
    },
    [form, prefix],
  );

  const handleSetExchangeRateButtonClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      const exchangeRatesString = sessionStorage.getItem("exchangeRates");
      const exchangeRates = exchangeRatesString && JSON.parse(exchangeRatesString);

      const selectedCurrency = form.watch(`${prefix}currency`).toLowerCase();

      if (exchangeRates && exchangeRates[selectedCurrency]) {
        form.setValue(
          `${prefix}exchange_rate`,
          parseFloat(exchangeRates[selectedCurrency].forexBuying),
        );
      }
    },
    [form, prefix],
  );

  const selectedCurrency = form.watch(`${prefix}currency`);
  useEffect(() => {
    if (selectedCurrency === "TRY") {
      form.setValue(`${prefix}exchange_rate`, 1);
    }
  }, [form, selectedCurrency, prefix]);

  const watchedAmount = form.watch(`${prefix}amount`);
  const watchedVat = form.watch(`${prefix}vat`);
  const watchedDiscount = form.watch(`${prefix}discount`);
  const watchedWithholding = form.watch(`${prefix}withholding`);

  const total = useMemo(() => {
    const valAmount = watchedAmount || 0;
    const valVat = watchedVat || 0;
    const valDiscount = watchedDiscount || 0;
    const valWithholding = watchedWithholding || 0;
    const newTotal = valAmount - valDiscount + valVat - valWithholding;
    return Number(newTotal.toFixed(2));
  }, [watchedAmount, watchedVat, watchedDiscount, watchedWithholding]);

  return {
    total,
    handleVatButtonClick,
    handleDiscountButtonClick,
    handleSetWithholdingButtonClick,
    handleSetExchangeRateButtonClick,
  };
}
