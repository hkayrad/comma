import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LogoForm from "./LogoForm";
import InformationForm from "./InformationForm";
import { useTranslation } from "react-i18next";

export default function CompanySettings() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-16">
      <section className="space-y-6">
        <h3 className="text-xl font-semibold border-b pb-2">
          {t("dialog.accountDetails.accountInformation")}
        </h3>
        <div className="py-4">
          <InformationForm />
        </div>
      </section>

      <section className="space-y-6">
        <h3 className="text-xl font-semibold border-b pb-2">
          {t("dialog.accountDetails.logos")}
        </h3>
        <div className="py-4">
          <LogoForm />
        </div>
      </section>
    </div>
  );
}
