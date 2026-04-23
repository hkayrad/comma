import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CompanyDto, CustomerStatement } from "@comma/common";
import { format } from "date-fns";
import { formatCurrency } from "./utils";
import "./lexend-regular";
import i18n from "../i18n";

// --- Constants ---

export const MARGIN = {
    LEFT: 32,
    RIGHT: 32,
    TOP: 28,
    BOTTOM: 40,
};

export const COLORS = {
    TEXT: {
        DEFAULT: [0, 0, 0] as [number, number, number],
        SECONDARY: [40, 40, 40] as [number, number, number],
        MUTED: [80, 80, 80] as [number, number, number],
        FOOTER: [90, 90, 90] as [number, number, number],
    },
    ACCENT: {
        RED: [180, 30, 30] as [number, number, number],
        GREEN: [25, 135, 84] as [number, number, number],
        BLUE: [25, 70, 170] as [number, number, number],
    },
    TABLE: {
        HEAD: [32, 45, 96] as [number, number, number],
    },
    LINES: {
        DEFAULT: 180 as number,
        LIGHT: 220 as number,
    }
};

export const FONT = "Lexend-Regular";

// --- Interfaces ---

export interface LogoData {
    dataUrl: string;
    width: number;
    height: number;
}

// --- Helper Functions ---

