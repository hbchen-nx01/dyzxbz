'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Download, TrendingUp, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { Statistics } from '@/types';
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export default function StatisticsPage() {
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/statistics');
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  const handleExport = () => {
    if (!statistics) return;
    
    const exportData = [
      {
        指标: '维护完成率',
        数值: `${statistics.maintenanceCompletionRate.toFixed(2)}%`,
      },
      {
        指标: '故障频次',
        数值: statistics.faultFrequency,
      },
      {
        指标: '总工时',
        数值: statistics.totalWorkHours,
      },
      {
        指标: '平均响应时间',
        数值: `${statistics.averageResponseTime}小时`,
      },
      {
        指标: '活跃工单',
        数值: statistics.activeWorkOrders,
      },
      {
        指标: '已完成工单',
        数值: statistics.completedWorkOrders,
      },
    ];
    exportToExcel(exportData, '统计报表');
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  if (!statistics) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar title="统计报表" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12 text-gray-500">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="统计报表" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">数据统计</h2>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            导出Excel
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="text-sm font-medium text-gray-600">维护完成率</span>
              </div>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {statistics.maintenanceCompletionRate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-500 mt-2">较上月提升 2.3%</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <span className="text-sm font-medium text-gray-600">故障频次</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {statistics.faultFrequency}
            </div>
            <p className="text-sm text-gray-500 mt-2">本月累计</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">总工时</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {statistics.totalWorkHours}
            </div>
            <p className="text-sm text-gray-500 mt-2">本月累计</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <span className="text-sm font-medium text-gray-600">平均响应时间</span>
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {statistics.averageResponseTime}h
            </div>
            <p className="text-sm text-gray-500 mt-2">较上月减少 0.5h</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">月度工单统计</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="workOrders" fill="#3B82F6" name="工单数" />
                <Bar dataKey="faults" fill="#EF4444" name="故障数" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">维护工时趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statistics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="maintenanceHours" stroke="#10B981" strokeWidth={2} name="维护工时" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">完成率趋势</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statistics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${value}%`} />
                <Legend />
                <Line type="monotone" dataKey="completionRate" stroke="#F59E0B" strokeWidth={2} name="完成率" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">工单状态分布</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: '已完成', value: statistics.completedWorkOrders },
                    { name: '进行中', value: statistics.activeWorkOrders * 0.6 },
                    { name: '待处理', value: statistics.activeWorkOrders * 0.4 },
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
                  <Cell fill="#3B82F6" />
                  <Cell fill="#F59E0B" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
