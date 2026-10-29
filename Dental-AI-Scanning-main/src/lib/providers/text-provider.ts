// DentaSense AI — Text Provider Adapter
// Handles adaptive interview conversational enrichment and question generation.

import { SupportedLanguage } from '@/types';

export class TextProvider {
  private apiKey?: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.TEXT_PROVIDER_API_KEY;
    this.model = process.env.TEXT_PROVIDER_MODEL || 'gemini-1.5-flash';
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async generateFollowUpQuestion(
    context: {
      concern: string;
      symptomsSoFar: Record<string, unknown>;
      language: SupportedLanguage;
    },
    allowSimulation = true
  ): Promise<{ questionText: string; isSimulated: boolean }> {
    if (!this.isConfigured()) {
      if (!allowSimulation) {
        throw new Error('Text Provider is not configured. Please set TEXT_PROVIDER_API_KEY.');
      }
      return {
        questionText:
          context.language === 'hi'
            ? 'क्या आपको ठंडा या गर्म खाने-पीने पर कोई संवेदनशीलता महसूस होती है?'
            : 'Do you experience any tooth sensitivity when drinking hot or cold liquids?',
        isSimulated: true,
      };
    }

    try {
      const prompt = `You are a careful dental intake screening assistant.
Given the patient's reported symptoms so far:
Language: ${context.language}
Chief Concern: ${context.concern}
Reported Symptoms: ${JSON.stringify(context.symptomsSoFar)}

Generate a single polite, clear follow-up question in ${context.language === 'hi' ? 'Hindi (Devanagari script)' : 'English'} to better understand their discomfort.
Do NOT give dental advice or diagnose. Return only the question text.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 100 },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Text Provider API error HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (!text) {
        throw new Error('Text provider returned empty question.');
      }

      return { questionText: text, isSimulated: false };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      throw new Error(`Text Provider Question Generation Failed: ${errorMsg}`);
    }
  }
}

export const textProvider = new TextProvider();
