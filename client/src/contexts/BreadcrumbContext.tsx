import { createContext, useContext, useState, type ReactNode } from "react";

interface BreadcrumbContextType {
    labels: Record<string, string>;
    setLabel: (id: string, label: string) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(
    undefined,
);

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
    const [labels, setLabels] = useState<Record<string, string>>({});

    const setLabel = (id: string, label: string) => {
        setLabels((prev) => ({ ...prev, [id]: label }));
    };

    return (
        <BreadcrumbContext.Provider value={{ labels, setLabel }}>
            {children}
        </BreadcrumbContext.Provider>
    );
}

export function useBreadcrumb() {
    const context = useContext(BreadcrumbContext);
    if (context === undefined) {
        throw new Error("useBreadcrumb must be used within a BreadcrumbProvider");
    }
    return context;
}
