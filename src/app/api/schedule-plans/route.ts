import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/dataStore';
import { SchedulePlan } from '@/types';

const dataStore = new DataStore();

export async function GET(request: NextRequest) {
  try {
    const plans = dataStore.schedulePlans.getAll();
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schedule plans' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const plan = await request.json() as Omit<SchedulePlan, 'id' | 'createdAt'>;
    const newPlan = dataStore.schedulePlans.create(plan);
    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create schedule plan' }, { status: 500 });
  }
}
