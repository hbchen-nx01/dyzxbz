import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';
import { RecycleRecord } from '@/types';

const dataStore = DataStore.getInstance();

export async function GET(request: NextRequest) {
  try {
    const records = dataStore.getRecycleRecords();
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch repair reuse records' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const record = await request.json() as Omit<RecycleRecord, 'id' | 'createdAt'>;
    const newRecord = await dataStore.createRecycleRecord(record);
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create repair reuse record' }, { status: 500 });
  }
}
