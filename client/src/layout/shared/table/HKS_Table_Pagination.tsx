import { Button } from "@/components/ui/button";
import type { Table } from "@tanstack/react-table";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
    table: Table<any>;
}

export default function HKS_Table_Pagination(props: Props) {
    const { table } = props;
    
    return (
        <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    className="select-none"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    <ChevronLeft />
                    Önceki
                </Button>
                <span className="text-sm">
                    Sayfa
                    <span className="font-medium mx-1">{table.getState().pagination.pageIndex + 1}</span>
                    / {table.getPageCount()}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    className="select-none"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Sonraki
                    <ChevronRight />
                </Button>
            </div>
    )
}