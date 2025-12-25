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
  InputGroupInput,
} from "@/components/ui/input-group";
import { useDialog } from "@/contexts/dialog";
import { AdminUserApi } from "@/lib/api/admin";
import { sendRefreshEvent } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";

type Props = {
  userId: string;
  username: string;
  onSuccess?: () => void;
};

export default function ResetPasswordDialog(props: Props) {
  const { userId, username, onSuccess } = props;
  const { t } = useTranslation();

  const { closeDialog } = useDialog();

  const ResetPasswordFormSchema = useMemo(
    () =>
      z
        .object({
          password: z
            .string({
              message: t("login.form.password.maxCharError"),
            })
            .min(6, t("login.form.password.maxCharError"))
            .max(100, t("login.form.password.maxCharError")),
          confirmPassword: z
            .string({
              message: t("login.form.password.maxCharError"),
            })
            .min(6, t("login.form.password.maxCharError"))
            .max(100, t("login.form.password.maxCharError")),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: t("login.form.password.maxCharError"),
          path: ["confirmPassword"],
        }),
    [t],
  );

  const form = useForm<z.infer<typeof ResetPasswordFormSchema>>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onCancel = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      form.reset();
      closeDialog();
    },
    [form, closeDialog],
  );

  const onSubmit = useCallback(
    (data: z.infer<typeof ResetPasswordFormSchema>) => {
      const promise = AdminUserApi.ResetPassword(userId, data.password);

      toast.promise(promise, {
        loading: t("notification.customer.update.pending"),
        success: () => {
          form.reset();
          closeDialog();
          sendRefreshEvent();
          if (onSuccess) onSuccess();
          return t("notification.customer.update.success");
        },
        error: t("notification.customer.update.error"),
      });
    },
    [form, closeDialog, userId, onSuccess, t],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <div className="text-sm text-muted-foreground">
          {t("login.form.username")}:{" "}
          <span className="font-medium text-foreground">{username}</span>
        </div>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex gap-1">
                {t("login.form.password")}{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="password"
                    placeholder={t("login.form.password")}
                    {...field}
                  />
                </InputGroup>
              </FormControl>
              <FormDescription>{t("login.form.password")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex gap-1">
                {t("login.form.password")}{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    type="password"
                    placeholder={t("login.form.password")}
                    {...field}
                  />
                </InputGroup>
              </FormControl>
              <FormDescription>{t("login.form.password")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("vars.cancel")}
          </Button>
          <Button type="submit">{t("vars.save")}</Button>
        </div>
      </form>
    </Form>
  );
}
