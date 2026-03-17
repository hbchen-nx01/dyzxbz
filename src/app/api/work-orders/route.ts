import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';

export async function GET() {
  try {
    const store = DataStore.getInstance();
    const workOrders = store.getWorkOrders();
    return NextResponse.json(workOrders);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch work orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const store = DataStore.getInstance();
    const newWorkOrder = await store.createWorkOrder(body);
    return NextResponse.json(newWorkOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create work order' }, { status: 500 });
  }
}
