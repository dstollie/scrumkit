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

**FV1.4:** Real-time Infrastructuur met Server-Sent Events (SSE)

Het project gebruikt Server-Sent Events (SSE) voor real-time functionaliteit. SSE is een native browser API die eenrichtings real-time communicatie van server naar client mogelijk maakt zonder externe dependencies.

**Geen extra packages nodig** - SSE werkt native met Next.js API routes.

SSE voordelen:

- Geen externe services of kosten
- Native browser ondersteuning
- Eenvoudige implementatie met Next.js API routes
- Lichtgewicht en efficiënt
- Automatische reconnect bij verbindingsverlies
- Werkt perfect met Vercel serverless

SSE architectuur:

- **Server → Client:** SSE stream voor real-time updates
- **Client → Server:** Reguliere POST/PATCH requests voor mutaties
- Database als "source of truth" voor synchronisatie

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

**FV2.3:** Real-time Synchronisatie met SSE

Alle wijzigingen moeten real-time gesynchroniseerd worden tussen alle deelnemers via Server-Sent Events.

Real-time events (via SSE):

- `item:created` - Nieuwe input toegevoegd
- `item:updated` - Input gewijzigd
- `item:deleted` - Input verwijderd
- `vote:added` - Stem toegevoegd
- `vote:removed` - Stem verwijderd
- `discussion:updated` - Discussie notities bijgewerkt
- `phase:changed` - Sessie fase gewijzigd
- `report:generated` - Rapport gegenereerd
- `participant:joined` - Deelnemer toegetreden
- `participant:left` - Deelnemer vertrokken

Presence tracking:

- Heartbeat mechanisme (elke 30 seconden)
- Toon welke teamleden online zijn
- Automatische cleanup bij disconnect

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

```text
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

Real-time synchronisatie (via SSE):

- Bij rapport generatie: `report:generated` event naar alle deelnemers
- Rapport tab toont automatisch het nieuwste rapport
- Indicator wanneer rapport wordt gegenereerd ("Rapport wordt gegenereerd...")
- Automatische refresh van rapport tab bij ontvangst van event

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
│   │   └── retrospective/
│   │       ├── route.ts              # POST: nieuwe sessie
│   │       └── [id]/
│   │           ├── route.ts          # GET, PATCH, DELETE sessie
│   │           ├── stream/
│   │           │   └── route.ts      # SSE endpoint
│   │           ├── items/
│   │           │   └── route.ts      # Items CRUD
│   │           ├── votes/
│   │           │   └── route.ts      # Votes CRUD
│   │           └── report/
│   │               └── route.ts      # Rapport generatie
│   └── retrospective/        # Retrospective feature routes
│       └── [id]/
│           └── page.tsx      # Retrospective sessie pagina met tabs
├── components/
│   ├── ui/                   # Shadcn componenten
│   └── features/             # Feature-specifieke componenten (v0.dev generated)
│       ├── retrospective/
│       │   ├── board.tsx             # Retrospective bord (v0.dev)
│       │   ├── item-card.tsx         # Item kaart met stemmen (v0.dev)
│       │   ├── voting-panel.tsx      # Stem paneel (v0.dev)
│       │   ├── discussion-view.tsx
│       │   └── report-tab.tsx        # Rapport tab weergave (v0.dev)
│       └── shared/
│           ├── presence-avatars.tsx  # Online gebruikers (v0.dev)
│           └── phase-indicator.tsx
├── lib/
│   ├── db/                   # Database schema & queries (Drizzle)
│   ├── ai/                   # OpenAI integratie
│   └── sse/                  # SSE utilities
│       ├── client.ts         # Client-side SSE hook
│       └── server.ts         # Server-side SSE helpers
├── hooks/
│   ├── use-sse.ts            # SSE connection hook
│   └── use-retrospective.ts  # Retrospective state hook
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

// Rapport opslag
export const retrospectiveReports = pgTable('retrospective_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => retrospectiveSessions.id).unique(),
  content: text('content').notNull(),
  generatedAt: timestamp('generated_at').defaultNow(),
  generatedBy: varchar('generated_by', { length: 255 }),
});

// Participant tracking voor presence
export const sessionParticipants = pgTable('session_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  sessionId: uuid('session_id').references(() => retrospectiveSessions.id),
  oderId: varchar('user_id', { length: 255 }).notNull(),
  userName: varchar('user_name', { length: 255 }).notNull(),
  lastSeen: timestamp('last_seen').defaultNow(),
  isOnline: boolean('is_online').default(true),
});
```

