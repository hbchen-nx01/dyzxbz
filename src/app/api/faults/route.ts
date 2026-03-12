import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';

export async function GET() {
  try {
    const store = DataStore.getInstance();
    const faults = store.getFaults();
    return NextResponse.json(faults);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch faults' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const store = DataStore.getInstance();
    const newFault = store.createFault(body);
    return NextResponse.json(newFault, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create fault' }, { status: 500 });
  }
}
