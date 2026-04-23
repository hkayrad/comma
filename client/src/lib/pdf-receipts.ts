import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CompanyDto, DebtDto, PaymentDto } from "@comma/common";
import { format } from "date-fns";
import { formatCurrency } from "./utils";
import { MARGIN, COLORS, FONT, loadLogo, type LogoData } from "./pdf-new";
import i18n from "../i18n";

class BaseReceiptPDF {
    protected doc: jsPDF;
    protected cursorY: number;
    protected pageWidth: number;
    protected pageHeight: number;

    constructor() {
        this.doc = new jsPDF({ unit: "pt", format: "a4" });
        this.pageWidth = this.doc.internal.pageSize.getWidth();
        this.pageHeight = this.doc.internal.pageSize.getHeight();
        this.cursorY = MARGIN.TOP;
        this.doc.setFont(FONT);
    }

    protected async getLogo(company: CompanyDto | null): Promise<LogoData | null> {
        const baseUrl = import.meta.env.VITE_API_URL;
        let url = "/logo.webp"; // Default fallback

        if (company?.large_logo_path) {
            url = `${baseUrl}/logo-proxy/${company.large_logo_path}`;
        } else if (company?.small_logo_path) {
            url = `${baseUrl}/logo-proxy/${company.small_logo_path}`;
        }

        return loadLogo(url);
    }

    protected addHeader(logo: LogoData | null, company: CompanyDto | null, title: string) {
        const MAX_LOGO_WIDTH = 120;
        const MAX_LOGO_HEIGHT = 60;

        let pdfLogoWidth = 0;
        let pdfLogoHeight = 0;

        if (logo) {
            const aspect = logo.width / logo.height;
            if (aspect > MAX_LOGO_WIDTH / MAX_LOGO_HEIGHT) {
                pdfLogoWidth = MAX_LOGO_WIDTH;
                pdfLogoHeight = MAX_LOGO_WIDTH / aspect;
            } else {
                pdfLogoHeight = MAX_LOGO_HEIGHT;
                pdfLogoWidth = MAX_LOGO_HEIGHT * aspect;
            }
        } else {
            pdfLogoWidth = MAX_LOGO_WIDTH;
        }

        const companyAddress = company?.address || "";
        const companyTaxOffice = company?.tax_office ? `${i18n.t("vars.tax_office")}: ${company.tax_office}` : "";
        const companyTaxNo = company?.tax_number ? `${i18n.t("vars.tax_number")}: ${company.tax_number}` : "";
        const today = format(new Date(), "dd.MM.yyyy HH:mm");

        const infoLines: string[] = [];
        if (companyAddress) infoLines.push(companyAddress);
        if (companyTaxOffice) infoLines.push(companyTaxOffice);
        if (companyTaxNo) infoLines.push(companyTaxNo);
        infoLines.push(`${i18n.t("vars.created_at")}: ${today}`);

        if (logo) {
            this.doc.addImage(logo.dataUrl, "PNG", MARGIN.LEFT, MARGIN.TOP, pdfLogoWidth, pdfLogoHeight);
        }

        this.doc.setFontSize(11);
        this.doc.setTextColor(...COLORS.TEXT.SECONDARY);

        const infoRightX = this.pageWidth - MARGIN.RIGHT;
        const infoWidth = this.pageWidth - MARGIN.LEFT - pdfLogoWidth - 28 - MARGIN.RIGHT;
        const LINE_HEIGHT = 12;
        let textCursorY = MARGIN.TOP + 10;

        infoLines.forEach((line) => {
            const splitText = this.doc.splitTextToSize(line, infoWidth);
            this.doc.text(splitText, infoRightX, textCursorY, { align: "right" });
            textCursorY += (splitText.length * LINE_HEIGHT);
        });

        this.cursorY = Math.max(MARGIN.TOP + pdfLogoHeight, textCursorY) + 40;

        // Title
        this.doc.setFontSize(18);
        this.doc.setTextColor(...COLORS.TEXT.DEFAULT);
        this.doc.text(title, this.pageWidth / 2, this.cursorY, { align: "center" });
        this.cursorY += 30;
    }

    protected addCustomerInfo(name: string, taxNumber?: string | null) {
        this.doc.setFontSize(12);
        this.doc.setTextColor(...COLORS.TEXT.MUTED);
        this.doc.text(i18n.t("dialog.customer.details.title"), MARGIN.LEFT, this.cursorY);
        this.cursorY += 15;

        this.doc.setFontSize(14);
        this.doc.setTextColor(...COLORS.TEXT.DEFAULT);
        this.doc.text(name, MARGIN.LEFT, this.cursorY);
        this.cursorY += 18;

        if (taxNumber) {
            this.doc.setFontSize(11);
            this.doc.setTextColor(...COLORS.TEXT.SECONDARY);
            this.doc.text(`${i18n.t("vars.tax_number")}: ${taxNumber}`, MARGIN.LEFT, this.cursorY);
            this.cursorY += 15;
        }

        this.doc.setDrawColor(COLORS.LINES.DEFAULT);
        this.doc.line(MARGIN.LEFT, this.cursorY, this.pageWidth - MARGIN.RIGHT, this.cursorY);
        this.cursorY += 30;
    }

    protected addFooter(type: string) {
        const footerY = this.pageHeight - MARGIN.BOTTOM;
        this.doc.setDrawColor(COLORS.LINES.LIGHT);
        this.doc.line(MARGIN.LEFT, footerY, this.pageWidth - MARGIN.RIGHT, footerY);

        this.doc.setFontSize(8);
        this.doc.setTextColor(...COLORS.TEXT.FOOTER);
        this.doc.text(`Comma - ${type}`, MARGIN.LEFT, footerY + 15);
        this.doc.text(format(new Date(), "dd.MM.yyyy HH:mm"), this.pageWidth - MARGIN.RIGHT, footerY + 15, { align: "right" });
    }

