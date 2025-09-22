import instance from "../instance";
import type { CustomerDto } from "../types";

export class CustomersApi {
    static async GetAll() {
        try {
            const response = await instance.get('/customers');

            if (response.status !== 200)
                return Promise.reject(new Error("Failed to fetch customers"));

            return Promise.resolve(response.data.data);
        } catch (error) {
            return Promise.reject(new Error("Failed to fetch customers"));
        }
    }

    static async GetCustomerNamesAndIds() {
        try {
            const response = await instance.get('/customers/names-ids');

            if (response.status !== 200)
                return Promise.reject(new Error("Failed to fetch customer names and IDs"));

            return Promise.resolve(response.data.data);
        } catch (error) {
            return Promise.reject(new Error("Failed to fetch customer names and IDs"));
        }
    }

    static async GetUnpaidDebtsByCustomer(customerId: string) {
        try {
            const response = await instance.get(`/debts/unpaid/${customerId}`);

            if (response.data === null)
                return Promise.resolve(null);

            if (response.status !== 200)
                return Promise.reject(new Error("Failed to fetch unpaid debts for customer"));

            return Promise.resolve(response.data.data);
        } catch (error) {
            return Promise.reject(new Error("Failed to fetch unpaid debts for customer"));
        }
    }

    static async GetAllUnpaidDebts() {
        try {
            const response = await instance.get('/debts/unpaid');

            if (response.status !== 200)
                return Promise.reject(new Error("Failed to fetch all unpaid debts"));

            return Promise.resolve(response.data.data);
        } catch (error) {
            return Promise.reject(new Error("Failed to fetch all unpaid debts"));
        }
    }

    static async GetByInvoiceNo(invoiceNo: string) {
        try {
            const response = await instance.get(`/debts/invoice/${invoiceNo}`);

            if (response.status !== 200)
                return Promise.reject(new Error("Failed to fetch debts by invoice number"));

            return Promise.resolve(response.data.data);
        } catch (error) {
            return Promise.reject(new Error("Failed to fetch debts by invoice number"));
        }
    }

    static async GetById(id: string) {
        try {
            const response = await instance.get(`/debts/${id}`);

            if (response.status !== 200)
                return Promise.reject(new Error("Failed to fetch debt by ID"));

            return Promise.resolve(response.data.data);
        } catch (error) {
            return Promise.reject(new Error("Failed to fetch debt by ID"));
        }
    }

    static async Create(customer: CustomerDto) {
        try {
            const response = await instance.post('/customers', customer);

            if (response.status !== 200)
                return Promise.reject(new Error("Failed to create customer"));

            return Promise.resolve(response.data.data);
        } catch (error) {
            return Promise.reject(new Error("Failed to create customer"));
        }
    }

    static async Delete(id: string) {
        try {
            const response = await instance.delete(`/customers/${id}`);

            if (response.status !== 200)
                return Promise.reject(new Error("Failed to delete customer"));

            return Promise.resolve(response.status);
        } catch (error) {
            return Promise.reject(new Error("Failed to delete customer"));
        }
    }

    static async Update(customer: CustomerDto) {
        try {
            const response = await instance.put(`/customers/${customer.id}`, customer);

            if (response.status !== 200)
                return Promise.reject(new Error("Failed to update customer"));

            return Promise.resolve(response.status);
        } catch (error) {
            return Promise.reject(new Error("Failed to update customer"));
        }
    }
}