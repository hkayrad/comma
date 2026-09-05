import { ExternalLink, HandCoins, History, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";

export default function InfoDialog() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-md text-sm">
        <div className="flex items-center gap-2">
          <History className="size-4 text-muted-foreground" />
          <span className="font-medium">{t("dialog.info.version")}</span>
        </div>
        <NavLink
          to="https://semver.org/lang/tr/"
          target="_blank"
          className="text-xs text-muted-foreground flex items-center gap-1 hover:underline"
        >
          {import.meta.env.VITE_PACKAGE_VERSION}
          <ExternalLink size={12} />
        </NavLink>
      </div>
      <div className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-md text-sm">
        <div className="flex items-center gap-2">
          <UserRound className="size-4 text-muted-foreground" />
          <span className="font-medium">{t("dialog.info.developer")}</span>
        </div>
        <NavLink
          to={import.meta.env.VITE_AUTHOR_URL}
          target="_blank"
          className="text-xs text-muted-foreground flex items-center gap-1 hover:underline"
        >
          {import.meta.env.VITE_AUTHOR_NAME}
          <ExternalLink size={12} />
        </NavLink>
      </div>
      <div className="flex items-center justify-between gap-2.5 px-3 py-2 rounded-md text-sm">
        <div className="flex items-center gap-2">
          <HandCoins className="size-4 text-muted-foreground" />
          <span className="font-medium">{t("dialog.info.exchangeInfo")}</span>
        </div>
        <NavLink
          to="https://evds3.tcmb.gov.tr"
          target="_blank"
          className="text-xs text-muted-foreground flex items-center gap-1 hover:underline"
        >
          {t("vars.tcmb")}
          <ExternalLink size={12} />
        </NavLink>
      </div>
    </div>
  );
}
