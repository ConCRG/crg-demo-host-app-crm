import { apiClient } from './client';
import type { Contact } from '../types';

// Extended contact type that includes the additional fields from our data
export interface ContactWithDetails extends Contact {
  company?: string;
  jobTitle?: string;
  lastActivity?: string;
}

export interface ContactFilters {
  status?: 'active' | 'inactive' | 'lead' | '';
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Get all contacts with optional filtering and pagination
export async function getContacts(
  filters?: ContactFilters,
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<ContactWithDetails>> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('pageSize', String(pageSize));
  if (filters?.status) params.set('status', filters.status);
  if (filters?.search) params.set('search', filters.search);

  return apiClient.get<PaginatedResponse<ContactWithDetails>>(`/contacts?${params.toString()}`);
}

// Get a single contact by ID
export async function getContact(id: string): Promise<ContactWithDetails | null> {
  try {
    return await apiClient.get<ContactWithDetails>(`/contacts/${id}`);
  } catch {
    return null;
  }
}

// Create a new contact
export async function createContact(
  data: Omit<ContactWithDetails, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ContactWithDetails> {
  return apiClient.post<ContactWithDetails>('/contacts', data);
}

// Update an existing contact
export async function updateContact(
  id: string,
  data: Partial<Omit<ContactWithDetails, 'id' | 'createdAt'>>
): Promise<ContactWithDetails | null> {
  try {
    return await apiClient.put<ContactWithDetails>(`/contacts/${id}`, data);
  } catch {
    return null;
  }
}

// Delete a contact
export async function deleteContact(id: string): Promise<boolean> {
  try {
    await apiClient.delete<{ message: string }>(`/contacts/${id}`);
    return true;
  } catch {
    return false;
  }
}

// Get unique companies for dropdown (fetches from companies endpoint)
export async function getCompanies(): Promise<{ id: string; name: string }[]> {
  try {
    const response = await apiClient.get<{ data: { id: string; name: string }[] }>('/companies');
    return response.data.map(c => ({ id: c.id, name: c.name })).sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}
