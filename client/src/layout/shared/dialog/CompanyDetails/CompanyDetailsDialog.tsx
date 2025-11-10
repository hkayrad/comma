
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCurrentUser } from "@/lib/api";
import { CompanyApi } from "@/lib/api/company";
import type { CompanyDto } from "@/lib/types";
import { useCallback, useEffect, useState } from "react";
import InformationForm from "./components/InformationForm";
import LogoForm from "./components/LogoForm";

export default function CompanyDetailsDialog() {
    const [companyDetails, setCompanyDetails] = useState<CompanyDto | null>(null);
    const user = useCurrentUser();

    const fetchCompanyDetails = useCallback(async () => {
        if (!user?.companyId) return;

        try {
            const response = await CompanyApi.GetCompanyById(user?.companyId!);

            if (response.isSuccess) {
                setCompanyDetails(response.data);
            }
        } catch (error) {
            console.error("Şirket detayları alınırken bir hata oluştu:", error);
        }
    }, [user?.companyId]);

    useEffect(() => {
        fetchCompanyDetails();
    }, [user?.companyId]);

    return (
        <Tabs defaultValue="info" className="w-full">
            <TabsList>
                <TabsTrigger value="info">Şirket Bilgileri</TabsTrigger>
                <TabsTrigger value="logos">Logolar</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4">
                <InformationForm companyDetails={companyDetails} user={user} />
            </TabsContent>

            <TabsContent value="logos" className="mt-4">
                <LogoForm />
            </TabsContent>
        </Tabs>
    )
}