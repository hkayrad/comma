import type { AvailableCurrency } from "@/lib/types";
import { copyToClipboard } from "@/lib/utils";
import type { Column, Row } from "@tanstack/react-table";

type Props = {
  row: Row<any>;
  column: Column<any, any>;
  currency: AvailableCurrency;
};

export default function FormattedCurrency(props: Props) {
  const { row, column, currency = "TRY" } = props;
  const value = parseFloat(row.getValue(column.id));
  const formatted = value.toLocaleString("tr-TR", {
    style: "currency",
    currency: currency,
  });

  return (
    <p
      className="select-none hover:cursor-copy"
      onClick={() => copyToClipboard(formatted)}
    >
      {formatted}
    </p>
  );
}
