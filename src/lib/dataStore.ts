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

// 尝试导入Netlify Blobs
let getStore: any = null;
try {
  const blobs = require('@netlify/blobs');
  getStore = blobs.getStore;
  // 测试Netlify Blobs是否可用
  try {
    // 尝试创建一个store实例，如果失败则认为Netlify Blobs不可用
    const store = getStore('app-data');
  } catch (error) {
    console.log('Netlify Blobs initialization failed, using file system storage');
    getStore = null;
  }
} catch (error) {
  // 本地开发环境可能没有Netlify Blobs
  console.log('Netlify Blobs not available, using file system storage');
}

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
    // 启动时加载数据，但不等待完成
    this.loadData().catch(error => {
      console.error('Failed to load data during initialization:', error);
    });
  }

  private async loadData() {
    try {
      // 优先使用Netlify Blobs
      if (getStore) {
        console.log('Loading data from Netlify Blobs');
        const store = getStore('app-data');
        const dataString = await store.get('app-data');
        if (dataString) {
          const data = JSON.parse(dataString);
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
          return;
        }
      }
      
      // 回退到文件系统
      console.log('Loading data from file system');
      if (existsSync(DATA_FILE)) {
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
      } else {
        this.initializeSampleData();
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      this.initializeSampleData();
    }
  }

  private async saveData() {
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
      
      // 优先使用Netlify Blobs
      if (getStore) {
        console.log('Saving data to Netlify Blobs');
        const store = getStore('app-data');
        await store.set('app-data', JSON.stringify(data, null, 2));
        return;
      }
      
      // 回退到文件系统
      console.log('Saving data to file system');
      if (!existsSync(DATA_DIR)) {
        mkdirSync(DATA_DIR, { recursive: true });
      }
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

  async createPersonnel(data: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Personnel> {
    const newPersonnel: Personnel = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.personnel.push(newPersonnel);
    await this.saveData();
    return newPersonnel;
  }

  async updatePersonnel(id: string, data: Partial<Personnel>): Promise<Personnel | null> {
    const index = this.personnel.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.personnel[index] = {
      ...this.personnel[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await this.saveData();
    return this.personnel[index];
  }

  async deletePersonnel(id: string): Promise<boolean> {
    const index = this.personnel.findIndex(p => p.id === id);
    if (index === -1) return false;
    this.personnel.splice(index, 1);
    await this.saveData();
    return true;
  }

  getExperiences(): ExperienceShare[] {
    return [...this.experiences];
  }

  async createExperience(data: Omit<ExperienceShare, 'id' | 'likes' | 'likedBy' | 'comments' | 'createdAt' | 'updatedAt'>): Promise<ExperienceShare> {
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
    await this.saveData();
    return newExperience;
  }

  async likeExperience(id: string, userId: string): Promise<ExperienceShare | null> {
    const experience = this.experiences.find(e => e.id === id);
    if (!experience) return null;
    
    if (!experience.likedBy.includes(userId)) {
      experience.likedBy.push(userId);
      experience.likes++;
      experience.updatedAt = new Date().toISOString();
      await this.saveData();
    }
    return experience;
  }

  async addComment(experienceId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Promise<ExperienceShare | null> {
    const experience = this.experiences.find(e => e.id === experienceId);
    if (!experience) return null;
    
    const newComment: Comment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    experience.comments.push(newComment);
    experience.updatedAt = new Date().toISOString();
    await this.saveData();
    return experience;
  }

  getDailyWorks(): DailyWork[] {
    return [...this.dailyWorks];
  }

  async createDailyWork(data: Omit<DailyWork, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyWork> {
    const newDailyWork: DailyWork = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.dailyWorks.push(newDailyWork);
    await this.saveData();
    return newDailyWork;
  }

  async updateDailyWork(id: string, data: Partial<DailyWork>): Promise<DailyWork | null> {
    const index = this.dailyWorks.findIndex(w => w.id === id);
    if (index === -1) return null;
    this.dailyWorks[index] = {
      ...this.dailyWorks[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await this.saveData();
    return this.dailyWorks[index];
  }

  getWorkOrders(): WorkOrder[] {
    return [...this.workOrders];
  }

  async createWorkOrder(data: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkOrder> {
    const newWorkOrder: WorkOrder = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.workOrders.push(newWorkOrder);
    await this.saveData();
    return newWorkOrder;
  }

  async updateWorkOrder(id: string, data: Partial<WorkOrder>): Promise<WorkOrder | null> {
    const index = this.workOrders.findIndex(w => w.id === id);
    if (index === -1) return null;
    this.workOrders[index] = {
      ...this.workOrders[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await this.saveData();
    return this.workOrders[index];
  }

  getInstruments(): Instrument[] {
    return [...this.instruments];
  }

  async createInstrument(data: Omit<Instrument, 'id' | 'createdAt' | 'updatedAt'>): Promise<Instrument> {
    const newInstrument: Instrument = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.instruments.push(newInstrument);
    await this.saveData();
    return newInstrument;
  }

  async updateInstrument(id: string, data: Partial<Instrument>): Promise<Instrument | null> {
    const index = this.instruments.findIndex(i => i.id === id);
    if (index === -1) return null;
    this.instruments[index] = {
      ...this.instruments[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await this.saveData();
    return this.instruments[index];
  }

  async deleteInstrument(id: string): Promise<boolean> {
    const index = this.instruments.findIndex(i => i.id === id);
    if (index === -1) return false;
    this.instruments.splice(index, 1);
    await this.saveData();
    return true;
  }

  getFaults(): Fault[] {
    return [...this.faults];
  }

  async createFault(data: Omit<Fault, 'id' | 'createdAt' | 'updatedAt'>): Promise<Fault> {
    const newFault: Fault = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.faults.push(newFault);
    await this.saveData();
    return newFault;
  }

  async updateFault(id: string, data: Partial<Fault>): Promise<Fault | null> {
    const index = this.faults.findIndex(f => f.id === id);
    if (index === -1) return null;
    this.faults[index] = {
      ...this.faults[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await this.saveData();
    return this.faults[index];
  }

  async deleteFault(id: string): Promise<boolean> {
    const index = this.faults.findIndex(f => f.id === id);
    if (index === -1) return false;
    this.faults.splice(index, 1);
    await this.saveData();
    return true;
  }

  getMaintenancePlans(): MaintenancePlan[] {
    return [...this.maintenancePlans];
  }

  async createMaintenancePlan(data: Omit<MaintenancePlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<MaintenancePlan> {
    const newPlan: MaintenancePlan = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.maintenancePlans.push(newPlan);
    await this.saveData();
    return newPlan;
  }

  async updateMaintenancePlan(id: string, data: Partial<MaintenancePlan>): Promise<MaintenancePlan | null> {
    const index = this.maintenancePlans.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.maintenancePlans[index] = {
      ...this.maintenancePlans[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await this.saveData();
    return this.maintenancePlans[index];
  }

  getRecycleRecords(): RecycleRecord[] {
    return [...this.recycleRecords];
  }

  async createRecycleRecord(data: Omit<RecycleRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<RecycleRecord> {
    const newRecord: RecycleRecord = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.recycleRecords.push(newRecord);
    await this.saveData();
    return newRecord;
  }

  async updateRecycleRecord(id: string, data: Partial<RecycleRecord>): Promise<RecycleRecord | null> {
    const index = this.recycleRecords.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.recycleRecords[index] = {
      ...this.recycleRecords[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await this.saveData();
    return this.recycleRecords[index];
  }

  async deleteRecycleRecord(id: string): Promise<boolean> {
    const index = this.recycleRecords.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.recycleRecords.splice(index, 1);
    await this.saveData();
    return true;
  }

  getTrainingPlans(): TrainingPlan[] {
    return [...this.trainingPlans];
  }

  async createTrainingPlan(data: Omit<TrainingPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<TrainingPlan> {
    const newPlan: TrainingPlan = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.trainingPlans.push(newPlan);
    await this.saveData();
    return newPlan;
  }

  async updateTrainingPlan(id: string, data: Partial<TrainingPlan>): Promise<TrainingPlan | null> {
    const index = this.trainingPlans.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.trainingPlans[index] = {
      ...this.trainingPlans[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await this.saveData();
    return this.trainingPlans[index];
  }

  getSchedules(): Schedule[] {
    return [...this.schedules];
  }

  async createSchedule(data: Omit<Schedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Schedule> {
    const newSchedule: Schedule = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.schedules.push(newSchedule);
    await this.saveData();
    return newSchedule;
  }

  getDocuments(): Document[] {
    return [...this.documents];
  }

  async createDocument(data: Omit<Document, 'id' | 'downloadCount' | 'createdAt' | 'updatedAt'>): Promise<Document> {
    const newDocument: Document = {
      ...data,
      id: Date.now().toString(),
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.documents.push(newDocument);
    await this.saveData();
    return newDocument;
  }

  async incrementDocumentDownloadCount(id: string): Promise<Document | null> {
    const document = this.documents.find(d => d.id === id);
    if (!document) return null;
    document.downloadCount++;
    document.updatedAt = new Date().toISOString();
    await this.saveData();
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

  async createAttendance(data: Omit<Attendance, 'id' | 'createdAt' | 'updatedAt'>): Promise<Attendance> {
    const newAttendance: Attendance = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.attendances.push(newAttendance);
    await this.saveData();
    return newAttendance;
  }

  async updateAttendance(id: string, data: Partial<Attendance>): Promise<Attendance | null> {
    const index = this.attendances.findIndex(a => a.id === id);
    if (index === -1) return null;
    this.attendances[index] = {
      ...this.attendances[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await this.saveData();
    return this.attendances[index];
  }

  async deleteAttendance(id: string): Promise<boolean> {
    const index = this.attendances.findIndex(a => a.id === id);
    if (index === -1) return false;
    this.attendances.splice(index, 1);
    await this.saveData();
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

  async createEmotionHealthRecord(data: Omit<EmotionHealthRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<EmotionHealthRecord> {
    const newRecord: EmotionHealthRecord = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.emotionHealthRecords.push(newRecord);
    await this.saveData();
    return newRecord;
  }

  async updateEmotionHealthRecord(id: string, data: Partial<EmotionHealthRecord>): Promise<EmotionHealthRecord | null> {
    const index = this.emotionHealthRecords.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.emotionHealthRecords[index] = {
      ...this.emotionHealthRecords[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    await this.saveData();
    return this.emotionHealthRecords[index];
  }

  async deleteEmotionHealthRecord(id: string): Promise<boolean> {
    const index = this.emotionHealthRecords.findIndex(r => r.id === id);
    if (index === -1) return false;
    this.emotionHealthRecords.splice(index, 1);
    await this.saveData();
    return true;
  }
}

export default DataStore;
