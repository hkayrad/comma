import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Eye, EyeOff, Loader, LogIn, Moon, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
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

const formSchema = z.object({
  username: z
    .string()
    .max(20, { error: "Kullanıcı adı en fazla 20 karakter olabilir." }),
  password: z
    .string()
    .max(50, { error: "Şifre en fazla 50 karakter olabilir." }),
});

export default function Login() {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const navigate = useNavigate();
  const { reloadConnection } = useWebSocket();
  const { theme, setTheme } = useTheme();
  const { login } = useUser();

  const togglePasswordVisibility = useCallback(() => {
    setIsPasswordVisible(!isPasswordVisible);
  }, [isPasswordVisible]);

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      const { username, password } = values;

      if (!username || !password) {
        toast.error("Lütfen tüm alanları doldurun");
        return;
      }

      setLoading(true);
      const promise = login(username, password);
      const timeout = Math.random() * 1000 + 500; // between 500ms and 1500ms
      setTimeout(() => {
        toast.promise(promise, {
          loading: "Giriş yapılıyor...",
          success: () => {
            setLoading(false);
            reloadConnection();
            navigate("/");
            return "Giriş başarılı!";
          },
          error: (error) => {
            Logger.error(error);
            setLoading(false);
            return "Giriş başarısız, lütfen bilgilerinizi kontrol edin";
          },
        });
      }, timeout);
    },
    [navigate, reloadConnection, login],
  );

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
      <div className="grid grid-cols-1 grid-rows-[auto_5fr] h-screen w-screen lg:grid-cols-2 selection:bg-black selection:text-white">
        <div className="bg-primary-400 flex justify-center items-center h-fit lg:h-screen py-8 lg:py-0">
          <img
            src="/hks-logo.png"
            className="w-64 lg:w-96 saturate-0 brightness-0 invert"
          />
        </div>
        <Tooltip disableHoverableContent>
          <TooltipTrigger asChild>
            <Button
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
          </TooltipTrigger>
          <TooltipContent side="left">Tema Değiştir</TooltipContent>
        </Tooltip>
        <div className="flex flex-col mt-24 lg:mt-0 lg:justify-center items-center h-full">
          <h1 className="text-4xl font-bold text-center mb-8">Giriş Yap</h1>
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
                    <FormLabel>Kullanıcı Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="hkayrad" {...field} />
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
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          placeholder="********"
                          type={isPasswordVisible ? "text" : "password"}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={togglePasswordVisibility}
                        >
                          {isPasswordVisible ? <EyeOff /> : <Eye />}
                        </Button>
                      </div>
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
                {loading ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                    Giriş Yapılıyor...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Giriş Yap
                  </>
                )}
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
        </div>
      </div>
    </>
  );
}
