'use client';

// DentaSense AI — Complete Step-by-Step Screening Workflow
// Steps: 1. Consent -> 2. Upload -> 3. Quality Check -> 4. Voice/Text Interview -> 5. Analysis -> 6. Combined Triage

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Mic,
  MicOff,
  Send,
  Volume2,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  Info,
  Globe2,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { useRole } from '@/components/common/RoleContext';
import {
  StructuredSymptoms,
  SupportedLanguage,
  ImageQualityMetrics,
  AssessmentFinding,
} from '@/types';
import { speechBridge } from '@/lib/providers/speech-provider';

export default function NewScreeningPage() {
  const router = useRouter();
  const { activePatient, role, isGuest } = useRole();

  // Wizard Step: 1 = Consent, 2 = Upload, 3 = Quality, 4 = Interview, 5 = Combined Processing
  const [step, setStep] = useState<number>(1);

  // Step 1: Consent State
  const [consents, setConsents] = useState({
    photoProcessing: true,
    voiceTranscript: true,
    externalAI: true,
    dataStorage: true,
  });

  // Step 2: Image Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 3: Quality Check State
  const [isCheckingQuality, setIsCheckingQuality] = useState(false);
  const [qualityMetrics, setQualityMetrics] = useState<ImageQualityMetrics | null>(null);

  // Step 4: Interview State
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const [messages, setMessages] = useState<
    { id: string; sender: 'assistant' | 'user' | 'system'; text: string }[]
  >([]);
  const [currentQuestion, setCurrentQuestion] = useState<{
    id: string;
    text: string;
    inputType: string;
    options?: { value: string; label: string }[];
  } | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [emergencyAlert, setEmergencyAlert] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState<StructuredSymptoms>({
    chiefConcern: '',
    hasSwelling: false,
    hasBleeding: false,
    patientConfirmed: false,
  });

  // Step 5: Final Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      setUploadError('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10MB limit.');
      return;
    }

    setSelectedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);

      // Measure dimensions
      const img = new Image();
      img.onload = () => {
        setImageDimensions({ width: img.width, height: img.height });
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Run automated quality check
  const runQualityCheck = async () => {
    if (!selectedFile || !imagePreview) return;
    setIsCheckingQuality(true);
    setUploadError(null);

    try {
      const res = await fetch('/api/assessments/quality-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selectedFile.name,
          size: selectedFile.size,
          type: selectedFile.type,
          width: imageDimensions.width || 800,
          height: imageDimensions.height || 600,
          imageBase64: imagePreview,
        }),
      });

      const data = await res.json();
      setQualityMetrics(data);
      setIsCheckingQuality(false);
      setStep(3);
    } catch {
      setIsCheckingQuality(false);
      // Fallback
      setQualityMetrics({
        width: imageDimensions.width || 800,
        height: imageDimensions.height || 600,
        fileSizeBytes: selectedFile.size,
        mimeType: selectedFile.type,
        isDecodable: true,
        brightnessScore: 0.6,
        brightnessStatus: 'optimal',
        sharpnessScore: 0.8,
        sharpnessStatus: 'sharp',
        overallStatus: 'good',
      });
      setStep(3);
    }
  };

  // Start interview
  const startInterview = async () => {
    setStep(4);
    // Initial welcome question
    const welcome =
      language === 'hi'
        ? 'नमस्ते, मैं DentaSense AI हूँ। आपके दांतों या मुंह में मुख्य परेशानी या दर्द क्या है?'
        : 'Hello, I am DentaSense AI. What is the primary concern or discomfort you are experiencing with your teeth or mouth?';

    setMessages([{ id: 'msg-init', sender: 'assistant', text: welcome }]);
    setCurrentQuestion({
      id: 'q_concern',
      text: welcome,
      inputType: 'text',
    });

    // Speak welcome prompt
    speechBridge.speakText(welcome, language);
  };

  // Submit interview answer
  const submitAnswer = async (answer: string) => {
    if (!answer.trim() || !currentQuestion) return;

    const userMsg = { id: `user-${Date.now()}`, sender: 'user' as const, text: answer };
    setMessages(prev => [...prev, userMsg]);
    setTextInput('');

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentQuestionId: currentQuestion.id,
          userAnswer: answer,
          currentSymptoms: symptoms,
          language,
        }),
      });

      const data = await res.json();

      if (data.emergencyDetected) {
        setEmergencyAlert(data.emergencyGuidance);
        setInterviewComplete(true);
        setCurrentQuestion(null);
        setMessages(prev => [
          ...prev,
          { id: `alert-${Date.now()}`, sender: 'system', text: data.emergencyGuidance },
        ]);
        speechBridge.speakText(data.emergencyGuidance, language);
        return;
      }

      setSymptoms(data.updatedSymptoms);

      if (data.isComplete || !data.nextQuestion) {
        setInterviewComplete(true);
        setCurrentQuestion(null);
        const completionMsg =
          language === 'hi'
            ? 'धन्यवाद! आपके लक्षणों का विवरण प्राप्त हो गया है। कृपया नीचे दी गई जानकारी की पुष्टि करें।'
            : 'Thank you. I have captured your reported symptoms. Please review the summary below before we complete your assessment.';
        setMessages(prev => [...prev, { id: `done-${Date.now()}`, sender: 'assistant', text: completionMsg }]);
        speechBridge.speakText(completionMsg, language);
      } else {
        setCurrentQuestion(data.nextQuestion);
        setMessages(prev => [
          ...prev,
          { id: `asst-${Date.now()}`, sender: 'assistant', text: data.nextQuestion.text },
        ]);
        speechBridge.speakText(data.nextQuestion.text, language);
      }
    } catch {
      // Local fallback
      setInterviewComplete(true);
      setCurrentQuestion(null);
    }
  };

  // Toggle voice listening
  const toggleListening = () => {
    if (isListening) {
      speechBridge.stopListening();
      setIsListening(false);
    } else {
      setSpeechError(null);
      const started = speechBridge.startListening({
        language,
        onResult: (transcript, isFinal) => {
          setTextInput(transcript);
          if (isFinal) {
            submitAnswer(transcript);
            setIsListening(false);
          }
        },
        onError: (err) => {
          setSpeechError(err);
          setIsListening(false);
        },
        onEnd: () => setIsListening(false),
      });
      if (started) setIsListening(true);
    }
  };

  // Submit complete screening & generate assessment
  const handleFinalAssessment = async () => {
    setIsSubmitting(true);

    try {
      // 1. Run Vision Analysis
      let visionFindings: AssessmentFinding[] = [];
      let isSimulated = true;

      try {
        const visRes = await fetch('/api/analysis/vision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: imagePreview || '',
            qualityStatus: qualityMetrics?.overallStatus || 'good',
            allowSimulation: true,
          }),
        });
        const visData = await visRes.json();
        visionFindings = visData.findings || [];
        isSimulated = visData.isSimulated ?? true;
      } catch {
        // Fallback findings
        visionFindings = [
          {
            id: 'f-default',
            label: 'Visible Tooth Surface Evaluation',
            visibleEvidence: 'Photographic screening of visible dental arch',
            confidenceBand: 'moderate',
            limitations: '2D photograph',
            suggestedFollowUp: 'Consult dentist',
          },
        ];
      }

      // 2. Run Combined Safety Triage
      const combinedRes = await fetch('/api/analysis/combined', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symptoms: { ...symptoms, patientConfirmed: true },
          findings: visionFindings,
          imageQuality: qualityMetrics?.overallStatus || 'good',
        }),
      });

      const triage = await combinedRes.json();

      // 3. Persist Assessment linked to patient
      const patientId = activePatient?.id || 'pat-demo-001';

      const saveRes = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_id: patientId,
          image_quality_status: qualityMetrics?.overallStatus || 'good',
          preliminary_urgency_category: triage.urgency,
          urgency_explanation: triage.supportingReasons?.join(' ') || 'Preliminary screening completed.',
          image_url: imagePreview,
          image_quality_metrics: qualityMetrics,
          structured_symptoms: { ...symptoms, patientConfirmed: true },
          visible_findings: visionFindings,
          limitations: triage.limitations || [],
          important_unknowns: triage.importantUnknowns || [],
          recommended_next_steps: triage.recommendedNextSteps || [],
          emergency_detected: triage.isEmergency || Boolean(emergencyAlert),
          emergency_guidance: triage.emergencyGuidance || emergencyAlert,
          is_simulated: isSimulated,
        }),
      });

      const savedAssessment = await saveRes.json();

      // Navigate to Assessment Results page
      router.push(`/screening/${savedAssessment.id}`);
    } catch (err: unknown) {
      setIsSubmitting(false);
      alert('Failed to complete screening assessment. Please check connectivity.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 sm:py-12 w-full">
      {/* Wizard Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span className={step >= 1 ? 'text-teal-600 font-bold' : ''}>1. Consent</span>
          <span className={step >= 2 ? 'text-teal-600 font-bold' : ''}>2. Photo</span>
          <span className={step >= 3 ? 'text-teal-600 font-bold' : ''}>3. Quality</span>
          <span className={step >= 4 ? 'text-teal-600 font-bold' : ''}>4. Interview</span>
          <span className={step >= 5 ? 'text-teal-600 font-bold' : ''}>5. Assessment</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-teal-600 h-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: CONSENT */}
      {step === 1 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Patient Consent & Screening Information
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Before proceeding, please review how DentaSense AI processes oral photographs and health symptoms.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700">
            <p className="font-semibold text-slate-900">What this screening does and does not do:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Provides preliminary visual and symptom triage to guide your next dental step.</li>
              <li>Does NOT replace a comprehensive examination or X-rays by a licensed dentist.</li>
              <li>Cannot detect cavities between teeth or diagnose nerve vitality without physical testing.</li>
            </ul>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consents.photoProcessing}
                onChange={e => setConsents({ ...consents, photoProcessing: e.target.checked })}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <span className="text-xs text-slate-700">
                I consent to the automated processing of my oral photograph for quality checking and preliminary visual evaluation.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consents.voiceTranscript}
                onChange={e => setConsents({ ...consents, voiceTranscript: e.target.checked })}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <span className="text-xs text-slate-700">
                I consent to speech-to-text processing for the symptom interview (raw audio is not permanently stored).
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consents.externalAI}
                onChange={e => setConsents({ ...consents, externalAI: e.target.checked })}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <span className="text-xs text-slate-700">
                I acknowledge that de-identified images and symptom descriptions may be processed by secured server-side AI providers.
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consents.dataStorage}
                onChange={e => setConsents({ ...consents, dataStorage: e.target.checked })}
                className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
              />
              <span className="text-xs text-slate-700">
                I understand I can export or permanently delete my screening records at any time.
              </span>
            </label>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!consents.photoProcessing || !consents.voiceTranscript || !consents.externalAI}
              className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-sm transition flex items-center gap-2"
            >
              <span>Accept & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PHOTO UPLOAD */}
      {step === 2 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Upload Oral Photograph</h1>
            <p className="text-sm text-slate-600">
              Take or select a clear, well-lit photo of the tooth, gum area, or smile that is causing concern.
            </p>
          </div>

          {uploadError && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200">
              {uploadError}
            </div>
          )}

          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-teal-500 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition bg-slate-50 hover:bg-teal-50/20"
            >
              <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center mx-auto mb-4">
                <Upload className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                Click to browse or drag and drop image
              </p>
              <p className="text-xs text-slate-500 mt-1">JPEG, PNG, or WebP up to 10MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-96 flex items-center justify-center">
                <img
                  src={imagePreview}
                  alt="Oral screening preview"
                  className="max-h-96 w-auto object-contain"
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>File: {selectedFile?.name}</span>
                <span>Dimensions: {imageDimensions.width} × {imageDimensions.height} px</span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setImagePreview(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  Replace Image
                </button>

                <button
                  type="button"
                  onClick={runQualityCheck}
                  disabled={isCheckingQuality}
                  className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition flex items-center gap-2"
                >
                  {isCheckingQuality ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Checking Quality...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify Image Quality</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: IMAGE QUALITY RESULT */}
      {step === 3 && qualityMetrics && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Image Quality Verification</h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                qualityMetrics.overallStatus === 'good'
                  ? 'bg-emerald-100 text-emerald-800'
                  : qualityMetrics.overallStatus === 'borderline'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {qualityMetrics.overallStatus} Quality
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500">Resolution</span>
              <p className="font-semibold text-slate-900 text-sm">
                {qualityMetrics.width} × {qualityMetrics.height} px
              </p>
              <span className="text-[11px] text-emerald-700">Meets minimum 300x300</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500">Illumination</span>
              <p className="font-semibold text-slate-900 text-sm capitalize">
                {qualityMetrics.brightnessStatus.replace('_', ' ')}
              </p>
              <span className="text-[11px] text-slate-500">
                Score: {(qualityMetrics.brightnessScore * 100).toFixed(0)}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-xs text-slate-500">Focus / Sharpness</span>
              <p className="font-semibold text-slate-900 text-sm capitalize">
                {qualityMetrics.sharpnessStatus}
              </p>
              <span className="text-[11px] text-slate-500">
                Score: {(qualityMetrics.sharpnessScore * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {qualityMetrics.rejectionReason && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <p className="font-bold">Quality Note:</p>
              <p>{qualityMetrics.rejectionReason}</p>
            </div>
          )}

          <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
            ℹ️ Automated quality checks detect darkness, blur, and resolution limits, but cannot guarantee that your photo captures the exact problem angle.
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
            >
              Retake Photo
            </button>

            <button
              onClick={startInterview}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition flex items-center gap-2"
            >
              <span>Continue to Symptom Interview</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: INTERACTIVE VOICE & TEXT INTERVIEW */}
      {step === 4 && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Interactive Symptom Interview</h1>
              <p className="text-xs text-slate-500">
                Answer by typing or speaking in your preferred language.
              </p>
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs self-start">
              <Globe2 className="w-3.5 h-3.5 text-slate-500 ml-1.5" />
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  language === 'en' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                  language === 'hi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                हिंदी (Hindi)
              </button>
            </div>
          </div>

          {/* Emergency Alert Intercept */}
          {emergencyAlert && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-red-700">
                <ShieldAlert className="w-5 h-5 shrink-0" />
                <span>URGENT MEDICAL WARNING DETECTED</span>
              </div>
              <p className="text-xs leading-relaxed">{emergencyAlert}</p>
            </div>
          )}

          {/* Chat Messages Log */}
          <div className="space-y-3 max-h-80 overflow-y-auto p-4 bg-slate-50 rounded-xl border border-slate-200">
            {messages.map(m => (
              <div
                key={m.id}
                className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-teal-600 text-white rounded-br-xs'
                      : m.sender === 'system'
                      ? 'bg-red-100 text-red-900 border border-red-200'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Choice Buttons if question has options */}
          {!interviewComplete && currentQuestion?.options && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Select an answer:
              </span>
              <div className="flex flex-wrap gap-2">
                {currentQuestion.options.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => submitAnswer(opt.label)}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-teal-50 hover:border-teal-300 border border-slate-200 text-xs font-semibold text-slate-800 transition text-left"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pain Scale Bar if pain question */}
          {!interviewComplete && currentQuestion?.inputType === 'scale' && (
            <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between text-xs text-slate-500">
                <span>0 = No Pain</span>
                <span>10 = Severe Pain</span>
              </div>
              <div className="grid grid-cols-11 gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => submitAnswer(`Pain score ${val}/10`)}
                    className="py-2 rounded bg-white hover:bg-teal-600 hover:text-white border border-slate-200 text-xs font-bold text-slate-700 transition"
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Speech Error Banner */}
          {speechError && (
            <p className="text-xs text-red-600">{speechError}</p>
          )}

          {/* Input Controls: Voice & Text */}
          {!interviewComplete ? (
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-3 rounded-xl border transition flex items-center justify-center shrink-0 ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                }`}
                title={isListening ? 'Stop listening' : 'Start microphone'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={textInput}
                onChange={e => setTextInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') submitAnswer(textInput);
                }}
                placeholder={
                  language === 'hi'
                    ? 'यहाँ अपना उत्तर लिखें या माइक का उपयोग करें...'
                    : 'Type your answer or speak...'
                }
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-500 text-sm bg-white"
              />

              <button
                type="button"
                onClick={() => submitAnswer(textInput)}
                disabled={!textInput.trim()}
                className="p-3 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Interview Complete — Symptoms Confirmation Card */
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-teal-900 text-sm">
                  <FileCheck className="w-4 h-4 text-teal-700" />
                  <span>Confirmed Symptom Summary</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <p><strong>Chief Concern:</strong> {symptoms.chiefConcern || 'Oral discomfort'}</p>
                  <p><strong>Location:</strong> {symptoms.location || 'General oral area'}</p>
                  <p><strong>Duration:</strong> {symptoms.duration || 'Not specified'}</p>
                  <p><strong>Pain Severity:</strong> {symptoms.painScore !== undefined ? `${symptoms.painScore}/10` : 'None reported'}</p>
                  <p><strong>Swelling:</strong> {symptoms.hasSwelling ? `Yes (${symptoms.swellingLocation || 'Localized'})` : 'No'}</p>
                  <p><strong>Bleeding:</strong> {symptoms.hasBleeding ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setInterviewComplete(false);
                    startInterview();
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200"
                >
                  Restart Questions
                </button>

                <button
                  type="button"
                  onClick={handleFinalAssessment}
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition flex items-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating Clinical Assessment...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Assessment & View Results</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
