import { useTheme } from "@/components/theme-provider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { SidebarHeader, useSidebar } from "@/components/animate-ui/components/radix/sidebar";
import { CompanyApi } from "@/lib/api/company";
import { Logger } from "@/lib/utils/logger";
import { CommaImage } from "@/components/shared/CommaImage";

export default function CommaSidebarHeader() {
  const location = useLocation();
  const { theme } = useTheme();
  const { state } = useSidebar();

  const [logoFilter, setLogoFilter] = useState("brightness(100) invert(0)");
  const [logos, setLogos] = useState<{
    smallLogo: string;
    largeLogo: string;
  }>({
    smallLogo: "",
    largeLogo: "",
  });
  const [cacheBuster, setCacheBuster] = useState<number>(() => Date.now());
  const logoSrc = useMemo(
    () => ({
      small: logos.smallLogo
        ? `${import.meta.env.VITE_API_URL}${logos.smallLogo}?t=${cacheBuster}`
        : "/icon.webp",
      large: logos.largeLogo
        ? `${import.meta.env.VITE_API_URL}${logos.largeLogo}?t=${cacheBuster}`
        : "/logo.webp",
    }),
    [logos.largeLogo, logos.smallLogo, cacheBuster],
  );

  const fetchLogos = useCallback(async () => {
    try {
      const response = await CompanyApi.GetLogos();
      if (response.success) {
        setLogos(response.data);
      }
    } catch (error) {
      Logger.error("Şirket logoları alınırken bir hata oluştu:", error);
    }
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      setLogoFilter("brightness(0) invert(1)");
    } else {
      setLogoFilter("brightness(1) invert(0)");
    }
  }, [theme]);

  useEffect(() => {
    fetchLogos();
    window.addEventListener("logo:refresh", fetchLogos);
    return () => {
      window.removeEventListener("logo:refresh", fetchLogos);
    };
  }, [fetchLogos]);

  useEffect(() => {
    const interval = setInterval(
      () => {
        setCacheBuster(Date.now());
      },
      4 * 60 * 60 * 1000,
    ); // 4 hours

    return () => clearInterval(interval);
  }, []);

  return (
    <SidebarHeader>
      <NavLink
        to="/"
        onClick={(e) => {
          if (location.pathname === "/") {
            e.preventDefault();
          }
        }}
        className="hover:scale-105 active:scale-100 transition-transform flex items-center justify-center w-full h-9"
      >
        <AnimatePresence mode="wait">
          {state === "collapsed" ? (
            <motion.div
              key="icon"
              className="h-full w-auto mx-auto"
              initial={{
                opacity: 0,
                x: 0,
                scale: 1.2,
                filter: `blur(4px) ${logoFilter}`,
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                filter: `blur(0px) ${logoFilter}`,
              }}
              exit={{
                opacity: 0,
                x: -30,
                scale: 0.8,
                filter: `blur(4px) ${logoFilter}`,
              }}
              transition={{
                duration: 0.25,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <CommaImage
                src={logoSrc.small}
                alt="Comma Logo"
                containerClassName="h-full w-auto bg-transparent"
                className="object-contain"
                loading="eager"
              />
            </motion.div>
          ) : (
            <motion.div
              key="logo"
              className="h-full w-auto mx-auto"
              initial={{
                opacity: 0,
                x: 0,
                scale: 1.2,
                filter: `blur(4px) ${logoFilter}`,
              }}
              animate={{
                opacity: 1,
                x: 0,
                scale: 1,
                filter: `blur(0px) ${logoFilter}`,
              }}
              exit={{
                opacity: 0,
                x: -30,
                scale: 0.8,
                filter: `blur(4px) ${logoFilter}`,
              }}
              transition={{
                duration: 0.25,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <CommaImage
                src={logoSrc.large}
                alt="Comma Logo"
                containerClassName="h-full w-auto bg-transparent"
                className="object-contain"
                loading="eager"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </NavLink>
    </SidebarHeader>
  );
}
