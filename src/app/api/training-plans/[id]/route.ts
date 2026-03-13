import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';
import { TrainingPlan } from '@/types';

const dataStore = DataStore.getInstance();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const plans = dataStore.getTrainingPlans();
    const plan = plans.find(p => p.id === params.id);
    if (!plan) {
      return NextResponse.json({ error: 'Training plan not found' }, { status: 404 });
    }
    return NextResponse.json(plan);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch training plan' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const plan = await request.json() as Partial<TrainingPlan>;
    // 这里需要实现更新培训计划的逻辑
    return NextResponse.json({ message: 'Training plan updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update training plan' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 这里需要实现删除培训计划的逻辑
    return NextResponse.json({ message: 'Training plan deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete training plan' }, { status: 500 });
  }
}
