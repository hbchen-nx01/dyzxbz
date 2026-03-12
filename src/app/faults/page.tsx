'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Edit, Trash2, Upload, Download, Search, X } from 'lucide-react';
import { Fault } from '@/types';
import { exportToExcel, importFromExcel, formatDateTime } from '@/lib/utils';
import Navbar from '@/components/Navbar';

export default function FaultHandling() {
  const [faults, setFaults] = useState<Fault[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFault, setEditingFault] = useState<Fault | null>(null);
  const [formData, setFormData] = useState({
    faultNumber: '',
    instrumentId: '',
    instrumentName: '',
    instrumentLocation: '',
    faultType: '',
    description: '',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    status: 'reported' as 'reported' | 'investigating' | 'fixing' | 'resolved' | 'closed',
    reportedBy: '1',
    reportedByName: '当前用户',
    assignedTo: '',
    assignedToName: '',
    resolution: '',
  });

  useEffect(() => {
    fetchFaults();
  }, []);

  const fetchFaults = async () => {
    try {
      const response = await fetch('/api/faults');
      const data = await response.json();
      setFaults(data);
    } catch (error) {
      console.error('Failed to fetch faults:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredFaults = faults.filter(
    (fault) =>
      (statusFilter === 'all' || fault.status === statusFilter) &&
      (fault.faultNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fault.instrumentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fault.faultType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (fault?: Fault) => {
    if (fault) {
      setEditingFault(fault);
      setFormData({
        faultNumber: fault.faultNumber,
        instrumentId: fault.instrumentId,
        instrumentName: fault.instrumentName,
        instrumentLocation: fault.instrumentLocation,
        faultType: fault.faultType,
        description: fault.description,
        severity: fault.severity,
        status: fault.status,
        reportedBy: fault.reportedBy,
        reportedByName: fault.reportedByName,
        assignedTo: fault.assignedTo || '',
        assignedToName: fault.assignedToName || '',
        resolution: fault.resolution || '',
      });
    } else {
      setEditingFault(null);
      setFormData({
        faultNumber: `FLT-${Date.now()}`,
        instrumentId: '',
        instrumentName: '',
        instrumentLocation: '',
        faultType: '',
        description: '',
        severity: 'medium',
        status: 'reported',
        reportedBy: '1',
        reportedByName: '当前用户',
        assignedTo: '',
        assignedToName: '',
        resolution: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFault(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        resolvedAt: formData.status === 'resolved' || formData.status === 'closed' ? new Date().toISOString() : undefined,
      };

      if (editingFault) {
        await fetch(`/api/faults/${editingFault.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/faults', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      handleCloseModal();
      fetchFaults();
    } catch (error) {
      console.error('Failed to save fault:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该故障记录吗？')) return;
    try {
      await fetch(`/api/faults/${id}`, { method: 'DELETE' });
      fetchFaults();
    } catch (error) {
      console.error('Failed to delete fault:', error);
    }
  };

  const handleExport = () => {
    const exportData = faults.map(fault => ({
      故障编号: fault.faultNumber,
      仪表名称: fault.instrumentName,
      仪表位置: fault.instrumentLocation,
      故障类型: fault.faultType,
      严重程度: fault.severity === 'critical' ? '严重' : fault.severity === 'high' ? '高' : fault.severity === 'medium' ? '中' : '低',
      状态: fault.status === 'reported' ? '已上报' : fault.status === 'investigating' ? '调查中' : fault.status === 'fixing' ? '处理中' : fault.status === 'resolved' ? '已解决' : '已关闭',
      上报人: fault.reportedByName,
      负责人: fault.assignedToName || '',
      上报时间: formatDateTime(fault.createdAt),
      解决方案: fault.resolution || '',
    }));
    exportToExcel(exportData, '设备故障记录');
  };

  const getStatusColor = (status: Fault['status']) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'fixing':
        return 'bg-blue-100 text-blue-800';
      case 'investigating':
        return 'bg-purple-100 text-purple-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusText = (status: Fault['status']) => {
    switch (status) {
      case 'resolved':
        return '已解决';
      case 'fixing':
        return '处理中';
      case 'investigating':
        return '调查中';
      case 'closed':
        return '已关闭';
      default:
        return '已上报';
    }
  };

  const getSeverityColor = (severity: Fault['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getSeverityText = (severity: Fault['severity']) => {
    switch (severity) {
      case 'critical':
        return '严重';
      case 'high':
        return '高';
      case 'medium':
        return '中';
      default:
        return '低';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="设备故障处理" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">设备故障处理</h2>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            上报故障
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索故障编号、仪表名称或类型..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部状态</option>
                <option value="reported">已上报</option>
                <option value="investigating">调查中</option>
                <option value="fixing">处理中</option>
                <option value="resolved">已解决</option>
                <option value="closed">已关闭</option>
              </select>
            </div>
            <div className="flex gap-2">
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
          {filteredFaults.map((fault) => (
            <div key={fault.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg text-gray-900">{fault.faultNumber}</span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getSeverityColor(fault.severity)}`}
                    >
                      {getSeverityText(fault.severity)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(fault.status)}`}
                    >
                      {getStatusText(fault.status)}
                    </span>
                    <span className="text-sm text-gray-500">{formatDateTime(fault.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(fault)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(fault.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">仪表信息</h4>
                  <p className="text-gray-700">{fault.instrumentName}</p>
                  <p className="text-sm text-gray-500">{fault.instrumentLocation}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">故障类型</h4>
                  <p className="text-gray-700">{fault.faultType}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">故障描述</h4>
                  <p className="text-gray-700">{fault.description}</p>
                </div>

                {fault.assignedToName && (
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">负责人:</span> {fault.assignedToName}
                    </p>
                  </div>
                )}

                {fault.resolution && (
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">解决方案:</span> {fault.resolution}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredFaults.length === 0 && (
          <div className="text-center py-12 text-gray-500">暂无故障记录</div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingFault ? '编辑故障信息' : '上报故障'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">故障编号 *</label>
                    <input
                      type="text"
                      required
                      value={formData.faultNumber}
                      onChange={(e) => setFormData({ ...formData, faultNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">严重程度 *</label>
                    <select
                      required
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">低</option>
                      <option value="medium">中</option>
                      <option value="high">高</option>
                      <option value="critical">严重</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">仪表名称 *</label>
                    <input
                      type="text"
                      required
                      value={formData.instrumentName}
                      onChange={(e) => setFormData({ ...formData, instrumentName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">仪表位置 *</label>
                    <input
                      type="text"
                      required
                      value={formData.instrumentLocation}
                      onChange={(e) => setFormData({ ...formData, instrumentLocation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">故障类型 *</label>
                    <input
                      type="text"
                      required
                      value={formData.faultType}
                      onChange={(e) => setFormData({ ...formData, faultType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="例如：传感器故障、线路问题等"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">状态 *</label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="reported">已上报</option>
                      <option value="investigating">调查中</option>
                      <option value="fixing">处理中</option>
                      <option value="resolved">已解决</option>
                      <option value="closed">已关闭</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">故障描述 *</label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请详细描述故障情况..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">负责人</label>
                    <input
                      type="text"
                      value={formData.assignedToName}
                      onChange={(e) => setFormData({ ...formData, assignedToName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="输入负责人姓名"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">上报信息</label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">上报人:</span> {formData.reportedByName}
                      </p>
                    </div>
                  </div>
                </div>

                {(formData.status === 'resolved' || formData.status === 'closed') && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">解决方案</label>
                    <textarea
                      value={formData.resolution}
                      onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="请描述故障解决方案..."
                    />
                  </div>
                )}

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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingFault ? '更新' : '上报'}
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
