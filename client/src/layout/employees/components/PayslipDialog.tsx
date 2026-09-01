import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { EmployeePayroll, Employee } from "@common";

import { Printer } from "lucide-react";

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	payroll?: EmployeePayroll | null;
	employee?: Employee | null;
};

export default function PayslipDialog({ open, onOpenChange, payroll, employee }: Props) {
	if (!payroll) return null;

	const handlePrint = () => {
		window.print();
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
				<DialogHeader>

					<DialogTitle className="no-print">Maaş Bordrosu & Ödeme Dökümü</DialogTitle>
				</DialogHeader>

				<div className="p-6 border rounded-lg space-y-6 bg-background text-foreground font-sans">
					<div className="flex justify-between items-start border-b pb-4">
						<div>
							<h2 className="text-xl font-bold uppercase tracking-wider">Maaş Pusulası / Bordro</h2>
							<p className="text-sm text-muted-foreground">
								Dönem: {payroll.period_month}/{payroll.period_year}
							</p>
						</div>
						<div className="text-right text-xs text-muted-foreground">
							<div>Düzenlenme Tarihi: {new Date().toLocaleDateString("tr-TR")}</div>
						</div>
					</div>

					{/* Employee info */}
					<div className="grid grid-cols-2 gap-4 text-sm bg-muted/40 p-3 rounded">
						<div>
							<span className="text-muted-foreground text-xs block">Çalışan Ad Soyad</span>
							<span className="font-semibold">{payroll.employee_name || `${employee?.first_name} ${employee?.last_name}`}</span>
						</div>
						<div>
							<span className="text-muted-foreground text-xs block">Unvan / Departman</span>
							<span className="font-semibold">{employee?.title || "-"} {employee?.department ? `(${employee.department})` : ""}</span>
						</div>
						<div>
							<span className="text-muted-foreground text-xs block">IBAN & Banka</span>
							<span className="font-mono text-xs">{employee?.iban || "-"} {employee?.bank_name ? `(${employee.bank_name})` : ""}</span>
						</div>
						<div>
							<span className="text-muted-foreground text-xs block">TC Kimlik No</span>
							<span className="font-mono text-xs">{employee?.tc_no || "-"}</span>
						</div>
					</div>

					{/* Calculation breakdown table */}
					<div className="space-y-2">
						<h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Maaş ve Kesinti Detayları</h3>
						<table className="w-full text-sm border-collapse">
							<tbody className="divide-y border-y">
								<tr>
									<td className="py-2 text-muted-foreground">Taban Maaş</td>
									<td className="py-2 text-right font-medium">{Number(payroll.base_salary).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</td>
								</tr>
								<tr>
									<td className="py-2 text-muted-foreground">Fazla Mesai Ücreti (+)</td>
									<td className="py-2 text-right font-medium text-emerald-600">+{Number(payroll.overtime_pay).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</td>
								</tr>
								{Number(payroll.bonus_pay) > 0 && (
									<tr>
										<td className="py-2 text-muted-foreground">Prim / Ek Ödeme (+)</td>
										<td className="py-2 text-right font-medium text-emerald-600">+{Number(payroll.bonus_pay).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</td>
									</tr>
								)}
								<tr>
									<td className="py-2 text-muted-foreground">Devamsızlık Kesintisi (-) ({payroll.absent_days} gün)</td>
									<td className="py-2 text-right font-medium text-red-500">-{Number(payroll.absence_deduction).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</td>
								</tr>
								<tr>
									<td className="py-2 text-muted-foreground">Avans Kesintisi / Mahsubu (-)</td>
									<td className="py-2 text-right font-medium text-red-500">-{Number(payroll.advance_deduction).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</td>
								</tr>
								<tr>
									<td className="py-2 text-muted-foreground">İcra Kesintisi (-)</td>
									<td className="py-2 text-right font-medium text-red-500">-{Number(payroll.garnishment_deduction).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</td>
								</tr>
								<tr className="bg-primary/10 font-bold text-base">
									<td className="py-3 px-2">NET ÖDENECEK TUTAR</td>
									<td className="py-3 px-2 text-right text-primary">{Number(payroll.net_payable).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺</td>
								</tr>
							</tbody>
						</table>
					</div>

					{/* Signatures */}
					<div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs text-muted-foreground">
						<div>
							<div className="font-semibold text-foreground mb-8">İşveren / Yetkili İmza</div>
							<div>______________________</div>
						</div>
						<div>
							<div className="font-semibold text-foreground mb-8">Çalışan İmza</div>
							<div>______________________</div>
						</div>
					</div>
				</div>

				<DialogFooter className="no-print">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Kapat
					</Button>
					<Button onClick={handlePrint} className="gap-2">
						<Printer className="h-4 w-4" /> Yazdır / PDF İndir
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
