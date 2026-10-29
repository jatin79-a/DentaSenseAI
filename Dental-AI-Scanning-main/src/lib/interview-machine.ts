// DentaSense AI — Adaptive Interview State Machine
// Supports English ('en') and Hindi ('hi') with dynamic branching and emergency detection.

import { StructuredSymptoms, SupportedLanguage } from '@/types';
import { checkEmergencyRedFlags } from './safety-engine';

export interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user' | 'system';
  text: string;
  timestamp: string;
  questionId?: string;
}

export interface QuestionDef {
  id: string;
  category: 'emergency_check' | 'chief_concern' | 'location' | 'duration' | 'pain_scale' | 'swelling' | 'swelling_spread' | 'bleeding' | 'systemic';
  prompt: Record<SupportedLanguage, string>;
  inputType: 'text' | 'scale' | 'choice' | 'boolean';
  options?: { value: string; label: Record<SupportedLanguage, string> }[];
  isEssential: boolean;
  extractSymptom: (input: string, current: StructuredSymptoms) => Partial<StructuredSymptoms>;
  nextQuestionId: (current: StructuredSymptoms, lastAnswer: string) => string | null;
}

export const INTERVIEW_QUESTIONS: Record<string, QuestionDef> = {
  q_concern: {
    id: 'q_concern',
    category: 'chief_concern',
    prompt: {
      en: "Hello, I am DentaSense AI. What is the primary concern or discomfort you are experiencing with your teeth or mouth?",
      hi: "नमस्ते, मैं DentaSense AI हूँ। आपके दांतों या मुंह में मुख्य परेशानी या दर्द क्या है?",
    },
    inputType: 'text',
    isEssential: true,
    extractSymptom: (input, current) => {
      const lower = input.toLowerCase();
      const extracted: Partial<StructuredSymptoms> = { chiefConcern: input.trim() };
      if (lower.includes('breath') || lower.includes('सांस')) extracted.hasDifficultyBreathing = true;
      if (lower.includes('swallow') || lower.includes('निगल')) extracted.hasDifficultySwallowing = true;
      if (lower.includes('swell') || lower.includes('सूजन')) extracted.hasSwelling = true;
      if (lower.includes('bleed') || lower.includes('खून')) extracted.hasBleeding = true;
      return extracted;
    },
    nextQuestionId: (symptoms) => {
      // Check emergency triggers immediately
      if (symptoms.hasDifficultyBreathing || symptoms.hasDifficultySwallowing) {
        return 'q_emergency';
      }
      return 'q_location';
    },
  },

  q_emergency: {
    id: 'q_emergency',
    category: 'emergency_check',
    prompt: {
      en: "Are you having any difficulty breathing, difficulty swallowing, or rapid facial/neck swelling right now?",
      hi: "क्या आपको इस समय सांस लेने में कठिनाई, निगलने में कठिनाई, या चेहरे/गर्दन में तेजी से सूजन हो रही है?",
    },
    inputType: 'choice',
    options: [
      { value: 'yes', label: { en: 'Yes, I am experiencing this', hi: 'हाँ, मुझे यह समस्या हो रही है' } },
      { value: 'no', label: { en: 'No, breathing and swallowing are normal', hi: 'नहीं, सांस और निगलना सामान्य है' } },
    ],
    isEssential: true,
    extractSymptom: (input) => {
      const lower = input.toLowerCase();
      const isYes = lower.includes('yes') || lower.includes('हाँ') || lower.includes('ha') || lower.includes('experiencing');
      return {
        hasDifficultyBreathing: isYes,
        hasDifficultySwallowing: isYes,
        swellingSpreadingRapidly: isYes,
      };
    },
    nextQuestionId: (symptoms) => {
      if (symptoms.hasDifficultyBreathing || symptoms.hasDifficultySwallowing || symptoms.swellingSpreadingRapidly) {
        return null; // Immediately terminate interview to trigger emergency protocol!
      }
      return 'q_location';
    },
  },

  q_location: {
    id: 'q_location',
    category: 'location',
    prompt: {
      en: "Where exactly is this located? (e.g., upper right molar, front gums, entire lower jaw)",
      hi: "यह समस्या ठीक किस जगह पर है? (जैसे, ऊपरी दाहिनी दाढ़, सामने के मसूड़े, या पूरा निचला जबड़ा)",
    },
    inputType: 'text',
    isEssential: false,
    extractSymptom: (input) => ({ location: input.trim() }),
    nextQuestionId: () => 'q_duration',
  },

  q_duration: {
    id: 'q_duration',
    category: 'duration',
    prompt: {
      en: "How long have you had this issue?",
      hi: "आपको यह समस्या कितने समय से है?",
    },
    inputType: 'choice',
    options: [
      { value: '< 24 hours', label: { en: 'Less than 24 hours', hi: '24 घंटे से कम' } },
      { value: '1-3 days', label: { en: '1 to 3 days', hi: '1 से 3 दिन' } },
      { value: '1-2 weeks', label: { en: '1 to 2 weeks', hi: '1 से 2 सप्ताह' } },
      { value: '> 1 month', label: { en: 'More than a month', hi: 'एक महीने से अधिक' } },
    ],
    isEssential: false,
    extractSymptom: (input) => ({ duration: input.trim() }),
    nextQuestionId: () => 'q_pain',
  },

  q_pain: {
    id: 'q_pain',
    category: 'pain_scale',
    prompt: {
      en: "On a scale from 0 to 10, how severe is your pain or discomfort right now? (0 = No pain, 10 = Worst imaginable pain)",
      hi: "0 से 10 के पैमाने पर, इस समय आपका दर्द कितना गंभीर है? (0 = कोई दर्द नहीं, 10 = असहनीय दर्द)",
    },
    inputType: 'scale',
    isEssential: true,
    extractSymptom: (input) => {
      const match = input.match(/\b([0-9]|10)\b/);
      const score = match ? parseInt(match[1], 10) : 0;
      return { painScore: Math.min(10, Math.max(0, score)) };
    },
    nextQuestionId: (symptoms) => 'q_swelling',
  },

  q_swelling: {
    id: 'q_swelling',
    category: 'swelling',
    prompt: {
      en: "Do you notice any swelling in your gums, cheek, or jaw?",
      hi: "क्या आपके मसूड़ों, गाल या जबड़े में कोई सूजन है?",
    },
    inputType: 'choice',
    options: [
      { value: 'no', label: { en: 'No swelling', hi: 'कोई सूजन नहीं है' } },
      { value: 'yes_mild', label: { en: 'Yes, mild gum swelling', hi: 'हाँ, हल्की मसूड़ों की सूजन' } },
      { value: 'yes_facial', label: { en: 'Yes, visible cheek or jaw swelling', hi: 'हाँ, गाल या जबड़े में सूजन' } },
    ],
    isEssential: true,
    extractSymptom: (input) => {
      const lower = input.toLowerCase();
      const hasSwelling = lower.includes('yes') || lower.includes('हाँ') || lower.includes('swelling') || lower.includes('सूजन');
      return {
        hasSwelling,
        swellingLocation: hasSwelling ? (lower.includes('facial') || lower.includes('cheek') ? 'Cheek/Face' : 'Gums') : undefined,
      };
    },
    nextQuestionId: (symptoms) => {
      if (symptoms.hasSwelling) {
        return 'q_swelling_spread';
      }
      return 'q_bleeding';
    },
  },

  q_swelling_spread: {
    id: 'q_swelling_spread',
    category: 'swelling_spread',
    prompt: {
      en: "Is the swelling spreading rapidly, or spreading downward toward your neck or under your tongue?",
      hi: "क्या सूजन तेजी से बढ़ रही है, या गर्दन की ओर या जीभ के नीचे फैल रही है?",
    },
    inputType: 'choice',
    options: [
      { value: 'yes', label: { en: 'Yes, spreading rapidly or toward neck', hi: 'हाँ, तेजी से या गर्दन की ओर फैल रही है' } },
      { value: 'no', label: { en: 'No, staying localized', hi: 'नहीं, एक ही जगह पर है' } },
    ],
    isEssential: true,
    extractSymptom: (input) => {
      const lower = input.toLowerCase();
      const isYes = lower.includes('yes') || lower.includes('हाँ') || lower.includes('rapid') || lower.includes('neck');
      return { swellingSpreadingRapidly: isYes };
    },
    nextQuestionId: (symptoms) => {
      if (symptoms.swellingSpreadingRapidly) {
        return null; // Emergency halt!
      }
      return 'q_bleeding';
    },
  },

  q_bleeding: {
    id: 'q_bleeding',
    category: 'bleeding',
    prompt: {
      en: "Have you experienced any bleeding from your gums or mouth?",
      hi: "क्या आपके मसूड़ों या मुंह से खून आ रहा है?",
    },
    inputType: 'choice',
    options: [
      { value: 'no', label: { en: 'No bleeding', hi: 'कोई खून नहीं' } },
      { value: 'brushing', label: { en: 'Only when brushing or flossing', hi: 'केवल ब्रश या फ्लॉस करते समय' } },
      { value: 'spontaneous', label: { en: 'Spontaneous bleeding without touching', hi: 'बिना छुए अपने आप खून आना' } },
    ],
    isEssential: false,
    extractSymptom: (input) => {
      const lower = input.toLowerCase();
      const hasBleeding = !lower.includes('no') && !lower.includes('नहीं');
      const bleedingSpontaneous = lower.includes('spontaneous') || lower.includes('अपने आप');
      return { hasBleeding, bleedingSpontaneous };
    },
    nextQuestionId: () => 'q_systemic',
  },

  q_systemic: {
    id: 'q_systemic',
    category: 'systemic',
    prompt: {
      en: "Do you currently have a fever, chills, or feel generally sick/fatigued?",
      hi: "क्या आपको इस समय बुखार, ठंड लगना या सामान्य रूप से अस्वस्थ महसूस हो रहा है?",
    },
    inputType: 'choice',
    options: [
      { value: 'no', label: { en: 'No fever, feel normal otherwise', hi: 'नहीं, बुखार नहीं है' } },
      { value: 'yes', label: { en: 'Yes, feeling feverish or sick', hi: 'हाँ, बुखार या अस्वस्थ लग रहा है' } },
    ],
    isEssential: false,
    extractSymptom: (input) => {
      const lower = input.toLowerCase();
      const hasFever = lower.includes('yes') || lower.includes('हाँ') || lower.includes('fever') || lower.includes('बुखार');
      return { hasFeverOrMalaise: hasFever };
    },
    nextQuestionId: () => null, // End of structured interview!
  },
};

