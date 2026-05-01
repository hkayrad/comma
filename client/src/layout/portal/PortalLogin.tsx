import { useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User, LogIn } from "lucide-react";

import { portalLoginSchema } from "@common";
import { PortalApi } from "@/lib/api/portal";
import { CommaImage } from "@/components/shared/CommaImage";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { Spinner } from "@/components/ui/spinner";

export default function PortalLogin() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formSchema = portalLoginSchema.pick({ tax_number: true });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tax_number: "",
    },
  });

  const onSubmit = useCallback(
    async (values: z.infer<typeof formSchema>) => {
      if (!companyId) {
        toast.error("Geçersiz firma bağlantısı");
        return;
      }

      setLoading(true);

      try {
        await PortalApi.login({ companyId, tax_number: values.tax_number });
        toast.success("Başarıyla giriş yapıldı");
        navigate("/portal");
      } catch (error) {
        toast.error("Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.");
      } finally {
        setLoading(false);
      }
    },
    [companyId, navigate]
  );

  if (!companyId) {
    return <div className="p-8 text-center text-destructive">Geçersiz Bağlantı</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-md p-8 space-y-8 bg-card border rounded-xl shadow-lg">
        <div className="flex flex-col items-center space-y-4">
          <CommaImage
            src="/logo.webp"
            alt="Company Logo"
            className="w-32 h-32 object-contain"
          />
          <h1 className="text-2xl font-bold text-center">Müşteri Portalı</h1>
          <p className="text-sm text-muted-foreground text-center">
            Hesap ekstrenizi görüntülemek için giriş yapın
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="tax_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VKN / TCKN</FormLabel>
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput placeholder="Vergi No veya TCKN giriniz" {...field} />
                      <InputGroupAddon align="inline-start">
                        <User className="text-muted-foreground" />
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={loading}
            >
              {loading ? <Spinner /> : <LogIn className="mr-2" />}
              Giriş Yap
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
