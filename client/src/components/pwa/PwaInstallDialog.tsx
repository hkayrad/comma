import { useState } from "react";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { Button } from "@/components/ui/button";
import {
  Download,
  CheckCircle2,
  Share,
  PlusSquare,
  Zap,
  WifiOff,
  Smartphone,
  Monitor,
  MoreVertical,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDialog } from "@/contexts/dialog";
import { toast } from "sonner";

export default function PwaInstallDialog() {
  const { isInstallable, isInstalled, isIOS, isDesktop, isAndroid, promptInstall } =
    usePwaInstall();
  const { closeDialog } = useDialog();
  const { t } = useTranslation();
  const [attempted, setAttempted] = useState(false);

  const handleInstall = async () => {
    if (isInstallable) {
      const success = await promptInstall();
      if (success) {
        toast.success(
          t("pwa.installedSuccess", {
            defaultValue: "Comma başarıyla yüklendi!",
          }),
        );
        closeDialog();
        return;
      }
    }
    setAttempted(true);
  };

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* Header Info */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border">
        <img
          src="/pwa-192x192.png"
          alt="Comma"
          className="size-14 rounded-2xl shadow-md border object-cover shrink-0"
        />
        <div className="flex flex-col min-w-0">
          <h4 className="font-bold text-base text-foreground flex items-center gap-2">
            Comma
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              PWA
            </span>
          </h4>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {t(
              "pwa.dialog.description",
              { defaultValue: "Muhasebe, Finans ve İK süreçlerinizi cihazınızdan bağımsız ve hızlı yönetin." },
            )}
          </p>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/20 border text-xs gap-1.5">
          <Zap className="size-5 text-amber-500" />
          <span className="font-semibold">{t("pwa.features.fast", { defaultValue: "Hızlı & Akıcı" })}</span>
          <span className="text-muted-foreground text-[11px]">
            {t("pwa.features.fastDesc", { defaultValue: "Tarayıcı çubuğu olmadan tam ekran deneyim" })}
          </span>
        </div>
        <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/20 border text-xs gap-1.5">
          <WifiOff className="size-5 text-blue-500" />
          <span className="font-semibold">{t("pwa.features.cache", { defaultValue: "Önbellek" })}</span>
          <span className="text-muted-foreground text-[11px]">
            {t("pwa.features.cacheDesc", { defaultValue: "Statik dosyalar anında yüklenir" })}
          </span>
        </div>
        <div className="flex flex-col items-center text-center p-3 rounded-lg bg-muted/20 border text-xs gap-1.5">
          <Smartphone className="size-5 text-emerald-500" />
          <span className="font-semibold">{t("pwa.features.access", { defaultValue: "Kolay Erişim" })}</span>
          <span className="text-muted-foreground text-[11px]">
            {t("pwa.features.accessDesc", { defaultValue: "Ana ekran simgesi ve hızlı kısayollar" })}
          </span>
        </div>
      </div>

      {/* Installation Action or Instructions */}
      {isInstalled ? (
        <div className="flex items-center justify-center gap-2 p-4 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-sm font-medium">
          <CheckCircle2 className="size-5 shrink-0" />
          <span>{t("pwa.installed", { defaultValue: "Comma uygulamanız zaten yüklü ve kullanıma hazır." })}</span>
        </div>
      ) : isIOS ? (
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-muted/50 border text-xs">
          <span className="font-semibold text-foreground text-sm">
            {t("pwa.ios.title", { defaultValue: "iOS (Safari) Kurulum Adımları:" })}
          </span>
          <ol className="space-y-2.5 text-muted-foreground list-decimal list-inside">
            <li className="flex items-center gap-2">
              <span>1. Safari ekranının altındaki</span>
              <Share className="size-4 text-foreground inline shrink-0" />
              <span className="font-semibold text-foreground">Paylaş</span>
              <span>butonuna dokunun.</span>
            </li>
            <li className="flex items-center gap-2">
              <span>2. Menüde aşağı kaydırıp</span>
              <PlusSquare className="size-4 text-foreground inline shrink-0" />
              <span className="font-semibold text-foreground">Ana Ekrana Ekle</span>
              <span>seçeneğini seçin.</span>
            </li>
            <li>
              <span>3. Sağ üstteki</span>{" "}
              <span className="font-semibold text-foreground">Ekle</span>{" "}
              <span>butonuna basarak tamamlayın.</span>
            </li>
          </ol>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <Button
            onClick={handleInstall}
            className="w-full h-11 text-sm font-semibold gap-2 shadow-sm cursor-pointer"
          >
            <Download className="size-4" />
            {isInstallable
              ? t("pwa.installAction", { defaultValue: "Uygulamayı Cihazıma Yükle" })
              : t("pwa.installActionAlt", { defaultValue: "Yükleme Adımlarını Göster" })}
          </Button>

          {/* Fallback browser guides if native prompt isn't directly exposed */}
          {(!isInstallable || attempted) && (
            <div className="p-3.5 rounded-xl bg-muted/40 border text-xs space-y-2.5">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                {isDesktop ? <Monitor className="size-4" /> : <Smartphone className="size-4" />}
                {isDesktop
                  ? t("pwa.guide.desktopTitle", { defaultValue: "Masaüstü Tarayıcıda Kurulum:" })
                  : t("pwa.guide.mobileTitle", { defaultValue: "Mobil Tarayıcıda Kurulum:" })}
              </span>

              {isDesktop ? (
                <p className="text-muted-foreground leading-relaxed">
                  {t(
                    "pwa.guide.desktopDesc",
                    {
                      defaultValue:
                        "Chrome veya Edge tarayıcınızın adres çubuğunun (URL) sağ tarafında bulunan yükle (⊕ veya ⭳) simgesine tıklayarak Comma'yı anında yükleyebilirsiniz.",
                    },
                  )}
                </p>
              ) : isAndroid ? (
                <p className="text-muted-foreground leading-relaxed flex items-start gap-1.5">
                  <MoreVertical className="size-4 shrink-0 mt-0.5" />
                  <span>
                    {t(
                      "pwa.guide.androidDesc",
                      {
                        defaultValue:
                          "Tarayıcınızın sağ üst köşesindeki üç nokta menüsüne dokunun ve 'Uygulamayı Yükle' veya 'Ana Ekrana Ekle' seçeneğini seçin.",
                      },
                    )}
                  </span>
                </p>
              ) : (
                <p className="text-muted-foreground leading-relaxed">
                  {t(
                    "pwa.installHint",
                    { defaultValue: "Tarayıcınızın adres çubuğundaki veya menüsündeki 'Yükle' seçeneğini kullanabilirsiniz." },
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
