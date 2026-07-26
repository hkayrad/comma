import type { AuditLogDto } from "@comma/common";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

interface Props {
  log: AuditLogDto;
}

export default function AuditLogDetailsDialog({ log }: Props) {
  const { t } = useTranslation();

  const getActionBadge = (action: string) => {
    switch (action) {
      case "CREATE":
        return <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">CREATE</Badge>;
      case "UPDATE":
        return <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30">UPDATE</Badge>;
      case "DELETE":
        return <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30">DELETE</Badge>;
      case "RESTORE":
        return <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30">RESTORE</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  return (
    <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto p-1">
      <div className="grid grid-cols-2 gap-4 text-sm bg-muted/40 p-3 rounded-lg border border-border">
        <div>
          <span className="text-muted-foreground font-medium">{t("audit.field.action", { defaultValue: "İşlem" })}:</span>{" "}
          {getActionBadge(log.action)}
        </div>
        <div>
          <span className="text-muted-foreground font-medium">{t("audit.field.entity", { defaultValue: "Varlık Türü" })}:</span>{" "}
          <span className="font-semibold">{log.entity_type}</span>
        </div>
        <div>
          <span className="text-muted-foreground font-medium">{t("audit.field.entityId", { defaultValue: "Varlık ID" })}:</span>{" "}
          <span className="font-mono text-xs">{log.entity_id}</span>
        </div>
        <div>
          <span className="text-muted-foreground font-medium">{t("audit.field.date", { defaultValue: "Tarih" })}:</span>{" "}
          <span className="font-mono text-xs">{new Date(log.created_at).toLocaleString()}</span>
        </div>
        {log.ip_address && (
          <div>
            <span className="text-muted-foreground font-medium">IP:</span>{" "}
            <span className="font-mono text-xs">{log.ip_address}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {log.old_values && Object.keys(log.old_values).length > 0 && (
          <div className="flex flex-col gap-1.5">
            <h4 className="text-xs font-semibold text-rose-500 uppercase tracking-wider">
              {t("audit.values.old", { defaultValue: "Önceki Değerler (Old Values)" })}
            </h4>
            <pre className="p-3 rounded-md bg-rose-500/5 border border-rose-500/20 text-xs font-mono overflow-x-auto max-h-60">
              {JSON.stringify(log.old_values, null, 2)}
            </pre>
          </div>
        )}
        {log.new_values && Object.keys(log.new_values).length > 0 && (
          <div className="flex flex-col gap-1.5">
            <h4 className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
              {t("audit.values.new", { defaultValue: "Yeni Değerler (New Values)" })}
            </h4>
            <pre className="p-3 rounded-md bg-emerald-500/5 border border-emerald-500/20 text-xs font-mono overflow-x-auto max-h-60">
              {JSON.stringify(log.new_values, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
