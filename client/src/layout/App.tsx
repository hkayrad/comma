import { Outlet } from "react-router";
import HKS_Sidebar from "./shared/HKS_Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useState } from "react";
import { Toaster } from "sonner";

export default function App() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const handleSidebarHover = (isHovering: boolean) => {
        setIsSidebarOpen(isHovering);
    }

    return (
        <div>
            <Toaster richColors className="select-none" />
            <SidebarProvider open={isSidebarOpen}>
                <HKS_Sidebar onMouseOver={() => handleSidebarHover(true)} onMouseOut={() => handleSidebarHover(false)} />
                <SidebarInset className="p-2 !m-2">
                    <Outlet />
                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}