import {
  Item,
  ItemActions,
  ItemContent,
  ItemHeader,
  ItemMedia,
} from "@/components/ui/item";
import { ExternalLink, HandCoins, History, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";

export default function InfoDialog() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-1">
      <Item size="sm">
        <ItemMedia variant="icon">
          <History />
        </ItemMedia>
        <ItemContent>
          <ItemHeader>{t("dialog.info.version")}</ItemHeader>
        </ItemContent>
        <ItemActions>
          <NavLink
            to="https://semver.org/lang/tr/"
            target="_blank"
            className="text-xs text-muted-foreground flex items-center gap-1"
          >
            {import.meta.env.VITE_PACKAGE_VERSION}
            <ExternalLink size={12} />
          </NavLink>
        </ItemActions>
      </Item>
      <Item size="sm">
        <ItemMedia variant="icon">
          <UserRound />
        </ItemMedia>
        <ItemContent>
          <ItemHeader>{t("dialog.info.developer")}</ItemHeader>
        </ItemContent>
        <ItemActions>
          <NavLink
            to={import.meta.env.VITE_AUTHOR_URL}
            target="_blank"
            className="text-xs text-muted-foreground flex items-center gap-1"
          >
            {import.meta.env.VITE_AUTHOR_NAME}
            <ExternalLink size={12} />
          </NavLink>
        </ItemActions>
      </Item>
      <Item size="sm">
        <ItemMedia variant="icon">
          <HandCoins />
        </ItemMedia>
        <ItemContent>
          <ItemHeader>{t("dialog.info.exchangeInfo")}</ItemHeader>
        </ItemContent>
        <ItemActions>
          <NavLink
            to="https://evds2.tcmb.gov.tr"
            target="_blank"
            className="text-xs text-muted-foreground flex items-center gap-1"
          >
            {t("vars.tcmb")}
            <ExternalLink size={12} />
          </NavLink>
        </ItemActions>
      </Item>
    </div>
  );
}
