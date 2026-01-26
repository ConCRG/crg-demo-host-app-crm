// Deals API module
// Uses the apiClient for real HTTP requests to the backend

import { apiClient } from './client';

export interface StageHistoryEntry {
  stage: string;
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
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost';
  probability: number;
  expectedCloseDate: string;
  createdAt: string;
  stageHistory: StageHistoryEntry[];
}

// Response type for list endpoint
interface DealsListResponse {
  data: Deal[];
  total: number;
}

// Get all deals
export async function getDeals(): Promise<Deal[]> {
  const response = await apiClient.get<DealsListResponse>('/deals');
  return response.data;
}

// Get a single deal by ID
export async function getDeal(id: string): Promise<Deal> {
  return apiClient.get<Deal>(`/deals/${id}`);
}

// Create a new deal
export async function createDeal(
  dealData: Omit<Deal, 'id' | 'createdAt' | 'stageHistory'>
): Promise<Deal> {
  return apiClient.post<Deal>('/deals', dealData);
}

// Update an existing deal
export async function updateDeal(
  id: string,
  dealData: Partial<Omit<Deal, 'id' | 'createdAt' | 'stageHistory'>>
): Promise<Deal> {
  return apiClient.put<Deal>(`/deals/${id}`, dealData);
}

// Move a deal to a new stage
export async function moveDeal(
  id: string,
  newStage: Deal['stage']
): Promise<Deal> {
  return apiClient.patch<Deal>(`/deals/${id}/stage`, { stage: newStage });
}

// Delete a deal
export async function deleteDeal(id: string): Promise<void> {
  await apiClient.delete<void>(`/deals/${id}`);
}

// Export stage options for use in UI
export const DEAL_STAGES = [
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed-won', label: 'Closed Won' },
  { value: 'closed-lost', label: 'Closed Lost' },
] as const;

// Export stage colors for UI
export const STAGE_COLORS: Record<Deal['stage'], string> = {
  lead: 'gray',
  qualified: 'blue',
  proposal: 'yellow',
  negotiation: 'orange',
  'closed-won': 'green',
  'closed-lost': 'red',
};
