import { Outlet, useLocation } from "react-router";
import HksSidebar from "./shared/HksSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DialogProvider } from "@/contexts/DialogContext";
import FloatingButton from "./shared/FloatingButton";
import { useEffect } from "react";
import { sendRefreshEvent } from "@/lib/utils";

export default function App() {
    const location = useLocation();

    useEffect(() => {
        sendRefreshEvent()
    }, [location]);

    return (
        <div className="selection:bg-black selection:text-white">
            <DialogProvider>
                <FloatingButton />
                <SidebarProvider defaultOpen={false}>
                    <HksSidebar />
                    <SidebarInset className="p-2 !m-2">
                        <Outlet />
                    </SidebarInset>
                </SidebarProvider>
            </DialogProvider>
        </div>
    );
}