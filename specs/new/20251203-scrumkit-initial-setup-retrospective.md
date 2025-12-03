# Product Requirements Document: Scrumkit - Initial Setup & Sprint Retrospective

## 1. Feature Overzicht

**Feature:** Scrumkit Initial Project Setup met Sprint Retrospective Tool

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

- **Turbopack** als default bundler (stabiel voor dev én production)
- **React 19.2** met View Transitions, `useEffectEvent()`, en Activity
- **React Compiler 1.0** voor automatische memoization
- **proxy.ts** als vervanging voor middleware (nieuwe network boundary)

Vereiste configuraties:

- Node.js 20.9+ (minimum vereiste voor Next.js 16)
- TypeScript 5.1+ met strict mode
- App Router (geen Pages Router)
- `src/` directory structuur
- Import alias `@/*` voor cleane imports

---

**FV1.2:** Shadcn/UI Integratie

Het project moet Shadcn/UI gebruiken als component library met Tailwind CSS voor styling.

```bash
bunx shadcn@latest init
```

Vereiste componenten voor retrospective feature (installeren via CLI):

```bash
bunx shadcn@latest add button card input textarea dialog sheet dropdown-menu avatar badge tooltip skeleton
```

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

Drizzle ORM versie: **0.44.7** (stable)

---

**FV1.4:** Real-time Infrastructuur met Liveblocks

Het project gebruikt Liveblocks voor real-time functionaliteit. Liveblocks is Vercel's aanbevolen partner voor real-time collaboration (Vercel gebruikt dit zelf voor hun Ship livestream).

```bash
bun add @liveblocks/client @liveblocks/react
```

Liveblocks voordelen:

- Officiële Vercel templates en documentatie
- Native Vercel Postgres synchronisatie support
- Presence awareness out-of-the-box
- Conflict-free data store (Storage)
- Gebouwd voor collaboration use-cases

