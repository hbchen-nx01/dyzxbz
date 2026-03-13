'use client';

import { useState, useEffect } from 'react';
import { Share2, Plus, Heart, MessageCircle, Upload, Download, Search, X, Image as ImageIcon, Filter } from 'lucide-react';
import type { ExperienceShare, Personnel } from '@/types';
import { exportToExcel, importFromExcel, formatDateTime } from '@/lib/utils';

export default function ExperienceShare() {
  const [experiences, setExperiences] = useState<ExperienceShare[]>([]);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState<ExperienceShare | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    authorId: '1',
    authorName: '当前用户',
  });
  const [images, setImages] = useState<string[]>([]);
  const [newComment, setNewComment] = useState('');

  const categories = ['故障处理', '维护技巧', '经验总结', '技术分享', '其他'];

  useEffect(() => {
    fetchExperiences();
    fetchPersonnel();
  }, []);

  const fetchExperiences = async () => {
    try {
      const response = await fetch('/api/experiences');
      const data = await response.json();
      setExperiences(data);
    } catch (error) {
      console.error('Failed to fetch experiences:', error);
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

  const filteredExperiences = experiences.filter(
    (exp) =>
      (selectedCategory === 'all' || exp.category === selectedCategory) &&
      (exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenModal = () => {
    setFormData({
      title: '',
      content: '',
      category: '',
      authorId: '1',
      authorName: '当前用户',
    });
    setImages([]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setImages([]);
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
      await fetch('/api/experiences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          images: images.length > 0 ? images : undefined,
        }),
      });

      handleCloseModal();
      fetchExperiences();
    } catch (error) {
      console.error('Failed to create experience:', error);
    }
  };

  const handleLike = async (experienceId: string) => {
    try {
      await fetch(`/api/experiences/${experienceId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: '1' }),
      });
      fetchExperiences();
    } catch (error) {
      console.error('Failed to like experience:', error);
    }
  };

  const handleAddComment = async (experienceId: string) => {
    if (!newComment.trim()) return;

    try {
      await fetch(`/api/experiences/${experienceId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newComment,
          authorId: '1',
          authorName: '当前用户',
        }),
      });
      setNewComment('');
      fetchExperiences();
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleExport = () => {
    const exportData = experiences.map(exp => ({
      标题: exp.title,
      分类: exp.category,
      作者: exp.authorName,
      内容: exp.content,
      点赞数: exp.likes,
      评论数: exp.comments.length,
      发布时间: formatDateTime(exp.createdAt),
    }));
    exportToExcel(exportData, '经验分享');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Share2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">经验分享</h1>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => window.history.back()}
                className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                返回上一页
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
              >
                返回主页
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              导出Excel
            </button>
            <button
              onClick={handleOpenModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              发布经验
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索经验分享..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">全部分类</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredExperiences.map((experience) => (
            <div key={experience.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full mb-2">
                    {experience.category}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{experience.title}</h3>
                  <p className="text-sm text-gray-500">
                    {experience.authorName} · {formatDateTime(experience.createdAt)}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 mb-4 line-clamp-3">{experience.content}</p>

              {experience.images && experience.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {experience.images.slice(0, 3).map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Experience image ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80"
                      onClick={() => setSelectedExperience(experience)}
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <button
                  onClick={() => handleLike(experience.id)}
                  className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
                >
                  <Heart className={`w-5 h-5 ${experience.likedBy.includes('1') ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{experience.likes}</span>
                </button>
                <button
                  onClick={() => setSelectedExperience(experience)}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>{experience.comments.length}</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredExperiences.length === 0 && (
          <div className="text-center py-12 text-gray-500">暂无经验分享</div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">发布经验分享</h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">姓名 *</label>
                  <select
                    required
                    value={formData.authorId}
                    onChange={(e) => {
                      const selectedPerson = personnel.find(p => p.id === e.target.value);
                      setFormData({
                        ...formData,
                        authorId: e.target.value,
                        authorName: selectedPerson ? selectedPerson.name : '当前用户'
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择人员</option>
                    {personnel.map(person => (
                      <option key={person.id} value={person.id}>{person.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">标题 *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请输入标题"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">分类 *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择分类</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">内容 *</label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="请分享您的经验..."
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">图片</label>
                  <label className="cursor-pointer">
                    <span className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <Upload className="w-5 h-5" />
                      上传图片
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                  {images.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
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
                    发布
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedExperience && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-900">{selectedExperience.title}</h2>
                <button
                  onClick={() => setSelectedExperience(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {selectedExperience.category}
                  </span>
                  <p className="text-sm text-gray-500 mt-2">
                    {selectedExperience.authorName} · {formatDateTime(selectedExperience.createdAt)}
                  </p>
                </div>

                <p className="text-gray-700 mb-6 whitespace-pre-wrap">{selectedExperience.content}</p>

                {selectedExperience.images && selectedExperience.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {selectedExperience.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Experience image ${idx + 1}`}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">评论 ({selectedExperience.comments.length})</h3>
                  <div className="space-y-4 mb-6">
                    {selectedExperience.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">{comment.authorName}</span>
                          <span className="text-sm text-gray-500">{formatDateTime(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="添加评论..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment(selectedExperience.id)}
                    />
                    <button
                      onClick={() => handleAddComment(selectedExperience.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      发送
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
