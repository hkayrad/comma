import { useEffect, useRef } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { RefreshCw, Wifi, WifiOff } from "lucide-react";

export default function PwaManager() {
  const { t } = useTranslation();
  const wasOffline = useRef(false);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onOfflineReady() {
      toast.success(
        t("pwa.offlineReady", {
          defaultValue: "Comma çevrimdışı kullanım için hazırlandı.",
        }),
        {
          duration: 3500,
        },
      );
    },
    onRegisterError(error) {
      console.error("PWA service worker registration failed:", error);
    },
  });

  // Handle service worker update notification
  useEffect(() => {
    if (needRefresh) {
      toast(
        t("pwa.updateAvailable", {
          defaultValue: "Yeni bir sürüm mevcut!",
        }),
        {
          description: t("pwa.updateDescription", {
            defaultValue: "Güncellemek ve en son sürümü yüklemek için tıklayın.",
          }),
          duration: Infinity,
          icon: <RefreshCw className="size-4 animate-spin" />,
          action: {
            label: t("pwa.updateAction", { defaultValue: "Güncelle" }),
            onClick: () => {
              updateServiceWorker(true);
            },
          },
          cancel: {
            label: t("common.cancel", { defaultValue: "Daha Sonra" }),
            onClick: () => {
              setNeedRefresh(false);
            },
          },
        },
      );
    }
  }, [needRefresh, updateServiceWorker, setNeedRefresh, t]);

  // Handle network online / offline events
  useEffect(() => {
    const handleOnline = () => {
      if (wasOffline.current) {
        toast.success(
          t("pwa.network.online", {
            defaultValue: "İnternet bağlantısı yeniden sağlandı.",
          }),
          {
            id: "network-status",
            duration: 3000,
            icon: <Wifi className="size-4 text-emerald-500" />,
          },
        );
        wasOffline.current = false;
      }
    };

    const handleOffline = () => {
      wasOffline.current = true;
      toast.warning(
        t("pwa.network.offline", {
          defaultValue: "İnternet bağlantısı kesildi. Çevrimdışı moddasınız.",
        }),
        {
          id: "network-status",
          duration: 5000,
          icon: <WifiOff className="size-4 text-amber-500" />,
        },
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [t]);

  return null;
}
