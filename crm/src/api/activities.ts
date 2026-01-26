import { apiClient } from './client';

// Activity types
export type ActivityType = 'Call' | 'Email' | 'Meeting' | 'Task';
export type ActivityStatus = 'Pending' | 'Completed' | 'Overdue';
export type RelatedType = 'Contact' | 'Deal' | 'Company';

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  notes: string;
  relatedTo: string;
  relatedType: RelatedType;
  relatedId: string;
  dueDate: string;
  completedDate: string | null;
  status: ActivityStatus;
  assignedTo: string;
  createdAt: string;
}

export interface ActivityFilters {
  type?: ActivityType | '';
  status?: ActivityStatus | '';
  dateRange?: 'today' | 'this_week' | 'this_month' | 'all' | '';
}

// Get all activities with optional filtering
export async function getActivities(filters?: ActivityFilters): Promise<Activity[]> {
  const params = new URLSearchParams();

  if (filters?.type) {
    params.append('type', filters.type);
  }
  if (filters?.status) {
    params.append('status', filters.status);
  }
  if (filters?.dateRange && filters.dateRange !== 'all') {
    params.append('dateRange', filters.dateRange);
  }

  const queryString = params.toString();
  const endpoint = queryString ? `/activities?${queryString}` : '/activities';

  const response = await apiClient.get<{ data: Activity[] }>(endpoint);
  return response.data;
}

// Get a single activity by ID
export async function getActivity(id: string): Promise<Activity | null> {
  try {
    const activity = await apiClient.get<Activity>(`/activities/${id}`);
    return activity;
  } catch {
    return null;
  }
}

// Create a new activity
export async function createActivity(
  data: Omit<Activity, 'id' | 'createdAt' | 'completedDate'>
): Promise<Activity> {
  return apiClient.post<Activity>('/activities', data);
}

// Update an existing activity
export async function updateActivity(
  id: string,
  data: Partial<Omit<Activity, 'id' | 'createdAt'>>
): Promise<Activity | null> {
  try {
    return await apiClient.put<Activity>(`/activities/${id}`, data);
  } catch {
    return null;
  }
}

// Delete an activity
export async function deleteActivity(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/activities/${id}`);
    return true;
  } catch {
    return false;
  }
}

// Mark an activity as complete
export async function markComplete(id: string): Promise<Activity | null> {
  try {
    return await apiClient.patch<Activity>(`/activities/${id}/complete`);
  } catch {
    return null;
  }
}

// Mark an activity as incomplete (pending)
export async function markIncomplete(id: string): Promise<Activity | null> {
  try {
    return await apiClient.patch<Activity>(`/activities/${id}/incomplete`);
  } catch {
    return null;
  }
}

// Get related entities for dropdowns
// Fetches from contacts, deals, and companies endpoints
export async function getRelatedEntities(): Promise<{
  contacts: { id: string; name: string }[];
  deals: { id: string; name: string }[];
  companies: { id: string; name: string }[];
}> {
  try {
    const [contactsRes, dealsRes, companiesRes] = await Promise.all([
      apiClient.get<{ data: { id: string; firstName: string; lastName: string }[] }>('/contacts?pageSize=100'),
      apiClient.get<{ data: { id: string; name: string }[]; total: number }>('/deals'),
      apiClient.get<{ data: { id: string; name: string }[] }>('/companies'),
    ]);

    return {
      contacts: contactsRes.data.map(c => ({ id: c.id, name: `${c.firstName} ${c.lastName}` })),
      deals: dealsRes.data.map(d => ({ id: d.id, name: d.name })),
      companies: companiesRes.data.map(c => ({ id: c.id, name: c.name })),
    };
  } catch {
    return { contacts: [], deals: [], companies: [] };
  }
}

// Get unique assignees for dropdown
// Returns static list for demo purposes
export function getAssignees(): string[] {
  return ['John Smith', 'Sarah Johnson', 'Emily Davis', 'Michael Chen'];
}
