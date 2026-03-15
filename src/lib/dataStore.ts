import {
  Personnel,
  ExperienceShare,
  Comment,
  DailyWork,
  WorkOrder,
  Instrument,
  MaintenancePlan,
  Fault,
  RecycleRecord,
  TrainingPlan,
  Schedule,
  Document,
  Statistics,
  Attendance,
  EmotionHealthRecord,
} from '@/types';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'data');
const DATA_FILE = join(DATA_DIR, 'data.json');

class DataStore {
  private static instance: DataStore;

  private personnel: Personnel[] = [];
  private experiences: ExperienceShare[] = [];
  private dailyWorks: DailyWork[] = [];
  private workOrders: WorkOrder[] = [];
  private instruments: Instrument[] = [];
  private maintenancePlans: MaintenancePlan[] = [];
  private faults: Fault[] = [];
  private recycleRecords: RecycleRecord[] = [];
  private trainingPlans: TrainingPlan[] = [];
  private schedules: Schedule[] = [];
  private documents: Document[] = [];
  private attendances: Attendance[] = [];
  private emotionHealthRecords: EmotionHealthRecord[] = [];

  private constructor() {
    this.loadData();
  }

  private loadData() {
    if (existsSync(DATA_FILE)) {
      try {
        const data = JSON.parse(readFileSync(DATA_FILE, 'utf8'));
        this.personnel = data.personnel || [];
        this.experiences = data.experiences || [];
        this.dailyWorks = data.dailyWorks || [];
        this.workOrders = data.workOrders || [];
        this.instruments = data.instruments || [];
        this.maintenancePlans = data.maintenancePlans || [];
        this.faults = data.faults || [];
        this.recycleRecords = data.recycleRecords || [];
        this.trainingPlans = data.trainingPlans || [];
        this.schedules = data.schedules || [];
        this.documents = data.documents || [];
        this.attendances = data.attendances || [];
        this.emotionHealthRecords = data.emotionHealthRecords || [];
      } catch (error) {
        console.error('Failed to load data:', error);
        this.initializeSampleData();
      }
    } else {
      this.initializeSampleData();
    }
  }

