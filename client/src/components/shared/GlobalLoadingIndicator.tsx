import { useNavigation } from "react-router";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

export const GlobalLoadingIndicator = () => {
  const navigation = useNavigation();
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const [isVisible, setIsVisible] = useState(false);

  const isLoading = navigation.state === "loading" || isFetching > 0 || isMutating > 0;

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isLoading) {
      // Use a small delay to avoid synchronous state update in effect
      timeout = setTimeout(() => setIsVisible(true), 0);
    } else {
      timeout = setTimeout(() => setIsVisible(false), 300);
    }
    return () => clearTimeout(timeout);
  }, [isLoading]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ width: 0, opacity: 1 }}
          animate={{ 
            width: isLoading ? "90%" : "100%",
            opacity: 1,
            transition: { 
              width: { duration: isLoading ? 10 : 0.3, ease: "easeOut" },
              opacity: { duration: 0.2 }
            }
          }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="fixed top-0 left-0 z-[9999] h-0.5 bg-primary shadow-[0_0_10px_var(--color-primary)]"
        />
      )}
    </AnimatePresence>
  );
};
