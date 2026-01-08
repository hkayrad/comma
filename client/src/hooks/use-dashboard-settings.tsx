import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

const STORAGE_KEY = "dashboard-settings";

interface DashboardSettings {
    showOverviewCards: boolean;
    showStatisticsChart: boolean;
}

interface DashboardSettingsContextValue extends DashboardSettings {
    setShowOverviewCards: (value: boolean) => void;
    setShowStatisticsChart: (value: boolean) => void;
}

const defaultSettings: DashboardSettings = {
    showOverviewCards: true,
    showStatisticsChart: true,
};

function getStoredSettings(): DashboardSettings {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return { ...defaultSettings, ...JSON.parse(stored) };
        }
    } catch {
        // Ignore parse errors
    }
    return defaultSettings;
}

const DashboardSettingsContext = createContext<DashboardSettingsContextValue | null>(null);

export function DashboardSettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<DashboardSettings>(getStoredSettings);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }, [settings]);

    const setShowOverviewCards = useCallback((value: boolean) => {
        setSettings((prev) => ({ ...prev, showOverviewCards: value }));
    }, []);

    const setShowStatisticsChart = useCallback((value: boolean) => {
        setSettings((prev) => ({ ...prev, showStatisticsChart: value }));
    }, []);

    return (
        <DashboardSettingsContext.Provider
            value={{
                showOverviewCards: settings.showOverviewCards,
                showStatisticsChart: settings.showStatisticsChart,
                setShowOverviewCards,
                setShowStatisticsChart,
            }}
        >
            {children}
        </DashboardSettingsContext.Provider>
    );
}

export function useDashboardSettings() {
    const context = useContext(DashboardSettingsContext);
    if (!context) {
        throw new Error("useDashboardSettings must be used within DashboardSettingsProvider");
    }
    return context;
}
