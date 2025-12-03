# Implementation Guidelines Index

This index helps determine which implementation guidelines to load based on the development request.

## Available Guidelines

### SSE Real-time Patterns
**File:** @knowledge/implementation-guidelines/02-sse-real-time-patterns.md
**Keywords:** SSE, Server-Sent Events, real-time, websocket, events, broadcast, pub/sub
**When to use:** When implementing real-time features, adding new event types, or scaling the SSE infrastructure.

## Loading Logic

1. **Primary:** Check development request for keywords
2. **Secondary:** Analyze the type of implementation being requested
3. **Tertiary:** Default to relevant patterns based on file types being created

## Usage

When implementing new features, load guidelines based on keyword matching:
1. Match keywords from implementation request against available guidelines
2. Load the relevant guideline files for the matched categories
3. Follow the specific implementation patterns outlined in each guideline
