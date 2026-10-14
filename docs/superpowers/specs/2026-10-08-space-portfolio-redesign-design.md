# Spec — Portfólio "Odisseia": redesign cinematográfico 3D do espaço

**Data:** 2026-10-08
**Status:** decisões aprovadas pelo Victor em 2026-10-08; aguardando currículo para a fase de conteúdo. Nada implementado.
**Referência de estilo:** landonorris.com (preloader, capítulos em tela cheia, câmera guiada por scroll, tipografia cinética gigante, cursor custom, menu overlay, som ambiente opcional), adaptado ao tema espaço com planetas reais.

---

## 1. Objetivo

Transformar o portfólio atual (atmosfera 3D fixa + seções de texto) em uma **viagem contínua pelo Sistema Solar** guiada pelo scroll, onde cada capítulo do portfólio acontece diante de um planeta **real**, renderizado com texturas fotográficas de alta resolução (NASA / Solar System Scope, 4K a 8K), iluminação física, atmosfera, nuvens, anéis e pós-processamento de nível cinematográfico.

Critérios de sucesso:

1. Primeira impressão forte: Terra em órbita, com terminador dia/noite, luzes de cidade e nuvens em movimento, visível em até 3 s após o preloader em desktop.
2. Scroll = câmera. O usuário sente que está voando entre planetas, não lendo uma página com fundo bonito.
3. 60 fps em desktop médio (GPU integrada recente), 30 fps estáveis em celular médio, sem travar o scroll.
4. Planetas reconhecíveis à primeira vista (Terra, Marte, Júpiter, Saturno, Netuno). Nada procedural genérico.
5. Continua 100% estático (GitHub Pages, `output: 'export'`), bilíngue (pt-BR/EN) e acessível (reduced-motion, teclado, leitor de tela).

Fora de escopo nesta fase: CMS, blog, formulário de contato com backend, páginas internas de case study (ficam como links externos).

### 1.1 Princípio central: o 3D é cenário, a UI/UX é protagonista

Isto é um portfólio, não um simulador. O espaço existe para dar peso e atmosfera ao conteúdo, nunca para competir com ele. Regras que valem para toda a spec:

- **Legibilidade primeiro.** Todo bloco de texto tem scrim (gradiente escuro) ou área de respiro onde o planeta não passa. Contraste AA garantido em qualquer frame do scroll.
- **O planeta nunca fica atrás do texto principal.** O layout de cada capítulo reserva lado/coluna para o planeta e lado/coluna para o conteúdo (ver grid em §6).
- **Scroll nativo e previsível.** Nada de wheel-hijack; o snap é suave e cancelável. O usuário sempre sabe onde está (indicador de capítulo, barra de progresso, menu).
- **Interação é no DOM.** Links, cards, chips, menu, idioma, som: tudo HTML acessível. O canvas é `aria-hidden` e `pointer-events: none`. A única exceção é o hover na constelação de skills, que tem equivalente DOM (lista) em mobile e para teclado.
- **O 3D reage ao conteúdo, não o contrário.** Quando um bloco de texto denso está em foco, a cena escurece levemente (exposição -0.3 EV) e o bloom reduz, devolvendo atenção ao texto.
- **Tempo de leitura é respeitado.** O pin de cada capítulo dura o suficiente para ler o conteúdo sem pressa; a câmera só se move de forma significativa nas transições entre capítulos.
- **Métrica de UX acima da métrica de 3D.** Se um efeito custa legibilidade, fps ou tempo de carga, o efeito perde.

### 1.2 Referências visuais

| Referência | O que aproveitar | O que NÃO copiar |
|---|---|---|
| landonorris.com | Preloader com contador, capítulos em tela cheia, tipografia display gigante, menu overlay, cursor custom, transições de câmera, som opcional | Scroll sequestrado por capítulo |
| solarsystemscope.com | Aparência dos planetas (texturas 2K–8K que o próprio site distribui sob CC BY 4.0), iluminação solar única, skybox da Via Láctea, escala "bonita" em vez de realista | Interface de simulador, órbitas desenhadas, rótulos flutuantes, controle livre de câmera |
| NASA's Eyes (science.nasa.gov/eyes) | Enquadramentos cinematográficos (planeta parcialmente fora de quadro, câmera baixa sob os anéis), sobriedade de cor, fundo preto profundo | Painéis de dados, timeline, HUD |
| SpaceEngine | Qualidade de atmosfera no limbo, god-rays do Sol, exposição/HDR, grain sutil | Densidade de estrelas exagerada, lens flares agressivos |

