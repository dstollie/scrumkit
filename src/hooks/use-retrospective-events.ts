"use client";

import { useEffect, useCallback, useRef } from "react";

type EventType =
  | "item:added"
  | "item:updated"
  | "item:deleted"
  | "vote:added"
  | "vote:removed"
  | "session:updated"
  | "connected";

type EventHandler = (data: unknown) => void;

export function useRetrospectiveEvents(
  sessionId: string,
  handlers: Partial<Record<EventType, EventHandler>>
) {
  const eventSourceRef = useRef<EventSource | null>(null);
  const handlersRef = useRef(handlers);

  // Keep handlers ref up to date
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = new EventSource(`/api/retrospective/${sessionId}/events`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        const handler = handlersRef.current[parsed.type as EventType];
        if (handler) {
          handler(parsed.data);
        }
      } catch (error) {
        console.error("Failed to parse SSE event:", error);
      }
    };

    eventSource.onerror = () => {
      // Reconnect after 3 seconds on error
      eventSource.close();
      setTimeout(connect, 3000);
    };

    return eventSource;
  }, [sessionId]);

  useEffect(() => {
    const eventSource = connect();

    return () => {
      eventSource.close();
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  return { disconnect };
}
