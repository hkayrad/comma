import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmployeeApi } from "@/lib/api/employee";
import type { AttendanceStatus, EmployeeAttendance } from "@common";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Clock, UserCheck, UserX, FileSpreadsheet, Trash2, Pencil, Plus } from "lucide-react";

import DateSelect from "@/layout/shared/dialog/components/DateSelect";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AttendanceBatchDialog from "./components/AttendanceBatchDialog";
import AttendanceDialog from "./components/AttendanceDialog";
import { PageLoader } from "@/components/shared/PageLoader";
import { toast } from "sonner";



const STATUS_LABELS: Record<AttendanceStatus, { label: string; class: string }> = {
	PRESENT: { label: "Geldi", class: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300" },
	ABSENT_UNEXCUSED: { label: "Gelmedi (Mazeretsiz)", class: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300" },
	ABSENT_EXCUSED: { label: "Mazeretli İzin", class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300" },
	ANNUAL_LEAVE: { label: "Yıllık İzin", class: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300" },
	SICK_LEAVE: { label: "Raporlu", class: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300" },
	UNPAID_LEAVE: { label: "Ücretsiz İzin", class: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300" },
	HALF_DAY: { label: "Yarım Gün", class: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300" },
};

export default function Attendance() {
	const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0]);
	const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
	const [batchDialogOpen, setBatchDialogOpen] = useState(false);
	const [singleDialogOpen, setSingleDialogOpen] = useState(false);
	const [editingAttendance, setEditingAttendance] = useState<EmployeeAttendance | null>(null);

	const handleOpenCreate = () => {
		setEditingAttendance(null);
		setSingleDialogOpen(true);
	};

	const handleOpenEdit = (att: EmployeeAttendance) => {
		setEditingAttendance(att);
		setSingleDialogOpen(true);
	};


	const { data: employees = [] } = useQuery({
		queryKey: ["employees"],
		queryFn: () => EmployeeApi.GetAllEmployees(),
	});

	const { data: attendances = [], isLoading, refetch } = useQuery({
		queryKey: ["attendance", startDate, endDate],
		queryFn: () => EmployeeApi.GetAttendance({ startDate, endDate }),
	});

	// Stats calculation
	const stats = useMemo(() => {
		let totalOvertimeHours = 0;
		let unexcusedAbsenceDays = 0;
		let leaveDays = 0;

		attendances.forEach((att) => {
			totalOvertimeHours += Number(att.overtime_hours) || 0;
			if (att.status === "ABSENT_UNEXCUSED") {
				unexcusedAbsenceDays += 1;
			} else if (att.status === "HALF_DAY") {
				unexcusedAbsenceDays += 0.5;
			} else if (["ANNUAL_LEAVE", "SICK_LEAVE", "ABSENT_EXCUSED", "UNPAID_LEAVE"].includes(att.status)) {
				leaveDays += 1;
			}
		});

		return { totalOvertimeHours, unexcusedAbsenceDays, leaveDays };
	}, [attendances]);

	const handleDelete = async (id: string) => {
		try {
			await EmployeeApi.DeleteAttendance(id);
			toast.success("Kayıt silindi");
			refetch();
		} catch (err: any) {
			toast.error(err || "Silinirken hata oluştu");
		}
	};

	return (
		<div className="p-6 space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">PDKS & Devamsızlık Takibi</h1>
					<p className="text-muted-foreground">
						Çalışanların giriş-çıkış saatleri, gelinmeyen gün sayısı ve fazla mesai durumlarını takip edin.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<Button onClick={handleOpenCreate} className="gap-2">
						<Plus className="h-4 w-4" /> Yeni Puantaj Ekle
					</Button>
					<Button onClick={() => setBatchDialogOpen(true)} variant="outline" className="gap-2">
						<FileSpreadsheet className="h-4 w-4" /> Toplu Günlük Puantaj Gir
					</Button>
				</div>

			</div>


			{/* Filter & Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<Card className="col-span-1 md:col-span-1">
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-medium text-muted-foreground">Tarih Filtresi</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2">
						<div>
							<label className="text-xs text-muted-foreground">Başlangıç</label>
							<DateSelect
								field={{
									value: startDate,
									onChange: (val: any) => setStartDate(val || ""),
								} as any}
								allowFuture={false}
							/>
						</div>
						<div>
							<label className="text-xs text-muted-foreground">Bitiş</label>
							<DateSelect
								field={{
									value: endDate,
									onChange: (val: any) => setEndDate(val || ""),
								} as any}
								allowFuture={false}
							/>
						</div>

					</CardContent>
				</Card>

				<Card className="col-span-1">
					<CardHeader className="pb-2 flex flex-row items-center justify-between">
						<CardTitle className="text-xs font-medium text-muted-foreground">Devamsızlık (Gelinmeyen Gün)</CardTitle>
						<UserX className="h-4 w-4 text-red-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">{stats.unexcusedAbsenceDays} Gün</div>
						<p className="text-xs text-muted-foreground mt-1">Mazeretsiz / Yarım Gün</p>
					</CardContent>
				</Card>

				<Card className="col-span-1">
					<CardHeader className="pb-2 flex flex-row items-center justify-between">
						<CardTitle className="text-xs font-medium text-muted-foreground">İzin ve Rapor Günleri</CardTitle>
						<UserCheck className="h-4 w-4 text-blue-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-blue-600">{stats.leaveDays} Gün</div>
						<p className="text-xs text-muted-foreground mt-1">Yıllık / Rapor / İzin</p>
					</CardContent>
				</Card>

				<Card className="col-span-1">
					<CardHeader className="pb-2 flex flex-row items-center justify-between">
						<CardTitle className="text-xs font-medium text-muted-foreground">Toplam Fazla Mesai</CardTitle>
						<Clock className="h-4 w-4 text-emerald-500" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-emerald-600">{stats.totalOvertimeHours} Saat</div>
						<p className="text-xs text-muted-foreground mt-1">1.5x / 2.0x Mesai Saatleri</p>
					</CardContent>
				</Card>
			</div>

			{/* Attendance Table */}
			{isLoading ? (
				<PageLoader />
			) : attendances.length === 0 ? (
				<Card>
					<CardContent className="p-8 text-center text-muted-foreground">
						Seçilen tarih aralığında PDKS / devamsızlık kaydı bulunamadı.
					</CardContent>
				</Card>
			) : (
				<Card className="overflow-hidden">
					<CardContent className="p-0">
						<Table className="[&_th]:px-4 [&_th]:py-3.5 [&_td]:px-4 [&_td]:py-3">
							<TableHeader>
								<TableRow>
									<TableHead>Tarih</TableHead>
									<TableHead>Çalışan</TableHead>
									<TableHead>Durum</TableHead>
									<TableHead>Giriş Saati</TableHead>
									<TableHead>Çıkış Saati</TableHead>
									<TableHead className="text-center">Fazla Mesai</TableHead>
									<TableHead className="text-right">İşlem</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{attendances.map((att) => {
									const statusInfo = STATUS_LABELS[att.status as AttendanceStatus] || { label: att.status, class: "" };
									return (
										<TableRow key={att.id}>
											<TableCell className="font-medium">
												{String(att.date).split("T")[0]}
											</TableCell>
											<TableCell className="font-semibold">
												{att.employee_name}
											</TableCell>
											<TableCell>
												<span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusInfo.class}`}>
													{statusInfo.label}
												</span>
											</TableCell>
											<TableCell className="font-mono text-xs">
												{att.check_in_time || "-"}
											</TableCell>
											<TableCell className="font-mono text-xs">
												{att.check_out_time || "-"}
											</TableCell>
											<TableCell className="text-center">
												{Number(att.overtime_hours) > 0 ? (
													<span className="font-semibold text-emerald-600">
														+{att.overtime_hours} sa ({att.overtime_multiplier}x)
													</span>
												) : (
													"-"
												)}
											</TableCell>
											<TableCell className="text-right">
												<div className="flex items-center justify-end gap-1">
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-black dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
														onClick={() => handleOpenEdit(att)}
														title="Puantajı Düzenle"
													>
														<Pencil className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
														onClick={() => handleDelete(att.id)}
														title="Sil"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</div>
											</TableCell>

										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</CardContent>
				</Card>

			)}

			<AttendanceDialog
				open={singleDialogOpen}
				onOpenChange={setSingleDialogOpen}
				attendance={editingAttendance}
				employees={employees}
				onSuccess={() => refetch()}
			/>

			<AttendanceBatchDialog
				open={batchDialogOpen}
				onOpenChange={setBatchDialogOpen}
				employees={employees}
				onSuccess={() => refetch()}
			/>
		</div>
	);
}

