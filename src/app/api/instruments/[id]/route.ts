import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const store = DataStore.getInstance();
    const updatedInstrument = await store.updateInstrument(params.id, body);
    if (!updatedInstrument) {
      return NextResponse.json({ error: 'Instrument not found' }, { status: 404 });
    }
    return NextResponse.json(updatedInstrument);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update instrument' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const store = DataStore.getInstance();
    const deleted = await store.deleteInstrument(params.id);
    if (!deleted) {
      return NextResponse.json({ error: 'Instrument not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete instrument' }, { status: 500 });
  }
}
