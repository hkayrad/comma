import { Outlet } from "react-router";
import HKS_Sidebar from "./shared/HKS_Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useState } from "react";
import { DialogProvider } from "@/contexts/DialogContext";
import FloatingButton from "./shared/FloatingButton";

export default function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleSidebarHover = (isHovering: boolean) => {
        setIsSidebarOpen(isHovering);
    }

    return (
        <div>
            <DialogProvider>
                <FloatingButton />
                <SidebarProvider open={isSidebarOpen}>
                    <HKS_Sidebar handleSidebarHover={handleSidebarHover} />
                    <SidebarInset className="p-2 !m-2">
                        <Outlet />
                    </SidebarInset>
                </SidebarProvider>
            </DialogProvider>
        </div>
    );
}