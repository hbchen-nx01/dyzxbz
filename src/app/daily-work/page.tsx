'use client';

import { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Upload, Search, X, Image as ImageIcon, CheckCircle, Clock, Circle } from 'lucide-react';
import { DailyWork, WorkTask, Personnel } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function DailyWorkSchedule() {
  const [dailyWorks, setDailyWorks] = useState<DailyWork[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWork, setEditingWork] = useState<DailyWork | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [formData, setFormData] = useState({
    personnelId: '1',
    personnelName: '张三',
    date: new Date().toISOString().split('T')[0],
    status: 'pending' as 'pending' | 'in_progress' | 'completed',
    notes: '',
  });
  const [tasks, setTasks] = useState<WorkTask[]>([]);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    fetchDailyWorks();
    fetchPersonnel();
  }, []);

  const fetchPersonnel = async () => {
    try {
      const response = await fetch('/api/personnel');
      const data = await response.json();
      setPersonnel(data);
    } catch (error) {
      console.error('Failed to fetch personnel:', error);
    }
  };

  const fetchDailyWorks = async () => {
    try {
      const response = await fetch('/api/daily-works');
      const data = await response.json();
      setDailyWorks(data);
    } catch (error) {
      console.error('Failed to fetch daily works:', error);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredWorks = dailyWorks.filter(
    (work) =>
      work.date === selectedDate &&
      (work.personnelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        work.tasks.some(t => t.title.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  const handleOpenModal = (work?: DailyWork) => {
    if (work) {
      setEditingWork(work);
      setFormData({
        personnelId: work.personnelId,
        personnelName: work.personnelName,
        date: work.date,
        status: work.status,
        notes: work.notes || '',
      });
      setTasks(work.tasks);
      setImages(work.images || []);
    } else {
      setEditingWork(null);
      setFormData({
        personnelId: '1',
        personnelName: '张三',
        date: selectedDate,
        status: 'pending',
        notes: '',
      });
      setTasks([]);
      setImages([]);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWork(null);
    setTasks([]);
    setImages([]);
  };

  const handleAddTask = () => {
    const newTask: WorkTask = {
      id: Date.now().toString(),
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      estimatedHours: 1,
    };
    setTasks([...tasks, newTask]);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<WorkTask>) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, ...updates } : task));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        tasks,
        images: images.length > 0 ? images : undefined,
      };

      if (editingWork) {
        await fetch(`/api/daily-works/${editingWork.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('/api/daily-works', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      handleCloseModal();
      fetchDailyWorks();
    } catch (error) {
      console.error('Failed to save daily work:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除该工作安排吗？')) return;
    try {
      await fetch(`/api/daily-works/${id}`, { method: 'DELETE' });
      fetchDailyWorks();
    } catch (error) {
      console.error('Failed to delete daily work:', error);
    }
  };

  const getTaskStatusIcon = (status: WorkTask['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: WorkTask['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status: DailyWork['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">每日工作安排</h1>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              返回上页
            </button>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            创建工作安排
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">选择日期</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">搜索</label>
              <input
                type="text"
                placeholder="搜索人员或任务..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {filteredWorks.map((work) => (
            <div key={work.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{work.personnelName}</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">{formatDate(work.date)}</span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(work.status)}`}
                    >
                      {work.status === 'completed' ? '已完成' : work.status === 'in_progress' ? '进行中' : '待处理'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenModal(work)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(work.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {work.tasks.map((task) => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    {getTaskStatusIcon(task.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{task.title}</span>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{task.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>预计工时: {task.estimatedHours}小时</span>
                        {task.actualHours && <span>实际工时: {task.actualHours}小时</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {work.images && work.images.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {work.images.slice(0, 4).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Work image ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}

              {work.notes && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                  <p className="text-sm text-gray-700">{work.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredWorks.length === 0 && (
          <div className="text-center py-12 text-gray-500">该日期暂无工作安排</div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingWork ? '编辑工作安排' : '创建工作安排'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                  <select
                    required
                    value={formData.personnelId}
                    onChange={(e) => {
                      const selectedPerson = personnel.find(p => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        personnelId: e.target.value,
                        personnelName: selectedPerson ? selectedPerson.name : ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择姓名</option>
                    {personnel.map(person => (
                      <option key={person.id} value={person.id}>{person.name}</option>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      <option value="pending">待处理</option>
                      <option value="in_progress">进行中</option>
                      <option value="completed">已完成</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">工作任务</h3>
                    <button
                      type="button"
                      onClick={handleAddTask}
                      className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      添加任务
                    </button>
                  </div>
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.id} className="p-4 bg-gray-50 rounded-lg border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">任务标题 *</label>
                            <input
                              type="text"
                              required
                              value={task.title}
                              onChange={(e) => handleUpdateTask(task.id, { title: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">优先级</label>
                            <select
                              value={task.priority}
                              onChange={(e) => handleUpdateTask(task.id, { priority: e.target.value as any })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="low">低</option>
                              <option value="medium">中</option>
                              <option value="high">高</option>
                            </select>
                          </div>
                        </div>
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">任务描述</label>
                          <textarea
                            value={task.description}
                            onChange={(e) => handleUpdateTask(task.id, { description: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">预计工时（小时）</label>
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={task.estimatedHours}
                              onChange={(e) => handleUpdateTask(task.id, { estimatedHours: parseFloat(e.target.value) })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">状态</label>
                            <select
                              value={task.status}
                              onChange={(e) => handleUpdateTask(task.id, { status: e.target.value as any })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="pending">待处理</option>
                              <option value="in_progress">进行中</option>
                              <option value="completed">已完成</option>
                            </select>
                          </div>
                          <div className="flex items-end">
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                              删除任务
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="添加备注信息..."
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">上传图片</label>
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Upload className="w-5 h-5" />
                    选择图片
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt={`Upload ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}
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
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingWork ? '更新' : '创建'}
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
