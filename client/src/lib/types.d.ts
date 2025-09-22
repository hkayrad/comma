export type CustomerDto = {
    id?: string;
    name: string;
    phone?: string;
    is_company: number;
    tax_number?: string;
    email?: string;
    address?: string;
}

export type DebtDto = {
    id?: string;
    customer_id: string;
    amount: number;
    invoice_no?: string;
    vat: number;
    description?: string;
    issue_date: Date;
}

export type PaymentDto = {
    id?: string;
    customer_id: string;
    invoice_no?: string;
    amount: number;
    payment_date: Date;
    payment_note?: string;
    payment_method?: string;
}