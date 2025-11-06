import { Button } from "@/components/ui/button";
import ColumnSortingArrow from "../components/ColumnSortingArrow";
import type { Column } from "@tanstack/react-table";

type Props = {
    column: Column<any, any>;
    title: string;
}

export default function SortableColumnHeader(props: Props) {
    const { column, title } = props;
    return (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            {title}
            <ColumnSortingArrow column={column} />
        </Button>
    )
}