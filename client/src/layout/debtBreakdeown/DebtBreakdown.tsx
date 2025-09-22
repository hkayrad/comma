import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomersApi } from "@/lib/api";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { Printer } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";

type DebtBreakdownResponse = {
    customer_name: string;
    summary: {
        total_debt_amount: number;
        total_paid_amount: number;
        total_remaining_amount: number;
        unpaid_invoice_count: number;
    };
    unpaid_debts: {
        customer_name: string;
        amount: string;
        description?: string;
        id: string;
        invoice_no: string;
        issue_date: string;
        remaining_amount: string;
        total_paid: string;
        vat: string;
        debt_amount: string;
    }[];
};

export default function DebtBreakdown() {
    const { customerId } = useParams();
    const navigate = useNavigate();

    const [customer, setCustomer] = useState<DebtBreakdownResponse | null>(null);

    const handleFetchUnpaidDebt = async () => {
        if (!customerId) return Promise.reject(false);

        try {
            const debts = await CustomersApi.GetUnpaidDebtsByCustomer(customerId);
            if (debts === null) {
                toast.error("Bu müşteri için borç bulunamadı.");
                setCustomer(null);
                navigate("/");
                return Promise.resolve(null);
            }
            setCustomer(debts);
            return Promise.resolve(debts);
        } catch (error) {
            console.error(error);
            return Promise.reject(false);
        }
    }

    const handlePrint = () => {
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const currentDate = new Date().toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const printContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Borç Dökümü - ${customer?.customer_name}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        line-height: 1.4;
                        color: #000;
                        padding: 20px;
                    }

                    .document-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 30px;
                        border-bottom: 2px solid #000;
                        padding-bottom: 15px;
                    }
                    
                    .logo-section {
                        flex: 1;
                    }
                    
                    .company-logo {
                        max-width: 150px;
                        max-height: 80px;
                        width: auto;
                        height: auto;
                    }
                    
                    .date-section {
                        text-align: right;
                        flex: 1;
                    }
                    
                    .date-label {
                        font-size: 11px;
                        color: #666;
                        margin-bottom: 2px;
                    }
                    
                    .date-value {
                        font-size: 12px;
                        font-weight: bold;
                    }
                    
                    .title-section {
                        text-align: center;
                        flex: 2;
                    }
                    
                    .header {
                        text-align: center;
                        margin-bottom: 30px;
                        font-size: 18px;
                        font-weight: bold;
                    }
                    
                    .summary-section {
                        margin: 20px 0;
                        padding: 15px;
                        border: 2px solid #000;
                        background: #f9f9f9;
                        page-break-inside: avoid;
                    }
                    
                    .summary-title {
                        font-size: 16px;
                        font-weight: bold;
                        margin-bottom: 15px;
                    }
                    
                    .summary-grid {
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 15px;
                    }
                    
                    .summary-item {
                        padding: 5px;
                    }
                    
                    .summary-label {
                        font-size: 11px;
                        color: #666;
                        margin-bottom: 2px;
                    }
                    
                    .summary-value {
                        font-weight: bold;
                        font-size: 12px;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-top: 20px;
                    }
                    
                    th, td {
                        border: 1px solid #000;
                        padding: 8px 4px;
                        text-align: left;
                        font-size: 11px;
                    }
                    
                    th {
                        background: #f0f0f0;
                        font-weight: bold;
                    }
                    
                    @page {
                        margin: 1cm;
                        size: A4;
                        @top-left { content: ""; }
                        @top-center { content: ""; }
                        @top-right { content: ""; }
                        @bottom-left { content: ""; }
                        @bottom-center { content: ""; }
                        @bottom-right { content: ""; }
                    }
                    
                    @media print {
                        body { print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <div class="document-header">
                    <div class="logo-section">
                        <img src="/hks-logo.png" alt="Şirket Logosu" class="company-logo" onerror="this.style.display='none'">
                    </div>
                    <div class="title-section">
                        <div class="header">
                            Borç Dökümü
                        </div>
                        <div style="font-size: 14px; font-weight: normal;">
                            ${customer?.customer_name}
                        </div>
                    </div>
                    <div class="date-section">
                        <div class="date-label">Rapor Tarihi</div>
                        <div class="date-value">${currentDate}</div>
                    </div>
                </div>
                
                <div class="summary-section">
                    <div class="summary-title">Özet</div>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <div class="summary-label">Toplam Borç</div>
                            <div class="summary-value">₺${customer?.summary.total_debt_amount.toFixed(2)}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Toplam Ödenen</div>
                            <div class="summary-value">₺${customer?.summary.total_paid_amount.toFixed(2)}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Kalan Tutar</div>
                            <div class="summary-value">₺${customer?.summary.total_remaining_amount.toFixed(2)}</div>
                        </div>
                        <div class="summary-item">
                            <div class="summary-label">Fatura Sayısı</div>
                            <div class="summary-value">${customer?.summary.unpaid_invoice_count}</div>
                        </div>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>Fatura No</th>
                            <th>Kesim Tarihi</th>
                            <th>Tutar</th>
                            <th>KDV</th>
                            <th>Toplam Tutar</th>
                            <th>Ödenen</th>
                            <th>Kalan Tutar</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${customer?.unpaid_debts.map(debt => `
                            <tr>
                                <td>${debt.invoice_no}</td>
                                <td>${new Date(debt.issue_date).toLocaleDateString()}</td>
                                <td>₺${parseFloat(debt.amount).toFixed(2)}</td>
                                <td>₺${parseFloat(debt.vat).toFixed(2)}</td>
                                <td>₺${parseFloat(debt.debt_amount).toFixed(2)}</td>
                                <td>₺${parseFloat(debt.total_paid).toFixed(2)}</td>
                                <td>₺${parseFloat(debt.remaining_amount).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.writeln(printContent);
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = () => {
            printWindow.print();
            printWindow.close();
        };
    };

    useEffect(() => {
        handleFetchUnpaidDebt();
    }, [customerId]);

    useEffect(() => {
        console.log(customer);
    })

    const columns: ColumnDef<DebtBreakdownResponse["unpaid_debts"][0]>[] = [
        {
            accessorKey: "invoice_no",
            header: "Fatura No",
            cell: ({ row }) => row.original.invoice_no
        },
        {
            accessorKey: "issue_date",
            header: "Kesim Tarihi",
            cell: ({ row }) => new Date(row.original.issue_date).toLocaleDateString()
        },
        {
            accessorKey: "amount",
            header: "Tutar",
            cell: ({ row }) => `₺${parseFloat(row.original.amount).toFixed(2)}`
        },
        {
            accessorKey: "vat",
            header: "KDV",
            cell: ({ row }) => `₺${parseFloat(row.original.vat).toFixed(2)}`
        },
        {
            accessorKey: "debt_amount",
            header: "Toplam Tutar",
            cell: ({ row }) => `₺${parseFloat(row.original.debt_amount).toFixed(2)}`
        },
        {
            accessorKey: "total_paid",
            header: "Ödenen",
            cell: ({ row }) => `₺${parseFloat(row.original.total_paid).toFixed(2)}`
        },
        {
            accessorKey: "remaining_amount",
            header: "Kalan Tutar",
            cell: ({ row }) => `₺${parseFloat(row.original.remaining_amount).toFixed(2)}`
        },
    ]

    const table = useReactTable({
        data: customer?.unpaid_debts || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <>
            <Toaster />
            {customer === null ? <div className="p-4">Yükleniyor...</div> :
                <div className="py-4 px-32 space-y-4" id="print-area">
                    <div className="flex justify-between items-center no-print">
                        <h1 className="text-center text-2xl flex-1">Borç Dökümü - {customer.customer_name}</h1>
                        <Button onClick={handlePrint} variant="outline" className="flex items-center gap-2">
                            <Printer className="h-4 w-4" />
                            Yazdır
                        </Button>
                    </div>
                    <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                        <h2 className="text-lg font-semibold mb-2">Özet</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Toplam Borç</p>
                                <p className="font-semibold">₺{customer.summary.total_debt_amount.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Toplam Ödenen</p>
                                <p className="font-semibold text-green-600">₺{customer.summary.total_paid_amount.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Kalan Tutar</p>
                                <p className="font-semibold text-red-600">₺{customer.summary.total_remaining_amount.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Fatura Sayısı</p>
                                <p className="font-semibold">{customer.summary.unpaid_invoice_count}</p>
                            </div>
                        </div>
                    </div>
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map(headerGroup => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <TableHead key={header.id} className="text-left">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.map(row => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map(cell => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>}
        </>
    )
}