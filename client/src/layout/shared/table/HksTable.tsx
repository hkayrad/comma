import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type ColumnFiltersState, type SortingState, type VisibilityState } from "@tanstack/react-table";
import HksTablePagination from "./components/HksTablePagination";
import HksTableHeader from "./components/HksTableHeader";

type Props = {
    data: any[];
    columns: ColumnDef<any>[];
    searchColumn: string;
}

export default function HksTable(props: Props) {
    const { data, columns, searchColumn } = props;

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
        "Mersis No": false,
    });

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        }
    });

    return (
        <div>
            <HksTableHeader table={table} searchColumn={searchColumn} />
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader className="select-none">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:!bg-white">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead
                                            key={header.id}
                                            className={`
                                                ${(header.id === "Müşteri") && "w-64"}
                                                ${(header.id === "Vergi Dairesi" && "w-36")}
                                                ${header.id === "İşlemler" && "w-fit"} 
                                                ${(header.id === "Borç Durumu" || header.id === "Tür") && "w-32"} 
                                                `}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="font-light"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className={`
                                            ${(cell.column.id === "Müşteri") && "w-64 overflow-hidden"}
                                            ${(cell.column.id === "Vergi Dairesi" && "w-36 overflow-hidden")}
                                            
                                            `}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <HksTablePagination table={table} />
        </div>
    )
}