  private saveData() {
    if (!existsSync(DATA_DIR)) {
      mkdirSync(DATA_DIR, { recursive: true });
    }
    try {
      const data = {
        personnel: this.personnel,
        experiences: this.experiences,
        dailyWorks: this.dailyWorks,
        workOrders: this.workOrders,
        instruments: this.instruments,
        maintenancePlans: this.maintenancePlans,
        faults: this.faults,
        recycleRecords: this.recycleRecords,
        trainingPlans: this.trainingPlans,
        schedules: this.schedules,
        documents: this.documents,
        attendances: this.attendances,
        emotionHealthRecords: this.emotionHealthRecords,
      };
      writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  static getInstance(): DataStore {
    if (!DataStore.instance) {
      DataStore.instance = new DataStore();
    }
    return DataStore.instance;
  }

  private initializeSampleData() {
    this.personnel = [
      {
        id: '1',
        name: '张三',
        employeeId: 'EMP001',
        department: '维护部',
        team: '一班',
        position: '维修组长',
        education: '本科',
        graduationSchool: '北京理工大学',
        skillLevel: '高级工程师',
        phone: '13800138001',
        email: 'zhangsan@example.com',
        hireDate: '2020-01-15',
        status: 'active',
        skills: ['仪表维护', '故障诊断', '系统调试'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: '2',
        name: '李四',
        employeeId: 'EMP002',
        department: '维护部',
        team: '二班',
        position: '维修工程师',
        education: '大专',
        graduationSchool: '上海职业技术学院',
        skillLevel: '工程师',
        phone: '13800138002',
        email: 'lisi@example.com',
        hireDate: '2021-03-20',
        status: 'active',
        skills: ['仪表维护', '预防性维护'],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    this.instruments = [
      {
        id: 'INST001',
        code: 'INST-001',
        tag: 'PT-100-001',
        name: '压力变送器',
        model: 'PT-100',
        manufacturer: '艾默生',
        location: '车间A-1',
        installationDate: '2020-05-15',
        status: 'normal',
        specifications: {
          '量程': '0-10MPa',
          '精度': '0.1%',
          '输出信号': '4-20mA',
        },
        lastMaintenanceDate: '2024-02-15',
        nextMaintenanceDate: '2024-05-15',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'INST002',
        code: 'INST-002',
        tag: 'TT-200-002',
        name: '温度变送器',
        model: 'TT-200',
        manufacturer: '霍尼韦尔',
        location: '车间B-2',
        installationDate: '2020-06-20',
        status: 'normal',
        specifications: {
          '量程': '-50-200℃',
          '精度': '0.2%',
          '输出信号': '4-20mA',
        },
        lastMaintenanceDate: '2024-02-20',
        nextMaintenanceDate: '2024-05-20',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      },
    ];

    this.workOrders = [
      {
        id: 'WO001',
        orderNumber: 'WO-2024-001',
        instrumentId: 'INST001',
        instrumentName: '压力变送器',
        instrumentTag: 'PT-001',
        instrumentLocation: '车间A-1',
        faultDescription: '显示值波动异常',
        priority: 'high',
        status: 'in_progress',
        assignedTo: '1',
        assignedToName: '张三',
        assignedAt: '2024-03-01T08:00:00Z',
        startedAt: '2024-03-01T09:00:00Z',
        report: '仪表显示值波动，需要检查传感器和线路',
        reporterId: '2',
        reporterName: '李四',
        createdAt: '2024-03-01T07:30:00Z',
        updatedAt: '2024-03-01T09:00:00Z',
      },
    ];

    this.experiences = [
      {
        id: 'EXP001',
        title: '压力变送器常见故障处理经验',
        content: '在日常维护中，压力变送器常见的故障包括零点漂移、输出信号不稳定等...',
        authorId: '1',
        authorName: '张三',
        category: '故障处理',
        likes: 5,
        likedBy: ['2'],
        comments: [
          {
            id: 'C001',
            content: '非常有用的经验分享！',
            authorId: '2',
            authorName: '李四',
            createdAt: '2024-02-28T10:00:00Z',
          },
        ],
        createdAt: '2024-02-25T08:00:00Z',
        updatedAt: '2024-02-25T08:00:00Z',
      },
    ];

    this.maintenancePlans = [
      {
        id: 'MP001',
        planNumber: 'MP-20260315',
        instrumentId: 'INST001',
        instrumentTag: 'PT-100-001',
        instrumentName: '压力变送器',
        type: 'preventive',
        title: '压力变送器月度维护',
        description: '检查压力变送器的校准状态，清洁传感器，验证输出信号',
        scheduledDate: '2026-03-15',
        frequency: 'monthly',
        assignedTo: '1',
        assignedToName: '张三',
        status: 'scheduled',
        createdAt: '2026-03-12T00:00:00Z',
        updatedAt: '2026-03-12T00:00:00Z',
      },
      {
        id: 'MP002',
        planNumber: 'MP-20260320',
        instrumentId: 'INST002',
        instrumentTag: 'TT-200-002',
        instrumentName: '温度变送器',
        type: 'predictive',
        title: '温度变送器季度维护',
        description: '检查温度变送器的校准状态，清洁传感器，验证输出信号',
        scheduledDate: '2026-03-20',
        frequency: 'quarterly',
        assignedTo: '2',
        assignedToName: '李四',
        status: 'pending',
        createdAt: '2026-03-12T00:00:00Z',
        updatedAt: '2026-03-12T00:00:00Z',
      },
    ];

    this.attendances = [
      {
        id: 'ATT001',
        personnelId: '1',
        personnelName: '张三',
        date: '2024-03-10',
        status: 'present',
        hoursWorked: 8,
        createdAt: '2024-03-10T08:00:00Z',
        updatedAt: '2024-03-10T17:00:00Z',
      },
      {
        id: 'ATT002',
        personnelId: '1',
        personnelName: '张三',
        date: '2024-03-11',
        status: 'present',
        hoursWorked: 7.5,
        createdAt: '2024-03-11T08:30:00Z',
        updatedAt: '2024-03-11T17:00:00Z',
      },
      {
        id: 'ATT003',
        personnelId: '2',
        personnelName: '李四',
        date: '2024-03-10',
        status: 'present',
        hoursWorked: 7.5,
        createdAt: '2024-03-10T08:00:00Z',
        updatedAt: '2024-03-10T16:30:00Z',
      },
      {
        id: 'ATT004',
        personnelId: '2',
        personnelName: '李四',
        date: '2024-03-11',
        status: 'sick',
        hoursWorked: 0,
        notes: '病假',
        createdAt: '2024-03-11T00:00:00Z',
        updatedAt: '2024-03-11T00:00:00Z',
      },
    ];

    this.emotionHealthRecords = [
      {
        id: 'EHR001',
        personnelId: '1',
        personnelName: '张三',
        date: '2026-03-14',
        emotionScore: 8,
        systolicBP: 120,
        diastolicBP: 80,
        isSuitableForWork: true,
        statusColor: 'green',
        notes: '状态良好',
        createdAt: '2026-03-14T08:00:00Z',
        updatedAt: '2026-03-14T08:00:00Z',
      },
      {
        id: 'EHR002',
        personnelId: '2',
        personnelName: '李四',
        date: '2026-03-14',
        emotionScore: 5,
        systolicBP: 135,
        diastolicBP: 90,
        isSuitableForWork: true,
        statusColor: 'yellow',
        notes: '情绪一般，血压偏高',
        createdAt: '2026-03-14T08:00:00Z',
        updatedAt: '2026-03-14T08:00:00Z',
      },
      {
        id: 'EHR003',
        personnelId: '1',
        personnelName: '张三',
        date: '2026-03-13',
        emotionScore: 3,
        systolicBP: 145,
        diastolicBP: 95,
        isSuitableForWork: false,
        statusColor: 'red',
        notes: '情绪不佳，血压过高',
        createdAt: '2026-03-13T08:00:00Z',
        updatedAt: '2026-03-13T08:00:00Z',
      },
    ];
  }

  getPersonnel(): Personnel[] {
    return [...this.personnel];
  }

  getPersonnelById(id: string): Personnel | undefined {
    return this.personnel.find(p => p.id === id);
  }

  createPersonnel(data: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>): Personnel {
    const newPersonnel: Personnel = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.personnel.push(newPersonnel);
    this.saveData();
    return newPersonnel;
  }

  updatePersonnel(id: string, data: Partial<Personnel>): Personnel | null {
    const index = this.personnel.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.personnel[index] = {
      ...this.personnel[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.personnel[index];
  }

  deletePersonnel(id: string): boolean {
    const index = this.personnel.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.personnel.splice(index, 1);
    this.saveData();
    return true;
  }

  getExperiences(): ExperienceShare[] {
    return [...this.experiences];
  }

  createExperience(data: Omit<ExperienceShare, 'id' | 'likes' | 'likedBy' | 'comments' | 'createdAt' | 'updatedAt'>): ExperienceShare {
    const newExperience: ExperienceShare = {
      ...data,
      id: Date.now().toString(),
      likes: 0,
      likedBy: [],
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.experiences.push(newExperience);
    this.saveData();
    return newExperience;
  }

  likeExperience(id: string, userId: string): ExperienceShare | null {
    const experience = this.experiences.find(e => e.id === id);
    if (!experience) return null;
    
    if (!experience.likedBy.includes(userId)) {
      experience.likedBy.push(userId);
      experience.likes++;
      experience.updatedAt = new Date().toISOString();
      this.saveData();
    }
    return experience;
  }

  addComment(experienceId: string, comment: Omit<Comment, 'id' | 'createdAt'>): ExperienceShare | null {
    const experience = this.experiences.find(e => e.id === experienceId);
    if (!experience) return null;
    
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    experience.comments.push(newComment);
    experience.updatedAt = new Date().toISOString();
    this.saveData();
    return experience;
  }

  getDailyWorks(): DailyWork[] {
    return [...this.dailyWorks];
  }

  createDailyWork(data: Omit<DailyWork, 'id' | 'createdAt' | 'updatedAt'>): DailyWork {
    const newDailyWork: DailyWork = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.dailyWorks.push(newDailyWork);
    this.saveData();
    return newDailyWork;
  }

  updateDailyWork(id: string, data: Partial<DailyWork>): DailyWork | null {
    const index = this.dailyWorks.findIndex(w => w.id === id);
    if (index === -1) return null;
    this.dailyWorks[index] = {
      ...this.dailyWorks[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.dailyWorks[index];
  }

  getWorkOrders(): WorkOrder[] {
    return [...this.workOrders];
  }

  createWorkOrder(data: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>): WorkOrder {
    const newWorkOrder: WorkOrder = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.workOrders.push(newWorkOrder);
    this.saveData();
    return newWorkOrder;
  }

  updateWorkOrder(id: string, data: Partial<WorkOrder>): WorkOrder | null {
    const index = this.workOrders.findIndex(w => w.id === id);
    if (index === -1) return null;
    this.workOrders[index] = {
      ...this.workOrders[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.workOrders[index];
  }

  getInstruments(): Instrument[] {
    return [...this.instruments];
  }

  createInstrument(data: Omit<Instrument, 'id' | 'createdAt' | 'updatedAt'>): Instrument {
    const newInstrument: Instrument = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.instruments.push(newInstrument);
    this.saveData();
    return newInstrument;
  }

  updateInstrument(id: string, data: Partial<Instrument>): Instrument | null {
    const index = this.instruments.findIndex(i => i.id === id);
    if (index === -1) return null;
    this.instruments[index] = {
      ...this.instruments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.instruments[index];
  }

  deleteInstrument(id: string): boolean {
    const index = this.instruments.findIndex(i => i.id === id);
    if (index === -1) return false;
    this.instruments.splice(index, 1);
    this.saveData();
    return true;
  }

  getFaults(): Fault[] {
    return [...this.faults];
  }

  createFault(data: Omit<Fault, 'id' | 'createdAt' | 'updatedAt'>): Fault {
    const newFault: Fault = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.faults.push(newFault);
    this.saveData();
    return newFault;
  }

  updateFault(id: string, data: Partial<Fault>): Fault | null {
    const index = this.faults.findIndex(f => f.id === id);
    if (index === -1) return null;
    this.faults[index] = {
      ...this.faults[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.faults[index];
  }

  deleteFault(id: string): boolean {
    const index = this.faults.findIndex(f => f.id === id);
    if (index === -1) return false;
    this.faults.splice(index, 1);
    this.saveData();
    return true;
  }

  getMaintenancePlans(): MaintenancePlan[] {
    return [...this.maintenancePlans];
  }

  createMaintenancePlan(data: Omit<MaintenancePlan, 'id' | 'createdAt' | 'updatedAt'>): MaintenancePlan {
    const newPlan: MaintenancePlan = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.maintenancePlans.push(newPlan);
    this.saveData();
    return newPlan;
  }

  updateMaintenancePlan(id: string, data: Partial<MaintenancePlan>): MaintenancePlan | null {
    const index = this.maintenancePlans.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.maintenancePlans[index] = {
      ...this.maintenancePlans[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.maintenancePlans[index];
  }

  getRecycleRecords(): RecycleRecord[] {
    return [...this.recycleRecords];
  }

  createRecycleRecord(data: Omit<RecycleRecord, 'id' | 'createdAt' | 'updatedAt'>): RecycleRecord {
    const newRecord: RecycleRecord = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.recycleRecords.push(newRecord);
    this.saveData();
    return newRecord;
  }

  updateRecycleRecord(id: string, data: Partial<RecycleRecord>): RecycleRecord | null {
    const index = this.recycleRecords.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.recycleRecords[index] = {
      ...this.recycleRecords[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.recycleRecords[index];
  }

  deleteRecycleRecord(id: string): boolean {
    const index = this.recycleRecords.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.recycleRecords.splice(index, 1);
    this.saveData();
    return true;
  }

  getTrainingPlans(): TrainingPlan[] {
    return [...this.trainingPlans];
  }

  createTrainingPlan(data: Omit<TrainingPlan, 'id' | 'createdAt' | 'updatedAt'>): TrainingPlan {
    const newPlan: TrainingPlan = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.trainingPlans.push(newPlan);
    this.saveData();
    return newPlan;
  }

  updateTrainingPlan(id: string, data: Partial<TrainingPlan>): TrainingPlan | null {
    const index = this.trainingPlans.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.trainingPlans[index] = {
      ...this.trainingPlans[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.trainingPlans[index];
  }

  getSchedules(): Schedule[] {
    return [...this.schedules];
  }

  createSchedule(data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Schedule {
    const newSchedule: Schedule = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.schedules.push(newSchedule);
    this.saveData();
    return newSchedule;
  }

  getDocuments(): Document[] {
    return [...this.documents];
  }

  createDocument(data: Omit<Document, 'id' | 'downloadCount' | 'createdAt' | 'updatedAt'>): Document {
    const newDocument: Document = {
      ...data,
      id: Date.now().toString(),
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.documents.push(newDocument);
    this.saveData();
    return newDocument;
  }

  incrementDocumentDownloadCount(id: string): Document | null {
    const document = this.documents.find(d => d.id === id);
    if (!document) return null;
    document.downloadCount++;
    document.updatedAt = new Date().toISOString();
    this.saveData();
    return document;
  }

  getAttendances(): Attendance[] {
    return [...this.attendances];
  }

  getAttendancesByMonth(year: number, month: number): Attendance[] {
    return this.attendances.filter(a => {
      const date = new Date(a.date);
      return date.getFullYear() === year && date.getMonth() === month - 1;
    });
  }

  getAttendanceByPersonnelAndDate(personnelId: string, date: string): Attendance | undefined {
    return this.attendances.find(a => a.personnelId === personnelId && a.date === date);
  }

  createAttendance(data: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>): Attendance {
    const newAttendance: Attendance = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.attendances.push(newAttendance);
    this.saveData();
    return newAttendance;
  }

  updateAttendance(id: string, data: Partial<Attendance>): Attendance | null {
    const index = this.attendances.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.attendances[index] = {
      ...this.attendances[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.attendances[index];
  }

  deleteAttendance(id: string): boolean {
    const index = this.attendances.findIndex(a => a.id === id);
    if (index === -1) return false;
    this.attendances.splice(index, 1);
    this.saveData();
    return true;
  }

  getStatistics(): Statistics {
    const totalWorkOrders = this.workOrders.length;
    const completedWorkOrders = this.workOrders.filter(w => w.status === 'completed').length;
    const activeWorkOrders = this.workOrders.filter(w => w.status !== 'completed' && w.status !== 'cancelled').length;
    const maintenanceCompletionRate = totalWorkOrders > 0 ? (completedWorkOrders / totalWorkOrders) * 100 : 0;
    
    return {
      maintenanceCompletionRate,
      faultFrequency: this.faults.length,
      totalWorkHours: 120,
      averageResponseTime: 2.5,
      activeWorkOrders,
      completedWorkOrders,
      monthlyData: [
        {
          month: '2024-01',
          workOrders: 15,
          faults: 8,
          maintenanceHours: 45,
          completionRate: 93.3,
        },
        {
          month: '2024-02',
          workOrders: 18,
          faults: 10,
          maintenanceHours: 52,
          completionRate: 94.4,
        },
        {
          month: '2024-03',
          workOrders: 12,
          faults: 6,
          maintenanceHours: 38,
          completionRate: 95.8,
        },
      ],
    };
  }

  getEmotionHealthRecords(): EmotionHealthRecord[] {
    return [...this.emotionHealthRecords];
  }

  getEmotionHealthRecordsByDate(date: string): EmotionHealthRecord[] {
    return this.emotionHealthRecords.filter(record => record.date === date);
  }

  getEmotionHealthRecordsByPersonnel(personnelId: string): EmotionHealthRecord[] {
    return this.emotionHealthRecords.filter(record => record.personnelId === personnelId);
  }

  createEmotionHealthRecord(data: Omit<EmotionHealthRecord, 'id' | 'createdAt' | 'updatedAt'>): EmotionHealthRecord {
    const newRecord: EmotionHealthRecord = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.emotionHealthRecords.push(newRecord);
    this.saveData();
    return newRecord;
  }

  updateEmotionHealthRecord(id: string, data: Partial<EmotionHealthRecord>): EmotionHealthRecord | null {
    const index = this.emotionHealthRecords.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.emotionHealthRecords[index] = {
      ...this.emotionHealthRecords[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.saveData();
    return this.emotionHealthRecords[index];
  }

  deleteEmotionHealthRecord(id: string): boolean {
    const index = this.emotionHealthRecords.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.emotionHealthRecords.splice(index, 1);
    this.saveData();
    return true;
  }
}

export default DataStore;
