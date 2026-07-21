# GAP-39 — Seção 6 (FAQs) — Plano de execução

> Análise no Fable (Copy-as-CSS da seção + print do Figma). Execução: Sonnet.
> Worktree: `C:/dev/dips/lp-dips/.claude/worktrees/agent-a647a13d3da177a22`.
> Arquivos: `src/components/FAQSection.tsx` (+ `messages/*.json`). O shadcn `ui/accordion.tsx` NÃO deve ser editado (usado por outros lugares em tese) — tudo via className/props.
> Processo padrão: editar → parar dev server → build + 71 testes → commit atômico → restart → addendum no 05-VISUAL-GAPS.md (main repo, `cd` antes).

## Contexto do Figma

Frame 1440×1014, bg `#1A0A2E` (= `dips-purple-section`, já usado ✓). Header centralizado (título "FAQs" + **subtítulo que hoje não existe**), acordeão de 807px de largura com 6 itens, primeiro item **aberto por padrão** com **borda laranja completa**.

**Já correto (não mexer):** bg da seção; cards `bg-dips-card-ingredient` (#231435), borda fechada `dips-card-ingredient-border` (#39294C), raio 15 (`rounded-card`), padding 25 (`p-card-padding`); título "FAQs"; comportamento single/collapsible do Radix.

**Override funcional (NÃO copiar do Figma):** a copy das perguntas/respostas é override documentado (FAQ real vence). O Figma diverge em detalhes (q3 "Is this product safe?" vs. nosso "Is the product safe?"; q4 "lactose free" vs. "lactose-free") — **manter a nossa**. O subtítulo NÃO faz parte do override (é novo) → adicionar do Figma.

## Mudanças — `FAQSection.tsx`

1. **Subtítulo novo** sob o título: mesmo texto do subtítulo da Reviews ("We care about what we put in our products…"). Adicionar chave `FAQ.subtitle` nas 3 línguas — **copiar as traduções exatas já existentes em `Reviews.subtitle`** (en/es/pt), não retraduzir. Render: `text-[21px] leading-[1.35] text-dips-text-lavender text-center`, max-w ~2xl, `mt-4`; margem inferior do header ~mb-12.
2. **Título:** cor lavanda → **branco**; `font-heading text-[48px] font-bold leading-[1.2]` (54→48, tratamento padrão; hoje usa token 54px e lavanda).
3. **Largura do acordeão:** `max-w-5xl` (1024) → **`max-w-[807px]`** (Figma).
4. **Gap entre itens:** `space-y-4` (16px) → **`space-y-[10px]`** (Figma gap 10).
5. **Item — borda:** `border` (1px) → **`border-2`**. Estado aberto: trocar o `data-[state=open]:border-l-4 data-[state=open]:border-brand-orange` (barra lateral atual) por **borda completa laranja**: `data-[state=open]:border-brand-orange` (Figma #FF6B01 → manter `brand-orange` pela normalização DSGN-03). Sem `border-l-4`.
6. **Pergunta:** `text-card-title-sm` (18px token) → `text-[16px]` (18→16), cor lavanda → **`text-white`**, mantém `font-heading` (Figma é AllRoundGothic ✓) e `hover:no-underline py-0`.
7. **Chevron:** o shadcn renderiza `ChevronDown h-4 w-4` fixo dentro do trigger — sobrescrever via seletor arbitrário no className do `AccordionTrigger`: `[&>svg]:h-6 [&>svg]:w-6 [&>svg]:text-white [&>svg]:stroke-[2.5]` (Figma: 24px, traço 3px, branco; 2.5 fica fiel sem pesar). Rotação no open já é nativa.
8. **Resposta:** `text-[16px] leading-[1.35] text-dips-text-lavender` (Figma aberto usa #EBD9FE = token lavender ✓ que já está; só ajustar tamanho — 18→16). Gap pergunta→resposta: Figma 5px → trocar `pt-4` por `pt-[5px]` no `AccordionContent` (o default do shadcn já tem `pb-4 pt-0` no wrapper interno; nosso className entra no div interno via cn — conferir resultado visual). Adicionar `whitespace-pre-line` na resposta pra respeitar o `\n` intencional do `a5` (lista de ingredientes).
9. **Primeiro item aberto por padrão** (Figma): `<Accordion type="single" collapsible defaultValue="q1">`.
10. ScrollReveal e âncora `id="faq"`/`scroll-mt` mantêm.

## Tratamento de fontes (padrão)

título 54→48 · subtítulo 24→21 · pergunta 18→16 · resposta 18→16.

## Verificações finais

- Item q1 abre por padrão com borda laranja completa; abrir outro fecha o q1 e move a borda laranja.
- Copy das 6 Q&A INALTERADA (override), subtítulo novo presente nas 3 línguas.
- Quebra de linha do a5 visível (whitespace-pre-line).
- Addendum GAP-39 no 05-VISUAL-GAPS.md + commit docs no main.
