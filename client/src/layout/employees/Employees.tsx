import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmployeeApi } from "@/lib/api/employee";
import type { Employee } from "@common";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserPlus, Search, Edit, Trash2, Phone, Mail, CreditCard, Calendar } from "lucide-react";

import EmployeeDialog from "./components/EmployeeDialog";
import { toast } from "sonner";
import { PageLoader } from "@/components/shared/PageLoader";

export default function Employees() {
	const [search, setSearch] = useState("");
	const [dialogOpen, setDialogOpen] = useState(false);
	const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

	const { data: employees = [], isLoading, refetch } = useQuery({
		queryKey: ["employees"],
		queryFn: () => EmployeeApi.GetAllEmployees(),
	});

	const filteredEmployees = employees.filter((emp) => {
		const q = search.toLowerCase();
		const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
		const tc = emp.tc_no || "";
		const title = emp.title || "";
		return fullName.includes(q) || tc.includes(q) || title.toLowerCase().includes(q);
	});

	const handleAdd = () => {
		setSelectedEmployee(null);
		setDialogOpen(true);
	};

	const handleEdit = (employee: Employee) => {
		setSelectedEmployee(employee);
		setDialogOpen(true);
	};

	const handleDelete = async (employee: Employee) => {
		if (!confirm(`${employee.first_name} ${employee.last_name} çalışanını silmek istediğinize emin misiniz?`)) {
			return;
		}
		try {
			await EmployeeApi.DeleteEmployee(employee.id);
			toast.success("Çalışan silindi");
			refetch();
		} catch (err: any) {
			toast.error(err || "Silinirken hata oluştu");
		}
	};

	return (
		<div className="p-3 sm:p-6 space-y-4 sm:space-y-6 min-h-full flex-1 overflow-y-auto">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				<div>
					<h1 className="text-xl sm:text-2xl font-bold tracking-tight">Çalışan Listesi & Özlük Bilgileri</h1>
					<p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
						Çalışanların özlük, iletişim, IBAN ve taban maaş bilgilerini yönetin.
					</p>
				</div>
				<Button onClick={handleAdd} className="gap-2 w-full sm:w-auto">
					<UserPlus className="h-4 w-4" /> Yeni Çalışan Ekle
				</Button>
			</div>

			<div className="flex items-center space-x-2 w-full sm:max-w-sm">
				<Search className="h-4 w-4 text-muted-foreground shrink-0" />
				<Input
					placeholder="Ad, TC No veya Unvan ile ara..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className="text-sm"
				/>
			</div>

			{isLoading ? (
				<PageLoader />
			) : filteredEmployees.length === 0 ? (
				<Card>
					<CardContent className="p-8 text-center text-muted-foreground">
						Kayıtlı çalışan bulunamadı.
					</CardContent>
				</Card>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
					{filteredEmployees.map((emp) => (
						<Card key={emp.id} className="relative group hover:shadow-md transition-shadow">
							<CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0">
								<div>
									<CardTitle className="text-base sm:text-lg font-semibold">
										{emp.first_name} {emp.last_name}
									</CardTitle>
									<p className="text-xs sm:text-sm text-muted-foreground font-medium">
										{emp.title || "Unvan Belirtilmedi"} {emp.department ? `(${emp.department})` : ""}
									</p>
								</div>
								<div className="flex space-x-1 opacity-90">
									<Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleEdit(emp)}>
										<Edit className="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-600" onClick={() => handleDelete(emp)}>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</CardHeader>
							<CardContent className="space-y-2 text-sm">
								{emp.tc_no && (
									<div className="flex items-center text-muted-foreground">
										<span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded mr-2">TC</span>
										{emp.tc_no}
									</div>
								)}
								{emp.phone && (
									<div className="flex items-center text-muted-foreground">
										<Phone className="h-3.5 w-3.5 mr-2" />
										{emp.phone}
									</div>
								)}
								{emp.email && (
									<div className="flex items-center text-muted-foreground">
										<Mail className="h-3.5 w-3.5 mr-2" />
										{emp.email}
									</div>
								)}
								{emp.iban && (
									<div className="flex items-center text-muted-foreground">
										<CreditCard className="h-3.5 w-3.5 mr-2" />
										<span className="font-mono text-xs">{emp.iban}</span>
										{emp.bank_name ? ` (${emp.bank_name})` : ""}
									</div>
								)}
								<div className="flex items-center justify-between pt-2 border-t mt-2">
									<div className="flex items-center text-xs text-muted-foreground">
										<Calendar className="h-3.5 w-3.5 mr-1" />
										Giriş: {emp.hire_date ? String(emp.hire_date).split("T")[0] : "-"}
									</div>
									<div className="text-right">
										<div className="font-semibold text-primary text-sm">
											{Number(emp.base_salary).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺ <span className="text-[11px] text-muted-foreground font-normal">(Banka)</span>
										</div>
										{Number(emp.cash_salary) > 0 && (
											<div className="text-xs text-amber-600 font-medium">
												+{Number(emp.cash_salary).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺ <span className="text-[10px] text-muted-foreground">(Elden)</span>
											</div>
										)}
									</div>
								</div>

							</CardContent>
						</Card>
					))}
				</div>
			)}

			<EmployeeDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				employee={selectedEmployee}
				onSuccess={() => refetch()}
			/>
		</div>
	);
}
