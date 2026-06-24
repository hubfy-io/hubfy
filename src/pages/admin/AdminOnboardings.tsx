import { useEffect, useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  CheckCircle2,
  ClipboardList,
  GripVertical,
  ImagePlus,
  Loader2,
  PauseCircle,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/hooks/useTenant";
import {
  useCustomerOnboardings,
  useOnboardingProductOptions,
  useOnboardingResponses,
  useSaveCustomerOnboarding,
  useSetCustomerOnboardingStatus,
  type CustomerOnboarding,
  type CustomerOnboardingResponse,
} from "@/hooks/useCustomerOnboardings";
import {
  createOnboardingQuestion,
  questionTypeNeedsOptions,
  type CustomerOnboardingQuestion,
  type CustomerOnboardingQuestionType,
} from "@/types/customer-onboarding";
import { translateAppError } from "@/lib/app-error-utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type Draft = {
  id?: string;
  title: string;
  description: string;
  questions: CustomerOnboardingQuestion[];
  productIds: string[];
};

const QUESTION_TYPE_LABELS: Record<CustomerOnboardingQuestionType, string> = {
  short_text: "Texto curto",
  long_text: "Texto longo",
  single_choice: "Escolha única",
  multiple_choice: "Múltipla escolha",
  dropdown: "Dropdown",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  active: "Ativo",
  inactive: "Inativo",
};

const STATUS_VARIANTS: Record<string, "gray" | "green" | "amber"> = {
  draft: "amber",
  active: "green",
  inactive: "gray",
};

function emptyDraft(): Draft {
  return {
    title: "",
    description: "",
    questions: [createOnboardingQuestion()],
    productIds: [],
  };
}

function draftFromOnboarding(onboarding: CustomerOnboarding): Draft {
  return {
    id: onboarding.id,
    title: onboarding.title,
    description: onboarding.description ?? "",
    questions:
      onboarding.questions.length > 0
        ? onboarding.questions
        : [createOnboardingQuestion()],
    productIds: onboarding.productIds,
  };
}

function validateQuestions(questions: CustomerOnboardingQuestion[]) {
  const visibleQuestions = questions.filter((question) => question.label.trim());

  if (visibleQuestions.length === 0) {
    return "Adicione pelo menos uma pergunta.";
  }

  for (const question of visibleQuestions) {
    if (questionTypeNeedsOptions(question.type)) {
      const filledOptions = (question.options ?? []).filter((option) =>
        option.label.trim(),
      );

      if (filledOptions.length < 2) {
        return `A pergunta "${question.label}" precisa de pelo menos 2 opções.`;
      }
    }
  }

  return null;
}

function normalizeForSave(questions: CustomerOnboardingQuestion[]) {
  return questions
    .filter((question) => question.label.trim())
    .map((question) => ({
      ...question,
      label: question.label.trim(),
      description: question.description?.trim() || "",
      options: questionTypeNeedsOptions(question.type)
        ? (question.options ?? []).filter((option) => option.label.trim())
        : [],
    }));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function renderAnswer(value: unknown) {
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "string" && value.trim()) return value;
  return "Sem resposta";
}

