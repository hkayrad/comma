import instance from "../instance";

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
}