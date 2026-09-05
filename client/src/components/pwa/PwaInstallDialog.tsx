import { usePwaInstall } from "@/hooks/use-pwa-install";
import { Button } from "@/components/ui/button";
import { Download, CheckCircle2, Share, PlusSquare, Zap, WifiOff, Smartphone } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDialog } from "@/contexts/dialog";

export default function PwaInstallDialog() {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePwaInstall();
  const { closeDialog } = useDialog();
  const { t } = useTranslation();

  const handleInstall = async () => {
    const success = await promptInstall();
    if (success) {
      closeDialog();
    }
  };

  return (
    <div className="flex flex-col gap-6 py-2">
      {/* Header Info */}
      <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/40 border">
        <img
          src="/pwa-192x192.png"
          alt="Comma"
          className="size-14 rounded-2xl shadow-md border object-cover"
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
          <CheckCircle2 className="size-5" />
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
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleInstall}
            disabled={!isInstallable}
            className="w-full h-11 text-sm font-semibold gap-2 shadow-sm"
          >
            <Download className="size-4" />
            {isInstallable
              ? t("pwa.installAction", { defaultValue: "Uygulamayı Cihazıma Yükle" })
              : t("pwa.installManual", { defaultValue: "Tarayıcı Menüsünden Yükleyin" })}
          </Button>
          {!isInstallable && (
            <p className="text-[11px] text-center text-muted-foreground">
              {t(
                "pwa.installHint",
                { defaultValue: "Tarayıcınızın adres çubuğundaki 'Yükle' simgesini de kullanabilirsiniz." },
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