export class InterviewSession {
  private currentQuestionId: string | null = 'q_concern';
  private symptoms: StructuredSymptoms;
  private history: ChatMessage[] = [];
  private language: SupportedLanguage;

  constructor(language: SupportedLanguage = 'en') {
    this.language = language;
    this.symptoms = {
      chiefConcern: '',
      hasSwelling: false,
      hasBleeding: false,
      patientConfirmed: false,
    };
    // Initialize welcome
    const firstQ = INTERVIEW_QUESTIONS['q_concern'];
    this.history.push({
      id: `msg-${Date.now()}-1`,
      sender: 'assistant',
      text: firstQ.prompt[this.language],
      timestamp: new Date().toISOString(),
      questionId: firstQ.id,
    });
  }

  getCurrentQuestion(): QuestionDef | null {
    if (!this.currentQuestionId) return null;
    return INTERVIEW_QUESTIONS[this.currentQuestionId] || null;
  }

  getHistory(): ChatMessage[] {
    return [...this.history];
  }

  getSymptoms(): StructuredSymptoms {
    return { ...this.symptoms };
  }

  getLanguage(): SupportedLanguage {
    return this.language;
  }

  setLanguage(lang: SupportedLanguage) {
    this.language = lang;
  }

  isComplete(): boolean {
    return this.currentQuestionId === null;
  }

