import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';
import { RecycleRecord } from '@/types';

const dataStore = DataStore.getInstance();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const records = dataStore.getRecycleRecords();
    const record = records.find(r => r.id === params.id);
    if (!record) {
      return NextResponse.json({ error: 'Repair reuse record not found' }, { status: 404 });
    }
    return NextResponse.json(record);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch repair reuse record' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const store = DataStore.getInstance();
    const updatedRecord = store.updateRecycleRecord(params.id, body);
    if (!updatedRecord) {
      return NextResponse.json({ error: 'Repair reuse record not found' }, { status: 404 });
    }
    return NextResponse.json(updatedRecord);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update repair reuse record' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const store = DataStore.getInstance();
    const deleted = store.deleteRecycleRecord(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Repair reuse record not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete repair reuse record' }, { status: 500 });
  }
}
