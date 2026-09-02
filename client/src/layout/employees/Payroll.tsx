import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmployeeApi } from "@/lib/api/employee";
import type { EmployeePayroll } from "@common";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AnimateSelect from "./components/AnimateSelect";

import { Calculator, FileText, Trash2, CheckCircle2, Clock } from "lucide-react";

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
	const handleCalculate = async () => {
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

	const handleToggleBankPaymentStatus = async (payroll: EmployeePayroll) => {
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
					? `${payroll.employee_name} için resmi banka ödemesi "ÖDENDİ" olarak işaretlendi.`
					: `${payroll.employee_name} için resmi banka ödemesi "ÖDENMEDİ" olarak değiştirildi.`
			);
			refetch();
		} catch (err: any) {
			const errMsg = typeof err === "string" ? err : err?.message || "Ödeme durumu güncellenirken hata oluştu";
			toast.error(errMsg);
		}
	};

	const handleToggleCashPaymentStatus = async (payroll: EmployeePayroll) => {
		const newStatus = payroll.cash_payment_status === "PAID" ? "DRAFT" : "PAID";
		const newDate = newStatus === "PAID" ? new Date().toISOString().split("T")[0] : null;

		try {
			await EmployeeApi.SavePayroll({
				...payroll,
				cash_payment_status: newStatus,
				cash_payment_date: newDate,
			});
			toast.success(
				newStatus === "PAID"
					? `${payroll.employee_name} için elden ödeme "ÖDENDİ" olarak işaretlendi.`
					: `${payroll.employee_name} için elden ödeme "ÖDENMEDİ" olarak değiştirildi.`
			);
			refetch();
		} catch (err: any) {
			const errMsg = typeof err === "string" ? err : err?.message || "Elden ödeme durumu güncellenirken hata oluştu";
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

	const totalCashSalary = useMemo(() => {
		return payrolls.reduce((sum, p) => sum + (Number(p.cash_salary) || 0), 0);
	}, [payrolls]);

	const selectedEmployeeObj = useMemo(() => {
		if (!selectedPayroll) return null;
		return employees.find((e) => e.id === selectedPayroll.employee_id) || null;
	}, [selectedPayroll, employees]);

	return (
		<div className="p-3 sm:p-6 space-y-4 sm:space-y-6 min-h-full flex-1 overflow-y-auto">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold tracking-tight">Bordro & Maaş Hesaplama</h1>
					<p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
						Dönem bazlı taban maaş, mesai ücreti, devamsızlık kesintisi, avans, icra mahsupları ve elden ödemeler ile bordro yönetin.
					</p>
				</div>
				<Button onClick={handleCalculate} className="gap-2 w-full sm:w-auto">
					<Calculator className="h-4 w-4" /> Dönem Bordrolarını Otomatik Hesapla
				</Button>
			</div>

			{/* Period selector & Summary Card */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
						<CardTitle className="text-xs font-medium text-muted-foreground">Dönem Net Maaş (Banka)</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-primary">
							{totalNetPayable.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-xs font-medium text-amber-600 dark:text-amber-400">Dönem Toplam Elden Ödeme</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
							{totalCashSalary.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
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
				<>
					{/* Mobile Payroll Cards (< md) */}
					<div className="flex flex-col gap-3 md:hidden">
						{payrolls.map((p) => {
							const isBankPaid = p.payment_status === "PAID";
							const isCashPaid = p.cash_payment_status === "PAID";
							const hasCash = Number(p.cash_salary || 0) > 0;

							return (
								<Card key={p.id} className="p-3.5 shadow-xs">
									<div className="flex items-start justify-between gap-2">
										<div>
											<p className="font-semibold text-sm">{p.employee_name}</p>
											<p className="text-xs text-muted-foreground mt-0.5">
												Taban: {Number(p.base_salary).toLocaleString("tr-TR")} ₺
											</p>
										</div>
										<div className="flex items-center gap-1">
											<Button
												variant="outline"
												size="sm"
												className="h-8 gap-1 text-xs px-2"
												onClick={() => handleOpenPayslip(p)}
											>
												<FileText className="h-3.5 w-3.5" /> Pusula
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-red-500 hover:text-red-600"
												onClick={() => handleDelete(p.id)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</div>

									{/* Payment Status Blocks */}
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border mt-2">
										<div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
											<div>
												<span className="text-[10px] text-muted-foreground uppercase font-medium">Banka Net</span>
												<p className="font-bold text-sm text-primary">
													{Number(p.net_payable).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
												</p>
											</div>
											<Button
												variant={isBankPaid ? "outline" : "secondary"}
												size="sm"
												className="h-7 text-xs gap-1"
												onClick={() => handleToggleBankPaymentStatus(p)}
											>
												{isBankPaid ? (
													<>
														<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
														<span className="text-emerald-600 font-semibold">Ödendi</span>
													</>
												) : (
													<>
														<Clock className="h-3.5 w-3.5 text-amber-600" />
														<span>Ödenmedi</span>
													</>
												)}
											</Button>
										</div>

										{hasCash && (
											<div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10">
												<div>
													<span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-medium">Elden Net</span>
													<p className="font-bold text-sm text-amber-600 dark:text-amber-400">
														{Number(p.cash_salary).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
													</p>
												</div>
												<Button
													variant={isCashPaid ? "outline" : "secondary"}
													size="sm"
													className="h-7 text-xs gap-1"
													onClick={() => handleToggleCashPaymentStatus(p)}
												>
													{isCashPaid ? (
														<>
															<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
															<span className="text-emerald-600 font-semibold">Ödendi</span>
														</>
													) : (
														<>
															<Clock className="h-3.5 w-3.5 text-amber-600" />
															<span>Ödenmedi</span>
														</>
													)}
												</Button>
											</div>
										)}
									</div>

									{/* Deductions & Additions breakdown */}
									<div className="grid grid-cols-4 gap-1 pt-2 border-t border-border mt-1 text-[11px]">
										<div>
											<span className="text-[9px] text-muted-foreground uppercase">Devamsızlık</span>
											<p className="text-red-500 font-medium">-{Number(p.absence_deduction).toLocaleString("tr-TR")} ₺</p>
										</div>
										<div>
											<span className="text-[9px] text-muted-foreground uppercase">Mesai</span>
											<p className="text-emerald-600 font-medium">+{Number(p.overtime_pay).toLocaleString("tr-TR")} ₺</p>
										</div>
										<div>
											<span className="text-[9px] text-muted-foreground uppercase">Avans</span>
											<p className="text-amber-600 font-medium">-{Number(p.advance_deduction).toLocaleString("tr-TR")} ₺</p>
										</div>
										<div>
											<span className="text-[9px] text-muted-foreground uppercase">İcra</span>
											<p className="text-red-600 font-medium">-{Number(p.garnishment_deduction).toLocaleString("tr-TR")} ₺</p>
										</div>
									</div>
								</Card>
							);
						})}
					</div>

					{/* Desktop Table (>= md) */}
					<Card className="hidden md:block overflow-hidden">
						<CardContent className="p-0">
							<Table className="[&_th]:px-4 [&_th]:py-3.5 [&_td]:px-4 [&_td]:py-3">
								<TableHeader>
									<TableRow>
										<TableHead>Çalışan</TableHead>
										<TableHead>Taban Maaş</TableHead>
										<TableHead>Devamsızlık Kes.</TableHead>
										<TableHead>Mesai Ücreti</TableHead>
										<TableHead>Avans Mahsubu</TableHead>
										<TableHead>İcra Kesintisi</TableHead>
										<TableHead>Resmi Net (Banka)</TableHead>
										<TableHead>Banka Durumu</TableHead>
										<TableHead className="text-amber-600 dark:text-amber-400">Elden Tutar</TableHead>
										<TableHead className="text-amber-600 dark:text-amber-400">Elden Durumu</TableHead>
										<TableHead className="text-right">İşlemler</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{payrolls.map((p) => {
										const isBankPaid = p.payment_status === "PAID";
										const isCashPaid = p.cash_payment_status === "PAID";
										const hasCash = Number(p.cash_salary || 0) > 0;

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
														variant={isBankPaid ? "outline" : "secondary"}
														size="sm"
														className="h-8 gap-1 text-xs"
														onClick={() => handleToggleBankPaymentStatus(p)}
													>
														{isBankPaid ? (
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
												<TableCell className="text-amber-600 dark:text-amber-400 font-medium">
													{hasCash ? `${Number(p.cash_salary).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺` : "-"}
												</TableCell>
												<TableCell>
													{hasCash ? (
														<Button
															variant={isCashPaid ? "outline" : "secondary"}
															size="sm"
															className="h-8 gap-1 text-xs"
															onClick={() => handleToggleCashPaymentStatus(p)}
														>
															{isCashPaid ? (
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
													) : (
														<span className="text-muted-foreground font-normal text-xs">-</span>
													)}
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
				</>
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
