# Product Requirements Document: Scrumkit - Initiële Setup & Sprint Retrospective

## 1. Feature Overzicht

**Feature:** Scrumkit Initiële Project Setup met Sprint Retrospective Tool

**Doel:** Een AI-first toolbox voor scrum teams opzetten met als eerste feature een collaboratieve Sprint Retrospective tool die real-time samenwerking, voting, en AI-gegenereerde rapporten ondersteunt.

**Doelgroep:** Scrum teams die hun retrospectives willen verbeteren door middel van digitale samenwerking, gestructureerde feedback, en AI-ondersteunde rapportage.

---

## 2. Functionele Vereisten

### FV1: Project Initialisatie & Architectuur

---

**FV1.1:** Next.js 16 Project Setup met Bun

Het project moet worden opgezet met Next.js 16 (App Router), TypeScript, en Bun als runtime en package manager.

```bash
bun create next-app scrumkit --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Next.js 16 features die worden benut:

- **Turbopack** als standaard bundler (stabiel voor dev én productie)
- **React 19.2** met View Transitions, `useEffectEvent()`, en Activity
- **React Compiler 1.0** voor automatische memoization
- **proxy.ts** als vervanging voor middleware (nieuwe netwerk grens)

Vereiste configuraties:

- Node.js 20.9+ (minimumvereiste voor Next.js 16)
- TypeScript 5.1+ met strict mode
- App Router (geen Pages Router)
- `src/` mappenstructuur
- Import alias `@/*` voor cleane imports

---

**FV1.2:** Shadcn/UI Integratie met v0.dev Component Generatie

Het project gebruikt Shadcn/UI als component library met Tailwind CSS voor styling. Voor complexere UI componenten wordt v0.dev gebruikt om professioneel gestylde componenten te genereren.

```bash
bunx shadcn@latest init
```

Basis componenten (installeren via CLI):

```bash
bunx shadcn@latest add button card input textarea dialog sheet dropdown-menu avatar badge tooltip skeleton tabs
```

**v0.dev Workflow voor UI Componenten:**

v0.dev is Vercel's AI UI generator die perfect integreert met Next.js + Tailwind + Shadcn/UI. Gebruik v0.dev voor:

- Retrospective board layout met kolommen
- Voting cards met animaties
- Rapport weergave met tabs
- Presence indicators en avatars
- Dashboard layouts

Werkwijze:
1. Genereer component op [v0.dev](https://v0.dev) met beschrijving
2. Kopieer gegenereerde code naar `src/components/features/`
3. Pas aan indien nodig

---

**FV1.3:** Database Setup met Vercel Postgres

Het project gebruikt Vercel Postgres als database met Drizzle ORM voor type-safe queries.

```bash
bun add @vercel/postgres drizzle-orm
bun add -D drizzle-kit
```

Vercel Postgres voordelen:

- Native Vercel integratie
- Serverless-ready
- Automatische connection pooling
- Zero-config met Vercel deployment

Drizzle ORM versie: **0.44.7** (stabiel)

---

**FV1.4:** Real-time Infrastructuur met Liveblocks

Het project gebruikt Liveblocks voor real-time functionaliteit. Liveblocks is Vercel's aanbevolen partner voor real-time collaboration.

```bash
bun add @liveblocks/client @liveblocks/react
```

Liveblocks voordelen:

- Officiële Vercel templates en documentatie
- Native Vercel Postgres synchronisatie support
- Presence awareness out-of-the-box
- Conflict-free data store (Storage)
- Gebouwd voor collaboration use-cases

---

**FV1.5:** OpenAI Integratie

Het project integreert OpenAI SDK voor AI-gegenereerde retrospective rapporten.

```bash
bun add openai
```

Configuratie:

- Environment variable `OPENAI_API_KEY`
- Server-side only API calls (geen client-side blootstelling van API key)
- Rate limiting en error handling

---

### FV2: Sprint Retrospective - Kernfunctionaliteit

---

**FV2.1:** Retrospective Sessie Aanmaken

Een gebruiker moet een nieuwe retrospective sessie kunnen aanmaken voor een sprint.

Vereiste velden:

- Sessienaam (verplicht)
- Sprintnummer/naam (optioneel)
- Team identifier (voor toekomstige multi-team ondersteuning)

Output:

- Unieke sessie ID (UUID)
- Deelbare link voor teamleden
- QR code voor makkelijke toegang (optioneel)

---

**FV2.2:** Input Toevoegen door Teamleden

Elk teamlid moet input kunnen toevoegen aan de retrospective in categorieën.

Standaard categorieën:

- **Ging Goed** (Wat ging goed deze sprint)
- **Kan Beter** (Wat kan verbeterd worden)
- **Actiepunten** (Concrete acties voor volgende sprint)

Per input item:

- Tekst inhoud (max 500 karakters)
- Categorie selectie
- Auteur (anoniem optie beschikbaar)
- Tijdstempel

---

**FV2.3:** Real-time Synchronisatie met Liveblocks

Alle wijzigingen moeten real-time gesynchroniseerd worden tussen alle deelnemers via Liveblocks.

Real-time events:

- Nieuwe input toegevoegd
- Input gewijzigd/verwijderd
- Stem toegevoegd/verwijderd
- Discussie notities bijgewerkt
- Deelnemer joined/left
- **Rapport gegenereerd/bijgewerkt**

Presence awareness (Liveblocks native):

- Toon welke teamleden online zijn
- Toon wie momenteel aan het typen is
- Cursors van andere gebruikers (optioneel)

---

**FV2.4:** Stem Systeem

Teamleden moeten kunnen stemmen op input items om prioriteit te bepalen.

Stemregels:

- Elk teamlid heeft een configureerbaar aantal stemmen (standaard: 5)
- Meerdere stemmen op hetzelfde item toegestaan
- Eigen items mogen gestemd worden
- Stemmen zijn zichtbaar voor iedereen (of verborgen tot stemfase eindigt - configureerbaar)

---

**FV2.5:** Automatische Ordening op Stemmen

Items moeten automatisch geordend worden op basis van het aantal stemmen.

Sorteerlogica:

- Primair: Aantal stemmen (hoogste eerst)
- Secundair: Tijdstempel (oudste eerst bij gelijk aantal stemmen)

Weergave:

- Rankingnummer tonen
- Visuele indicatie van stemtelling
- Groepering per categorie behouden

---

### FV3: Sprint Retrospective - Discussie & Vastlegging

---

**FV3.1:** Discussie Modus per Item

Na de stemfase moet elk item besproken kunnen worden met vastlegging van de discussie.

Per item discussie:

- Rich text notities veld
- Gekoppelde actiepunten
- Eigenaar toewijzen aan actiepunten
- Status markering (besproken/niet besproken)

Facilitator controls:

- Item markeren als "nu bespreken"
- Timer per discussie (optioneel)
- Naar volgend item navigeren

---

**FV3.2:** Actiepunten Registratie

Concrete actiepunten moeten vastgelegd kunnen worden tijdens de discussie.

Per actiepunt:

- Beschrijving
- Toegewezen persoon
- Deadline (optioneel)
- Prioriteit (laag/gemiddeld/hoog)
- Status (open/in uitvoering/afgerond)

---

### FV4: AI Rapport Generatie & Weergave

---

**FV4.1:** Rapport Tab in Retrospective Interface

Het gegenereerde rapport moet worden gepresenteerd in een dedicated tab binnen de retrospective interface.

Tab structuur:

```
[Bord] [Stemmen] [Discussie] [Rapport]
```

Rapport tab features:

- Volledige breedte weergave voor leesbaarheid
- Markdown rendering met syntax highlighting
- Print-vriendelijke layout
- Kopieer naar klembord functie
- Download opties (Markdown, PDF)

---

**FV4.2:** Rapport Opslag & Real-time Synchronisatie

Na generatie moet het rapport worden opgeslagen en real-time zichtbaar zijn voor alle deelnemers in de sessie.

Opslag:

- Rapport wordt opgeslagen in database (`retrospective_reports` tabel)
- Gekoppeld aan sessie ID
- Bevat versie geschiedenis (optioneel voor v2)
- Tijdstempel van generatie

Real-time synchronisatie:

- Bij rapport generatie: broadcast naar alle deelnemers via Liveblocks
- Rapport tab toont automatisch het nieuwste rapport
- Indicator wanneer rapport wordt gegenereerd ("Rapport wordt gegenereerd...")
- Notificatie aan deelnemers wanneer rapport beschikbaar is

---

**FV4.3:** Automatische Rapport Generatie

Na afloop van de retrospective moet een AI-gegenereerd rapport beschikbaar zijn.

Rapport inhoud:

- Samenvatting van de retrospective
- Overzicht van alle input per categorie
- Top items op basis van stemmen
- Discussie highlights en besluiten
- Lijst van actiepunten met eigenaren

Rapport taal: **Nederlands** (standaard, configureerbaar)

---

**FV4.4:** Rapport Formaten

Het rapport moet in meerdere formaten beschikbaar zijn.

Ondersteunde formaten:

- Markdown (voor kopiëren/plakken naar tools)
- PDF (voor archivering)
- Slack/Teams bericht formaat (voor delen)

---

**FV4.5:** AI Prompt Configuratie

De AI prompt voor rapport generatie moet configureerbaar zijn.

Configureerbare aspecten:

- Toon (formeel/informeel)
- Taal (Nederlands/Engels)
- Focus gebieden
- Aangepaste instructies per team

---

## 3. Technische Overwegingen

---

### TO1: Project Structuur

Aanbevolen mappenstructuur voor schaalbaarheid:

```text
src/
├── app/                       # Next.js App Router
│   ├── (auth)/               # Auth-gerelateerde routes
│   ├── (dashboard)/          # Dashboard routes
│   ├── api/                  # API routes
│   └── retrospective/        # Retrospective feature routes
│       └── [id]/
│           └── page.tsx      # Retrospective sessie pagina met tabs
├── components/
│   ├── ui/                   # Shadcn componenten
│   └── features/             # Feature-specifieke componenten (v0.dev generated)
│       ├── retrospective/
│       │   ├── board.tsx         # Retrospective bord (v0.dev)
│       │   ├── item-card.tsx     # Item kaart met stemmen (v0.dev)
│       │   ├── voting-panel.tsx  # Stem paneel (v0.dev)
│       │   ├── discussion-view.tsx
│       │   └── report-tab.tsx    # Rapport tab weergave (v0.dev)
│       └── shared/
│           ├── presence-avatars.tsx  # Online gebruikers (v0.dev)
│           └── phase-indicator.tsx
├── lib/
│   ├── db/                   # Database schema & queries (Drizzle)
│   ├── ai/                   # OpenAI integratie
│   └── liveblocks/           # Liveblocks client setup
├── hooks/                    # Custom React hooks
├── types/                    # TypeScript type definities
└── utils/                    # Utility functies
```

---

### TO2: Database Schema (Drizzle + Vercel Postgres)

Kern entiteiten voor de retrospective feature:

```typescript
// src/lib/db/schema.ts
import { pgTable, uuid, varchar, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';

export const sessionStatusEnum = pgEnum('session_status', ['input', 'voting', 'discussion', 'completed']);
export const categoryEnum = pgEnum('category', ['went_well', 'to_improve', 'action_item']);
export const priorityEnum = pgEnum('priority', ['low', 'medium', 'high']);
export const actionStatusEnum = pgEnum('action_status', ['open', 'in_progress', 'done']);

export const retrospectiveSessions = pgTable('retrospective_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  sprintName: varchar('sprint_name', { length: 255 }),
  teamId: varchar('team_id', { length: 255 }),
  status: sessionStatusEnum('status').default('input'),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});

export const retrospectiveItems = pgTable('retrospective_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => retrospectiveSessions.id),
  category: categoryEnum('category').notNull(),
  content: text('content').notNull(),
  authorId: varchar('author_id', { length: 255 }),
  isAnonymous: boolean('is_anonymous').default(false),
  discussionNotes: text('discussion_notes'),
  isDiscussed: boolean('is_discussed').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

export const votes = pgTable('votes', {
  id: uuid('id').primaryKey().defaultRandom(),
  itemId: uuid('item_id').references(() => retrospectiveItems.id),
  oderId: varchar('user_id', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const actionItems = pgTable('action_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => retrospectiveSessions.id),
  sourceItemId: uuid('source_item_id').references(() => retrospectiveItems.id),
  description: text('description').notNull(),
  assigneeId: varchar('assignee_id', { length: 255 }),
  priority: priorityEnum('priority').default('medium'),
  status: actionStatusEnum('status').default('open'),
  dueDate: timestamp('due_date'),
  createdAt: timestamp('created_at').defaultNow(),
});

// NIEUW: Rapport opslag
export const retrospectiveReports = pgTable('retrospective_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => retrospectiveSessions.id).unique(),
  content: text('content').notNull(),           // Markdown inhoud
  generatedAt: timestamp('generated_at').defaultNow(),
  generatedBy: varchar('generated_by', { length: 255 }), // Gebruiker die generatie triggerde
});
```

---

### TO3: Liveblocks Room Structuur

Aanbevolen room structuur voor real-time communicatie inclusief rapport:

```typescript
// src/lib/liveblocks/config.ts
import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});

type Presence = {
  cursor: { x: number; y: number } | null;
  name: string;
  isTyping: boolean;
  currentTab: "board" | "voting" | "discussion" | "report";
};

type Storage = {
  items: LiveList<RetrospectiveItem>;
  votes: LiveMap<string, string[]>;
  phase: "input" | "voting" | "discussion" | "completed";
  report: {
    content: string | null;
    isGenerating: boolean;
    generatedAt: string | null;
  };
};

export const {
  RoomProvider,
  useOthers,
  useUpdateMyPresence,
  useStorage,
  useMutation,
  useBroadcastEvent,
  useEventListener,
} = createRoomContext<Presence, Storage>(client);
```

---

### TO4: Rapport Tab Component (v0.dev Gegenereerd)

Voorbeeld structuur voor rapport tab component:

```typescript
// src/components/features/retrospective/report-tab.tsx
"use client";

import { useStorage } from "@/lib/liveblocks/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Copy, RefreshCw, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";

export function ReportTab({ sessionId }: { sessionId: string }) {
  const report = useStorage((root) => root.report);

  if (report.isGenerating) {
    return <ReportSkeleton />;
  }

  if (!report.content) {
    return <GenerateReportPrompt sessionId={sessionId} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Retrospective Rapport</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Copy className="w-4 h-4 mr-2" />
            Kopiëren
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="prose prose-sm max-w-none p-6">
          <ReactMarkdown>{report.content}</ReactMarkdown>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Gegenereerd op: {new Date(report.generatedAt).toLocaleString('nl-NL')}
      </p>
    </div>
  );
}
```

---

### TO5: API Route Structuur

```text
/api/retrospective
  POST   /                     - Nieuwe sessie aanmaken
  GET    /:id                  - Sessie ophalen
  PATCH  /:id                  - Sessie bijwerken (status, instellingen)
  DELETE /:id                  - Sessie verwijderen

/api/retrospective/:id/items
  POST   /                     - Item toevoegen
  PATCH  /:itemId              - Item bijwerken
  DELETE /:itemId              - Item verwijderen

/api/retrospective/:id/votes
  POST   /                     - Stem toevoegen
  DELETE /:itemId              - Stem verwijderen

/api/retrospective/:id/report
  POST   /                     - AI rapport genereren & opslaan
  GET    /                     - Rapport ophalen

/api/liveblocks-auth
  POST   /                     - Liveblocks authenticatie
```

---

### TO6: Environment Variables

Vereiste environment variables:

```env
# Vercel Postgres (automatisch beschikbaar via Vercel)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=

# Liveblocks
LIVEBLOCKS_SECRET_KEY=sk_...
NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY=pk_...

# OpenAI
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=https://scrumkit.vercel.app
```

---

### TO7: v0.dev Component Generatie Workflow

Gebruik de volgende prompts op [v0.dev](https://v0.dev) voor het genereren van professionele componenten:

**Retrospective Board:**
```
Maak een Kanban-achtig bord met 3 kolommen: "Ging Goed" (groen), "Kan Beter" (oranje), "Actiepunten" (blauw).
Elke kolom bevat kaarten met tekst en een stem-counter. Gebruik Shadcn/UI componenten en Tailwind.
Voeg een "+" knop toe per kolom om nieuwe items toe te voegen.
```

**Rapport Tab:**
```
Maak een rapport weergave component met:
- Header met titel "Retrospective Rapport" en actieknoppen (kopiëren, download PDF)
- Markdown content gebied met mooie typografie
- Footer met generatie timestamp
- Loading skeleton state
- Lege state met "Genereer Rapport" knop
Gebruik Shadcn/UI en Tailwind. Nederlandse labels.
```

**Presence Avatars:**
```
Maak een avatar stack component die online gebruikers toont.
- Circulaire avatars met initialen
- Overlappende layout (max 5 zichtbaar, "+3" indicator voor meer)
- Groene online indicator dot
- Tooltip met naam bij hover
Gebruik Shadcn/UI Avatar component.
```

---

### TO8: Security Overwegingen

- API keys alleen server-side gebruiken
- Input sanitization voor alle gebruikerscontent
- Rate limiting op API endpoints
- Liveblocks authenticatie voor room toegang
- Sessie toegang valideren (alleen teamleden met link)

---

## 4. Buiten Scope (voor deze versie)

- **Gebruikersauthenticatie** - Eerste versie werkt met anonieme sessies of simpele naam-invoer. Volledige auth (NextAuth.js/Clerk) komt in v2.
- **Team Beheer** - Geen team aanmaak, ledenbeheer, of permissies. Teams worden later toegevoegd.
- **Historische Data & Trends** - Vergelijking met vorige retrospectives wordt niet geïmplementeerd in v1.
- **Integraties** - Geen Jira, Slack, Teams, of andere tool integraties.
- **Mobiele App** - Alleen responsive web, geen native apps.
- **Offline Ondersteuning** - Vereist internetverbinding voor real-time functionaliteit.
- **Aangepaste Retrospective Formats** - Alleen standaard 3-kolom format (Ging Goed, Kan Beter, Actiepunten).
- **Timer Functionaliteit** - Discussie timers worden later toegevoegd.
- **Export naar externe tools** - Alleen in-app rapport generatie, geen directe export naar Confluence/Notion etc.
- **Meertalige UI** - Interface in Nederlands voor v1, Engels als toekomstige optie.

---

## 5. Succescriteria

### Functionele Acceptatiecriteria

- [ ] Gebruiker kan een nieuwe retrospective sessie aanmaken en een deelbare link ontvangen
- [ ] Meerdere gebruikers kunnen tegelijkertijd items toevoegen die real-time zichtbaar zijn voor alle deelnemers
- [ ] Liveblocks presence toont welke teamleden online zijn
- [ ] Gebruikers kunnen stemmen uitbrengen met correct stemlimiet beheer
- [ ] Items worden automatisch gesorteerd op stemtelling
- [ ] Discussie notities kunnen worden toegevoegd en zijn real-time zichtbaar
- [ ] Actiepunten kunnen worden aangemaakt met toegewezen persoon en prioriteit
- [ ] AI genereert een coherent Nederlandstalig rapport na afloop van de sessie
- [ ] **Rapport wordt getoond in dedicated tab**
- [ ] **Rapport wordt opgeslagen in database**
- [ ] **Rapport is real-time zichtbaar voor alle deelnemers in de sessie**
- [ ] Rapport is downloadbaar in Markdown en PDF formaat

### Technische Acceptatiecriteria

- [ ] Project draait succesvol met `bun dev`
- [ ] Turbopack wordt gebruikt als bundler
- [ ] Deployment naar Vercel werkt zonder fouten
- [ ] Vercel Postgres connectie werkt correct
- [ ] Liveblocks real-time synchronisatie werkt (inclusief rapport updates)
- [ ] Database migraties draaien succesvol
- [ ] Alle API endpoints retourneren correcte HTTP status codes
- [ ] TypeScript compileert zonder fouten
- [ ] ESLint toont geen fouten
- [ ] v0.dev gegenereerde componenten zijn geïntegreerd

### Performance Criteria

- [ ] Initiële pagina laadtijd < 3 seconden
- [ ] Real-time updates binnen 500ms (Liveblocks)
- [ ] AI rapport generatie < 30 seconden
- [ ] Ondersteunt minimaal 10 gelijktijdige gebruikers per sessie

---

## 6. Bronnen & Referenties

- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [v0.dev - Vercel AI UI Generator](https://v0.dev)
- [v0.dev Review 2025](https://skywork.ai/blog/vercel-v0-review-2025-ai-ui-code-generation-nextjs/)
- [Liveblocks Starter Kit - Vercel](https://vercel.com/templates/next.js/liveblocks-starter-kit)
- [Liveblocks + Vercel Postgres Sync](https://liveblocks.io/docs/guides/how-to-synchronize-your-liveblocks-storage-document-data-to-a-vercel-postgres-database)
- [Vercel Postgres Documentatie](https://vercel.com/docs/storage/vercel-postgres)
- [Drizzle ORM Documentatie](https://orm.drizzle.team/)
- [Shadcn/UI Next.js Installatie](https://ui.shadcn.com/docs/installation/next)
