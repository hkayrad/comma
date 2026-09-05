import {
  MenuItem,
  MenuSubmenu,
  MenuSubmenuPanel,
  MenuSubmenuTrigger,
} from "@/components/animate-ui/components/base/menu";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { supportedLanguages, TR, GB } from "@/lib/supportedLanguages";

export default function LanguageButton() {
  const { t, i18n } = useTranslation();
  const isTr = i18n.language?.startsWith("tr");

  return (
    <MenuSubmenu>
      <MenuSubmenuTrigger className="gap-2">
        <span className="w-4 h-3 overflow-hidden rounded-[2px] inline-flex items-center justify-center border border-border/50 shrink-0 shadow-2xs">
          {isTr ? <TR className="w-full h-full object-cover" /> : <GB className="w-full h-full object-cover" />}
        </span>
        <span className="flex-1 text-left">{t("sidebar.footer.account.language")}</span>
        <span className="text-[11px] font-semibold text-muted-foreground uppercase mr-1">
          {isTr ? "TR" : "EN"}
        </span>
      </MenuSubmenuTrigger>
      <MenuSubmenuPanel>
        {supportedLanguages.map((lang) => (
          <MenuItem
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <span className="w-4 h-3 overflow-hidden rounded-[2px] inline-flex items-center justify-center border border-border/50 shrink-0 shadow-2xs">
              {lang.flag}
            </span>
            <span className="flex-1">{lang.label}</span>
            {(isTr ? "tr" : "en") === lang.code && (
              <Check className="size-3.5 text-primary ml-auto" />
            )}
          </MenuItem>
        ))}
      </MenuSubmenuPanel>
    </MenuSubmenu>
  );
}
