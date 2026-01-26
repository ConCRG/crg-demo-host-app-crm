import { apiClient } from './client';
import type { Company } from '../types';

export interface CompanyFilters {
  industry?: string;
  search?: string;
}

export type CreateCompanyData = Omit<Company, 'id' | 'createdAt' | 'contactCount' | 'totalDealValue'>;
export type UpdateCompanyData = Partial<Omit<Company, 'id' | 'createdAt'>>;

interface CompaniesResponse {
  data: Company[];
}

interface CompanyResponse {
  data: Company;
}

export async function getCompanies(filters?: CompanyFilters): Promise<Company[]> {
  const params = new URLSearchParams();

  if (filters?.industry) {
    params.append('industry', filters.industry);
  }
  if (filters?.search) {
    params.append('search', filters.search);
  }

  const queryString = params.toString();
  const endpoint = queryString ? `/companies?${queryString}` : '/companies';

  const response = await apiClient.get<CompaniesResponse | Company[]>(endpoint);

  // Handle both wrapped { data: [...] } and unwrapped [...] responses
  if (Array.isArray(response)) {
    return response;
  }
  return response.data;
}

export async function getCompany(id: string): Promise<Company | undefined> {
  try {
    const response = await apiClient.get<CompanyResponse | Company>(`/companies/${id}`);

    // Handle both wrapped { data: ... } and unwrapped responses
    if ('data' in response && !('name' in response)) {
      return response.data;
    }
    return response as Company;
  } catch (error) {
    // Return undefined for 404s to match previous interface
    if (error instanceof Error && error.message.includes('404')) {
      return undefined;
    }
    throw error;
  }
}

export async function createCompany(data: CreateCompanyData): Promise<Company> {
  const response = await apiClient.post<CompanyResponse | Company>('/companies', data);

  // Handle both wrapped { data: ... } and unwrapped responses
  if ('data' in response && !('name' in response)) {
    return response.data;
  }
  return response as Company;
}

export async function updateCompany(
  id: string,
  data: UpdateCompanyData
): Promise<Company | undefined> {
  try {
    const response = await apiClient.put<CompanyResponse | Company>(`/companies/${id}`, data);

    // Handle both wrapped { data: ... } and unwrapped responses
    if ('data' in response && !('name' in response)) {
      return response.data;
    }
    return response as Company;
  } catch (error) {
    // Return undefined for 404s to match previous interface
    if (error instanceof Error && error.message.includes('404')) {
      return undefined;
    }
    throw error;
  }
}

export async function deleteCompany(id: string): Promise<boolean> {
  try {
    await apiClient.delete(`/companies/${id}`);
    return true;
  } catch (error) {
    // Return false for 404s to match previous interface
    if (error instanceof Error && error.message.includes('404')) {
      return false;
    }
    throw error;
  }
}

// Helper to get unique industries for filtering
// This now fetches from the API and extracts unique industries
export async function getIndustries(): Promise<string[]> {
  const companies = await getCompanies();
  const industries = new Set<string>();

  companies.forEach((c) => {
    if (c.industry) industries.add(c.industry);
  });

  return Array.from(industries).sort();
}
