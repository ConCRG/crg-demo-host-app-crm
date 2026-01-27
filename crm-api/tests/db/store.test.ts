import { describe, it, expect, beforeEach } from 'vitest';
import {
  contactStore,
  companyStore,
  dealStore,
  activityStore,
  settingsStore,
  generateId,
  isSeeded,
} from '../../src/db/store';

beforeEach(() => {
  contactStore.seed([]);
  companyStore.seed([]);
  dealStore.seed([]);
  activityStore.seed([]);
});

describe('generateId', () => {
  it('produces id with correct prefix', () => {
    expect(generateId('c')).toMatch(/^c-/);
    expect(generateId('comp')).toMatch(/^comp-/);
    expect(generateId('deal')).toMatch(/^deal-/);
  });

  it('produces unique ids', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateId('x')));
    expect(ids.size).toBe(50);
  });
});

describe('isSeeded', () => {
  it('returns false when contacts empty', () => {
    expect(isSeeded()).toBe(false);
  });

  it('returns true when contacts have data', () => {
    contactStore.seed([
      { id: 'c-1', firstName: 'A', lastName: 'B', email: 'a@b.com', phone: '', company: '', companyId: '', status: 'active', jobTitle: '', lastActivity: '', createdAt: '' },
    ]);
    expect(isSeeded()).toBe(true);
  });
});

describe('contactStore', () => {
  const contact = { id: 'c-1', firstName: 'John', lastName: 'Doe', email: 'j@d.com', phone: '123', company: 'Acme', companyId: 'comp-1', status: 'active' as const, jobTitle: 'Dev', lastActivity: '', createdAt: '' };

  it('seed + getAll', () => {
    contactStore.seed([contact]);
    expect(contactStore.getAll()).toHaveLength(1);
  });

  it('getById', () => {
    contactStore.seed([contact]);
    expect(contactStore.getById('c-1')?.firstName).toBe('John');
    expect(contactStore.getById('missing')).toBeUndefined();
  });

  it('create generates id', () => {
    const { id, ...rest } = contact;
    const created = contactStore.create(rest);
    expect(created.id).toMatch(/^c-/);
    expect(created.firstName).toBe('John');
    expect(contactStore.getAll()).toHaveLength(1);
  });

  it('update merges fields', () => {
    contactStore.seed([contact]);
    const updated = contactStore.update('c-1', { firstName: 'Jane' });
    expect(updated?.firstName).toBe('Jane');
    expect(updated?.lastName).toBe('Doe');
  });

  it('update returns null for missing id', () => {
    expect(contactStore.update('missing', { firstName: 'X' })).toBeNull();
  });

  it('delete removes and returns true', () => {
    contactStore.seed([contact]);
    expect(contactStore.delete('c-1')).toBe(true);
    expect(contactStore.getAll()).toHaveLength(0);
  });

  it('delete returns false for missing id', () => {
    expect(contactStore.delete('missing')).toBe(false);
  });
});

describe('companyStore', () => {
  const company = { id: 'comp-1', name: 'Acme', industry: 'Tech', size: '100', website: '', address: '', parentId: null, contactCount: 0, totalDealValue: 0, createdAt: '' };

  it('CRUD operations', () => {
    companyStore.seed([company]);
    expect(companyStore.getAll()).toHaveLength(1);
    expect(companyStore.getById('comp-1')?.name).toBe('Acme');

    const updated = companyStore.update('comp-1', { name: 'Acme Corp' });
    expect(updated?.name).toBe('Acme Corp');

    expect(companyStore.delete('comp-1')).toBe(true);
    expect(companyStore.getAll()).toHaveLength(0);
  });

  it('create generates comp- prefix id', () => {
    const { id, ...rest } = company;
    const created = companyStore.create(rest);
    expect(created.id).toMatch(/^comp-/);
  });
});

