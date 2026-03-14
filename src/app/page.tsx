'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Share2, 
  Calendar, 
  ClipboardList, 
  BarChart3, 
  Gauge, 
  Clock, 
  AlertTriangle, 
  Recycle, 
  GraduationCap, 
  CalendarClock, 
  FileText,
  Home as HomeIcon
} from 'lucide-react';

const modules = [
  { id: 'personnel', name: '人员信息管理', icon: Users, description: '人员信息管理、照片上传、Excel导入导出', route: '/personnel' },
  { id: 'attendance', name: '人员考勤系统', icon: Calendar, description: '人员考勤记录、统计和分析', route: '/attendance' },
  { id: 'experience', name: '经验分享', icon: Share2, description: '经验分享发布、浏览、评论、点赞', route: '/experiences' },
  { id: 'daily-work', name: '每日工作安排', icon: Calendar, description: '工作任务创建、状态更新、图片上传', route: '/daily-work' },
  { id: 'work-orders', name: '仪表维护工单', icon: ClipboardList, description: '工单创建、跟踪、处理全流程', route: '/work-orders' },
  { id: 'statistics', name: '统计报表', icon: BarChart3, description: '维护完成率、故障频次、工时统计', route: '/statistics' },
  { id: 'personnel-statistics', name: '个人工作量统计', icon: BarChart3, description: '个人工作量、工时统计和分析', route: '/personnel-statistics' },
  { id: 'instrument-info', name: '仪表基础信息', icon: Gauge, description: '仪表信息管理和快速查询', route: '/instruments' },
  { id: 'maintenance-plan', name: '维护计划管理', icon: Clock, description: '预防性和预知性维护计划管理', route: '/maintenance-plans' },
  { id: 'fault-handling', name: '设备故障处理', icon: AlertTriangle, description: '故障上报、处理、跟踪', route: '/faults' },
  { id: 'recycle', name: '修旧利废', icon: Recycle, description: '修旧利废记录管理和统计分析', route: '/repair-reuse' },
  { id: 'training', name: '培训计划', icon: GraduationCap, description: '培训计划创建、评估和统计', route: '/training-plans' },
  { id: 'schedule', name: '排班计划', icon: CalendarClock, description: '倒班值班场景的排班管理', route: '/schedule-plans' },
  { id: 'documents', name: '文档管理', icon: FileText, description: '文档上传、下载和在线浏览', route: '/documents' },
];

export default function Home() {
  const router = useRouter();

  const handleModuleClick = (route: string) => {
    router.push(route);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">仪表维护管理系统</h1>
            <p className="text-gray-600 mt-2">专业的仪表设备维护管理平台</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <HomeIcon className="w-5 h-5" />
            首页
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module.route)}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 text-left group hover:scale-105 cursor-pointer"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4 group-hover:bg-blue-200 transition-colors">
                  <Icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{module.name}</h3>
                <p className="text-sm text-gray-600">{module.description}</p>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
