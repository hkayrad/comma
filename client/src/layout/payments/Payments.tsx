import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Command as CommandPrimitive, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { DialogClose, DialogDescription, DialogFooter, DialogHeader, Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CustomersApi, PaymentsApi } from "@/lib/api";
import type { PaymentDto } from "@/lib/types";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type ColumnFiltersState, type SortingState } from "@tanstack/react-table";
import { format } from "date-fns/format";
import { ArrowUpDown, CalendarIcon, Check, ChevronsUpDown, FilterXIcon, Pencil, Plus, RefreshCcw, Trash2, TurkishLira } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const PaymentMethods = {
    'bank_transfer': "Havale",
    'cash': "Nakit",
    'credit_card': "Kredi Kartı",
    'check': "Çek",
}

type PaymentInfo = {
    id: string;
    customer_id: string;
    invoice_no?: string;
    amount: string;
    payment_date: Date;
    payment_note?: string;
    payment_method: string;
    created_at: Date;
}

const PaymentSchema = z.object({
    customer_id: z.string().min(1, "Müşteri seçimi zorunludur."),
    amount: z.string().min(1, "Tutar zorunludur."),
    payment_date: z.date().refine((date) => !isNaN(date.getTime()), { message: "Geçersiz tarih formatı" }),
    invoice_no: z.string().optional(),
    payment_note: z.string().optional(),
    payment_method: z.string().min(1, "Ödeme yöntemi seçimi zorunludur."),
})