describe('dealStore', () => {
  const deal = { id: 'd-1', name: 'Big Deal', companyId: 'comp-1', companyName: 'Acme', contactId: 'c-1', contactName: 'John', value: 50000, stage: 'lead' as const, probability: 10, expectedCloseDate: '', createdAt: '', stageHistory: [] as { stage: string; date: string }[] };

  it('CRUD operations', () => {
    dealStore.seed([deal]);
    expect(dealStore.getAll()).toHaveLength(1);
    expect(dealStore.getById('d-1')?.name).toBe('Big Deal');

    const updated = dealStore.update('d-1', { value: 60000 });
    expect(updated?.value).toBe(60000);

    expect(dealStore.delete('d-1')).toBe(true);
    expect(dealStore.getAll()).toHaveLength(0);
  });

  it('create generates deal- prefix id', () => {
    const { id, ...rest } = deal;
    const created = dealStore.create(rest);
    expect(created.id).toMatch(/^deal-/);
  });

  describe('moveStage', () => {
    it('updates stage, probability, and history', () => {
      dealStore.seed([{ ...deal }]);
      const moved = dealStore.moveStage('d-1', 'proposal');
      expect(moved?.stage).toBe('proposal');
      expect(moved?.probability).toBe(50);
      expect(moved?.stageHistory).toHaveLength(1);
      expect(moved?.stageHistory[0].stage).toBe('proposal');
    });

    it('maps all stage probabilities correctly', () => {
      const stages: Array<{ stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'; prob: number }> = [
        { stage: 'lead', prob: 10 },
        { stage: 'qualified', prob: 25 },
        { stage: 'proposal', prob: 50 },
        { stage: 'negotiation', prob: 75 },
        { stage: 'closed-won', prob: 100 },
        { stage: 'closed-lost', prob: 0 },
      ];

      for (const { stage, prob } of stages) {
        dealStore.seed([{ ...deal, stageHistory: [] }]);
        const moved = dealStore.moveStage('d-1', stage);
        expect(moved?.probability).toBe(prob);
      }
    });

    it('returns null for missing id', () => {
      expect(dealStore.moveStage('missing', 'lead')).toBeNull();
    });
  });
});

describe('activityStore', () => {
  const activity = { id: 'a-1', type: 'Call' as const, subject: 'Follow up', notes: '', relatedTo: '', relatedType: 'Contact' as const, relatedId: 'c-1', dueDate: '2099-12-31', completedDate: null, status: 'Pending' as const, assignedTo: '', createdAt: '' };

  it('CRUD operations', () => {
    activityStore.seed([activity]);
    expect(activityStore.getAll()).toHaveLength(1);
    expect(activityStore.getById('a-1')?.subject).toBe('Follow up');

    const updated = activityStore.update('a-1', { subject: 'Updated' });
    expect(updated?.subject).toBe('Updated');

    expect(activityStore.delete('a-1')).toBe(true);
    expect(activityStore.getAll()).toHaveLength(0);
  });

  it('create generates act- prefix id', () => {
    const { id, ...rest } = activity;
    const created = activityStore.create(rest);
    expect(created.id).toMatch(/^act-/);
  });

  describe('markComplete', () => {
    it('sets status to Completed and sets completedDate', () => {
      activityStore.seed([{ ...activity }]);
      const completed = activityStore.markComplete('a-1');
      expect(completed?.status).toBe('Completed');
      expect(completed?.completedDate).toBeTruthy();
    });

    it('returns null for missing id', () => {
      expect(activityStore.markComplete('missing')).toBeNull();
    });
  });

  describe('markIncomplete', () => {
    it('sets status to Pending for future due date and clears completedDate', () => {
      activityStore.seed([{ ...activity, status: 'Completed' as const, completedDate: '2024-01-01' }]);
      const result = activityStore.markIncomplete('a-1');
      expect(result?.status).toBe('Pending');
      expect(result?.completedDate).toBeNull();
    });

    it('sets status to Overdue for past due date', () => {
      activityStore.seed([{ ...activity, dueDate: '2020-01-01', status: 'Completed' as const, completedDate: '2024-01-01' }]);
      const result = activityStore.markIncomplete('a-1');
      expect(result?.status).toBe('Overdue');
      expect(result?.completedDate).toBeNull();
    });

    it('returns null for missing id', () => {
      expect(activityStore.markIncomplete('missing')).toBeNull();
    });
  });
});

describe('settingsStore', () => {
  const testSettings = {
    profile: { id: 'p-1', name: 'Test', email: 'test@test.com', avatar: null, timezone: 'UTC', role: 'Admin' },
    pipelineStages: [],
    customFields: [],
    notifications: {
      email: { newDeal: true, dealStageChange: true, dealWon: true, dealLost: true, newContact: true, activityReminder: true, weeklyReport: true },
      inApp: { newDeal: true, dealStageChange: true, dealWon: true, dealLost: true, newContact: true, activityReminder: true, mentionNotification: true },
    },
    timezones: [{ value: 'UTC', label: 'UTC' }],
  };

  it('get returns seeded settings', () => {
    settingsStore.seed(testSettings);
    expect(settingsStore.get()?.profile.name).toBe('Test');
  });

  it('update merges partial settings', () => {
    settingsStore.seed(testSettings);
    const updated = settingsStore.update({ profile: { ...testSettings.profile, name: 'Updated' } });
    expect(updated?.profile.name).toBe('Updated');
    // other fields preserved
    expect(updated?.timezones).toHaveLength(1);
  });
});
