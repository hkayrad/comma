import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { useDialog } from "@/contexts/dialog";
import { UserApi } from "@/lib/api/user";
import { useUser } from "@/contexts/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, KeyRound, User } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CancelButton from "../CancelButton";
import TwoFactorSetup from "./TwoFactorSetup";

export default function UserSettingsDialog() {
  const { t } = useTranslation();
  const closeDialog = useDialog((s) => s.closeDialog);
  const user = useUser((s) => s.user);
  const setUser = useUser((s) => s.setUser);
  const [activeTab, setActiveTab] = useState("username");

  // Password visibility states
  const [showCurrentPasswordUsername, setShowCurrentPasswordUsername] =
    useState(false);
  const [showCurrentPasswordPassword, setShowCurrentPasswordPassword] =
    useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Username form schema
  const UsernameFormSchema = useMemo(
    () =>
      z.object({
        newUsername: z
          .string()
          .min(3, t("settings.form.username.validation.min"))
          .max(50, t("settings.form.username.validation.max")),
        currentPassword: z
          .string()
          .min(1, t("settings.form.currentPassword.validation.required")),
      }),
    [t],
  );

  // Password form schema
  const PasswordFormSchema = useMemo(
    () =>
      z
        .object({
          currentPassword: z
            .string()
            .min(1, t("settings.form.currentPassword.validation.required")),
          newPassword: z
            .string()
            .min(6, t("settings.form.newPassword.validation.min"))
            .max(100, t("settings.form.newPassword.validation.max")),
          confirmPassword: z
            .string()
            .min(1, t("settings.form.confirmPassword.validation.required")),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: t("settings.form.confirmPassword.validation.mismatch"),
          path: ["confirmPassword"],
        }),
    [t],
  );

  const usernameForm = useForm<z.infer<typeof UsernameFormSchema>>({
    resolver: zodResolver(UsernameFormSchema),
    defaultValues: {
      newUsername: user?.username || "",
      currentPassword: "",
    },
  });

  const passwordForm = useForm<z.infer<typeof PasswordFormSchema>>({
    resolver: zodResolver(PasswordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      usernameForm.reset();
      passwordForm.reset();
      closeDialog();
    },
    [usernameForm, passwordForm, closeDialog],
  );

  const onSubmitUsername = useCallback(
    (data: z.infer<typeof UsernameFormSchema>) => {
      const promise = UserApi.UpdateUsername(
        data.newUsername,
        data.currentPassword,
      );

      toast.promise(promise, {
        loading: t("notification.settings.username.pending"),
        success: () => {
          usernameForm.reset({
            newUsername: data.newUsername,
            currentPassword: "",
          });
          setUser({ ...user!, username: data.newUsername });
          closeDialog();
          return t("notification.settings.username.success");
        },
        error: (err) => {
          const message = err?.response?.data?.message;
          if (message) return message;
          return t("notification.settings.username.error");
        },
      });
    },
    [usernameForm, closeDialog, user, setUser, t],
  );

  const onSubmitPassword = useCallback(
    (data: z.infer<typeof PasswordFormSchema>) => {
      const promise = UserApi.UpdatePassword(
        data.currentPassword,
        data.newPassword,
      );

      toast.promise(promise, {
        loading: t("notification.settings.password.pending"),
        success: () => {
          passwordForm.reset();
          closeDialog();
          return t("notification.settings.password.success");
        },
        error: (err) => {
          const message = err?.response?.data?.message;
          if (message) return message;
          return t("notification.settings.password.error");
        },
      });
    },
    [passwordForm, closeDialog, t],
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList>
        <TabsTrigger value="username">
          {t("settings.tabs.username")}
        </TabsTrigger>
        <TabsTrigger value="password">
          {t("settings.tabs.password")}
        </TabsTrigger>
        <TabsTrigger value="2fa">
          {t("twoFactor.settings.title")}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="username" className="mt-4">
        <Form {...usernameForm}>
          <form
            onSubmit={usernameForm.handleSubmit(onSubmitUsername)}
            className="flex flex-col gap-6"
          >
            <FormField
              control={usernameForm.control}
              name="newUsername"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">
                    {t("settings.form.username.label")}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <User className="text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupInput
                        placeholder={t("settings.form.username.placeholder")}
                        {...field}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormDescription>
                    {t("settings.form.username.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={usernameForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">
                    {t("settings.form.currentPassword.label")}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <KeyRound className="text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupInput
                        type={showCurrentPasswordUsername ? "text" : "password"}
                        placeholder={t(
                          "settings.form.currentPassword.placeholder",
                        )}
                        {...field}
                      />
                      <InputGroupButton
                        size="icon-xs"
                        onClick={() =>
                          setShowCurrentPasswordUsername(
                            !showCurrentPasswordUsername,
                          )
                        }
                        className="text-muted-foreground hover:text-foreground transition-colors mr-1"
                      >
                        {showCurrentPasswordUsername ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </InputGroupButton>
                    </InputGroup>
                  </FormControl>
                  <FormDescription>
                    {t("settings.form.currentPassword.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <CancelButton onClick={onCancel} />
              <Button type="submit">{t("vars.save")}</Button>
            </div>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="password" className="mt-4">
        <Form {...passwordForm}>
          <form
            onSubmit={passwordForm.handleSubmit(onSubmitPassword)}
            className="flex flex-col gap-6"
          >
            <FormField
              control={passwordForm.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">
                    {t("settings.form.currentPassword.label")}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <KeyRound className="text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupInput
                        type={showCurrentPasswordPassword ? "text" : "password"}
                        placeholder={t(
                          "settings.form.currentPassword.placeholder",
                        )}
                        {...field}
                      />
                      <InputGroupButton
                        size="icon-xs"
                        onClick={() =>
                          setShowCurrentPasswordPassword(
                            !showCurrentPasswordPassword,
                          )
                        }
                        className="text-muted-foreground hover:text-foreground transition-colors mr-1"
                      >
                        {showCurrentPasswordPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </InputGroupButton>
                    </InputGroup>
                  </FormControl>
                  <FormDescription>
                    {t("settings.form.currentPassword.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">
                    {t("settings.form.newPassword.label")}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <KeyRound className="text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupInput
                        type={showNewPassword ? "text" : "password"}
                        placeholder={t("settings.form.newPassword.placeholder")}
                        {...field}
                      />
                      <InputGroupButton
                        size="icon-xs"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="text-muted-foreground hover:text-foreground transition-colors mr-1"
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </InputGroupButton>
                    </InputGroup>
                  </FormControl>
                  <FormDescription>
                    {t("settings.form.newPassword.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-1">
                    {t("settings.form.confirmPassword.label")}{" "}
                    <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupAddon align="inline-start">
                        <KeyRound className="text-muted-foreground" />
                      </InputGroupAddon>
                      <InputGroupInput
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t(
                          "settings.form.confirmPassword.placeholder",
                        )}
                        {...field}
                      />
                      <InputGroupButton
                        size="icon-xs"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="text-muted-foreground hover:text-foreground transition-colors mr-1"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </InputGroupButton>
                    </InputGroup>
                  </FormControl>
                  <FormDescription>
                    {t("settings.form.confirmPassword.description")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <CancelButton onClick={onCancel} />
              <Button type="submit">{t("vars.save")}</Button>
            </div>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="2fa" className="mt-4">
        <TwoFactorSetup onComplete={closeDialog} />
      </TabsContent>
    </Tabs>
  );
}
