import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const store = DataStore.getInstance();
    const updatedFault = await store.updateFault(params.id, body);
    if (!updatedFault) {
      return NextResponse.json({ error: 'Fault not found' }, { status: 404 });
    }
    return NextResponse.json(updatedFault);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update fault' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const store = DataStore.getInstance();
    const deleted = await store.deleteFault(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Fault not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete fault' }, { status: 500 });
  }
}
