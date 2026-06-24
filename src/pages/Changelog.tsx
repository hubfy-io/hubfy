import { Separator } from "@/components/ui/separator";
import { LandingHeader } from "@/components/LandingHeader";
import { useTranslation } from "react-i18next";
import { type CSSProperties, type ReactNode, useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Loader2, Search, BookOpen, Package, Users, Receipt } from "lucide-react";

type TagType = "feature" | "fix" | "improvement" | "security";

interface ChangelogEntry {
  title: string;
  paragraphs: ReactNode[];
  tags: TagType[];
  image?: string;
  imageAlt?: string;
  images?: { src: string; alt: string }[];
  mockup?: ReactNode;
}

// Locked light-theme tokens (mirror :root in src/index.css) so inline mockups
// always render as a "light screenshot" regardless of the viewer's theme.
const lightThemeScope: CSSProperties = {
  "--background": "0 0% 100%",
  "--foreground": "223.8136 0% 1.292%",
  "--card": "0 0% 100%",
  "--card-foreground": "223.8136 0% 1.292%",
  "--primary": "223.8136 0% 8.6104%",
  "--primary-foreground": "223.8136 0% 97.3691%",
  "--muted": "223.8136 0% 96.0587%",
  "--muted-foreground": "223.8136 0% 32.3067%",
  "--border": "223.8136 0% 92%",
  "--input": "223.8136 0% 92.1478%",
  "--ring": "223.8136 0% 32.3067%",
} as CSSProperties;

