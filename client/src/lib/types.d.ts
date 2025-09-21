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
    issue_date: string;
}

export type PaymentDto = {
    id?: string;
    customer_id: string;
    invoice_no?: string;
    amount: number;
    payment_date: string;
    payment_note?: string;
    payment_method?: string;
}