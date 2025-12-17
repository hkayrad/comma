import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LogoForm from "./components/LogoForm";
import InformationForm from "./components/InformationForm";
import { useTranslation } from "react-i18next";

export default function CompanyDetailsDialog() {
    const { t } = useTranslation();
    return (
        <Tabs defaultValue="info" className="w-full">
            <TabsList>
                <TabsTrigger value="info">
                    {t("dialog.accountDetails.accountInformation")}
                </TabsTrigger>
                <TabsTrigger value="logos">
                    {t("dialog.accountDetails.logos")}
                </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4">
                <InformationForm />
            </TabsContent>

            <TabsContent value="logos" className="mt-4">
                <LogoForm />
            </TabsContent>
        </Tabs>
    );
}
