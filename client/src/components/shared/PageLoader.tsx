import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

export const PageLoader = ({ className }: { className?: string }) => (
  <div
    className={cn(
      "flex h-full w-full items-center justify-center p-4",
      className,
    )}
  >
    <Spinner className="size-8" />
  </div>
);
