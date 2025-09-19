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

const formSchema = z.object({
    username: z.string().max(20, { error: "Kullanıcı adı en fazla 20 karakter olabilir." }),
    password: z.string().max(50, { error: "Şifre en az 8, en fazla 50 karakter olabilir." }),
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

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible);
    };

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        const { username, password } = values;
        Auth.Login(username, password);
    };

    return (
        <div className="grid grid-cols-2 h-screen w-screen">
            <div className="bg-primary-400 flex justify-center items-center h-full">
                <img src="/hks-logo.png" className="w-96 saturate-0 brightness-0 invert" />
            </div>
            <div className="flex flex-col justify-center items-center h-full">
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
                                        <Input placeholder="hkayrad" required {...field} />
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
                                            <Input placeholder="********" required type={isPasswordVisible ? "text" : "password"} {...field} />
                                            <Button type="button" variant="outline" onClick={togglePasswordVisibility}>{isPasswordVisible ? <EyeOff /> : <Eye />}</Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit" className="mx-auto">Giriş Yap</Button>
                    </form>
                </Form>
            </div>
        </div>
    )
}