import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';

export async function GET() {
  try {
    const store = DataStore.getInstance();
    const personnel = store.getPersonnel();
    return NextResponse.json(personnel);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch personnel' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const store = DataStore.getInstance();
    const newPersonnel = await store.createPersonnel(body);
    return NextResponse.json(newPersonnel, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create personnel' }, { status: 500 });
  }
}
