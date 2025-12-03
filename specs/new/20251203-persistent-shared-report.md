# Product Requirements Document: Persistent Shared Report

## 1. Feature Overzicht

**Feature:** Persistent Shared Report - Opgeslagen en gedeelde rapporten met verbeterde UI

**Doel:** Het gegenereerde retrospective rapport moet na generatie worden opgeslagen in de database en real-time zichtbaar zijn voor alle deelnemers in de sessie. De presentatie verschuift van een side panel naar een dedicated tab met verbeterde styling via shadcn/ui componenten.

## 2. Functionele Vereisten

### FV1: Rapport Persistentie

---

**FV1.1:** Het systeem slaat gegenereerde rapporten op in de database

Na het genereren van een rapport via OpenAI wordt het rapport automatisch opgeslagen met metadata zoals timestamp, taalinstellingen en de gebruiker die het rapport genereerde.

Database schema uitbreiding:
```sql
reports
├── id (uuid, primary key)
├── sessionId (fk → retrospective_sessions)
├── content (text) -- markdown content
├── language (varchar) -- 'nl' of 'en'
├── tone (varchar) -- 'formal' of 'informal'
├── generatedBy (varchar) -- user identifier
├── createdAt (timestamp)
```

---

**FV1.2:** Bestaande rapporten worden geladen bij het openen van de sessie

Wanneer een gebruiker een retrospective sessie opent, wordt een eventueel bestaand rapport opgehaald en direct getoond in de rapport tab.

API endpoint: `GET /api/retrospective/[id]/report`

---

**FV1.3:** Er kan maximaal één rapport per sessie bestaan

Bij het genereren van een nieuw rapport wordt het vorige rapport overschreven. Dit voorkomt verwarring over welk rapport actueel is.

---

### FV2: Real-time Synchronisatie

---

**FV2.1:** Na generatie wordt het rapport real-time gebroadcast naar alle sessie-deelnemers

Via het bestaande SSE-systeem wordt een nieuw event type toegevoegd dat alle verbonden clients informeert over het nieuwe rapport.

SSE Event type: `report:generated`
```typescript
{
  type: 'report:generated',
  data: {
    id: string,
    content: string,
    language: string,
    tone: string,
    generatedBy: string,
    createdAt: string
  }
}
```

---

**FV2.2:** Alle gebruikers zien automatisch het nieuwe rapport in de tab

Clients die het `report:generated` event ontvangen updaten automatisch hun UI om het nieuwe rapport te tonen, zonder page refresh.

---

### FV3: Tab-gebaseerde Navigatie

---

**FV3.1:** Implementatie van Tabs component via shadcn/ui

Toevoegen van de `Tabs` component uit shadcn/ui voor navigatie tussen de retrospective board en het rapport.

Installatie: `bunx shadcn@latest add tabs`

---

**FV3.2:** Twee tabs: "Retrospective" en "Rapport"

De hoofdpagina van een retrospective sessie krijgt een tab-structuur:
- **Tab 1: "Retrospective"** - Het huidige board met items, voting, en actiepunten
- **Tab 2: "Rapport"** - Het gegenereerde rapport (of optie om te genereren)

De "Rapport" tab toont een badge/indicator wanneer er een rapport beschikbaar is.

---

**FV3.3:** De "Rapport" tab is alleen zichtbaar in discussion of completed fase

Conform de huidige logica is rapport-functionaliteit alleen beschikbaar wanneer de sessie status `discussion` of `completed` is.

---

### FV4: Verbeterde Rapport Weergave

---

**FV4.1:** Gestylede rapport presentatie met shadcn/ui componenten

Het rapport wordt gepresenteerd met:
- `Card` component als container
- `Badge` componenten voor metadata (taal, toon, timestamp)
- Duidelijke typografische hiërarchie via Tailwind CSS
- `Separator` component tussen secties

---

**FV4.2:** Nederlandse UI labels en content

