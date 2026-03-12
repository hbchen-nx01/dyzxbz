import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const store = DataStore.getInstance();
    const personnel = store.getPersonnelById(params.id);
    if (!personnel) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 });
    }
    return NextResponse.json(personnel);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch personnel' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const store = DataStore.getInstance();
    const updatedPersonnel = store.updatePersonnel(params.id, body);
    if (!updatedPersonnel) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 });
    }
    return NextResponse.json(updatedPersonnel);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update personnel' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const store = DataStore.getInstance();
    const success = store.deletePersonnel(params.id);
    if (!success) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Personnel deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete personnel' }, { status: 500 });
  }
}
