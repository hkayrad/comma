import { copyToClipboard } from "@/lib/utils";
import type { Column, Row } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

type Props = {
  row: Row<any>;
  column: Column<any, any>;
  currency: "TRY" | "USD" | "EUR";
  negative?: boolean;
};

export default function FormattedCurrency(props: Props) {
  const { row, column, currency = "TRY", negative = false } = props;
  const { t } = useTranslation();
  const rawValue = row.getValue(column.id);
  const value = parseFloat(rawValue) || 0;
  const formatted = value.toLocaleString("tr-TR", {
    style: "currency",
    currency: currency,
  });

  return (
    <p
      className="select-none hover:cursor-copy"
      onClick={() => copyToClipboard(formatted, t)}
    >
      {negative ? "-" : ""}
      {formatted}
    </p>
  );
}
