import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { useToast } from "@/hooks/use-toast";
import { AuthLayout } from "@/components/auth/AuthLayout";

function createForgotPasswordSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().email(t("auth.validation.emailInvalid")),
  });
}

type ForgotPasswordFormData = z.infer<ReturnType<typeof createForgotPasswordSchema>>;

type ForgotPasswordProps = {
  /** Ex: "/creator" para usar rotas /creator/login... */
  basePath?: string;
};

export default function ForgotPassword({ basePath = "" }: ForgotPasswordProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const loginPath = `${basePath}/login`;
  const heroImage = "/images/bg_auth_001.webp";

  const forgotPasswordSchema = createForgotPasswordSchema(t);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await resetPassword(data.email);

      if (error) {
        toast({
          variant: "destructive",
          title: t("common.error"),
          description: error.message,
        });
      } else {
        setEmailSent(true);
      }
    } catch {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: t("common.unexpectedError"),
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthLayout heroImage={heroImage}>
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">{t("auth.forgotPassword.successTitle")}</h1>
          <p className="text-muted-foreground">{t("auth.forgotPassword.successSubtitle")}</p>
        </div>
        <div className="flex flex-col items-center space-y-4">
          <div className="rounded-full bg-success/10 p-3">
            <CheckCircle className="size-8 text-success" />
          </div>
          <p className="text-center text-sm text-muted-foreground">
            {t("auth.forgotPassword.successDescription")}
          </p>
          <Link to={loginPath}>
            <Button variant="outline" className="mt-2">
              <ArrowLeft className="size-4" />
              {t("auth.forgotPassword.backToLogin")}
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout heroImage={heroImage}>
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">{t("auth.forgotPassword.title")}</h1>
        <p className="text-muted-foreground">{t("auth.forgotPassword.subtitle")}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">{t("auth.forgotPassword.emailLabel")}</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder={t("auth.forgotPassword.emailPlaceholder")}
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError>{errors.email?.message}</FieldError>
        </Field>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {t("auth.forgotPassword.submitting")}
            </>
          ) : (
            t("auth.forgotPassword.submitButton")
          )}
        </Button>
      </form>

      <div className="text-center">
        <Link
          to={loginPath}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 size-4" />
          {t("auth.forgotPassword.backToLogin")}
        </Link>
      </div>
    </AuthLayout>
  );
}