Esses sites são referência de **como o fundo deve parecer**. A navegação, hierarquia e interação vêm do lado "portfólio premium" (Lando), com a UI sempre em primeiro plano.

---

## 2. Decisões (confirmadas em 2026-10-08)

| # | Decisão | Motivo |
|---|---|---|
| D1 | Scroll **contínuo** (Lenis) com câmera em trilho + **snap suave** e cancelável em cada capítulo. Menu overlay e indicador de capítulo permitem pular direto para qualquer seção. | Pensado no recrutador: ele tem pouco tempo, muitas vezes está no celular e quer chegar em "Projetos" e "Contato" em segundos. Scroll sequestrado atrasa isso e frustra em trackpad/mobile. |
| D2 | Roteiro: Terra → Marte → Júpiter → Saturno → Urano → Vênus → Netuno → Espaço profundo (Via Láctea). | Ordem física real (com Vênus como desvio deliberado), crescendo em escala e drama. |
| D3 | Cada **projeto tem seu próprio planeta**: Marte, Júpiter, Saturno, Urano, Vênus (5 projetos, ver §2.2). | Cada projeto ganha um "palco" memorável. |
| D4 | Texturas em **KTX2 (Basis)** geradas em build: 8K Terra / 4K demais no desktop, 2K no mobile. | Qualidade Full HD+ com uso de GPU 3 a 4× menor que JPG. |
| D5 | Som ambiente **desligado por padrão**, toggle no header, escolha persistida. | Autoplay de som é hostil; recrutador costuma estar em ambiente de trabalho. |
| D6 | Manter Next.js 14 + R3F + Framer Motion; **adicionar GSAP ScrollTrigger e @react-three/postprocessing**. | Melhor para o projeto: reaproveita i18n, export estático e deploy já funcionando; GSAP resolve pin/snap/scrub com maturidade; postprocessing é o que dá o acabamento "cinema". Reescrever em Vite + Three puro jogaria fora tudo isso sem ganho visual. |
| D7 | Paleta sai do monocromático: fundo preto profundo, texto off-white, **acento por capítulo** derivado do planeta. | Dá identidade a cada capítulo e ajuda o recrutador a se orientar. |

### 2.1 Recrutador como usuário primário

Consequências práticas, além do D1:

- **Acima da dobra, em até 3 s:** nome, cargo ("FullStack Developer"), uma frase de posicionamento, CTA "Ver projetos" e CTA "Contato". Nada disso depende do 3D carregar.
- **"Projetos" e "Contato" alcançáveis em um clique** a partir de qualquer ponto (header + menu overlay).
- **Cada projeto responde em 10 s de leitura:** o que é, qual problema resolve, stack, resultado/impacto e link para repositório ou demo. Repositórios reais do GitHub têm prioridade sobre descrições abstratas.
- **Botão de currículo (PDF)** no header e no capítulo de contato. Download direto, sem modal.
- **Mobile é cidadão de primeira classe:** o recrutador frequentemente abre o link pelo LinkedIn no celular. Em mobile o 3D cai para 2K, sem bloom, mas o layout e o conteúdo são idênticos.
- **Em 60 s o recrutador sabe:** quem é Victor, o que ele constrói, 3 provas concretas e como falar com ele.

### 2.2 Conteúdo real (do currículo recebido em 2026-10-08 + GitHub)

