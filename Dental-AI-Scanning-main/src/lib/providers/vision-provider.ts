// DentaSense AI — Vision Provider Adapter
// Strictly validates outputs with Zod; explicitly marks simulated results; never silently masks errors.

import { VisionAnalysisResult, VisionAnalysisResultSchema } from './types';
import { ImageQualityStatus } from '@/types';

export class VisionProvider {
  private apiKey?: string;
  private model: string;
  private timeoutMs: number;

  constructor() {
    this.apiKey = process.env.VISION_PROVIDER_API_KEY;
    this.model = process.env.VISION_PROVIDER_MODEL || 'gemini-1.5-flash';
    this.timeoutMs = 15000;
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Analyzes an oral photograph.
   * @param imageBase64 Base64 encoded image string or signed URL
   * @param qualityStatus Current image quality rating
   * @param allowSimulation Whether to allow explicitly labelled simulated development mode
   */
  async analyzeImage(
    imageBase64: string,
    qualityStatus: ImageQualityStatus,
    allowSimulation = true
  ): Promise<VisionAnalysisResult> {
    if (qualityStatus === 'unusable') {
      return {
        findings: [],
        overallVisibleStatus: 'unclear',
        generalObservations: 'Image quality is unusable due to insufficient lighting, blur, or resolution. Clinical examination is advised.',
        screeningLimitations: [
          'Automatic vision model cannot inspect details on an unusable image.',
          'No visible abnormalities can be ruled in or out.',
        ],
        isSimulated: false,
        providerModel: 'pre-check-filter',
      };
    }

    if (!this.isConfigured()) {
      if (!allowSimulation) {
        throw new Error(
          'Vision Provider is not configured. Please set VISION_PROVIDER_API_KEY in your environment variables.'
        );
      }
      return this.getSimulatedResult(qualityStatus);
    }

    // Call Real Provider with timeout and retries
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      // Vision prompt requesting structured JSON output
      const prompt = `You are a clinical dental screening assistant. Analyze this photograph of teeth and oral tissues.
Provide a preliminary screening assessment in JSON format matching this schema:
{
  "findings": [
    {
      "id": "string",
      "label": "string (e.g., Potential Enamel Discoloration, Marginal Gingival Erythema, Suspected Occlusal Attrition)",
      "anatomicalLocation": "string",
      "visibleEvidence": "string",
      "confidenceBand": "low" | "moderate" | "high",
      "limitations": "string",
      "suggestedFollowUp": "string"
    }
  ],
  "overallVisibleStatus": "healthy_appearance" | "minor_abnormality" | "notable_abnormality" | "unclear",
  "generalObservations": "string",
  "screeningLimitations": ["string"]
}
Note: Do NOT provide a definitive medical diagnosis. State observations neutrally as preliminary visual findings.`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/' + this.model + ':generateContent?key=' + this.apiKey, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Real Vision Provider API returned HTTP ${response.status}: ${errorText}`);
      }

      const rawJson = await response.json();
      const textOutput = rawJson?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textOutput) {
        throw new Error('Vision provider returned empty response structure.');
      }

      const parsed = JSON.parse(textOutput);
      const validated = VisionAnalysisResultSchema.parse({
        ...parsed,
        isSimulated: false,
        providerModel: this.model,
      });

      return validated;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      // NEVER silently mask an error from a real configured provider!
      throw new Error(`Vision Provider Analysis Failed: ${errorMsg}`);
    }
  }

  /**
   * Explicitly labelled simulated development result for testing without credentials.
   */
  private getSimulatedResult(qualityStatus: ImageQualityStatus): VisionAnalysisResult {
    return {
      findings: [
        {
          id: 'sim-find-1',
          label: 'Localized Enamel Demineralization / Discoloration',
          anatomicalLocation: 'Posterior occlusal surface',
          visibleEvidence: 'Small localized dark pit visible on the occlusal groove with no gross cavitary collapse.',
          confidenceBand: 'moderate',
          limitations: 'Cannot assess depth or hardness without tactile clinical explorer examination.',
          suggestedFollowUp: 'Professional clinical evaluation to determine if remineralization or restorative treatment is required.',
        },
        {
          id: 'sim-find-2',
          label: 'Mild Marginal Gingival Erythema',
          anatomicalLocation: 'Lower anterior gingival margin',
          visibleEvidence: 'Mild pink-to-red discoloration along the cervical gingival border.',
          confidenceBand: 'low',
          limitations: 'Lighting reflections may accentuate perceived redness; periodontal probing required to evaluate pocket depth.',
          suggestedFollowUp: 'Professional prophylaxis and oral hygiene evaluation.',
        },
      ],
      overallVisibleStatus: qualityStatus === 'borderline' ? 'minor_abnormality' : 'minor_abnormality',
      generalObservations: 'Preliminary visual inspection shows localized areas of interest for dental review. Soft tissue contours appear gross-stable without visible fluctuant swelling.',
      screeningLimitations: [
        'SIMULATED DEVELOPMENT MODE: Vision provider API key is not configured.',
        'Photographic screening cannot reveal interproximal caries or root infections.',
        'This screening does not replace an in-person dental checkup.',
      ],
      isSimulated: true,
      providerModel: 'simulated-dev-heuristic-v1',
    };
  }
}

export const visionProvider = new VisionProvider();
