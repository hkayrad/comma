import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/shadcn-io/dropzone";
import { useDialog } from "@/contexts/DialogContext";
import { CompanyApi } from "@/lib/api/company";
import { sendRefreshEvent } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LogoForm() {
    const { theme } = useTheme();
    const { closeDialog } = useDialog();

    const [smallLogo, setSmallLogo] = useState<File | null>(null);
    const [largeLogo, setLargeLogo] = useState<File | null>(null);

    const [smallLogoPreview, setSmallLogoPreview] = useState<string | null>(null);
    const [largeLogoPreview, setLargeLogoPreview] = useState<string | null>(null);

    const [logos, setLogos] = useState<{
        smallLogo: string | null;
        largeLogo: string | null;
    }>({
        smallLogo: null,
        largeLogo: null
    });
    const [cacheBuster, setCacheBuster] = useState<number>(Date.now());

    const fetchLogos = async () => {
        try {
            const response = await CompanyApi.GetLogos();
            if (response.isSuccess) {
                setLogos(response.data);
                setCacheBuster(Date.now()); // Update cache buster when fetching logos
            }
        } catch (error) {
            console.error("Şirket logoları alınırken bir hata oluştu:", error);
        }
    };

    const handleDrop = (files: File[], size: 'small' | 'large') => {
        console.log(files, size);
        const SET_LOGO = size === 'small' ? setSmallLogo : setLargeLogo;
        const SET_PREVIEW = size === 'small' ? setSmallLogoPreview : setLargeLogoPreview;

        SET_LOGO(files[0]);

        if (files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => SET_PREVIEW(e.target?.result as string);
            reader.readAsDataURL(files[0]);
        } else {
            SET_PREVIEW(null);
        }
    };

    const handleUpload = async () => {
        const uploadPromises = [];

        if (smallLogo) {
            uploadPromises.push(CompanyApi.UploadLogo(smallLogo, 'small'));
        }

        if (largeLogo) {
            uploadPromises.push(CompanyApi.UploadLogo(largeLogo, 'large'));
        }

        toast.promise(Promise.all(uploadPromises), {
            loading: "Logolar yükleniyor...",
            success: () => {
                fetchLogos(); // Refresh logos with new cache buster
                sendRefreshEvent("logo:refresh");
                closeDialog();
                return "Logolar başarıyla yüklendi!";
            },
            error: "Logolar yüklenirken bir hata oluştu"
        });
    };

    const handleDeleteLogo = async (size: 'small' | 'large') => {
        toast.promise(CompanyApi.DeleteLogo(size), {
            loading: `${size === 'small' ? 'Küçük' : 'Büyük'} logo siliniyor...`,
            success: () => {
                if (size === 'small') {
                    setSmallLogo(null);
                    setSmallLogoPreview(null);
                    setLogos(prev => ({ ...prev, smallLogo: null }));
                } else {
                    setLargeLogo(null);
                    setLargeLogoPreview(null);
                    setLogos(prev => ({ ...prev, largeLogo: null }));
                }
                setCacheBuster(Date.now()); // Update cache buster after deletion
                sendRefreshEvent("logo:refresh");
                return "Logo başarıyla silindi!";
            },
            error: "Logo silinirken bir hata oluştu"
        });
    };

    useEffect(() => {
        fetchLogos();
    }, []);

    return (
        <div>
            <div className="flex justify-evenly">
                <div className="mb-6 flex flex-col gap-2 w-fit">
                    <div className="flex items-center justify-between">
                        <h2 className="">Küçük Logo</h2>
                        {(smallLogoPreview || logos.smallLogo) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLogo('small')}
                                className="text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-300"
                            >
                                <Trash2 />
                                <span>Sil</span>
                            </Button>
                        )}
                    </div>
                    <Dropzone
                        accept={{ "image/*": ['.png', '.jpg', '.jpeg'] }}
                        src={smallLogo ? [smallLogo] : []}
                        onDrop={(files) => handleDrop(files, "small")}
                        onError={console.error}
                        multiple={false}
                        className={`${smallLogo && "aspect-square"} w-auto !p-6`}
                    >
                        <DropzoneEmptyState />
                        <DropzoneContent>
                            {
                                (smallLogoPreview || logos.smallLogo) &&
                                <img
                                    src={
                                        smallLogoPreview ?
                                            smallLogoPreview :
                                            logos.smallLogo ?
                                                `${import.meta.env.VITE_API_URL}${logos.smallLogo}?t=${cacheBuster}` :
                                                ""
                                    }
                                    alt="Small Logo"
                                    className={`h-32 aspect-square object-contain ${theme === "dark" ? "invert brightness-0" : ""}`}
                                />
                            }
                        </DropzoneContent>
                    </Dropzone>
                </div>
                <div className="mb-6 flex flex-col gap-2 w-fit col-span-2">
                    <div className="flex items-center justify-between">
                        <h2 className="">Büyük Logo</h2>
                        {(largeLogoPreview || logos.largeLogo) && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteLogo('large')}
                                className="text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-300"
                            >
                                <Trash2 />
                                <span>Sil</span>
                            </Button>
                        )}
                    </div>
                    <Dropzone
                        accept={{ "image/*": ['.png', '.jpg', '.jpeg'] }}
                        src={largeLogo ? [largeLogo] : []}
                        onDrop={(files) => handleDrop(files, "large")}
                        onError={console.error}
                        multiple={false}
                        className="w-auto !p-6"
                    >
                        <DropzoneEmptyState />
                        <DropzoneContent>
                            {
                                (largeLogoPreview || logos.largeLogo) &&
                                <img
                                    src={
                                        largeLogoPreview ?
                                            largeLogoPreview :
                                            logos.largeLogo ?
                                                `${import.meta.env.VITE_API_URL}${logos.largeLogo}?t=${cacheBuster}` :
                                                ""
                                    }
                                    alt="Large Logo"
                                    className={`max-w-96 h-32 object-contain ${theme === "dark" ? "invert brightness-0" : ""}`}
                                />
                            }
                        </DropzoneContent>
                    </Dropzone>
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button onClick={handleUpload}>
                    Logoları Yükle
                </Button>
            </div>
        </div>
    );
}