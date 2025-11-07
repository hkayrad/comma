import { Outlet, useLocation } from "react-router";
import { DialogProvider } from "@/contexts/DialogContext";
import FloatingButton from "./shared/FloatingButton";
import { useEffect } from "react";
import { sendRefreshEvent } from "@/lib/utils";
import MaintenanceBanner from "./shared/MaintenanceBanner";
import HksSidebar from "./shared/sidebar/HksSidebar";
import Header from "./shared/header/Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function App() {
    const location = useLocation();

    // const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        sendRefreshEvent();
    }, [location]);

    return (
        <div className="selection:bg-foreground selection:text-background">
            <DialogProvider>
                <FloatingButton />
                <SidebarProvider>
                    <HksSidebar />
                    <SidebarInset className="h-[calc(100dvh-1rem)] overflow-y-auto relative scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500 dark:hover:scrollbar-thumb-gray-500 ">
                        <MaintenanceBanner />
                        <Header />
                        <div className="p-2">
                            <Outlet />
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            </DialogProvider>
        </div >
    );
}