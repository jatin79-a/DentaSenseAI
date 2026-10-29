// DentaSense AI — Evaluation Metrics Engine
// Mathematically rigorous calculation of Sensitivity, Specificity, Precision, F1-Score, and Confusion Matrix.

import { EvaluationCase, EvaluationMetricResult, UrgencyCategory } from '@/types';

export const EVALUATION_LABELS: UrgencyCategory[] = [
  'emergency',
  'urgent_dental',
  'routine_dental',
  'self_care_monitor',
  'insufficient_evidence',
];

export interface ModelPrediction {
  caseId: string;
  predictedUrgency: UrgencyCategory;
  goldUrgency: UrgencyCategory;
  isSimulated: boolean;
}

/**
 * Computes multi-class and binary metrics (Urgent/Emergency vs Non-Urgent) across benchmark cases.
 */
export function calculateEvaluationMetrics(predictions: ModelPrediction[]): EvaluationMetricResult {
  const totalCases = predictions.length;

  if (totalCases === 0) {
    return {
      accuracy: 0,
      sensitivity: 0,
      specificity: 0,
      precision: 0,
      f1Score: 0,
      totalCases: 0,
      truePositives: 0,
      trueNegatives: 0,
      falsePositives: 0,
      falseNegatives: 0,
      confusionMatrix: {
        labels: EVALUATION_LABELS,
        matrix: EVALUATION_LABELS.map(() => EVALUATION_LABELS.map(() => 0)),
      },
    };
  }

  // Initialize confusion matrix: [actualIndex][predictedIndex]
  const matrix: number[][] = EVALUATION_LABELS.map(() => EVALUATION_LABELS.map(() => 0));

  let overallCorrect = 0;

  // Binary classification: "High Urgency" (emergency or urgent_dental) vs "Low Urgency" (routine, self-care, insufficient)
  let tp = 0; // High urgency predicted as High urgency
  let tn = 0; // Low urgency predicted as Low urgency
  let fp = 0; // Low urgency predicted as High urgency
  let fn = 0; // High urgency predicted as Low urgency

  for (const pred of predictions) {
    const actualIdx = EVALUATION_LABELS.indexOf(pred.goldUrgency);
    const predIdx = EVALUATION_LABELS.indexOf(pred.predictedUrgency);

    if (actualIdx !== -1 && predIdx !== -1) {
      matrix[actualIdx][predIdx] += 1;
    }

    if (pred.goldUrgency === pred.predictedUrgency) {
      overallCorrect++;
    }

    const actualIsHigh = pred.goldUrgency === 'emergency' || pred.goldUrgency === 'urgent_dental';
    const predIsHigh = pred.predictedUrgency === 'emergency' || pred.predictedUrgency === 'urgent_dental';

    if (actualIsHigh && predIsHigh) tp++;
    else if (!actualIsHigh && !predIsHigh) tn++;
    else if (!actualIsHigh && predIsHigh) fp++;
    else if (actualIsHigh && !predIsHigh) fn++;
  }

  const accuracy = totalCases > 0 ? overallCorrect / totalCases : 0;
  const sensitivity = tp + fn > 0 ? tp / (tp + fn) : 0; // Recall of high-urgency cases
  const specificity = tn + fp > 0 ? tn / (tn + fp) : 0; // Correctly ruling out low-urgency
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const f1Score = precision + sensitivity > 0 ? (2 * precision * sensitivity) / (precision + sensitivity) : 0;

  return {
    accuracy,
    sensitivity,
    specificity,
    precision,
    f1Score,
    totalCases,
    truePositives: tp,
    trueNegatives: tn,
    falsePositives: fp,
    falseNegatives: fn,
    confusionMatrix: {
      labels: EVALUATION_LABELS,
      matrix,
    },
  };
}