export default function Payments() {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [data, setData] = useState<PaymentInfo[]>([])
    const [customers, setCustomers] = useState<{ id: string, name: string }[]>([]);
    const [totalPayment, setTotalPayment] = useState<string>('');
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);

    const addForm = useForm<z.infer<typeof PaymentSchema>>({
        resolver: zodResolver(PaymentSchema),
        defaultValues: {
            customer_id: "",
            amount: "0",
            invoice_no: "",
            payment_date: new Date(),
            payment_note: "",
            payment_method: "",
        },
    })

    const editForm = useForm<z.infer<typeof PaymentSchema>>({
        resolver: zodResolver(PaymentSchema),
        defaultValues: {
            customer_id: "",
            amount: "0",
            invoice_no: "",
            payment_date: new Date(),
            payment_note: "",
            payment_method: "bank_transfer",
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

    const handleFetchPayments = async () => {
        try {
            const payments = await PaymentsApi.GetAll();
            setData(payments);
            return Promise.resolve(true);
        } catch (error) {
            console.error(error);
            return Promise.reject(false);
        }
    };

    const handleAddPayment = async () => {
        const isValid = await addForm.trigger();
        if (!isValid) {
            toast.error("Lütfen formu doğru şekilde doldurun", { duration: 2000 });
            return;
        }

        const values = addForm.getValues();

        const payment: PaymentDto = {
            customer_id: values.customer_id,
            amount: parseFloat(values.amount),
            invoice_no: values.invoice_no || "",
            payment_date: new Date(values.payment_date.setHours(12)),
            payment_note: values.payment_note || "",
            payment_method: values.payment_method,
        }

        const response = await PaymentsApi.Create(payment);

        if (response) {
            toast.success("Ödeme kaydı başarıyla eklendi", { duration: 2000 });
            setIsAddDialogOpen(false);
            addForm.reset();
            handleFetchPayments();
        } else {
            toast.error("Ödeme kaydı eklenemedi, lütfen tekrar deneyin", { duration: 2000 });
        }
    }

    const handleDeletePayment = async (id: string) => {
        const response = await PaymentsApi.Delete(id);

        if (response) {
            setData((prev) => prev.filter((payment) => payment.id !== id));
            toast.success("Ödeme kaydı başarıyla silindi", { duration: 2000 });
        } else {
            toast.error("Ödeme kaydı silinemedi, lütfen tekrar deneyin", { duration: 2000 });
        }
    }

    const handleEditPayment = async () => {
        const isValid = await editForm.trigger();

        if (!isValid)
            return toast.error("Lütfen formu doğru şekilde doldurun", { duration: 2000 });

        const values = editForm.getValues();

        const payment: PaymentDto = {
            id: selectedPaymentId!,
            customer_id: values.customer_id,
            amount: parseFloat(values.amount),
            invoice_no: values.invoice_no,
            payment_date: new Date(values.payment_date.setHours(12)),
            payment_note: values.payment_note,
            payment_method: values.payment_method,
        }

        const response = await PaymentsApi.Update(payment);

        if (response) {
            toast.success("Ödeme kaydı başarıyla güncellendi", { duration: 2000 });
            setIsEditDialogOpen(false);
            editForm.reset();
            handleFetchPayments();
        } else {
            toast.error("Ödeme kaydı güncellenemedi, lütfen tekrar deneyin", { duration: 2000 });
        }
    }

    const openEditDialog = (id: string) => {
        editForm.reset();
        setSelectedPaymentId(id);

        const payment = data.find((payment) => payment.id === id);
        editForm.setValue("customer_id", payment?.customer_id || "");
        editForm.setValue("amount", payment?.amount.toString() || "0");
        editForm.setValue("invoice_no", payment?.invoice_no || "");
        editForm.setValue("payment_date", payment!.payment_date);
        editForm.setValue("payment_note", payment?.payment_note || "");
        editForm.setValue("payment_method", payment?.payment_method || "");

        setIsEditDialogOpen(true);
    }

    const closeEditDialog = () => {
        setIsEditDialogOpen(false);
        setSelectedPaymentId(null);
        editForm.reset();
    }

    const columns: ColumnDef<PaymentInfo>[] = [
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
                        Ödeme Tutarı
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                )
            },
            cell: ({ row }) => {
                const totalDebt = parseFloat(row.original.amount);
                const formatted = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalDebt);
                return formatted;
            }
        },
        {
            accessorKey: "payment_method",
            header: "Ödeme Yöntemi",
            cell: ({ row }) => {
                return PaymentMethods[row.original.payment_method as keyof typeof PaymentMethods];
            }
        },
        {
            accessorKey: "payment_date",
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
                const date = new Date(row.original.payment_date);
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
            accessorKey: "payment_note",
            header: () => <p className="select-none">Açıklama</p>,
            cell: ({ row }) => <p className="select-none">{row.original.payment_note || "-"}</p>
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
                            <p>Ödeme Bilgilerini Düzenle</p>
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
                                <p>Ödemeyi Sil</p>
                            </TooltipContent>
                        </Tooltip>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Bu ödeme kaydını silmek istediğinize emin misiniz?</DialogTitle>
                                <DialogDescription>
                                    Bu işlem geri alınamaz. ödeme kaydı kalıcı olarak silinecektir.
                                    Tekrar eklemek isterseniz, yeni bir ödeme kaydı oluşturmanız gerekecektir.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="outline">İptal</Button>
                                </DialogClose>
                                <Button variant="destructive" onClick={() => handleDeletePayment(row.original.id)}>Ödemeyi Sil</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            )
        }
    ]

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
        handleFetchPayments();
    }, []);

    useEffect(() => {
        const totalPaymentAmount = data.reduce((acc, payment) => acc + parseFloat(payment.amount), 0);
        const formattedTotal = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalPaymentAmount);
        setTotalPayment(formattedTotal);
    }, [data]);

    return (
        <div className="space-y-4 px-8 py-4">
            <Dialog open={isEditDialogOpen} onOpenChange={closeEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ödeme Bilgilerini Düzenle</DialogTitle>
                        <DialogDescription>
                            Bu ödeme kaydını düzenlemek için aşağıdaki alanları güncelleyin.
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
                                            Ödeme tutarını girin.
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
                                        <FormLabel className="gap-1">Fatura No </FormLabel>
                                        <FormControl>
                                            <Input type="text" className="truncate" placeholder="Fatura No" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Fatura numarasını girin.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={editForm.control}
                                name="payment_date"
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
                                            Ödeme tarihini seçin.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={editForm.control}
                                name="payment_note"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col w-[462px]">
                                        <FormLabel>Açıklama</FormLabel>
                                        <FormControl>
                                            <Input type="text" className="truncate" placeholder="Açıklama girin" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Ödeme ile ilgili ek açıklamalar (varsa).
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={editForm.control}
                                name="payment_method"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <Select onValueChange={(value) => {
                                            field.onChange(value)
                                        }} defaultValue={field.value}>
                                            <FormLabel className="gap-1">Ödeme Yöntemi <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Ödeme Yöntemi Seçin" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Ödeme Yöntemi</SelectLabel>
                                                    <SelectItem value="bank_transfer">Havale</SelectItem>
                                                    <SelectItem value="cash">Nakit</SelectItem>
                                                    <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                                                    <SelectItem value="check">Çek</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription className="text-xs">
                                            Ödeme yöntemini seçin.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                    <DialogFooter className="flex items-center w-[462px]">
                        <DialogClose asChild>
                            <Button variant="destructive" onClick={() => editForm.reset()}>İptal</Button>
                        </DialogClose>
                        <Button variant="default" className="bg-green-600" onClick={() => handleEditPayment()}>Ödemeyi Kaydet</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <div className="mb-12 flex justify-between items-center">
                <h1 className="text-4xl font-bold">Ödeme Bilgileri</h1>
                <Card className="w-72">
                    <CardHeader>
                        <CardDescription className="flex justify-between items-center gap-2">
                            <p className="">Toplam Yapılan Ödeme Tutarı</p>
                            <TurkishLira size={16} />
                        </CardDescription>
                        <CardTitle className="text-2xl font-bold">
                            {totalPayment}
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
                            Ödeme Ekle
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ödeme Ekle</DialogTitle>
                            <DialogDescription>
                                Bir müşteriye ödeme ekleyin.
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
                                                Ödeme tutarını girin.
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
                                            <FormLabel className="gap-1">Fatura No </FormLabel>
                                            <FormControl>
                                                <Input type="text" className="truncate" placeholder="Fatura No" {...field} />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Fatura numarasını girin.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={addForm.control}
                                    name="payment_date"
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
                                                Ödeme tarihini seçin.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={addForm.control}
                                    name="payment_note"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col w-[462px]">
                                            <FormLabel>Açıklama</FormLabel>
                                            <FormControl>
                                                <Input type="text" className="truncate" placeholder="Açıklama girin" {...field} />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Ödeme ile ilgili ek açıklamalar (varsa).
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={addForm.control}
                                    name="payment_method"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <Select onValueChange={(value) => {
                                                field.onChange(value)
                                            }} defaultValue={field.value}>
                                                <FormLabel className="gap-1">Ödeme Yöntemi <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Ödeme Yöntemi Seçin" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Ödeme Yöntemi</SelectLabel>
                                                        <SelectItem value="bank_transfer">Havale</SelectItem>
                                                        <SelectItem value="cash">Nakit</SelectItem>
                                                        <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                                                        <SelectItem value="check">Çek</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription className="text-xs">
                                                Ödeme yöntemini seçin.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                        <DialogFooter className="flex items-center w-[462px]">
                            <DialogClose asChild>
                                <Button variant="destructive" onClick={() => addForm.reset()}>İptal</Button>
                            </DialogClose>
                            <Button variant="default" className="bg-green-600" onClick={() => handleAddPayment()}>Ödemeyi Kaydet</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Button
                    variant="default"
                    className="select-none"
                    onClick={() => {
                        const result = handleFetchPayments();
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
    )
}