'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Download, User, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { Personnel, PersonnelWorkload } from '@/types';
import { exportToExcel } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function PersonnelStatisticsPage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>('');
  const [personnelWorkload, setPersonnelWorkload] = useState<PersonnelWorkload | null>(null);

  useEffect(() => {
    fetchPersonnel();
  }, []);

  useEffect(() => {
    if (selectedPersonnelId) {
      fetchPersonnelWorkload(selectedPersonnelId);
    }
  }, [selectedPersonnelId]);

  const fetchPersonnel = async () => {
    try {
      const response = await fetch('/api/personnel');
      const data = await response.json();
      setPersonnel(data);
      if (data.length > 0) {
        setSelectedPersonnelId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch personnel:', error);
    }
  };

  const fetchPersonnelWorkload = async (personnelId: string) => {
    try {
      const response = await fetch(`/api/personnel-statistics?personnelId=${personnelId}`);
      const data = await response.json();
      setPersonnelWorkload(data);
    } catch (error) {
      console.error('Failed to fetch personnel workload:', error);
    }
  };

  const handleExport = () => {
    if (!personnelWorkload) return;
    
    const exportData = [
      {
        指标: '人员姓名',
        数值: personnelWorkload.personnelName,
      },
      {
        指标: '总工单数',
        数值: personnelWorkload.workOrdersCount,
      },
      {
        指标: '已完成工单',
        数值: personnelWorkload.completedWorkOrdersCount,
      },
      {
        指标: '总工时',
        数值: `${personnelWorkload.totalWorkHours}小时`,
      },
      {
        指标: '完成率',
        数值: `${personnelWorkload.completionRate.toFixed(2)}%`,
      },
    ];
    exportToExcel(exportData, `${personnelWorkload.personnelName}个人统计`);
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="个人工作量统计" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">个人工作量统计</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <select
                value={selectedPersonnelId}
                onChange={(e) => setSelectedPersonnelId(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg py-2 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {personnel.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.department}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              导出Excel
            </button>
          </div>
        </div>

        {!personnelWorkload ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <User className="w-6 h-6 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">人员姓名</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {personnelWorkload.personnelName}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">已完成工单</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {personnelWorkload.completedWorkOrdersCount}
                </div>
                <p className="text-sm text-gray-500 mt-2">/ {personnelWorkload.workOrdersCount}</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">总工时</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {personnelWorkload.totalWorkHours}
                </div>
                <p className="text-sm text-gray-500 mt-2">小时</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                    <span className="text-sm font-medium text-gray-600">完成率</span>
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {personnelWorkload.completionRate.toFixed(1)}%
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">工单完成情况</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: '已完成', value: personnelWorkload.completedWorkOrdersCount },
                        { name: '未完成', value: personnelWorkload.workOrdersCount - personnelWorkload.completedWorkOrdersCount },
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#10B981" />
                      <Cell fill="#EF4444" />
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">工作量对比</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[personnelWorkload]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="personnelName" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="workOrdersCount" fill="#3B82F6" name="总工单数" />
                    <Bar dataKey="completedWorkOrdersCount" fill="#10B981" name="已完成工单" />
                    <Bar dataKey="totalWorkHours" fill="#F59E0B" name="总工时" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
