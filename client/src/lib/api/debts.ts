import instance from '../instance';

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
}