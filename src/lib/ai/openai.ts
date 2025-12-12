import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type ReportConfig = {
  tone: "formal" | "informal";
  language: "nl" | "en";
  focusAreas?: string[];
  customInstructions?: string;
};

export type RetrospectiveData = {
  sessionName: string;
  sprintName?: string;
  items: {
    category: "went_well" | "to_improve" | "action_item";
    content: string;
    voteCount: number;
    discussionNotes?: string;
    authorName?: string;
  }[];
  actionItems: {
    description: string;
    assigneeName?: string;
    priority: "low" | "medium" | "high";
    status: "open" | "in_progress" | "done";
  }[];
};

const categoryLabels = {
  nl: {
    went_well: "Ging Goed",
    to_improve: "Kan Beter",
    action_item: "Actiepunten",
  },
  en: {
    went_well: "Went Well",
    to_improve: "To Improve",
    action_item: "Action Items",
  },
};

const priorityLabels = {
  nl: { low: "Laag", medium: "Gemiddeld", high: "Hoog" },
  en: { low: "Low", medium: "Medium", high: "High" },
};

const statusLabels = {
  nl: { open: "Open", in_progress: "In Uitvoering", done: "Afgerond" },
  en: { open: "Open", in_progress: "In Progress", done: "Done" },
};

export async function generateRetrospectiveReport(
  data: RetrospectiveData,
  config: ReportConfig = { tone: "informal", language: "nl" }
): Promise<string> {
  const { tone, language, focusAreas, customInstructions } = config;
  const labels = categoryLabels[language];
  const priorities = priorityLabels[language];
  const statuses = statusLabels[language];

  // Group items by category and sort by votes
  const groupedItems = {
    went_well: data.items
      .filter((i) => i.category === "went_well")
      .sort((a, b) => b.voteCount - a.voteCount),
    to_improve: data.items
      .filter((i) => i.category === "to_improve")
      .sort((a, b) => b.voteCount - a.voteCount),
    action_item: data.items
      .filter((i) => i.category === "action_item")
      .sort((a, b) => b.voteCount - a.voteCount),
  };

  const systemPrompt =
    language === "nl"
      ? `Je bent een expert in het schrijven van Sprint Retrospective rapporten.
Schrijf een duidelijk, ${tone === "formal" ? "professioneel" : "toegankelijk"} rapport in het Nederlands.
Het rapport moet beknopt maar volledig zijn en actionable insights bevatten.`
      : `You are an expert at writing Sprint Retrospective reports.
Write a clear, ${tone === "formal" ? "professional" : "accessible"} report in English.
The report should be concise but complete and contain actionable insights.`;

  const userPrompt = `
${language === "nl" ? "Genereer een retrospective rapport voor" : "Generate a retrospective report for"}: "${data.sessionName}"
${data.sprintName ? `Sprint: ${data.sprintName}` : ""}

## ${labels.went_well} (${groupedItems.went_well.length} items)
${groupedItems.went_well.map((i) => `- ${i.content} (${i.voteCount} ${language === "nl" ? "stemmen" : "votes"})${i.discussionNotes ? `\n  Notities: ${i.discussionNotes}` : ""}`).join("\n")}

## ${labels.to_improve} (${groupedItems.to_improve.length} items)
${groupedItems.to_improve.map((i) => `- ${i.content} (${i.voteCount} ${language === "nl" ? "stemmen" : "votes"})${i.discussionNotes ? `\n  Notities: ${i.discussionNotes}` : ""}`).join("\n")}

## ${labels.action_item} (${groupedItems.action_item.length} items)
${groupedItems.action_item.map((i) => `- ${i.content} (${i.voteCount} ${language === "nl" ? "stemmen" : "votes"})${i.discussionNotes ? `\n  Notities: ${i.discussionNotes}` : ""}`).join("\n")}

## ${language === "nl" ? "Concrete Actiepunten" : "Action Items"} (${data.actionItems.length})
${data.actionItems.map((a) => `- ${a.description} | ${language === "nl" ? "Eigenaar" : "Owner"}: ${a.assigneeName || (language === "nl" ? "Niet toegewezen" : "Unassigned")} | ${language === "nl" ? "Prioriteit" : "Priority"}: ${priorities[a.priority]} | Status: ${statuses[a.status]}`).join("\n")}

${focusAreas?.length ? `\n${language === "nl" ? "Focus gebieden" : "Focus areas"}: ${focusAreas.join(", ")}` : ""}
${customInstructions ? `\n${language === "nl" ? "Extra instructies" : "Additional instructions"}: ${customInstructions}` : ""}

${language === "nl" ? "Schrijf het rapport met de volgende secties" : "Write the report with the following sections"}:
1. ${language === "nl" ? "Samenvatting" : "Summary"} - ${language === "nl" ? "Korte overview van de belangrijkste punten" : "Brief overview of key points"}
2. ${language === "nl" ? "Wat ging goed" : "What went well"} - ${language === "nl" ? "Highlights en successen" : "Highlights and successes"}
3. ${language === "nl" ? "Verbeterpunten" : "Areas for improvement"} - ${language === "nl" ? "Top problemen en suggesties" : "Top issues and suggestions"}
4. ${language === "nl" ? "Actiepunten" : "Action Items"} - ${language === "nl" ? "Concrete stappen met eigenaren" : "Concrete steps with owners"}
5. ${language === "nl" ? "Aanbevelingen" : "Recommendations"} - ${language === "nl" ? "Tips voor de volgende sprint" : "Tips for the next sprint"}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content || "";
}
