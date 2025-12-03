// Simple in-memory event emitter for SSE
// In production, use Redis pub/sub for multi-instance support

type Listener = (data: string) => void;

class SessionEventEmitter {
  private listeners: Map<string, Set<Listener>> = new Map();

  subscribe(sessionId: string, listener: Listener): () => void {
    if (!this.listeners.has(sessionId)) {
      this.listeners.set(sessionId, new Set());
    }
    this.listeners.get(sessionId)!.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.get(sessionId)?.delete(listener);
      if (this.listeners.get(sessionId)?.size === 0) {
        this.listeners.delete(sessionId);
      }
    };
  }

  emit(sessionId: string, event: { type: string; data: unknown }): void {
    const eventString = `data: ${JSON.stringify({ ...event, timestamp: Date.now() })}\n\n`;
    this.listeners.get(sessionId)?.forEach((listener) => {
      try {
        listener(eventString);
      } catch (error) {
        console.error('Error sending SSE event:', error);
      }
    });
  }

  getConnectionCount(sessionId: string): number {
    return this.listeners.get(sessionId)?.size || 0;
  }
}

// Singleton instance
export const sessionEmitter = new SessionEventEmitter();
