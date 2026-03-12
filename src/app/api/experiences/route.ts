import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';

export async function GET() {
  try {
    const store = DataStore.getInstance();
    const experiences = store.getExperiences();
    return NextResponse.json(experiences);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const store = DataStore.getInstance();
    const newExperience = store.createExperience(body);
    return NextResponse.json(newExperience, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 });
  }
}
