# ScrumKit Architecture

## Overview

ScrumKit is een real-time retrospective tool gebouwd met Next.js 16 (App Router) en React 19. De applicatie faciliteert team retrospectives met een Mad/Sad/Glad board structuur, voting systeem, en AI-gegenereerde samenvattingen.

## Tech Stack

| Component | Technologie |
|-----------|------------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Frontend | React 19, Tailwind CSS 4 |
| UI Components | Radix UI + shadcn/ui |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Real-time | Server-Sent Events (SSE) |
| AI | OpenAI API |

## Directory Structure

```
src/
├── app/
│   ├── api/retrospective/     # REST API routes
│   ├── retrospective/[id]/    # Retrospective detail page
│   └── page.tsx               # Home page (create retro)
├── components/
│   ├── features/              # Feature components (retro board, action items)
│   └── ui/                    # shadcn/ui components
├── hooks/                     # React hooks (SSE subscription)
├── lib/
│   ├── ai/                    # OpenAI integration
│   ├── db/                    # Database schema & connection
│   └── sse/                   # Server-Sent Events infrastructure
└── types/                     # TypeScript type definitions
```

## Data Model

### Core Entities

```
RetrospectiveSession
├── id (uuid)
├── name
├── sprintName
├── status: input | voting | discussion | completed
├── votesPerUser (default: 5)
└── hideVotesUntilComplete

RetrospectiveItem
├── id (uuid)
├── sessionId → RetrospectiveSession
├── category: went_well | to_improve | action_item
├── content
├── authorId, authorName
├── isAnonymous
└── voteCount (computed)

Vote
├── id (uuid)
├── itemId → RetrospectiveItem
└── userId

ActionItem
├── id (uuid)
├── sessionId → RetrospectiveSession
├── sourceItemId → RetrospectiveItem (optional)
├── description
├── assigneeId, assigneeName
├── priority: low | medium | high
└── status: open | in_progress | done
```

### Session Status Flow

```
input → voting → discussion → completed
```

- **input**: Deelnemers voegen items toe
- **voting**: Deelnemers stemmen op items
- **discussion**: Team bespreekt top-voted items
- **completed**: Sessie afgerond

## Real-time Architecture

### Server-Sent Events (SSE)

De applicatie gebruikt SSE voor real-time updates. Dit is een simpelere oplossing dan WebSockets voor unidirectionele server→client communicatie.

**Event Types:**
- `item:added`, `item:updated`, `item:deleted`
- `vote:added`, `vote:removed`
- `session:updated`
- `action:added`, `action:updated`, `action:deleted`
- `connected`

**Server-side (event-emitter.ts):**
```typescript
// In-memory pub/sub per session
sessionEmitter.emit(sessionId, { type: 'item:added', data: item });
```

**Client-side (use-retrospective-events.ts):**
```typescript
useRetrospectiveEvents(sessionId, {
  'item:added': (data) => handleNewItem(data),
  'vote:added': (data) => handleVote(data),
});
```

**Productie opmerking:** De huidige implementatie gebruikt in-memory pub/sub. Voor multi-instance deployments moet dit vervangen worden door Redis pub/sub.

## API Routes

| Method | Route | Beschrijving |
|--------|-------|--------------|
| POST | `/api/retrospective` | Create session |
| GET | `/api/retrospective/[id]` | Get session with items |
| PATCH | `/api/retrospective/[id]` | Update session status |
| GET | `/api/retrospective/[id]/events` | SSE endpoint |
| POST | `/api/retrospective/[id]/items` | Add item |
| DELETE | `/api/retrospective/[id]/items/[itemId]` | Delete item |
| POST | `/api/retrospective/[id]/votes` | Add vote |
| DELETE | `/api/retrospective/[id]/votes` | Remove vote |
| POST | `/api/retrospective/[id]/actions` | Create action item |
| PATCH | `/api/retrospective/[id]/actions/[actionId]` | Update action item |
| POST | `/api/retrospective/[id]/report` | Generate AI report |

## AI Integration

De report generator gebruikt OpenAI om samenvattingen te genereren van retrospective sessies:

- Analyseert items per categorie
- Identificeert patronen en thema's
- Genereert aanbevelingen voor verbetering
- Vat actiepunten samen

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://..."

# OpenAI
OPENAI_API_KEY="sk-..."
```
