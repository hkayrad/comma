import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EmployeeApi } from "@/lib/api/employee";
import type { Employee } from "@common";
import { employeeSchema } from "@common";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import DateSelect from "@/layout/shared/dialog/components/DateSelect";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employee?: Employee | null;
	onSuccess: () => void;
};

type FormValues = z.infer<typeof employeeSchema>;

export default function EmployeeDialog({ open, onOpenChange, employee, onSuccess }: Props) {
	const isEdit = !!employee;

	const form = useForm<FormValues>({
		resolver: zodResolver(employeeSchema) as any,
		defaultValues: {
			tc_no: "",
			first_name: "",
			last_name: "",
			title: "",
			department: "",
			phone: "",
			email: "",
			address: "",
			hire_date: new Date().toISOString().split("T")[0],
			termination_date: "",
			iban: "",
			bank_name: "",
			base_salary: 0,
			salary_currency: "TRY",
		},
	});

	useEffect(() => {
		if (employee) {
			form.reset({
				tc_no: employee.tc_no || "",
				first_name: employee.first_name || "",
				last_name: employee.last_name || "",
				title: employee.title || "",
				department: employee.department || "",
				phone: employee.phone || "",
				email: employee.email || "",
				address: employee.address || "",
				hire_date: employee.hire_date ? String(employee.hire_date).split("T")[0] : new Date().toISOString().split("T")[0],
				termination_date: employee.termination_date ? String(employee.termination_date).split("T")[0] : "",
				iban: employee.iban || "",
				bank_name: employee.bank_name || "",
				base_salary: Number(employee.base_salary) || 0,
				salary_currency: employee.salary_currency || "TRY",
			});
		} else {
			form.reset({
				tc_no: "",
				first_name: "",
				last_name: "",
				title: "",
				department: "",
				phone: "",
				email: "",
				address: "",
				hire_date: new Date().toISOString().split("T")[0],
				termination_date: "",
				iban: "",
				bank_name: "",
				base_salary: 0,
				salary_currency: "TRY",
			});
		}
	}, [employee, form, open]);

	const onSubmit = async (values: FormValues) => {
		try {
			if (isEdit && employee) {
				await EmployeeApi.UpdateEmployee(employee.id, values as any);
				toast.success("Çalışan güncellendi");
			} else {
				await EmployeeApi.CreateEmployee(values as any);
				toast.success("Çalışan eklendi");
			}
			onOpenChange(false);
			onSuccess();
		} catch (err: any) {
			toast.error(err || "İşlem sırasında bir hata oluştu");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl w-full max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{isEdit ? "Çalışan Bilgilerini Düzenle" : "Yeni Çalışan Ekle"}</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						{/* Personel Kimlik Bilgileri */}
						<div className="space-y-2">
							<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
								Özlük & Kimlik Bilgileri
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<FormField
									control={form.control}
									name="first_name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Ad *</FormLabel>
											<FormControl>
												<Input placeholder="Ahmet" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="last_name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Soyad *</FormLabel>
											<FormControl>
												<Input placeholder="Yılmaz" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="tc_no"
									render={({ field }) => (
										<FormItem>
											<FormLabel>TC Kimlik No</FormLabel>
											<FormControl>
												<Input placeholder="12345678901" maxLength={11} {...field} value={field.value || ""} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Görev & İletişim Bilgileri */}
						<div className="space-y-2">
							<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
								Görev & İletişim Bilgileri
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<FormField
									control={form.control}
									name="title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Unvan / Görev</FormLabel>
											<FormControl>
												<Input placeholder="Yazılım Uzmanı" {...field} value={field.value || ""} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="department"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Departman</FormLabel>
											<FormControl>
												<Input placeholder="BT / Ar-Ge" {...field} value={field.value || ""} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="phone"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Telefon</FormLabel>
											<FormControl>
												<Input placeholder="0555 555 5555" {...field} value={field.value || ""} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Çalışma & İşe Giriş / Çıkış Tarihleri */}
						<div className="space-y-2">
							<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
								Çalışma & Tarih Bilgileri
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<FormField
									control={form.control}
									name="email"
									render={({ field }) => (
										<FormItem>
											<FormLabel>E-posta</FormLabel>
											<FormControl>
												<Input placeholder="ahmet@example.com" type="email" {...field} value={field.value || ""} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="hire_date"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel>İşe Giriş Tarihi *</FormLabel>
											<DateSelect field={field} allowFuture placeholder="İşe giriş tarihi seçin" />
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="termination_date"
									render={({ field }) => (
										<FormItem className="flex flex-col">
											<FormLabel>İşten Çıkış Tarihi</FormLabel>
											<DateSelect field={field} allowFuture allowClear placeholder="İşten çıkış (Opsiyonel)" />
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* Finans & Banka Bilgileri */}
						<div className="space-y-2">
							<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
								Maaş & Banka Bilgileri
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<FormField
									control={form.control}
									name="base_salary"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Taban / Aylık Maaş (TL) *</FormLabel>
											<FormControl>
												<Input type="number" step="0.01" placeholder="45000" {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="bank_name"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Banka Adı</FormLabel>
											<FormControl>
												<Input placeholder="Garanti BBVA" {...field} value={field.value || ""} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="iban"
									render={({ field }) => (
										<FormItem>
											<FormLabel>IBAN Bilgisi</FormLabel>
											<FormControl>
												<Input placeholder="TR00 0000 0000 0000 0000 0000 00" {...field} value={field.value || ""} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						{/* İkamet Adresi */}
						<FormField
							control={form.control}
							name="address"
							render={({ field }) => (
								<FormItem>
									<FormLabel>İkamet Adresi</FormLabel>
									<FormControl>
										<Input placeholder="Tam adres bilgisi..." {...field} value={field.value || ""} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter className="mt-6">
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								İptal
							</Button>
							<Button type="submit" size="lg">Kaydet</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
