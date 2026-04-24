import { useRouteError } from "react-router";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

export function RootErrorBoundary() {
  const error = useRouteError();
  const { t } = useTranslation();

  const isChunkLoadError =
    error instanceof TypeError &&
    (error.message.includes("Failed to fetch dynamically imported module") ||
      error.message.includes("Importing a module script failed"));

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
