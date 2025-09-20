import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type ColumnFiltersState, type Row, type SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { ArrowUpDown, CalendarIcon, Check, ChevronsUpDown, FilterXIcon, Plus, RefreshCcw, Trash2, TurkishLira } from "lucide-react";
import { useEffect, useState } from "react";
import { DebtsApi } from "@/lib/api/debts";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CustomersApi } from "@/lib/api";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Command as CommandPrimitive, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { format } from "date-fns/format";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Debt = {
    id: number;
    customer_id: number;
    customer_name: string;
    amount: string;
    invoice_no: string | null;
    vat: string;
    currency: string;
    description: string | null;
    issue_date: string;
}

const handleDeleteDebt = async (row: Row<Debt>) => {
    // Implement debt deletion logic here
    toast.error("Borç silme işlemi henüz geliştirilmedi.", { duration: 2000 });
}

const columns: ColumnDef<Debt>[] = [
    {
        accessorKey: "index",
        header: () => <p className="select-none">#</p>,
        cell: ({ row }) => {
            return <p className="select-none">{row.index + 1}</p>
        }
    },
    {
        accessorKey: "customer_name",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="select-none"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Müşteri
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
    },
    {
        accessorKey: "amount",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="select-none"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Borç Tutarı
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const totalDebt = parseFloat(row.original.amount) + parseFloat(row.original.vat);
            const formatted = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalDebt);
            return formatted;
        }
    },
    {
        accessorKey: "issue_date",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="select-none"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Kesim Tarihi
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => {
            const date = new Date(row.original.issue_date);
            return date.toLocaleDateString('tr-TR');
        }
    },
    {
        accessorKey: "invoice_no",
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="select-none"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Fatura No
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            )
        },
        cell: ({ row }) => <p className="select-none">{row.original.invoice_no || "-"}</p>
    },
    {
        accessorKey: "description",
        header: () => <p className="select-none">Açıklama</p>,
        cell: ({ row }) => <p className="select-none">{row.original.description || "-"}</p>
    },
    {
        accessorKey: "actions",
        header: () => <p className="select-none">Eylemler</p>,
        cell: ({ row }) => (
            <Dialog>
                <Tooltip disableHoverableContent>
                    <DialogTrigger asChild>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="select-none">
                                <Trash2 className="text-red-500" />
                            </Button>
                        </TooltipTrigger>
                    </DialogTrigger>
                    <TooltipContent vocab="tr" className="text-center">
                        <p>Borcu Sil</p>
                    </TooltipContent>
                </Tooltip>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Bu borç kaydını silmek istediğinize emin misiniz?</DialogTitle>
                        <DialogDescription>
                            Bu işlem geri alınamaz. borç kaydı kalıcı olarak silinecektir.
                            Tekrar eklemek isterseniz, yeni bir borç kaydı oluşturmanız gerekecektir.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">İptal</Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={() => handleDeleteDebt(row)}>Faturayı Sil</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }
];

const AddDebtSchema = z.object({
    customer_id: z.number().min(1, { message: "Müşteri seçimi zorunludur" }),
    amount: z.number().min(0.01, { message: "Borç tutarı en az 0.01 olmalıdır" }),
    invoice_no: z.string().optional(),
    vat: z.number().min(0, { message: "KDV negatif olamaz" }),
    description: z.string().optional(),
    issue_date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Geçersiz tarih formatı" })
})


export default function Debts() {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [data, setData] = useState<Debt[]>([]);
    const [customers, setCustomers] = useState<{ id: number, name: string }[]>([]);
    const [totalDebt, setTotalDebt] = useState('');
    const [formTotal, setFormTotal] = useState('');

    const form = useForm<z.infer<typeof AddDebtSchema>>({
        resolver: zodResolver(AddDebtSchema),
    })

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

    const handleAddDebt = async () => {
        // Implement debt addition logic here
        console.log(form.getValues());

        toast.error("Borç ekleme işlemi henüz geliştirilmedi.", { duration: 2000 });
    }

    const handleFetchCustomers = async () => {
        try {
            const customers = await CustomersApi.GetCustomerNamesAndIds();
            setCustomers(customers);
            return Promise.resolve(true);
        } catch (error) {
            console.error(error);
            return Promise.reject(false);
        }
    }

    const handleFetchDebts = async () => {
        try {
            const debts = await DebtsApi.GetAll();
            setData(debts);
            return Promise.resolve(true);
        } catch (error) {
            console.error(error);
            return Promise.reject(false);
        }
    };

    useEffect(() => {
        handleFetchCustomers();
        handleFetchDebts();
    }, []);

    useEffect(() => {
        const total = parseFloat((form.getValues("amount") || 0) as unknown as string) + parseFloat((form.getValues("vat") || 0) as unknown as string);
        const formatted = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(total);
        setFormTotal(formatted);
    }, [form.watch("amount"), form.watch("vat")]);

    useEffect(() => {
        const totalDebtAmount = data.reduce((acc, debt) => acc + parseFloat(debt.amount) + parseFloat(debt.vat), 0);
        const formattedTotal = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalDebtAmount);
        setTotalDebt(formattedTotal);
    }, [data]);

    return (
        <div className="space-y-4 px-8 py-6">
            <div className="mb-12 flex justify-between items-center">
                <h1 className="text-4xl font-bold">Borç Bilgileri</h1>
                <Card className="w-72">
                    <CardHeader>
                        <CardDescription className="flex justify-between items-center gap-2">
                            <p className="">Toplam Kesilen Borç Tutarı</p>
                            <TurkishLira size={16} />
                        </CardDescription>
                        <CardTitle className="text-2xl font-bold">
                            {totalDebt}
                        </CardTitle>
                    </CardHeader>
                </Card>
            </div>
            <div className="flex justify-start gap-2">
                <Input
                    placeholder="İsim ile ara..."
                    value={(table.getColumn("customer_name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("customer_name")?.setFilterValue(event.target.value)
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
                <Dialog>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="ml-auto select-none">
                            <Plus />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Borç Ekle</DialogTitle>
                            <DialogDescription>
                                Bir müşteriye borç ekleyin.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={() => { }} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="customer_id"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Müşteri</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            className={cn(
                                                                "justify-between overflow-hidden w-[462px]",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            <p className="truncate text-left">
                                                                {field.value
                                                                    ? customers.find(
                                                                        (customer) => customer.id === field.value
                                                                    )?.name
                                                                    : "Müşteri seçin..."}
                                                            </p>
                                                            <ChevronsUpDown className="opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-full p-0">
                                                    <CommandPrimitive>
                                                        <CommandInput
                                                            placeholder="Ara..."
                                                            className="h-9 w-full overflow-hidden max-w-[462px]"
                                                        />
                                                        <CommandList>
                                                            <CommandEmpty>Müşteri bulunamadı.</CommandEmpty>
                                                            <CommandGroup>
                                                                {customers.map((customer) => (
                                                                    <CommandItem
                                                                        value={customer.name}
                                                                        key={customer.id}
                                                                        onSelect={() => {
                                                                            form.setValue("customer_id", customer.id)
                                                                        }}
                                                                    >
                                                                        {customer.name}
                                                                        <Check
                                                                            className={cn(
                                                                                "ml-auto",
                                                                                customer.id === field.value
                                                                                    ? "opacity-100"
                                                                                    : "opacity-0"
                                                                            )}
                                                                        />
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </CommandPrimitive>
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription className="text-xs">
                                                Bu, gösterge panelinde kullanılacak müşteri adıdır.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Tutar</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="0.00" {...field} />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Borç tutarını girin.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="vat"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>KDV Tutarı</FormLabel>
                                            <FormControl>
                                                <div className="flex">
                                                    <Input type="number" placeholder="0.00" {...field} />
                                                    <Button type="button" variant="outline" className="ml-2" onClick={() => {
                                                        form.setValue("vat", 0.2 * (form.getValues("amount") || 0))
                                                    }}>%20</Button>
                                                </div>
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                KDV tutarını girin.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="issue_date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Kesim Tarihi</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Bir tarih seçin</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value as any}
                                                        onSelect={field.onChange}
                                                        disabled={(date: Date) =>
                                                            date > new Date() || date < new Date("1900-01-01")
                                                        }
                                                        captionLayout="dropdown"
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription className="text-xs">
                                                Borç kesim tarihini seçin.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="invoice_no"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Fatura No</FormLabel>
                                            <FormControl>
                                                <Input type="text" placeholder="HKS000000000123" {...field} />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Fatura numarasını girin (varsa).
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Açıklama</FormLabel>
                                            <FormControl>
                                                <Input type="text" placeholder="Açıklama girin" {...field} />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Borç ile ilgili ek açıklamalar (varsa).
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                        <DialogFooter className="flex items-center">
                            <p className="mr-auto text-sm">Toplam Tutar: <span>{formTotal}</span></p>
                            <DialogClose asChild>
                                <Button variant="destructive">İptal</Button>
                            </DialogClose>
                            <Button variant="default" onClick={() => handleAddDebt()}>Borcu Kaydet</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Button
                    variant="default"
                    className="select-none"
                    onClick={() => {
                        const result = handleFetchDebts();
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
    );
}

