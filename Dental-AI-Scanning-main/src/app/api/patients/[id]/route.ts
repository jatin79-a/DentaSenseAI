// DentaSense AI — /api/patients/[id]
// GET: Retrieve single patient and screening statistics
// PUT: Update patient contact details or language preference
// DELETE: Securely delete patient record and cascade associated assessments

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbStore } from '@/lib/supabase/db-store';

const UpdatePatientSchema = z.object({
  full_name: z.string().min(2).optional(),
  date_of_birth: z.string().optional().nullable(),
  preferred_language: z.enum(['en', 'hi']).optional(),
  contact_email: z.string().email().optional().nullable().or(z.literal('')),
  contact_phone: z.string().optional().nullable().or(z.literal('')),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const patient = await dbStore.getPatientById(id);

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const assessments = await dbStore.getAssessments({ patientId: id });

    return NextResponse.json({
      patient,
      assessments,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve patient profile';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validated = UpdatePatientSchema.parse(body);

    const updated = await dbStore.updatePatient(id, validated);
    if (!updated) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : 'Failed to update patient';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await dbStore.deletePatient(id);

    if (!success) {
      return NextResponse.json({ error: 'Patient not found or already deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Patient and all associated records deleted permanently.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to delete patient';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
