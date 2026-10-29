import { describe, it, expect } from 'vitest';
import { InterviewSession, INTERVIEW_QUESTIONS } from '../src/lib/interview-machine';

describe('Adaptive Interview State Machine', () => {
  it('initializes in English with welcome prompt', () => {
    const session = new InterviewSession('en');
    const currentQ = session.getCurrentQuestion();
    expect(currentQ?.id).toBe('q_concern');
    expect(session.getHistory()[0].text).toContain('Hello, I am DentaSense AI');
    expect(session.isComplete()).toBe(false);
  });

  it('initializes in Hindi when preferred', () => {
    const session = new InterviewSession('hi');
    const currentQ = session.getCurrentQuestion();
    expect(currentQ?.id).toBe('q_concern');
    expect(session.getHistory()[0].text).toContain('नमस्ते, मैं DentaSense AI हूँ');
  });

  it('branches to emergency question when breathing difficulty is spoken in chief concern', () => {
    const session = new InterviewSession('en');
    const step1 = session.processUserAnswer('I have a toothache and I am having trouble breathing');

    // Should immediately detect emergency symptom and trigger alert!
    expect(step1.emergencyDetected).toBe(true);
    expect(step1.isComplete).toBe(true);
    expect(step1.emergencyGuidance).toContain('SEEK EMERGENCY MEDICAL ATTENTION');
  });

  it('branches to swelling spread inquiry when swelling is reported', () => {
    const session = new InterviewSession('en');
    // Step 1: Concern
    session.processUserAnswer('Throbbing tooth in upper molar');
    // Step 2: Location
    session.processUserAnswer('Upper right');
    // Step 3: Duration
    session.processUserAnswer('2 days');
    // Step 4: Pain
    session.processUserAnswer('Pain score 7');
    // Step 5: Swelling -> reports yes
    const stepSwelling = session.processUserAnswer('Yes, visible cheek or jaw swelling');

    expect(stepSwelling.nextQuestion?.id).toBe('q_swelling_spread');
  });

  it('halts with emergency alert if swelling is spreading rapidly down neck', () => {
    const session = new InterviewSession('en');
    session.processUserAnswer('Toothache');
    session.processUserAnswer('Lower jaw');
    session.processUserAnswer('1 day');
    session.processUserAnswer('Pain score 8');
    session.processUserAnswer('Yes, swelling');
    const spreadAns = session.processUserAnswer('Yes, spreading rapidly toward neck');

    expect(spreadAns.emergencyDetected).toBe(true);
    expect(spreadAns.isComplete).toBe(true);
  });

  it('extracts pain scores correctly from text responses', () => {
    const qPain = INTERVIEW_QUESTIONS['q_pain'];
    expect(qPain.extractSymptom('Pain is 5/10', {} as any)).toEqual({ painScore: 5 });
    expect(qPain.extractSymptom('Around 8', {} as any)).toEqual({ painScore: 8 });
    expect(qPain.extractSymptom('0 no pain', {} as any)).toEqual({ painScore: 0 });
    expect(qPain.extractSymptom('10 unbearable', {} as any)).toEqual({ painScore: 10 });
  });
});
