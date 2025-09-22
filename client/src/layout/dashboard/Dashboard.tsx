import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CustomersApi } from "@/lib/api";
import type { CustomerDto } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, type ColumnDef, type ColumnFiltersState, type SortingState } from "@tanstack/react-table";
import { ArrowUpDown, Check, Eye, FilterXIcon, Pencil, Plus, ReceiptTurkishLira, RefreshCcw, Trash2, TurkishLira } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

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

const AddCustomerSchema = z.object({
    name: z.string().min(1, { message: "Müşteri adı zorunludur" }).max(255, { message: "Müşteri adı en fazla 255 karakter olabilir" }),
    phone: z.string().optional(),
    is_company: z.number(),
    tax_number: z.string().optional(),
    email: z.email({ message: "Geçersiz email adresi" }).optional(),
    address: z.string().optional()
})

export default function Dashboard() {
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [data, setData] = useState<CompanyInfo[]>([]);
    const [currentDebt, setCurrentDebt] = useState<number>(0);
    const [totalDebt, setTotalDebt] = useState<number>(0);
    const [paidDebt, setPaidDebt] = useState<number>(0);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

    const addForm = useForm<z.infer<typeof AddCustomerSchema>>({
        resolver: zodResolver(AddCustomerSchema),
        defaultValues: {
            name: "",
            phone: "",
            address: "",
            tax_number: "",
            is_company: 1,
        },
    })

    const editForm = useForm<z.infer<typeof AddCustomerSchema>>({
        resolver: zodResolver(AddCustomerSchema),
        defaultValues: {
            name: "",
            phone: "",
            address: "",
            tax_number: "",
            is_company: 1,
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

    const handleAddCustomer = async () => {
        const isValid = await addForm.trigger();
        if (!isValid) {
            toast.error("Lütfen formu doğru şekilde doldurun", { duration: 2000 });
            return;
        }

        const values = addForm.getValues();

        const customer: CustomerDto = {
            name: values.name,
            phone: values.phone || "",
            is_company: values.is_company || 0,
            tax_number: values.tax_number || "",
            email: values.email || "",
            address: values.address || ""
        }

        const response = await CustomersApi.Create(customer);

        if (response) {
            toast.success("Müşteri başarıyla eklendi", { duration: 2000 });
            setIsAddDialogOpen(false);
            addForm.reset();
            handleFetchCustomers();
        } else {
            toast.error("Müşteri eklenemedi, lütfen tekrar deneyin", { duration: 2000 });
        }
    }

    const handleDeleteCustomer = async (id: string) => {
        const response = await CustomersApi.Delete(id);

        if (response) {
            toast.success("Müşteri başarıyla silindi", { duration: 2000 });
            handleFetchCustomers();
        } else {
            toast.error("Müşteri silinemedi, lütfen tekrar deneyin", { duration: 2000 });
        }
    }

    const handleEditCustomer = async () => {
        const isValid = await editForm.trigger();

        if (!isValid)
            return toast.error("Lütfen formu doğru şekilde doldurun", { duration: 2000 });

        const values = editForm.getValues();

        const customer: CustomerDto = {
            id: selectedCustomerId!,
            name: values.name,
            phone: values.phone || "",
            is_company: values.is_company,
            tax_number: values.tax_number || "",
            email: values.email || "",
            address: values.address || ""
        }

        const response = await CustomersApi.Update(customer);

        if (response) {
            toast.success("Müşteri başarıyla güncellendi", { duration: 2000 });
            setIsEditDialogOpen(false);
            editForm.reset();
            handleFetchCustomers();
        } else {
            toast.error("Müşteri güncellenemedi, lütfen tekrar deneyin", { duration: 2000 });
        }
    }

    const openEditDialog = (id: string) => {
        editForm.reset();
        setSelectedCustomerId(id);

        const customer = data.find(c => c.id === id);
        editForm.setValue("name", customer?.name || "");
        editForm.setValue("phone", customer?.phone || "");
        editForm.setValue("address", customer?.address || "");
        editForm.setValue("tax_number", customer?.tax_number || "");
        editForm.setValue("is_company", customer!.is_company!);

        setIsEditDialogOpen(true);
    }

    const closeEditDialog = () => {
        setIsEditDialogOpen(false);
        setSelectedCustomerId(null);
        editForm.reset();
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
                <div className="flex gap-2">
                    <Dialog>
                        <Tooltip disableHoverableContent>
                            <DialogTrigger asChild>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="select-none"
                                    >
                                        <Eye />
                                    </Button>
                                </TooltipTrigger>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{row.original.name}</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-2 py-4">
                                    <div className="flex gap-2">
                                        <p className="text-sm text-gray-500">Müşteri Türü: </p>
                                        <p className="text-sm">{row.original.is_company ? "Şirket" : "Bireysel"}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <p className="text-sm text-gray-500">Vergi Numarası: </p>
                                        <p className="text-sm">{row.original.tax_number ?? "-"}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <p className="text-sm text-gray-500">Email: </p>
                                        <p className="text-sm">{row.original.email ?? "-"}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <p className="text-sm text-gray-500">Telefon: </p>
                                        <p className="text-sm">{row.original.phone ?? "-"}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <p className="text-sm text-gray-500">Adres: </p>
                                        <p className="text-sm">{row.original.address ?? "-"}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <p className="text-sm text-gray-500">Toplam Borç: </p>
                                        <p className="text-sm">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(parseFloat(row.original.total_debt) + parseFloat(row.original.total_vat))}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <p className="text-sm text-gray-500">Ödenmiş Borç: </p>
                                        <p className="text-sm">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(parseFloat(row.original.total_payment))}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <p className="text-sm text-gray-500">Güncel Borç: </p>
                                        <p className="text-sm">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(parseFloat(row.original.total_debt) + parseFloat(row.original.total_vat) - parseFloat(row.original.total_payment))}</p>
                                    </div>
                                </div>
                                <DialogFooter className="flex items-center">
                                    <DialogClose asChild>
                                        <Button variant="outline" onClick={() => { }}>Kapat</Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                            <TooltipContent vocab="tr" className="text-center">
                                <p>Müşteri Bilgilerini Görüntüle</p>
                            </TooltipContent>
                        </Tooltip>
                    </Dialog>
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
                            <p>Müşteri Bilgilerini Düzenle</p>
                        </TooltipContent>
                    </Tooltip>
                    <Dialog>
                        <Tooltip disableHoverableContent>
                            <DialogTrigger asChild>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="select-none text-red-500 hover:bg-red-500 hover:!text-white"
                                    >
                                        <Trash2 />
                                    </Button>
                                </TooltipTrigger>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Müşteriyi Sil</DialogTitle>
                                    <DialogDescription>
                                        Bu işlem geri alınamaz. "{row.original.name}" adlı müşteriyi silmek istediğinize emin misiniz?
                                    </DialogDescription>
                                </DialogHeader>
                                <DialogFooter className="flex items-center">
                                    <DialogClose asChild>
                                        <Button variant="outline" onClick={() => { }}>İptal</Button>
                                    </DialogClose>
                                    <Button variant="destructive" className="bg-red-600" onClick={() => handleDeleteCustomer(row.original.id)}>Müşteriyi Sil</Button>
                                </DialogFooter>
                            </DialogContent>
                            <TooltipContent vocab="tr" className="text-center">
                                <p>Müşteriyi Sil</p>
                            </TooltipContent>
                        </Tooltip>
                    </Dialog>
                </div >
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
        <div className="space-y-4 px-8 py-4">
            <Dialog open={isEditDialogOpen} onOpenChange={closeEditDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Müşteri Bilgilerini Düzenle</DialogTitle>
                        <DialogDescription>
                            "{editForm.getValues("name")}" adlı müşterinin bilgilerini düzenleyin.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...editForm}>
                        <form onSubmit={() => { }} className="space-y-4">
                            <FormField
                                control={editForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="gap-1">Müşteri Adı <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="text" placeholder="Müşteri Adı" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Müşteri adını girin.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={editForm.control}
                                name="is_company"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                                            <FormLabel className="gap-1">Müşteri Türü <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Müşteri Türü Seçin" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Müşteri Türü</SelectLabel>
                                                    <SelectItem value="1">Şirket</SelectItem>
                                                    <SelectItem value="0">Bireysel</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription className="text-xs">
                                            Müşteri türünü seçin.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={editForm.control}
                                name="tax_number"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="gap-1">{editForm.watch("is_company") ? "Vergi No" : "TCKN"}</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder={editForm.watch("is_company") ? "Vergi No" : "TCKN"} {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Müşteri {editForm.watch("is_company") ? "vergi" : "TCKN"} numarasını girin (varsa).
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={editForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="gap-1">Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="Email" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Müşteri email adresini girin (varsa).
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={editForm.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="gap-1">Adres</FormLabel>
                                        <FormControl>
                                            <Input type="text" placeholder="Adres" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Müşteri adresini girin (varsa).
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={editForm.control}
                                name="phone"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="gap-1">Telefon</FormLabel>
                                        <FormControl>
                                            <Input type="text" placeholder="Telefon No" {...field} />
                                        </FormControl>
                                        <FormDescription className="text-xs">
                                            Müşteri telefonunu girin (varsa).
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                    <DialogFooter className="flex items-center">
                        <DialogClose asChild>
                            <Button variant="destructive">İptal</Button>
                        </DialogClose>
                        <Button variant="default" className="bg-green-600" onClick={() => handleEditCustomer()}>Kaydet</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="ml-auto select-none">
                            <Plus />
                            Müşteri Ekle
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Müşteri Ekle</DialogTitle>
                            <DialogDescription>
                                Yeni bir müşteri ekleyin.
                            </DialogDescription>
                        </DialogHeader>
                        <Form {...addForm}>
                            <form onSubmit={() => { }} className="space-y-4">
                                <FormField
                                    control={addForm.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="gap-1">Müşteri Adı <span className="text-red-500">*</span></FormLabel>
                                            <FormControl>
                                                <Input type="text" placeholder="Müşteri Adı" {...field} />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Müşteri adını girin.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={addForm.control}
                                    name="is_company"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                                                <FormLabel className="gap-1">Müşteri Türü <span className="text-red-500">*</span></FormLabel>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Müşteri Türü Seçin" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>Müşteri Türü</SelectLabel>
                                                        <SelectItem value="1">Şirket</SelectItem>
                                                        <SelectItem value="0">Bireysel</SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <FormDescription className="text-xs">
                                                Müşteri türünü seçin.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={addForm.control}
                                    name="tax_number"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="gap-1">{addForm.watch("is_company") ? "Vergi No" : "TCKN"}</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder={addForm.watch("is_company") ? "Vergi No" : "TCKN"} {...field} />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Müşteri {addForm.watch("is_company") ? "vergi" : "TCKN"} numarasını girin (varsa).
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={addForm.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="gap-1">Email</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="Email" {...field} />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Müşteri email adresini girin (varsa).
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={addForm.control}
                                    name="address"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="gap-1">Adres</FormLabel>
                                            <FormControl>
                                                <Input type="text" placeholder="Adres" {...field} />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Müşteri adresini girin (varsa).
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={addForm.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel className="gap-1">Telefon</FormLabel>
                                            <FormControl>
                                                <Input type="text" placeholder="Telefon No" {...field} />
                                            </FormControl>
                                            <FormDescription className="text-xs">
                                                Müşteri telefonunu girin (varsa).
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                        <DialogFooter className="flex items-center">
                            <DialogClose asChild>
                                <Button variant="destructive" onClick={() => addForm.reset()}>İptal</Button>
                            </DialogClose>
                            <Button variant="default" className="bg-green-600" onClick={() => handleAddCustomer()}>Müşteri Ekle</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
                <Button
                    variant="default"
                    className="select-none"
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
        </div >
    )
}