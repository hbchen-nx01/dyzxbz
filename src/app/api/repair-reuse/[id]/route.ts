import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { RepairReuse } from '@/types';

const dataStore = new DataStore();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const record = dataStore.repairReuse.getById(params.id);
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
    const record = await request.json() as Partial<RepairReuse>;
    const updatedRecord = dataStore.repairReuse.update(params.id, record);
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
    const success = dataStore.repairReuse.delete(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Repair reuse record not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Repair reuse record deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete repair reuse record' }, { status: 500 });
  }
}
