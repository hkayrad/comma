import { Outlet, useLocation } from "react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DialogProvider } from "@/contexts/DialogContext";
import FloatingButton from "./shared/FloatingButton";
import { useEffect, useState } from "react";
import { sendRefreshEvent } from "@/lib/utils";
import MaintenanceBanner from "./shared/MaintenanceBanner";
import HksSidebar from "./shared/sidebar/HksSidebar";
import Header from "./shared/header/Header";

export default function App() {
    const location = useLocation();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        sendRefreshEvent();
    }, [location]);

    return (
        <div className="selection:bg-black selection:text-white">
            <DialogProvider>
                <FloatingButton />
                <SidebarProvider open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                    <HksSidebar />
                    <SidebarInset>
                        <MaintenanceBanner />
                        <Header isSidebarOpen={isSidebarOpen} />
                        <div className="p-2">
                            <Outlet />
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </DialogProvider>
        </div >
    );
}