import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CompanyDto, CustomerStatement } from "../../../common/types";
import { format } from "date-fns";
import { formatCurrency } from "./utils";
import "./lexend-regular";
import i18n from "../i18n";

async function loadLogo(url: string): Promise<{ dataUrl: string; width: number; height: number } | null> {
	try {
		const res = await fetch(url);
		const blob = await res.blob();
		return await new Promise((resolve) => {
			const img = new Image();
			img.onload = () => {
				const canvas = document.createElement("canvas");
				const MAX_WIDTH = 500;
				const scale = MAX_WIDTH / img.width;
				let finalWidth = img.width;
				let finalHeight = img.height;

				// Only resize if image is larger than MAX_WIDTH
				if (scale < 1) {
					finalWidth = MAX_WIDTH;
					finalHeight = img.height * scale;
				}

				canvas.width = finalWidth;
				canvas.height = finalHeight;

				const ctx = canvas.getContext("2d");
				if (ctx) {
					ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
					resolve({
						dataUrl: canvas.toDataURL("image/png"),
						width: finalWidth,
						height: finalHeight,
					});
				} else {
					resolve(null);
				}
			};
			img.onerror = () => resolve(null);
			img.src = URL.createObjectURL(blob);
		});
	} catch {
		return null;
	}
}

export async function exportCustomerStatementPDF(
	statement: CustomerStatement,
	company: CompanyDto | null,
	dateRange: { from: Date; to: Date },
) {
	const doc = new jsPDF({ unit: "pt", format: "a4" });
	const pageWidth = doc.internal.pageSize.getWidth();
	const MARGIN_LEFT = 32; // unified horizontal margin
	const MARGIN_RIGHT = 32;
	const MARGIN_TOP = 28;
	let cursorY = MARGIN_TOP;
	const marginX = MARGIN_LEFT; // keep existing variable usage below

	let logoData: { dataUrl: string; width: number; height: number } | null = null;
	const baseUrl = import.meta.env.VITE_API_URL;
	if (company?.large_logo_path) {
		logoData = await loadLogo(`${baseUrl}/logo-proxy/${company.large_logo_path}`);
	} else if (company?.small_logo_path) {
		logoData = await loadLogo(`${baseUrl}/logo-proxy/${company.small_logo_path}`);
	} else {
		logoData = await loadLogo("/logo.webp");
	}

	// Header
	doc.setFont("Lexend-Regular");

	const MAX_LOGO_WIDTH = 120;
	const MAX_LOGO_HEIGHT = 60;
	let targetLogoWidth = MAX_LOGO_WIDTH;
	let targetLogoHeight = MAX_LOGO_HEIGHT;

	if (logoData) {
		const aspect = logoData.width / logoData.height;
		if (aspect > MAX_LOGO_WIDTH / MAX_LOGO_HEIGHT) {
			// constrained by width
			targetLogoWidth = MAX_LOGO_WIDTH;
			targetLogoHeight = MAX_LOGO_WIDTH / aspect;
		} else {
			// constrained by height
			targetLogoHeight = MAX_LOGO_HEIGHT;
			targetLogoWidth = MAX_LOGO_HEIGHT * aspect;
		}
	}

	const logoWidth = targetLogoWidth;

	// Left: Logo, Right: Company info (address + vergi no)
	const companyAddress = company?.address || "Hisar Mah. 1702. Sok. No:8 Tepebaşı Eskişehir";
	const companyTaxOffice = company?.tax_office ? `Vergi Dairesi: ${company.tax_office}` : "";
	const companyTaxNo = company?.tax_number ? `Vergi No: ${company.tax_number}` : "";
	const today = format(new Date(), "dd.MM.yyyy HH:mm");

	// Right side block (address + tax + date)
	const infoX = marginX + logoWidth + 28; // left boundary of info area
	const infoWidth = pageWidth - infoX - MARGIN_RIGHT; // available width for right block
	const infoRightX = pageWidth - MARGIN_RIGHT; // right alignment x

	const isAllTime =
		dateRange.from.getTime() === 0 &&
		dateRange.to.getFullYear() === 2100 &&
		dateRange.to.getMonth() === 0 &&
		dateRange.to.getDate() === 1;

	doc.setFontSize(11);
	doc.setTextColor(40);
	const infoLines: string[] = [companyAddress, `${companyTaxOffice}`, `${companyTaxNo}`];

	infoLines.push(`Oluşturma: ${today}`);

	if (!isAllTime) {
		const dateRangeStr = `${format(dateRange.from, "dd.MM.yyyy")} - ${format(dateRange.to, "dd.MM.yyyy")}`;
		infoLines.push(`${i18n.t("vars.date_range")}: ${dateRangeStr}`);
	}

	// Calculate text block height for centering
	const LINE_HEIGHT = 12;
	const MAX_CHARS = 70;
	let totalTextHeight = 0;
	infoLines.forEach((l) => {
		if (l.length > MAX_CHARS) {
			const numChunks = Math.ceil(l.length / MAX_CHARS);
			totalTextHeight += numChunks * LINE_HEIGHT;
		} else {
			totalTextHeight += LINE_HEIGHT;
		}
	});

	const headerHeight = Math.max(targetLogoHeight, totalTextHeight);
	const logoY = cursorY + (headerHeight - targetLogoHeight) / 2;
	let infoLineY = cursorY + (headerHeight - totalTextHeight) / 2 + 10; // +10 for baseline alignment

	if (logoData) {
		try {
			doc.addImage(logoData.dataUrl, "PNG", marginX, logoY, targetLogoWidth, targetLogoHeight);
		} catch {
			/* ignore */
		}
	}

	infoLines.forEach((l) => {
		if (l.length > MAX_CHARS) {
			const chunks = l.match(new RegExp(`.{1,${MAX_CHARS}}`, "g")) || [l];
			chunks.forEach((ch) => {
				doc.text(ch, infoRightX, infoLineY, { maxWidth: infoWidth, align: "right" });
				infoLineY += LINE_HEIGHT;
			});
		} else {
			doc.text(l, infoRightX, infoLineY, { maxWidth: infoWidth, align: "right" });
			infoLineY += LINE_HEIGHT;
		}
	});

	// Customer name FULL WIDTH under the header (with wrapping)
	const nameTopY = cursorY + headerHeight + 24;
	const fullWidth = pageWidth - MARGIN_LEFT - MARGIN_RIGHT;
	doc.setFontSize(14);
	doc.setTextColor(0, 0, 0);
	const fullName = statement.customer.name || "";
	// Simple manual wrap by words respecting text width
	const words = fullName.split(/\s+/);
	const lines: string[] = [];
	let currentLine = "";
	words.forEach((w) => {
		const test = (currentLine ? currentLine + " " : "") + w;
		if (doc.getTextWidth(test) > fullWidth && currentLine) {
			lines.push(currentLine);
			currentLine = w;
		} else {
			currentLine = test;
		}
	});
	if (currentLine) lines.push(currentLine);
	let lineY = nameTopY + 10;
	lines.slice(0, 5).forEach((l) => {
		// cap at 5 lines to avoid pushing too far
		doc.text(l, marginX, lineY, { maxWidth: fullWidth });
		lineY += 20;
	});
	const headerBottomY = lineY;
	doc.setDrawColor(180);
	doc.line(marginX, headerBottomY, pageWidth - marginX, headerBottomY);

	// Summary three columns below header separator (with 3 currencies each)
	// Summary three columns below header separator (with 3 currencies each)
	const colWidth = (pageWidth - MARGIN_LEFT - MARGIN_RIGHT) / 3;
	const boxY = headerBottomY + 10; // tighter spacing after full-width name block

	// Calculate totals from filtered data
	const totalDebt = statement.debts.reduce((sum, d) => {
		const val = Number(d.total_in_try);
		return sum + (isNaN(val) ? 0 : val);
	}, 0);
	const totalPayments = statement.payments.reduce((sum, p) => {
		const val = Number(p.amount_in_try);
		return sum + (isNaN(val) ? 0 : val);
	}, 0);
	const remainingDebt = totalDebt - totalPayments;

	const metrics = [
		{
			label: "Toplam Borç",
			values: [{ amount: totalDebt, curr: "TRY" }],
			color: [180, 30, 30],
		},
		{
			label: "Toplam Ödeme",
			values: [{ amount: totalPayments, curr: "TRY" }],
			color: [25, 135, 84],
		},
		{
			label: "Kalan",
			values: [{ amount: remainingDebt, curr: "TRY" }],
			color: [25, 70, 170],
		},
	];
	doc.setFontSize(11);
	metrics.forEach((m, i) => {
		const x = marginX + i * colWidth;
		doc.setTextColor(80);
		doc.text(m.label, x, boxY + 4);
		doc.setFontSize(10);
		doc.setTextColor(m.color[0], m.color[1], m.color[2]);
		let valueY = boxY + 20;
		m.values.forEach((v) => {
			doc.text(`${formatCurrency(v.amount, v.curr)}`, x, valueY);
			valueY += 14;
		});
		doc.setFontSize(11);
	});
	// reset color
	doc.setTextColor(0, 0, 0);
	// Reduce spacer before 'Borçlar' heading
	cursorY = boxY + 30; // adjusted for 3 currency lines
	doc.setDrawColor(200);
	doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
	cursorY += 12; // was +20

	// Debts table
	doc.setFontSize(12);
	doc.text("Borçlar", marginX, cursorY + 4);
	autoTable(doc, {
		startY: cursorY + 14,
		margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
		head: [["Tarih", "Fatura No", "Tutar", "KDV", "Toplam", "Para Birimi", "Kur", "Net Tutar"]],
		body: statement.debts.map((d) => [
			format(new Date(d.issue_date), "dd.MM.yyyy"),
			d.invoice_no || "-",
			formatCurrency(d.amount, d.currency),
			formatCurrency(d.vat, d.currency),
			formatCurrency(d.total, d.currency),
			d.currency,
			d.exchange_rate === 1 ? "-" : formatCurrency(d.exchange_rate, "TRY"),
			formatCurrency(d.total_in_try, "TRY"),
		]),
		styles: { fontSize: 8, font: "Lexend-Regular" },
		headStyles: { fillColor: [32, 45, 96], font: "Lexend-Regular", fontStyle: "normal" },
	});

	// Payments table
	doc.text("Ödemeler", marginX, (doc as any).lastAutoTable.finalY + 30);
	const afterDebtsY = (doc as any).lastAutoTable.finalY + 40;
	autoTable(doc, {
		startY: afterDebtsY,
		margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
		head: [["Tarih", "Fatura No", "Tutar", "Para Birimi", "Kur", "Net Tutar", "Yöntem"]],
		body: statement.payments.map((p) => [
			format(new Date(p.payment_date), "dd.MM.yyyy"),
			p.invoice_no || "-",
			formatCurrency(p.amount, p.currency),
			p.currency,
			p.exchange_rate === 1 ? "-" : formatCurrency(p.exchange_rate),
			formatCurrency(p.amount_in_try),
			p.payment_method === "cash"
				? "Nakit"
				: p.payment_method === "bank_transfer"
					? "Havale"
					: p.payment_method === "check"
						? "Çek"
						: p.payment_method === "card"
							? "Kart"
							: p.payment_method,
		]),
		styles: { fontSize: 8, font: "Lexend-Regular" },
		headStyles: { fillColor: [32, 45, 96], font: "Lexend-Regular", fontStyle: "normal" },
	});

	const pageCount = doc.getNumberOfPages();
	for (let i = 1; i <= pageCount; i++) {
		doc.setPage(i);
		const footerY = doc.internal.pageSize.getHeight() - 40;
		doc.setDrawColor(220);
		doc.line(MARGIN_LEFT, footerY, pageWidth - MARGIN_RIGHT, footerY);
		doc.setFontSize(8);
		doc.setTextColor(90);
		doc.text("COmma - Müşteri Borç Dökümü", MARGIN_LEFT, footerY + 15);
		doc.text(`Sayfa ${i} / ${pageCount}`, pageWidth - MARGIN_RIGHT, footerY + 15, { align: "right" });
	}

	doc.save(`${statement.customer.name.replace(/\s+/g, "_")}_dokum.pdf`);
}
