import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';
import { MaintenancePlan } from '@/types';

const dataStore = DataStore.getInstance();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const plans = dataStore.getMaintenancePlans();
    const plan = plans.find(p => p.id === params.id);
    if (!plan) {
      return NextResponse.json({ error: 'Maintenance plan not found' }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch maintenance plan' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const plan = await request.json() as Partial<MaintenancePlan>;
    // 这里需要实现更新维护计划的逻辑
    return NextResponse.json({ message: 'Maintenance plan updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update maintenance plan' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 这里需要实现删除维护计划的逻辑
    return NextResponse.json({ message: 'Maintenance plan deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete maintenance plan' }, { status: 500 });
  }
}