**Identidade**
- Nome: Victor Augusto Ferreira dos Santos. Título: FullStack Developer.
- Local: São José dos Campos, SP. Email: victoroow@gmail.com. GitHub: github.com/Victorow. LinkedIn: link a confirmar com o Victor (o PDF só tem o rótulo).
- Posicionamento (hero): desenvolvedor full-stack que entrega produto de ponta a ponta: apps mobile publicados nas lojas, back-end na AWS com PostgreSQL, e ferramentas open source para fluxos com agentes de IA (MCP, Claude Code).
- Experiência: Desenvolvedor Júnior na CDT Software (React/Vite, back-end AWS, PostgreSQL, Git). Estagiário no SESI (sistemas internos, automação, infraestrutura).
- Formação: Análise e Desenvolvimento de Sistemas, Faculdade de Tecnologia Senai Félix Guisard. Complementar: OO e BD com Java/SQL (Coursera); Cybersecurity Defense Analyst (Cisco, em andamento).
- Idiomas: Português nativo, Inglês intermediário.
- Currículo PDF: Victor coloca o arquivo em `public/cv/Victor-Augusto-Ferreira-dos-Santos.pdf` (o PDF foi enviado no chat, não está no disco). Botão de download no header e no contato aponta para esse caminho.

**Projetos: 5 capítulos-planeta**

| # | Planeta | Projeto | Tipo | Stack | Links |
|---|---|---|---|---|---|
| 01 | Marte | **OppyConnect**: mensageiro do ecossistema LinkBiz. Desenvolvido integralmente: chat individual e em grupo, mídia, documentos, voz e busca. Publicado na App Store e Google Play. | Profissional, código fechado | React Native/Capacitor, Node.js, PostgreSQL, AWS | Lojas (links a confirmar) |
| 02 | Júpiter | **LinkBiz**: plataforma de networking e oportunidades de negócio com IA. Novas funcionalidades, correção de bugs e itens de segurança. | Profissional, código fechado | React, AWS, PostgreSQL | linkbiz.ai |
| 03 | Saturno | **Duo**: ponte MCP entre duas instâncias do Claude Code em máquinas diferentes (Tech Lead delega ao Executor) com cache semântico local, delegação de tasks e barreira de publicação por branch protegida. | Open source | TypeScript, MCP, Tailscale | github.com/Victorow/A2A-and-cache-semantic-for-claude |
| 04 | Urano | **claude-telegram-bridge**: bridge self-hosted que notifica no Telegram quando uma sessão do Claude Code termina e permite continuar a sessão respondendo pelo chat. Multi-projeto, multi-usuário, binário por OS. | Open source | Node.js, Rust, Telegram Bot API | github.com/Victorow/claude-telegram-bridge |
| 05 | Vênus | **Extensões VS Code**: AI Diff Tracker (mostra em tempo real as alterações feitas por agentes de IA nos arquivos) e Mini Browser (navegador lateral com abas, favoritos, histórico e modo áudio). Publicadas no Marketplace. | Open source | TypeScript, VS Code API | Marketplace (links a confirmar) |

Ordem no roteiro: Terra (hero) → Marte → Júpiter → Saturno → Urano → Vênus → Netuno (sobre + skills) → espaço profundo (contato). Vênus entra fora da ordem física de propósito, como "retorno ao interior" antes de Netuno; se o Victor preferir ordem estrita, Vênus troca de lugar com Marte e OppyConnect vai para Vênus.

Menções secundárias (lista compacta "outros projetos" no capítulo de Netuno, só título + link): mcp-devflow (servidor MCP integrado ao sistema de tasks da empresa), focuspt (site freelance para personal trainer, Angular + Supabase + IA, alexandre-site-ten.vercel.app), radar-de-vagas (GitHub Actions + Gemini, 13 fontes de vagas).

**Skills (constelação, 6 clusters)**
- Linguagens: Java, Kotlin, Python, JavaScript, TypeScript
- Frameworks: Spring Boot, NestJS, React, React Native, Capacitor, Angular, Flutter, Node.js
- Bancos de dados: PostgreSQL, MySQL, MariaDB, MongoDB, Supabase
- Cloud, DevOps e Redes: AWS, Azure, VPS, Docker, CI/CD, GitHub Actions, Linux, Redes, Cibersegurança
- IA e Integrações: MCP, APIs REST, Web Scraping, IA generativa
- Métodos e Ferramentas: Scrum, Jira, Git, GitHub, Postman

**Pendências de conteúdo** (não bloqueiam a implementação; entram com placeholders marcados `TODO-VICTOR` nos JSON de mensagens): URL do LinkedIn, links das lojas do OppyConnect, links do Marketplace das extensões.

Os textos atuais em `messages/*.json` e `content/projects.ts` são substituídos integralmente. Email `ola@exemplo.dev` e links `#` saem.

