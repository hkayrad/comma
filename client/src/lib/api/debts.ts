import instance from '../instance';
import type { DebtDto } from '../types';

export class DebtsApi {
    static async GetAll() {
        try {
            const response = await instance.get('/debts');

            if (response.status !== 200)
                return Promise.reject(new Error("Failed to fetch debts"));

            return Promise.resolve(response.data.data);
        } catch (error) {
            return Promise.reject(new Error("Failed to fetch debts"));
        }
    }

    static async Create(debt: DebtDto) {
        try {
            const response = await instance.post('/debts', debt);

            if (response.status !== 200)
                return Promise.reject(new Error("Failed to create debt"));

            return Promise.resolve(response.data.data);
        } catch (error) {
            return Promise.reject(new Error("Failed to create debt"));
        }
    }

    static async Delete(id: string) {
        try {
            const response = await instance.delete(`/debts/${id}`);

            if (response.status !== 200)
                return Promise.reject(new Error("Failed to delete debt"));

            return Promise.resolve(response.status);
        } catch (error) {
            return Promise.reject(new Error("Failed to delete debt"));
        }
    }

    static async Update(debt: DebtDto) {
        try {
            const response = await instance.put(`/debts/${debt.id}`, debt);

            if (response.status !== 200)
                return Promise.reject(new Error("Failed to update debt"));

            return Promise.resolve(response.status);
        } catch (error) {
            return Promise.reject(new Error("Failed to update debt"));
        }
    }
}