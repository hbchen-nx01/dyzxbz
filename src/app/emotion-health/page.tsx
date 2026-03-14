'use client';

import { useState, useEffect } from 'react';
import { Heart, Plus, Edit, Trash2, Search, X, Activity, AlertCircle, CheckCircle } from 'lucide-react';
import { EmotionHealthRecord, Personnel } from '@/types';
import { formatDate } from '@/lib/utils';
import Navbar from '@/components/Navbar';

export default function EmotionHealthManagement() {
  const [records, setRecords] = useState<EmotionHealthRecord[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<EmotionHealthRecord | null>(null);
  const [formData, setFormData] = useState({
    personnelId: '',
    personnelName: '',
    date: '',
    emotionScore: 5,
    systolicBP: 120,
    diastolicBP: 80,
    notes: '',
  });

  useEffect(() => {
    fetchRecords();
    fetchPersonnel();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/emotion-health');
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.error('Failed to fetch emotion health records:', error);
    }
  };

  const fetchPersonnel = async () => {
    try {
      const response = await fetch('/api/personnel');
      const data = await response.json();
      setPersonnel(data);
    } catch (error) {
      console.error('Failed to fetch personnel:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleDateFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDateFilter(e.target.value);
  };

  const filteredRecords = records.filter(
    (record) =>
      (!dateFilter || record.date === dateFilter) &&
      (record.personnelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.personnelId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = (record?: EmotionHealthRecord) => {
    if (record) {
      setEditingRecord(record);
      setFormData({
        personnelId: record.personnelId,
        personnelName: record.personnelName,
        date: record.date,
        emotionScore: record.emotionScore,
        systolicBP: record.systolicBP,
        diastolicBP: record.diastolicBP,
        notes: record.notes || '',
      });
    } else {
      setEditingRecord(null);
      setFormData({
        personnelId: '',
        personnelName: '',
        date: new Date().toISOString().split('T')[0],
        emotionScore: 5,
        systolicBP: 120,
        diastolicBP: 80,
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
  };

  const handlePersonnelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPersonnelId = e.target.value;
    const selectedPersonnel = personnel.find(p => p.id === selectedPersonnelId);
    setFormData({
      ...formData,
      personnelId: selectedPersonnelId,
      personnelName: selectedPersonnel?.name || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isSuitableForWork = formData.emotionScore >= 6 && 
      formData.systolicBP <= 140 && 
      formData.diastolicBP <= 90;
    
    let statusColor: 'green' | 'yellow' | 'red' = 'green';
    if (isSuitableForWork && formData.emotionScore >= 8 && formData.systolicBP <= 120 && formData.diastolicBP <= 80) {
      statusColor = 'green';
    } else if (isSuitableForWork) {
      statusColor = 'yellow';
    } else {
      statusColor = 'red';
    }

    const payload = {
      ...formData,
      isSuitableForWork,
      statusColor,
    };

    try {
      if (editingRecord) {
        await fetch(`/api/emotion-health?id=${editingRecord.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...payload, id: editingRecord.id }),
        });
      } else {
        await fetch('/api/emotion-health', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      handleCloseModal();
      fetchRecords();
    } catch (error) {
      console.error('Failed to save emotion health record:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该记录吗？')) return;
    try {
      await fetch(`/api/emotion-health?id=${id}`, { method: 'DELETE' });
      fetchRecords();
    } catch (error) {
      console.error('Failed to delete emotion health record:', error);
    }
  };

  const getStatusColorClass = (statusColor: string) => {
    switch (statusColor) {
      case 'green':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'red':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (statusColor: string) => {
    switch (statusColor) {
      case 'green':
        return <CheckCircle className="w-5 h-5" />;
      case 'yellow':
        return <Activity className="w-5 h-5" />;
      case 'red':
        return <AlertCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="员工情绪与健康管理" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">员工情绪与健康管理</h1>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              返回上页
            </button>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            添加记录
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索姓名或工号..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <div>
              <input
                type="date"
                value={dateFilter}
                onChange={handleDateFilter}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">员工</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">日期</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">情绪评分</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">血压</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">适合工作</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">备注</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.personnelName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(record.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">{record.emotionScore}/10</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${record.emotionScore >= 8 ? 'bg-green-500' : record.emotionScore >= 5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${(record.emotionScore / 10) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{record.systolicBP}/{record.diastolicBP} mmHg</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center gap-2 p-2 rounded-lg ${getStatusColorClass(record.statusColor)}`}>
                        {getStatusIcon(record.statusColor)}
                        <span className="text-sm font-medium">
                          {record.statusColor === 'green' && '状态良好'}
                          {record.statusColor === 'yellow' && '状态一般'}
                          {record.statusColor === 'red' && '状态不佳'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${record.isSuitableForWork ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'}`}>
                        {record.isSuitableForWork ? '适合' : '不适合'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{record.notes || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleOpenModal(record)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-gray-500">暂无记录</div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingRecord ? '编辑记录' : '添加记录'}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">员工 *</label>
                    <select
                      required
                      value={formData.personnelId}
                      onChange={handlePersonnelChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="">请选择员工</option>
                      {personnel.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">日期 *</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">情绪评分 (1-10) *</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      required
                      value={formData.emotionScore}
                      onChange={(e) => setFormData({ ...formData, emotionScore: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">10分表示情绪最好，1分表示情绪最差</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">收缩压 (mmHg) *</label>
                    <input
                      type="number"
                      min="60"
                      max="200"
                      required
                      value={formData.systolicBP}
                      onChange={(e) => setFormData({ ...formData, systolicBP: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">舒张压 (mmHg) *</label>
                    <input
                      type="number"
                      min="40"
                      max="130"
                      required
                      value={formData.diastolicBP}
                      onChange={(e) => setFormData({ ...formData, diastolicBP: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="添加备注信息..."
                  />
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">评估标准</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500"></div>
                      <div>
                        <p className="font-medium">绿色 - 适合工作</p>
                        <p className="text-xs text-gray-600">情绪≥6分，收缩压≤140，舒张压≤90</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                      <div>
                        <p className="font-medium">黄色 - 适合工作</p>
                        <p className="text-xs text-gray-600">情绪≥6分，收缩压≤140，舒张压≤90</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500"></div>
                      <div>
                        <p className="font-medium">红色 - 不适合工作</p>
                        <p className="text-xs text-gray-600">情绪&lt;6分或收缩压&gt;140或舒张压&gt;90</p>
                      </div>
                    </div>
                  </div>
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
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    {editingRecord ? '更新' : '添加'}
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