export type ApiResponse<T> = {
    status: number;
    data: T | null;
    message: string;
}

export type UUID = string;

export type CustomerDto = {
    id?: UUID;
    name: string;
    phone?: string;
    is_company: boolean;
    tax_number?: string;
    email?: string;
    address?: string;
    total_debt?: number;
    total_payments?: number;
    remaining_debt?: number;
    created_at?: Date;
    updated_at?: Date;
}

export type DebtDto = {
    id?: UUID;
    customer_id: UUID;
    invoice_no?: string;
    amount: number;
    vat: number;
    total_amount?: string;
    description?: string;
    issue_date: Date;
    created_at?: Date;
    updated_at?: Date;
}

export type PaymentDto = {
    id?: UUID;
    customer_id: UUID;
    amount: number;
    payment_method: 'cash' | 'bank_transfer' | 'check';
    description?: string;
    invoice_no?: string;
    payment_date: Date;
    created_at?: Date;
    updated_at?: Date;
}

export type CustomerIdName = { id: UUID, name: string };

export type Totals = {
    total_debts: number;
    total_payments: number;
    remaining_debt: number;
}