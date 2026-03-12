import { NextRequest, NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { userId } = body;
    
    const store = DataStore.getInstance();
    const updatedExperience = store.likeExperience(id, userId);
    
    if (!updatedExperience) {
      return NextResponse.json({ error: 'Experience not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedExperience);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to like experience' }, { status: 500 });
  }
}