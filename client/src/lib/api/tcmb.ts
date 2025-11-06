import instance from "../instance";

export class TCMBApi {
    static async GetExchangeRates() {
        try {
            const response = await instance.get("/tcmb");
            return response.data;
        } catch (error) {
            console.error("Error fetching exchange rates:", error);
            throw error;
        }
    }
}