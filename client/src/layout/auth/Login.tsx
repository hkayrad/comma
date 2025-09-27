import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Auth } from "@/lib/api";
import { useState } from "react";
import { Form } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const formSchema = z.object({
    username: z.string().max(20, { error: "Kullanıcı adı en fazla 20 karakter olabilir." }),
    password: z.string().max(50, { error: "Şifre en fazla 50 karakter olabilir." }),
})

export default function Login() {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });
    const navigate = useNavigate();

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const { username, password } = values;

        if (!username || !password) {
            toast.error("Lütfen tüm alanları doldurun");
            return;
        }

        const response = Auth.Login(username, password);
        toast.promise(response, {
            loading: "Giriş yapılıyor...",
            success: () => {
                navigate("/");
                return "Giriş başarılı!";
            },
            error: "Giriş başarısız, lütfen bilgilerinizi kontrol edin"
        });
    };

    return (
        <>
            <div className="grid grid-cols-1 grid-rows-[auto_5fr] h-screen w-screen lg:grid-cols-2">
                <div className="bg-primary-400 flex justify-center items-center h-fit lg:h-screen py-8 lg:py-0">
                    <img src="/hks-logo.png" className="w-64 lg:w-96 saturate-0 brightness-0 invert" />
                </div>
                <div className="flex flex-col mt-24 lg:mt-0 lg:justify-center items-center h-full">
                    <h1 className="text-4xl font-bold text-center mb-8">Giriş Yap</h1>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-80 flex flex-col">
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
                                                <Input placeholder="********" type={isPasswordVisible ? "text" : "password"} {...field} />
                                                <Button type="button" variant="outline" onClick={togglePasswordVisibility}>{isPasswordVisible ? <EyeOff /> : <Eye />}</Button>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" variant="default" className="mx-auto">Giriş Yap</Button>
                        </form>
                    </Form>
                </div>
            </div>
        </>
    )
}