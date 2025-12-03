# SSE Real-time Patterns

Server-Sent Events (SSE) implementatie patronen voor real-time functionaliteit in ScrumKit.

## Wanneer SSE vs WebSockets

**Gebruik SSE wanneer:**
- Data alleen van server → client stroomt
- Je simpele reconnect logica wilt (browsers doen dit automatisch)
- Je HTTP/2 multiplexing wilt benutten
- Geen bidirectionele communicatie nodig is

**Gebruik WebSockets wanneer:**
- Bidirectionele communicatie nodig is (client → server → client)
- Zeer lage latency vereist is
- Binaire data gestreamd moet worden

In ScrumKit is SSE voldoende omdat alle user actions via REST API gaan en alleen de broadcasts server→client zijn.

## Server-side Implementatie

### Event Emitter Pattern

```typescript
// src/lib/sse/event-emitter.ts
class SessionEventEmitter {
  private listeners: Map<string, Set<Listener>> = new Map();

  subscribe(sessionId: string, listener: Listener): () => void {
    // Return unsubscribe function voor cleanup
  }

  emit(sessionId: string, event: { type: string; data: unknown }): void {
    const eventString = `data: ${JSON.stringify({ ...event, timestamp: Date.now() })}\n\n`;
    // Broadcast naar alle listeners voor deze session
  }
}

export const sessionEmitter = new SessionEventEmitter();
```

### SSE API Route

```typescript
// src/app/api/retrospective/[id]/events/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const sessionId = params.id;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      // Stuur connected event
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`));

      // Subscribe op session events
      const unsubscribe = sessionEmitter.subscribe(sessionId, (data) => {
        controller.enqueue(encoder.encode(data));
      });

      // Cleanup bij disconnect
      request.signal.addEventListener('abort', () => {
        unsubscribe();
      });
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
```

### Event Emitting vanuit API Routes

```typescript
// In een POST/PATCH/DELETE route
import { sessionEmitter } from '@/lib/sse';

// Na database operatie
sessionEmitter.emit(sessionId, {
  type: 'item:added',
  data: { id: item.id, content: item.content, ... }
});
```

## Client-side Implementatie

### React Hook Pattern

```typescript
// src/hooks/use-retrospective-events.ts
export function useRetrospectiveEvents(
  sessionId: string,
  handlers: Partial<Record<EventType, EventHandler>>
) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const handlersRef = useRef(handlers);

  // ✅ Handlers in ref om stale closure te voorkomen
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const connect = useCallback(() => {
    const eventSource = new EventSource(`/api/retrospective/${sessionId}/events`);

    eventSource.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      const handler = handlersRef.current[parsed.type];
      if (handler) handler(parsed.data);
    };

    // ✅ Auto-reconnect bij error
    eventSource.onerror = () => {
      eventSource.close();
      setTimeout(connect, 3000);
    };

    return eventSource;
  }, [sessionId]);

  useEffect(() => {
    const eventSource = connect();
    return () => eventSource.close();
  }, [connect]);
}
```

### Gebruik in Components

```typescript
// In een page component
useRetrospectiveEvents(sessionId, {
  'item:added': (data) => {
    setItems(prev => [...prev, data as RetrospectiveItem]);
  },
  'vote:added': (data) => {
    const { itemId } = data as VoteEvent;
    setItems(prev => prev.map(item =>
      item.id === itemId
        ? { ...item, voteCount: (item.voteCount || 0) + 1 }
        : item
    ));
  },
});
```

## Event Type Definities

```typescript
// src/lib/sse/types.ts
export type SSEEventType =
  | 'item:added'
  | 'item:updated'
  | 'item:deleted'
  | 'vote:added'
  | 'vote:removed'
  | 'session:updated'
  | 'action:added'
  | 'action:updated'
  | 'action:deleted'
  | 'connected';

export interface SSEEvent<T = unknown> {
  type: SSEEventType;
  data: T;
  timestamp: number;
}
```

## Productie Overwegingen

### Multi-instance Deployment

De huidige in-memory EventEmitter werkt alleen voor single-instance deployments. Voor productie met meerdere instances:

```typescript
// ❌ Werkt niet met meerdere instances
class SessionEventEmitter {
  private listeners: Map<string, Set<Listener>> = new Map();
}

// ✅ Gebruik Redis pub/sub
import Redis from 'ioredis';

const publisher = new Redis();
const subscriber = new Redis();

subscriber.subscribe('retrospective-events');
subscriber.on('message', (channel, message) => {
  const { sessionId, event } = JSON.parse(message);
  localEmitter.emit(sessionId, event);
});

export function broadcastEvent(sessionId: string, event: SSEEvent) {
  publisher.publish('retrospective-events', JSON.stringify({ sessionId, event }));
}
```

### Connection Limits

Browsers limiteren het aantal SSE connections per domein (meestal 6). Overweeg:
- Één connection per tab, niet per component
- Connection pooling voor meerdere sessions
- HTTP/2 (verhoogt limit significant)

### Heartbeat

Voor long-running connections, stuur periodiek een heartbeat:

```typescript
// Server-side
setInterval(() => {
  controller.enqueue(encoder.encode(': heartbeat\n\n'));
}, 30000);
```
