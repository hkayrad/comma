import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { attendanceSchema } from "@common/schemas";
import type { Employee, EmployeeAttendance } from "@common";
import { EmployeeApi } from "@/lib/api/employee";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Form,
	FormField,
	FormItem,
	FormLabel,
	FormControl,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DateSelect from "@/layout/shared/dialog/components/DateSelect";
import AnimateSelect from "./AnimateSelect";
import { toast } from "sonner";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	attendance?: EmployeeAttendance | null;
	employees: Employee[];
	onSuccess: () => void;
};

const STATUS_OPTIONS = [
	{ value: "PRESENT", label: "Geldi" },
	{ value: "ABSENT_UNEXCUSED", label: "Gelmedi (Mazeretsiz)" },
	{ value: "ABSENT_EXCUSED", label: "Mazeretli İzin" },
	{ value: "ANNUAL_LEAVE", label: "Yıllık İzin" },
	{ value: "SICK_LEAVE", label: "Raporlu" },
	{ value: "UNPAID_LEAVE", label: "Ücretsiz İzin" },
	{ value: "HALF_DAY", label: "Yarım Gün" },
];

export default function AttendanceDialog({
	open,
	onOpenChange,
	attendance,
	employees,
	onSuccess,
}: Props) {
	const isEditing = Boolean(attendance);

	const form = useForm({
		resolver: zodResolver(attendanceSchema),
		defaultValues: {
			employee_id: "",
			date: new Date().toISOString().split("T")[0],
			status: "PRESENT",
			check_in_time: "09:00",
			check_out_time: "18:00",
			overtime_hours: 0,
			overtime_multiplier: 1.5,
			notes: "",
		},
	});

	useEffect(() => {
		if (open) {
			if (attendance) {
				form.reset({
					employee_id: attendance.employee_id,
					date: String(attendance.date).split("T")[0],
					status: attendance.status || "PRESENT",
					check_in_time: attendance.check_in_time || "",
					check_out_time: attendance.check_out_time || "",
					overtime_hours: Number(attendance.overtime_hours) || 0,
					overtime_multiplier: Number(attendance.overtime_multiplier) || 1.5,
					notes: attendance.notes || "",
				});
			} else {
				form.reset({
					employee_id: employees[0]?.id || "",
					date: new Date().toISOString().split("T")[0],
					status: "PRESENT",
					check_in_time: "09:00",
					check_out_time: "18:00",
					overtime_hours: 0,
					overtime_multiplier: 1.5,
					notes: "",
				});
			}
		}
	}, [open, attendance, employees, form]);

	const onSubmit = async (values: any) => {
		try {
			await EmployeeApi.SaveAttendance(values);
			toast.success(isEditing ? "Puantaj kaydı güncellendi" : "Puantaj kaydı eklendi");
			onSuccess();
			onOpenChange(false);
		} catch (err: any) {
			const errMsg = typeof err === "string" ? err : err?.message || "Kayıt sırasında bir hata oluştu";
			toast.error(errMsg);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>{isEditing ? "Puantaj Kaydını Düzenle" : "Yeni Puantaj Ekle"}</DialogTitle>
				</DialogHeader>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
											disabled={isEditing}
											options={employees.map((e) => ({
												value: e.id,
												label: `${e.first_name} ${e.last_name}`,
											}))}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="grid grid-cols-2 gap-3">
							<FormField
								control={form.control}
								name="date"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Tarih *</FormLabel>
										<FormControl>
											<DateSelect field={field as any} allowFuture={false} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="status"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Durum *</FormLabel>
										<FormControl>
											<AnimateSelect
												value={field.value}
												onValueChange={field.onChange}
												options={STATUS_OPTIONS}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<FormField
								control={form.control}
								name="check_in_time"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Giriş Saati</FormLabel>
										<FormControl>
											<Input placeholder="09:00" {...field} value={field.value || ""} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="check_out_time"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Çıkış Saati</FormLabel>
										<FormControl>
											<Input placeholder="18:00" {...field} value={field.value || ""} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<FormField
								control={form.control}
								name="overtime_hours"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Mesai (Saat)</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.5"
												min="0"
												{...field}
												value={field.value as number ?? 0}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="overtime_multiplier"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Mesai Çarpanı</FormLabel>
										<FormControl>
											<Input
												type="number"
												step="0.1"
												min="1"
												{...field}
												value={field.value as number ?? 1.5}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>


						<FormField
							control={form.control}
							name="notes"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Notlar</FormLabel>
									<FormControl>
										<Input placeholder="Açıklama veya not..." {...field} value={field.value || ""} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<DialogFooter className="pt-2">
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								İptal
							</Button>
							<Button type="submit">
								{isEditing ? "Güncelle" : "Kaydet"}
							</Button>
						</DialogFooter>

					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
