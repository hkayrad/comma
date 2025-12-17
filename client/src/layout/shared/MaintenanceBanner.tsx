import { useConfig } from "@/contexts/config";
import { TriangleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";

export default function MaintenanceBanner() {
  const [isBannerVisible, setIsBannerVisible] = useState(false);

  const location = useLocation();
  const { configs } = useConfig();
  const { t } = useTranslation();

  useEffect(() => {
    const maintenanceMode = configs.maintenanceMode;
    if (maintenanceMode === "active") {
      setIsBannerVisible(true);
    } else {
      setIsBannerVisible(false);
    }
  }, [configs]);

  return (
    isBannerVisible && (
      <div
        className={`bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 py-3 px-4 rounded-md top-0 w-[calc(100%-1rem)] mx-2 mt-2 ${location.pathname === "/login" ? "fixed" : "relative"} z-50 flex justify-center items-center gap-2 select-none`}
      >
        <TriangleAlert size={20} />
        <p className="font-medium">{t("header.maintenanceBanner")}</p>
      </div>
    )
  );
}
