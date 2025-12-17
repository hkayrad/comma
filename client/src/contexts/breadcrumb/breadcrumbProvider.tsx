import { useCallback, useMemo, useState, type ReactNode } from "react";
import { BreadcrumbContext } from "./breadcrumbContext";

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
    const [labels, setLabels] = useState<Record<string, string>>({});

    const setLabel = useCallback((id: string, label: string) => {
        setLabels((prev) => {
            if (prev[id] === label) return prev;
            return { ...prev, [id]: label };
        });
    }, []);

    const value = useMemo(() => ({ labels, setLabel }), [labels, setLabel]);

    return (
        <BreadcrumbContext.Provider value={value}>
            {children}
        </BreadcrumbContext.Provider>
    );
}