export async function loadLogo(url: string): Promise<LogoData | null> {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Failed to fetch logo: ${res.statusText}`);

        const blob = await res.blob();
        return await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const MAX_WIDTH = 500;
                // Resize if image is larger than MAX_WIDTH
                const scale = Math.min(1, MAX_WIDTH / img.width);

                const finalWidth = img.width * scale;
                const finalHeight = img.height * scale;

                const canvas = document.createElement("canvas");
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
    } catch (error) {
        console.warn("Error loading logo for PDF:", error);
        return null;
    }
}

// --- Main Class ---

export class CustomerStatementPDF {
    private doc: jsPDF;
    private cursorY: number;
    private pageWidth: number;
    private pageHeight: number;

    constructor() {
        this.doc = new jsPDF({ unit: "pt", format: "a4" });
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        this.cursorY = MARGIN.TOP;
        this.doc.setFont(FONT);
    }

    /**
     * Resolves the logo URL based on company settings and loads it.
     */
    private async getLogo(company: CompanyDto | null): Promise<LogoData | null> {
        const baseUrl = import.meta.env.VITE_API_URL;
        let url = "/logo.webp"; // Default fallback

        if (company?.large_logo_path) {
            url = `${baseUrl}/logo-proxy/${company.large_logo_path}`;
        } else if (company?.small_logo_path) {
            url = `${baseUrl}/logo-proxy/${company.small_logo_path}`;
        }

        return loadLogo(url);
    }

    private addHeader(logo: LogoData | null, company: CompanyDto | null, dateRange: { from: Date; to: Date }) {
        const MAX_LOGO_WIDTH = 120;
        const MAX_LOGO_HEIGHT = 60;

        let pdfLogoWidth = 0;
        let pdfLogoHeight = 0;

        if (logo) {
            const aspect = logo.width / logo.height;
            if (aspect > MAX_LOGO_WIDTH / MAX_LOGO_HEIGHT) {
                // Constrained by width
                pdfLogoWidth = MAX_LOGO_WIDTH;
                pdfLogoHeight = MAX_LOGO_WIDTH / aspect;
            } else {
                // Constrained by height
                pdfLogoHeight = MAX_LOGO_HEIGHT;
                pdfLogoWidth = MAX_LOGO_HEIGHT * aspect;
            }
        } else {
            // Reserve space even if no logo, or set to 0 to collapse
            pdfLogoWidth = MAX_LOGO_WIDTH;
        }

        // Prepare info lines
        const companyAddress = company?.address || "Hisar Mah. 1702. Sok. No:8 Tepebaşı Eskişehir";
        const companyTaxOffice = company?.tax_office ? `Vergi Dairesi: ${company.tax_office}` : "";
        const companyTaxNo = company?.tax_number ? `Vergi No: ${company.tax_number}` : "";
        const today = format(new Date(), "dd.MM.yyyy HH:mm");

        // Check if date range is effectively "All Time"
        const isAllTime =
            dateRange.from.getTime() === 0 &&
            dateRange.to.getFullYear() === 2100;

        const infoLines: string[] = [companyAddress];
        if (companyTaxOffice) infoLines.push(companyTaxOffice);
        if (companyTaxNo) infoLines.push(companyTaxNo);
        infoLines.push(`Oluşturma: ${today}`);

        if (!isAllTime) {
            const dateRangeStr = `${format(dateRange.from, "dd.MM.yyyy")} - ${format(dateRange.to, "dd.MM.yyyy")}`;
            infoLines.push(`${i18n.t("vars.date_range")}: ${dateRangeStr}`);
        }

        // Render Logo
        if (logo) {
            // Centering logo in its allocated vertical space usually looks better if height varies
            // But top alignment is consistent.
            this.doc.addImage(logo.dataUrl, "PNG", MARGIN.LEFT, MARGIN.TOP, pdfLogoWidth, pdfLogoHeight);
        }

        // Render Info Text (Right Aligned)
        this.doc.setFontSize(11);
        this.doc.setTextColor(...COLORS.TEXT.SECONDARY);

        const infoRightX = this.pageWidth - MARGIN.RIGHT;
        const infoWidth = this.pageWidth - MARGIN.LEFT - pdfLogoWidth - 28 - MARGIN.RIGHT;
        const LINE_HEIGHT = 12;
        let textCursorY = MARGIN.TOP + 10; // Slight top offset for visual balance

        infoLines.forEach((line) => {
            // splitTextToSize handles wrapping
            const splitText = this.doc.splitTextToSize(line, infoWidth);
            this.doc.text(splitText, infoRightX, textCursorY, { align: "right" });
            textCursorY += (splitText.length * LINE_HEIGHT);
        });

        // Move cursor below the taller of the two columns (Logo or Text)
        this.cursorY = Math.max(MARGIN.TOP + pdfLogoHeight, textCursorY) + 20;
    }

    private addCustomerTitle(name: string) {
        this.doc.setFontSize(14);
        this.doc.setTextColor(...COLORS.TEXT.DEFAULT);

        const fullWidth = this.pageWidth - MARGIN.LEFT - MARGIN.RIGHT;
        const splitName = this.doc.splitTextToSize(name, fullWidth);

        this.doc.text(splitName, MARGIN.LEFT, this.cursorY);

        const textHeight = splitName.length * 18;
        this.cursorY += textHeight + 6;

        // Separator line
        this.doc.setDrawColor(COLORS.LINES.DEFAULT);
        this.doc.line(MARGIN.LEFT, this.cursorY, this.pageWidth - MARGIN.RIGHT, this.cursorY);
        this.cursorY += 10;
    }

    private addSummary(statement: CustomerStatement) {
        // Calculate totals
        const totalDebt = statement.debts.reduce((sum, d) => sum + (Number(d.total_in_try) || 0), 0);
        const totalPayments = statement.payments.reduce((sum, p) => sum + (Number(p.amount_in_try) || 0), 0);
        const remainingDebt = totalDebt - totalPayments;

        const metrics = [
            {
                label: "Toplam Borç",
                amount: totalDebt,
                color: COLORS.ACCENT.RED,
            },
            {
                label: "Toplam Ödeme",
                amount: totalPayments,
                color: COLORS.ACCENT.GREEN,
            },
            {
                label: "Kalan",
                amount: remainingDebt,
                color: COLORS.ACCENT.BLUE,
            },
        ];

        const colWidth = (this.pageWidth - MARGIN.LEFT - MARGIN.RIGHT) / 3;
        const boxY = this.cursorY + 10;

        metrics.forEach((m, i) => {
            const x = MARGIN.LEFT + i * colWidth;

            this.doc.setFontSize(11);
            this.doc.setTextColor(...COLORS.TEXT.MUTED);
            this.doc.text(m.label, x, boxY);

            this.doc.setFontSize(10);
            this.doc.setTextColor(...m.color);
            this.doc.text(formatCurrency(m.amount, "TRY"), x, boxY + 16);
        });

        // Move past summary
        this.cursorY = boxY + 40;

        // Separator
        this.doc.setTextColor(...COLORS.TEXT.DEFAULT); // Reset
        this.doc.setDrawColor(200);
        this.doc.line(MARGIN.LEFT, this.cursorY, this.pageWidth - MARGIN.RIGHT, this.cursorY);
        this.cursorY += 20;
    }

    private addTable(title: string, head: string[][], body: (string | number)[][]) {
        this.doc.setFontSize(12);
        this.doc.setTextColor(...COLORS.TEXT.DEFAULT);
        this.doc.text(title, MARGIN.LEFT, this.cursorY);

        autoTable(this.doc, {
            startY: this.cursorY + 10,
            margin: { left: MARGIN.LEFT, right: MARGIN.RIGHT },
            head: head,
            body: body,
            styles: { fontSize: 8, font: FONT },
            headStyles: { fillColor: COLORS.TABLE.HEAD, font: FONT, fontStyle: "normal" },
            theme: 'striped',
        });

        // Update cursor to end of table
        this.cursorY = (this.doc as any).lastAutoTable.finalY + 30;
    }

    private addDebtsTable(debts: CustomerStatement['debts']) {
        const head = [["Tarih", "Fatura No", "Tutar", "KDV", "Toplam", "Para Birimi", "Kur", "Net Tutar"]];
        const body = debts.map((d) => [
            format(new Date(d.issue_date), "dd.MM.yyyy"),
            d.invoice_no || "-",
            formatCurrency(d.amount, d.currency),
            formatCurrency(d.vat, d.currency),
            formatCurrency(d.total, d.currency),
            d.currency,
            d.exchange_rate === 1 ? "-" : formatCurrency(d.exchange_rate, "TRY"),
            formatCurrency(d.total_in_try, "TRY"),
        ]);

        this.addTable("Borçlar", head, body);
    }

    private addPaymentsTable(payments: CustomerStatement['payments']) {
        const head = [["Tarih", "Fatura No", "Tutar", "Para Birimi", "Kur", "Net Tutar", "Yöntem"]];
        const body = payments.map((p) => [
            format(new Date(p.payment_date), "dd.MM.yyyy"),
            p.invoice_no || "-",
            formatCurrency(p.amount, p.currency),
            p.currency,
            p.exchange_rate === 1 ? "-" : formatCurrency(p.exchange_rate),
            formatCurrency(p.amount_in_try),
            this.translatePaymentMethod(p.payment_method),
        ]);

        this.addTable("Ödemeler", head, body);
    }

    private translatePaymentMethod(method: string): string {
        const map: Record<string, string> = {
            "cash": "Nakit",
            "bank_transfer": "Havale",
            "check": "Çek",
            "card": "Kart"
        };
        return map[method] || method;
    }

    private addFooter() {
        const pageCount = this.doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            this.doc.setPage(i);
            const footerY = this.pageHeight - MARGIN.BOTTOM;

            this.doc.setDrawColor(COLORS.LINES.LIGHT);
            this.doc.line(MARGIN.LEFT, footerY, this.pageWidth - MARGIN.RIGHT, footerY);

            this.doc.setFontSize(8);
            this.doc.setTextColor(...COLORS.TEXT.FOOTER);
            this.doc.text("Comma - Müşteri Borç Dökümü", MARGIN.LEFT, footerY + 15);
            this.doc.text(`Sayfa ${i} / ${pageCount}`, this.pageWidth - MARGIN.RIGHT, footerY + 15, { align: "right" });
        }
    }

    public async generate(statement: CustomerStatement, company: CompanyDto | null, dateRange: { from: Date; to: Date }) {
        const logo = await this.getLogo(company);

        this.addHeader(logo, company, dateRange);
        // Ensure name exists
        this.addCustomerTitle(statement.customer.name || "Müşteri");
        this.addSummary(statement);
        this.addDebtsTable(statement.debts);
        this.addPaymentsTable(statement.payments);
        this.addFooter();

        // Sanitize filename
        const safeName = (statement.customer.name || "customer").replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ ]/g, "").replace(/\s+/g, "_");
        this.doc.save(`${safeName}_dokum.pdf`);
    }
}

/**
 * Public export function that instantiates the class and generates the PDF.
 * This matches the signature of the previous implementation for backward compatibility.
 */
export async function exportCustomerStatementPDF(
    statement: CustomerStatement,
    company: CompanyDto | null,
    dateRange: { from: Date; to: Date },
) {
    const generator = new CustomerStatementPDF();
    await generator.generate(statement, company, dateRange);
}
