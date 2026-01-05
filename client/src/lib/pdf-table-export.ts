import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CompanyDto } from "../../../common/types";
import { format } from "date-fns";
import "./lexend-regular";
import i18n from "../i18n";

// --- Constants ---

const MARGIN = {
    LEFT: 32,
    RIGHT: 32,
    TOP: 28,
    BOTTOM: 40,
};

const COLORS = {
    TEXT: {
        DEFAULT: [0, 0, 0] as [number, number, number],
        SECONDARY: [40, 40, 40] as [number, number, number],
        MUTED: [80, 80, 80] as [number, number, number],
        FOOTER: [90, 90, 90] as [number, number, number],
    },
    TABLE: {
        HEAD: [32, 45, 96] as [number, number, number],
    },
    LINES: {
        DEFAULT: 180 as number,
        LIGHT: 220 as number,
    }
};

const FONT = "Lexend-Regular";

// --- Interfaces ---

interface LogoData {
    dataUrl: string;
    width: number;
    height: number;
}

interface TableExportData {
    headers: string[];
    rows: string[][];
    title?: string;
}

// --- Helper Functions ---

async function loadLogo(url: string): Promise<LogoData | null> {
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

export class TableExportPDF {
    private doc: jsPDF;
    private cursorY: number;
    private pageWidth: number;
    private pageHeight: number;

    constructor(orientation: "portrait" | "landscape" = "landscape") {
        this.doc = new jsPDF({ unit: "pt", format: "a4", orientation });
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

    private addHeader(logo: LogoData | null, company: CompanyDto | null, title?: string) {
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
        const companyAddress = company?.address || "";
        const companyTaxOffice = company?.tax_office ? `${i18n.t("vars.tax_office")}: ${company.tax_office}` : "";
        const companyTaxNo = company?.tax_number ? `${i18n.t("vars.tax_number")}: ${company.tax_number}` : "";
        const today = format(new Date(), "dd.MM.yyyy HH:mm");

        const infoLines: string[] = [];
        if (companyAddress) infoLines.push(companyAddress);
        if (companyTaxOffice) infoLines.push(companyTaxOffice);
        if (companyTaxNo) infoLines.push(companyTaxNo);
        infoLines.push(`${i18n.t("vars.created_at")}: ${today}`);

        // Render Logo
        if (logo) {
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

        // Add title if provided
        if (title) {
            this.addTitle(title);
        }
    }

    private addTitle(title: string) {
        this.doc.setFontSize(14);
        this.doc.setTextColor(...COLORS.TEXT.DEFAULT);

        const fullWidth = this.pageWidth - MARGIN.LEFT - MARGIN.RIGHT;
        const splitTitle = this.doc.splitTextToSize(title, fullWidth);

        this.doc.text(splitTitle, MARGIN.LEFT, this.cursorY);

        const textHeight = splitTitle.length * 18;
        this.cursorY += textHeight + 6;

        // Separator line
        this.doc.setDrawColor(COLORS.LINES.DEFAULT);
        this.doc.line(MARGIN.LEFT, this.cursorY, this.pageWidth - MARGIN.RIGHT, this.cursorY);
        this.cursorY += 20;
    }

    private addTable(headers: string[], rows: string[][]) {
        autoTable(this.doc, {
            startY: this.cursorY,
            margin: { left: MARGIN.LEFT, right: MARGIN.RIGHT },
            head: [headers],
            body: rows,
            styles: { fontSize: 8, font: FONT },
            headStyles: { fillColor: COLORS.TABLE.HEAD, font: FONT, fontStyle: "normal" },
            theme: 'striped',
        });

        // Update cursor to end of table
        this.cursorY = (this.doc as any).lastAutoTable.finalY + 30;
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
            this.doc.text("Comma", MARGIN.LEFT, footerY + 15);
            this.doc.text(`${i18n.t("vars.page")} ${i} / ${pageCount}`, this.pageWidth - MARGIN.RIGHT, footerY + 15, { align: "right" });
        }
    }

    public async generate(data: TableExportData, company: CompanyDto | null, filename?: string) {
        const logo = await this.getLogo(company);

        this.addHeader(logo, company, data.title);
        this.addTable(data.headers, data.rows);
        this.addFooter();

        // Generate filename
        const safeName = filename 
            ? filename.replace(/[^a-zA-Z0-9çğıöşüÇĞİÖŞÜ ]/g, "").replace(/\s+/g, "_")
            : `export_${format(new Date(), "yyyy-MM-dd")}`;
        
        this.doc.save(`${safeName}.pdf`);
    }
}

/**
 * Public export function that instantiates the class and generates the PDF.
 */
export async function exportTablePDF(
    data: TableExportData,
    company: CompanyDto | null,
    filename?: string,
    orientation: "portrait" | "landscape" = "landscape"
) {
    const generator = new TableExportPDF(orientation);
    await generator.generate(data, company, filename);
}