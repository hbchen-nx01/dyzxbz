import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';
import { Document } from '@/types';

const dataStore = DataStore.getInstance();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const documents = dataStore.getDocuments();
    const document = documents.find(d => d.id === params.id);
    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }
    return NextResponse.json(document);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const document = await request.json() as Partial<Document>;
    // 这里需要实现更新文档的逻辑
    return NextResponse.json({ message: 'Document updated successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 这里需要实现删除文档的逻辑
    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}
