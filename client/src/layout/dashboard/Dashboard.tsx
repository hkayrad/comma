import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CustomersApi } from "@/lib/api";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type ColumnFiltersState, type SortingState } from "@tanstack/react-table";
import { ArrowRightFromLine, ArrowUpDown, Check, ClipboardIcon, FilterXIcon, Receipt, ReceiptTurkishLira, RefreshCcw, TurkishLira } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type CompanyInfo = {
    id: string;
    name: string;
    phone: string | null;
    is_company: number;
    tax_number: string | null;
    email: string | null;
    address: string | null;
    total_debt: string;
    total_vat: string;
    total_payment: string;
}

const handleCopyToClipboard = (row: any) => {
    const totalDebt = parseFloat(row.original.total_debt) + parseFloat(row.original.total_vat) - parseFloat(row.original.total_payment);
    const formatted = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalDebt);

    if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        navigator.clipboard.writeText(formatted)
            .then(() => {
                toast.success("Güncel borç kopyalandı", { duration: 2000 });
            })
            .catch(() => {
                toast.error("Güncel borç kopyalanamadı", { duration: 2000 });
            });
    } else {
        toast.error("Kopyalama desteklenmiyor", { duration: 2000 });
    }
}

const columns: ColumnDef<CompanyInfo>[] = [
    {
        accessorKey: "index",
        header: () => <p className="select-none">#</p>,
        cell: ({ row }) => {
            return <p className="select-none">{row.index + 1}</p>
        }
    },
    {
        accessorKey: "name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="select-none"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    İsim
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "tax_number",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="select-none"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Vergi Numarası
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => row.original.tax_number ?? "-"
    },
    {
        accessorKey: "total_debt",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="select-none"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Toplam Borç
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const totalDebt = parseFloat(row.original.total_debt) + parseFloat(row.original.total_vat);
            const formatted = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalDebt);
            return formatted;
        }
    },
    {
        accessorKey: "total_payment",
        header: () => <p className="select-none">Ödenmiş Borç</p>,
        cell: ({ row }) => {
            const totalDebt = parseFloat(row.original.total_payment);
            const formatted = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalDebt);
            return formatted;
        }
    },
    {
        accessorKey: "current_debt",
        header: () => <p className="select-none">Güncel Borç</p>,
        cell: ({ row }) => {
            const totalDebt = parseFloat(row.original.total_debt) + parseFloat(row.original.total_vat) - parseFloat(row.original.total_payment);
            const formatted = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalDebt);
            return formatted;
        }
    },
    {
        accessorKey: "has_debt",
        header: () => <p className="select-none">Durum</p>,
        cell: ({ row }) => ((parseFloat(row.original.total_debt) + parseFloat(row.original.total_vat) - parseFloat(row.original.total_payment)) > 0 ?
            <Badge variant="destructive" className="text-white select-none">Borçlu</Badge> :
            <Badge variant="default" className="bg-green-600 select-none">Borcu Yok</Badge>
        )
    },
    {
        accessorKey: "actions",
        header: () => <p className="select-none">Eylemler</p>,
        cell: ({ row }) => (
            <>
                <Tooltip disableHoverableContent>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="select-none"
                            onClick={() => {
                                handleCopyToClipboard(row);
                            }}>
                            <ClipboardIcon />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent vocab="tr" className="text-center">
                        <p>Güncel Borcu Kopyala</p>
                    </TooltipContent>
                </Tooltip>
                <Tooltip disableHoverableContent>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="select-none"
                            onClick={() => {
                                toast.error("Bu özellik henüz geliştirilmedi.", { duration: 2000 });
                            }}>
                            <ArrowRightFromLine />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent vocab="tr" className="text-center">
                        <p>Borç Dökümü Oluştur</p>
                    </TooltipContent>
                </Tooltip>
            </>
        )
    }
];

export default function Dashboard() {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [data, setData] = useState<CompanyInfo[]>([]);
    const [currentDebt, setCurrentDebt] = useState<number>(0);
    const [totalDebt, setTotalDebt] = useState<number>(0);
    const [paidDebt, setPaidDebt] = useState<number>(0);

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        state: {
            sorting,
            columnFilters,
        },

    });

    const handleFetchCustomers = async () => {
        try {
            const customers = await CustomersApi.GetAll();
            setData(customers);
            return Promise.resolve(true);
        } catch (error) {
            console.error(error);
            return Promise.reject(false);
        }
    };

    useEffect(() => {
        handleFetchCustomers();
    }, []);

    useEffect(() => {
        const totalDebt = data.reduce((acc, customer) =>
            acc + (
                parseFloat(customer.total_debt) +
                parseFloat(customer.total_vat)
            ), 0);
        const paidDebt = data.reduce((acc, customer) =>
            acc + parseFloat(customer.total_payment), 0);
        const currentDebt = data.reduce((acc, customer) =>
            acc + (
                parseFloat(customer.total_debt) +
                parseFloat(customer.total_vat) -
                parseFloat(customer.total_payment)
            ), 0);

        setTotalDebt(totalDebt);
        setPaidDebt(paidDebt);
        setCurrentDebt(currentDebt);
    }, [data]);

    return (
        <div className="space-y-4 px-8 py-6">
            <div className="mb-12 flex justify-between items-center">
                <h1 className="text-4xl font-bold">Anasayfa</h1>
                <div className="flex items-center gap-4">
                    <Card className="w-72">
                        <CardHeader>
                            <CardDescription className="flex justify-between items-center gap-2">
                                <p className="">Toplam Kesilen Borç Tutarı</p>
                                <ReceiptTurkishLira size={16} />
                            </CardDescription>
                            <CardTitle className="text-2xl font-bold">
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalDebt)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="w-64">
                        <CardHeader>
                            <CardDescription className="flex justify-between items-center gap-2">
                                <p className="">Ödenmiş Borç</p>
                                <Check size={16} />
                            </CardDescription>
                            <CardTitle className="text-2xl font-bold">
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(paidDebt)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="w-64">
                        <CardHeader>
                            <CardDescription className="flex justify-between items-center gap-2">
                                <p className="">Toplam Güncel Borç</p>
                                <TurkishLira size={16} />
                            </CardDescription>
                            <CardTitle className="text-2xl font-bold">
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(currentDebt)}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>
            </div>
            <div className="flex justify-start gap-2">
                <Input
                    placeholder="İsim ile ara..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="max-w-64"
                />
                <Button
                    variant="ghost"
                    className="select-none"
                    onClick={() => {
                        table.resetColumnFilters();
                        toast.success("Filtreler temizlendi", { duration: 2000 });
                    }}>
                    <FilterXIcon />
                    Filtreyi Temizle
                </Button>
                <Button
                    variant="ghost"
                    className="select-none"
                    onClick={() => {
                        table.resetSorting();
                        toast.success("Sıralama sıfırlandı", { duration: 2000 });
                    }}>
                    <ArrowUpDown />
                    Sıralamayı Sıfırla
                </Button>
                <Button
                    variant="default"
                    className="ml-auto select-none"
                    onClick={() => {
                        const result = handleFetchCustomers();
                        toast.promise(result, {
                            loading: "Yenileniyor...",
                            success: "Yenileme başarılı!",
                            error: "Yenileme başarısız, lütfen tekrar deneyin"
                        });
                    }}>
                    <RefreshCcw />
                    Yenile
                </Button>
            </div>
            <div className="border border-accent rounded-lg h-[532px]">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="font-light">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    className="select-none"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="select-none"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}