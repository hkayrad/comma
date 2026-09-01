import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AnimateSelect from "./AnimateSelect";

import { EmployeeApi } from "@/lib/api/employee";
import { CompanyApi } from "@/lib/api/company";
import type { Employee, AttendanceStatus } from "@common";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

import DateSelect from "@/layout/shared/dialog/components/DateSelect";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	employees: Employee[];
	onSuccess: () => void;
};

const STATUS_OPTIONS: { value: AttendanceStatus; label: string }[] = [
	{ value: "PRESENT", label: "Geldi (Mevcut)" },
	{ value: "ABSENT_UNEXCUSED", label: "Gelmedi (Mazeretsiz)" },
	{ value: "ABSENT_EXCUSED", label: "Gelmedi (Mazeretli)" },
	{ value: "ANNUAL_LEAVE", label: "Yıllık İzin" },
	{ value: "SICK_LEAVE", label: "Raporlu" },
	{ value: "UNPAID_LEAVE", label: "Ücretsiz İzin" },
	{ value: "HALF_DAY", label: "Yarım Gün" },
];

const calculateOvertimeHours = (checkOut: string, targetEndTime: string = "18:00") => {
	if (!checkOut || !targetEndTime) return 0;
	const [outH, outM] = checkOut.split(":").map(Number);
	const [endH, endM] = targetEndTime.split(":").map(Number);
	if (isNaN(outH) || isNaN(outM) || isNaN(endH) || isNaN(endM)) return 0;

	const outMin = outH * 60 + outM;
	const endMin = endH * 60 + endM;

	if (outMin > endMin) {
		const diffHours = (outMin - endMin) / 60;
		return Math.round(diffHours * 2) / 2; // En yakın 0.5 saate yuvarla (ör. 1.5, 2.0, 2.5)
	}
	return 0;
};

export default function AttendanceBatchDialog({ open, onOpenChange, employees, onSuccess }: Props) {
	const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

	const { data: companyRes } = useQuery({
		queryKey: ["companyDetails"],
		queryFn: () => CompanyApi.GetCompanyById(),
	});

	const workStartTime = companyRes?.data?.work_start_time || "08:30";
	const workEndTime = companyRes?.data?.work_end_time || "18:00";

	const [attendanceMap, setAttendanceMap] = useState<Record<string, {
		status: AttendanceStatus;
		check_in_time: string;
		check_out_time: string;
		overtime_hours: number;
	}>>({});

	useEffect(() => {
		const initial: any = {};
		employees.forEach((emp) => {
			initial[emp.id] = {
				status: "PRESENT",
				check_in_time: workStartTime,
				check_out_time: workEndTime,
				overtime_hours: 0,
			};
		});
		setAttendanceMap(initial);
	}, [employees, open, workStartTime, workEndTime]);

	const handleChange = (empId: string, field: string, value: any) => {
		setAttendanceMap((prev) => {
			const current = prev[empId] || {
				status: "PRESENT",
				check_in_time: workStartTime,
				check_out_time: workEndTime,
				overtime_hours: 0,
			};

			const updated = { ...current, [field]: value };

			// Çıkış saati veya durum değiştiğinde mesaiyi otomatik hesapla
			if (field === "check_out_time" || field === "status") {
				if (updated.status === "PRESENT") {
					updated.overtime_hours = calculateOvertimeHours(updated.check_out_time, workEndTime);
				} else {
					updated.overtime_hours = 0;
				}
			}

			return {
				...prev,
				[empId]: updated,
			};
		});
	};

	const handleSave = async () => {
		try {
			const items = Object.entries(attendanceMap).map(([empId, item]) => ({
				employee_id: empId,
				date: selectedDate,
				status: item.status,
				check_in_time: item.status === "PRESENT" ? item.check_in_time : null,
				check_out_time: item.status === "PRESENT" ? item.check_out_time : null,
				overtime_hours: Number(item.overtime_hours) || 0,
				overtime_multiplier: 1.5,
			}));

			await EmployeeApi.BatchSaveAttendance(items as any);
			toast.success(`${items.length} çalışanın puantajı kaydedildi`);
			onOpenChange(false);
			onSuccess();
		} catch (err: any) {
			toast.error(err || "Toplu kayıt esnasında hata oluştu");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl w-full max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Toplu Günlük Puantaj & Giriş-Çıkış Girişi</DialogTitle>
				</DialogHeader>

				<div className="space-y-4 my-2">
					<div className="flex flex-wrap items-center justify-between gap-4 bg-muted/30 p-3 rounded-lg border">
						<div className="flex items-center space-x-3 w-72">
							<label className="text-sm font-medium shrink-0">Tarih:</label>
							<DateSelect
								field={{
									value: selectedDate,
									onChange: (val: any) => setSelectedDate(val || new Date().toISOString().split("T")[0]),
								} as any}
								allowFuture={false}
							/>
						</div>

						<div className="text-xs text-muted-foreground">
							Şirket Mesai Saatleri: <span className="font-semibold text-foreground">{workStartTime} - {workEndTime}</span> (Mesai bitiş saatinden sonraki süre otomatik mesaiye eklenir)
						</div>
					</div>

					<div className="border rounded-md overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-1/4">Çalışan</TableHead>
									<TableHead className="w-1/3">Durum</TableHead>
									<TableHead>Giriş Saati (24s)</TableHead>
									<TableHead>Çıkış Saati (24s)</TableHead>
									<TableHead className="text-center">Mesai (s)</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{employees.map((emp) => {
									const current = attendanceMap[emp.id] || {
										status: "PRESENT",
										check_in_time: workStartTime,
										check_out_time: workEndTime,
										overtime_hours: 0,
									};

									return (
										<TableRow key={emp.id}>
											<TableCell className="font-medium">
												{emp.first_name} {emp.last_name}
												<div className="text-xs text-muted-foreground font-normal">{emp.title || "-"}</div>
											</TableCell>
											<TableCell>
												<AnimateSelect
													size="sm"
													value={current.status}
													onValueChange={(val) => handleChange(emp.id, "status", val)}
													options={STATUS_OPTIONS}
												/>
											</TableCell>

											<TableCell>
												<Input
													type="time"
													step="60"
													className="h-8 text-xs font-mono"
													disabled={current.status !== "PRESENT"}
													value={current.check_in_time}
													onChange={(e) => handleChange(emp.id, "check_in_time", e.target.value)}
												/>
											</TableCell>
											<TableCell>
												<Input
													type="time"
													step="60"
													className="h-8 text-xs font-mono"
													disabled={current.status !== "PRESENT"}
													value={current.check_out_time}
													onChange={(e) => handleChange(emp.id, "check_out_time", e.target.value)}
												/>
											</TableCell>
											<TableCell className="text-center">
												<Input
													type="number"
													step="0.5"
													className="h-8 text-xs text-center font-bold text-emerald-700 dark:text-emerald-400 w-20 mx-auto"
													value={current.overtime_hours}
													onChange={(e) => handleChange(emp.id, "overtime_hours", e.target.value)}
												/>
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>

				</div>

				<DialogFooter className="mt-4">
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
						İptal
					</Button>
					<Button type="submit" onClick={handleSave}>Kaydet</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
