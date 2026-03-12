export interface Personnel {
  id: string;
  name: string;
  employeeId: string;
  department: string;
  team: string;
  skillLevel: string;
  phone: string;
  email: string;
  hireDate: string;
  status: 'active' | 'inactive';
  photo?: string;
  skills?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ExperienceShare {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  category: string;
  images?: string[];
  likes: number;
  likedBy: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface DailyWork {
  id: string;
  personnelId: string;
  personnelName: string;
  date: string;
  tasks: WorkTask[];
  status: 'pending' | 'in_progress' | 'completed';
  images?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkTask {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  estimatedHours: number;
  actualHours?: number;
  completedAt?: string;
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  instrumentId: string;
  instrumentName: string;
  instrumentTag: string;
  instrumentLocation: string;
  faultDescription: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  assignedToName?: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  report: string;
  reporterId: string;
  reporterName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Instrument {
  id: string;
  code: string;
  tag: string;
  name: string;
  model: string;
  manufacturer: string;
  location: string;
  installationDate: string;
  status: 'normal' | 'maintenance' | 'fault' | 'retired';
  specifications: Record<string, string>;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MaintenancePlan {
  id: string;
  planNumber: string;
  instrumentId: string;
  instrumentName: string;
  instrumentTag: string;
  type: 'preventive' | 'predictive';
  title: string;
  description: string;
  scheduledDate: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  assignedTo?: string;
  assignedToName?: string;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Fault {
  id: string;
  faultNumber: string;
  instrumentId: string;
  instrumentName: string;
  instrumentLocation: string;
  faultType: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'investigating' | 'fixing' | 'resolved' | 'closed';
  reportedBy: string;
  reportedByName: string;
  assignedTo?: string;
  assignedToName?: string;
  resolvedAt?: string;
  resolution?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RecycleRecord {
  id: string;
  recordNumber: string;
  itemName: string;
  itemCode: string;
  originalValue: number;
  repairCost: number;
  savedValue: number;
  repairDate: string;
  repairedBy: string;
  repairedByName: string;
  description: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TrainingPlan {
  id: string;
  planNumber: string;
  title: string;
  description: string;
  trainer: string;
  trainerName: string;
  startDate: string;
  endDate: string;
  location: string;
  participants: string[];
  participantNames: string[];
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';
  evaluationScore?: number;
  feedback?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  id: string;
  scheduleNumber: string;
  year: number;
  month: number;
  type: 'day_shift' | 'night_shift' | 'rotating';
  shifts: Shift[];
  createdAt: string;
  updatedAt: string;
}

export interface Shift {
  id: string;
  date: string;
  shiftType: 'morning' | 'afternoon' | 'night';
  personnelId: string;
  personnelName: string;
  position: string;
}

export interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl: string;
  uploadedBy: string;
  uploadedByName: string;
  tags?: string[];
  downloadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Statistics {
  maintenanceCompletionRate: number;
  faultFrequency: number;
  totalWorkHours: number;
  averageResponseTime: number;
  activeWorkOrders: number;
  completedWorkOrders: number;
  monthlyData: MonthlyData[];
}

export interface MonthlyData {
  month: string;
  workOrders: number;
  faults: number;
  maintenanceHours: number;
  completionRate: number;
}
