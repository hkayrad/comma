import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LogoForm from "./components/LogoForm";
import InformationForm from "./components/InformationForm";

export default function CompanyDetailsDialog() {
  return (
    <Tabs defaultValue="info" className="w-full">
      <TabsList>
        <TabsTrigger value="info">Hesap Bilgileri</TabsTrigger>
        <TabsTrigger value="logos">Logolar</TabsTrigger>
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
