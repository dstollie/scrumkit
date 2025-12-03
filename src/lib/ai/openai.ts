import OpenAI from 'openai';

// Create OpenAI client (server-side only)
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Report generation types
export type ReportTone = 'formal' | 'informal';
export type ReportLanguage = 'en' | 'nl';

export interface ReportConfig {
  tone: ReportTone;
  language: ReportLanguage;
  focusAreas?: string[];
  customInstructions?: string;
}

export interface RetrospectiveData {
  sessionName: string;
  sprintName?: string;
  items: {
    category: string;
    content: string;
    voteCount: number;
    discussionNotes?: string;
    isDiscussed: boolean;
  }[];
  actionItems: {
    description: string;
    assigneeName?: string;
    priority: string;
    status: string;
    dueDate?: string;
  }[];
}

const defaultConfig: ReportConfig = {
  tone: 'informal',
  language: 'en',
};

export async function generateRetrospectiveReport(
  data: RetrospectiveData,
  config: ReportConfig = defaultConfig
): Promise<string> {
  const systemPrompt = buildSystemPrompt(config);
  const userPrompt = buildUserPrompt(data, config);

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
  });

  return response.choices[0]?.message?.content || 'Failed to generate report';
}

function buildSystemPrompt(config: ReportConfig): string {
  const toneInstructions = config.tone === 'formal'
    ? 'Use professional, business-appropriate language. Be concise and objective.'
    : 'Use friendly, conversational language while remaining professional. Feel free to add encouraging remarks.';

  const languageInstructions = config.language === 'nl'
    ? 'Write the entire report in Dutch (Nederlands).'
    : 'Write the entire report in English.';

  return `You are an expert Agile coach and technical writer. Your task is to generate a comprehensive sprint retrospective report.

${toneInstructions}

${languageInstructions}

${config.customInstructions || ''}

Format the report in Markdown with clear sections. Include:
1. Executive Summary (2-3 sentences)
2. What Went Well (top items by votes)
3. Areas for Improvement (top items by votes)
4. Action Items (with owners and priorities)
5. Key Insights & Recommendations

Use bullet points and keep each section scannable.`;
}

function buildUserPrompt(data: RetrospectiveData, config: ReportConfig): string {
  const wentWell = data.items.filter(i => i.category === 'went_well').sort((a, b) => b.voteCount - a.voteCount);
  const toImprove = data.items.filter(i => i.category === 'to_improve').sort((a, b) => b.voteCount - a.voteCount);
  const actionItemsFromRetro = data.items.filter(i => i.category === 'action_item');

  return `Generate a retrospective report for:

**Session:** ${data.sessionName}
${data.sprintName ? `**Sprint:** ${data.sprintName}` : ''}

## What Went Well (${wentWell.length} items)
${wentWell.map(i => `- "${i.content}" (${i.voteCount} votes)${i.discussionNotes ? ` - Notes: ${i.discussionNotes}` : ''}`).join('\n')}

## To Improve (${toImprove.length} items)
${toImprove.map(i => `- "${i.content}" (${i.voteCount} votes)${i.discussionNotes ? ` - Notes: ${i.discussionNotes}` : ''}`).join('\n')}

## Suggested Action Items from Retro (${actionItemsFromRetro.length} items)
${actionItemsFromRetro.map(i => `- "${i.content}" (${i.voteCount} votes)`).join('\n')}

## Committed Action Items (${data.actionItems.length} items)
${data.actionItems.map(a => `- ${a.description} | Owner: ${a.assigneeName || 'Unassigned'} | Priority: ${a.priority} | Status: ${a.status}${a.dueDate ? ` | Due: ${a.dueDate}` : ''}`).join('\n')}

${config.focusAreas?.length ? `\n**Focus Areas:** ${config.focusAreas.join(', ')}` : ''}`;
}
