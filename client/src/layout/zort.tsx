import { Button } from "@/components/ui/button";
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/shadcn-io/dropzone";
import { CompanyApi } from "@/lib/api/company";
import { sendRefreshEvent } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

export default function Zort() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [logoSize, setLogoSize] = useState<'small' | 'large'>('small');

    const handleDrop = (acceptedFiles: File[]) => {
        setFile(acceptedFiles[0]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            toast.error("Please select a file");
            return;
        }

        setUploading(true);

        try {
            // Simulate network latency
            const uploadPromise = CompanyApi.UploadLogo(file, logoSize);
            const delayPromise = new Promise(resolve => setTimeout(resolve, 1000));

            toast.promise(
                Promise.all([uploadPromise, delayPromise]).then(([result]) => result),
                {
                    loading: `Uploading ${logoSize === 'small' ? 'small' : 'large'} logo...`,
                    success: () => {
                        sendRefreshEvent("logo:refresh");
                        return `${logoSize === 'small' ? 'Small' : 'Large'} logo uploaded successfully`;
                    },
                    error: "Failed to upload logo"
                }
            );

            setFile(null);
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("An error occurred while uploading");
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteLogo = async (size: 'small' | 'large') => {
        const promise = CompanyApi.DeleteLogo(size);
        toast.promise(promise, {
            loading: "Logo siliniyor...",
            success: (res) => {
                sendRefreshEvent("logo:refresh");
                return res.message || "Logo başarıyla silindi!";
            },
            error: "Logo silinirken bir hata oluştu"
        });
    }

    return (
        <form onSubmit={handleSubmit}>
            <select value={logoSize} onChange={(e) => setLogoSize(e.target.value as 'small' | 'large')}>
                <option value="small">Small Logo</option>
                <option value="large">Large Logo</option>
            </select>
            {file ? (
                <div className="flex flex-col gap-4 p-12">
                    <img src={URL.createObjectURL(file)} alt="Uploaded" className="h-12 object-contain w-fit" />
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => setFile(null)}
                            disabled={uploading}
                        >
                            Remove
                        </Button>
                        <Button
                            type="submit"
                            disabled={uploading}
                        >
                            {uploading ? "Uploading..." : "Upload"}
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-4 p-12 w-96">
                    <Dropzone
                        accept={{ "image/*": [] }}
                        src={file ? [file] : []}
                        onDrop={handleDrop}
                        multiple={false}
                    >
                        <DropzoneEmptyState />
                        <DropzoneContent />
                    </Dropzone>
                </div>
            )}
            <Button type="button" variant="destructive" onClick={() => handleDeleteLogo(logoSize)} disabled={uploading}>
                {uploading ? "Deleting..." : `Delete ${logoSize === 'small' ? 'Small' : 'Large'} Logo`}
            </Button>
        </form>
    );
}