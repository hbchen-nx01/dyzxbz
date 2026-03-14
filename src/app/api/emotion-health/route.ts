import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';

export async function GET(request: NextRequest) {
  try {
    const date = request.nextUrl.searchParams.get('date');
    const personnelId = request.nextUrl.searchParams.get('personnelId');
    
    const store = DataStore.getInstance();
    let records;
    
    if (date) {
      records = store.getEmotionHealthRecordsByDate(date);
    } else if (personnelId) {
      records = store.getEmotionHealthRecordsByPersonnel(personnelId);
    } else {
      records = store.getEmotionHealthRecords();
    }
    
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch emotion health records' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const store = DataStore.getInstance();
    
    const record = store.createEmotionHealthRecord(body);
    
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create emotion health record' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    const store = DataStore.getInstance();
    const updatedRecord = store.updateEmotionHealthRecord(id, data);
    
    if (!updatedRecord) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedRecord);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update emotion health record' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }
    
    const store = DataStore.getInstance();
    const deleted = store.deleteEmotionHealthRecord(id);
    
    if (!deleted) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete emotion health record' }, { status: 500 });
  }
}