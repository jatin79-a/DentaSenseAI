// DentaSense AI — /api/evaluation/cases
// Retrieves standardized benchmark cases for model evaluation

import { NextResponse } from 'next/server';
import { BENCHMARK_CASES } from '@/lib/evaluation/benchmark-cases';

export async function GET() {
  return NextResponse.json({
    cases: BENCHMARK_CASES,
    total: BENCHMARK_CASES.length,
    description: 'Standardized dental evaluation benchmark cases labelled with ground-truth clinical urgency.',
  });
}
