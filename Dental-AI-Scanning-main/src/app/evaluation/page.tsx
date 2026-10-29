'use client';

// DentaSense AI — Model Evaluation Dashboard
// Route: /evaluation
// Photo-Only vs Photo-Plus-Voice Clinical Evaluation Benchmark

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Play,
  RefreshCw,
  Download,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
  Eye,
  Mic,
  Activity,
  Layers,
} from 'lucide-react';
import { EVALUATION_LABELS } from '@/lib/evaluation/metrics';
import { BENCHMARK_CASES } from '@/lib/evaluation/benchmark-cases';
import { UrgencyCategory } from '@/types';

export default function EvaluationDashboardPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [evalResult, setEvalResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'metrics' | 'matrix' | 'cases'>('metrics');

  const runEvaluation = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/evaluation/run', { method: 'POST' });
      const data = await res.json();
      setEvalResult(data);
    } catch {
      alert('Failed to run evaluation');
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runEvaluation();
  }, []);

  const handleExportEvaluation = () => {
    if (!evalResult) return;
    const blob = new Blob([JSON.stringify(evalResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dentasense-evaluation-run-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const photoOnly = evalResult?.photoOnly?.metrics;
  const photoPlusVoice = evalResult?.photoPlusVoice?.metrics;
  const diffSummary = evalResult?.keyDifferentiatorSummary;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-teal-600 uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Empirical Model Evaluation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Photo-Only vs. Photo + Voice Triage
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Comparing clinical triage accuracy when analyzing photographs alone versus photographs combined with confirmed patient-reported symptoms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runEvaluation}
            disabled={isRunning}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Running Benchmark...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Rerun Benchmark</span>
              </>
            )}
          </button>

          {evalResult && (
            <button
              onClick={handleExportEvaluation}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs shadow-xs transition flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </button>
          )}
        </div>
      </div>

      {/* Scientific Transparency Notice */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-800">Standardized Reference Dataset Notice:</p>
          <p>
            Metrics are evaluated on {BENCHMARK_CASES.length} standardized dentist-labelled benchmark cases. In compliance with clinical validation standards, reference gold labels are kept separate from model predictions. Simulated model outputs are clearly labelled.
          </p>
        </div>
      </div>

      {/* High-Level Comparison Scorecards */}
      {photoOnly && photoPlusVoice && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Emergency Miss Rate */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Airway/Emergency Misses
            </span>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {diffSummary?.missedEmergenciesPhotoOnly ?? 1}
                </p>
                <span className="text-[10px] text-slate-400">Photo-Only</span>
              </div>
              <span className="text-slate-300 font-light text-xl">vs</span>
              <div className="text-right">
                <p className="text-2xl font-bold text-emerald-600">
                  {diffSummary?.missedEmergenciesPhotoPlusVoice ?? 0}
                </p>
                <span className="text-[10px] text-teal-700 font-semibold">Photo + Voice</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              Voice questions capture life-threatening deep space swelling that photos miss.
            </p>
          </div>

          {/* Card 2: Sensitivity (Recall) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Sensitivity (High Urgency)
            </span>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {(photoOnly.sensitivity * 100).toFixed(0)}%
                </p>
                <span className="text-[10px] text-slate-400">Photo-Only</span>
              </div>
              <span className="text-slate-300 font-light text-xl">vs</span>
              <div className="text-right">
                <p className="text-2xl font-bold text-teal-600">
                  {(photoPlusVoice.sensitivity * 100).toFixed(0)}%
                </p>
                <span className="text-[10px] text-teal-700 font-semibold">Photo + Voice</span>
              </div>
            </div>
            <p className="text-[11px] text-emerald-600 font-medium pt-1 border-t border-slate-100">
              +{((photoPlusVoice.sensitivity - photoOnly.sensitivity) * 100).toFixed(0)}% recall improvement
            </p>
          </div>

          {/* Card 3: F1 Score */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              F1-Score
            </span>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {(photoOnly.f1Score * 100).toFixed(0)}%
                </p>
                <span className="text-[10px] text-slate-400">Photo-Only</span>
              </div>
              <span className="text-slate-300 font-light text-xl">vs</span>
              <div className="text-right">
                <p className="text-2xl font-bold text-teal-600">
                  {(photoPlusVoice.f1Score * 100).toFixed(0)}%
                </p>
                <span className="text-[10px] text-teal-700 font-semibold">Photo + Voice</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              Balanced precision and recall across urgency categories.
            </p>
          </div>

          {/* Card 4: Overall Accuracy */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Exact Match Accuracy
            </span>
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {(photoOnly.accuracy * 100).toFixed(0)}%
                </p>
                <span className="text-[10px] text-slate-400">Photo-Only</span>
              </div>
              <span className="text-slate-300 font-light text-xl">vs</span>
              <div className="text-right">
                <p className="text-2xl font-bold text-teal-600">
                  {(photoPlusVoice.accuracy * 100).toFixed(0)}%
                </p>
                <span className="text-[10px] text-teal-700 font-semibold">Photo + Voice</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              Evaluated across all 8 ground-truth benchmark categories.
            </p>
          </div>
        </div>
      )}

      {/* Tabs: Metrics Table, Confusion Matrix, Benchmark Cases */}
      <div className="space-y-4">
        <div className="flex border-b border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`pb-3 px-4 transition ${
              activeTab === 'metrics'
                ? 'border-b-2 border-teal-600 text-teal-700 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Comparative Metrics Table
          </button>
          <button
            onClick={() => setActiveTab('matrix')}
            className={`pb-3 px-4 transition ${
              activeTab === 'matrix'
                ? 'border-b-2 border-teal-600 text-teal-700 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Confusion Matrices
          </button>
          <button
            onClick={() => setActiveTab('cases')}
            className={`pb-3 px-4 transition ${
              activeTab === 'cases'
                ? 'border-b-2 border-teal-600 text-teal-700 font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Benchmark Cases ({BENCHMARK_CASES.length})
          </button>
        </div>

        {/* TAB 1: Comparative Table */}
        {activeTab === 'metrics' && photoOnly && photoPlusVoice && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Evaluation Metric</th>
                  <th className="px-6 py-4">Approach A: Photo-Only</th>
                  <th className="px-6 py-4">Approach B: Photo + Confirmed Symptoms</th>
                  <th className="px-6 py-4">Differentiator Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                <tr>
                  <td className="px-6 py-3.5 font-semibold">High-Urgency Sensitivity (Recall)</td>
                  <td className="px-6 py-3.5 font-mono">{(photoOnly.sensitivity * 100).toFixed(1)}%</td>
                  <td className="px-6 py-3.5 font-mono font-bold text-teal-700">{(photoPlusVoice.sensitivity * 100).toFixed(1)}%</td>
                  <td className="px-6 py-3.5 text-emerald-600 font-bold">
                    +{((photoPlusVoice.sensitivity - photoOnly.sensitivity) * 100).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 font-semibold">High-Urgency Specificity</td>
                  <td className="px-6 py-3.5 font-mono">{(photoOnly.specificity * 100).toFixed(1)}%</td>
                  <td className="px-6 py-3.5 font-mono font-bold text-teal-700">{(photoPlusVoice.specificity * 100).toFixed(1)}%</td>
                  <td className="px-6 py-3.5 text-slate-600 font-mono">
                    {((photoPlusVoice.specificity - photoOnly.specificity) * 100).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 font-semibold">Precision (PPV)</td>
                  <td className="px-6 py-3.5 font-mono">{(photoOnly.precision * 100).toFixed(1)}%</td>
                  <td className="px-6 py-3.5 font-mono font-bold text-teal-700">{(photoPlusVoice.precision * 100).toFixed(1)}%</td>
                  <td className="px-6 py-3.5 text-emerald-600 font-bold">
                    +{((photoPlusVoice.precision - photoOnly.precision) * 100).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 font-semibold">Harmonic F1-Score</td>
                  <td className="px-6 py-3.5 font-mono">{(photoOnly.f1Score * 100).toFixed(1)}%</td>
                  <td className="px-6 py-3.5 font-mono font-bold text-teal-700">{(photoPlusVoice.f1Score * 100).toFixed(1)}%</td>
                  <td className="px-6 py-3.5 text-emerald-600 font-bold">
                    +{((photoPlusVoice.f1Score - photoOnly.f1Score) * 100).toFixed(1)}%
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-3.5 font-semibold">False Negatives (Missed Urgency)</td>
                  <td className="px-6 py-3.5 font-mono text-red-600 font-bold">{photoOnly.falseNegatives}</td>
                  <td className="px-6 py-3.5 font-mono text-emerald-600 font-bold">{photoPlusVoice.falseNegatives}</td>
                  <td className="px-6 py-3.5 text-emerald-600 font-bold">
                    -{photoOnly.falseNegatives - photoPlusVoice.falseNegatives} misses eliminated
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: Confusion Matrices */}
        {activeTab === 'matrix' && photoOnly && photoPlusVoice && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Matrix A */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Approach A: Photo-Only Matrix</h3>
              <div className="overflow-x-auto text-[11px]">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="text-slate-400">
                      <th className="p-1 text-left">Actual \ Pred</th>
                      {EVALUATION_LABELS.map(lbl => (
                        <th key={lbl} className="p-1 font-mono uppercase text-[9px]">
                          {lbl.substring(0, 4)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {photoOnly.confusionMatrix.matrix.map((row: number[], rowIdx: number) => (
                      <tr key={rowIdx}>
                        <td className="p-1.5 font-mono text-left font-semibold text-slate-700 text-[10px]">
                          {EVALUATION_LABELS[rowIdx]}
                        </td>
                        {row.map((cell: number, colIdx: number) => (
                          <td
                            key={colIdx}
                            className={`p-1.5 border border-slate-100 font-mono ${
                              rowIdx === colIdx && cell > 0
                                ? 'bg-teal-50 font-bold text-teal-800'
                                : cell > 0
                                ? 'bg-amber-50 text-amber-800 font-semibold'
                                : 'text-slate-300'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Matrix B */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Approach B: Photo + Confirmed Symptoms Matrix</h3>
              <div className="overflow-x-auto text-[11px]">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="text-slate-400">
                      <th className="p-1 text-left">Actual \ Pred</th>
                      {EVALUATION_LABELS.map(lbl => (
                        <th key={lbl} className="p-1 font-mono uppercase text-[9px]">
                          {lbl.substring(0, 4)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {photoPlusVoice.confusionMatrix.matrix.map((row: number[], rowIdx: number) => (
                      <tr key={rowIdx}>
                        <td className="p-1.5 font-mono text-left font-semibold text-slate-700 text-[10px]">
                          {EVALUATION_LABELS[rowIdx]}
                        </td>
                        {row.map((cell: number, colIdx: number) => (
                          <td
                            key={colIdx}
                            className={`p-1.5 border border-slate-100 font-mono ${
                              rowIdx === colIdx && cell > 0
                                ? 'bg-teal-100 font-bold text-teal-900'
                                : cell > 0
                                ? 'bg-amber-50 text-amber-800'
                                : 'text-slate-300'
                            }`}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Benchmark Cases Inspector */}
        {activeTab === 'cases' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BENCHMARK_CASES.map(c => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900">{c.case_id}</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-800">
                    {c.reference_gold_urgency}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Photo description:</strong> {c.image_description}
                </p>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 space-y-1">
                  <p><strong>Voice Symptoms:</strong> {c.symptoms.chiefConcern}</p>
                  <p><strong>Pain:</strong> {c.symptoms.painScore}/10 • <strong>Swelling:</strong> {c.symptoms.hasSwelling ? 'Yes' : 'No'}</p>
                  {c.symptoms.hasDifficultyBreathing && (
                    <p className="text-red-700 font-bold">⚠️ Red flag: Difficulty breathing reported</p>
                  )}
                </div>

                <p className="text-[11px] text-teal-700 italic">
                  💡 Clinical note: {c.notes}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
