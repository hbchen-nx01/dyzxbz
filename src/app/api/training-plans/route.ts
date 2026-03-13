import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';
import { TrainingPlan } from '@/types';

const dataStore = DataStore.getInstance();

export async function GET(request: NextRequest) {
  try {
    const plans = dataStore.getTrainingPlans();
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch training plans' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const plan = await request.json() as Omit<TrainingPlan, 'id' | 'createdAt'>;
    const newPlan = dataStore.createTrainingPlan(plan);
    return NextResponse.json(newPlan, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create training plan' }, { status: 500 });
  }
}
