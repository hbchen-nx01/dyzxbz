import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';
import { Schedule } from '@/types';

const dataStore = DataStore.getInstance();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const schedules = dataStore.getSchedules();
    const plan = schedules.find(s => s.id === params.id);
    if (!plan) {
      return NextResponse.json({ error: 'Schedule plan not found' }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schedule plan' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const plan = await request.json() as Partial<Schedule>;
    // 这里需要实现更新调度计划的逻辑
    return NextResponse.json({ message: 'Schedule plan updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update schedule plan' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 这里需要实现删除调度计划的逻辑
    return NextResponse.json({ message: 'Schedule plan deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete schedule plan' }, { status: 500 });
  }
}