function SortableQuestionCard({
  question,
  disabled,
  index,
  onChange,
  onRemove,
  onImageUpload,
}: {
  question: CustomerOnboardingQuestion;
  disabled: boolean;
  index: number;
  onChange: (updates: Partial<CustomerOnboardingQuestion>) => void;
  onRemove: () => void;
  onImageUpload: (file: File) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: question.id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const needsOptions = questionTypeNeedsOptions(question.type);

  const updateOption = (optionId: string, label: string) => {
    onChange({
      options: (question.options ?? []).map((option) =>
        option.id === optionId ? { ...option, label } : option,
      ),
    });
  };

  const addOption = () => {
    onChange({
      options: [
        ...(question.options ?? []),
        { id: crypto.randomUUID(), label: "" },
      ],
    });
  };

  const removeOption = (optionId: string) => {
    onChange({
      options: (question.options ?? []).filter((option) => option.id !== optionId),
    });
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      variant="bordered"
      className={cn(isDragging && "opacity-70")}
    >
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 pb-3">
        <button
          type="button"
          className="mt-1 rounded-md p-1 text-muted-foreground hover:bg-muted disabled:opacity-40"
          disabled={disabled}
          {...attributes}
          {...listeners}
          aria-label="Ordenar pergunta"
        >
          <GripVertical className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <CardTitle className="text-sm">Pergunta {index + 1}</CardTitle>
          <CardDescription>Configure o texto e o tipo de resposta.</CardDescription>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={disabled}
        >
          <Trash2 className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-[1fr_190px]">
          <div className="space-y-2">
            <Label>Pergunta</Label>
            <Input
              value={question.label}
              onChange={(event) => onChange({ label: event.target.value })}
              placeholder="Ex: Qual seu principal objetivo?"
              disabled={disabled}
            />
          </div>
          <div className="space-y-2">
            <Label>Tipo</Label>
            <Select
              value={question.type}
              disabled={disabled}
              onValueChange={(value) => {
                const nextType = value as CustomerOnboardingQuestionType;
                onChange({
                  type: nextType,
                  options: questionTypeNeedsOptions(nextType)
                    ? question.options && question.options.length >= 2
                      ? question.options
                      : [
                          { id: crypto.randomUUID(), label: "" },
                          { id: crypto.randomUUID(), label: "" },
                        ]
                    : [],
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Texto de apoio</Label>
          <Textarea
            value={question.description ?? ""}
            onChange={(event) => onChange({ description: event.target.value })}
            placeholder="Opcional"
            disabled={disabled}
            className="min-h-16"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Label className="flex items-center gap-2 text-sm font-normal">
            <Switch
              checked={question.required}
              onCheckedChange={(checked) => onChange({ required: checked })}
              disabled={disabled}
            />
            Obrigatória
          </Label>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-muted has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
            <ImagePlus className="size-4" />
            Imagem de apoio
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={disabled}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onImageUpload(file);
                event.target.value = "";
              }}
            />
          </label>
          {question.image_url && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange({ image_url: "" })}
              disabled={disabled}
            >
              Remover imagem
            </Button>
          )}
        </div>

        {question.image_url && (
          <img
            src={question.image_url}
            alt=""
            className="h-28 w-full rounded-md border border-border object-cover"
          />
        )}

        {needsOptions && (
          <div className="space-y-3 rounded-md border border-border p-3">
            <div className="flex items-center justify-between gap-3">
              <Label>Opções de resposta</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                disabled={disabled}
              >
                <Plus className="size-4" />
                Opção
              </Button>
            </div>
            <div className="space-y-2">
              {(question.options ?? []).map((option, optionIndex) => (
                <div key={option.id} className="flex items-center gap-2">
                  <Input
                    value={option.label}
                    onChange={(event) => updateOption(option.id, event.target.value)}
                    placeholder={`Opção ${optionIndex + 1}`}
                    disabled={disabled}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeOption(option.id)}
                    disabled={disabled || (question.options ?? []).length <= 2}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminOnboardings() {
  const { tenant } = useTenant();
  const { user } = useAuth();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const onboardingsQuery = useCustomerOnboardings();
  const productsQuery = useOnboardingProductOptions();
  const saveOnboarding = useSaveCustomerOnboarding();
  const setStatus = useSetCustomerOnboardingStatus();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [activeTab, setActiveTab] = useState("config");
  const [responseDetail, setResponseDetail] = useState<CustomerOnboardingResponse | null>(null);
  const responsesQuery = useOnboardingResponses(draft.id ?? null);

  const onboardings = onboardingsQuery.data ?? [];
  const selected = useMemo(
    () => onboardings.find((item) => item.id === selectedId) ?? null,
    [onboardings, selectedId],
  );

  useEffect(() => {
    if (!isCreatingNew && !selectedId && onboardings.length > 0) {
      setSelectedId(onboardings[0].id);
    }
  }, [isCreatingNew, onboardings, selectedId]);

  useEffect(() => {
    if (selected) {
      setDraft(draftFromOnboarding(selected));
      setActiveTab("config");
    }
  }, [selected]);

  const questionsLocked = Boolean(selected && selected.responsesCount > 0);
  const saving = saveOnboarding.isPending || setStatus.isPending;

  const updateQuestion = (
    questionId: string,
    updates: Partial<CustomerOnboardingQuestion>,
  ) => {
    setDraft((prev) => ({
      ...prev,
      questions: prev.questions.map((question) =>
        question.id === questionId ? { ...question, ...updates } : question,
      ),
    }));
  };

  const removeQuestion = (questionId: string) => {
    setDraft((prev) => ({
      ...prev,
      questions:
        prev.questions.length > 1
          ? prev.questions.filter((question) => question.id !== questionId)
          : prev.questions,
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setDraft((prev) => {
      const oldIndex = prev.questions.findIndex((question) => question.id === active.id);
      const newIndex = prev.questions.findIndex((question) => question.id === over.id);
      return { ...prev, questions: arrayMove(prev.questions, oldIndex, newIndex) };
    });
  };

  const uploadQuestionImage = async (questionId: string, file: File) => {
    if (!tenant || !user) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Envie uma imagem válida.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("A imagem deve ter até 2MB.");
      return;
    }

    try {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${user.id}/${tenant.id}_onboarding_${questionId}.${ext}`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(fileName, file, { upsert: true });
      if (error) throw error;

      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      updateQuestion(questionId, { image_url: `${data.publicUrl}?t=${Date.now()}` });
      toast.success("Imagem adicionada.");
    } catch (error) {
      toast.error(translateAppError(error, "Não foi possível enviar a imagem."));
    }
  };

  const validateDraft = (strict: boolean) => {
    if (!draft.title.trim()) return "Dê um nome para o onboarding.";
    const questionError = validateQuestions(draft.questions);
    if (questionError) return questionError;
    if (strict && draft.productIds.length === 0) {
      return "Vincule pelo menos um produto antes de ativar.";
    }
    return null;
  };

  const handleSave = async () => {
    const error = validateDraft(false);
    if (error) {
      toast.error(error);
      return null;
    }

    try {
      const savedId = await saveOnboarding.mutateAsync({
        ...draft,
        questions: normalizeForSave(draft.questions),
      });
      setSelectedId(savedId);
      setIsCreatingNew(false);
      toast.success("Onboarding salvo.");
      return savedId;
    } catch (saveError) {
      toast.error(translateAppError(saveError, "Não foi possível salvar."));
      return null;
    }
  };

  const handleActivate = async () => {
    const error = validateDraft(true);
    if (error) {
      toast.error(error);
      return;
    }

    const savedId = await handleSave();
    if (!savedId) return;

    try {
      await setStatus.mutateAsync({ onboardingId: savedId, status: "active" });
      toast.success("Onboarding ativado.");
    } catch (statusError) {
      toast.error(translateAppError(statusError, "Não foi possível ativar."));
    }
  };

  const handleDeactivate = async () => {
    if (!draft.id) return;
    try {
      await setStatus.mutateAsync({ onboardingId: draft.id, status: "inactive" });
      toast.success("Onboarding desativado.");
    } catch (statusError) {
      toast.error(translateAppError(statusError, "Não foi possível desativar."));
    }
  };

  const startNew = () => {
    setIsCreatingNew(true);
    setSelectedId(null);
    setDraft(emptyDraft());
    setActiveTab("config");
  };

  const loading = onboardingsQuery.isLoading || productsQuery.isLoading;

  return (
    <div className="min-w-0 p-4 sm:p-6 lg:p-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-normal text-foreground md:text-2xl">
              Onboardings
            </h1>
            <p className="text-sm text-muted-foreground">
              Crie formulários obrigatórios vinculados aos produtos do portal.
            </p>
          </div>
          <Button onClick={startNew}>
            <Plus className="size-4" />
            Novo onboarding
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card variant="bordered" className="h-fit">
            <CardHeader>
              <CardTitle className="text-base">Lista</CardTitle>
              <CardDescription>
                Apenas um onboarding pode ficar ativo por vez.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <div className="flex h-32 items-center justify-center">
                  <Loader2 className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : onboardings.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                  Nenhum onboarding criado ainda.
                </div>
              ) : (
                onboardings.map((onboarding) => (
                  <button
                    key={onboarding.id}
                    type="button"
                    onClick={() => {
                      setIsCreatingNew(false);
                      setSelectedId(onboarding.id);
                    }}
                    className={cn(
                      "w-full rounded-md border border-border p-3 text-left transition-colors hover:bg-muted/60",
                      selectedId === onboarding.id && "border-primary bg-muted",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {onboarding.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {onboarding.productIds.length} produto(s) ·{" "}
                          {onboarding.responsesCount} resposta(s)
                        </p>
                      </div>
                      <Badge variant={STATUS_VARIANTS[onboarding.status] ?? "gray"}>
                        {STATUS_LABELS[onboarding.status] ?? onboarding.status}
                      </Badge>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <CardTitle className="text-base">
                    {draft.id ? "Editar onboarding" : "Novo onboarding"}
                  </CardTitle>
                  <CardDescription>
                    O cliente só será bloqueado se tiver comprado um produto vinculado.
                  </CardDescription>
                </div>
                {selected && (
                  <Badge variant={STATUS_VARIANTS[selected.status] ?? "gray"}>
                    {STATUS_LABELS[selected.status] ?? selected.status}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="config">Configuração</TabsTrigger>
                  <TabsTrigger value="products">Produtos vinculados</TabsTrigger>
                  <TabsTrigger value="responses" disabled={!draft.id}>
                    Respostas
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="config" className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Nome interno</Label>
                      <Input
                        value={draft.title}
                        onChange={(event) =>
                          setDraft((prev) => ({ ...prev, title: event.target.value }))
                        }
                        placeholder="Ex: Diagnóstico inicial"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Descrição para o cliente</Label>
                      <Input
                        value={draft.description}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            description: event.target.value,
                          }))
                        }
                        placeholder="Ex: Responda para personalizar sua experiência"
                      />
                    </div>
                  </div>

                  {questionsLocked && (
                    <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning-foreground">
                      Este onboarding já tem respostas. Para preservar o histórico, as
                      perguntas ficam bloqueadas. Produtos e textos gerais ainda podem ser
                      ajustados.
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="text-section">Perguntas</h2>
                        <p className="text-sm text-muted-foreground">
                          Use a alça para reordenar. Imagens são opcionais.
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            questions: [...prev.questions, createOnboardingQuestion()],
                          }))
                        }
                        disabled={questionsLocked}
                      >
                        <Plus className="size-4" />
                        Pergunta
                      </Button>
                    </div>

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={draft.questions.map((question) => question.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-4">
                          {draft.questions.map((question, index) => (
                            <SortableQuestionCard
                              key={question.id}
                              question={question}
                              index={index}
                              disabled={questionsLocked}
                              onChange={(updates) => updateQuestion(question.id, updates)}
                              onRemove={() => removeQuestion(question.id)}
                              onImageUpload={(file) =>
                                uploadQuestionImage(question.id, file)
                              }
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </div>
                </TabsContent>

                <TabsContent value="products" className="space-y-4">
                  <div>
                    <h2 className="text-section">Produtos que exigem este onboarding</h2>
                    <p className="text-sm text-muted-foreground">
                      Se o cliente tiver qualquer produto marcado abaixo, o formulário será
                      obrigatório antes do acesso.
                    </p>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {(productsQuery.data ?? []).map((product) => {
                      const checked = draft.productIds.includes(product.id);
                      return (
                        <label
                          key={product.id}
                          className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 hover:bg-muted/60"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(next) => {
                              setDraft((prev) => ({
                                ...prev,
                                productIds: next
                                  ? [...prev.productIds, product.id]
                                  : prev.productIds.filter((id) => id !== product.id),
                              }));
                            }}
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{product.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {product.status === "active" ? "Ativo" : "Não publicado"}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {(productsQuery.data ?? []).length === 0 && (
                    <div className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
                      Crie um produto antes de vincular um onboarding.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="responses" className="space-y-4">
                  <div>
                    <h2 className="text-section">Respostas recebidas</h2>
                    <p className="text-sm text-muted-foreground">
                      Cada cliente aparece uma vez por onboarding concluído.
                    </p>
                  </div>
                  <div className="rounded-md border border-border">
                    {responsesQuery.isLoading ? (
                      <div className="flex h-32 items-center justify-center">
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : (responsesQuery.data ?? []).length === 0 ? (
                      <div className="p-4 text-sm text-muted-foreground">
                        Nenhuma resposta ainda.
                      </div>
                    ) : (
                      <div className="divide-y divide-border">
                        {(responsesQuery.data ?? []).map((response) => (
                          <button
                            key={response.id}
                            type="button"
                            onClick={() => setResponseDetail(response)}
                            className="grid w-full gap-2 p-4 text-left hover:bg-muted/60 md:grid-cols-[1fr_1fr_auto]"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {response.customer?.name || "Cliente sem nome"}
                              </p>
                              <p className="truncate text-xs text-muted-foreground">
                                {response.customer?.email}
                              </p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(response.completed_at)}
                            </p>
                            <span className="text-sm text-primary">Ver respostas</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <Separator className="my-6" />

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                {selected?.status === "active" ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDeactivate}
                    disabled={saving}
                  >
                    <PauseCircle className="size-4" />
                    Desativar
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleActivate}
                    disabled={saving}
                  >
                    <CheckCircle2 className="size-4" />
                    Ativar
                  </Button>
                )}
                <Button type="button" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  Salvar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!responseDetail} onOpenChange={(open) => !open && setResponseDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respostas do cliente</DialogTitle>
          </DialogHeader>
          {responseDetail && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 rounded-md border border-border p-3">
                <ClipboardList className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {responseDetail.customer?.name || "Cliente sem nome"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {responseDetail.customer?.email} ·{" "}
                    {formatDate(responseDetail.completed_at)}
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                {responseDetail.question_snapshot.map((question) => (
                  <div key={question.id} className="rounded-md border border-border p-3">
                    <p className="text-sm font-medium">{question.label}</p>
                    <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                      {renderAnswer(responseDetail.answers[question.id])}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
