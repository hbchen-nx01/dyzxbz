import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';

export async function GET() {
  try {
    const store = DataStore.getInstance();
    const dailyWorks = store.getDailyWorks();
    return NextResponse.json(dailyWorks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch daily works' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const store = DataStore.getInstance();
    const newDailyWork = store.createDailyWork(body);
    return NextResponse.json(newDailyWork, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create daily work' }, { status: 500 });
  }
}
