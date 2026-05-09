import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { useSidebar } from "@/components/animate-ui/components/radix/sidebar";

export const SyncStatus = () => {
  const { t } = useTranslation();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const { state } = useSidebar();
  
  const isSyncing = isFetching > 0 || isMutating > 0;

  return (
    <AnimatePresence>
      {isSyncing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground overflow-hidden"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          {state !== "collapsed" && (
            <span className="whitespace-nowrap truncate">
              {t("sidebar.footer.syncing")}
            </span>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