---

### TO3: SSE Implementatie

**Server-side SSE Route:**

```typescript
// src/app/api/retrospective/[id]/stream/route.ts
import { NextRequest } from 'next/server';

// In-memory store voor SSE connections (per sessie)
const sessions = new Map<string, Set<ReadableStreamDefaultController>>();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const sessionId = params.id;

  const stream = new ReadableStream({
    start(controller) {
      // Voeg controller toe aan sessie
      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, new Set());
      }
      sessions.get(sessionId)!.add(controller);

      // Stuur initiële connectie bevestiging
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));
    },
    cancel(controller) {
      // Verwijder controller bij disconnect
      sessions.get(sessionId)?.delete(controller);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// Helper functie om events te broadcasen
export function broadcastToSession(sessionId: string, event: SSEEvent) {
  const controllers = sessions.get(sessionId);
  if (!controllers) return;

  const encoder = new TextEncoder();
  const message = `data: ${JSON.stringify(event)}\n\n`;

  controllers.forEach((controller) => {
    try {
      controller.enqueue(encoder.encode(message));
    } catch {
      // Controller is gesloten, verwijderen
      controllers.delete(controller);
    }
  });
}

type SSEEvent = {
  type: 'item:created' | 'item:updated' | 'item:deleted' |
        'vote:added' | 'vote:removed' |
        'discussion:updated' | 'phase:changed' |
        'report:generated' | 'participant:joined' | 'participant:left';
  payload: unknown;
};
```

**Client-side SSE Hook:**

```typescript
// src/hooks/use-sse.ts
'use client';

import { useEffect, useCallback, useRef } from 'react';

type SSEEvent = {
  type: string;
  payload: unknown;
};

export function useSSE(
  sessionId: string,
  onEvent: (event: SSEEvent) => void
) {
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    const eventSource = new EventSource(`/api/retrospective/${sessionId}/stream`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as SSEEvent;
        onEvent(data);
      } catch (error) {
        console.error('SSE parse error:', error);
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
      // Reconnect na 3 seconden
      setTimeout(connect, 3000);
    };

    eventSourceRef.current = eventSource;
  }, [sessionId, onEvent]);

  useEffect(() => {
    connect();

    return () => {
      eventSourceRef.current?.close();
    };
  }, [connect]);
}
```

---

### TO4: Retrospective State Hook

```typescript
// src/hooks/use-retrospective.ts
'use client';

import { useState, useCallback } from 'react';
import { useSSE } from './use-sse';

type RetrospectiveState = {
  items: RetrospectiveItem[];
  votes: Vote[];
  participants: Participant[];
  report: Report | null;
  phase: 'input' | 'voting' | 'discussion' | 'completed';
};

export function useRetrospective(sessionId: string, initialData: RetrospectiveState) {
  const [state, setState] = useState<RetrospectiveState>(initialData);

  const handleSSEEvent = useCallback((event: SSEEvent) => {
    switch (event.type) {
      case 'item:created':
        setState((prev) => ({
          ...prev,
          items: [...prev.items, event.payload as RetrospectiveItem],
        }));
        break;

      case 'item:deleted':
        setState((prev) => ({
          ...prev,
          items: prev.items.filter((item) => item.id !== event.payload.id),
        }));
        break;

      case 'vote:added':
        setState((prev) => ({
          ...prev,
          votes: [...prev.votes, event.payload as Vote],
        }));
        break;

      case 'report:generated':
        setState((prev) => ({
          ...prev,
          report: event.payload as Report,
        }));
        break;

      case 'phase:changed':
        setState((prev) => ({
          ...prev,
          phase: event.payload.phase,
        }));
        break;

      case 'participant:joined':
        setState((prev) => ({
          ...prev,
          participants: [...prev.participants, event.payload as Participant],
        }));
        break;

      // ... andere event handlers
    }
  }, []);

  useSSE(sessionId, handleSSEEvent);

  return state;
}
```

---

### TO5: API Route Structuur

