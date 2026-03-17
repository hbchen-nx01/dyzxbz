import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';

export async function GET() {
  try {
    const store = DataStore.getInstance();
    const instruments = store.getInstruments();
    return NextResponse.json(instruments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch instruments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const store = DataStore.getInstance();
    const newInstrument = await store.createInstrument(body);
    return NextResponse.json(newInstrument, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create instrument' }, { status: 500 });
  }
}