Alle UI elementen rondom het rapport zijn in het Nederlands:
- Tab label: "Rapport"
- Button: "Genereer Rapport"
- Status: "Rapport wordt gegenereerd..."
- Metadata labels: "Taal", "Toon", "Gegenereerd op", "Gegenereerd door"

---

**FV4.3:** Markdown rendering met styling

Het rapport (markdown) wordt gerenderd met consistente styling:
- Headings met juiste groottes en spacing
- Bullet lists met correcte indentatie
- Emphasis en bold text
- Optioneel: syntax highlighting voor eventuele code blocks

---

**FV4.4:** Kopieer en download functionaliteit behouden

De bestaande functionaliteit voor kopiëren naar clipboard en downloaden als markdown bestand blijft beschikbaar.

---

### FV5: Rapport Generatie Interface

---

**FV5.1:** Generatie formulier in de rapport tab wanneer geen rapport bestaat

Wanneer er nog geen rapport is gegenereerd, toont de rapport tab een formulier met:
- Taal selectie (voorgeselecteerd op Nederlands)
- Toon selectie (formeel/informeel)
- Optionele custom instructies
- "Genereer Rapport" button

---

**FV5.2:** Loading state tijdens generatie

Tijdens het genereren toont de UI:
- Skeleton loader of spinner
- Status tekst: "Rapport wordt gegenereerd..."
- Disabled form controls

---

**FV5.3:** Optie om rapport opnieuw te genereren

Wanneer een rapport bestaat, is er een "Opnieuw genereren" optie beschikbaar met een bevestigingsdialoog om onbedoeld overschrijven te voorkomen.

---

## 3. Technische Overwegingen

---

**TO1: Database migratie**

Een nieuwe `reports` tabel moet worden toegevoegd aan het Drizzle ORM schema. Gebruik `bun run db:push` of een migration file om het schema te updaten.

Schema locatie: `src/lib/db/schema.ts`

---

**TO2: SSE Event Type uitbreiding**

Het bestaande SSE-systeem moet worden uitgebreid met het `report:generated` event type:

1. Voeg `'report:generated'` toe aan `SSEEventType` in `src/lib/sse/types.ts`
2. Emit het event na succesvolle opslag in de POST route
3. Handle het event in `useRetrospectiveEvents` hook

---

**TO3: API Route aanpassingen**

De `/api/retrospective/[id]/report` route moet worden aangepast:

- `POST`: Genereer rapport, sla op in database, broadcast via SSE
- `GET`: Haal bestaand rapport op uit database

---

**TO4: Component architectuur**

Nieuwe/aangepaste componenten:
- `ReportTab` - Container voor rapport functionaliteit binnen tab
- `ReportViewer` - Weergave van opgeslagen rapport
- `ReportGenerator` - Formulier voor rapport generatie (bestaand, aan te passen)

---

**TO5: Shadcn/ui componenten toevoegen**

Benodigde nieuwe componenten via shadcn CLI:
```bash
bunx shadcn@latest add tabs
bunx shadcn@latest add separator
```

---

## 4. Buiten Scope (voor deze versie)

* Meerdere rapporten per sessie (versie historie)
* Bewerken van gegenereerde rapporten
* Export naar PDF formaat
* Rapport templates
* Rapport delen via externe link
* Notificaties (email/push) bij rapport generatie
* Rapport vergelijking tussen sessies
* Automatische rapport generatie bij sessie completion

## 5. Succescriteria

* Gegenereerde rapporten worden succesvol opgeslagen in de database
* Rapporten zijn zichtbaar voor alle deelnemers binnen 2 seconden na generatie (via SSE)
* De tab-navigatie werkt correct op desktop en mobiel
* Alle UI teksten zijn in het Nederlands
* De rapport weergave is visueel consistent met de rest van de applicatie
* Bestaande rapporten laden correct bij het openen van een sessie
* Kopieer en download functionaliteit werkt correct
* De "Rapport" tab toont correcte status (geen rapport / rapport beschikbaar)
