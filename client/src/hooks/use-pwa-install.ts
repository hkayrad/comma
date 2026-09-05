import { useState, useEffect, useCallback } from "react";

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

declare global {
  interface Window {
    __pwaDeferredPrompt?: BeforeInstallPromptEvent | null;
  }
}

let localDeferredPrompt: BeforeInstallPromptEvent | null = null;

const getPrompt = (): BeforeInstallPromptEvent | null => {
  if (typeof window === "undefined") return null;
  return window.__pwaDeferredPrompt || localDeferredPrompt || null;
};

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    localDeferredPrompt = e as BeforeInstallPromptEvent;
    window.__pwaDeferredPrompt = localDeferredPrompt;
    window.dispatchEvent(new CustomEvent("pwa-prompt-available"));
  });

  window.addEventListener("appinstalled", () => {
    localDeferredPrompt = null;
    window.__pwaDeferredPrompt = null;
    window.dispatchEvent(new CustomEvent("pwa-app-installed"));
  });
}

export function usePwaInstall() {
  const [isInstallable, setIsInstallable] = useState<boolean>(() => Boolean(getPrompt()));
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [isDesktop, setIsDesktop] = useState<boolean>(false);

  const checkInstalled = useCallback(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: window-controls-overlay)").matches ||
      Boolean((window.navigator as unknown as { standalone?: boolean }).standalone) ||
      document.referrer.includes("android-app://")
    );
  }, []);

  useEffect(() => {
    setIsInstalled(checkInstalled());

    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
    const isAndroidDevice = /android/.test(ua);
    const isMobileDevice = isIosDevice || isAndroidDevice || /mobile/.test(ua);

    setIsIOS(isIosDevice);
    setIsAndroid(isAndroidDevice);
    setIsDesktop(!isMobileDevice);

    const onPromptAvailable = () => {
      setIsInstallable(true);
    };

    const onAppInstalled = () => {
      setIsInstallable(false);
      setIsInstalled(true);
    };

    // Check again in case prompt arrived right before mount
    if (getPrompt()) {
      setIsInstallable(true);
    }

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
    const prompt = getPrompt();
    if (!prompt) {
      return false;
    }
    try {
      await prompt.prompt();
      const choiceResult = await prompt.userChoice;
      localDeferredPrompt = null;
      if (typeof window !== "undefined") {
        window.__pwaDeferredPrompt = null;
      }
      setIsInstallable(false);
      if (choiceResult.outcome === "accepted") {
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
    isAndroid,
    isDesktop,
    promptInstall,
  };
}
