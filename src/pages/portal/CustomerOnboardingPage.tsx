import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePortal } from "@/contexts/PortalContext";
import {
  useRequiredCustomerOnboarding,
  useSubmitRequiredCustomerOnboarding,
} from "@/hooks/useRequiredCustomerOnboarding";
import type {
  CustomerOnboardingAnswers,
  CustomerOnboardingQuestion,
} from "@/types/customer-onboarding";
import { translateAppError } from "@/lib/app-error-utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function isEmptyAnswer(value: unknown) {
  if (Array.isArray(value)) return value.length === 0;
  return typeof value !== "string" || value.trim() === "";
}

function QuestionField({
  question,
  value,
  onChange,
}: {
  question: CustomerOnboardingQuestion;
  value: string | string[] | null | undefined;
  onChange: (value: string | string[]) => void;
}) {
  const options = question.options ?? [];

  if (question.type === "long_text") {
    return (
      <Textarea
        value={typeof value === "string" ? value : ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Digite sua resposta"
        className="min-h-28"
      />
    );
  }

  if (question.type === "single_choice") {
    return (
      <div className="grid gap-2">
        {options.map((option) => {
          const selected = value === option.label;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.label)}
              className={[
                "flex items-center justify-between rounded-md border px-4 py-3 text-left text-sm transition-colors",
                selected
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border hover:bg-muted",
              ].join(" ")}
            >
              <span>{option.label}</span>
              {selected && <Check className="size-4 text-primary" />}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "multiple_choice") {
    const selectedValues = Array.isArray(value) ? value : [];
    return (
      <div className="grid gap-2">
        {options.map((option) => {
          const selected = selectedValues.includes(option.label);
          return (
            <label
              key={option.id}
              className="flex cursor-pointer items-center gap-3 rounded-md border border-border px-4 py-3 text-sm hover:bg-muted"
            >
              <Checkbox
                checked={selected}
                onCheckedChange={(checked) => {
                  onChange(
                    checked
                      ? [...selectedValues, option.label]
                      : selectedValues.filter((item) => item !== option.label),
                  );
                }}
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
    );
  }

  if (question.type === "dropdown") {
    return (
      <Select
        value={typeof value === "string" ? value : ""}
        onValueChange={(next) => onChange(next)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma opção" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.label}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      value={typeof value === "string" ? value : ""}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Digite sua resposta"
    />
  );
}

export default function CustomerOnboardingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { tenant, customer, slug, accessRole } = usePortal();
  const requirement = useRequiredCustomerOnboarding(
    tenant.id,
    accessRole === "customer",
  );
  const submitOnboarding = useSubmitRequiredCustomerOnboarding(tenant.id);
  const [answers, setAnswers] = useState<CustomerOnboardingAnswers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const from = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from && state.from !== `/${slug}/onboarding`
      ? state.from
      : `/${slug}`;
  }, [location.state, slug]);

  useEffect(() => {
    if (!requirement.isLoading && (!requirement.data || accessRole !== "customer")) {
      navigate(`/${slug}`, { replace: true });
    }
  }, [accessRole, navigate, requirement.data, requirement.isLoading, slug]);

  if (requirement.isLoading || !requirement.data) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const onboarding = requirement.data;
  const firstName = customer?.name?.split(" ")[0] || "boas-vindas";

  const handleSubmit = async () => {
    const nextErrors: Record<string, string> = {};

    for (const question of onboarding.questions) {
      if (question.required && isEmptyAnswer(answers[question.id])) {
        nextErrors[question.id] = "Resposta obrigatória";
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Preencha as perguntas obrigatórias.");
      return;
    }

    try {
      await submitOnboarding.mutateAsync({
        onboardingId: onboarding.id,
        answers,
      });
      toast.success("Tudo certo. Acesso liberado.");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(translateAppError(error, "Não foi possível finalizar."));
    }
  };

  return (
    <main className="min-h-dvh bg-background px-4 py-8 text-foreground md:py-12">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="space-y-4">
          <div className="flex items-center gap-3">
            {tenant.icon_url ? (
              <img
                src={tenant.icon_url}
                alt=""
                className="size-10 rounded-md object-cover"
              />
            ) : (
              <div className="flex size-10 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                {tenant.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">{tenant.name}</p>
              <h1 className="text-title">Complete seu acesso</h1>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">Olá, {firstName}.</p>
            <h2 className="mt-2 text-xl font-semibold tracking-normal">
              {onboarding.title}
            </h2>
            {onboarding.description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {onboarding.description}
              </p>
            )}
          </div>
        </header>

        <section className="space-y-5">
          {onboarding.questions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-lg border border-border bg-card p-5"
            >
              <div className="mb-4 space-y-2">
                <Label className="text-base font-medium">
                  {index + 1}. {question.label}
                  {question.required && (
                    <span className="ml-1 text-destructive">*</span>
                  )}
                </Label>
                {question.description && (
                  <p className="text-sm text-muted-foreground">
                    {question.description}
                  </p>
                )}
                {question.image_url && (
                  <img
                    src={question.image_url}
                    alt=""
                    className="mt-3 max-h-72 w-full rounded-md border border-border object-cover"
                  />
                )}
              </div>

              <QuestionField
                question={question}
                value={answers[question.id]}
                onChange={(value) => {
                  setAnswers((prev) => ({ ...prev, [question.id]: value }));
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next[question.id];
                    return next;
                  });
                }}
              />
              {errors[question.id] && (
                <p className="mt-2 text-sm text-destructive">
                  {errors[question.id]}
                </p>
              )}
            </div>
          ))}
        </section>

        <div className="flex justify-end">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={submitOnboarding.isPending}
          >
            {submitOnboarding.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Finalizar acesso
          </Button>
        </div>
      </div>
    </main>
  );
}
