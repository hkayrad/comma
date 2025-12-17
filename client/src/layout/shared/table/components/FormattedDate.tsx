import { copyToClipboard } from "@/lib/utils";
import type { Column, Row } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";

type Props = {
  row: Row<any>;
  column: Column<any, any>;
};

export default function FormattedDate(props: Props) {
  const { row, column } = props;
  const { t } = useTranslation();
  const date = new Date(row.getValue(column.id));
  const formatted = date.toLocaleDateString("tr-TR");

  return (
    <p
      className="select-none hover:cursor-copy"
      onClick={() => copyToClipboard(formatted, t)}
    >
      {formatted}
    </p>
  );
}
