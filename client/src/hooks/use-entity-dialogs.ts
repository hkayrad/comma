import { useDialog, type DialogConfig } from "@/contexts/dialog";
import type { CustomerDto } from "@comma/common";

/**
 * A utility hook that wraps useDialog to provide specialized functions for
 * opening entity-related dialogs (Debt, Payment, Customer) with
 * closeOnOverlayClick set to false by default.
 */
export const useEntityDialogs = () => {
  const openDialog = useDialog((state) => state.openDialog);

  /**
   * Opens a Debt dialog with closeOnOverlayClick: false.
   */
  const openDebtDialog = (
    config: Omit<DialogConfig, "closeOnOverlayClick">,
    customerInfo?: CustomerDto | null
  ) => {
    openDialog({ ...config, closeOnOverlayClick: false }, customerInfo);
  };

  /**
   * Opens a Payment dialog with closeOnOverlayClick: false.
   */
  const openPaymentDialog = (
    config: Omit<DialogConfig, "closeOnOverlayClick">,
    customerInfo?: CustomerDto | null
  ) => {
    openDialog({ ...config, closeOnOverlayClick: false }, customerInfo);
  };

  /**
   * Opens a Customer dialog with closeOnOverlayClick: false.
   */
  const openCustomerDialog = (
    config: Omit<DialogConfig, "closeOnOverlayClick">,
    customerInfo?: CustomerDto | null
  ) => {
    openDialog({ ...config, closeOnOverlayClick: false }, customerInfo);
  };

  return {
    openDebtDialog,
    openPaymentDialog,
    openCustomerDialog,
  };
};
