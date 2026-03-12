import instance from "../instance";
import { Logger } from "@/lib/utils/logger";

export interface TwoFactorSetupResponse {
  qrCode: string;
  secret: string;
  setupToken: string;
}

export interface TwoFactorVerifySetupResponse {
  success: boolean;
  recoveryCodes?: string[];
  message: string;
}

export interface TwoFactorVerifyResponse {
  success: boolean;
  locked?: boolean;
  attemptsRemaining?: number;
  remainingTime?: number;
  message?: string;
  username?: string;
  role?: number;
}

export interface TwoFactorRecoveryResponse {
  success: boolean;
  remainingCodes?: number;
  username?: string;
  role?: number;
  message?: string;
}

export interface TwoFactorStatusResponse {
  enabled: boolean;
}

export class TwoFactorApi {
  /**
   * Get 2FA status for current user
   */
  static async getStatus(): Promise<TwoFactorStatusResponse> {
    try {
      const response = await instance.get("/2fa/status");
      return response.data;
    } catch (error) {
      Logger.error("[TwoFactorApi] Failed to get 2FA status", error);
      throw error;
    }
  }

  /**
   * Initiate 2FA setup - returns QR code
   */
  static async initiateSetup(): Promise<TwoFactorSetupResponse> {
    try {
      const response = await instance.post("/2fa/setup");
      return response.data;
    } catch (error) {
      Logger.error("[TwoFactorApi] Failed to initiate 2FA setup", error);
      throw error;
    }
  }

  /**
   * Verify setup code and activate 2FA
   */
  static async verifySetup(
    setupToken: string,
    code: string,
  ): Promise<TwoFactorVerifySetupResponse> {
    try {
      const response = await instance.post("/2fa/verify-setup", {
        setupToken,
        code,
      });
      return response.data;
    } catch (error) {
      Logger.error("[TwoFactorApi] Failed to verify 2FA setup", error);
      throw error;
    }
  }

  /**
   * Verify 2FA code during login
   */
  static async verify(
    code: string,
    tempToken: string,
  ): Promise<TwoFactorVerifyResponse> {
    try {
      const response = await instance.post(
        "/2fa/verify",
        { code },
        {
          headers: {
            "x-2fa-temp-token": tempToken,
          },
        },
      );
      return response.data;
    } catch (error: any) {
      Logger.error("[TwoFactorApi] Failed to verify 2FA", error);
      // Return error response data if available
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  /**
   * Use recovery code to bypass 2FA
   */
  static async useRecoveryCode(
    code: string,
    tempToken: string,
  ): Promise<TwoFactorRecoveryResponse> {
    try {
      const response = await instance.post(
        "/2fa/recovery",
        { code },
        {
          headers: {
            "x-2fa-temp-token": tempToken,
          },
        },
      );
      return response.data;
    } catch (error: any) {
      Logger.error("[TwoFactorApi] Failed to use recovery code", error);
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }

  /**
   * Disable 2FA for current user
   */
  static async disable(
    password: string,
  ): Promise<{ success: boolean; message: string }> {
    //, code: string
    try {
      const response = await instance.post("/2fa/disable", {
        password,
        // code,
      });
      return response.data;
    } catch (error: any) {
      Logger.error("[TwoFactorApi] Failed to disable 2FA", error);
      if (error.response?.data) {
        return error.response.data;
      }
      throw error;
    }
  }
}
