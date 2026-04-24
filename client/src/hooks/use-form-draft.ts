import { useCallback, useEffect } from "react";
import type { UseFormReturn, FieldValues, DefaultValues } from "react-hook-form";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function useFormDraft<T extends FieldValues>(
  key: string,
  form: UseFormReturn<T>,
  enabled: boolean = true
) {
  const { t } = useTranslation();

  const saveDraft = useCallback(() => {
    try {
      const values = form.getValues();
      localStorage.setItem(key, JSON.stringify(values));
      toast.success(t("notification.draft.save.success"));
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error(t("notification.draft.save.error"));
    }
  }, [key, form, t]);

  const loadDraft = useCallback(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        // We use reset with the saved values to ensure the form state is updated correctly
        form.reset(parsed as DefaultValues<T>);
        return true;
      }
    } catch (error) {
      console.error("Failed to load draft:", error);
    }
    return false;
  }, [key, form]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  // Auto-load draft on mount if enabled
  useEffect(() => {
    if (enabled) {
      const draftLoaded = loadDraft();
      if (draftLoaded) {
        toast.info(t("notification.draft.loaded"));
      }
    }
  }, [enabled, loadDraft, t]);

  return { saveDraft, clearDraft };
}
