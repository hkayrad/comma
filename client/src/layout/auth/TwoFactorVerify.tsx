import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { TwoFactorApi } from "@/lib/api/twoFactor";
import { Logger } from "@/lib/utils/logger";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, KeyRound, ShieldCheck } from "lucide-react";

interface TwoFactorVerifyProps {
    tempToken: string;
    username: string;
    onSuccess: (userData: { username: string; role: number }) => void;
    onCancel: () => void;
}

export default function TwoFactorVerify({
    tempToken,
    username,
    onSuccess,
    onCancel,
}: TwoFactorVerifyProps) {
    const { t } = useTranslation();
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showRecovery, setShowRecovery] = useState(false);
    const [recoveryCode, setRecoveryCode] = useState("");

    const handleVerify = useCallback(async (codeToVerify?: string) => {
        const verifyCode = codeToVerify ?? code;

        if (verifyCode.length !== 6) {
            setError(t("twoFactor.verify.codeLength"));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await TwoFactorApi.verify(verifyCode, tempToken);

            if (response.success && response.username && response.role !== undefined) {
                onSuccess({ username: response.username, role: response.role });
            } else {
                setError(response.message || t("twoFactor.verify.invalidCode"));
                setCode("");
            }
        } catch (err: unknown) {
            Logger.error("[TwoFactorVerify] Verification failed", err);
            setError(t("twoFactor.verify.error"));
            setCode("");
        } finally {
            setLoading(false);
        }
    }, [code, tempToken, onSuccess, t]);

    const handleRecoveryVerify = useCallback(async () => {
        if (!recoveryCode.trim()) {
            setError(t("twoFactor.recovery.codeRequired"));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await TwoFactorApi.useRecoveryCode(recoveryCode, tempToken);

            if (response.success && response.username && response.role !== undefined) {
                onSuccess({ username: response.username, role: response.role });
            } else {
                setError(response.message || t("twoFactor.recovery.invalidCode"));
            }
        } catch (err: unknown) {
            Logger.error("[TwoFactorVerify] Recovery verification failed", err);
            setError(t("twoFactor.recovery.error"));
        } finally {
            setLoading(false);
        }
    }, [recoveryCode, tempToken, onSuccess, t]);

    const handleCodeComplete = useCallback(
        (value: string) => {
            setCode(value);
            if (value.length === 6) {
                // Auto-submit when code is complete - pass value directly to avoid stale closure
                handleVerify(value);
            }
        },
        [handleVerify]
    );

    if (showRecovery) {
        return (
            <div className="flex flex-col items-center gap-6 w-80">
                <div className="flex flex-col items-center gap-2">
                    <KeyRound className="w-8 h-8 text-muted-foreground" />
                    <h2 className="text-2xl font-bold text-center">
                        {t("twoFactor.recovery.title")}
                    </h2>
                    <p className="text-muted-foreground text-sm text-center">
                        {t("twoFactor.recovery.description")}
                    </p>
                </div>

                <div className="w-full">
                    <input
                        type="text"
                        value={recoveryCode}
                        onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                        placeholder="XXXXX-XXXXX"
                        className="w-full px-4 py-3 text-center text-lg font-mono border rounded-md focus:ring-2 focus:ring-primary"
                        maxLength={11}
                        disabled={loading}
                    />
                </div>

                {error && (
                    <p className="text-sm text-destructive text-center">{error}</p>
                )}

                <div className="flex flex-col gap-2 w-full">
                    <Button
                        onClick={handleRecoveryVerify}
                        disabled={loading || !recoveryCode.trim()}
                    >
                        {loading ? <Spinner /> : t("twoFactor.recovery.submit")}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => {
                            setShowRecovery(false);
                            setError(null);
                            setRecoveryCode("");
                        }}
                        disabled={loading}
                    >
                        {t("twoFactor.recovery.backToCode")}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-6 w-120">
            <div className="flex flex-col items-center gap-2">
                <h2 className="text-4xl font-bold text-center">
                    {t("twoFactor.verify.title")}
                </h2>
                <p className="mt-2 mb-2 text-muted-foreground text-sm">
                    {t("twoFactor.verify.description", { username })}
                </p>
            </div>

            <InputOTP
                maxLength={6}
                value={code}
                onChange={handleCodeComplete}
                disabled={loading}
                autoComplete="one-time-code"
                inputMode="numeric"
                id="otp-code"
                name="otp-code"
            >
                <InputOTPGroup className="gap-2 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                </InputOTPGroup>
            </InputOTP>

            {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <div className="flex flex-col gap-2 w-full items-center">
                <Button
                    onClick={() => handleVerify()}
                    disabled={loading || code.length !== 6}
                    className="w-fit"
                >
                    {loading ? <Spinner /> : <ShieldCheck />}
                    {t("twoFactor.verify.submit")}
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => {
                        setShowRecovery(true);
                        setError(null);
                        setCode("");
                    }}
                    disabled={loading}
                    className="w-fit"
                >
                    <KeyRound />
                    {t("twoFactor.verify.useRecoveryCode")}
                </Button>
                <Button variant="link" onClick={onCancel} disabled={loading} className="w-fit">
                    <ArrowLeft />
                    {t("twoFactor.verify.cancel")}
                </Button>
            </div>
        </div>
    );
}
