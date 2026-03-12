import { useState, useCallback, useEffect } from "react";
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
import {
  ShieldCheck,
  ShieldOff,
  Copy,
  Download,
  Check,
  Eye,
  EyeOff,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useDialog } from "@/contexts/dialog";
import CancelButton from "../CancelButton";

type SetupStep =
  | "check"
  | "setup"
  | "verify"
  | "recovery"
  | "disable"
  | "enabled";

interface TwoFactorSetupProps {
  onComplete?: () => void;
}

export default function TwoFactorSetup({ onComplete }: TwoFactorSetupProps) {
  const { t } = useTranslation();
  const { closeDialog } = useDialog();
  const [step, setStep] = useState<SetupStep>("check");
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [secretCopied, setSecretCopied] = useState(false);
  const [setupToken, setSetupToken] = useState<string | null>(null);
  const [verifyCode, setVerifyCode] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Disable form states
  const [disablePassword, setDisablePassword] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Check 2FA status on mount
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await TwoFactorApi.getStatus();
        if (status.enabled) {
          setStep("enabled");
        } else {
          setStep("setup");
        }
      } catch (err) {
        Logger.error("[TwoFactorSetup] Failed to check status", err);
        setStep("setup");
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  const handleInitiateSetup = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await TwoFactorApi.initiateSetup();
      setQrCode(response.qrCode);
      setSecret(response.secret);
      setSetupToken(response.setupToken);
      setStep("verify");
    } catch (err) {
      Logger.error("[TwoFactorSetup] Failed to initiate setup", err);
      setError(t("twoFactor.setup.error"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const handleCopySecret = useCallback(() => {
    if (secret) {
      navigator.clipboard.writeText(secret).then(() => {
        setSecretCopied(true);
        toast.success(t("notification.copy.success"));
        setTimeout(() => setSecretCopied(false), 2000);
      });
    }
  }, [secret, t]);

  const handleVerifySetup = useCallback(async () => {
    if (!setupToken || verifyCode.length !== 6) return;

    setLoading(true);
    setError(null);

    try {
      const response = await TwoFactorApi.verifySetup(setupToken, verifyCode);

      if (response.success && response.recoveryCodes) {
        setRecoveryCodes(response.recoveryCodes);
        setStep("recovery");
        toast.success(t("twoFactor.setup.success"));
      } else {
        setError(response.message || t("twoFactor.verify.invalidCode"));
        setVerifyCode("");
      }
    } catch (err) {
      Logger.error("[TwoFactorSetup] Failed to verify setup", err);
      setError(t("twoFactor.verify.error"));
      setVerifyCode("");
    } finally {
      setLoading(false);
    }
  }, [setupToken, verifyCode, t]);

  const handleDisable = useCallback(async () => {
    if (!disablePassword) return; // || disableCode.length !== 6

    setLoading(true);
    setError(null);

    try {
      const response = await TwoFactorApi.disable(disablePassword);

      if (response.success) {
        toast.success(t("twoFactor.disable.success"));
        setStep("setup");
        setDisablePassword("");
        // setDisableCode("");
        onComplete?.();
      } else {
        setError(response.message || t("twoFactor.verify.invalidCode"));
      }
    } catch (err) {
      Logger.error("[TwoFactorSetup] Failed to disable 2FA", err);
      setError(t("twoFactor.verify.error"));
    } finally {
      setLoading(false);
    }
  }, [disablePassword, disableCode, t, onComplete]);

  const handleCopyRecoveryCodes = useCallback(() => {
    const codesText = recoveryCodes.join("\n");
    navigator.clipboard.writeText(codesText).then(() => {
      setCopied(true);
      toast.success(t("twoFactor.setup.recoveryCodes.copied"));
      setTimeout(() => setCopied(false), 2000);
    });
  }, [recoveryCodes, t]);

  const handleDownloadRecoveryCodes = useCallback(() => {
    const codesText = recoveryCodes.join("\n");
    const blob = new Blob([codesText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "comma-2fa-recovery-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [recoveryCodes]);

  const handleFinish = useCallback(() => {
    setStep("enabled");
    onComplete?.();
  }, [onComplete]);

  const onCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      closeDialog();
      setStep("check");
    },
    [closeDialog],
  );

  if (loading && step === "check") {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner />
      </div>
    );
  }

  // Show enabled state with disable option
  if (step === "enabled") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
          <div>
            <p className="font-medium text-green-800 dark:text-green-200">
              {t("twoFactor.settings.enabled")}
            </p>
          </div>
        </div>
        <div className="w-fit flex gap-2 ml-auto">
          <CancelButton onClick={onCancel} />
          <Button
            variant="destructive"
            size="default"
            onClick={() => setStep("disable")}
            className="w-fit"
          >
            {/*<ShieldOff />*/}
            {t("twoFactor.settings.disable")}
          </Button>
        </div>
      </div>
    );
  }

  // Disable form
  if (step === "disable") {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-medium">{t("twoFactor.disable.title")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("twoFactor.disable.description")}
        </p>

        <div className="space-y-4">
          <InputGroup>
            <InputGroupAddon align="inline-start">
              <KeyRound className="text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              type={showPassword ? "text" : "password"}
              placeholder={t("settings.form.currentPassword.placeholder")}
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
            />
            <InputGroupButton
              size="icon-xs"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors mr-1"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </InputGroupButton>
          </InputGroup>

          {/*<div className="flex flex-col items-center gap-2">
            <InputOTP
              maxLength={6}
              value={disableCode}
              onChange={setDisableCode}
              disabled={loading}
              autoComplete="one-time-code"
              inputMode="numeric"
              id="disable-otp-code"
              name="disable-otp-code"
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
          </div>*/}

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <div className="flex gap-2 w-fit ml-auto">
            <CancelButton
              onClick={() => {
                setStep("enabled");
                setError(null);
                setDisablePassword("");
                setDisableCode("");
              }}
            />
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={loading || !disablePassword}
              //  || disableCode.length !== 6
              className="flex-1"
            >
              {loading ? <Spinner /> : t("twoFactor.disable.submit")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Setup initial state
  if (step === "setup") {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <ShieldOff className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
          <div>
            <p className="font-medium text-yellow-800 dark:text-yellow-200">
              {t("twoFactor.settings.disabled")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <CancelButton onClick={onCancel} />
          <Button
            onClick={handleInitiateSetup}
            disabled={loading}
            className="w-fit"
          >
            {loading ? (
              <Spinner />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4 mr-1" />
                {t("twoFactor.settings.enable")}
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // QR code verification step
  if (step === "verify" && qrCode) {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-medium">{t("twoFactor.setup.title")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("twoFactor.setup.description")}
        </p>

        <div className="flex justify-center p-4 bg-white rounded-lg">
          <img src={qrCode} alt="QR Code" className="w-48 h-48" />
        </div>

        {secret && (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground text-center">
              {t("twoFactor.setup.manualEntry")}
            </p>
            <div className="flex items-center justify-center gap-4 p-2 w-fit mx-auto">
              <code className="font-mono text-sm select-all break-all">
                {secret}
              </code>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleCopySecret}
                className="shrink-0"
              >
                {secretCopied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        )}

        <p className="text-sm text-muted-foreground text-center">
          {t("twoFactor.setup.enterCode")}
        </p>

        <div className="flex flex-col items-center gap-4">
          <InputOTP
            maxLength={6}
            value={verifyCode}
            onChange={setVerifyCode}
            disabled={loading}
            autoComplete="one-time-code"
            inputMode="numeric"
            id="setup-otp-code"
            name="setup-otp-code"
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

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex items-center ml-auto gap-2 mt-2">
            <CancelButton onClick={onCancel} />
            <Button
              onClick={handleVerifySetup}
              disabled={loading || verifyCode.length !== 6}
              className="w-fit ml-auto"
            >
              {loading ? <Spinner /> : t("twoFactor.setup.submit")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Recovery codes display
  if (step === "recovery") {
    return (
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-medium">
          {t("twoFactor.setup.recoveryCodes.title")}
        </h3>
        <p className="text-sm text-muted-foreground">
          {t("twoFactor.setup.recoveryCodes.description")}
        </p>

        <div className="p-4 bg-muted rounded-lg">
          <div className="grid grid-cols-2 gap-2 font-mono text-sm">
            {recoveryCodes.map((code, index) => (
              <div key={index} className="p-2 bg-background rounded">
                {code}
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-destructive font-medium">
          {t("twoFactor.setup.recoveryCodes.warning")}
        </p>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleCopyRecoveryCodes}
            className="flex-1"
          >
            {copied ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {t("twoFactor.setup.recoveryCodes.copy")}
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadRecoveryCodes}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            {t("twoFactor.setup.recoveryCodes.download")}
          </Button>
        </div>
        <div className="flex items-center ml-auto gap-2 mt-2">
          <Button onClick={handleFinish} className="w-fit ml-auto">
            {t("twoFactor.setup.recoveryCodes.done")}
          </Button>
        </div>
      </div>
    );
  }

  return null;
}
