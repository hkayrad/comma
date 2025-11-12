import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CustomerStatement } from "../../../common/types";
import { format } from "date-fns";
import { formatCurrency } from "./utils";
import "./lexend-regular";

async function loadLogo(): Promise<string | null> {
	try {
		const res = await fetch("/hks-logo.png"); // served from public/
		const blob = await res.blob();
		return await new Promise((resolve) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.readAsDataURL(blob);
		});
	} catch {
		return null;
	}
}

export async function exportCustomerStatementPDF(statement: CustomerStatement) {
	const doc = new jsPDF({ unit: "pt", format: "a4" });
	const pageWidth = doc.internal.pageSize.getWidth();
	const MARGIN_LEFT = 32; // unified horizontal margin
	const MARGIN_RIGHT = 32;
	const MARGIN_TOP = 28;
	let cursorY = MARGIN_TOP;
	const marginX = MARGIN_LEFT; // keep existing variable usage below

	const logoDataUrl = await loadLogo();

	// Header
	doc.setFont("Lexend-Regular");
	// Original logo size: 608x139 -> aspect ratio width/height ≈ 4.373
	// We'll choose a display width that fits left side nicely while leaving room for title on the right.
	const targetLogoWidth = 140; // adjust if needed
	const aspect = 608 / 139;
	const targetLogoHeight = targetLogoWidth / aspect; // ≈ 32px
	const logoWidth = targetLogoWidth;
	const logoHeight = targetLogoHeight;
	// Left: Logo, Right: Company info (address + vergi no)
	const companyAddress = "Hisar Mah. 1702. Sok. No:8 Tepebaşı Eskişehir"; // TODO: externalize if needed
	const companyTaxNo = "Vergi No: 4540091806";
	const today = format(new Date(), "dd.MM.yyyy HH:mm");

	if (logoDataUrl) {
		try {
			doc.addImage(logoDataUrl, "PNG", marginX, cursorY, logoWidth, logoHeight);
		} catch {
			/* ignore */
		}
	}

	// Right side block (address + tax + date)
	const infoX = marginX + logoWidth + 28; // left boundary of info area
	const infoWidth = pageWidth - infoX - MARGIN_RIGHT; // available width for right block
	const infoRightX = pageWidth - MARGIN_RIGHT; // right alignment x
	doc.setFontSize(11);
	doc.setTextColor(40);
	const infoLines: string[] = [companyAddress, companyTaxNo, `Oluşturma: ${today}`];
	let infoLineY = cursorY + 4;
	infoLines.forEach((l) => {
		const maxChars = 70;
		if (l.length > maxChars) {
			const chunks = l.match(new RegExp(`.{1,${maxChars}}`, "g")) || [l];
			chunks.forEach((ch) => {
				doc.text(ch, infoRightX, infoLineY, { maxWidth: infoWidth, align: "right" });
				infoLineY += 12;
			});
		} else {
			doc.text(l, infoRightX, infoLineY, { maxWidth: infoWidth, align: "right" });
			infoLineY += 12;
		}
	});

	// Customer name FULL WIDTH under the header (with wrapping)
	const nameTopY = Math.max(cursorY + logoHeight, infoLineY) + 14;
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
	let lineY = nameTopY;
	lines.slice(0, 5).forEach((l) => {
		// cap at 5 lines to avoid pushing too far
		doc.text(l, marginX, lineY, { maxWidth: fullWidth });
		lineY += 20;
	});
	const headerBottomY = lineY;
	doc.setDrawColor(180);
	doc.line(marginX, headerBottomY, pageWidth - marginX, headerBottomY);

	// Summary three columns below header separator (with 3 currencies each)
	const { customer } = statement;
	const colWidth = (pageWidth - MARGIN_LEFT - MARGIN_RIGHT) / 3;
	const boxY = headerBottomY + 10; // tighter spacing after full-width name block
	const metrics = [
		{
			label: "Toplam Borç",
			values: [
				{ amount: customer.total_debt_try || 0, curr: "TRY" },
				{ amount: customer.total_debt_usd || 0, curr: "USD" },
				{ amount: customer.total_debt_eur || 0, curr: "EUR" },
			],
			color: [180, 30, 30],
		},
		{
			label: "Toplam Ödeme",
			values: [
				{ amount: customer.total_payments_try || 0, curr: "TRY" },
				{ amount: customer.total_payments_usd || 0, curr: "USD" },
				{ amount: customer.total_payments_eur || 0, curr: "EUR" },
			],
			color: [25, 135, 84],
		},
		{
			label: "Kalan",
			values: [
				{ amount: customer.remaining_debt_try || 0, curr: "TRY" },
				{ amount: customer.remaining_debt_usd || 0, curr: "USD" },
				{ amount: customer.remaining_debt_eur || 0, curr: "EUR" },
			],
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
	cursorY = boxY + 60; // adjusted for 3 currency lines
	doc.setDrawColor(200);
	doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
	cursorY += 12; // was +20

	// Debts table
	doc.setFontSize(12);
	doc.text("Borçlar", marginX, cursorY + 4);
	autoTable(doc, {
		startY: cursorY + 14,
		margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
		head: [["Tarih", "Fatura No", "Tutar", "KDV", "Toplam", "Para Birimi"]],
		body: statement.debts.map((d) => [
			format(new Date(d.issue_date), "dd.MM.yyyy"),
			d.invoice_no || "-",
			formatCurrency(d.amount, d.currency),
			formatCurrency(d.vat, d.currency),
			formatCurrency(parseFloat(d.total_amount || "0"), d.currency),
			d.currency,
		]),
		styles: { fontSize: 8, font: "Lexend-Regular" },
		headStyles: { fillColor: [32, 45, 96] },
		didDrawPage: (data: { pageNumber: number }) => {
			const pageCount = doc.getNumberOfPages();
			// Footer with separator
			const footerY = doc.internal.pageSize.getHeight() - 40;
			doc.setDrawColor(220);
			doc.line(MARGIN_LEFT, footerY, pageWidth - MARGIN_RIGHT, footerY);
			doc.setFontSize(8);
			doc.setTextColor(90);
			doc.text("HKS IO - Müşteri Borç Dökümü", MARGIN_LEFT, footerY + 15);
			doc.text(`Sayfa ${data.pageNumber} / ${pageCount}`, pageWidth - MARGIN_RIGHT, footerY + 15, { align: "right" });
		},
	});

	// Payments table
	doc.text("Ödemeler", marginX, (doc as any).lastAutoTable.finalY + 30);
	const afterDebtsY = (doc as any).lastAutoTable.finalY + 40;
	autoTable(doc, {
		startY: afterDebtsY,
		margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
		head: [["Tarih", "Fatura No", "Tutar", "Para Birimi", "Yöntem"]],
		body: statement.payments.map((p) => [
			format(new Date(p.payment_date), "dd.MM.yyyy"),
			p.invoice_no || "-",
			formatCurrency(p.amount),
			p.currency,
			p.payment_method === "cash"
				? "Nakit"
				: p.payment_method === "bank_transfer"
					? "Havale"
					: p.payment_method === "check"
						? "Çek"
						: p.payment_method,
		]),
		styles: { fontSize: 8, font: "Lexend-Regular" },
		headStyles: { fillColor: [32, 45, 96] },
		didDrawPage: (data: { pageNumber: number }) => {
			const pageCount = doc.getNumberOfPages();
			const footerY = doc.internal.pageSize.getHeight() - 40;
			doc.setDrawColor(220);
			doc.line(MARGIN_LEFT, footerY, pageWidth - MARGIN_RIGHT, footerY);
			doc.setFontSize(8);
			doc.setTextColor(90);
			doc.text("HKS IO - Müşteri Borç Dökümü", MARGIN_LEFT, footerY + 15);
			doc.text(`Sayfa ${data.pageNumber} / ${pageCount}`, pageWidth - MARGIN_RIGHT, footerY + 15, { align: "right" });
		},
	});

	doc.save(`${statement.customer.name.replace(/\s+/g, "_")}_dokum.pdf`);
}
