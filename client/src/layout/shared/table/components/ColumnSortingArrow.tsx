import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

type Props = {
  column: Column<any, any>;
};

export default function ColumnSortingArrow(props: Props) {
  const { column } = props;

  return (
    <span className="ml-2 h-4 w-4">
      {column.getSortIndex() !== -1 ? (
        column.getIsSorted() === "desc" ? (
          <ArrowDown />
        ) : (
          <ArrowUp />
        )
      ) : (
        <ArrowUpDown />
      )}
    </span>
  );
}
