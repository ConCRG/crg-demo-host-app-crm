import {
  contactStore,
  companyStore,
  dealStore,
  activityStore,
  settingsStore,
} from '../src/db/store';

/**
 * Reset all stores to empty state.
 * Seeds one dummy contact so isSeeded() returns true and the
 * seed-data middleware in index.ts does not overwrite test data.
 */
export function resetStores() {
  contactStore.seed([
    { id: '_seed_', firstName: '_', lastName: '_', email: '_@_', phone: '', company: '', companyId: '', status: 'active', jobTitle: '', lastActivity: '', createdAt: '' },
  ]);
  companyStore.seed([]);
  dealStore.seed([]);
  activityStore.seed([]);
  settingsStore.seed({
    profile: {
      id: 'profile-1',
      name: 'Test User',
      email: 'test@example.com',
      avatar: null,
      timezone: 'UTC',
      role: 'Admin',
    },
    pipelineStages: [
      { id: 'ps-1', name: 'Lead', probability: 10, color: '#6B7280', order: 1 },
      { id: 'ps-2', name: 'Qualified', probability: 25, color: '#3B82F6', order: 2 },
    ],
    customFields: [],
    notifications: {
      email: {
        newDeal: true,
        dealStageChange: true,
        dealWon: true,
        dealLost: true,
        newContact: true,
        activityReminder: true,
        weeklyReport: true,
      },
      inApp: {
        newDeal: true,
        dealStageChange: true,
        dealWon: true,
        dealLost: true,
        newContact: true,
        activityReminder: true,
        mentionNotification: true,
      },
    },
    timezones: [
      { value: 'UTC', label: 'UTC' },
      { value: 'America/New_York', label: 'Eastern Time' },
    ],
  });
}

/** Helper to make a JSON request to the app */
export function jsonRequest(
  method: string,
  path: string,
  body?: unknown
): Request {
  const init: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) {
    init.body = JSON.stringify(body);
  }
  return new Request(`http://localhost${path}`, init);
}
