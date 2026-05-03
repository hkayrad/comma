import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { useConfig } from "@/stores/useConfigStore";
import { useWebSocket } from "@/contexts/webSocket";
import { ConfigApi } from "@/lib/api/config";
import { Logger } from "@/lib/utils/logger";
import { Clock } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import CancelButton from "../CancelButton";

export default function MaintenanceDialog() {
  const configs = useConfig((s) => s.configs);
  const sendStartMaintenanceNotification = useWebSocket(
    (s) => s.sendStartMaintenanceNotification,
  );
  const sendEndMaintenanceNotification = useWebSocket(
    (s) => s.sendEndMaintenanceNotification,
  );
  const { t } = useTranslation();

  const [startTime, setStartTime] = useState<string>(() => {
    return new Date(Date.now() + 60000).toTimeString().slice(0, 5);
  });
  const [endTime, setEndTime] = useState<string>(() => {
    const DEFAULT_MAINTENANCE_DURATION = 300000; // 5 minute
    return new Date(Date.now() + DEFAULT_MAINTENANCE_DURATION)
      .toTimeString()
      .slice(0, 5);
  });

  const handleStartTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setStartTime(e.target.value);
    },
    [],
  );

  const handleEndTimeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEndTime(e.target.value);
    },
    [],
  );

  const handleEndMaintenance = useCallback(async () => {
    const promise = await ConfigApi.EndMaintenanceMode();
    toast.promise(promise, {
      loading: t("notification.admin.endMaintenance.pending"),
      success: () => {
        sendEndMaintenanceNotification();
        return t("notification.admin.endMaintenance.success");
      },
      error: t("notification.admin.endMaintenance.error"),
    });
  }, [sendEndMaintenanceNotification, t]);

  const handleStartMaintenance = useCallback(async () => {
    const promise = await ConfigApi.StartMaintenanceMode();
    toast.promise(promise, {
      loading: t("notification.admin.startMaintenance.pending"),
      success: () => {
        sendStartMaintenanceNotification(startTime, endTime);
        return t("notification.admin.startMaintenance.success");
      },
      error: t("notification.admin.startMaintenance.error"),
    });
    Logger.debug("MaintenanceDialog: Starting maintenance mode", {
      startTime,
      endTime,
    });
  }, [startTime, endTime, sendStartMaintenanceNotification, t]);

  return (
    <>
      {configs?.maintenanceMode === "active" ? (
        <div className="flex justify-end gap-2">
          <DialogClose
            render={(props) => (
              <Button {...props} variant="ghost">
                {t("vars.cancel")}
              </Button>
            )}
          ></DialogClose>
          <DialogClose
            render={(props) => (
              <Button
                {...props}
                className="bg-green-600"
                nativeButton
                onClick={handleEndMaintenance}
              >
                {t("dialog.maintenanceMode.end.button")}
              </Button>
            )}
          />
        </div>
      ) : (
        <div className="grid grid-cols-2">
          <div className="flex flex-col space-y-2 mr-4">
            <Label htmlFor="startTime" className="font-medium">
              {t("dialog.maintenanceMode.startTime")}
            </Label>
            <InputGroup>
              <InputGroupInput
                type="time"
                id="startTime"
                value={startTime}
                onChange={handleStartTimeChange}
                step={60}
                className="peer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
              <InputGroupAddon>
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="endTime" className="font-medium">
              {t("dialog.maintenanceMode.endTime")}
            </Label>
            <InputGroup>
              <InputGroupInput
                type="time"
                id="endTime"
                value={endTime}
                onChange={handleEndTimeChange}
                step={60}
                className="peer [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
              <InputGroupAddon>
                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </InputGroupAddon>
            </InputGroup>
          </div>
          <div className="col-span-2 flex justify-end mt-8 gap-2">
            <DialogClose render={(props) => <CancelButton {...props} />} />
            <DialogClose
              render={(props) => (
                <Button
                  {...props}
                  variant="destructive"
                  nativeButton
                  onClick={handleStartMaintenance}
                >
                  {t("dialog.maintenanceMode.start.button")}
                </Button>
              )}
            />
          </div>
        </div>
      )}{" "}
    </>
  );
}
