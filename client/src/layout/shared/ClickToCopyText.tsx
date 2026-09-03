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
                ${column?.id === "name" && "max-w-full md:w-36 truncate"}
                ${column?.id === "customer_name" && "max-w-full md:w-36 truncate"}
                ${column?.id === "tax_office" && "max-w-full md:w-36 truncate"}
                ${column?.id === "description" && "max-w-full md:w-36 truncate"}
                ${column?.id === "invoice_number" && "max-w-full md:w-36 truncate"}
                ${className}
            `}
      onClick={() => copyToClipboard(value, t)}
    >
      {value}
    </p>
  );
}