---

## 3. Abordagens avaliadas

**A — drei `<ScrollControls>` (scroll dentro do canvas).** Tudo em 3D, HTML via `<Scroll html>`. Simples de sincronizar, mas o texto perde SEO e acessibilidade nativa, mobile sofre e o layout responsivo fica preso ao canvas. Descartada.

**B — Scroll DOM (Lenis) + GSAP ScrollTrigger dirigindo uma câmera em trilho (CatmullRom) num canvas fixo. Recomendada.** DOM continua sendo DOM (SEO, i18n, leitor de tela, Tailwind). Um único número `progress` (0 a 1) alimenta câmera, planetas, pós-processamento e tipografia. ScrollTrigger entrega pin, snap e timelines por capítulo com robustez já resolvida.

**C — Capítulos discretos com wheel-hijack (fiel ao Lando).** Cada capítulo é uma tela; o scroll avança um capítulo por gesto. Visual mais "produto", mas quebra o scroll nativo em mobile, exige muita engenharia de gesto/teclado e é hostil à acessibilidade. Descartada. O **snap suave** de B entrega a maior parte da sensação.

---

## 4. Experiência: roteiro capítulo a capítulo

Página única, 8 capítulos + preloader. Cada capítulo ocupa cerca de 150 a 250 vh de scroll (conteúdo pinado enquanto a câmera viaja). Indicador fixo "01 / 08 — TERRA" no canto.

### 4.0 Preloader
- Tela preta, contador 000→100 em tipografia display gigante, linha de progresso fina, legenda "inicializando sistemas · carregando Terra".
- Carrega **só** os assets do capítulo 1 (Terra, Lua, skybox em baixa resolução). Demais planetas carregam em background depois.
- Saída: contador some, a Terra "acende" do terminador para o lado diurno (uniform de exposição 0→1) enquanto o título entra letra a letra.
- Máximo 2,5 s em conexão boa; se os assets chegarem antes, o contador acelera.

### 4.1 Capítulo 01 — TERRA (Hero)
- Terra ocupando cerca de 55% da altura, descentralizada à direita; Lua ao fundo com fase coerente com a posição do Sol. Luz do Sol vinda da esquerda; terminador dia/noite com luzes de cidade no lado escuro, nuvens com sombra projetada na superfície, especular no oceano, atmosfera com espalhamento (Rayleigh aproximado) no limbo.
- Rotação lenta (uma volta a cada ~4 min); nuvens giram um pouco mais rápido.
- Tipografia: nome em display gigante (clamp 12 a 20vw), "FullStack Developer" como eyebrow, subtítulo curto, dois CTAs. Letras entram com stagger e leve blur.
- Scroll: câmera recua e vira para o espaço profundo; a Terra vira um "pálido ponto azul" enquanto Marte cresce da escuridão.

### 4.2 Capítulo 02 — MARTE (Projeto 01)
- Marte com textura 4K + mapa de altura (Valles Marineris e Olympus Mons visíveis em relevo), fina atmosfera avermelhada, tempestade de poeira sutil via noise no shader.
- Layout do projeto: índice "01", título, resumo, Desafio / Solução / Arquitetura em colunas, chips de stack com ícones, links. O card entra pinado; a câmera orbita 30° em torno do planeta enquanto o usuário lê.
- Hover em links: cursor custom expande com rótulo ("abrir →").

### 4.3 Capítulo 03 — JÚPITER (Projeto 02)
- Júpiter enorme, só parcialmente em quadro (escala dramática). Textura 4K com bandas; Grande Mancha Vermelha em destaque; leve distorção de fluxo nas bandas via flow map para parecer vivo. Io e Europa passam como pontos iluminados.
- Mesmo layout de projeto; acento âmbar.

### 4.4 Capítulo 04 — SATURNO (Projeto 03)
- Saturno com **anéis reais** (textura de anel com alpha, sombra do planeta nos anéis e dos anéis no planeta via shadow map dedicado). Câmera vem por baixo do plano dos anéis e sobe: o momento mais cinematográfico da página.
- Mesmo layout de projeto; acento dourado.

