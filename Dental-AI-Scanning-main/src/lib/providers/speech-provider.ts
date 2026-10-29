// DentaSense AI — Speech Provider Bridge (STT & TTS)
// Manages Web Speech API client bridge and server speech provider interface.

import { SupportedLanguage } from '@/types';

export interface SpeechRecognitionOptions {
  language: SupportedLanguage;
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export class SpeechBridge {
  private recognition: any = null;
  private isListening = false;

  isBrowserSpeechSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return Boolean(
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition
    );
  }

  isSynthesisSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }

  startListening(options: SpeechRecognitionOptions): boolean {
    if (!this.isBrowserSpeechSupported()) {
      options.onError('Browser Speech Recognition is not supported in this browser. Please use text input.');
      return false;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      // Language code: en-US for English, hi-IN for Hindi
      this.recognition.lang = options.language === 'hi' ? 'hi-IN' : 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        options.onStart?.();
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        options.onResult(text, Boolean(finalTranscript));
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        let message = 'Speech recognition error';
        if (event.error === 'not-allowed') {
          message = 'Microphone access was denied. Please allow microphone permissions or switch to text mode.';
        } else if (event.error === 'no-speech') {
          message = 'No speech was detected. Please try speaking again or use text.';
        } else {
          message = `Speech error: ${event.error}`;
        }
        options.onError(message);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        options.onEnd?.();
      };

      this.recognition.start();
      return true;
    } catch (err: unknown) {
      this.isListening = false;
      const msg = err instanceof Error ? err.message : String(err);
      options.onError(`Could not start microphone: ${msg}`);
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // Ignore stop error
      }
      this.isListening = false;
    }
  }

  speakText(text: string, language: SupportedLanguage, onEnd?: () => void) {
    if (!this.isSynthesisSupported()) return;

    try {
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95; // Slightly slower for clinical clarity
      utterance.pitch = 1.0;

      if (onEnd) {
        utterance.onend = onEnd;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis failed:', err);
    }
  }

  stopSpeaking() {
    if (this.isSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechBridge = new SpeechBridge();
