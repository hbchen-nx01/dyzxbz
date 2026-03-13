import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';
import { Schedule } from '@/types';

const dataStore = DataStore.getInstance();

export async function GET(request: NextRequest) {
  try {
    const schedules = dataStore.getSchedules();
    return NextResponse.json(schedules);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch schedule plans' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const plan = await request.json() as Omit<Schedule, 'id' | 'createdAt'>;
    const newSchedule = dataStore.createSchedule(plan);
    return NextResponse.json(newSchedule, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create schedule plan' }, { status: 500 });
  }
}