### 4.5 Capítulo 05 — URANO (Projeto 04)
- Urano azul-esverdeado pálido, inclinação axial de 98° (gira "deitado"), anéis finos e escuros quase de perfil. Textura 2K é suficiente (superfície lisa).
- Mesmo layout de projeto; acento ciano-gelo.

### 4.6 Capítulo 06 — VÊNUS (Projeto 05)
- Vênus coberto por nuvens densas amareladas (textura de atmosfera 4K), brilho forte por ser o planeta mais próximo do Sol no roteiro; leve rotação retrógrada.
- Mesmo layout de projeto; acento amarelo-creme.

### 4.7 Capítulo 07 — NETUNO (Sobre + Competências)
- Netuno azul-cobalto, calmo, pequeno na tela; Tritão ao fundo. Mood introspectivo.
- "Sobre" em 3 parágrafos à esquerda. Ao continuar o scroll, as **competências aparecem como uma constelação**: cada skill é uma estrela com rótulo, linhas finas conectam clusters (Backend, Frontend, Cloud, IA…). Hover em uma estrela ilumina o cluster.
- A fonte da verdade das skills é a **lista DOM** (chips agrupados por cluster, com ícones), sempre renderizada e acessível. A constelação 3D é decoração sincronizada com ela: hover no chip ilumina a estrela e vice-versa. Em mobile e reduced-motion a constelação some e fica só a lista.

### 4.8 Capítulo 08 — ESPAÇO PROFUNDO (Contato)
- Câmera sai do plano da eclíptica; skybox da Via Láctea 8K em pleno; o Sistema Solar some como pontos. God-rays do Sol distante.
- Título em 3 linhas gigantes ("Vamos construir / algo que / dure."), email como link enorme com underline animado, ícones sociais, frase final.
- Footer com créditos de textura (NASA / Solar System Scope, CC BY 4.0 exige atribuição), stack, idioma.

### Elementos globais (estilo Lando)
- **Header mínimo:** iniciais à esquerda; à direita: botão "Currículo" (download PDF), toggle de som, troca de idioma, botão de menu.
- **Menu overlay** em tela cheia: capítulos listados em display gigante com número; hover muda o acento e a câmera do canvas "espia" o planeta correspondente (sem duplicar canvas).
- **Cursor custom** (apenas pointer fine): ponto + anel com lag; estados: hover-link, arrastar, "ver".
- **Indicador de capítulo** fixo + barra de progresso vertical.
- **Marquee** fino de texto entre capítulos ("ENGENHARIA · PERFORMANCE · ARQUITETURA").
- **Grain + vignette** mantidos, agora via pós-processamento no canvas.
- **Som:** drone ambiente em loop + "whoosh" sutil nas transições de capítulo; mudo por padrão, escolha lembrada em localStorage.

---

## 5. Arquitetura técnica

### 5.1 Stack
Mantido: Next.js 14 (App Router, static export), TypeScript, Tailwind, next-intl, Lenis, Framer Motion (micro-interações DOM), React Three Fiber, drei, three.

Adicionado:
- `gsap` + `ScrollTrigger`: timeline mestre de scroll, pin, snap.
- `@react-three/postprocessing` (+ `postprocessing`): Bloom, Vignette, Noise, SMAA, GodRays, ToneMapping (ACES), aberração cromática leve.
- `KTX2Loader` (three/examples): texturas comprimidas.
- `howler`: áudio (ou Web Audio nativo se ficarem só 2 sons).
- Dev: `toktx` (KTX-Software) para gerar KTX2 via script `npm run assets`.

### 5.2 Módulos (uma responsabilidade cada)

