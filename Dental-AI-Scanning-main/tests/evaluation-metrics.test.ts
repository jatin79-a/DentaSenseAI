import { describe, it, expect } from 'vitest';
import {
  calculateEvaluationMetrics,
  ModelPrediction,
  EVALUATION_LABELS,
} from '../src/lib/evaluation/metrics';

describe('Evaluation Metrics Engine', () => {
  it('handles empty predictions gracefully without division by zero', () => {
    const metrics = calculateEvaluationMetrics([]);
    expect(metrics.totalCases).toBe(0);
    expect(metrics.accuracy).toBe(0);
    expect(metrics.sensitivity).toBe(0);
    expect(metrics.f1Score).toBe(0);
    expect(metrics.confusionMatrix.matrix.length).toBe(EVALUATION_LABELS.length);
  });

  it('accurately calculates Sensitivity, Specificity, Precision, and F1 Score', () => {
    // 4 test predictions:
    // Case 1: Gold = emergency (High), Pred = emergency (High) -> TP
    // Case 2: Gold = urgent_dental (High), Pred = routine_dental (Low) -> FN
    // Case 3: Gold = routine_dental (Low), Pred = routine_dental (Low) -> TN
    // Case 4: Gold = self_care_monitor (Low), Pred = urgent_dental (High) -> FP
    const testPredictions: ModelPrediction[] = [
      { caseId: '1', goldUrgency: 'emergency', predictedUrgency: 'emergency', isSimulated: false },
      { caseId: '2', goldUrgency: 'urgent_dental', predictedUrgency: 'routine_dental', isSimulated: false },
      { caseId: '3', goldUrgency: 'routine_dental', predictedUrgency: 'routine_dental', isSimulated: false },
      { caseId: '4', goldUrgency: 'self_care_monitor', predictedUrgency: 'urgent_dental', isSimulated: false },
    ];

    const metrics = calculateEvaluationMetrics(testPredictions);

    expect(metrics.totalCases).toBe(4);
    expect(metrics.truePositives).toBe(1);
    expect(metrics.falseNegatives).toBe(1);
    expect(metrics.trueNegatives).toBe(1);
    expect(metrics.falsePositives).toBe(1);

    // Sensitivity = TP / (TP + FN) = 1 / (1 + 1) = 0.5
    expect(metrics.sensitivity).toBe(0.5);

    // Specificity = TN / (TN + FP) = 1 / (1 + 1) = 0.5
    expect(metrics.specificity).toBe(0.5);

    // Precision = TP / (TP + FP) = 1 / (1 + 1) = 0.5
    expect(metrics.precision).toBe(0.5);

    // F1 = 2 * (0.5 * 0.5) / (0.5 + 0.5) = 0.5
    expect(metrics.f1Score).toBe(0.5);

    // Accuracy = 2 correct / 4 total = 0.5
    expect(metrics.accuracy).toBe(0.5);
  });

  it('builds a correct 5x5 multi-class confusion matrix', () => {
    const testPredictions: ModelPrediction[] = [
      { caseId: '1', goldUrgency: 'emergency', predictedUrgency: 'emergency', isSimulated: false },
      { caseId: '2', goldUrgency: 'routine_dental', predictedUrgency: 'urgent_dental', isSimulated: false },
    ];

    const metrics = calculateEvaluationMetrics(testPredictions);
    const emergencyIdx = EVALUATION_LABELS.indexOf('emergency');
    const routineIdx = EVALUATION_LABELS.indexOf('routine_dental');
    const urgentIdx = EVALUATION_LABELS.indexOf('urgent_dental');

    // Case 1: [emergency][emergency] = 1
    expect(metrics.confusionMatrix.matrix[emergencyIdx][emergencyIdx]).toBe(1);
    // Case 2: [routine][urgent] = 1
    expect(metrics.confusionMatrix.matrix[routineIdx][urgentIdx]).toBe(1);
  });
});
