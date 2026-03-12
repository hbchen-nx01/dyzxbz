import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { MaintenancePlan } from '@/types';

const dataStore = new DataStore();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const plan = dataStore.maintenancePlans.getById(params.id);
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
    const updatedPlan = dataStore.maintenancePlans.update(params.id, plan);
    if (!updatedPlan) {
      return NextResponse.json({ error: 'Maintenance plan not found' }, { status: 404 });
    }
    return NextResponse.json(updatedPlan);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update maintenance plan' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const success = dataStore.maintenancePlans.delete(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Maintenance plan not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Maintenance plan deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete maintenance plan' }, { status: 500 });
  }
}
