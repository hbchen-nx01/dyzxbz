import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';
import { MaintenancePlan } from '@/types';

const dataStore = DataStore.getInstance();

export async function GET(request: NextRequest) {
  try {
    const plans = dataStore.getMaintenancePlans();
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch maintenance plans' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const plan = await request.json() as Omit<MaintenancePlan, 'id' | 'createdAt'>;
    const newPlan = dataStore.createMaintenancePlan(plan);
    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create maintenance plan' }, { status: 500 });
  }
}
