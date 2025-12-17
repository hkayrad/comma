import { createContext } from "react";

interface BreadcrumbContextType {
    labels: Record<string, string>;
    setLabel: (id: string, label: string) => void;
}

export const BreadcrumbContext = createContext<
    BreadcrumbContextType | undefined
>(undefined);
