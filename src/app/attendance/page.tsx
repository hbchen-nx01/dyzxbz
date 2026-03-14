'use client';

import { useState, useEffect } from 'react';
import { Calendar, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Attendance, Personnel } from '@/types';
import { exportToExcel } from '@/lib/utils';
import Navbar from '@/components/Navbar';

export default function AttendancePage() {
  const [personnel, setPersonnel] = useState<Personnel[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPersonnel();
  }, []);

  useEffect(() => {
    fetchAttendances();
  }, [currentDate]);

  const fetchPersonnel = async () => {
    try {
      const response = await fetch('/api/personnel');
      const data = await response.json();
      setPersonnel(data);
    } catch (error) {
      console.error('Failed to fetch personnel:', error);
    }
  };

  const fetchAttendances = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const response = await fetch(`/api/attendances?year=${year}&month=${month}`);
      const data = await response.json();
      setAttendances(data);
    } catch (error) {
      console.error('Failed to fetch attendances:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (personnelId: string, date: string, status: Attendance['status']) => {
    try {
      const existingAttendance = attendances.find(a => a.personnelId === personnelId && a.date === date);
      
      let hoursWorked = 0;
      if (status === 'present' || status === 'night_shift' || status === 'holiday_work') {
        hoursWorked = 8;
      }
      
      if (existingAttendance) {
        await fetch('/api/attendances', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: existingAttendance.id,
            status,
            hoursWorked,
          }),
        });
      } else {
        const selectedPerson = personnel.find(p => p.id === personnelId);
        await fetch('/api/attendances', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personnelId,
            personnelName: selectedPerson?.name || '',
            date,
            status,
            hoursWorked,
          }),
        });
      }
      
      await fetchAttendances();
    } catch (error) {
      console.error('Failed to update attendance:', error);
    }
  };

  // 节假日数组（示例，可根据实际情况添加）
  const holidays = [
    '2026-01-01', // 元旦
    '2026-02-01', // 春节
    '2026-02-02',
    '2026-02-03',
    '2026-04-04', // 清明节
    '2026-05-01', // 劳动节
    '2026-06-25', // 端午节
    '2026-10-01', // 国庆节
    '2026-10-02',
    '2026-10-03',
    '2026-10-04',
    '2026-10-05',
    '2026-10-06',
    '2026-10-07'
  ];

  const getAttendanceStatus = (personnelId: string, date: string): Attendance['status'] => {
    const attendance = attendances.find(a => a.personnelId === personnelId && a.date === date);
    if (attendance) {
      return attendance.status;
    }
    
    // 判断是否为节假日
    if (holidays.includes(date)) {
      return 'rest';
    }
    
    // 判断是否为周六、周日
    const dateObj = new Date(date);
    const dayOfWeek = dateObj.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return 'rest';
    }
    
    return 'present';
  };

  const getDaysInMonth = (year: number, month: number): number[] => {
    const days = [];
    const lastDay = new Date(year, month, 0).getDate();
    for (let i = 1; i <= lastDay; i++) {
      days.push(i);
    }
    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleExport = () => {
    if (attendances.length === 0) return;
    
    const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth() + 1);
    const exportData = personnel.map(p => {
      const row: any = {
        姓名: p.name,
      };
      
      days.forEach(day => {
        const date = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const status = getAttendanceStatus(p.id, date);
        row[`${day}日`] = getStatusText(status);
      });
      
      return row;
    });
    
    exportToExcel(exportData, `考勤表_${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月`);
  };

  const getStatusText = (status: Attendance['status'] | ''): string => {
    const statusMap: Record<Attendance['status'], string> = {
      present: '出勤',
      annual_leave: '年休',
      sick: '病假',
      vacation: '事假',
      maternity_leave: '产假',
      marriage_funeral: '婚丧',
      childcare: '抚育',
      home_leave: '探亲',
      parental_leave: '育儿',
      work_injury: '工伤',
      absent: '旷工',
      nursing: '护理',
      night_shift: '夜班',
      holiday_work: '加班',
      shift_swap: '换休',
      rest: '休息',
    };
    return statusMap[status as Attendance['status']] || '';
  };

  const getStatusColor = (status: Attendance['status']): string => {
    const colorMap: Record<Attendance['status'], string> = {
      present: 'bg-green-100 text-green-800',
      annual_leave: 'bg-blue-100 text-blue-800',
      sick: 'bg-yellow-100 text-yellow-800',
      vacation: 'bg-purple-100 text-purple-800',
      maternity_leave: 'bg-pink-100 text-pink-800',
      marriage_funeral: 'bg-orange-100 text-orange-800',
      childcare: 'bg-indigo-100 text-indigo-800',
      home_leave: 'bg-teal-100 text-teal-800',
      parental_leave: 'bg-emerald-100 text-emerald-800',
      work_injury: 'bg-red-100 text-red-800',
      absent: 'bg-red-100 text-red-800',
      nursing: 'bg-blue-100 text-blue-800',
      night_shift: 'bg-gray-100 text-gray-800',
      holiday_work: 'bg-yellow-100 text-yellow-800',
      shift_swap: 'bg-green-100 text-green-800',
      rest: 'bg-blue-100 text-blue-800',
    };
    return colorMap[status];
  };

  const getMonthStats = (personnelId: string) => {
    const personAttendances = attendances.filter(a => a.personnelId === personnelId);
    return {
      present: personAttendances.filter(a => a.status === 'present').length,
      shiftSwap: personAttendances.filter(a => a.status === 'shift_swap').length,
      annualLeave: personAttendances.filter(a => a.status === 'annual_leave').length,
      rest: personAttendances.filter(a => a.status === 'rest').length,
      sick: personAttendances.filter(a => a.status === 'sick').length,
      vacation: personAttendances.filter(a => a.status === 'vacation').length,
      maternityLeave: personAttendances.filter(a => a.status === 'maternity_leave').length,
      marriageFuneral: personAttendances.filter(a => a.status === 'marriage_funeral').length,
      childcare: personAttendances.filter(a => a.status === 'childcare').length,
      homeLeave: personAttendances.filter(a => a.status === 'home_leave').length,
      parentalLeave: personAttendances.filter(a => a.status === 'parental_leave').length,
      workInjury: personAttendances.filter(a => a.status === 'work_injury').length,
      absent: personAttendances.filter(a => a.status === 'absent').length,
      nursing: personAttendances.filter(a => a.status === 'nursing').length,
      nightShift: personAttendances.filter(a => a.status === 'night_shift').length,
      holidayWork: personAttendances.filter(a => a.status === 'holiday_work').length,
      totalHours: personAttendances.reduce((sum, a) => sum + (a.hoursWorked || 0), 0),
    };
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const days = getDaysInMonth(year, month);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar title="人员考勤系统" />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">人员考勤系统</h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handlePreviousMonth}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              上月
            </button>
            <span className="text-lg font-semibold text-gray-900">
              {year}年{month}月
            </span>
            <button
              onClick={handleNextMonth}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              下月
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              导出Excel
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">加载中...</div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
                      姓名
                    </th>
                    {days.map(day => (
                      <th key={day} scope="col" className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {day}
                      </th>
                    ))}
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      出勤
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      换休
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      年休
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      休息
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      病假
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      事假
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      产假
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      婚/丧
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      抚育
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      探亲
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      育儿
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      工伤
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      旷工
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      护理
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      夜班
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      节日出勤
                    </th>
                    <th scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      总工时
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {personnel.map((person) => {
                    const stats = getMonthStats(person.id);
                    return (
                      <tr key={person.id}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium sticky left-0 bg-white">
                          {person.name}
                        </td>
                        {days.map(day => {
                          const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const dateObj = new Date(date);
                          const dayOfWeek = dateObj.getDay();
                          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                          const isHoliday = holidays.includes(date);
                          
                          // 对于周末和节假日，默认使用 rest 状态显示为休息
                          const status = getAttendanceStatus(person.id, date);
                          
                          // 渲染选择框
                          return (
                            <td key={day} className="px-1 py-2 text-center">
                              <select
                                value={status}
                                onChange={(e) => handleStatusChange(person.id, date, e.target.value as Attendance['status'])}
                                className={`w-full text-[10px] rounded px-0.5 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusColor(status)} appearance-none`}
                                style={{ writingMode: 'vertical-lr', textOrientation: 'mixed', height: '30px', backgroundImage: 'none' }}
                              >
                                <option value="present">出勤</option>
                                <option value="shift_swap">换休</option>
                                <option value="annual_leave">年休</option>
                                <option value="rest">休息</option>
                                <option value="sick">病假</option>
                                <option value="vacation">事假</option>
                                <option value="maternity_leave">产假</option>
                                <option value="marriage_funeral">婚丧</option>
                                <option value="childcare">抚育</option>
                                <option value="home_leave">探亲</option>
                                <option value="parental_leave">育儿</option>
                                <option value="work_injury">工伤</option>
                                <option value="absent">旷工</option>
                                <option value="nursing">护理</option>
                                <option value="night_shift">夜班</option>
                                <option value="holiday_work">加班</option>
                              </select>
                            </td>
                          );
                        })}
                        <td className="px-3 py-3 text-center text-sm text-green-600 font-medium">
                          {stats.present}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-green-600 font-medium">
                          {stats.shiftSwap}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-blue-600 font-medium">
                          {stats.annualLeave}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-blue-600 font-medium">
                          {stats.rest}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-yellow-600 font-medium">
                          {stats.sick}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-purple-600 font-medium">
                          {stats.vacation}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-pink-600 font-medium">
                          {stats.maternityLeave}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-orange-600 font-medium">
                          {stats.marriageFuneral}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-indigo-600 font-medium">
                          {stats.childcare}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-teal-600 font-medium">
                          {stats.homeLeave}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-emerald-600 font-medium">
                          {stats.parentalLeave}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-red-600 font-medium">
                          {stats.workInjury}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-red-600 font-medium">
                          {stats.absent}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-blue-600 font-medium">
                          {stats.nursing}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-600 font-medium">
                          {stats.nightShift}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-yellow-600 font-medium">
                          {stats.holidayWork}
                        </td>
                        <td className="px-3 py-3 text-center text-sm text-gray-900 font-medium">
                          {stats.totalHours}h
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">本月考勤统计</h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <div className="bg-green-50 rounded-lg p-2 min-w-[80px] flex-shrink-0">
                  <div className="text-xs text-green-600 mb-1">总出勤</div>
                  <div className="text-xl font-bold text-green-700">
                    {attendances.filter(a => a.status === 'present').length}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-2 min-w-[80px] flex-shrink-0">
                  <div className="text-xs text-green-600 mb-1">总换休</div>
                  <div className="text-xl font-bold text-green-700">
                    {attendances.filter(a => a.status === 'shift_swap').length}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-2 min-w-[80px] flex-shrink-0">
                  <div className="text-xs text-blue-600 mb-1">总年休</div>
                  <div className="text-xl font-bold text-blue-700">
                    {attendances.filter(a => a.status === 'annual_leave').length}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-2 min-w-[80px] flex-shrink-0">
                  <div className="text-xs text-blue-600 mb-1">总休息</div>
                  <div className="text-xl font-bold text-blue-700">
                    {attendances.filter(a => a.status === 'rest').length}
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2 min-w-[80px] flex-shrink-0">
                  <div className="text-xs text-yellow-600 mb-1">总病假</div>
                  <div className="text-xl font-bold text-yellow-700">
                    {attendances.filter(a => a.status === 'sick').length}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-2 min-w-[80px] flex-shrink-0">
                  <div className="text-xs text-purple-600 mb-1">总事假</div>
                  <div className="text-xl font-bold text-purple-700">
                    {attendances.filter(a => a.status === 'vacation').length}
                  </div>
                </div>
                <div className="bg-pink-50 rounded-lg p-2 min-w-[80px] flex-shrink-0">
                  <div className="text-xs text-pink-600 mb-1">总产假</div>
                  <div className="text-xl font-bold text-pink-700">
                    {attendances.filter(a => a.status === 'maternity_leave').length}
                  </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-2 min-w-[80px] flex-shrink-0">
                  <div className="text-xs text-orange-600 mb-1">总婚/丧假</div>
                  <div className="text-xl font-bold text-orange-700">
                    {attendances.filter(a => a.status === 'marriage_funeral').length}
                  </div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-2 min-w-[80px] flex-shrink-0">
                  <div className="text-xs text-indigo-600 mb-1">总抚育假</div>
                  <div className="text-xl font-bold text-indigo-700">
                    {attendances.filter(a => a.status === 'childcare').length}
                  </div>
                </div>
                <div className="bg-teal-50 rounded-lg p-2 min-w-[80px] flex-shrink-0">
                  <div className="text-xs text-teal-600 mb-1">总探亲假</div>
                  <div className="text-xl font-bold text-teal-700">
                    {attendances.filter(a => a.status === 'home_leave').length}
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-lg p-2 min-w-[80px] flex-shrink-0">
                  <div className="text-xs text-emerald-600 mb-1">总育儿假</div>
                  <div className="text-xl font-bold text-emerald-700">
                    {attendances.filter(a => a.status === 'parental_leave').length}
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-2 min-w-[80px] flex-shrink-0">
                  <div className="text-xs text-red-600 mb-1">总工伤假</div>
                  <div className="text-xl font-bold text-red-700">
                    {attendances.filter(a => a.status === 'work_injury').length}
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-2 min-w-[80px] flex-shrink-0">
                  <div className="text-xs text-red-600 mb-1">总旷工</div>
                  <div className="text-xl font-bold text-red-700">
                    {attendances.filter(a => a.status === 'absent').length}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-2 min-w-[80px] flex-shrink-0">
                  <div className="text-xs text-blue-600 mb-1">总护理假</div>
                  <div className="text-xl font-bold text-blue-700">
                    {attendances.filter(a => a.status === 'nursing').length}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-2 min-w-[80px] flex-shrink-0">
                  <div className="text-xs text-gray-600 mb-1">总夜班</div>
                  <div className="text-xl font-bold text-gray-700">
                    {attendances.filter(a => a.status === 'night_shift').length}
                  </div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-2 min-w-[80px] flex-shrink-0">
                  <div className="text-xs text-yellow-600 mb-1">总节日出勤</div>
                  <div className="text-xl font-bold text-yellow-700">
                    {attendances.filter(a => a.status === 'holiday_work').length}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-2 min-w-[80px] flex-shrink-0">
                  <div className="text-xs text-green-600 mb-1">总换休</div>
                  <div className="text-xl font-bold text-green-700">
                    {attendances.filter(a => a.status === 'shift_swap').length}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
