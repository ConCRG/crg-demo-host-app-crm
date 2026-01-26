// In-memory data store for demo purposes
// In production, this would be replaced with D1 (Cloudflare SQLite)

import type {
  Contact,
  Company,
  Deal,
  Activity,
  Settings,
} from './types';

// Initial seed data - will be populated on first request
let contacts: Contact[] = [];
let companies: Company[] = [];
let deals: Deal[] = [];
let activities: Activity[] = [];
let settings: Settings | null = null;

// Helper to generate IDs
export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Contact operations
export const contactStore = {
  getAll: () => contacts,
  getById: (id: string) => contacts.find(c => c.id === id),
  create: (contact: Omit<Contact, 'id'>) => {
    const newContact = { ...contact, id: generateId('c') };
    contacts.push(newContact);
    return newContact;
  },
  update: (id: string, data: Partial<Contact>) => {
    const index = contacts.findIndex(c => c.id === id);
    if (index === -1) return null;
    contacts[index] = { ...contacts[index], ...data };
    return contacts[index];
  },
  delete: (id: string) => {
    const index = contacts.findIndex(c => c.id === id);
    if (index === -1) return false;
    contacts.splice(index, 1);
    return true;
  },
  seed: (data: Contact[]) => { contacts = data; },
};

// Company operations
export const companyStore = {
  getAll: () => companies,
  getById: (id: string) => companies.find(c => c.id === id),
  create: (company: Omit<Company, 'id'>) => {
    const newCompany = { ...company, id: generateId('comp') };
    companies.push(newCompany);
    return newCompany;
  },
  update: (id: string, data: Partial<Company>) => {
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) return null;
    companies[index] = { ...companies[index], ...data };
    return companies[index];
  },
  delete: (id: string) => {
    const index = companies.findIndex(c => c.id === id);
    if (index === -1) return false;
    companies.splice(index, 1);
    return true;
  },
  seed: (data: Company[]) => { companies = data; },
};

// Deal operations
export const dealStore = {
  getAll: () => deals,
  getById: (id: string) => deals.find(d => d.id === id),
  create: (deal: Omit<Deal, 'id'>) => {
    const newDeal = { ...deal, id: generateId('deal') };
    deals.push(newDeal);
    return newDeal;
  },
  update: (id: string, data: Partial<Deal>) => {
    const index = deals.findIndex(d => d.id === id);
    if (index === -1) return null;
    deals[index] = { ...deals[index], ...data };
    return deals[index];
  },
  moveStage: (id: string, newStage: Deal['stage']) => {
    const index = deals.findIndex(d => d.id === id);
    if (index === -1) return null;

    const deal = deals[index];
    const today = new Date().toISOString().split('T')[0];

    // Update probability based on stage
    const probabilityMap: Record<Deal['stage'], number> = {
      'lead': 10,
      'qualified': 25,
      'proposal': 50,
      'negotiation': 75,
      'closed-won': 100,
      'closed-lost': 0,
    };

    deal.stage = newStage;
    deal.probability = probabilityMap[newStage];
    deal.stageHistory.push({ stage: newStage, date: today });

    return deal;
  },
  delete: (id: string) => {
    const index = deals.findIndex(d => d.id === id);
    if (index === -1) return false;
    deals.splice(index, 1);
    return true;
  },
  seed: (data: Deal[]) => { deals = data; },
};

// Activity operations
export const activityStore = {
  getAll: () => activities,
  getById: (id: string) => activities.find(a => a.id === id),
  create: (activity: Omit<Activity, 'id'>) => {
    const newActivity = { ...activity, id: generateId('act') };
    activities.push(newActivity);
    return newActivity;
  },
  update: (id: string, data: Partial<Activity>) => {
    const index = activities.findIndex(a => a.id === id);
    if (index === -1) return null;
    activities[index] = { ...activities[index], ...data };
    return activities[index];
  },
  markComplete: (id: string) => {
    const index = activities.findIndex(a => a.id === id);
    if (index === -1) return null;
    activities[index].status = 'Completed';
    activities[index].completedDate = new Date().toISOString().split('T')[0];
    return activities[index];
  },
  markIncomplete: (id: string) => {
    const index = activities.findIndex(a => a.id === id);
    if (index === -1) return null;
    const today = new Date().toISOString().split('T')[0];
    const dueDate = activities[index].dueDate;
    activities[index].status = dueDate < today ? 'Overdue' : 'Pending';
    activities[index].completedDate = null;
    return activities[index];
  },
  delete: (id: string) => {
    const index = activities.findIndex(a => a.id === id);
    if (index === -1) return false;
    activities.splice(index, 1);
    return true;
  },
  seed: (data: Activity[]) => { activities = data; },
};

// Settings operations
export const settingsStore = {
  get: () => settings,
  update: (data: Partial<Settings>) => {
    if (!settings) return null;
    settings = { ...settings, ...data };
    return settings;
  },
  seed: (data: Settings) => { settings = data; },
};

// Check if store is seeded
export function isSeeded(): boolean {
  return contacts.length > 0;
}
