// Settings API - Real fetch requests via apiClient
import { apiClient } from './client';
import type { ApiResponse } from './client';

// Types for settings
export interface UserProfile {
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
  entity: 'contact' | 'deal' | 'company';
  required: boolean;
  options?: string[];
}

export interface NotificationPreferences {
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

export interface SettingsData {
  profile: UserProfile;
  pipelineStages: PipelineStage[];
  customFields: CustomField[];
  notifications: NotificationPreferences;
  timezones: TimezoneOption[];
}

// API functions
export async function getSettings(): Promise<ApiResponse<SettingsData>> {
  const response = await apiClient.get<{ data: SettingsData }>('/settings');
  return {
    data: response.data,
    status: 200,
    message: 'Settings retrieved successfully',
  };
}

export async function getProfile(): Promise<ApiResponse<UserProfile>> {
  const response = await apiClient.get<{ data: UserProfile }>('/settings/profile');
  return {
    data: response.data,
    status: 200,
    message: 'Profile retrieved successfully',
  };
}

export async function updateProfile(
  profile: Partial<UserProfile>
): Promise<ApiResponse<UserProfile>> {
  const response = await apiClient.put<{ data: UserProfile }>('/settings/profile', profile);
  return {
    data: response.data,
    status: 200,
    message: 'Profile updated successfully',
  };
}

export async function getPipelineStages(): Promise<ApiResponse<PipelineStage[]>> {
  const response = await apiClient.get<{ data: PipelineStage[] }>('/settings/pipeline-stages');
  return {
    data: response.data,
    status: 200,
    message: 'Pipeline stages retrieved successfully',
  };
}

export async function updatePipelineStages(
  stages: PipelineStage[]
): Promise<ApiResponse<PipelineStage[]>> {
  const response = await apiClient.put<{ data: PipelineStage[] }>('/settings/pipeline-stages', stages);
  return {
    data: response.data,
    status: 200,
    message: 'Pipeline stages updated successfully',
  };
}

export async function getCustomFields(): Promise<ApiResponse<CustomField[]>> {
  const response = await apiClient.get<{ data: CustomField[] }>('/settings/custom-fields');
  return {
    data: response.data,
    status: 200,
    message: 'Custom fields retrieved successfully',
  };
}

export async function updateCustomFields(
  fields: CustomField[]
): Promise<ApiResponse<CustomField[]>> {
  const response = await apiClient.put<{ data: CustomField[] }>('/settings/custom-fields', fields);
  return {
    data: response.data,
    status: 200,
    message: 'Custom fields updated successfully',
  };
}

export async function addCustomField(
  field: Omit<CustomField, 'id'>
): Promise<ApiResponse<CustomField>> {
  const response = await apiClient.post<{ data: CustomField }>('/settings/custom-fields', field);
  return {
    data: response.data,
    status: 201,
    message: 'Custom field added successfully',
  };
}

export async function updateCustomField(
  id: string,
  field: Partial<CustomField>
): Promise<ApiResponse<CustomField>> {
  const response = await apiClient.put<{ data: CustomField }>(`/settings/custom-fields/${id}`, field);
  return {
    data: response.data,
    status: 200,
    message: 'Custom field updated successfully',
  };
}

export async function deleteCustomField(
  id: string
): Promise<ApiResponse<{ id: string }>> {
  await apiClient.delete(`/settings/custom-fields/${id}`);
  return {
    data: { id },
    status: 200,
    message: 'Custom field deleted successfully',
  };
}

export async function getNotifications(): Promise<ApiResponse<NotificationPreferences>> {
  const response = await apiClient.get<{ data: NotificationPreferences }>('/settings/notifications');
  return {
    data: response.data,
    status: 200,
    message: 'Notification preferences retrieved successfully',
  };
}

export async function updateNotifications(
  notifications: NotificationPreferences
): Promise<ApiResponse<NotificationPreferences>> {
  const response = await apiClient.put<{ data: NotificationPreferences }>('/settings/notifications', notifications);
  return {
    data: response.data,
    status: 200,
    message: 'Notification preferences updated successfully',
  };
}

export async function getTimezones(): Promise<ApiResponse<TimezoneOption[]>> {
  const response = await apiClient.get<{ data: TimezoneOption[] }>('/settings/timezones');
  return {
    data: response.data,
    status: 200,
    message: 'Timezones retrieved successfully',
  };
}
