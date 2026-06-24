import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { X, Loader2, Mail, Users, Send, Save } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import {
  useBroadcast,
  useBroadcastMutations,
  useSendBroadcast,
  useSubscribedCustomerCount,
} from "@/hooks/useBroadcasts";
import { useEmailSettings } from "@/hooks/useEmailSettings";

type DraftPayload = {
  subject: string;
  html: string;
  from_name: string;
  from_email: string;
  reply_to: string;
};

const EMPTY_DRAFT: DraftPayload = {
  subject: "",
  html: "",
  from_name: "",
  from_email: "",
  reply_to: "",
};

function hasMeaningfulDraftContent(draft: DraftPayload) {
  return [
    draft.subject,
    draft.html,
    draft.from_name,
    draft.from_email,
    draft.reply_to,
  ].some((value) => value.trim().length > 0);
}

function areDraftsEqual(a: DraftPayload, b: DraftPayload) {
  return a.subject === b.subject
    && a.html === b.html
    && a.from_name === b.from_name
    && a.from_email === b.from_email
    && a.reply_to === b.reply_to;
}

export default function AdminBroadcastEdit() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { broadcastId: paramId } = useParams<{ broadcastId: string }>();
  const { toast } = useToast();

  const { settings, loading: settingsLoading } = useEmailSettings();
  const { broadcast, loading: broadcastLoading } = useBroadcast(paramId);
  const { createBroadcast, updateBroadcast } = useBroadcastMutations();
  const sendBroadcast = useSendBroadcast();
  const { data: subscribedCount } = useSubscribedCustomerCount();

  const [broadcastId, setBroadcastId] = useState<string | null>(paramId ?? null);
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const lastSavedRef = useRef<DraftPayload>(EMPTY_DRAFT);
  const draftRef = useRef<DraftPayload>(EMPTY_DRAFT);
  const broadcastIdRef = useRef<string | null>(paramId ?? null);
  const createPromiseRef = useRef<Promise<string | null> | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load broadcast data when editing existing
  useEffect(() => {
    if (broadcast) {
      const savedDraft: DraftPayload = {
        subject: broadcast.subject,
        html: broadcast.html,
        from_name: broadcast.from_name,
        from_email: broadcast.from_email,
        reply_to: broadcast.reply_to ?? "",
      };
      setSubject(savedDraft.subject);
      setHtml(savedDraft.html);
      setFromName(savedDraft.from_name);
      setFromEmail(savedDraft.from_email);
      setReplyTo(savedDraft.reply_to);
      draftRef.current = savedDraft;
      lastSavedRef.current = savedDraft;
    }
  }, [broadcast]);

  useEffect(() => {
    draftRef.current = { subject, html, from_name: fromName, from_email: fromEmail, reply_to: replyTo };
  }, [subject, html, fromName, fromEmail, replyTo]);

  useEffect(() => {
    broadcastIdRef.current = broadcastId ?? paramId ?? null;
  }, [broadcastId, paramId]);

  const ensureBroadcastExists = useCallback(async (overrides: Partial<DraftPayload> = {}) => {
    const existingId = broadcastIdRef.current;
    if (existingId) return existingId;

    const requestedDraft = { ...draftRef.current, ...overrides };
    if (!hasMeaningfulDraftContent(requestedDraft)) return null;

    if (createPromiseRef.current) return createPromiseRef.current;

    const promise = (async () => {
      const result = await createBroadcast.mutateAsync({
        subject: requestedDraft.subject,
        html: requestedDraft.html,
        from_name: requestedDraft.from_name,
        from_email: requestedDraft.from_email,
        reply_to: requestedDraft.reply_to || undefined,
      });

      const createdId = result.id;
      const latestDraft = draftRef.current;

      if (!areDraftsEqual(latestDraft, requestedDraft)) {
        await updateBroadcast.mutateAsync({
          id: createdId,
          subject: latestDraft.subject,
          html: latestDraft.html,
          from_name: latestDraft.from_name,
          from_email: latestDraft.from_email,
          reply_to: latestDraft.reply_to || null,
        });
        lastSavedRef.current = latestDraft;
      } else {
        lastSavedRef.current = requestedDraft;
      }

      broadcastIdRef.current = createdId;
      setBroadcastId(createdId);
      navigate(`/admin/email/broadcasts/${createdId}/edit`, { replace: true });
      return createdId;
    })();

    createPromiseRef.current = promise;

    try {
      return await promise;
    } finally {
      createPromiseRef.current = null;
    }
  }, [createBroadcast, navigate, updateBroadcast]);

  const triggerCreationIfNeeded = useCallback((nextDraft: DraftPayload, overrides: Partial<DraftPayload>) => {
    draftRef.current = nextDraft;

    if (broadcastIdRef.current || !hasMeaningfulDraftContent(nextDraft)) return;

    void ensureBroadcastExists(overrides).catch(() => {
      // Keep local state intact; explicit save/send actions will surface the error.
    });
  }, [ensureBroadcastExists]);

  // Auto-save every 30 seconds
  const saveChanges = useCallback(async () => {
    const currentId = broadcastIdRef.current;
    if (!currentId) return;
    const currentDraft = draftRef.current;
    if (areDraftsEqual(currentDraft, lastSavedRef.current)) return;

    try {
      await updateBroadcast.mutateAsync({
        id: currentId,
        subject: currentDraft.subject,
        html: currentDraft.html,
        from_name: currentDraft.from_name,
        from_email: currentDraft.from_email,
        reply_to: currentDraft.reply_to || null,
      });
      lastSavedRef.current = currentDraft;
    } catch {
      // Silent fail for auto-save
    }
  }, [updateBroadcast]);

  useEffect(() => {
    if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    if (!(broadcastId ?? paramId)) return;

    autoSaveTimerRef.current = setInterval(saveChanges, 30_000);
    return () => {
      if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current);
    };
  }, [broadcastId, paramId, saveChanges]);

  const handleSaveDraft = async () => {
    const currentDraft = draftRef.current;
    if (!broadcastIdRef.current && !hasMeaningfulDraftContent(currentDraft)) return;

    setSaving(true);
    try {
      const ensuredId = await ensureBroadcastExists();
      if (!ensuredId) return;

      await saveChanges();
      toast({ title: t("email.broadcast.savedDraft") });
    } catch {
      toast({ title: "Erro ao salvar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    try {
      const ensuredId = await ensureBroadcastExists();
      if (!ensuredId) return;

      await saveChanges();
      await sendBroadcast.mutateAsync(ensuredId);
      toast({ title: t("email.broadcast.sentSuccess") });
      navigate(`/admin/email/broadcasts/${ensuredId}`);
    } catch {
      toast({ title: "Erro ao enviar", variant: "destructive" });
    } finally {
      setSending(false);
      setSendDialogOpen(false);
    }
  };

  const goBack = () => {
    void saveChanges();
    navigate("/admin/email/broadcasts");
  };

  const isLoading = (paramId && broadcastLoading) || settingsLoading;
  const currentId = broadcastId ?? paramId;
  const isDraft = !broadcast || broadcast.status === "draft";
  const currentDraft = { subject, html, from_name: fromName, from_email: fromEmail, reply_to: replyTo };
  const canSaveDraft = !!currentId || hasMeaningfulDraftContent(currentDraft);
  const canSend = !!subject.trim()
    && !!html.trim()
    && !!fromName.trim()
    && !!fromEmail.trim()
    && subscribedCount !== 0;

  const handleSubjectChange = (value: string) => {
    setSubject(value);
    triggerCreationIfNeeded({ ...draftRef.current, subject: value }, { subject: value });
  };

  const handleHtmlChange = (value: string) => {
    setHtml(value);
    triggerCreationIfNeeded({ ...draftRef.current, html: value }, { html: value });
  };

  const handleFromNameChange = (value: string) => {
    setFromName(value);
    triggerCreationIfNeeded({ ...draftRef.current, from_name: value }, { from_name: value });
  };

  const handleFromEmailChange = (value: string) => {
    setFromEmail(value);
    triggerCreationIfNeeded({ ...draftRef.current, from_email: value }, { from_email: value });
  };

  const handleReplyToChange = (value: string) => {
    setReplyTo(value);
    triggerCreationIfNeeded({ ...draftRef.current, reply_to: value }, { reply_to: value });
  };

  // Full-screen loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[100dvh] bg-background">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      <div className="flex-1 flex flex-col min-h-0 bg-card">
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button variant="ghost" size="icon-sm" onClick={goBack}>
              <X className="size-4" />
            </Button>
            <span className="text-base font-semibold text-foreground truncate">
              {subject || t("email.newBroadcast")}
            </span>
            {isDraft && (
              <Badge variant="secondary" className="shrink-0">
                {t("email.broadcast.status.draft")}
              </Badge>
            )}
          </div>

          {/* Actions */}
          {isDraft && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                disabled={saving || !canSaveDraft}
              >
                {saving ? <Loader2 className="size-4 animate-spin mr-1.5" /> : <Save className="size-4 mr-1.5" />}
                {t("email.broadcast.saveDraft")}
              </Button>
              <Button
                size="sm"
                onClick={() => setSendDialogOpen(true)}
                disabled={!canSend}
              >
                <Send className="size-4 mr-1.5" />
                {t("email.broadcast.sendNow")}
              </Button>
            </div>
          )}
        </div>

        {/* ─── Content ─── */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          {/* LEFT: Editor */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 order-2 lg:order-1">
            <div className="space-y-2">
              <label className="text-label">{t("email.broadcast.subject")}</label>
              <Input
                placeholder={t("email.broadcast.subjectPlaceholder")}
                value={subject}
                onChange={(e) => handleSubjectChange(e.target.value)}
                disabled={!isDraft}
                className="text-base"
              />
            </div>

            <div className="space-y-2">
              <label className="text-label">Conteúdo</label>
              {/* TODO: Replace with block editor (React Email) */}
              <Textarea
                placeholder="Escreva o conteúdo do email..."
                value={html}
                onChange={(e) => handleHtmlChange(e.target.value)}
                rows={24}
                className="text-sm resize-none"
                disabled={!isDraft}
              />
              <p className="text-meta text-muted-foreground">
                {"{{unsubscribe_url}}"} será adicionado automaticamente ao final do email.
              </p>
            </div>
          </div>

          {/* RIGHT: Sidebar */}
          <div className="w-full lg:w-[320px] shrink-0 overflow-y-auto border-b lg:border-b-0 lg:border-l border-border p-6 space-y-4 order-1 lg:order-2">
            {/* Sender info */}
            <Card variant="bordered" size="sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-label flex items-center gap-2">
                  <Mail className="size-4" />
                  {t("email.sender.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs">{t("email.sender.fromName")}</label>
                  <Input
                    placeholder={t("email.sender.fromNamePlaceholder")}
                    value={fromName}
                    onChange={(e) => handleFromNameChange(e.target.value)}
                    disabled={!isDraft}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs">{t("email.sender.fromEmail")}</label>
                  <Input
                    placeholder={t("email.sender.fromEmailPlaceholder")}
                    value={fromEmail}
                    onChange={(e) => handleFromEmailChange(e.target.value)}
                    disabled={!isDraft}
                    className="h-8 text-sm"
                  />
                  {settings?.domain && (
                    <p className="text-xs text-muted-foreground">Deve terminar com @{settings.domain}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-muted-foreground text-xs">{t("email.sender.replyTo")}</label>
                  <Input
                    placeholder={t("email.sender.replyToPlaceholder")}
                    value={replyTo}
                    onChange={(e) => handleReplyToChange(e.target.value)}
                    disabled={!isDraft}
                    className="h-8 text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Audience */}
            <Card variant="bordered" size="sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-label flex items-center gap-2">
                  <Users className="size-4" />
                  {t("email.broadcast.audience")}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="text-foreground">{t("email.broadcast.allSubscribed")}</p>
                <p className="text-muted-foreground mt-1">
                  {subscribedCount != null
                    ? t("email.broadcast.recipientCount", { count: subscribedCount })
                    : "—"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Send confirmation dialog */}
      <AlertDialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("email.broadcast.confirmSend", { count: subscribedCount ?? 0 })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("email.broadcast.confirmSendDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={sending}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleSend} disabled={sending}>
              {sending && <Loader2 className="size-4 animate-spin mr-1.5" />}
              {t("email.broadcast.confirmButton")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
