import { NextResponse } from 'next/server';
import DataStore from '@/lib/dataStore';
import { PersonnelWorkload } from '@/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const personnelId = searchParams.get('personnelId');
    
    if (!personnelId) {
      return NextResponse.json({ error: 'Missing personnelId parameter' }, { status: 400 });
    }
    
    const store = DataStore.getInstance();
    const workOrders = store.getWorkOrders();
    const personnel = store.getPersonnelById(personnelId);
    
    if (!personnel) {
      return NextResponse.json({ error: 'Personnel not found' }, { status: 404 });
    }
    
    // 计算个人工作量和工时
    const workOrdersCount = workOrders.filter(w => w.assignedTo === personnelId).length;
    const completedWorkOrdersCount = workOrders.filter(w => w.assignedTo === personnelId && w.status === 'completed').length;
    const totalWorkHours = completedWorkOrdersCount * 4; // 假设每个完成的工单平均耗时4小时
    const completionRate = workOrdersCount > 0 ? (completedWorkOrdersCount / workOrdersCount) * 100 : 0;
    
    const personnelWorkload: PersonnelWorkload = {
      personnelId,
      personnelName: personnel.name,
      workOrdersCount,
      completedWorkOrdersCount,
      totalWorkHours,
      completionRate,
    };
    
    return NextResponse.json(personnelWorkload);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch personnel workload' }, { status: 500 });
  }
}
