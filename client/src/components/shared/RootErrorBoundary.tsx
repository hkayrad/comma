import { useRouteError } from "react-router";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useRef } from "react";

export function RootErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation();
  const reloadAttempted = useRef(false);

  const isChunkLoadError =
    error instanceof TypeError &&
    (error.message.includes("Failed to fetch dynamically imported module") ||
      error.message.includes("Importing a module script failed"));

  useEffect(() => {
    // If it's a chunk load error, try to reload automatically once
    if (isChunkLoadError && !reloadAttempted.current) {
      const lastReload = sessionStorage.getItem("last_chunk_load_reload");
      const now = Date.now();

      // Only auto-reload if we haven't reloaded for this reason in the last 10 seconds
      // to avoid reload loops if something is fundamentally broken
      if (!lastReload || now - parseInt(lastReload) > 10000) {
        reloadAttempted.current = true;
        sessionStorage.setItem("last_chunk_load_reload", now.toString());
        window.location.reload();
      }
    }
  }, [isChunkLoadError]);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          {isChunkLoadError
            ? t("error.chunkLoad.title", "Uygulama Güncellendi")
            : t("error.generic.title", "Bir Hata Oluştu")}
        </h1>
        <p className="text-muted-foreground">
          {isChunkLoadError
            ? t(
              "error.chunkLoad.description",
              "Uygulamanın yeni bir versiyonu mevcut. Devam etmek için lütfen sayfayı yenileyin.",
            )
            : t(
              "error.generic.description",
              "Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.",
            )}
        </p>
        <Button onClick={handleReload} className="gap-2">
          <RefreshCw className="size-4" />
          {t("error.action.reload", "Sayfayı Yenile")}
        </Button>
      </div>
    </div>
  );
}
