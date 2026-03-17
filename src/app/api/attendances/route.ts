import { NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    
    const store = DataStore.getInstance();
    let attendances;
    
    if (year && month) {
      attendances = store.getAttendancesByMonth(parseInt(year), parseInt(month));
    } else {
      attendances = store.getAttendances();
    }
    
    return NextResponse.json(attendances);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch attendances' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const store = DataStore.getInstance();
    const newAttendance = await store.createAttendance(data);
    return NextResponse.json(newAttendance, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create attendance' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
    }
    
    const store = DataStore.getInstance();
    const updatedAttendance = await store.updateAttendance(id, updateData);
    
    if (!updatedAttendance) {
      return NextResponse.json({ error: 'Attendance not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedAttendance);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update attendance' }, { status: 500 });
  }
}
