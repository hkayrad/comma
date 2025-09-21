import instance from '../instance';
import type { PaymentDto } from '../types';

export class PaymentsApi {
    static async GetAll() {
        try {
            const response = await instance.get('/payments');

            if (response.status !== 200)
                return Promise.reject(new Error("Failed to fetch payments"));

            return Promise.resolve(response.data.data);
        } catch (error) {
            return Promise.reject(new Error("Failed to fetch payments"));
        }
    }

    static async Create(payment: PaymentDto) {
        try {
            console.log(payment);
            
            const response = await instance.post('/payments', payment);

            if (response.status !== 200)
                return Promise.reject(new Error("Failed to create payment"));

            return Promise.resolve(response.data.data);
        } catch (error) {
            return Promise.reject(new Error("Failed to create payment"));
        }
    }

    static async Delete(id: string) {
        try {
            const response = await instance.delete(`/payments/${id}`);

            if (response.status !== 200)
                return Promise.reject(new Error("Failed to delete payment"));

            return Promise.resolve(response.status);
        } catch (error) {
            return Promise.reject(new Error("Failed to delete payment"));
        }
    }

    static async Update(payment: PaymentDto) {
        try {
            const response = await instance.put(`/payments/${payment.id}`, payment);

            if (response.status !== 200)
                return Promise.reject(new Error("Failed to update payment"));

            return Promise.resolve(response.status);
        } catch (error) {
            return Promise.reject(new Error("Failed to update payment"));
        }
    }
}