    protected translatePaymentMethod(method: string): string {
        return i18n.t(`vars.${method}` as any);
    }
}

export class PaymentReceiptPDF extends BaseReceiptPDF {
    public async generate(payment: PaymentDto & { customer_name?: string; customer_tax_number?: string }, company: CompanyDto | null) {
        const logo = await this.getLogo(company);
        this.addHeader(logo, company, i18n.t("vars.payment").toUpperCase() + " " + i18n.t("vars.details").toUpperCase());
        this.addCustomerInfo(payment.customer_name || i18n.t("vars.customer"), payment.customer_tax_number);

        const head = [[i18n.t("vars.details"), i18n.t("vars.details")]];
        const body = [
            [i18n.t("payment.table.column.payment_date"), format(new Date(payment.payment_date), "dd.MM.yyyy")],
            [i18n.t("payment.table.column.payment_method"), this.translatePaymentMethod(payment.payment_method)],
            [i18n.t("payment.table.column.invoice_no"), payment.invoice_no || "-"],
            [i18n.t("payment.table.column.description"), payment.description || "-"],
            [i18n.t("payment.table.column.amount"), formatCurrency(payment.amount, payment.currency)],
        ];

        if (payment.currency !== "TRY") {
            body.push([i18n.t("payment.table.column.exchange_rate"), formatCurrency(payment.exchange_rate, "TRY")]);
            body.push([i18n.t("payment.table.column.amount_in_try"), formatCurrency(payment.amount_in_try || 0, "TRY")]);
        }

        autoTable(this.doc, {
            startY: this.cursorY,
            margin: { left: MARGIN.LEFT, right: MARGIN.RIGHT },
            head: head,
            body: body,
            styles: { fontSize: 10, font: FONT, cellPadding: 8 },
            headStyles: { fillColor: COLORS.TABLE.HEAD, font: FONT, fontStyle: "normal" },
            columnStyles: {
                0: { fontStyle: 'bold' },
            },
            theme: 'striped',
        });

        this.addFooter(i18n.t("vars.payment") + " " + i18n.t("vars.details"));

        const safeName = (payment.customer_name || "payment").replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ ]/g, "").replace(/\s+/g, "_");
        this.doc.save(`${safeName}_receipt_${format(new Date(payment.payment_date), "ddMMyyyy")}.pdf`);
    }
}

export class DebtInvoicePDF extends BaseReceiptPDF {
    public async generate(debt: DebtDto & { customer_name?: string; customer_tax_number?: string }, company: CompanyDto | null) {
        const logo = await this.getLogo(company);
        this.addHeader(logo, company, i18n.t("vars.debt_status.has_receivable").toUpperCase() + " " + i18n.t("vars.details").toUpperCase());
        this.addCustomerInfo(debt.customer_name || i18n.t("vars.customer"), debt.customer_tax_number);

        const head = [[i18n.t("vars.details"), i18n.t("vars.details")]];
        const body = [
            [i18n.t("debt.table.column.issue_date"), format(new Date(debt.issue_date), "dd.MM.yyyy")],
            [i18n.t("debt.table.column.due_date"), debt.due_date ? format(new Date(debt.due_date), "dd.MM.yyyy") : "-"],
            [i18n.t("debt.table.column.invoice_no"), debt.invoice_no || "-"],
            [i18n.t("debt.table.column.description"), debt.description || "-"],
            [i18n.t("debt.table.column.amount"), formatCurrency(debt.amount, debt.currency)],
            [i18n.t("debt.table.column.vat"), formatCurrency(debt.vat, debt.currency)],
        ];

        if (debt.withholding > 0) {
            body.push([i18n.t("debt.table.column.withholding"), formatCurrency(debt.withholding, debt.currency)]);
        }

        body.push([i18n.t("debt.table.column.total"), formatCurrency(debt.total || (debt.amount + debt.vat), debt.currency)]);

        if (debt.currency !== "TRY") {
            body.push([i18n.t("debt.table.column.exchange_rate"), formatCurrency(debt.exchange_rate, "TRY")]);
            body.push([i18n.t("debt.table.column.total_in_try"), formatCurrency(debt.total_in_try || 0, "TRY")]);
        }

        autoTable(this.doc, {
            startY: this.cursorY,
            margin: { left: MARGIN.LEFT, right: MARGIN.RIGHT },
            head: head,
            body: body,
            styles: { fontSize: 10, font: FONT, cellPadding: 8 },
            headStyles: { fillColor: COLORS.TABLE.HEAD, font: FONT, fontStyle: "normal" },
            columnStyles: {
                0: { fontStyle: 'bold' },
            },
            theme: 'striped',
        });

        this.addFooter(i18n.t("vars.debt") + " " + i18n.t("vars.details"));

        const safeName = (debt.customer_name || "debt").replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ ]/g, "").replace(/\s+/g, "_");
        this.doc.save(`${safeName}_invoice_${format(new Date(debt.issue_date), "ddMMyyyy")}.pdf`);
    }
}

export async function exportPaymentReceiptPDF(payment: PaymentDto, company: CompanyDto | null) {
    const generator = new PaymentReceiptPDF();
    await generator.generate(payment, company);
}

export async function exportDebtInvoicePDF(debt: DebtDto, company: CompanyDto | null) {
    const generator = new DebtInvoicePDF();
    await generator.generate(debt, company);
}
