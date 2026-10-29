// DentaSense AI — /api/assessments/[id]
// GET: Retrieve detailed assessment results
// DELETE: Delete assessment

import { NextRequest, NextResponse } from 'next/server';
import { dbStore } from '@/lib/supabase/db-store';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assessment = await dbStore.getAssessmentById(id);

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    const patient = await dbStore.getPatientById(assessment.patient_id);

    return NextResponse.json({
      assessment,
      patient,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve assessment';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await dbStore.deleteAssessment(id);

    if (!success) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Assessment record deleted.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete assessment';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
