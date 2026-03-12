import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { TrainingPlan } from '@/types';

const dataStore = new DataStore();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const plan = dataStore.trainingPlans.getById(params.id);
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
    const updatedPlan = dataStore.trainingPlans.update(params.id, plan);
    if (!updatedPlan) {
      return NextResponse.json({ error: 'Training plan not found' }, { status: 404 });
    }
    return NextResponse.json(updatedPlan);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update training plan' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = dataStore.trainingPlans.delete(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Training plan not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Training plan deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete training plan' }, { status: 500 });
  }
}
