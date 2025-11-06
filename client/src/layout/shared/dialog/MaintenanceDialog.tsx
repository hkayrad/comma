import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConfig } from "@/contexts/ConfigContext";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { ConfigApi } from "@/lib/api/config";
import { Logger } from "@/lib/utils/logger";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export default function MaintenanceDialog() {
    const { configs } = useConfig();
    const { sendStartMaintenanceNotification, sendEndMaintenanceNotification } = useWebSocket();

    const DEFAULT_START_TIME = new Date(Date.now() + 60000).toTimeString().slice(0, 5);
    const DEFAULT_MAINTENANCE_DURATION = 300000; // 5 minute
    const DEFAULT_END_TIME = new Date(Date.now() + DEFAULT_MAINTENANCE_DURATION).toTimeString().slice(0, 5);

    const [startTime, setStartTime] = useState<string>(DEFAULT_START_TIME);
    const [endTime, setEndTime] = useState<string>(DEFAULT_END_TIME);

    const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartTime(e.target.value);
    };

    const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEndTime(e.target.value);
    };

    const handleEndMaintenance = async () => {
        const promise = await ConfigApi.EndMaintenanceMode();
        toast.promise(promise, {
            loading: "Bakım modu sonlandırılıyor...",
            success: () => {
                sendEndMaintenanceNotification();
                return "Bakım modu sonlandırıldı.";
            },
            error: "Bakım modu sonlandırılamadı.",
        });
    };

    const handleStartMaintenance = useCallback(async () => {
        const promise = await ConfigApi.StartMaintenanceMode();
        toast.promise(promise, {
            loading: "Bakım modu başlatılıyor...",
            success: () => {
                sendStartMaintenanceNotification(startTime, endTime);
                return "Bakım modu başlatıldı.";
            },
            error: "Bakım modu başlatılamadı.",
        });
        Logger.debug("MaintenanceDialog: Starting maintenance mode", { startTime, endTime });
    }, [startTime, endTime, sendStartMaintenanceNotification]);

    return (
        <>
            {
                configs?.maintenanceMode === "active" ? (
                    <div className="flex justify-end">
                        <DialogClose asChild>
                            <Button variant="ghost">İptal</Button>
                        </DialogClose>
                        <DialogClose asChild>
                            <Button className="bg-green-600" onClick={handleEndMaintenance}>Bakımı Bitir</Button>
                        </DialogClose>
                    </div>
                ) : (
                    <div className="grid grid-cols-2">
                        <div className="flex flex-col space-y-2 mr-4">
                            <Label htmlFor="startTime" className="font-medium">Başlangıç Zamanı</Label>
                            <Input
                                type="time"
                                id="startTime"
                                value={startTime}
                                onChange={handleStartTimeChange}
                                step={60}
                            />
                        </div>
                        <div className="flex flex-col space-y-2">
                            <Label htmlFor="endTime" className="font-medium">Bitiş Zamanı</Label>
                            <Input
                                type="time"
                                id="endTime"
                                value={endTime}
                                onChange={handleEndTimeChange}
                                step={60}
                            />
                        </div>
                        <div className="col-span-2 flex justify-end mt-8">
                            <DialogClose asChild>
                                <Button variant="ghost">İptal</Button>
                            </DialogClose>
                            <DialogClose asChild>
                                <Button variant="destructive" onClick={handleStartMaintenance}>Bakımı Başlat</Button>
                            </DialogClose>
                        </div>
                    </div>
                )
            } </>
    )
}