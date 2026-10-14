# Spec — Portfólio Odisseia · Fase 2 (revisão 3)

**Data:** 2026-10-13 · **Status:** aguardando validação, nada implementado · **Base:** `feat/space-odyssey` @ 456b4ce

Versão completa, com mockups de UI, no artifact "Odisseia Fase 2" (link no chat). Este arquivo é o resumo versionado.

Removidos nesta revisão, a pedido do Victor: GitHub ao vivo, órbita da carreira, badge de Lighthouse.

## Entregas

| # | Entrega | Esforço |
|---|---|---|
| 02 | Modo "Em 60 segundos" (botão no header, overlay de tela única, link `#60s`) | Baixo |
| 03 | Mission Control (tecla `~`): FPS, tier, GPU, capítulo, progresso, texturas, draw calls | Baixo |
| 04 | Sol com lens flare ao olhar para trás no final; eclipse rápido da Lua no hero | Médio |
| 05 | Som sincronizado ao warp (sub-grave + ping de beacon), sintetizado | Baixo |
| 06 | Modo foto (tecla `P`): esconde UI e exporta PNG 2x | Baixo |
| 07 | OG por idioma, sitemap.xml, robots.txt, hreflang | Baixo |
| 08 | 404 "Perdido no espaço" | Baixo |
| 09 | Portfólio clássico em `/{locale}/classic/`, sem 3D, preto/azul/branco, botão de troca, FAQ, "Fatos rápidos" | Alto |
| 11–12 | SEO completo + visibilidade em IA (GEO/AEO) | Contínuo |
| 13 | Segurança de ponta a ponta | Contínuo |

## Decisões propostas

- **D1** Clássico em `/pt-BR/classic/` e `/en/classic/`; substitui posters como fallback sem WebGL / reduced-motion.
- **D2** Tema do clássico: editorial impresso, claro por padrão (papel branco, tinta preta, azul #1A4FFF) com tema escuro automático. Protótipo hi-fi: https://claude.ai/artifact/K4fnTsgpvh88TMahCmAp93
- **D3** Clássico é a página canônica para buscadores e IA.
- **D4** Crawlers de IA liberados no robots.txt (GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended…).
- **D5** Sons sintetizados em Web Audio.
- **D6** Modo foto exporta sem UI, 2x, opção "com texto".
- **D7** FAQ sobre o Victor no clássico com `FAQPage` em JSON-LD.
- **D8** Lighthouse como validação interna (≥ 95 no clássico), sem badge.
- **D9** Decidido: sem Cloudflare. DNS fica no Name.com; SPF e DMARC no painel do Name.com (sem CAA nem DNSSEC: os nameservers padrão do Name.com não suportam); CSP via meta.

## SEO (buscadores)

Rastreio (robots, sitemap, IndexNow, canonical, hreflang, raiz noindex, 404 real) · JSON-LD (Person, ProfilePage, WebSite, SoftwareSourceCode/CreativeWork por projeto, FAQPage, BreadcrumbList, validado no CI) · on-page (título com nome completo, description ≤ 155, h1, semântica, alt, manifest) · CWV (clássico LCP < 1,5 s; 3D LCP < 3,5 s) · entidade (nome idêntico em todos os perfis, sameAs bidirecional, Wikidata opcional, Google Search profile) · off-page (Search Console, Bing, LinkedIn, GitHub, Marketplace, 1 artigo/trimestre, Reddit/SO) · medição semanal.

## GEO (aparecer na IA)

robots liberando crawlers de IA · Bing Webmaster (ChatGPT) verificado; Brave rastreia por links, sem painel · IndexNow · llms.txt e llms-full.txt · bloco "Fatos rápidos" e parágrafo de resposta direta · tabelas de projetos e skills · datas visíveis · inglês completo · FAQ · páginas por projeto (opcional) · medição mensal em ChatGPT, Perplexity, Gemini e Claude.

## Segurança

CSP estrita (meta no Pages, cabeçalho no Cloudflare) · HSTS preload, nosniff, Referrer-Policy, Permissions-Policy, frame-ancestors · JSON-LD escapado, sem HTML de input, noopener, zero terceiros · npm audit no CI, Dependabot, lockfile, overrides · Actions fixadas por SHA, permissões mínimas, main protegida, secret scanning, 2FA · HTTPS forçado, DNSSEC, CAA, domínio verificado no GitHub, SPF `-all` e DMARC `p=reject` · sem cookies/trackers, PDF sem metadados nem telefone, security.txt · verificação contínua (CI de cabeçalhos, securityheaders A+, SSL Labs A+).

## Fases

F1 segurança base + clássico + SEO + OG/sitemap/robots/llms + 404 → F2 domínio/DNS + verificações externas → F3 60 s + Mission Control + foto → F4 Sol/eclipse + som → F5 medição e ajuste.

## Pendências do Victor

Aprovar D1–D9; PDF do currículo (LinkedIn e lojas já no código; Marketplace adiado); foto; números reais dos projetos; acesso ao DNS; 2FA no GitHub e no registrador.
