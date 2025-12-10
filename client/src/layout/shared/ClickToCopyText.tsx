import { copyToClipboard } from "@/lib/utils";
import type { Column } from "@tanstack/react-table";

type Props = {
  value: any;
  column?: Column<any, any>;
  className?: string;
};

export default function ClickToCopyText(props: Props) {
  const { value, className = "", column } = props;

  return (
    <p
      className={`select-none hover:cursor-copy
                ${column?.id === "Müşteri" && "w-36 text-ellipsis overflow-hidden"}
                ${column?.id === "Vergi Dairesi" && "w-36 text-ellipsis overflow-hidden"}
                ${column?.id === "Açıklama" && "w-36 text-ellipsis overflow-hidden"}
                ${column?.id === "Fatura No" && "w-36 text-ellipsis overflow-hidden"}
                ${className}
            `}
      onClick={() => copyToClipboard(value)}
    >
      {value}
    </p>
  );
}
