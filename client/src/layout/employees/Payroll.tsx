import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmployeeApi } from "@/lib/api/employee";
import type { EmployeePayroll } from "@common";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnimateSelect from "./components/AnimateSelect";

import { Calculator, FileText, Trash2, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PayslipDialog from "./components/PayslipDialog";
import { PageLoader } from "@/components/shared/PageLoader";
import { toast } from "sonner";


export default function Payroll() {
	const currentYear = new Date().getFullYear();
	const currentMonth = new Date().getMonth() + 1;

	const [selectedYear, setSelectedYear] = useState<number>(currentYear);
	const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
	const [maxYear, setMaxYear] = useState<number>(2035);



	const [payslipDialogOpen, setPayslipDialogOpen] = useState(false);
	const [selectedPayroll, setSelectedPayroll] = useState<EmployeePayroll | null>(null);

	const yearsOptions = useMemo(() => {
		const list = [];
		for (let y = 2025; y <= maxYear; y++) {
			list.push({ value: y.toString(), label: y.toString() });
		}
		return list;
	}, [maxYear]);


	const { data: employees = [] } = useQuery({
		queryKey: ["employees"],
		queryFn: () => EmployeeApi.GetAllEmployees(),
	});

	const { data: payrolls = [], isLoading, refetch } = useQuery({
		queryKey: ["payrolls", selectedYear, selectedMonth],
		queryFn: () => EmployeeApi.GetPayrolls(selectedYear, selectedMonth),
	});

	// Calculate payroll for all employees in selected period
	const handleCalculateAll = async () => {
		try {
			let count = 0;
			for (const emp of employees) {
				const preview = await EmployeeApi.CalculatePayrollPreview(emp.id, selectedYear, selectedMonth);
				await EmployeeApi.SavePayroll(preview as any);
				count++;
			}
			toast.success(`${count} çalışanın ${selectedMonth}/${selectedYear} dönemi bordrosu hesaplandı ve kaydedildi.`);
			refetch();
		} catch (err: any) {
			const errMsg = typeof err === "string" ? err : err?.message || err?.response?.data?.message || "Bordro hesaplanırken hata oluştu.";
			toast.error(errMsg);
		}
	};

	const handleOpenPayslip = (payroll: EmployeePayroll) => {
		setSelectedPayroll(payroll);
		setPayslipDialogOpen(true);
	};

	const handleTogglePaymentStatus = async (payroll: EmployeePayroll) => {
		const newStatus = payroll.payment_status === "PAID" ? "DRAFT" : "PAID";
		const newDate = newStatus === "PAID" ? new Date().toISOString().split("T")[0] : null;

		try {
			await EmployeeApi.SavePayroll({
				...payroll,
				payment_status: newStatus,
				payment_date: newDate,
			});
			toast.success(
				newStatus === "PAID"
					? `${payroll.employee_name} için maaş ödemesi "ÖDENDİ" olarak işaretlendi.`
					: `${payroll.employee_name} için maaş ödemesi "ÖDENMEDİ" olarak değiştirildi.`
			);
			refetch();
		} catch (err: any) {
			const errMsg = typeof err === "string" ? err : err?.message || "Ödeme durumu güncellenirken hata oluştu";
			toast.error(errMsg);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await EmployeeApi.DeletePayroll(id);
			toast.success("Bordro silindi");
			refetch();
		} catch (err: any) {
			const errMsg = typeof err === "string" ? err : err?.message || err?.response?.data?.message || "Silinirken hata oluştu";
			toast.error(errMsg);
		}
	};


	const totalNetPayable = useMemo(() => {
		return payrolls.reduce((sum, p) => sum + Number(p.net_payable), 0);
	}, [payrolls]);

	const selectedEmployeeObj = useMemo(() => {
		if (!selectedPayroll) return null;
		return employees.find((e) => e.id === selectedPayroll.employee_id) || null;
	}, [selectedPayroll, employees]);

	return (
		<div className="p-6 space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Bordro & Maaş Hesaplama</h1>
					<p className="text-muted-foreground">
						Dönem bazlı taban maaş, mesai ücreti, devamsızlık kesintisi, avans ve icra mahsupları ile net maaş hesaplayın.
					</p>
				</div>
				<Button onClick={handleCalculateAll} className="gap-2">
					<Calculator className="h-4 w-4" /> Dönem Bordrolarını Otomatik Hesapla
				</Button>
			</div>

			{/* Period selector & Summary Card */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-medium text-muted-foreground">Hesaplama Dönemi</CardTitle>
					</CardHeader>
					<CardContent className="grid grid-cols-12 gap-2">
						<div className="col-span-7 min-w-0">
							<AnimateSelect
								value={selectedMonth.toString()}
								onValueChange={(val) => setSelectedMonth(Number(val))}
								panelClassName="max-h-none h-auto min-w-[200px]"
								options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => ({
									value: m.toString(),
									label: `${m}. Ay (${new Date(2026, m - 1, 1).toLocaleString("tr-TR", { month: "long" })})`,
								}))}
							/>
						</div>

						<div className="col-span-5 min-w-0">
							<AnimateSelect
								value={selectedYear.toString()}
								onValueChange={(val) => setSelectedYear(Number(val))}
								options={yearsOptions}
								onScrollEnd={() => setMaxYear((prev) => prev + 10)}
							/>


						</div>
					</CardContent>



				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-medium text-muted-foreground">Hesaplanan Bordro Sayısı</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{payrolls.length} Çalışan</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-medium text-muted-foreground">Dönem Toplam Ödenecek Net Maaş</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-primary">
							{totalNetPayable.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Payroll Table */}
			{isLoading ? (
				<PageLoader />
			) : payrolls.length === 0 ? (
				<Card>
					<CardContent className="p-8 text-center text-muted-foreground">
						Seçilen dönem ({selectedMonth}/{selectedYear}) için hesaplanmış bordro bulunamadı. "Dönem Bordrolarını Otomatik Hesapla" butonunu kullanarak hesaplayabilirsiniz.
					</CardContent>
				</Card>
			) : (
				<Card>
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Çalışan</TableHead>
									<TableHead>Taban Maaş</TableHead>
									<TableHead>Devamsızlık Kes.</TableHead>
									<TableHead>Mesai Ücreti</TableHead>
									<TableHead>Avans Mahsubu</TableHead>
									<TableHead>İcra Kesintisi</TableHead>
									<TableHead>Net Ödenecek</TableHead>
									<TableHead>Ödeme Durumu</TableHead>
									<TableHead className="text-right">İşlemler</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{payrolls.map((p) => {
									const isPaid = p.payment_status === "PAID";
									return (
										<TableRow key={p.id}>
											<TableCell className="font-semibold">
												{p.employee_name}
											</TableCell>
											<TableCell>
												{Number(p.base_salary).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
											</TableCell>
											<TableCell className="text-red-500 font-medium">
												-{Number(p.absence_deduction).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺ ({p.absent_days}g)
											</TableCell>
											<TableCell className="text-emerald-600 font-medium">
												+{Number(p.overtime_pay).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
											</TableCell>
											<TableCell className="text-amber-600 font-medium">
												-{Number(p.advance_deduction).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
											</TableCell>
											<TableCell className="text-red-600 font-medium">
												-{Number(p.garnishment_deduction).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
											</TableCell>
											<TableCell className="font-bold text-primary text-base">
												{Number(p.net_payable).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
											</TableCell>
											<TableCell>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => handleTogglePaymentStatus(p)}
													className={cn(
														"h-7 px-2.5 rounded-full text-xs font-semibold gap-1.5 transition-colors shadow-none border-none",
														isPaid
															? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
															: "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:hover:bg-amber-900"
													)}
													title="Tıklayarak ödeme durumunu değiştirin"
												>
													{isPaid ? (
														<>
															<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
															<span>Ödendi</span>
														</>
													) : (
														<>
															<Clock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
															<span>Ödenmedi</span>
														</>
													)}
												</Button>
											</TableCell>

										<TableCell className="text-right space-x-1">
											<Button
												variant="outline"
												size="sm"
												className="gap-1 text-xs"
												onClick={() => handleOpenPayslip(p)}
											>
												<FileText className="h-3.5 w-3.5" /> Maaş Pusulası
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-red-500 hover:text-red-600"
												onClick={() => handleDelete(p.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
									);
								})}
							</TableBody>

						</Table>
					</CardContent>
				</Card>

			)}

			<PayslipDialog
				open={payslipDialogOpen}
				onOpenChange={setPayslipDialogOpen}
				payroll={selectedPayroll}
				employee={selectedEmployeeObj}
			/>
		</div>
	);
}
