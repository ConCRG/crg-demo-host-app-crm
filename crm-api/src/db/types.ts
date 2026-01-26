// Shared types for CRM API

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  companyId: string;
  status: 'active' | 'lead' | 'inactive';
  jobTitle: string;
  lastActivity: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  industry: string;
  size: string;
  website: string;
  address: string;
  parentId: string | null;
  contactCount: number;
  totalDealValue: number;
  createdAt: string;
}

export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';

export interface StageHistory {
  stage: DealStage;
  date: string;
}

export interface Deal {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  contactId: string;
  contactName: string;
  value: number;
  stage: DealStage;
  probability: number;
  expectedCloseDate: string;
  createdAt: string;
  stageHistory: StageHistory[];
}

export type ActivityType = 'Call' | 'Email' | 'Meeting' | 'Task';
export type ActivityStatus = 'Pending' | 'Completed' | 'Overdue';

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  notes: string;
  relatedTo: string;
  relatedType: 'Contact' | 'Company' | 'Deal';
  relatedId: string;
  dueDate: string;
  completedDate: string | null;
  status: ActivityStatus;
  assignedTo: string;
  createdAt: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  timezone: string;
  role: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  probability: number;
  color: string;
  order: number;
}

export interface CustomField {
  id: string;
  name: string;
  type: 'text' | 'number' | 'date' | 'dropdown';
  entity: 'contact' | 'company' | 'deal';
  required: boolean;
  options?: string[];
}

export interface NotificationSettings {
  email: {
    newDeal: boolean;
    dealStageChange: boolean;
    dealWon: boolean;
    dealLost: boolean;
    newContact: boolean;
    activityReminder: boolean;
    weeklyReport: boolean;
  };
  inApp: {
    newDeal: boolean;
    dealStageChange: boolean;
    dealWon: boolean;
    dealLost: boolean;
    newContact: boolean;
    activityReminder: boolean;
    mentionNotification: boolean;
  };
}

export interface TimezoneOption {
  value: string;
  label: string;
}

export interface Settings {
  profile: Profile;
  pipelineStages: PipelineStage[];
  customFields: CustomField[];
  notifications: NotificationSettings;
  timezones: TimezoneOption[];
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Dashboard types
export interface DashboardStats {
  totalContacts: number;
  totalCompanies: number;
  activeDeals: number;
  pipelineValue: number;
}

export interface PipelineBreakdown {
  stage: DealStage;
  label: string;
  count: number;
  value: number;
  color: string;
}

export interface WinRateData {
  winRate: number;
  wonDeals: number;
  lostDeals: number;
  wonValue: number;
  lostValue: number;
}

export interface UpcomingActivity {
  id: string;
  type: string;
  subject: string;
  contactName?: string;
  dueDate?: string;
}

export interface RecentDeal {
  id: string;
  name: string;
  companyName: string;
  value: number;
  stage: DealStage;
}
