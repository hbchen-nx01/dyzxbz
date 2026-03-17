import { NextRequest, NextResponse } from 'next/server';

// 创建用户
export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();
    // 暂时返回模拟数据
    const user = {
      id: Date.now().toString(),
      name,
      email,
      createdAt: new Date().toISOString()
    };
    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

// 获取所有用户
export async function GET() {
  try {
    // 暂时返回模拟数据
    const users: Array<{ id: string; name: string; email: string; createdAt: string }> = [];
    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}