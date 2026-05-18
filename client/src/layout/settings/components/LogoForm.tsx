import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@/components/ui/shadcn-io/dropzone";
import { useDialog } from "@/contexts/dialog";
import CancelButton from "@/layout/shared/CancelButton";
import { CompanyApi } from "@/lib/api/company";
import { sendRefreshEvent } from "@/lib/utils";
import { Logger } from "@/lib/utils/logger";
import { Trash2, UploadIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router";
import { toast } from "sonner";
import { CommaImage } from "@/components/shared/CommaImage";
import { useRole } from "@/hooks/useRole";

export default function LogoForm() {
  const { theme } = useTheme();
  const location = useLocation();
  const isSettingsPage = location.pathname.includes("/ayarlar");
  const closeDialog = useDialog((s) => s.closeDialog);
  const { t } = useTranslation();
  const { hasMinimumRole } = useRole();
  const canEdit = hasMinimumRole(1);

  const [smallLogo, setSmallLogo] = useState<File | null>(null);
  const [largeLogo, setLargeLogo] = useState<File | null>(null);

  const [smallLogoPreview, setSmallLogoPreview] = useState<string | null>(null);
  const [largeLogoPreview, setLargeLogoPreview] = useState<string | null>(null);

  const [logos, setLogos] = useState<{
    smallLogo: string | null;
    largeLogo: string | null;
  }>({
    smallLogo: null,
    largeLogo: null,
  });
  const [cacheBuster, setCacheBuster] = useState<number>(() => Date.now());


  const fetchLogos = useCallback(async () => {
    try {
      const response = await CompanyApi.GetLogos();
      if (response.success) {
        setLogos(response.data);
        setCacheBuster(Date.now()); // Update cache buster when fetching logos
      }
    } catch (error) {
      Logger.error("Şirket logoları alınırken bir hata oluştu:", error);
    }
  }, []);

  const handleDrop = useCallback((files: File[], size: "small" | "large") => {
    const SET_LOGO = size === "small" ? setSmallLogo : setLargeLogo;
    const SET_PREVIEW =
      size === "small" ? setSmallLogoPreview : setLargeLogoPreview;

    SET_LOGO(files[0]);

    if (files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => SET_PREVIEW(e.target?.result as string);
      reader.readAsDataURL(files[0]);
    } else {
      SET_PREVIEW(null);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    const uploadPromises = [];

    if (smallLogo) {
      uploadPromises.push(CompanyApi.UploadLogo(smallLogo, "small"));
    }

    if (largeLogo) {
      uploadPromises.push(CompanyApi.UploadLogo(largeLogo, "large"));
    }

    toast.promise(Promise.all(uploadPromises), {
      loading: t("notification.accountDetails.logos.upload.pending"),
      success: () => {
        fetchLogos(); // Refresh logos with new cache buster
        sendRefreshEvent("logo:refresh");
        closeDialog();
        return t("notification.accountDetails.logos.upload.success");
      },
      error: t("notification.accountDetails.logos.upload.error"),
    });
  }, [smallLogo, largeLogo, closeDialog, fetchLogos, t]);

  const handleDeleteLogo = useCallback(
    async (size: "small" | "large") => {
      toast.promise(CompanyApi.DeleteLogo(size), {
        loading: t("notification.accountDetails.logos.delete.pending"),
        success: () => {
          if (size === "small") {
            setSmallLogo(null);
            setSmallLogoPreview(null);
            setLogos((prev) => ({ ...prev, smallLogo: null }));
          } else {
            setLargeLogo(null);
            setLargeLogoPreview(null);
            setLogos((prev) => ({ ...prev, largeLogo: null }));
          }
          setCacheBuster(Date.now()); // Update cache buster after deletion
          sendRefreshEvent("logo:refresh");
          return t("notification.accountDetails.logos.delete.success");
        },
        error: t("notification.accountDetails.logos.delete.error"),
      });
    },
    [t],
  );

  const onCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      closeDialog();
    },
    [closeDialog],
  );

  useEffect(() => {
    fetchLogos();
  }, [fetchLogos]);

  return (
    <div>
      <div className="flex justify-evenly">
        <div className="mb-6 flex flex-col gap-2 w-fit">
          <div className="flex items-center justify-between">
            <h2 className="">
              {t("dialog.accountDetails.logos.small").toString()}
            </h2>
            {canEdit && (smallLogoPreview || logos.smallLogo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteLogo("small")}
                className="text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-300"
              >
                <Trash2 />
                <span>{t("vars.delete")}</span>
              </Button>
            )}
          </div>
          <Dropzone
            accept={{
              "image/*": [".png", ".jpg", ".jpeg", ".webp"],
            }}
            src={smallLogo ? [smallLogo] : logos.smallLogo ? [] : undefined}
            onDrop={(files) => handleDrop(files, "small")}
            onError={Logger.error}
            multiple={false}
            disabled={!canEdit}
            className={`${smallLogo && "aspect-square"} w-auto p-6!`}
          >
            <DropzoneEmptyState>
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground mb-2">
                  <UploadIcon className="h-4 w-4" />
                </div>
                <p className="font-medium text-sm">
                  {t("dialog.accountDetails.logos.form.upload")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("dialog.accountDetails.logos.form.dragNDrop")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("dialog.accountDetails.logos.form.acceptedFormats")}
                </p>
              </div>
            </DropzoneEmptyState>
            <DropzoneContent>
              {(smallLogoPreview || logos.smallLogo) && (
                <CommaImage
                  src={
                    smallLogoPreview
                      ? smallLogoPreview
                      : logos.smallLogo
                        ? `${import.meta.env.VITE_API_URL}${logos.smallLogo}?t=${cacheBuster}`
                        : ""
                  }
                  alt="Small Logo"
                  containerClassName="h-32 aspect-square bg-transparent"
                  className={`object-contain ${theme === "dark" ? "invert brightness-0" : ""}`}
                />
              )}
            </DropzoneContent>
          </Dropzone>
        </div>
        <div className="mb-6 flex flex-col gap-2 w-fit col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="">
              {t("dialog.accountDetails.logos.large").toString()}
            </h2>
            {canEdit && (largeLogoPreview || logos.largeLogo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteLogo("large")}
                className="text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-300"
              >
                <Trash2 />
                <span>{t("vars.delete")}</span>
              </Button>
            )}
          </div>
          <Dropzone
            accept={{
              "image/*": [".png", ".jpg", ".jpeg", ".webp"],
            }}
            src={largeLogo ? [largeLogo] : logos.largeLogo ? [] : undefined}
            onDrop={(files) => handleDrop(files, "large")}
            onError={Logger.error}
            multiple={false}
            disabled={!canEdit}
            className="w-auto p-6!"
          >
            <DropzoneEmptyState>
              <div className="flex flex-col items-center justify-center text-center p-4">
                <div className="flex size-8 items-center justify-center rounded-md bg-muted text-muted-foreground mb-2">
                  <UploadIcon className="h-4 w-4" />
                </div>
                <p className="font-medium text-sm">
                  {t("dialog.accountDetails.logos.form.upload")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("dialog.accountDetails.logos.form.dragNDrop")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {t("dialog.accountDetails.logos.form.acceptedFormats")}
                </p>
              </div>
            </DropzoneEmptyState>
            <DropzoneContent>
              {(largeLogoPreview || logos.largeLogo) && (
                <CommaImage
                  src={
                    largeLogoPreview
                      ? largeLogoPreview
                      : logos.largeLogo
                        ? `${import.meta.env.VITE_API_URL}${logos.largeLogo}?t=${cacheBuster}`
                        : ""
                  }
                  alt="Large Logo"
                  containerClassName="max-w-96 h-32 bg-transparent"
                  className={`object-contain ${theme === "dark" ? "invert brightness-0" : ""}`}
                />
              )}
            </DropzoneContent>
          </Dropzone>
        </div>
      </div>
      <div className="flex justify-end gap-2 col-span-2">
        {!isSettingsPage && <CancelButton onClick={onCancel} />}
        {canEdit && (
          <Button onClick={handleUpload}>
            {t("dialog.accountDetails.logos.form.upload.confirm")}
          </Button>
        )}
      </div>
    </div>
  );
}
