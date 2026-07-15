import { useCallback, useEffect, useState, useMemo } from "react";
import { useParams, useLocation } from "react-router";
import { PayableCustomerApi, ReceivableCustomerApi } from "@/lib/api/customer";
import type {
  CustomerStatement as CustomerStatementType,
  CompanyDto,
} from "@comma/common";
import { CompanyApi } from "@/lib/api/company";
import { toast } from "sonner";
import { format } from "date-fns";
import { Logger } from "@/lib/utils/logger";
import { useBreadcrumb } from "@/contexts/breadcrumb/useBreadcrumb";
import { useTranslation } from "react-i18next";
import type { DateRange } from "react-day-picker";

export function useCustomerStatement() {
  const { t } = useTranslation();
  const location = useLocation();
  const type: "payable" | "receivable" =
    location.pathname.split("/")[1] === "alacaklar" ? "receivable" : "payable";
  const { customerId } = useParams();
  const setLabel = useBreadcrumb((s) => s.setLabel);

  const API = useMemo(() => 
    type === "payable" ? PayableCustomerApi : ReceivableCustomerApi,
  [type]);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<CustomerStatementType | null>(null);
  const [exporting, setExporting] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [company, setCompany] = useState<CompanyDto | null>(null);

  useEffect(() => {
    CompanyApi.GetCompanyById()
      .then((response) => setCompany(response.data))
      .catch(Logger.error);
  }, []);

  const refresh = useCallback(() => {
    if (!customerId) return;

    const filters = {
      startDate: date?.from ? format(date.from, "yyyy-MM-dd") : undefined,
      endDate: date?.to ? format(date.to, "yyyy-MM-dd") : undefined,
    };

    setLoading(true);
    API.GetStatement(customerId, filters)
      .then((res) => {
        setData(res);
        if (res?.customer?.name) {
          setLabel(customerId, res.customer.name);
        }
      })
      .catch(() =>
        toast.error(t("dashboard.customerStatement.error.fetchStatement")),
      )
      .finally(() => setLoading(false));
  }, [customerId, API, date, setLabel, t]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        refresh();
      }
    });
    return () => {
      active = false;
    };
  }, [refresh]);

  const resetDate = useCallback(() => {
    setDate(undefined);
  }, []);

  return {
    type,
    loading,
    data,
    company,
    exporting,
    setExporting,
    date,
    setDate,
    resetDate,
    refresh,
  };
}
