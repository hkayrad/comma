import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  LogIn,
  Moon,
  Sun,
  User,
} from "lucide-react";
import { useCallback, useState } from "react";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import MaintenanceBanner from "@/layout/shared/MaintenanceBanner";
import { useWebSocket } from "@/contexts/webSocket";
import { useTheme } from "@/components/theme-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUser } from "@/contexts/user";
import { Logger } from "@/lib/utils/logger";
import {
  Menu,
  MenuPanel,
  MenuItem,
  MenuTrigger,
} from "@/components/animate-ui/components/base/menu";
import { supportedLanguages } from "@/lib/supportedLanguages";
import { useTranslation } from "react-i18next";
import { Spinner } from "@/components/ui/spinner";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import TwoFactorVerify from "./TwoFactorVerify";

export default function Login() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [pendingUsername, setPendingUsername] = useState<string>("");
  const navigate = useNavigate();
  const { reloadConnection } = useWebSocket();
  const { theme, setTheme } = useTheme();
  const { login, setUser } = useUser();
  const { t, i18n } = useTranslation();

  const formSchema = z.object({
    username: z
      .string()
      .max(20, { error: t("login.form.username.maxCharError") }),
    password: z
      .string()
      .max(50, { error: t("login.form.password.maxCharError") }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible(!isPasswordVisible);
  }, [isPasswordVisible]);

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      const { username, password } = values;

      if (!username || !password) {
        toast.error(t("notification.auth.login.fillEmptyFields"));
        return;
      }

      setLoading(true);

      try {
        const result = await login(username, password);

        if (result.requires2FA && result.tempToken) {
          // 2FA required - show 2FA verification UI
          setRequires2FA(true);
          setTempToken(result.tempToken);
          setPendingUsername(username);
          setLoading(false);
          return;
        }

        if (result.user) {
          toast.success(t("notification.auth.login.success"));
          reloadConnection();
          navigate("/");
        } else {
          toast.error(t("notification.auth.login.error"));
        }
      } catch (error) {
        Logger.error(error);
        toast.error(t("notification.auth.login.error"));
      } finally {
        setLoading(false);
      }
    },
    [navigate, reloadConnection, login, t],
  );

  const handle2FASuccess = useCallback(
    (userData: { username: string; role: number }) => {
      setUser({ username: userData.username, role: userData.role, companyId: "" });
      toast.success(t("notification.auth.login.success"));
      reloadConnection();
      navigate("/");
    },
    [navigate, reloadConnection, setUser, t],
  );

  const handle2FACancel = useCallback(() => {
    setRequires2FA(false);
    setTempToken(null);
    setPendingUsername("");
  }, []);

  //WARN DEBUG LOGIN
  const sysAdminLogin = useCallback(async () => {
    form.setValue("username", "admin");
    form.setValue("password", "Test1234");
  }, [form]);
  const adminLogin = useCallback(async () => {
    form.setValue("username", "hkayrad");
    form.setValue("password", "Test1234");
  }, [form]);

  const userLogin = useCallback(async () => {
    form.setValue("username", "test");
    form.setValue("password", "Test1234");
  }, [form]);

  return (
    <>
      <MaintenanceBanner />
      <div className="grid grid-cols-1 grid-rows-[auto_5fr] h-screen w-screen lg:grid-cols-2 selection:bg-foreground selection:text-background">
        <div className="bg-primary-400 flex justify-center items-center h-fit lg:h-screen py-8 lg:py-0">
          <img
            src="/logo.webp"
            className="w-64 lg:w-96 saturate-0 brightness-0 invert"
          />
        </div>
        <Tooltip disableHoverablePopup>
          <TooltipTrigger
            render={(props) => (
              <Button
                {...props}
                nativeButton
                size="icon"
                className="absolute bottom-4 right-4"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="text-inherit select-none" />
                ) : (
                  <Moon className="text-inherit select-none" />
                )}
              </Button>
            )}
          />
          <TooltipContent side="left">{t("login.changeTheme")}</TooltipContent>
        </Tooltip>
        <Menu>
          <Tooltip disableHoverablePopup>
            <TooltipTrigger
              render={(props) => (
                <MenuTrigger
                  {...props}
                  className="absolute bottom-16 right-4"
                  render={(props) => (
                    <Button {...props} size="icon">
                      <Globe />
                    </Button>
                  )}
                />
              )}
            />
            <TooltipContent side="left">
              {t("login.changeLanguage")}
            </TooltipContent>
          </Tooltip>
          <MenuPanel align="end">
            {supportedLanguages.map((lang) => (
              <MenuItem
                key={lang.code}
                onClick={() => i18n.changeLanguage(lang.code)}
              >
                {lang.flag}
                {lang.label}
              </MenuItem>
            ))}
          </MenuPanel>
        </Menu>
        <div className="flex flex-col mt-24 lg:mt-0 lg:justify-center items-center h-full">
          {requires2FA && tempToken ? (
            <TwoFactorVerify
              tempToken={tempToken}
              username={pendingUsername}
              onSuccess={handle2FASuccess}
              onCancel={handle2FACancel}
            />
          ) : (
            <>
              <h1 className="text-4xl font-bold text-center">{t("login.title")}</h1>
              <p className="mt-2 mb-8 text-muted-foreground text-sm">
                {t("login.description")}
              </p>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 w-80 flex flex-col"
                >
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("login.form.username")}</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <InputGroupInput placeholder="hkayrad" {...field} />
                            <InputGroupAddon align="inline-start">
                              <User className="text-muted-foreground" />
                            </InputGroupAddon>
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("login.form.password")}</FormLabel>
                        <FormControl>
                          <InputGroup>
                            <InputGroupAddon align="inline-start">
                              <KeyRound className="text-muted-foreground" />
                            </InputGroupAddon>
                            <InputGroupInput
                              placeholder="********"
                              type={isPasswordVisible ? "text" : "password"}
                              {...field}
                            />
                            <InputGroupButton
                              size="icon-xs"
                              className="mr-1 text-muted-foreground hover:text-foreground transition-colors"
                              onClick={togglePasswordVisibility}
                            >
                              {isPasswordVisible ? <EyeOff /> : <Eye />}
                            </InputGroupButton>
                          </InputGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    variant="default"
                    className="mx-auto"
                    disabled={loading}
                  >
                    {loading ? <Spinner /> : <LogIn />}
                    {t("login.form.submit")}
                  </Button>
                </form>
              </Form>
              {import.meta.env.VITE_NODE_ENV === "development" && (
                <div className="flex w-full justify-center gap-4 mt-8">
                  <Button
                    className="bg-red-200 text-red-800 hover:bg-red-300 hover:text-red-900"
                    size="sm"
                    onClick={sysAdminLogin}
                  >
                    Admin Hesabı Doldur
                  </Button>
                  <Button
                    className="bg-red-200 text-red-800 hover:bg-red-300 hover:text-red-900"
                    size="sm"
                    onClick={adminLogin}
                  >
                    Yönetici Hesabı Doldur
                  </Button>
                  <Button
                    className="bg-red-200 text-red-800 hover:bg-red-300 hover:text-red-900"
                    size="sm"
                    onClick={userLogin}
                  >
                    Kullanıcı Hesabı Doldur
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
