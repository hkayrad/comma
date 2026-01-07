import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { useTranslation } from "react-i18next";

export default function CancelButton({
  onClick,
  ...props
}: {
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  props?: any;
}) {
  const { t } = useTranslation();
  return (
    <Button onClick={onClick} {...props} nativeButton variant="outline">
      {t("vars.cancel")} <Kbd>Esc</Kbd>
    </Button>
  );
}
