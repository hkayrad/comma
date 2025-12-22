import {
    MenuItem,
    MenuSubmenu,
    MenuSubmenuPanel,
    MenuSubmenuTrigger,
} from "@/components/animate-ui/components/base/menu";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { supportedLanguages } from "@/lib/supportedLanguages";

export default function LanguageButton() {
    const { t, i18n } = useTranslation();

    return (
        <MenuSubmenu>
            <MenuSubmenuTrigger className="gap-2">
                <Globe size={16} />
                <span>{t("sidebar.footer.account.language")}</span>
            </MenuSubmenuTrigger>
            <MenuSubmenuPanel>
                {supportedLanguages.map((lang) => (
                    <MenuItem
                        key={lang.code}
                        onClick={() => i18n.changeLanguage(lang.code)}
                    >
                        {lang.flag}
                        {lang.label}
                    </MenuItem>
                ))}
            </MenuSubmenuPanel>
        </MenuSubmenu>
    );
}
