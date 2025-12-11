import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/animate-ui/components/radix/dropdown-menu";
import { useTranslation } from "react-i18next";
import { US, TR } from "country-flag-icons/react/3x2";
import { Globe } from "lucide-react";

const supportedLanguages = [
  { code: "en", flag: <US />, label: "English" },
  { code: "tr", flag: <TR />, label: "Türkçe" },
];

export default function LanguageButton() {
  const { t, i18n } = useTranslation();

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger className="gap-2">
        <Globe size={16} />
        <span>{t("language")}</span>
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {supportedLanguages.map((lang) => (
          <DropdownMenuItem onClick={() => i18n.changeLanguage(lang.code)}>
            {lang.flag}
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}
