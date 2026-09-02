import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import AnimateSelect from "./AnimateSelect";

import { EmployeeApi } from "@/lib/api/employee";
import type { Employee } from "@common";
import { advanceSchema } from "@common";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import DateSelect from "@/layout/shared/dialog/components/DateSelect";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employees: Employee[];
	onSuccess: () => void;
};


type FormValues = z.infer<typeof advanceSchema>;

export default function AdvanceDialog({ open, onOpenChange, employees, onSuccess }: Props) {
	const form = useForm<FormValues>({
		resolver: zodResolver(advanceSchema) as any,

		defaultValues: {
			employee_id: "",
			amount: 0,
			request_date: new Date().toISOString().split("T")[0],
			status: "APPROVED",
			description: "",
		},
	});

	const onSubmit = async (values: FormValues) => {
		try {
			await EmployeeApi.CreateAdvance(values as any);
			toast.success("Avans kaydı eklendi");
			onOpenChange(false);
			onSuccess();
		} catch (err: any) {
			toast.error(err || "Hata oluştu");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-xl md:max-w-2xl w-[calc(100dvw-2rem)] sm:w-full">
				<DialogHeader>
					<DialogTitle>Yeni Avans Girişi</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div className="col-span-1 sm:col-span-2">
								<FormField
									control={form.control}
									name="employee_id"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Çalışan *</FormLabel>
											<FormControl>
												<AnimateSelect
													value={field.value}
													onValueChange={field.onChange}
													placeholder="Çalışan seçin"
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
								name="amount"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Avans Tutarı (TL) *</FormLabel>
										<FormControl>
											<Input type="number" inputMode="decimal" step="0.01" placeholder="5000" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="request_date"
								render={({ field }) => (
									<FormItem className="flex flex-col">
										<FormLabel>Tarih *</FormLabel>
										<DateSelect field={field} allowFuture={false} />
										<FormMessage />
									</FormItem>
								)}
							/>

							<div className="col-span-1 sm:col-span-2">
								<FormField
									control={form.control}
									name="description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Açıklama</FormLabel>
											<FormControl>
												<Input placeholder="Acil sağlık gideri vb." {...field} value={field.value || ""} />
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
							<Button type="submit">Kaydet</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
