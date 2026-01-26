// Dashboard API module
// Fetches aggregated data from the backend for dashboard statistics

import { apiClient } from './client';
import type { Activity } from '../types';

// Types for dashboard data
export interface DashboardStats {
  totalContacts: number;
  totalCompanies: number;
  activeDeals: number;
  pipelineValue: number;
}

export interface PipelineStage {
  stage: string;
  label: string;
  count: number;
  value: number;
  color: string;
}

export interface RecentDeal {
  id: string;
  name: string;
  companyName: string;
  value: number;
  stage: string;
  createdAt: string;
}

export interface RecentContact {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  createdAt: string;
}

export interface WinRateData {
  winRate: number;
  wonDeals: number;
  lostDeals: number;
  totalClosed: number;
  wonValue: number;
  lostValue: number;
}

export interface UpcomingActivity extends Activity {
  contactName?: string;
}

// Get dashboard statistics
export async function getStats(): Promise<DashboardStats> {
  return apiClient.get<DashboardStats>('/dashboard/stats');
}

// Get pipeline breakdown by stage
export async function getPipelineBreakdown(): Promise<PipelineStage[]> {
  return apiClient.get<PipelineStage[]>('/dashboard/pipeline');
}

// Get recent deals
export async function getRecentDeals(limit: number = 5): Promise<RecentDeal[]> {
  return apiClient.get<RecentDeal[]>(`/dashboard/recent-deals?limit=${limit}`);
}

// Get win rate statistics
export async function getWinRate(): Promise<WinRateData> {
  return apiClient.get<WinRateData>('/dashboard/win-rate');
}

// Get upcoming activities
export async function getUpcomingActivities(limit: number = 5): Promise<UpcomingActivity[]> {
  return apiClient.get<UpcomingActivity[]>(`/dashboard/upcoming-activities?limit=${limit}`);
}