```
lib/
  journey/
    timeline.ts         # mapa capítulo → faixa de progress (0–1), snaps, nomes
    useJourney.ts       # store (zustand) com progress, chapter, velocity
    cameraPath.ts       # CatmullRomCurve3 de posição + curva de lookAt + fov por keyframe
  assets/
    manifest.ts         # texturas por planeta e por tier (2K/4K/8K), URLs
    useChapterAssets.ts # carrega assets do capítulo N+1 em idle, reporta % p/ preloader
  device.ts             # (existente) tier + reduced motion; adiciona detecção WebGL2/KTX2
  audio.ts              # player ambiente, toggle, persistência

components/scene/
  SpaceScene.tsx        # Canvas, luzes, pós-processamento, Suspense por capítulo
  CameraRig.tsx         # lê progress → amostra cameraPath → aplica + parallax de cursor
  Skybox.tsx            # Via Láctea equiretangular, exposição varia por capítulo
  Sun.tsx               # esfera emissiva + lens flare + fonte dos GodRays
  planets/
    Planet.tsx          # genérico: albedo, normal/bump, roughness, rotação, inclinação axial
    Earth.tsx           # shader próprio: dia/noite, luzes de cidade, nuvens c/ sombra, especular
    Mars.tsx            # Planet + displacement + poeira
    Jupiter.tsx         # Planet + flow map nas bandas
    Saturn.tsx          # Planet + Rings.tsx (alpha ring + sombras duplas)
    Uranus.tsx          # Planet inclinado 98° + Rings finos
    Venus.tsx           # Planet + nuvens densas, rotação retrógrada
    Neptune.tsx         # Planet + atmosfera densa
    Moon.tsx            # reutilizável (Lua, Tritão, luas de Júpiter como pontos)
    Atmosphere.tsx      # shell com espalhamento aproximado (cor, espessura, potência)
  Constellation.tsx     # skills como pontos+linhas em 3D, hover por raycast
  effects/
    PostFX.tsx          # EffectComposer com presets por capítulo

components/journey/
  Preloader.tsx, ChapterIndicator.tsx, ProgressRail.tsx, MenuOverlay.tsx,
  CustomCursor.tsx, SoundToggle.tsx, Marquee.tsx

components/sections/    # reescritos para layout pinado
  Hero.tsx, ProjectChapter.tsx, About.tsx, Expertise.tsx, Contact.tsx, Footer.tsx

content/
  projects.ts           # 5 projetos, campo planet: 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'venus'
  planets.ts            # raio relativo, inclinação axial, período de rotação, cor de acento
```

### 5.3 Fluxo de dados
1. Lenis emite scroll → ScrollTrigger (scroller sincronizado) atualiza `progress` global (0 a 1) e `chapter`.
2. `CameraRig` amostra `cameraPath` em `progress` (com suavização exponencial) e soma o parallax do cursor.
3. Cada planeta tem posição fixa no mundo (escala não realista, mas ordem e proporções relativas respeitadas). Só os planetas do capítulo atual ±1 ficam visíveis.
4. `PostFX` interpola presets entre capítulos pelo mesmo `progress`.
5. Seções DOM são pinadas por ScrollTrigger na faixa do seu capítulo; animações de texto são timelines GSAP com scrub, ou Framer Motion `whileInView` para micro-detalhes.
6. `useChapterAssets` observa `chapter` e pré-carrega o próximo em `requestIdleCallback`.

### 5.4 Assets e orçamento
Fontes: NASA Visible Earth / Blue Marble (domínio público), Solar System Scope (CC BY 4.0, atribuir no footer), Via Láctea ESO/NASA.

| Planeta | Mapas | Res. desktop | Res. mobile |
|---|---|---|---|
| Terra | day, night, clouds, specular, normal | 8K day / 4K demais | 2K |
| Lua | albedo, displacement | 2K | 1K |
| Marte | albedo, height | 4K | 2K |
| Júpiter | albedo | 4K | 2K |
| Saturno | albedo, ring color, ring alpha | 4K + 2K ring | 2K + 1K |
| Urano | albedo, ring alpha | 2K + 1K ring | 1K |
| Vênus | atmosfera (albedo) | 4K | 2K |
| Netuno | albedo | 2K | 1K |
| Skybox | Via Láctea equiretangular | 8K | 4K |

Orçamento: até 12 MB transferidos antes do fim do preloader (capítulo 1), até 45 MB no total em desktop, até 15 MB no total em mobile. KTX2/UASTC para albedos, ETC1S para mapas de dados. Script `npm run assets` converte `assets/raw/*` → `public/textures/{tier}/*.ktx2` e grava `manifest.json`.

