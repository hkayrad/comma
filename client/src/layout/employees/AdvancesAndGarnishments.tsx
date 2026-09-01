import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { EmployeeApi } from "@/lib/api/employee";
import type { EmployeeGarnishment } from "@common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Receipt, Landmark, Trash2, Pencil } from "lucide-react";
import AdvanceDialog from "./components/AdvanceDialog";
import GarnishmentDialog from "./components/GarnishmentDialog";
import { PageLoader } from "@/components/shared/PageLoader";
import { toast } from "sonner";

export default function AdvancesAndGarnishments() {
	const [activeTab, setActiveTab] = useState("advances");
	const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false);
	const [garnishmentDialogOpen, setGarnishmentDialogOpen] = useState(false);
	const [selectedGarnishment, setSelectedGarnishment] = useState<EmployeeGarnishment | null>(null);

	const { data: employees = [] } = useQuery({
		queryKey: ["employees"],
		queryFn: () => EmployeeApi.GetAllEmployees(),
	});

	const { data: advances = [], isLoading: loadingAdvances, refetch: refetchAdvances } = useQuery({
		queryKey: ["advances"],
		queryFn: () => EmployeeApi.GetAdvances(),
	});

	const { data: garnishments = [], isLoading: loadingGarnishments, refetch: refetchGarnishments } = useQuery({
		queryKey: ["garnishments"],
		queryFn: () => EmployeeApi.GetGarnishments(),
	});

	const handleDeleteAdvance = async (id: string) => {
		try {
			await EmployeeApi.DeleteAdvance(id);
			toast.success("Avans kaydı silindi");
			refetchAdvances();
		} catch (err: any) {
			toast.error(err || "Silinemedi");
		}
	};

	const handleDeleteGarnishment = async (id: string) => {
		try {
			await EmployeeApi.DeleteGarnishment(id);
			toast.success("İcra kaydı silindi");
			refetchGarnishments();
		} catch (err: any) {
			toast.error(err || "Silinemedi");
		}
	};

	const handleOpenNewGarnishment = () => {
		setSelectedGarnishment(null);
		setGarnishmentDialogOpen(true);
	};

	const handleEditGarnishment = (gar: EmployeeGarnishment) => {
		setSelectedGarnishment(gar);
		setGarnishmentDialogOpen(true);
	};

	return (
		<div className="p-6 space-y-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div>
					<h1 className="text-2xl font-bold tracking-tight">Avans & İcra Takibi</h1>
					<p className="text-muted-foreground text-sm">
						Çalışan avans talepleri ve icra kesintisi dosyalarını yönetin.
					</p>
				</div>
			</div>

			<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<TabsList className="grid grid-cols-2 w-full sm:w-80">
						<TabsTrigger value="advances" className="gap-2">
							<Receipt className="h-4 w-4" /> Avanslar
						</TabsTrigger>
						<TabsTrigger value="garnishments" className="gap-2">
							<Landmark className="h-4 w-4" /> İcra Dosyaları
						</TabsTrigger>
					</TabsList>

					<div>
						{activeTab === "advances" ? (
							<Button onClick={() => setAdvanceDialogOpen(true)} className="gap-2">
								<Plus className="h-4 w-4" /> Yeni Avans Girişi
							</Button>
						) : (
							<Button onClick={handleOpenNewGarnishment} className="gap-2">
								<Plus className="h-4 w-4" /> Yeni İcra Dosyası
							</Button>
						)}
					</div>
				</div>

				{/* Advances Tab */}
				<TabsContent value="advances" className="space-y-4 pt-2">
					{loadingAdvances ? (
						<PageLoader />
					) : advances.length === 0 ? (
						<Card>
							<CardContent className="p-8 text-center text-muted-foreground">
								Henüz avans kaydı bulunmuyor.
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardContent className="p-0">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Tarih</TableHead>
											<TableHead>Çalışan</TableHead>
											<TableHead>Tutar</TableHead>
											<TableHead>Açıklama</TableHead>
											<TableHead>Durum</TableHead>
											<TableHead className="text-right">İşlem</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{advances.map((adv) => (
											<TableRow key={adv.id}>
												<TableCell className="font-medium">
													{String(adv.request_date).split("T")[0]}
												</TableCell>
												<TableCell className="font-semibold">
													{adv.employee_name}
												</TableCell>
												<TableCell className="font-bold text-amber-600">
													{Number(adv.amount).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
												</TableCell>
												<TableCell className="text-muted-foreground">
													{adv.description || "-"}
												</TableCell>
												<TableCell>
													<span className={`px-2 py-1 rounded-full text-xs font-semibold ${
														adv.status === "DEDUCTED"
															? "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
															: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
													}`}>
														{adv.status === "DEDUCTED" ? "Maaştan Düşüldü" : "Aktif (Bekliyor)"}
													</span>
												</TableCell>
												<TableCell className="text-right">
													<Button
														variant="ghost"
														size="icon"
														className="h-8 w-8 text-red-500 hover:text-red-600"
														onClick={() => handleDeleteAdvance(adv.id)}
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							</CardContent>
						</Card>
					)}
				</TabsContent>

				{/* Garnishments Tab */}
				<TabsContent value="garnishments" className="space-y-4 pt-2">
					{loadingGarnishments ? (
						<PageLoader />
					) : garnishments.length === 0 ? (
						<Card>
							<CardContent className="p-8 text-center text-muted-foreground">
								Henüz icra dosyası kaydı girilmemiş.
							</CardContent>
						</Card>
					) : (
						<Card>
							<CardContent className="p-0">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Başlangıç</TableHead>
											<TableHead>Çalışan</TableHead>
											<TableHead>İcra Dairesi & Dosya No</TableHead>
											<TableHead>Toplam Borç</TableHead>
											<TableHead>Kesinti Mantığı</TableHead>
											<TableHead>Kesilen / Kalan</TableHead>
											<TableHead>Durum</TableHead>
											<TableHead className="text-right">İşlem</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{garnishments.map((gar) => {
											const rem = Number(gar.remaining_debt) || 0;
											return (
												<TableRow key={gar.id}>
													<TableCell className="font-medium text-xs">
														{gar.start_date ? String(gar.start_date).split("T")[0] : "-"}
													</TableCell>
													<TableCell className="font-semibold">
														{gar.employee_name}
													</TableCell>

													<TableCell>
														<div className="font-medium">{gar.execution_office}</div>
														<div className="text-xs text-muted-foreground font-mono">{gar.file_no}</div>
													</TableCell>
													<TableCell className="font-bold text-red-600">
														{Number(gar.total_debt).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} ₺
													</TableCell>
													<TableCell>
														{gar.deduction_type === "PERCENTAGE"
															? `%${gar.deduction_value} Maaş Kesintisi`
															: `${gar.deduction_value} ₺ Sabit Kesinti`}
													</TableCell>
													<TableCell className="text-xs">
														<div className="text-emerald-600 font-medium">Ödenen: {Number(gar.paid_amount).toLocaleString("tr-TR")} ₺</div>
														<div className="text-red-500 font-medium">Kalan: {rem.toLocaleString("tr-TR")} ₺</div>
													</TableCell>
													<TableCell>
														<span className={`px-2 py-1 rounded-full text-xs font-semibold ${
															gar.status === "COMPLETED"
																? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
																: gar.status === "PAUSED"
																? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
																: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
														}`}>
															{gar.status === "COMPLETED"
																? "Tamamlandı"
																: gar.status === "PAUSED"
																? "Durduruldu"
																: "Devam Ediyor"}
														</span>
													</TableCell>
													<TableCell className="text-right space-x-1">
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-black dark:text-white hover:bg-muted"
															onClick={() => handleEditGarnishment(gar)}
														>
															<Pencil className="h-4 w-4" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-red-500 hover:text-red-600"
															onClick={() => handleDeleteGarnishment(gar.id)}
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
				</TabsContent>
			</Tabs>

			<AdvanceDialog
				open={advanceDialogOpen}
				onOpenChange={setAdvanceDialogOpen}
				employees={employees}
				onSuccess={() => refetchAdvances()}
			/>

			<GarnishmentDialog
				open={garnishmentDialogOpen}
				onOpenChange={setGarnishmentDialogOpen}
				employees={employees}
				garnishment={selectedGarnishment}
				onSuccess={() => refetchGarnishments()}
			/>
		</div>
	);
}