Documentatie: [Liveblocks + Vercel Postgres sync](https://liveblocks.io/docs/guides/how-to-synchronize-your-liveblocks-storage-document-data-to-a-vercel-postgres-database)

---

**FV1.5:** OpenAI Integratie

Het project moet OpenAI SDK integreren voor AI-gegenereerde retrospective rapporten.

```bash
bun add openai
```

Configuratie:

- Environment variable `OPENAI_API_KEY`
- Server-side only API calls (geen client-side exposure van API key)
- Rate limiting en error handling

---

### FV2: Sprint Retrospective - Core Functionaliteit

---

**FV2.1:** Retrospective Sessie Aanmaken

Een gebruiker moet een nieuwe retrospective sessie kunnen aanmaken voor een sprint.

Vereiste velden:

- Sessie naam (verplicht)
- Sprint nummer/naam (optioneel)
- Team identifier (voor toekomstige multi-team support)

Output:

- Unieke sessie ID (UUID)
- Deelbare link voor teamleden
- QR code voor makkelijke toegang (optioneel)

---

**FV2.2:** Input Toevoegen door Teamleden

Elk teamlid moet input kunnen toevoegen aan de retrospective in categorieën.

Standaard categorieën (configureerbaar):

- **Went Well** (Wat ging goed)
- **To Improve** (Wat kan beter)
- **Action Items** (Actiepunten)

Per input item:

- Tekst content (max 500 karakters)
- Categorie selectie
- Auteur (anoniem optie beschikbaar)
- Timestamp

---

**FV2.3:** Real-time Synchronisatie met Liveblocks

Alle wijzigingen moeten real-time gesynchroniseerd worden tussen alle deelnemers via Liveblocks.

Real-time events:

- Nieuwe input toegevoegd
- Input gewijzigd/verwijderd
- Vote toegevoegd/verwijderd
- Discussie notities bijgewerkt
- Deelnemer joined/left

Presence awareness (Liveblocks native):

- Toon welke teamleden online zijn
- Toon wie momenteel aan het typen is
- Cursors van andere gebruikers (optioneel)

---

**FV2.4:** Voting Systeem

Teamleden moeten kunnen stemmen op input items om prioriteit te bepalen.

Voting regels:

- Elk teamlid heeft een configureerbaar aantal votes (default: 5)
- Meerdere votes op hetzelfde item toegestaan
- Eigen items mogen gevoted worden
- Votes zijn zichtbaar voor iedereen (of hidden tot voting fase eindigt - configureerbaar)

---

**FV2.5:** Automatische Ordening op Votes

Items moeten automatisch geordend worden op basis van het aantal votes.

Sorteerlogica:

- Primair: Aantal votes (hoogste eerst)
- Secundair: Timestamp (oudste eerst bij gelijk aantal votes)

Weergave:

- Ranking nummer tonen
- Visuele indicatie van vote count
- Groupering per categorie behouden

---

### FV3: Sprint Retrospective - Discussie & Vastlegging

---

**FV3.1:** Discussie Modus per Item

Na de voting fase moet elk item besproken kunnen worden met vastlegging van de discussie.

Per item discussie:

- Rich text notities veld
- Gekoppelde action items
- Eigenaar toewijzen aan action items
- Status markering (besproken/niet besproken)

Facilitator controls:

- Item markeren als "nu bespreken"
- Timer per discussie (optioneel)
- Naar volgend item navigeren

---

**FV3.2:** Action Items Registratie

Concrete actiepunten moeten vastgelegd kunnen worden tijdens de discussie.

Per action item:

- Beschrijving
- Toegewezen persoon
- Deadline (optioneel)
- Prioriteit (low/medium/high)
- Status (open/in progress/done)

---

### FV4: AI Rapport Generatie

---

**FV4.1:** Automatische Rapport Generatie

Na afloop van de retrospective moet een AI-gegenereerd rapport beschikbaar zijn.

Rapport inhoud:

- Samenvatting van de retrospective
- Overzicht van alle input per categorie
- Top items op basis van votes
- Discussie highlights en besluiten
- Lijst van action items met eigenaren
- Trends vergeleken met vorige retrospectives (toekomstige feature)

---

**FV4.2:** Rapport Formaten

Het rapport moet in meerdere formaten beschikbaar zijn.

Ondersteunde formaten:

- Markdown (voor copy/paste naar tools)
- PDF (voor archivering)
- Slack/Teams message format (voor delen)

---

**FV4.3:** AI Prompt Configuratie

De AI prompt voor rapport generatie moet configureerbaar zijn.

Configureerbare aspecten:

- Toon (formeel/informeel)
- Taal (Nederlands/Engels)
- Focus gebieden
- Custom instructies per team

---

## 3. Technische Overwegingen

---

### TO1: Project Structuur

Aanbevolen mappenstructuur voor schaalbaarheid:

```text
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth-gerelateerde routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── api/               # API routes
│   └── retrospective/     # Retrospective feature routes
├── components/
│   ├── ui/                # Shadcn components
│   └── features/          # Feature-specifieke components
├── lib/
│   ├── db/                # Database schema & queries (Drizzle)
│   ├── ai/                # OpenAI integratie
│   └── liveblocks/        # Liveblocks client setup
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
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
```

---

### TO3: Liveblocks Room Structuur

Aanbevolen room structuur voor real-time communicatie:

```typescript
// src/lib/liveblocks/config.ts
import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});

// Room type per retrospective sessie
type Presence = {
  cursor: { x: number; y: number } | null;
  name: string;
  isTyping: boolean;
};

type Storage = {
  items: LiveList<RetrospectiveItem>;
  votes: LiveMap<string, string[]>; // itemId -> userIds
  phase: "input" | "voting" | "discussion" | "completed";
};

export const {
  RoomProvider,
  useOthers,
  useUpdateMyPresence,
  useStorage,
  useMutation,
} = createRoomContext<Presence, Storage>(client);
```

---

### TO4: API Route Structuur

```text
/api/retrospective
  POST   /                     - Nieuwe sessie aanmaken
  GET    /:id                  - Sessie ophalen
  PATCH  /:id                  - Sessie updaten (status, settings)
  DELETE /:id                  - Sessie verwijderen

/api/retrospective/:id/items
  POST   /                     - Item toevoegen
  PATCH  /:itemId              - Item updaten
  DELETE /:itemId              - Item verwijderen

/api/retrospective/:id/votes
  POST   /                     - Vote toevoegen
  DELETE /:itemId              - Vote verwijderen

/api/retrospective/:id/report
  POST   /                     - AI rapport genereren
  GET    /                     - Rapport ophalen

/api/liveblocks-auth
  POST   /                     - Liveblocks authentication
```

---

### TO5: Environment Variables

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

### TO6: Security Overwegingen

- API keys alleen server-side gebruiken
- Input sanitization voor alle user content
- Rate limiting op API endpoints
- Liveblocks authentication voor room toegang
- Sessie toegang valideren (alleen teamleden met link)

---

## 4. Buiten Scope (voor deze versie)

- **User Authentication** - Eerste versie werkt met anonieme sessies of simpele naam-invoer. Volledige auth (NextAuth.js/Clerk) komt in v2.
- **Team Management** - Geen team aanmaak, leden beheer, of permissies. Teams worden later toegevoegd.
- **Historische Data & Trends** - Vergelijking met vorige retrospectives wordt niet geïmplementeerd in v1.
- **Integraties** - Geen Jira, Slack, Teams, of andere tool integraties.
- **Mobile App** - Alleen responsive web, geen native apps.
- **Offline Support** - Vereist internetverbinding voor real-time functionaliteit.
- **Custom Retrospective Formats** - Alleen standaard 3-kolom format (Went Well, To Improve, Action Items).
- **Timer Functionaliteit** - Discussie timers worden later toegevoegd.
- **Export naar externe tools** - Alleen in-app rapport generatie, geen directe export naar Confluence/Notion etc.
- **Multi-language UI** - Interface alleen in Engels voor v1.

---

## 5. Succescriteria

### Functionele Acceptatiecriteria

- [ ] Gebruiker kan een nieuwe retrospective sessie aanmaken en een deelbare link ontvangen
- [ ] Meerdere gebruikers kunnen tegelijkertijd items toevoegen die real-time zichtbaar zijn voor alle deelnemers
- [ ] Liveblocks presence toont welke teamleden online zijn
- [ ] Gebruikers kunnen votes uitbrengen met correct vote-limiet beheer
- [ ] Items worden automatisch gesorteerd op vote count
- [ ] Discussie notities kunnen worden toegevoegd en zijn real-time zichtbaar
- [ ] Action items kunnen worden aangemaakt met assignee en prioriteit
- [ ] AI genereert een coherent rapport na afloop van de sessie
- [ ] Rapport is downloadbaar in minimaal Markdown formaat

### Technische Acceptatiecriteria

- [ ] Project draait succesvol met `bun dev`
- [ ] Turbopack wordt gebruikt als bundler
- [ ] Deployment naar Vercel werkt zonder errors
- [ ] Vercel Postgres connectie werkt correct
- [ ] Liveblocks real-time synchronisatie werkt
- [ ] Database migraties draaien succesvol
- [ ] Alle API endpoints retourneren correcte HTTP status codes
- [ ] TypeScript compileert zonder errors
- [ ] ESLint toont geen errors

### Performance Criteria

- [ ] Initiële page load < 3 seconden
- [ ] Real-time updates binnen 500ms (Liveblocks)
- [ ] AI rapport generatie < 30 seconden
- [ ] Ondersteunt minimaal 10 gelijktijdige gebruikers per sessie

---

## 6. Bronnen & Referenties

- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Liveblocks Starter Kit - Vercel](https://vercel.com/templates/next.js/liveblocks-starter-kit)
- [Liveblocks + Vercel Postgres Sync](https://liveblocks.io/docs/guides/how-to-synchronize-your-liveblocks-storage-document-data-to-a-vercel-postgres-database)
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Shadcn/UI Next.js Installation](https://ui.shadcn.com/docs/installation/next)
- [How Vercel Used Liveblocks for Ship](https://liveblocks.io/blog/how-vercel-used-live-reactions-to-improve-engagement-on-their-vercel-ship-livestream)
