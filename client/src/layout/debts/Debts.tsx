import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type ColumnFiltersState, type SortingState } from "@tanstack/react-table";
import { toast } from "sonner";
import { ArrowUpDown, CalendarIcon, Check, ChevronsUpDown, FilterXIcon, Pencil, Plus, RefreshCcw, Trash2, TurkishLira } from "lucide-react";
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
import type { DebtDto } from "@/lib/types";

type DebtInfo = {
    id: string;
    customer_id: string;
    customer_name?: string;
    amount: string;
    invoice_no?: string;
    vat: string;
    currency: string;
    description?: string;
    issue_date: Date;
}

const DebtSchema = z.object({
    customer_id: z.string().min(1, { message: "Müşteri seçimi zorunludur" }),
    amount: z.string().min(0.01, { message: "Borç tutarı en az 0.01 olmalıdır" }),
    invoice_no: z.string().optional(),
    vat: z.string().min(0, { message: "KDV negatif olamaz" }),
    description: z.string().optional(),
    issue_date: z.date().refine((date) => !isNaN(date.getTime()), { message: "Geçersiz tarih formatı" })
})


export default function Debts() {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [data, setData] = useState<DebtInfo[]>([]);
    const [customers, setCustomers] = useState<{ id: string, name: string }[]>([]);
    const [totalDebt, setTotalDebt] = useState('');
    const [addFormTotal, setAddFormTotal] = useState('');
    const [editFormTotal, setEditFormTotal] = useState('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);

    const addForm = useForm<z.infer<typeof DebtSchema>>({
        resolver: zodResolver(DebtSchema),
        defaultValues: {
            customer_id: "",
            amount: "0",
            invoice_no: "",
            vat: "0",
            description: "",
            issue_date: new Date(),
        },
    })

    const editForm = useForm<z.infer<typeof DebtSchema>>({
        resolver: zodResolver(DebtSchema),
        defaultValues: {
            customer_id: "",
            amount: "0",
            invoice_no: "",
            vat: "0",
            description: "",
            issue_date: new Date(),
        },
    })

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

    const handleAddDebt = async () => {
        const isValid = await addForm.trigger();
        if (!isValid) {
            toast.error("Lütfen formu doğru şekilde doldurun", { duration: 2000 });
            return;
        }

        const values = addForm.getValues();

        const debt: DebtDto = {
            customer_id: values.customer_id,
            amount: parseFloat(values.amount),
            invoice_no: values.invoice_no || undefined,
            vat: parseFloat(values.vat),
            description: values.description || undefined,
            issue_date: new Date(values.issue_date.setHours(12)),
        }

        const response = await DebtsApi.Create(debt);

        if (response) {
            toast.success("Borç kaydı başarıyla eklendi", { duration: 2000 });
            setIsAddDialogOpen(false);
            addForm.reset();
            handleFetchDebts();
        } else {
            toast.error("Borç kaydı eklenemedi, lütfen tekrar deneyin", { duration: 2000 });
        }
    }

    const handleDeleteDebt = async (id: string) => {
        const response = await DebtsApi.Delete(id);

        if (response) {
            setData((prev) => prev.filter((debt) => debt.id !== id));
            toast.success("Borç kaydı başarıyla silindi", { duration: 2000 });
        } else {
            toast.error("Borç kaydı silinemedi, lütfen tekrar deneyin", { duration: 2000 });
        }
    }

    const handleEditDebt = async () => {
        const isValid = await editForm.trigger();

        if (!isValid)
            return toast.error("Lütfen formu doğru şekilde doldurun", { duration: 2000 });

        const values = editForm.getValues();

        const debt: DebtDto = {
            id: selectedDebtId!,
            customer_id: values.customer_id,
            amount: parseFloat(values.amount),
            invoice_no: values.invoice_no || "",
            vat: parseFloat(values.vat),
            description: values.description || "",
            issue_date: new Date(values.issue_date.setHours(12)), // to avoid timezone issues
        }

        const response = await DebtsApi.Update(debt);

        if (response) {
            toast.success("Borç kaydı başarıyla güncellendi", { duration: 2000 });
            setIsEditDialogOpen(false);
            editForm.reset();
            handleFetchDebts();
        } else {
            toast.error("Borç kaydı güncellenemedi, lütfen tekrar deneyin", { duration: 2000 });
        }
    }

    const openEditDialog = (id: string) => {
        editForm.reset();
        setSelectedDebtId(id);

        const debt = data.find((debt) => debt.id === id);
        editForm.setValue("customer_id", debt?.customer_id || "");
        editForm.setValue("amount", debt?.amount || "0");
        editForm.setValue("invoice_no", debt?.invoice_no || "");
        editForm.setValue("vat", debt?.vat || "0");
        editForm.setValue("description", debt?.description || "");
        editForm.setValue("issue_date", new Date(debt!.issue_date));

        setIsEditDialogOpen(true);
    }

    const closeEditDialog = () => {
        setIsEditDialogOpen(false);
        setSelectedDebtId(null);
        editForm.reset();
    }

    const columns: ColumnDef<DebtInfo>[] = [
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
                <div className="flex gap-2">
                    <Tooltip disableHoverableContent>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="select-none"
                                onClick={() => openEditDialog(row.original.id)}
                            >
                                <Pencil />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent vocab="tr" className="text-center">
                            <p>Borç Bilgilerini Düzenle</p>
                        </TooltipContent>
                    </Tooltip>
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
                                <Button variant="destructive" onClick={() => handleDeleteDebt(row.original.id)}>Borcu Sil</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )
        }
    ];

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

    useEffect(() => {
        handleFetchCustomers();
        handleFetchDebts();
    }, []);

    useEffect(() => {
        const total = parseFloat((addForm.getValues("amount") || 0) as unknown as string) + parseFloat((addForm.getValues("vat") || 0) as unknown as string);
        const formatted = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(total);
        setAddFormTotal(formatted);
    }, [addForm.watch("amount"), addForm.watch("vat")]);

    useEffect(() => {
        const total = parseFloat((editForm.getValues("amount") || 0) as unknown as string) + parseFloat((editForm.getValues("vat") || 0) as unknown as string);
        const formatted = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(total);
        setEditFormTotal(formatted);
    }, [editForm.watch("amount"), editForm.watch("vat")]);

    useEffect(() => {
        const totalDebtAmount = data.reduce((acc, debt) => acc + parseFloat(debt.amount) + parseFloat(debt.vat), 0);
        const formattedTotal = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalDebtAmount);
        setTotalDebt(formattedTotal);
    }, [data]);

    return (
        <div className="space-y-4 px-8 py-4">
            <Dialog open={isEditDialogOpen} onOpenChange={closeEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Borç Bilgilerini Düzenle</DialogTitle>
                        <DialogDescription>
                            Bu borç kaydını düzenlemek için aşağıdaki alanları güncelleyin.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...editForm}>
                        <form onSubmit={() => { }} className="space-y-4">
                            <FormField
                                control={editForm.control}
                                name="customer_id"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="gap-1">Müşteri <span className="text-red-500">*</span></FormLabel>
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
                                                                        addForm.setValue("customer_id", customer.id)
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
                                control={editForm.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col w-[462px]">
                                        <FormLabel className="gap-1">Tutar <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="number" className="truncate" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Borç tutarını girin.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={editForm.control}
                                name="vat"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col w-[462px]">
                                        <FormLabel className="gap-1">KDV Tutarı <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <div className="flex">
                                                <Input type="number" className="truncate" placeholder="0.00" {...field} />
                                                <Button type="button" variant="outline" className="ml-2" onClick={() => {
                                                    editForm.setValue("vat", (0.2 * (parseFloat(editForm.getValues("amount")) || 0)).toFixed(2).toString())
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
                                control={editForm.control}
                                name="issue_date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col w-[462px]">
                                        <FormLabel className="gap-1">Kesim Tarihi <span className="text-red-500">*</span></FormLabel>
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
                                control={editForm.control}
                                name="invoice_no"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col w-[462px]">
                                        <FormLabel>Fatura No</FormLabel>
                                        <FormControl>
                                            <Input type="text" className="truncate" placeholder="HKS000000000123" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Fatura numarasını girin (varsa).
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={editForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col w-[462px]">
                                        <FormLabel>Açıklama</FormLabel>
                                        <FormControl>
                                            <Input type="text" className="truncate" placeholder="Açıklama girin" {...field} />
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
                    <DialogFooter className="flex items-center w-[462px]">
                        <p className="mr-auto text-sm max-w-64 truncate">Toplam Tutar: <span>{editFormTotal}</span></p>
                        <DialogClose asChild>
                            <Button variant="destructive">İptal</Button>
                        </DialogClose>
                        <Button variant="default" className="bg-green-600" onClick={() => handleEditDebt()}>Kaydet</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="ml-auto select-none">
                            <Plus />
                            Borç Ekle
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Borç Ekle</DialogTitle>
                            <DialogDescription>
                                Bir müşteriye borç ekleyin.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...addForm}>
                            <form onSubmit={() => { }} className="space-y-4">
                                <FormField
                                    control={addForm.control}
                                    name="customer_id"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="gap-1">Müşteri <span className="text-red-500">*</span></FormLabel>
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
                                                                            addForm.setValue("customer_id", customer.id)
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
                                    control={addForm.control}
                                    name="amount"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col w-[462px]">
                                            <FormLabel className="gap-1">Tutar <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="number" className="truncate" placeholder="0.00" {...field} />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Borç tutarını girin.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={addForm.control}
                                    name="vat"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col w-[462px]">
                                            <FormLabel className="gap-1">KDV Tutarı <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <div className="flex">
                                                    <Input type="number" className="truncate" placeholder="0.00" {...field} />
                                                    <Button type="button" variant="outline" className="ml-2" onClick={() => {
                                                        addForm.setValue("vat", (0.2 * (parseFloat(addForm.getValues("amount")) || 0)).toFixed(2).toString())
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
                                    control={addForm.control}
                                    name="issue_date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col w-[462px]">
                                            <FormLabel className="gap-1">Kesim Tarihi <span className="text-red-500">*</span></FormLabel>
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
                                                        selected={new Date(field.value)}
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
                                    control={addForm.control}
                                    name="invoice_no"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col w-[462px]">
                                            <FormLabel>Fatura No</FormLabel>
                                            <FormControl>
                                                <Input type="text" className="truncate" placeholder="HKS000000000123" {...field} />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Fatura numarasını girin (varsa).
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={addForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col w-[462px]">
                                            <FormLabel>Açıklama</FormLabel>
                                            <FormControl>
                                                <Input type="text" className="truncate" placeholder="Açıklama girin" {...field} />
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
                        <DialogFooter className="flex items-center w-[462px]">
                            <p className="mr-auto text-sm max-w-64 truncate">Toplam Tutar: <span>{addFormTotal}</span></p>
                            <DialogClose asChild>
                                <Button variant="destructive" onClick={() => addForm.reset()}>İptal</Button>
                            </DialogClose>
                            <Button variant="default" className="bg-green-600" onClick={() => handleAddDebt()}>Borcu Kaydet</Button>
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
                    Önceki
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="select-none"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Sonraki
                </Button>
            </div>
        </div>
    );
}

