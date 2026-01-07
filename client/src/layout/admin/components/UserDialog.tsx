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
import type { UserDto } from "@/lib/types";
import { sendRefreshEvent } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Radio,
  RadioGroup,
} from "@/components/animate-ui/components/base/radio";
import { KeyRound, User } from "lucide-react";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import z from "zod";
import CancelButton from "@/layout/shared/CancelButton";

type Props = {
  companyId: string;
  user?: UserDto;
  onSuccess?: () => void;
};

const UserFormSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters"),
  password: z
    .string()
    .max(100, "Password must be at most 100 characters")
    .optional()
    .or(z.literal("")),
  role: z.number().min(0).max(99),
});

type UserFormValues = z.infer<typeof UserFormSchema>;

export default function UserDialog(props: Props) {
  const { companyId, user, onSuccess } = props;
  const { t } = useTranslation();

  const { closeDialog } = useDialog();

  const form = useForm<UserFormValues>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      username: user?.username || "",
      password: "",
      role: user?.role ?? 0,
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
    (data: UserFormValues) => {
      let promise;

      if (user) {
        const updateData: Partial<UserDto & { password?: string }> = {
          username: data.username,
          role: data.role as 0 | 1 | 99,
        };
        if (data.password && data.password.length >= 6) {
          updateData.password = data.password;
        }
        promise = AdminUserApi.Update(user.id!, updateData);
      } else {
        if (!data.password || data.password.length < 6) {
          toast.error(t("login.form.password.maxCharError"));
          return;
        }
        promise = AdminUserApi.Create({
          company_id: companyId,
          username: data.username,
          password: data.password,
          role: data.role as 0 | 1 | 99,
        });
      }

      toast.promise(promise, {
        loading: user
          ? t("notification.customer.update.pending")
          : t("notification.customer.add.pending"),
        success: () => {
          form.reset();
          closeDialog();
          sendRefreshEvent();
          if (onSuccess) onSuccess();
          return user
            ? t("notification.customer.update.success")
            : t("notification.customer.add.success");
        },
        error: user
          ? t("notification.customer.update.error")
          : t("notification.customer.add.error"),
      });
    },
    [form, closeDialog, companyId, user, onSuccess, t],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex gap-1">
                {t("login.form.username")}{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupAddon align="inline-start">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput
                    placeholder={t("login.form.username")}
                    {...field}
                  />
                </InputGroup>
              </FormControl>
              <FormDescription>{t("login.form.username")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex gap-1">
                {t("login.form.password")}{" "}
                {!user && <span className="text-red-500">*</span>}
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
              <FormDescription>
                {user ? t("login.form.password") : t("login.form.password")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("dashboard.table.column.is_company")}</FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value?.toString() ?? "0"}
                  onValueChange={(value) =>
                    field.onChange(parseInt(String(value), 10))
                  }
                  className="flex gap-4"
                >
                  <div className="flex gap-2 items-center">
                    <Radio value="1" id="manager" />
                    <label
                      htmlFor="manager"
                      className="cursor-pointer select-none"
                    >
                      {t("user.role.manager")}
                    </label>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Radio value="0" id="user" />
                    <label
                      htmlFor="user"
                      className="cursor-pointer select-none"
                    >
                      {t("user.role.user")}
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormDescription>
                {t("form.company.is_company.description")}
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
  );
}