  processUserAnswer(userAnswer: string): {
    nextQuestion: QuestionDef | null;
    emergencyDetected: boolean;
    emergencyGuidance?: string;
    isComplete: boolean;
  } {
    // Record user message
    this.history.push({
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: userAnswer,
      timestamp: new Date().toISOString(),
      questionId: this.currentQuestionId || undefined,
    });

    if (!this.currentQuestionId) {
      return { nextQuestion: null, emergencyDetected: false, isComplete: true };
    }

    const currentQ = INTERVIEW_QUESTIONS[this.currentQuestionId];
    if (currentQ) {
      const extracted = currentQ.extractSymptom(userAnswer, this.symptoms);
      this.symptoms = { ...this.symptoms, ...extracted };
    }

    // Check emergency red flags immediately
    const emergencyCheck = checkEmergencyRedFlags(this.symptoms);
    if (emergencyCheck.hasEmergency) {
      this.currentQuestionId = null;
      this.history.push({
        id: `msg-${Date.now()}-alert`,
        sender: 'system',
        text: emergencyCheck.guidance,
        timestamp: new Date().toISOString(),
      });
      return {
        nextQuestion: null,
        emergencyDetected: true,
        emergencyGuidance: emergencyCheck.guidance,
        isComplete: true,
      };
    }

    // Determine next question
    const nextQId = currentQ ? currentQ.nextQuestionId(this.symptoms, userAnswer) : null;
    this.currentQuestionId = nextQId;

    if (nextQId && INTERVIEW_QUESTIONS[nextQId]) {
      const nextQ = INTERVIEW_QUESTIONS[nextQId];
      this.history.push({
        id: `msg-${Date.now()}-assistant`,
        sender: 'assistant',
        text: nextQ.prompt[this.language],
        timestamp: new Date().toISOString(),
        questionId: nextQ.id,
      });
      return {
        nextQuestion: nextQ,
        emergencyDetected: false,
        isComplete: false,
      };
    }

    // Interview finished
    return {
      nextQuestion: null,
      emergencyDetected: false,
      isComplete: true,
    };
  }

  updateConfirmedSymptoms(updated: Partial<StructuredSymptoms>) {
    this.symptoms = {
      ...this.symptoms,
      ...updated,
      patientConfirmed: true,
    };
  }
}
