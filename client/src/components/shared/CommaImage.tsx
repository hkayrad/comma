import { cn } from "@/lib/utils";
import React, { useState } from "react";

interface CommaImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  avif?: string;
  webp?: string;
  fallbackSrc?: string;
  blurDataURL?: string;
  aspectRatio?: string | number;
  containerClassName?: string;
  fetchPriority?: "high" | "low" | "auto";
}

/**
 * CommaImage - An optimized image component for the Comma project.
 * Supports modern formats (AVIF, WebP), lazy loading, fetch priority,
 * and blur-up placeholders to improve LCP and prevent layout shifts.
 */
export const CommaImage = ({
  src,
  alt = "",
  className,
  containerClassName,
  avif,
  webp,
  fallbackSrc,
  blurDataURL,
  aspectRatio,
  fetchPriority,
  loading = "lazy",
  onLoad,
  onError,
  ...props
}: CommaImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const [prevSrc, setPrevSrc] = useState(src);
  const [prevAvif, setPrevAvif] = useState(avif);
  const [prevWebp, setPrevWebp] = useState(webp);

  if (src !== prevSrc || avif !== prevAvif || webp !== prevWebp) {
    setIsLoaded(false);
    setHasError(false);
    setPrevSrc(src);
    setPrevAvif(avif);
    setPrevWebp(webp);
  }

  const containerStyle: React.CSSProperties = {};
  if (aspectRatio) {
    containerStyle.aspectRatio = typeof aspectRatio === "number" ? `${aspectRatio}` : aspectRatio;
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted/10",
        containerClassName
      )}
      style={containerStyle}
    >
      {/* Blur placeholder */}
      {blurDataURL && !isLoaded && !hasError && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110"
          aria-hidden="true"
        />
      )}

      {/* Main Image with modern format support */}
      <picture>
        {avif && <source srcSet={avif} type="image/avif" />}
        {webp && <source srcSet={webp} type="image/webp" />}
        <img
          src={hasError ? fallbackSrc : src}
          alt={alt}
          loading={loading}
          fetchPriority={fetchPriority}
          onLoad={(e) => {
            setIsLoaded(true);
            onLoad?.(e);
          }}
          onError={(e) => {
            setHasError(true);
            onError?.(e);
          }}
          className={cn(
            "transition-opacity duration-500 ease-in-out",
            isLoaded ? "opacity-100" : "opacity-0",
            "w-full h-full object-cover",
            className
          )}
          {...props}
        />
      </picture>

      {/* Fallback when everything fails */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground text-xs text-center p-2">
          {alt || "Image not found"}
        </div>
      )}
    </div>
  );
};
