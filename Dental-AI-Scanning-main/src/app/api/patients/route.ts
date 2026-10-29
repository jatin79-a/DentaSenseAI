// DentaSense AI — /api/patients
// GET: Authorized patient search and directory pagination
// POST: Register new patient with collision-safe unique Patient ID

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { dbStore } from '@/lib/supabase/db-store';

const CreatePatientSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  date_of_birth: z.string().optional().nullable(),
  preferred_language: z.enum(['en', 'hi']).default('en'),
  contact_email: z.string().email('Invalid email address').optional().nullable().or(z.literal('')),
  contact_phone: z.string().optional().nullable().or(z.literal('')),
  is_guest: z.boolean().optional().default(false),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const result = await dbStore.getPatients({ search, limit, offset });
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to retrieve patients';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreatePatientSchema.parse(body);

    const patient = await dbStore.createPatient({
      full_name: validated.full_name,
      date_of_birth: validated.date_of_birth || null,
      preferred_language: validated.preferred_language,
      contact_email: validated.contact_email || null,
      contact_phone: validated.contact_phone || null,
      is_guest: validated.is_guest,
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    const msg = err instanceof Error ? err.message : 'Failed to register patient';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
