import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { supportedLanguages } from "@/lib/supportedLanguages";

export default function LanguageButton() {
  const { t, i18n } = useTranslation();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="gap-2">
        <Globe size={16} />
        <span>{t("sidebar.footer.account.language")}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {supportedLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
          >
            {lang.flag}
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