```text
/api/retrospective
  POST   /                         - Nieuwe sessie aanmaken

/api/retrospective/:id
  GET    /                         - Sessie ophalen met alle data
  PATCH  /                         - Sessie bijwerken (status, instellingen)
  DELETE /                         - Sessie verwijderen

/api/retrospective/:id/stream
  GET    /                         - SSE endpoint voor real-time updates

/api/retrospective/:id/items
  POST   /                         - Item toevoegen (broadcast: item:created)
  PATCH  /:itemId                  - Item bijwerken (broadcast: item:updated)
  DELETE /:itemId                  - Item verwijderen (broadcast: item:deleted)

/api/retrospective/:id/votes
  POST   /                         - Stem toevoegen (broadcast: vote:added)
  DELETE /:itemId                  - Stem verwijderen (broadcast: vote:removed)

/api/retrospective/:id/report
  POST   /                         - AI rapport genereren (broadcast: report:generated)
  GET    /                         - Rapport ophalen

/api/retrospective/:id/participants
  POST   /                         - Deelnemer registreren (broadcast: participant:joined)
  DELETE /:userId                  - Deelnemer verwijderen (broadcast: participant:left)
  PATCH  /heartbeat                - Heartbeat update
```

---

### TO6: Environment Variables

Vereiste environment variables:

```env
# Vercel Postgres (automatisch beschikbaar via Vercel)
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=

# OpenAI
OPENAI_API_KEY=sk-...

# App
NEXT_PUBLIC_APP_URL=https://scrumkit.vercel.app
```

---

### TO7: v0.dev Component Generatie Workflow

Gebruik de volgende prompts op [v0.dev](https://v0.dev) voor het genereren van professionele componenten:

**Retrospective Board:**

```text
Maak een Kanban-achtig bord met 3 kolommen: "Ging Goed" (groen), "Kan Beter" (oranje), "Actiepunten" (blauw).
Elke kolom bevat kaarten met tekst en een stem-counter. Gebruik Shadcn/UI componenten en Tailwind.
Voeg een "+" knop toe per kolom om nieuwe items toe te voegen.
```

**Rapport Tab:**

```text
Maak een rapport weergave component met:
- Header met titel "Retrospective Rapport" en actieknoppen (kopiëren, download PDF)
- Markdown content gebied met mooie typografie
- Footer met generatie timestamp
- Loading skeleton state
- Lege state met "Genereer Rapport" knop
Gebruik Shadcn/UI en Tailwind. Nederlandse labels.
```

**Presence Avatars:**

```text
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
- Sessie toegang valideren via sessie ID in URL (link-based access)
- SSE endpoints beveiligen tegen misbruik
- Heartbeat timeout voor automatische participant cleanup

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
- [ ] SSE-gebaseerde presence toont welke teamleden online zijn
- [ ] Gebruikers kunnen stemmen uitbrengen met correct stemlimiet beheer
- [ ] Items worden automatisch gesorteerd op stemtelling
- [ ] Discussie notities kunnen worden toegevoegd en zijn real-time zichtbaar
- [ ] Actiepunten kunnen worden aangemaakt met toegewezen persoon en prioriteit
- [ ] AI genereert een coherent Nederlandstalig rapport na afloop van de sessie
- [ ] **Rapport wordt getoond in dedicated tab**
- [ ] **Rapport wordt opgeslagen in database**
- [ ] **Rapport is real-time zichtbaar voor alle deelnemers via SSE**
- [ ] Rapport is downloadbaar in Markdown en PDF formaat

### Technische Acceptatiecriteria

- [ ] Project draait succesvol met `bun dev`
- [ ] Turbopack wordt gebruikt als bundler
- [ ] Deployment naar Vercel werkt zonder fouten
- [ ] Vercel Postgres connectie werkt correct
- [ ] SSE real-time synchronisatie werkt correct
- [ ] SSE reconnect werkt bij verbindingsverlies
- [ ] Database migraties draaien succesvol
- [ ] Alle API endpoints retourneren correcte HTTP status codes
- [ ] TypeScript compileert zonder fouten
- [ ] ESLint toont geen fouten
- [ ] v0.dev gegenereerde componenten zijn geïntegreerd

### Performance Criteria

- [ ] Initiële pagina laadtijd < 3 seconden
- [ ] SSE event delivery < 500ms
- [ ] AI rapport generatie < 30 seconden
- [ ] Ondersteunt minimaal 10 gelijktijdige gebruikers per sessie

---

## 6. Bronnen & Referenties

- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [MDN: Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- [Next.js Streaming with SSE](https://nextjs.org/docs/app/building-your-application/routing/route-handlers#streaming)
- [v0.dev - Vercel AI UI Generator](https://v0.dev)
- [Vercel Postgres Documentatie](https://vercel.com/docs/storage/vercel-postgres)
- [Drizzle ORM Documentatie](https://orm.drizzle.team/)
- [Shadcn/UI Next.js Installatie](https://ui.shadcn.com/docs/installation/next)
