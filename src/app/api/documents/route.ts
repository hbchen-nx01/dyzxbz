import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';
import { Document } from '@/types';

const dataStore = DataStore.getInstance();

export async function GET(request: NextRequest) {
  try {
    const documents = dataStore.getDocuments();
    return NextResponse.json(documents);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const document = await request.json() as Omit<Document, 'id' | 'createdAt'>;
    const newDocument = dataStore.createDocument(document);
    return NextResponse.json(newDocument, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 });
  }
}
