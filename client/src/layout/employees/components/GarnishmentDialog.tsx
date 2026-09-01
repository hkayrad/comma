import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import AnimateSelect from "./AnimateSelect";

import DateSelect from "@/layout/shared/dialog/components/DateSelect";
import { EmployeeApi } from "@/lib/api/employee";

import type { Employee, EmployeeGarnishment } from "@common";
import { garnishmentSchema } from "@common";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employees: Employee[];
	garnishment?: EmployeeGarnishment | null;
	onSuccess: () => void;
};

type FormValues = z.infer<typeof garnishmentSchema>;

const DEDUCTION_TYPE_OPTIONS = [
	{ value: "PERCENTAGE", label: "Maaş Oranı (%)" },
	{ value: "FIXED", label: "Sabit Tutar (TL)" },
];

const STATUS_OPTIONS = [
	{ value: "ACTIVE", label: "Aktif (Kesinti Yapılıyor)" },
	{ value: "PAUSED", label: "Durduruldu" },
	{ value: "COMPLETED", label: "Tamamlandı (Borç Bitti)" },
];

export default function GarnishmentDialog({ open, onOpenChange, employees, garnishment, onSuccess }: Props) {
	const isEdit = Boolean(garnishment?.id);

	const form = useForm<FormValues>({
		resolver: zodResolver(garnishmentSchema) as any,
		defaultValues: {
			employee_id: "",
			file_no: "",
			execution_office: "",
			total_debt: 0,
			deduction_type: "PERCENTAGE",
			deduction_value: 25,
			start_date: new Date().toISOString().split("T")[0],
			status: "ACTIVE",
			notes: "",
		},
	});

	useEffect(() => {
		if (open) {
			if (garnishment) {
				form.reset({
					employee_id: garnishment.employee_id,
					file_no: garnishment.file_no,
					execution_office: garnishment.execution_office,
					total_debt: Number(garnishment.total_debt),
					deduction_type: garnishment.deduction_type as any,
					deduction_value: Number(garnishment.deduction_value),
					start_date: garnishment.start_date || new Date().toISOString().split("T")[0],
					status: garnishment.status || "ACTIVE",
					notes: garnishment.notes || "",
				});
			} else {
				form.reset({
					employee_id: "",
					file_no: "",
					execution_office: "",
					total_debt: 0,
					deduction_type: "PERCENTAGE",
					deduction_value: 25,
					start_date: new Date().toISOString().split("T")[0],
					status: "ACTIVE",
					notes: "",
				});
			}
		}
	}, [open, garnishment, form]);


	const deductionType = form.watch("deduction_type");

	const onSubmit = async (values: FormValues) => {
		try {
			if (isEdit && garnishment?.id) {
				await EmployeeApi.UpdateGarnishment(garnishment.id, values as any);
				toast.success("İcra dosyası kaydı güncellendi");
			} else {
				await EmployeeApi.CreateGarnishment(values as any);
				toast.success("İcra dosyası kaydı eklendi");
			}
			onOpenChange(false);
			onSuccess();
		} catch (err: any) {
			toast.error(err || "Hata oluştu");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl md:max-w-2xl w-full">
				<DialogHeader>
					<DialogTitle>{isEdit ? "İcra Dosyasını Düzenle" : "Yeni İcra Dosyası Girişi"}</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="col-span-2">
								<FormField
									control={form.control}
									name="employee_id"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Borçlu Çalışan *</FormLabel>
											<FormControl>
												<AnimateSelect
													value={field.value}
													onValueChange={field.onChange}
													placeholder="Çalışan seçin"
													disabled={isEdit}
													options={employees.map((emp) => ({
														value: emp.id,
														label: `${emp.first_name} ${emp.last_name}${emp.title ? ` (${emp.title})` : ""}`,
													}))}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={form.control}
								name="execution_office"
								render={({ field }) => (
									<FormItem>
										<FormLabel>İcra Dairesi *</FormLabel>
										<FormControl>
											<Input placeholder="İstanbul 3. İcra Dairesi" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="file_no"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Dosya No *</FormLabel>
										<FormControl>
											<Input placeholder="2026/1234 E." {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="total_debt"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Toplam Borç (TL) *</FormLabel>
										<FormControl>
											<Input type="number" step="0.01" placeholder="40000" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="start_date"
								render={({ field }) => (
									<FormItem>
										<FormLabel>İcra Başlangıç Tarihi *</FormLabel>
										<FormControl>
											<DateSelect field={field as any} allowFuture={true} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>



							<FormField
								control={form.control}
								name="deduction_type"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Kesinti Tipi *</FormLabel>
										<FormControl>
											<AnimateSelect
												value={field.value}
												onValueChange={field.onChange}
												placeholder="Kesinti Tipi Seçin"
												options={DEDUCTION_TYPE_OPTIONS}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="col-span-2">
								<FormField
									control={form.control}
									name="deduction_value"
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{deductionType === "PERCENTAGE"
													? "Aylık Kesinti Oranı (%) *"
													: "Aylık Sabit Kesinti Tutarı (TL) *"}
											</FormLabel>
											<FormControl>
												<Input
													type="number"
													step="0.01"
													placeholder={deductionType === "PERCENTAGE" ? "25" : "5000"}
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{isEdit && (
								<div className="col-span-2">
									<FormField
										control={form.control}
										name="status"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Dosya Durumu</FormLabel>
												<FormControl>
													<AnimateSelect
														value={field.value}
														onValueChange={field.onChange}
														placeholder="Durum Seçin"
														options={STATUS_OPTIONS}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							)}



							<div className="col-span-2">
								<FormField
									control={form.control}
									name="notes"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Notlar</FormLabel>
											<FormControl>
												<Input placeholder="Ek bilgi / Alacaklı bilgisi..." {...field} value={field.value || ""} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
						</div>

						<DialogFooter className="mt-4">
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								İptal
							</Button>
							<Button type="submit">{isEdit ? "Güncelle" : "Kaydet"}</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
