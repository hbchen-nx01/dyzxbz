'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, Download, Search, X } from 'lucide-react';
import { TrainingPlan } from '@/types';
import { exportToExcel, formatDate, formatDateTime } from '@/lib/utils';
import Navbar from '@/components/Navbar';

export default function TrainingPlans() {
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null);
  const [formData, setFormData] = useState({
    planNumber: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    trainer: '',
    participants: '',
    status: 'planned' as 'planned' | 'ongoing' | 'completed' | 'cancelled',
    assessmentMethod: '',
    evaluationResults: '',
    notes: '',
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/training-plans');
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      console.error('Failed to fetch training plans:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredPlans = plans.filter(
    (plan) =>
      (statusFilter === 'all' || plan.status === statusFilter) &&
      (plan.planNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.trainer.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (plan?: TrainingPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({
        planNumber: plan.planNumber,
        title: plan.title,
        description: plan.description,
        startDate: plan.startDate,
        endDate: plan.endDate,
        location: plan.location,
        trainer: plan.trainer,
        participants: plan.participants.join(','),
        status: plan.status,
        assessmentMethod: plan.assessmentMethod || '',
        evaluationResults: plan.evaluationResults || '',
        notes: plan.notes || '',
      });
    } else {
      setEditingPlan(null);
      setFormData({
        planNumber: `TP-${Date.now()}`,
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        trainer: '',
        participants: '',
        status: 'planned' as 'planned' | 'ongoing' | 'completed' | 'cancelled',
        assessmentMethod: '',
        evaluationResults: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await fetch(`/api/training-plans/${editingPlan.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        await fetch('/api/training-plans', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      handleCloseModal();
      fetchPlans();
    } catch (error) {
      console.error('Failed to save training plan:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该培训计划吗？')) return;
    try {
      await fetch(`/api/training-plans/${id}`, { method: 'DELETE' });
      fetchPlans();
    } catch (error) {
      console.error('Failed to delete training plan:', error);
    }
  };

  const handleExport = () => {
    const exportData = plans.map(plan => ({
      计划编号: plan.planNumber,
      培训标题: plan.title,
      开始日期: plan.startDate,
      结束日期: plan.endDate,
      地点: plan.location,
      培训师: plan.trainer,
      参与者: plan.participants.join(', '),
      状态: plan.status === 'completed' ? '已完成' : plan.status === 'ongoing' ? '进行中' : plan.status === 'planned' ? '计划中' : '已取消',
      评估方式: plan.assessmentMethod || '',
      评估结果: plan.evaluationResults || '',
    }));
    exportToExcel(exportData, '培训计划');
  };

  const getStatusColor = (status: TrainingPlan['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: TrainingPlan['status']) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'ongoing':
        return '进行中';
      case 'planned':
        return '计划中';
      case 'cancelled':
        return '已取消';
      default:
        return '未知';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="培训计划管理" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">培训计划管理</h2>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            创建培训计划
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索计划编号、标题或培训师..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">全部状态</option>
                  <option value="planned">计划中</option>
                  <option value="ongoing">进行中</option>
                  <option value="completed">已完成</option>
                  <option value="cancelled">已取消</option>
                </select>
            </div>
            <div>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                导出Excel
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg text-gray-900">{plan.planNumber}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(plan.status)}`}>
                      {getStatusText(plan.status)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(plan)}
                    className="text-green-600 hover:text-green-900"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">培训标题</h4>
                  <p className="text-gray-700">{plan.title}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">开始日期</h4>
                    <p className="text-gray-700">{formatDate(plan.startDate)}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">结束日期</h4>
                    <p className="text-gray-700">{formatDate(plan.endDate)}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">培训师</h4>
                  <p className="text-gray-700">{plan.trainer}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">地点</h4>
                  <p className="text-gray-700">{plan.location}</p>
                </div>

                {plan.participants && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">参与者:</span> {plan.participants.join(', ')}
                    </p>
                  </div>
                )}

                {plan.evaluationResults && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">评估结果:</span> {plan.evaluationResults}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredPlans.length === 0 && (
          <div className="text-center py-12 text-gray-500">暂无培训计划</div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingPlan ? '编辑培训计划' : '创建培训计划'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">计划编号 *</label>
                    <input
                      type="text"
                      required
                      value={formData.planNumber}
                      onChange={(e) => setFormData({ ...formData, planNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">状态 *</label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="planned">计划中</option>
                      <option value="ongoing">进行中</option>
                      <option value="completed">已完成</option>
                      <option value="cancelled">已取消</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">开始日期 *</label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">结束日期 *</label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">培训师 *</label>
                    <input
                      type="text"
                      required
                      value={formData.trainer}
                      onChange={(e) => setFormData({ ...formData, trainer: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">地点 *</label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">培训标题 *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">培训描述</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="请描述培训的详细内容..."
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">参与者</label>
                  <input
                    type="text"
                    value={formData.participants}
                    onChange={(e) => setFormData({ ...formData, participants: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="输入参与者姓名，用逗号分隔"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">评估方式</label>
                  <input
                    type="text"
                    value={formData.assessmentMethod}
                    onChange={(e) => setFormData({ ...formData, assessmentMethod: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="输入评估方式"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">评估结果</label>
                  <textarea
                    value={formData.evaluationResults}
                    onChange={(e) => setFormData({ ...formData, evaluationResults: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="输入评估结果..."
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="添加备注信息..."
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {editingPlan ? '更新' : '创建'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
