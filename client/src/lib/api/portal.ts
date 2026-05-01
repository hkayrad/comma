import instance from "../instance";
import { Logger } from "../utils/logger";
import type { PortalLogin } from "@comma/common/portal/types";

export class PortalApi {
  static async login(data: PortalLogin) {
    try {
      const response = await instance.post("/portal/login", data);
      return response.data;
    } catch (error) {
      Logger.error("Error logging in to portal:", error);
      throw error;
    }
  }

  static async getOverview() {
    try {
      const response = await instance.get("/portal/overview");
      return response.data;
    } catch (error) {
      Logger.error("Error fetching portal overview:", error);
      throw error;
    }
  }

  static async getStatement() {
    try {
      const response = await instance.get("/portal/statement");
      return response.data;
    } catch (error) {
      Logger.error("Error fetching portal statement:", error);
      throw error;
    }
  }
}
