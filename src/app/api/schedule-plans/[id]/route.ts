import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { SchedulePlan } from '@/types';

const dataStore = new DataStore();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const plan = dataStore.schedulePlans.getById(params.id);
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
    const plan = await request.json() as Partial<SchedulePlan>;
    const updatedPlan = dataStore.schedulePlans.update(params.id, plan);
    if (!updatedPlan) {
      return NextResponse.json({ error: 'Schedule plan not found' }, { status: 404 });
    }
    return NextResponse.json(updatedPlan);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update schedule plan' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = dataStore.schedulePlans.delete(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Schedule plan not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Schedule plan deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete schedule plan' }, { status: 500 });
  }
}
