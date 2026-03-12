import { NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';

export async function GET() {
  try {
    const store = DataStore.getInstance();
    const statistics = store.getStatistics();
    return NextResponse.json(statistics);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}
