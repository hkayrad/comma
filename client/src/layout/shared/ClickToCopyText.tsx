import { copyToClipboard } from "@/lib/utils";
import type { Column } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

type Props = {
  value: any;
  column?: Column<any, any>;
  className?: string;
};

export default function ClickToCopyText(props: Props) {
  const { value, className = "", column } = props;
  const { t } = useTranslation();

  return (
    <p
      className={`select-none hover:cursor-copy
                ${column?.id === "name" && "w-36 text-ellipsis overflow-hidden"}
                ${column?.id === "customer_name" && "w-36 text-ellipsis overflow-hidden"}
                ${column?.id === "tax_office" && "w-36 text-ellipsis overflow-hidden"}
                ${column?.id === "description" && "w-36 text-ellipsis overflow-hidden"}
                ${column?.id === "invoice_number" && "w-36 text-ellipsis overflow-hidden"}
                ${className}
            `}
      onClick={() => copyToClipboard(value, t)}
    >
      {value}
    </p>
  );
}
