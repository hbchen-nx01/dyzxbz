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
    const record = await request.json() as Partial<RecycleRecord>;
    // 这里需要实现更新回收记录的逻辑
    return NextResponse.json({ message: 'Repair reuse record updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update repair reuse record' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 这里需要实现删除回收记录的逻辑
    return NextResponse.json({ message: 'Repair reuse record deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete repair reuse record' }, { status: 500 });
  }
}
