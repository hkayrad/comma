import { useState, useEffect, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
    window.dispatchEvent(new CustomEvent("pwa-prompt-available"));
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    window.dispatchEvent(new CustomEvent("pwa-app-installed"));
  });
}

export function usePwaInstall() {
  const [isInstallable, setIsInstallable] = useState<boolean>(!!deferredPrompt);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  const checkInstalled = useCallback(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean((window.navigator as unknown as { standalone?: boolean }).standalone) ||
      document.referrer.includes("android-app://")
    );
  }, []);

  useEffect(() => {
    setIsInstalled(checkInstalled());

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.platform === "MacIntel" &&
        window.navigator.maxTouchPoints > 1);
    setIsIOS(isIosDevice);

    const onPromptAvailable = () => setIsInstallable(true);
    const onAppInstalled = () => {
      setIsInstallable(false);
      setIsInstalled(true);
    };

    window.addEventListener("pwa-prompt-available", onPromptAvailable);
    window.addEventListener("pwa-app-installed", onAppInstalled);

    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const onDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };
    mediaQuery.addEventListener("change", onDisplayModeChange);

    return () => {
      window.removeEventListener("pwa-prompt-available", onPromptAvailable);
      window.removeEventListener("pwa-app-installed", onAppInstalled);
      mediaQuery.removeEventListener("change", onDisplayModeChange);
    };
  }, [checkInstalled]);

  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      return false;
    }
    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        deferredPrompt = null;
        setIsInstallable(false);
        setIsInstalled(true);
        return true;
      }
    } catch (err) {
      console.error("PWA install error:", err);
    }
    return false;
  }, []);

  return {
    isInstallable,
    isInstalled,
    isIOS,
    promptInstall,
  };
}