/* ── Mockup: Design → Player de vídeo com toggle de legendas ── */
function AutoCaptionsToggleMockup() {
  return (
    <div
      style={lightThemeScope}
      className="w-full overflow-hidden rounded-lg bg-background p-4 md:p-6 ring-1 ring-foreground/10"
    >
      <div className="mb-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span>Design</span>
        <span>›</span>
        <span className="font-medium text-foreground/70">Player de vídeo</span>
      </div>

      <Card variant="bordered" size="sm">
        <CardHeader>
          <CardTitle className="text-sm">Comportamento do player</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-[11px]">Autoplay</Label>
              <p className="text-[10px] text-muted-foreground">
                Reproduz o vídeo automaticamente quando a aula abre.
              </p>
            </div>
            <Switch checked={false} className="scale-75" />
          </div>

          <div className="border-t border-border" />

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-[11px]">Loop</Label>
              <p className="text-[10px] text-muted-foreground">
                Reinicia o vídeo automaticamente ao terminar.
              </p>
            </div>
            <Switch checked={false} className="scale-75" />
          </div>

          <div className="border-t border-border" />

          {/* Linha destacada — legendas automáticas */}
          <div className="-mx-2 flex items-center justify-between gap-4 rounded-md bg-indigo-500/10 px-2 py-1.5 ring-1 ring-indigo-500/20">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <Label className="text-[11px]">Legendas automáticas</Label>
                <Badge variant="blue" className="px-1.5 py-0 text-[9px] leading-none">
                  Pro
                </Badge>
                <Badge variant="amber" className="px-1.5 py-0 text-[9px] leading-none">
                  Novo
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Gera legendas em português, inglês e espanhol em cada upload.
              </p>
            </div>
            <Switch checked className="scale-75" />
          </div>

          <div className="border-t border-border" />

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label className="text-[11px]">Permitir avançar</Label>
              <p className="text-[10px] text-muted-foreground">
                Aluno pode arrastar a barra de progresso para frente.
              </p>
            </div>
            <Switch checked className="scale-75" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Mockup: Lista de vídeos com indicador "Gerando legendas..." ── */
function GeneratingSubtitlesMockup() {
  return (
    <div
      style={lightThemeScope}
      className="w-full overflow-hidden rounded-lg bg-background p-4 md:p-6 ring-1 ring-foreground/10"
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold text-foreground">Vídeos</h4>
          <p className="text-[10px] text-muted-foreground">
            12 vídeos neste workspace
          </p>
        </div>
        <Badge variant="gray" className="px-2 py-0 text-[9px]">
          Biblioteca
        </Badge>
      </div>

      <Card variant="bordered" size="sm">
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {/* Row 1 — Just uploaded, generating subtitles */}
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="size-9 shrink-0 rounded-md bg-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-foreground">
                  How we scaled from 10 to 10k customers
                </p>
                <p className="text-[9px] text-muted-foreground">
                  Adicionado agora · 18:42
                </p>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <Badge variant="green" className="px-1.5 py-0 text-[9px] leading-none">
                  Pronto
                </Badge>
                <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <Loader2 className="size-2.5 animate-spin" />
                  Gerando legendas...
                </span>
              </div>
            </div>

            {/* Row 2 — Ready, subtitles done */}
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="size-9 shrink-0 rounded-md bg-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-foreground">
                  Product-led growth — lessons from Notion
                </p>
                <p className="text-[9px] text-muted-foreground">
                  Adicionado ontem · 24:08
                </p>
              </div>
              <Badge variant="green" className="px-1.5 py-0 text-[9px] leading-none">
                Pronto
              </Badge>
            </div>

            {/* Row 3 — Ready */}
            <div className="flex items-center gap-3 px-3 py-2.5">
              <div className="size-9 shrink-0 rounded-md bg-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-foreground">
                  Why your landing page isn't converting
                </p>
                <p className="text-[9px] text-muted-foreground">
                  Adicionado há 2 dias · 09:51
                </p>
              </div>
              <Badge variant="green" className="px-1.5 py-0 text-[9px] leading-none">
                Pronto
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ── Mockup: Busca global com resultados sem acento ── */
function GlobalSearchMockup() {
  return (
    <div
      style={lightThemeScope}
      className="w-full overflow-hidden rounded-lg bg-background p-4 md:p-6 ring-1 ring-foreground/10"
    >
      <div className="mb-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span>Painel</span>
        <span>›</span>
        <span className="font-medium text-foreground/70">Busca global</span>
      </div>

      {/* Fake search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
        <div className="flex h-7 w-full items-center rounded-md border border-input bg-background pl-7 pr-10 text-[11px]">
          <span className="text-foreground">cafe</span>
          <span className="ml-0.5 inline-block h-2.5 w-px animate-pulse bg-foreground" />
        </div>
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex h-4 select-none items-center rounded border bg-muted px-1 text-[8px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      {/* Results dropdown */}
      <div className="mt-1 rounded-md border border-border bg-popover shadow-sm">
        <div className="px-2 pt-2 pb-0.5">
          <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            Cursos
          </p>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <BookOpen className="size-3 shrink-0 text-muted-foreground" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">Café</span> Masterclass — from bean to cup
            </span>
            <span className="truncate text-[9px] text-muted-foreground">ativo</span>
          </div>
        </div>

        <div className="px-2 pt-1.5 pb-0.5">
          <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            Produtos
          </p>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Package className="size-3 shrink-0 text-muted-foreground" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[11px] text-muted-foreground">
              <span className="font-semibold text-foreground">Café</span> Premium Box — monthly subscription
            </span>
            <span className="truncate text-[9px] text-muted-foreground">active</span>
          </div>
        </div>

        <div className="px-2 pt-1.5 pb-0.5">
          <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            Clientes
          </p>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Users className="size-3 shrink-0 text-muted-foreground" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[11px] text-muted-foreground">
              Sarah <span className="font-semibold text-foreground">Café</span>da
            </span>
            <span className="truncate text-[9px] text-muted-foreground">sarah@example.com</span>
          </div>
        </div>

        <div className="px-2 pt-1.5 pb-0.5">
          <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            Pedidos
          </p>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Receipt className="size-3 shrink-0 text-muted-foreground" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[11px] text-muted-foreground">
              Michael Chen — <span className="font-semibold text-foreground">Café</span> Premium Box
            </span>
            <span className="truncate text-[9px] text-muted-foreground">paid · $89.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Mockup: Busca global por descrição (campo expandido) ── */
function SearchByDescriptionMockup() {
  return (
    <div
      style={lightThemeScope}
      className="w-full overflow-hidden rounded-lg bg-background p-4 md:p-6 ring-1 ring-foreground/10"
    >
      <div className="mb-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <span>Painel</span>
        <span>›</span>
        <span className="font-medium text-foreground/70">Busca global</span>
      </div>

      {/* Fake search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
        <div className="flex h-7 w-full items-center rounded-md border border-input bg-background pl-7 pr-10 text-[11px]">
          <span className="text-foreground">growth</span>
          <span className="ml-0.5 inline-block h-2.5 w-px animate-pulse bg-foreground" />
        </div>
        <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex h-4 select-none items-center rounded border bg-muted px-1 text-[8px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </div>

      {/* Results dropdown */}
      <div className="mt-1 rounded-md border border-border bg-popover shadow-sm">
        <div className="px-2 pt-2 pb-0.5">
          <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            Cursos
          </p>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <BookOpen className="size-3 shrink-0 text-muted-foreground" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[11px] text-muted-foreground">
              Scaling playbooks
            </span>
            <span className="truncate text-[9px] text-muted-foreground">
              "...frameworks for product-led <span className="font-semibold text-foreground">growth</span> and retention..."
            </span>
          </div>
        </div>

        <div className="px-2 pt-1.5 pb-0.5">
          <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            Produtos
          </p>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Package className="size-3 shrink-0 text-muted-foreground" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[11px] text-muted-foreground">
              Founder Toolkit
            </span>
            <span className="truncate text-[9px] text-muted-foreground">
              slug: <span className="font-semibold text-foreground">growth</span>-toolkit-2026
            </span>
          </div>
        </div>

        <div className="px-2 pt-1.5 pb-0.5">
          <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            Aulas
          </p>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5">
          <BookOpen className="size-3 shrink-0 text-muted-foreground" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[11px] text-muted-foreground">
              Channel selection
            </span>
            <span className="truncate text-[9px] text-muted-foreground">
              "...pick two <span className="font-semibold text-foreground">growth</span> channels and go deep..."
            </span>
          </div>
        </div>
      </div>

      <p className="mt-2 text-[9px] text-muted-foreground">
        Agora a busca entra na descrição, no slug e até no texto da aula.
      </p>
    </div>
  );
}

interface ChangelogDay {
  date: string;
  entries: ChangelogEntry[];
}

const tagConfig: Record<TagType, { label: string; color: string }> = {
  feature: { label: "Nova feature!", color: "bg-blue-500" },
  fix: { label: "Correção", color: "bg-emerald-500" },
  improvement: { label: "Melhoria", color: "bg-amber-400" },
  security: { label: "Segurança", color: "bg-purple-500" },
};

const B = ({ children }: { children: ReactNode }) => (
  <strong className="font-semibold text-foreground">{children}</strong>
);

const PLACEHOLDER = "/changelog/placeholder.svg";

const changelog: ChangelogDay[] = [
  {
    date: "16 de abril de 2026",
    entries: [
      {
        title: "Legendas automáticas em 3 idiomas, em todo vídeo que você subir",
        paragraphs: [
          <>
            Gravou a aula e subiu pra Hubfy? <B>Pronto, suas legendas já estão a caminho</B> — em português, inglês e espanhol, geradas automaticamente, sem você precisar mexer em nada. Não precisa subir arquivo de legenda, não precisa contratar transcritor, não precisa editar linha por linha. Cada vídeo enviado pro seu workspace sai com as três faixas de legenda prontas pro player do aluno, e o próprio aluno escolhe o idioma que prefere assistir no botão <B>CC</B> dentro do vídeo.
          </>,
          <>
            Pra ativar, vá em <B>Design → Player de vídeo</B> e ligue a opção "Legendas automáticas". Pronto — a partir desse momento, todo vídeo novo que você subir vai sair com legendas, e os vídeos que você já tinha subido antes também passam a exibi-las sem nenhum retrabalho. Enquanto a geração acontece (normalmente poucos minutos depois do upload), a gente mostra um indicador <code className="rounded bg-muted px-1.5 py-0.5 text-xs">Gerando legendas...</code> direto na sua lista de vídeos, então você sabe exatamente quando elas ficaram disponíveis pro aluno.
          </>,
          <>
            Essa é a resposta pra uma dor real de quem vende conteúdo em vídeo: <B>acessibilidade e alcance multilíngue</B> sempre foram caros e demorados. Aluno com deficiência auditiva, aluno que assiste no ônibus sem fone, aluno estrangeiro que entende melhor lendo — todos ficam atendidos. E pra quem quer vender fora do Brasil, agora dá pra oferecer seus cursos em mercados de língua inglesa e espanhola sem precisar regravar nada. É o tipo de diferencial que antes custava milhares de reais por curso, e agora está incluído.
          </>,
          <>
            Legendas automáticas são um recurso do <B>plano Pro</B>. Se você está no Free, o toggle aparece com um selo Pro sinalizando o upgrade — e no momento em que você assina, o recurso já liga pros vídeos existentes e pros novos, sem reupload de nada.
          </>,
        ],
        tags: ["feature"],
        mockup: (
          <div className="grid gap-3 sm:grid-cols-2">
            <AutoCaptionsToggleMockup />
            <GeneratingSubtitlesMockup />
          </div>
        ),
      },
      {
        title: "Busca do painel agora encontra muito mais — e sem se importar com acentos",
        paragraphs: [
          <>
            A busca que fica no topo de todo o painel (aquela que abre com o atalho <B>⌘K</B> ou <B>Ctrl+K</B>) acabou de ficar bem mais esperta. Antes ela olhava só pro nome e pro título das coisas — agora ela também procura na <B>descrição dos cursos, nos slugs dos produtos, no conteúdo das aulas e no nome do produto dentro de pedidos</B>. Ou seja: você digita duas letras de qualquer coisa que lembre do que quer achar, e a Hubfy encontra — mesmo que você não lembre exatamente como aquele curso ou produto foi batizado.
          </>,
          <>
            Outra mudança que parece pequena mas muda o dia a dia: a busca agora <B>ignora acentos</B>. Digite "cafe" e ela encontra "Café Masterclass". Digite "sao paulo" e ela acha "Palestra São Paulo". Não importa se você tá com pressa, no celular sem teclado acentuado ou simplesmente esqueceu o acento — os resultados aparecem do mesmo jeito. Chega de digitar e receber "nenhum resultado" porque faltou um cedilha ou til.
          </>,
          <>
            E quando algo dá errado na busca — por exemplo, se sua sessão expirou ou se você perdeu permissão pra ver certos dados — agora uma <B>mensagem clara aparece na tela</B> explicando o que aconteceu, em vez do sistema ficar em silêncio. Você sabe na hora se é pra recarregar, refazer login, ou chamar o suporte, sem precisar ficar adivinhando.
          </>,
          <>
            Na prática: aperte <B>⌘K</B> em qualquer tela do painel, digite duas letras de um cliente, aula, produto, arquivo ou pedido, e os resultados já aparecem agrupados por categoria. As buscas recentes ficam salvas pra repetir com um toque. É o tipo de coisa que você vai usar o dia todo e quase nem perceber — até precisar encontrar algo específico em meio a centenas de itens e a busca <B>acertar de primeira</B>.
          </>,
        ],
        tags: ["improvement"],
        mockup: (
          <div className="grid gap-3 sm:grid-cols-2">
            <GlobalSearchMockup />
            <SearchByDescriptionMockup />
          </div>
        ),
      },
    ],
  },
  {
    date: "11 de abril de 2026",
    entries: [
      {
        title: "Wistia e Panda Video: conecte seus vídeos direto no editor de aulas",
        paragraphs: [
          <>
            Se você usa a <B>Wistia</B> para hospedar seus vídeos, agora pode conectar sua conta e selecionar qualquer vídeo direto no editor de aulas da Hubfy — sem copiar links, sem colar embeds, sem sair da plataforma. Acesse <B>Configurações → Integrações</B>, encontre o card "Wistia", clique em Conectar e cole seu <B>Access Token</B> (disponível no painel da Wistia em Account → API access). Pronto — no editor de aulas, a aba "Wistia" vai mostrar sua <B>biblioteca completa com thumbnails, nome e duração</B>. Selecione o vídeo, salve a aula e seus alunos já podem assistir.
          </>,
          <>
            Na mesma atualização, o <B>Panda Video</B> também foi adicionado como provedor. O fluxo é o mesmo: vá em Integrações, conecte com sua <B>API Key</B> (disponível no painel do Panda Video em Configurações → API), e os vídeos aparecem no editor. Se você usa o Panda como hospedagem principal, agora pode trazer toda sua biblioteca para dentro da Hubfy com poucos cliques.
          </>,
          <>
            Com essas duas adições, a Hubfy agora suporta <B>6 fontes de vídeo</B>: Wistia, Panda Video, Vimeo, YouTube, Smart Player e a biblioteca interna. Você escolhe o provedor que já usa e a Hubfy cuida do resto. Se no futuro você trocar de provedor, basta conectar o novo e selecionar os vídeos novamente — <B>aulas existentes continuam funcionando</B> normalmente.
          </>,
        ],
        tags: ["feature"],
        images: [
          { src: "/changelog/wistia-integration.webp", alt: "Wistia — plataforma de video marketing agora integrada à Hubfy" },
          { src: "/changelog/pandavideo-integration.webp", alt: "Panda Video — hospedagem de vídeos com IA agora integrada à Hubfy" },
        ],
      },
      {
        title: "Portal de downloads integrado",
        paragraphs: [
          <>
            A página de downloads agora segue o <B>mesmo layout do portal</B>: header com seu workspace, tema claro/escuro, idioma e menu do usuário. Tudo com a identidade da sua marca, nada de layouts diferentes.
          </>,
          <>
            Também corrigimos o botão de download. Antes abria o arquivo no navegador; agora o download é direto para a pasta de downloads do computador. Funciona como deveria ser desde o começo.
          </>,
        ],
        tags: ["improvement"],
        image: "/changelog/portal-downloads-preview.svg",
        imageAlt: "Portal do aluno com página de downloads integrada ao layout principal",
      },
    ],
  },
  {
    date: "7 de abril de 2026",
    entries: [
      {
        title: "Central de documentação da Hubfy",
        paragraphs: [
          <>
            A Hubfy agora tem sua própria <B>central de documentação</B> em docs.hubfy.io. Tudo o que você precisa saber sobre a plataforma está reunido em um só lugar: como configurar seu workspace, publicar cursos, conectar meios de pagamento, gerenciar clientes e muito mais. A navegação é organizada por seções — começando pelo quickstart, passando por workspace, conteúdo, vendas e clientes — para que você encontre qualquer informação em segundos, sem precisar abrir ticket de suporte.
          </>,
          <>
            A documentação foi construída com o mesmo visual da plataforma: <B>sidebar com menu por categorias</B>, cards de navegação rápida, checklists passo a passo e tabelas comparativas de planos. Cada artigo tem um sumário lateral que permite pular direto para a seção que interessa. Já estão disponíveis guias sobre introdução, quickstart, planos e preços, workspace, cursos, downloads e mais — e <B>novos artigos são publicados toda semana</B>.
          </>,
        ],
        tags: ["feature"],
        image: "/changelog/docs-site-preview.svg",
        imageAlt: "Central de documentação da Hubfy com sidebar de navegação, cards de quickstart e seções de conteúdo",
      },
      {
        title: "Criar cursos ficou mais rápido e visual",
        paragraphs: [
          <>
            A página de criação de curso ganhou uma <B>reformulação completa na seção de estrutura</B>. Agora, ao montar seu curso do zero, você já visualiza módulos e aulas exatamente como eles aparecem no editor — com thumbnails, ícones de play e a mesma hierarquia visual que você usa depois para gerenciar o conteúdo. Isso significa que desde o primeiro momento você tem <B>clareza total</B> de como seu curso vai ficar organizado, sem surpresas na hora de editar.
          </>,
          <>
            Para quem está começando, adicionamos um <B>banner de dica</B> logo acima da estrutura que explica como usar módulos para organizar seu conteúdo — pense neles como capítulos de um livro. Renomear módulos ficou mais intuitivo: basta clicar no nome para editar direto na linha, confirmar com Enter e seguir em frente. O botão de adicionar módulo agora está mais visível, e cada aula dentro do módulo mostra uma <B>miniatura com mais espaço e respiro</B>, facilitando a leitura quando você tem muitas aulas.
          </>,
          <>
            No editor de aulas, duas novidades que vão facilitar o dia a dia: um <B>campo de ID com botão de copiar</B> na aba Geral (útil para integrações e suporte) e um <B>botão "Ver preview"</B> que abre a aula do jeito que seu aluno vai ver, direto em uma nova aba. Além disso, as abas do navegador agora exibem o nome do curso ou da aula que você está editando — chega de se perder entre várias abas abertas.
          </>,
        ],
        tags: ["improvement"],
        image: "/changelog/course-creation-ux-preview.svg",
        imageAlt: "Página de criação de curso com estrutura visual de módulos e aulas, banner de dica e thumbnails",
      },
    ],
  },
  {
    date: "4 de abril de 2026",
    entries: [
      {
        title: "Sincronização automática de produtos com Hotmart e Kiwify",
        paragraphs: [
          <>
            Agora você pode <B>importar seus produtos diretamente da Hotmart ou Kiwify</B> para dentro da Hubfy com poucos cliques. Acesse a página da integração, clique em "Buscar produtos", selecione os que deseja importar e pronto — seus produtos aparecem na Hubfy como rascunho, prontos para serem configurados com cursos, aulas e conteúdos. Chega de cadastrar produto por produto manualmente: se você tem 5, 10 ou 50 produtos na sua plataforma de vendas, todos podem ser trazidos de uma vez.
          </>,
          <>
            O fluxo foi pensado para te dar <B>controle total sobre o que entra</B>. Ao buscar, você vê uma tabela com todos os seus produtos da plataforma de vendas — nome, status, tipo (venda única ou assinatura) e garantia. Produtos ativos já vêm pré-selecionados, mas você marca e desmarca o que quiser. Produtos que já foram importados antes aparecem sinalizados para evitar duplicatas. Depois de importar, cada produto fica <B>automaticamente vinculado ao ID original</B> da plataforma de vendas — isso significa que quando um aluno compra pela Hotmart ou Kiwify, o acesso na Hubfy é liberado instantaneamente, sem nenhuma configuração extra.
          </>,
          <>
            Essa funcionalidade está disponível para <B>Hotmart e Kiwify</B>, as duas plataformas que possuem integração completa com a Hubfy. Para outras plataformas como Kirvano e Lastlink, o mapeamento manual continua disponível na aba de mapeamento. A sincronização transforma o que antes levava horas de configuração em um processo de <B>menos de um minuto</B> — conecte, busque, importe e comece a entregar conteúdo.
          </>,
        ],
        tags: ["feature"],
        image: "/changelog/gateway-sync-preview.svg",
        imageAlt: "Tela de sincronização de produtos mostrando tabela de seleção com produtos da Hotmart e produtos já importados",
      },
      {
        title: "Filtros avançados na página de pedidos",
        paragraphs: [
          <>
            A página de pedidos ganhou <B>filtros combináveis</B> que facilitam encontrar exatamente o que você procura. Agora é possível filtrar por status (aprovado, pendente, reembolsado...), por produto, por origem da venda (Hotmart, Kiwify, Hubfy...) e por período — tudo ao mesmo tempo. Selecione múltiplas opções em cada filtro e a tabela atualiza instantaneamente. Se você tem centenas de pedidos e precisa encontrar, por exemplo, todos os reembolsos da Hotmart na última semana, agora leva <B>dois cliques</B>.
          </>,
          <>
            O seletor de datas também ficou mais prático: escolha um <B>período com início e fim no calendário</B>, confira a seleção e confirme com o botão "OK". Precisa ver só um dia específico? Basta clicar uma única vez na data. Um botão de limpar aparece ao lado de cada filtro ativo, e o botão "Limpar filtros" reseta tudo de uma vez. Os filtros ficam salvos na URL — se você compartilhar o link ou recarregar a página, a <B>mesma visão é preservada</B>.
          </>,
        ],
        tags: ["improvement"],
        image: "/changelog/orders-filters-preview.svg",
        imageAlt: "Página de pedidos com filtros multi-select por status, produto, origem e período",
      },
    ],
  },
  {
    date: "1 de abril de 2026",
    entries: [
      {
        title: "Importação inteligente de clientes via CSV",
        paragraphs: [
          <>
            Chegou a funcionalidade mais pedida por quem está migrando de outra plataforma: <B>importação de clientes via CSV</B>. Acesse a tela de clientes, clique em "Importar CSV", faça upload do arquivo e pronto — até <B>1.000 clientes por importação</B>, com nome, email, telefone e mais.
          </>,
          <>
            O grande diferencial é poder <B>vincular produtos direto no CSV</B>. Basta incluir uma coluna <code className="rounded bg-muted px-1.5 py-0.5 text-xs">products</code> com os IDs dos produtos, e o sistema concede o acesso automaticamente para cada cliente. Quando um produto é vinculado, uma <B>nova order é criada sem valor</B> — assim suas métricas de faturamento não são afetadas, mas seus relatórios e controle de acessos ficam sempre atualizados. Clientes importados sem produto simplesmente não geram pedido.
          </>,
          <>
            Pode importar sem medo de duplicar: se um email já existe na base, o sistema <B>reconhece e mescla os dados</B> — campos vazios são preenchidos pelo CSV, mas nada que já estava cadastrado é sobrescrito. Subiu a mesma lista duas vezes? Sem problema, nenhum dado é duplicado.
          </>,
          <>
            Acompanhe tudo em tempo real pela <B>barra de progresso</B>, e ao final receba um relatório completo: quantos clientes foram criados, quantos já existiam, quantos acessos foram concedidos e se alguma linha teve problema. Ideal para migrar sua base inteira para a Hubfy em minutos.
          </>,
        ],
        tags: ["feature"],
        image: "/changelog/csv-import-preview.png",
        imageAlt: "Tela de importação de clientes via CSV com validação, resumo e tabela de problemas",
      },
      {
        title: "Novo seletor de avatar: upload ou ícone, tudo num lugar só",
        paragraphs: [
          <>
            A seção de ícone na aba Geral foi renomeada para <B>Avatar</B> e ganhou um layout mais intuitivo. Agora você tem dois botões lado a lado: <B>"Upload logo"</B> para enviar sua imagem, ou <B>"Escolha um ícone"</B> para selecionar da galeria de ícones — o mesmo fluxo que já existia na criação de workspace.
          </>,
          <>
            O seletor de ícones abre em um <B>modal com mais de 80 opções</B>. Você seleciona, visualiza e confirma. A paleta de cores do avatar também ficou igual à do onboarding, garantindo <B>consistência visual</B> em toda a plataforma.
          </>,
        ],
        tags: ["improvement"],
        image: PLACEHOLDER,
        imageAlt: "Seletor de avatar com botões Upload logo e Escolha um ícone",
      },
      {
        title: "Imagem de fundo da página de login via Unsplash",
        paragraphs: [
          <>
            Na aba "Página de login", a galeria de imagens pré-definidas foi substituída por duas opções mais flexíveis: <B>upload do dispositivo</B> ou <B>busca no Unsplash</B>. Agora você pode encontrar a foto perfeita para o fundo da sua tela de login entre milhões de imagens profissionais.
          </>,
          <>
            A imagem padrão para novos workspaces também foi atualizada — todos os portais agora iniciam com uma <B>foto clean de escritório</B> que transmite profissionalismo desde o primeiro acesso. Workspaces existentes foram atualizados automaticamente.
          </>,
        ],
        tags: ["feature", "improvement"],
        image: PLACEHOLDER,
        imageAlt: "Seletor de imagem de fundo com opção Unsplash",
      },
    ],
  },
  {
    date: "31 de março de 2026",
    entries: [
      {
        title: "Download de arquivos com nome original e status em tempo real",
        paragraphs: [
          <>
            Quando seus alunos baixam materiais complementares de uma aula — PDFs, planilhas, apresentações — o arquivo agora chega com o <B>nome original que você definiu</B>. Nada de códigos estranhos ou nomes genéricos: se você subiu "Guia-Completo-Modulo-3.pdf", é exatamente isso que o aluno recebe na pasta de downloads.
          </>,
          <>
            Além disso, a aba de arquivos da aula agora mostra o <B>status de cada material em tempo real</B>. Se um arquivo ainda está sendo processado, o aluno vê um indicador de carregamento claro ao invés de um botão de download que não funcionaria. Se houve algum problema no processamento, uma <B>mensagem amigável</B> aparece no lugar. Tudo para evitar cliques frustrados e dúvidas no suporte.
          </>,
          <>
            Essa melhoria torna a experiência de consumir seus conteúdos muito mais <B>profissional e transparente</B> — seus alunos sempre sabem exatamente o que esperar.
          </>,
        ],
        tags: ["improvement"],
        image: PLACEHOLDER,
        imageAlt: "Aba de arquivos da aula com botão de download e status em tempo real",
      },
      {
        title: "Thumbnails de aulas perfeitas em qualquer tela",
        paragraphs: [
          <>
            As miniaturas das aulas na barra lateral do curso agora se adaptam perfeitamente a <B>qualquer tamanho de tela</B>. No celular, as capas das aulas apareciam cortadas ou distorcidas — especialmente quando a imagem tinha proporções diferentes do espaço disponível.
          </>,
          <>
            Agora utilizamos um <B>redimensionamento inteligente</B> que preserva a imagem inteira dentro do espaço da miniatura, sem cortar nada. O sistema de otimização de imagens também foi atualizado para entregar versões mais leves e nítidas, garantindo <B>carregamento rápido</B> mesmo em conexões móveis.
          </>,
          <>
            O resultado é uma navegação entre aulas mais bonita e consistente, independente do dispositivo que seu aluno esteja usando.
          </>,
        ],
        tags: ["fix", "improvement"],
        image: PLACEHOLDER,
        imageAlt: "Barra lateral do curso com thumbnails adaptadas em diferentes tamanhos de tela",
      },
      {
        title: "Links úteis nas aulas: exibição mais inteligente",
        paragraphs: [
          <>
            A exibição dos links úteis nas aulas ficou mais limpa e intuitiva. Agora o sistema identifica automaticamente quando o nome do link e a URL visível são iguais e <B>evita repetições desnecessárias</B>. Por exemplo, se o nome do link já é "hubfy.io", não faz sentido mostrar "hubfy.io" novamente como subtítulo.
          </>,
          <>
            A <B>hierarquia visual</B> também foi refinada: o nome personalizado aparece em destaque, a URL amigável fica como referência secundária, e o clique sempre leva para o destino correto. Com hover suave e ícone de link externo, a experiência é limpa e profissional.
          </>,
          <>
            Tudo pensado para que seus alunos encontrem os recursos complementares da aula <B>sem confusão</B> — cada link tem seu propósito claro à primeira vista.
          </>,
        ],
        tags: ["improvement"],
        image: PLACEHOLDER,
        imageAlt: "Aba de links úteis da aula com nome, URL amigável e ícone de link externo",
      },
      {
        title: "Links úteis nas aulas",
        paragraphs: [
          <>
            Seus alunos agora podem encontrar <B>links externos importantes</B> diretamente dentro de cada aula. Você pode adicionar até 10 links por aula, cada um com três campos: um nome descritivo, a URL real de destino e uma URL visível amigável.
          </>,
          <>
            Imagine poder incluir na sua aula um link para um template de planilha, a documentação de uma ferramenta ou o grupo exclusivo de alunos — tudo organizado em um <B>layout limpo e intuitivo</B>. O aluno vê o nome do recurso em destaque e, ao clicar, é levado direto para o destino correto.
          </>,
          <>
            Adicionar e gerenciar links é simples: basta acessar a aba "Links úteis" no editor de aulas. Você controla a ordem, edita a qualquer momento e pode remover com um clique. Mais uma forma de <B>entregar valor real</B> dentro da experiência de aprendizado.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Editor de links úteis no painel de edição de aula",
      },
      {
        title: "Suporte ao Smart Player",
        paragraphs: [
          <>
            A Hubfy agora suporta o <B>Smart Player</B> como provedor de vídeo, além do Gumlet. Se você já usa o Smart Player para hospedar seus conteúdos em vídeo, agora pode conectá-lo diretamente ao seu workspace sem precisar migrar nada.
          </>,
          <>
            A configuração é rápida: basta colar a <B>URL do embed ou o hash do vídeo</B> no editor de aulas. O sistema reconhece automaticamente o formato e gera o player embutido na página da aula. Seus alunos assistem tudo dentro da própria plataforma, sem redirecionamentos.
          </>,
          <>
            Com dois provedores de vídeo disponíveis, você tem mais <B>flexibilidade para escolher</B> a solução que melhor se adapta ao seu negócio — seja por preço, performance ou preferência pessoal.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Configuração do Smart Player no editor de aulas",
      },
{
        title: "Upload de logo nas configurações",
        paragraphs: [
          <>
            Antes, a logo do workspace só podia ser definida durante o onboarding. Agora você pode <B>trocar ou remover a logo a qualquer momento</B> direto na aba "Geral" das configurações do workspace.
          </>,
          <>
            O upload funciona com <B>preview instantâneo</B> — você vê como a logo vai ficar antes de salvar. Se quiser remover, basta clicar no botão de excluir e o workspace volta para o ícone padrão. Simples e sem complicação.
          </>,
        ],
        tags: ["fix"],
      },
    ],
  },
  {
    date: "30 de março de 2026",
    entries: [
      {
        title: "Onboarding completo em 5 etapas",
        paragraphs: [
          <>
            O primeiro acesso à plataforma agora guia você por um <B>fluxo de 5 etapas</B> pensado para configurar tudo de uma vez. Primeiro você completa seu perfil — foto, nome, WhatsApp e Instagram. Depois cria seu workspace com nome, slug personalizado e identidade visual.
          </>,
          <>
            Nas etapas seguintes, você escolhe sua <B>plataforma de vendas</B> (como Hotmart), seleciona tags que descrevem seu nicho — infoprodutor, coach, mentor, escola online, entre outros — e pode <B>convidar sua equipe</B> direto no onboarding.
          </>,
          <>
            Se você ainda não preencheu o perfil, a plataforma redireciona automaticamente para o onboarding antes de acessar o painel. Sem campos espalhados em páginas diferentes — tudo reunido em um <B>fluxo único e organizado</B>.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Fluxo de onboarding em 5 etapas: perfil, workspace, gateway, nicho e convite",
      },
    ],
  },
  {
    date: "27 de março de 2026",
    entries: [
      {
        title: "Login e cadastro com Google",
        paragraphs: [
          <>
            Agora você pode entrar na Hubfy com <B>um clique usando sua conta Google</B>. O botão "Continue com Google" aparece nas telas de login e cadastro — sem precisar criar senha ou lembrar mais uma credencial.
          </>,
          <>
            Se você já tem conta na Hubfy com o mesmo email do Google, o sistema <B>conecta automaticamente</B>. Se for um novo usuário, a conta é criada na hora. Simples, rápido e seguro — usando a mesma autenticação do Gmail.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Tela de login com botão Continue com Google",
      },
      {
        title: "Emails da plataforma em 3 idiomas",
        paragraphs: [
          <>
            Todos os emails enviados pela Hubfy — confirmação de cadastro, reset de senha, magic link e convites — agora são enviados no <B>idioma do usuário</B>. Suportamos português, inglês e espanhol.
          </>,
          <>
            O idioma é detectado automaticamente pela <B>preferência salva no perfil</B>. Se o usuário nunca configurou, o sistema usa português como padrão. Os emails são enviados via Resend, com rastreamento de entrega e log de cada envio.
          </>,
        ],
        tags: ["feature", "improvement"],
        image: PLACEHOLDER,
        imageAlt: "Email de confirmação em português, inglês e espanhol",
      },
      {
        title: "Termos de Serviço e Política de Privacidade",
        paragraphs: [
          <>
            A Hubfy agora tem páginas públicas de <B>Termos de Serviço</B> e <B>Política de Privacidade</B>, acessíveis em /terms e /privacy. Todo novo usuário vê um texto de consentimento no cadastro com links para ambos os documentos.
          </>,
          <>
            O consentimento aparece traduzido em português, inglês e espanhol, conforme o idioma selecionado. Mais um passo para garantir <B>conformidade legal</B> e transparência com seus usuários.
          </>,
        ],
        tags: ["feature", "security"],
        image: PLACEHOLDER,
        imageAlt: "Página de Termos de Serviço da Hubfy",
      },
      {
        title: "Upload com progresso em tempo real",
        paragraphs: [
          <>
            O sistema de upload foi completamente refeito. Agora, ao enviar qualquer arquivo — vídeo, PDF, imagem — uma <B>notificação flutuante</B> mostra o progresso em tempo real no canto da tela. Você pode navegar entre páginas do painel sem perder o acompanhamento.
          </>,
          <>
            Se tentar fechar o navegador com um upload em andamento, a plataforma exibe um <B>aviso de confirmação</B> para evitar que você perca o envio acidentalmente. Tudo funciona de forma global, independente de qual tela você esteja.
          </>,
        ],
        tags: ["feature", "improvement"],
        image: PLACEHOLDER,
        imageAlt: "Toast de progresso de upload com barra de carregamento",
      },
    ],
  },
  {
    date: "24 de março de 2026",
    entries: [
      {
        title: "Busca global com Cmd+K",
        paragraphs: [
          <>
            Pressione <B>Cmd+K</B> (ou Ctrl+K no Windows) em qualquer tela do painel e uma barra de busca aparece no centro da tela. Você pode encontrar cursos, aulas, produtos, clientes, pedidos e arquivos — tudo em um só lugar.
          </>,
          <>
            A busca é <B>instantânea e inteligente</B>: usa matching por similaridade, destaca o termo buscado nos resultados, e mostra até 5 itens por categoria. Funciona com nome, email, número do pedido ou ID do produto. Suas últimas 5 buscas ficam salvas para acesso rápido.
          </>,
          <>
            Ao selecionar um resultado, você é levado direto para a <B>página de detalhe</B> — seja o perfil do cliente, os dados do pedido ou o editor da aula. Navegar pelo painel nunca foi tão rápido.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Barra de busca global com resultados de cursos, clientes e pedidos",
      },
      {
        title: "Páginas de detalhe para clientes, pedidos e arquivos",
        paragraphs: [
          <>
            Clientes, pedidos e arquivos agora têm <B>páginas dedicadas</B> no painel admin. Ao clicar em um cliente, você vê o perfil completo com nome, telefone, endereço, documento e status de email marketing — tudo editável.
          </>,
          <>
            A página de pedido exibe os dados da transação, status e informações do gateway. E a página de arquivo mostra preview, metadados e status de processamento. Tudo acessível pela <B>busca global</B> ou clicando direto nas tabelas.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Página de detalhe de um cliente com perfil editável",
      },
    ],
  },
  {
    date: "23 de março de 2026",
    entries: [
      {
        title: "Plataforma em 3 idiomas: português, inglês e espanhol",
        paragraphs: [
          <>
            Toda a interface da Hubfy agora está disponível em <B>português, inglês e espanhol</B>. São mais de 2.300 textos traduzidos — desde o painel admin até o checkout, passando por mensagens de erro, toasts e modais.
          </>,
          <>
            Você troca o idioma nas <B>configurações do perfil</B>, na aba "Preferências". A mudança é instantânea e fica salva tanto no navegador quanto no seu perfil. Os emails da plataforma também seguem o idioma escolhido.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Seletor de idioma com bandeiras do Brasil, EUA e Espanha",
      },
    ],
  },
  {
    date: "20 de março de 2026",
    entries: [
      {
        title: "Reordenação de produtos com arrastar e soltar",
        paragraphs: [
          <>
            Agora você controla a <B>ordem dos produtos no portal</B> do seu espaço. Na lista de produtos, um botão alterna entre o modo tabela e o modo de reordenação visual — que replica exatamente como os produtos aparecem para seus alunos.
          </>,
          <>
            Basta <B>arrastar e soltar</B> os cards na posição desejada. A ordem é salva automaticamente e refletida imediatamente no portal público. Perfeito para destacar lançamentos ou organizar por prioridade.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Modo de reordenação de produtos com drag-and-drop",
      },
      {
        title: "Integração Vimeo e seletor de vídeo nas aulas",
        paragraphs: [
          <>
            Conecte sua conta do <B>Vimeo</B> direto no painel e selecione vídeos para suas aulas sem sair da plataforma. O editor de aulas agora tem um seletor que lista seus vídeos do Vimeo com thumbnails e duração.
          </>,
          <>
            Além do Vimeo, o seletor também mostra vídeos da <B>biblioteca interna</B> (enviados via Gumlet). Você escolhe a fonte, seleciona o vídeo, e ele é vinculado à aula automaticamente. Tudo em poucos cliques.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Seletor de vídeo com opções Vimeo e Biblioteca",
      },
      {
        title: "Webhook Hotmart individual por workspace",
        paragraphs: [
          <>
            Cada workspace agora tem sua <B>URL de webhook exclusiva</B> para receber notificações da Hotmart. Antes, workspaces que usavam o mesmo hottok entravam em conflito — agora cada um tem seu endpoint próprio.
          </>,
          <>
            A URL é calculada automaticamente e exibida na página de configuração do gateway. Os logs de webhook também ficaram mais detalhados, mostrando <B>qual workspace</B> recebeu cada notificação e o motivo de eventuais erros.
          </>,
        ],
        tags: ["fix", "improvement"],
        image: PLACEHOLDER,
        imageAlt: "Configuração de webhook Hotmart com URL única por workspace",
      },
    ],
  },
  {
    date: "13 de março de 2026",
    entries: [
      {
        title: "Portal do aluno mais responsivo",
        paragraphs: [
          <>
            O portal onde seus alunos acessam os cursos ficou mais bonito e funcional em <B>qualquer dispositivo</B>. As capas dos cursos agora usam proporção 3:1 consistente, o hero da vitrine se adapta ao celular, e o footer fica sempre colado na parte de baixo da página.
          </>,
          <>
            Os cards de produto ganharam <B>efeito de zoom no hover</B> (ao invés de deslocamento), e produtos arquivados não aparecem mais no portal. A saudação e descrição agora seguem o idioma do usuário.
          </>,
        ],
        tags: ["improvement"],
        image: PLACEHOLDER,
        imageAlt: "Portal do aluno responsivo com cards de produto",
      },
    ],
  },
  {
    date: "12 de março de 2026",
    entries: [
      {
        title: "Recorte inteligente de capas",
        paragraphs: [
          <>
            Ao enviar uma imagem de capa para um curso ou produto, agora aparece um <B>editor de recorte</B> onde você ajusta exatamente qual parte da imagem será usada. Para cursos, o recorte é horizontal (formato banner 3:1). Para produtos, quadrado (1:1).
          </>,
          <>
            Basta arrastar e redimensionar a área de seleção sobre a imagem. O resultado aparece como <B>preview instantâneo</B> antes de confirmar. Assim você garante que a capa fica perfeita em todas as telas — sem cortes inesperados ou rostos cortados.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Editor de recorte de capa com área de seleção ajustável",
      },
      {
        title: "Checkout com preenchimento automático",
        paragraphs: [
          <>
            Ao criar um checkout e selecionar um produto, o formulário agora <B>preenche automaticamente</B> a imagem de capa, título e descrição do produto. Você pode personalizar qualquer campo depois, mas o trabalho manual já fica quase todo feito.
          </>,
          <>
            O seletor de produtos também ficou mais visual: cada item mostra a <B>miniatura da capa</B> ao lado do nome. E a imagem do checkout tem o mesmo editor de recorte e busca no Unsplash disponível para produtos e cursos.
          </>,
        ],
        tags: ["feature", "improvement"],
        image: PLACEHOLDER,
        imageAlt: "Formulário de checkout com campos preenchidos automaticamente a partir do produto",
      },
    ],
  },
  {
    date: "10 de março de 2026",
    entries: [
      {
        title: "Busca de imagens no Unsplash",
        paragraphs: [
          <>
            Precisa de uma capa bonita para seu curso, produto ou aula? Agora você pode buscar fotos profissionais direto no <B>Unsplash</B> sem sair da plataforma. Basta clicar em "Buscar no Unsplash" no editor de capa.
          </>,
          <>
            A busca aceita palavras-chave em qualquer idioma e permite filtrar por orientação — paisagem, retrato ou quadrado. Ao selecionar uma foto, ela é <B>baixada e adicionada automaticamente</B> à sua biblioteca de arquivos. Créditos do fotógrafo são incluídos conforme as regras do Unsplash.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Dialog de busca no Unsplash com filtro de orientação e resultados",
      },
      {
        title: "Exclusão de produtos com confirmação",
        paragraphs: [
          <>
            Produtos agora podem ser <B>excluídos permanentemente</B> pelo menu de ações na lista de produtos. Para evitar exclusões acidentais, o sistema pede que você digite a palavra "Excluir" antes de confirmar.
          </>,
          <>
            Esse mecanismo de <B>confirmação por digitação</B> protege contra cliques errados — especialmente útil quando você tem muitos produtos na lista e está fazendo limpeza.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Dialog de confirmação de exclusão de produto com campo de digitação",
      },
      {
        title: "Suporte a vídeos do YouTube nas aulas",
        paragraphs: [
          <>
            Além dos vídeos enviados pela biblioteca interna (Gumlet) e pelo Vimeo, agora você pode adicionar <B>vídeos do YouTube</B> diretamente nas aulas. Basta colar a URL do vídeo no editor e o player é embutido automaticamente.
          </>,
          <>
            O YouTube se junta ao Gumlet, Vimeo e Smart Player como mais uma opção de provedor de vídeo. Ideal para quem já tem conteúdo publicado no YouTube e quer <B>reaproveitar sem migrar</B>.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Editor de aula com opção de vídeo do YouTube",
      },
      {
        title: "Portal do cliente com login próprio",
        paragraphs: [
          <>
            Seus clientes agora têm uma <B>página de login dedicada</B> para acessar o portal de cursos. A tela inclui seletor de idioma, mensagens claras e visual alinhado com a identidade da sua marca.
          </>,
          <>
            O fluxo de convite de equipe nas configurações também foi aprimorado, e os botões e tabelas do painel ganharam <B>melhor consistência visual</B> no tema claro.
          </>,
        ],
        tags: ["feature", "improvement"],
        image: PLACEHOLDER,
        imageAlt: "Página de login do portal do cliente com seletor de idioma",
      },
    ],
  },
  {
    date: "7 de março de 2026",
    entries: [
      {
        title: "Dashboard de vendas com KPIs em tempo real",
        paragraphs: [
          <>
            O painel principal agora exibe <B>quatro cards de métricas</B> no topo da página: receita total, número de pedidos, clientes ativos e taxa de conversão. Cada card mostra o valor atual e um indicador de tendência comparando com o período anterior — assim você sabe na hora se as vendas estão subindo ou caindo.
          </>,
          <>
            Os dados são calculados automaticamente com base nos pedidos do seu workspace. Não precisa exportar planilha nem acessar o gateway de pagamento: basta abrir o painel e as <B>métricas mais importantes do seu negócio</B> estão ali, atualizadas e organizadas.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Dashboard com cards de receita, pedidos, clientes e conversão",
      },
      {
        title: "Gráfico de receita por dia",
        paragraphs: [
          <>
            Logo abaixo dos KPIs, um <B>gráfico de área</B> mostra a evolução do seu faturamento diário. Cada ponto representa o total de receita daquele dia, e a área preenchida facilita a leitura visual da tendência — você identifica picos de venda, dias fracos e sazonalidades de um relance.
          </>,
          <>
            O gráfico é interativo: ao passar o mouse sobre qualquer ponto, um tooltip mostra o <B>valor exato e a data</B>. Ideal pra acompanhar o impacto de lançamentos, promoções ou campanhas de tráfego sem precisar sair do painel.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Gráfico de área mostrando receita diária no dashboard",
      },
      {
        title: "Breakdown por método de pagamento",
        paragraphs: [
          <>
            Um <B>gráfico de pizza</B> no dashboard mostra a distribuição dos seus recebimentos por método de pagamento — Pix, cartão de crédito, boleto e outros. Cada fatia exibe a porcentagem e o valor total, facilitando entender como seus clientes preferem pagar.
          </>,
          <>
            Essa informação é valiosa pra decidir, por exemplo, se vale oferecer desconto no Pix ou se o parcelamento no cartão está puxando mais vendas. <B>Dados que antes exigiam relatórios manuais</B> agora estão visíveis direto no painel, sem configuração.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Gráfico de pizza com distribuição de pagamentos por método",
      },
    ],
  },
  {
    date: "3 de março de 2026",
    entries: [
      {
        title: "Ranking de produtos mais vendidos",
        paragraphs: [
          <>
            No dashboard, uma seção dedicada lista os <B>produtos com melhor performance</B> ordenados por receita gerada. Cada item mostra o nome do produto, quantidade de vendas e o valor total faturado — tudo atualizado automaticamente com base nos pedidos do workspace.
          </>,
          <>
            Saber qual produto está vendendo mais ajuda a tomar decisões rápidas: investir mais tráfego no campeão de vendas, ajustar a oferta dos que estão parados ou criar <B>bundles com os mais populares</B>. A informação está sempre ali, sem precisar montar relatório.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Lista de top produtos por receita no dashboard",
      },
      {
        title: "Feed de vendas recentes",
        paragraphs: [
          <>
            Uma lista em tempo real das <B>últimas transações</B> aparece no dashboard, mostrando o nome do cliente, o produto comprado, o valor e o status do pedido. Cada nova venda aparece automaticamente no topo da lista — é como um feed que você acompanha ao longo do dia.
          </>,
          <>
            Clicar em qualquer venda leva direto para a <B>página de detalhe do pedido</B>. Pra quem faz lançamentos ou roda campanhas de tráfego, esse feed é essencial pra sentir o pulso das vendas sem ficar alternando entre abas e plataformas.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Feed de vendas recentes com nome do cliente, produto e valor",
      },
      {
        title: "Vitrines de cursos",
        paragraphs: [
          <>
            Crie <B>coleções organizadas de cursos</B> e publique como landing pages. Cada vitrine tem nome, descrição, imagem de capa e uma lista de cursos que você escolhe. Você pode criar vitrines temáticas — "Trilha Iniciante", "Pack Premium", "Lançamento 2026" — e compartilhar o link direto nas redes sociais.
          </>,
          <>
            As vitrines podem ser <B>públicas ou restritas a membros</B>. Vitrines públicas funcionam como páginas de vendas onde qualquer pessoa vê os cursos disponíveis. Vitrines de membros mostram apenas para quem já tem acesso — perfeito pra organizar a experiência dentro do portal.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Página de vitrines com coleções de cursos e opção público/membros",
      },
    ],
  },
  {
    date: "27 de fevereiro de 2026",
    entries: [
      {
        title: "Portal do aluno personalizável",
        paragraphs: [
          <>
            A área onde seus alunos acessam os cursos agora pode ser <B>customizada com as cores da sua marca</B>. Na aba "Portal" da página de Design, você define a cor dos botões, o estilo dos cards de produto e o template da galeria — tudo refletido instantaneamente no preview.
          </>,
          <>
            O portal deixa de ter cara de "plataforma genérica" e passa a parecer <B>uma extensão da sua marca</B>. Seus alunos acessam um ambiente visual coeso, do login à galeria de cursos, sem perceber que estão numa plataforma de terceiros.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Aba Portal na página de Design com preview da galeria de produtos",
      },
      {
        title: "Histórico de pedidos no portal do aluno",
        paragraphs: [
          <>
            Seus alunos agora têm uma <B>página de pedidos dentro do portal</B> onde consultam todas as compras realizadas. Cada pedido mostra o produto adquirido, a data, o valor pago e o status atual — aprovado, pendente ou reembolsado.
          </>,
          <>
            Isso reduz drasticamente o volume de mensagens no suporte do tipo "meu pagamento foi aprovado?" ou "quanto eu paguei?". O aluno <B>resolve sozinho</B>, a qualquer hora, sem depender de você. Menos suporte operacional, mais tempo pra criar conteúdo.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Página de pedidos no portal do aluno com status e detalhes",
      },
      {
        title: "Convite de equipe por email",
        paragraphs: [
          <>
            Agora você pode adicionar colaboradores ao seu workspace <B>enviando um convite por email</B> direto pela aba "Equipe" nas configurações. Basta digitar o email, escolher o papel — <B>dono</B> (acesso total) ou <B>editor</B> (cria e edita conteúdo, sem gerenciar equipe) — e enviar.
          </>,
          <>
            O convidado recebe um email com link de acesso e, ao clicar, já entra no workspace com as permissões corretas. Se a pessoa ainda não tem conta na Hubfy, o cadastro é feito automaticamente. Ideal pra quem tem <B>equipe de suporte, editores de vídeo ou gestores</B> que precisam acessar o painel sem compartilhar senha.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Aba de equipe nas configurações com campo de convite por email",
      },
    ],
  },
  {
    date: "23 de fevereiro de 2026",
    entries: [
      {
        title: "Suporte configurável no workspace",
        paragraphs: [
          <>
            Nas configurações do workspace, você agora define o <B>email e o WhatsApp de suporte</B> que seus alunos veem quando precisam de ajuda. Esses dados aparecem automaticamente no portal do aluno e nos emails transacionais — sem precisar editar templates ou mexer em código.
          </>,
          <>
            Se um aluno tem dúvida sobre o acesso ou sobre um pedido, ele encontra seu contato <B>direto dentro da plataforma</B>. Isso diminui a fricção e evita que o aluno fique perdido procurando como falar com você. Simples de configurar, grande impacto na experiência.
          </>,
        ],
        tags: ["improvement"],
      },
      {
        title: "Links sociais nas configurações",
        paragraphs: [
          <>
            Na aba de configurações do workspace, você agora pode adicionar links para <B>Instagram, YouTube, TikTok, LinkedIn, Facebook, Twitter</B> e outras redes sociais. Esses links aparecem automaticamente no footer do portal do aluno, criando mais pontos de contato com sua audiência.
          </>,
          <>
            Seus alunos passam a encontrar seus perfis sociais <B>sem precisar sair do portal</B> pra pesquisar. É uma forma simples de fortalecer sua presença digital e direcionar tráfego entre plataformas — do portal pro Instagram, do YouTube pro curso.
          </>,
        ],
        tags: ["improvement"],
      },
    ],
  },
  {
    date: "19 de fevereiro de 2026",
    entries: [
      {
        title: "Integração nativa com a Hotmart",
        paragraphs: [
          <>
            Conecte sua conta da <B>Hotmart</B> diretamente pelo painel da Hubfy. Basta colar seu hottok na página de configurações do gateway e a integração está pronta — novos pedidos, reembolsos e chargebacks da Hotmart são processados automaticamente via webhook.
          </>,
          <>
            O sistema mapeia seus produtos da Hotmart aos produtos da Hubfy, liberando acesso ao aluno <B>no momento em que o pagamento é confirmado</B>. Sem intervenção manual, sem delay. Se um pedido é reembolsado ou sofre chargeback, o acesso é revogado automaticamente. Você vende pela Hotmart e entrega pela Hubfy — tudo sincronizado.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Configuração do gateway Hotmart com campo de hottok e mapeamento de produtos",
      },
      {
        title: "Player de vídeo integrado com a identidade do workspace",
        paragraphs: [
          <>
            Cada workspace agora tem um <B>player de vídeo próprio</B> que reflete a identidade visual da sua marca. Na aba "Player de vídeo" da página de Design, você define a cor da barra de progresso, a cor dos controles, o estilo do player (minimalista ou completo) e até uma marca d'água com o logo do workspace.
          </>,
          <>
            Seus alunos assistem às aulas num player que parece <B>feito sob medida pro seu negócio</B> — sem logos de terceiros, sem distrações. As configurações se aplicam a todos os vídeos do workspace de uma vez, e o preview mostra em tempo real como o player vai ficar antes de salvar.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Aba de personalização do player de vídeo com cores e controles",
      },
      {
        title: "Upload de vídeos direto pela plataforma",
        paragraphs: [
          <>
            Agora você envia vídeos <B>direto pelo painel da Hubfy</B>, sem precisar acessar plataformas externas. Na biblioteca de arquivos ou no editor de aulas, basta selecionar o vídeo do seu computador. O upload é feito via protocolo TUS (resumível) — se a internet cair no meio, o envio continua de onde parou.
          </>,
          <>
            Após o upload, o vídeo é <B>processado automaticamente</B>: transcodificado em múltiplas qualidades, thumbnail gerada, e status atualizado em tempo real. Quando o processamento termina, o vídeo já está pronto pra ser vinculado a qualquer aula. Tudo acontece nos bastidores — você só precisa arrastar o arquivo.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Upload de vídeo com barra de progresso e status de processamento",
      },
    ],
  },
  {
    date: "14 de fevereiro de 2026",
    entries: [
      {
        title: "Proteção de conteúdo por compra",
        paragraphs: [
          <>
            Todo o conteúdo dos seus cursos — vídeos, aulas, materiais — agora é <B>automaticamente protegido</B>. Apenas alunos que compraram o produto vinculado ao curso conseguem acessar as aulas. Se alguém tenta abrir uma aula sem ter comprado, vê uma mensagem clara de que precisa adquirir o acesso.
          </>,
          <>
            O controle é feito em múltiplas camadas: a rota no frontend verifica a matrícula, o backend valida o acesso antes de servir qualquer conteúdo, e os vídeos usam <B>URLs assinadas com expiração de 1 hora</B>. Compartilhar um link de vídeo não adianta — ele expira. Seu conteúdo fica seguro sem que você precise configurar nada.
          </>,
        ],
        tags: ["feature", "security"],
        image: PLACEHOLDER,
        imageAlt: "Tela de acesso bloqueado com mensagem de compra necessária",
      },
      {
        title: "Acompanhamento de progresso do aluno",
        paragraphs: [
          <>
            Seus alunos agora podem <B>marcar cada aula como concluída</B> e acompanhar visualmente o progresso dentro do curso. Na sidebar de navegação, aulas concluídas ganham um check verde, e uma barra de progresso no topo mostra a porcentagem geral de conclusão.
          </>,
          <>
            Isso transforma a experiência de consumir seu curso: o aluno sabe exatamente <B>onde parou e quanto falta</B>. Pra você, é uma ferramenta de engajamento — alunos que veem progresso tendem a continuar. O progresso é salvo automaticamente e sincronizado entre dispositivos.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Sidebar do curso com aulas marcadas como concluídas e barra de progresso",
      },
      {
        title: "Página pública do curso",
        paragraphs: [
          <>
            Cada curso agora tem uma <B>landing page pública</B> acessível por qualquer pessoa, mesmo sem login. A página mostra o título, descrição, imagem de capa, a lista completa de módulos e aulas, e um botão de call-to-action pra comprar ou acessar.
          </>,
          <>
            É a página que você compartilha nas redes sociais, no email marketing ou no WhatsApp. O aluno vê a <B>ementa completa antes de comprar</B> — quantos módulos, quantas aulas, a duração estimada. Se já comprou, o botão muda pra "Acessar curso" e leva direto pro conteúdo.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Landing page pública do curso com módulos, aulas e botão de compra",
      },
    ],
  },
  {
    date: "10 de fevereiro de 2026",
    entries: [
      {
        title: "Editor de conteúdo estilo Notion nas aulas",
        paragraphs: [
          <>
            O editor de aulas agora suporta <B>blocos de conteúdo</B> no estilo do Notion. Você adiciona textos formatados, imagens, trechos de código e listas — tudo com arrastar e soltar pra reorganizar. Cada bloco é independente e pode ser movido, editado ou removido sem afetar os outros.
          </>,
          <>
            Isso significa que suas aulas não precisam ser apenas vídeo. Você pode criar <B>aulas completas com texto rico</B>, combinar vídeo com explicações escritas, ou montar aulas 100% em texto pra conteúdos que não precisam de vídeo. A flexibilidade é total — e o resultado fica bonito e profissional.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Editor de blocos de conteúdo com texto, imagem e código na aula",
      },
      {
        title: "Estrutura do curso com arrastar e soltar",
        paragraphs: [
          <>
            Na página de estrutura do curso, você organiza <B>módulos e aulas com drag-and-drop</B>. Arraste um módulo pra cima ou pra baixo pra mudar a ordem, ou mova aulas entre módulos. A nova posição é salva automaticamente — sem botão de confirmar.
          </>,
          <>
            Reorganizar a ementa de um curso inteiro leva <B>segundos ao invés de minutos</B>. Se você precisa trocar a ordem de dois módulos, mover uma aula introdutória pro início, ou reestruturar o fluxo pedagógico — basta arrastar. O curso no portal do aluno reflete a nova ordem instantaneamente.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Página de estrutura do curso com módulos e aulas reordenáveis via drag-and-drop",
      },
      {
        title: "Biblioteca de arquivos com pastas",
        paragraphs: [
          <>
            Todos os seus uploads — vídeos, PDFs, imagens, planilhas — agora ficam organizados numa <B>biblioteca central com suporte a pastas</B>. Crie pastas por curso, por tipo de material ou como preferir. Cada arquivo mostra nome, tipo, tamanho e data de upload.
          </>,
          <>
            Chega de ter arquivos soltos sem saber onde está cada coisa. A biblioteca é o <B>centro de controle dos seus materiais</B>: encontre qualquer arquivo com a busca, veja o preview, baixe ou vincule a uma aula. Quando o catálogo cresce, a organização por pastas faz toda a diferença.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Biblioteca de arquivos com pastas, busca e lista de uploads",
      },
    ],
  },
  {
    date: "5 de fevereiro de 2026",
    entries: [
      {
        title: "Categorias de cursos",
        paragraphs: [
          <>
            Ao criar ou editar um curso, agora você pode atribuir uma <B>categoria</B> — como negócios, saúde, tecnologia, marketing, finanças, entre outras. A categoria aparece como tag no card do curso e facilita a organização quando seu catálogo começa a crescer.
          </>,
          <>
            Com categorias definidas, fica mais fácil <B>filtrar e encontrar cursos</B> no painel admin. Pra quem oferece dezenas de cursos sobre temas diferentes, é a diferença entre um catálogo bagunçado e uma operação organizada.
          </>,
        ],
        tags: ["improvement"],
      },
      {
        title: "Duplicar curso completo com um clique",
        paragraphs: [
          <>
            Precisa criar um curso parecido com outro que já existe? Agora basta clicar em <B>"Duplicar"</B> no menu do curso. O sistema clona o curso inteiro — título, descrição, todos os módulos e todas as aulas — em segundos. O novo curso é criado como rascunho pra você ajustar antes de publicar.
          </>,
          <>
            Isso economiza horas de trabalho pra quem cria <B>variações de cursos</B> (versão básica e premium, turmas diferentes, edições anuais) ou quer usar um curso existente como template. Clone, ajuste o que precisa, e publique. Sem começar do zero.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Menu do curso com opção de duplicar e curso clonado como rascunho",
      },
    ],
  },
  {
    date: "31 de janeiro de 2026",
    entries: [
      {
        title: "Múltiplos workspaces na mesma conta",
        paragraphs: [
          <>
            A partir de agora, você pode criar e gerenciar <B>quantos workspaces quiser</B> dentro de uma única conta Hubfy. Cada workspace é um espaço completamente independente — com seus próprios cursos, produtos, clientes, integrações, identidade visual e URL. É como ter várias plataformas separadas, mas acessíveis com um único login.
          </>,
          <>
            A troca entre workspaces é <B>instantânea</B>: um seletor no canto do painel mostra todos os seus espaços com o ícone de cada um. Um clique e você está no outro workspace, com todo o contexto carregado — cursos, pedidos, configurações, tudo muda. Sem precisar fazer logout, sem trocar de conta, sem abrir aba anônima.
          </>,
          <>
            Isso abre possibilidades reais: crie um workspace pra cada <B>marca, nicho ou projeto</B>. Um infoprodutor que vende cursos de marketing e também de culinária pode separar tudo — identidade visual, clientes, faturamento — sem misturar. Agências podem gerenciar os portais de vários clientes na mesma conta. E se você for convidado pro workspace de outra pessoa, ele aparece no mesmo seletor junto com os seus.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Seletor de workspaces com múltiplos espaços e ícones personalizados",
      },
      {
        title: "Slug personalizado do workspace",
        paragraphs: [
          <>
            Ao criar um workspace, você escolhe um <B>slug único</B> que vira a URL do portal dos seus alunos — por exemplo, <B>hubfy.io/sua-marca</B>. O slug pode ser editado depois nas configurações, e o sistema valida em tempo real se o nome escolhido já está em uso.
          </>,
          <>
            Essa URL é o que seus alunos digitam pra acessar o portal, então escolher um slug <B>curto, limpo e memorável</B> faz diferença. Nada de códigos ou números aleatórios — o endereço do seu portal tem a cara do seu negócio desde o primeiro dia.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Campo de slug no formulário de criação de workspace com validação em tempo real",
      },
    ],
  },
  {
    date: "26 de janeiro de 2026",
    entries: [
      {
        title: "Tema claro e escuro em toda a plataforma",
        paragraphs: [
          <>
            A Hubfy funciona em <B>modo claro e modo escuro</B>, e você escolhe o que preferir nas configurações do perfil. A troca é instantânea e afeta todo o painel admin — menus, tabelas, gráficos, modais, tudo se adapta. A preferência fica salva no seu perfil e no navegador.
          </>,
          <>
            Quem trabalha à noite ou prefere interfaces escuras ganha <B>conforto visual</B> sem sacrificar legibilidade. Quem prefere o modo claro, tem uma interface limpa e arejada. Os dois temas foram desenhados com as mesmas cores semânticas — sucesso, erro, alerta — garantindo que a experiência seja consistente independente da sua escolha.
          </>,
        ],
        tags: ["feature"],
        image: PLACEHOLDER,
        imageAlt: "Painel admin no modo claro e no modo escuro lado a lado",
      },
    ],
  },
];

const Tag = ({ type }: { type: TagType }) => {
  const config = tagConfig[type];
  return (
    <div className="flex items-center gap-1.5">
      <span className={`h-3 w-3 rounded-full ${config.color}`} />
      <p className="text-sm font-semibold text-primary/80">{config.label}</p>
    </div>
  );
};

const INITIAL_DAYS = 5;
const LOAD_MORE = 3;

export default function UpdatesPage() {
  const { t } = useTranslation();
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(INITIAL_DAYS);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const closeLightbox = useCallback(() => setLightboxSrc(null), []);

  useEffect(() => {
    if (!lightboxSrc) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxSrc, closeLightbox]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + LOAD_MORE, changelog.length));
        }
      },
      { rootMargin: "400px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const visibleDays = changelog.slice(0, visibleCount);
  const hasMore = visibleCount < changelog.length;

  return (
    <div className="min-h-screen bg-background">
      {lightboxSrc && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm cursor-zoom-out"
          onClick={closeLightbox}
        >
          <img
            src={lightboxSrc}
            alt=""
            className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      <LandingHeader />
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl mb-12 md:mb-16">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              {t("updates.title", "Atualizações da plataforma")}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              {t("updates.subtitle", "Veja os últimos updates e as features que lançamos nas últimas semanas.")}
            </p>
          </div>

          <div className="space-y-10">
            {visibleDays.map((day, dayIdx) => (
              <div key={day.date}>
                {dayIdx > 0 && <Separator className="my-16" />}
                {day.entries.map((entry, entryIdx) => (
                  <article
                    key={entryIdx}
                    className="relative mx-auto flex max-w-3xl flex-col gap-6 md:flex-row md:gap-10 pb-14 mb-14 last:pb-0 last:mb-0 border-b border-border/40 last:border-b-0"
                  >
                    <time className="h-fit min-w-[140px] text-sm font-semibold text-muted-foreground md:sticky md:top-10">
                      {entryIdx === 0 ? day.date : ""}
                    </time>
                    <div>
                      <div className="flex flex-wrap gap-4">
                        {entry.tags.map((tag) => (
                          <Tag key={tag} type={tag} />
                        ))}
                      </div>
                      <div className="mt-4">
                        <h3 className="text-xl font-semibold text-foreground md:text-2xl">
                          {entry.title}
                        </h3>
                        {entry.mockup ? (
                          <div className="mt-4">{entry.mockup}</div>
                        ) : entry.images ? (
                          <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {entry.images.map((img, imgIdx) => (
                              <button
                                key={imgIdx}
                                type="button"
                                onClick={() => setLightboxSrc(img.src)}
                                className="w-full cursor-zoom-in"
                              >
                                <img
                                  src={img.src}
                                  alt={img.alt}
                                  className="w-full rounded-lg border border-border shadow-sm"
                                />
                              </button>
                            ))}
                          </div>
                        ) : entry.image ? (
                          <button
                            type="button"
                            onClick={() => setLightboxSrc(entry.image!)}
                            className="mt-4 w-full cursor-zoom-in"
                          >
                            <img
                              src={entry.image}
                              alt={entry.imageAlt ?? entry.title}
                              className="w-full rounded-lg border border-border shadow-sm"
                            />
                          </button>
                        ) : null}
                        <div className="mt-4 space-y-3">
                          {entry.paragraphs.map((p, i) => (
                            <p
                              key={i}
                              className="text-sm leading-relaxed text-muted-foreground"
                            >
                              {p}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ))}
            {/* Sentinel para infinite scroll */}
            {hasMore && <div ref={sentinelRef} className="h-px" />}
          </div>
        </div>
      </section>
    </div>
  );
}