### 5.5 Performance
- Tiers `high` / `mid` / `low` controlam resolução de texturas, DPR (1 a 1.75), bloom, sombras dos anéis, sombra das nuvens, aberração.
- `PerformanceMonitor` do drei rebaixa o tier em tempo real se o fps ficar abaixo de 45 por 2 s.
- Esferas 128×64 (high) / 64×32 (mid/low). Uma única `EffectComposer`.
- Nenhum `setState` por frame: tudo em refs/uniforms. Scroll nunca bloqueado pela render.
- Texto DOM continua indexável; canvas é `aria-hidden`.

### 5.6 Acessibilidade e fallbacks
- `prefers-reduced-motion`: desliga Lenis, snap, parallax e rotação; transições por fade; câmera salta entre poses.
- Sem WebGL: poster JPG estático de cada planeta (pré-renderizado em build) e site totalmente funcional.
- Menu, toggles e links navegáveis por teclado; foco visível; cursor custom não substitui o nativo para quem usa teclado.
- Contraste mínimo AA sobre o canvas (scrim gradiente atrás dos blocos de texto).

### 5.7 SEO / meta
- OG image: render da Terra do hero (PNG estático em `public/og/`).
- `metadata` por locale mantido. JSON-LD `Person` adicionado.

### 5.8 Testes e verificação
- Unit (Vitest): `timeline.ts` (progress→capítulo, bordas), `cameraPath.ts` (amostragem contínua, sem NaN), `manifest.ts` (tier → URLs corretas).
- Smoke E2E (Playwright, 1 spec): página carrega, preloader some em até 6 s, 8 capítulos atingíveis por scroll, menu abre/fecha, troca de idioma preserva o capítulo.
- Checklist manual com Lighthouse (Performance ≥ 80 desktop, ≥ 60 mobile; Accessibility ≥ 95) e fps via `stats.js` em dev.
- `next build` gera `out/` sem erros e com texturas copiadas.

---

## 6. Direção visual

- **Tipografia:** display geométrica pesada para títulos (Clash Display ou Space Grotesk, gratuitas), mono fina para rótulos/índices (JetBrains Mono), sans legível para corpo (Inter). Títulos em caixa alta com tracking negativo, tamanhos em `clamp()`.
- **Cor:** `#030305` fundo; `#F2F2F0` texto; acento por capítulo em `planets.ts`: Terra `#5FA8FF`, Marte `#D96A3C`, Júpiter `#E0A862`, Saturno `#E8C98A`, Urano `#8FD8E8`, Vênus `#F0D9A0`, Netuno `#3E6CFF`, Espaço profundo `#B8C4FF`. Acento aplicado a eyebrow, underline, cursor, indicador e tint do bloom.
- **Movimento:** easings longos (`expo.out`, 1.2 a 1.8 s) para câmera; `power3` 0.6 a 0.9 s para texto; nunca linear. Rotação e nuvens lentas o bastante para só serem percebidas por comparação.
- **Grid:** 12 colunas desktop, margens 6vw; conteúdo de capítulo ocupa 5 a 6 colunas e nunca cobre o planeta principal.

---

## 7. Fases de entrega (base para o plano de implementação)

1. **Fundação:** store de progress, Lenis + ScrollTrigger, CameraRig em trilho, Skybox, PostFX básico, tiers. Planetas ainda como esferas de cor.
2. **Terra + Preloader + Hero:** shader completo da Terra, Lua, pipeline KTX2, preloader real, tipografia do hero.
3. **Marte, Júpiter, Saturno, Urano, Vênus + ProjectChapter:** anéis com sombras, layout pinado de projeto, cursor custom.
4. **Netuno + Sobre + Constelação de skills + outros projetos.**
5. **Espaço profundo + Contato + Footer + Menu overlay + Som + Marquee.**
6. **Polimento:** reduced-motion, fallback sem WebGL, OG image, Lighthouse, testes, conteúdo real, atribuições.

Cada fase termina com build estático passando e verificação visual.

---

## 8. Riscos

- **Peso dos assets** no GitHub Pages: mitigado por KTX2, tiers e carregamento por capítulo.
- **Sombras dos anéis de Saturno** são o item mais caro; se pesarem em `mid`, viram sombra pré-pintada na textura.
- **Scroll + pin em iOS Safari** tem histórico de bugs com Lenis/ScrollTrigger; testar em dispositivo real na fase 1.
- **Licenças:** Solar System Scope exige atribuição visível; NASA não. Footer já prevê créditos.
