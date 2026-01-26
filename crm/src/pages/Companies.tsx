import { useState, useEffect, useMemo } from 'react';
import { Building2, ExternalLink, Search, Users, DollarSign } from 'lucide-react';
import type { Company } from '../types';
import {
  getCompanies,
  createCompany,
  updateCompany,
  getIndustries,
} from '../api/companies';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import CompanyModal, { type CompanyFormData } from '../components/CompanyModal';

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [industries, setIndustries] = useState<string[]>([]);

  // Load companies on mount
  useEffect(() => {
    loadCompanies();
  }, []);

  // Load industries when companies change
  useEffect(() => {
    getIndustries().then(setIndustries);
  }, [companies]);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique industries for the filter dropdown
  const industryOptions = useMemo(() => {
    return [
      { value: '', label: 'All Industries' },
      ...industries.map((i) => ({ value: i, label: i })),
    ];
  }, [industries]);

  // Filter companies based on search and industry
  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      const matchesSearch =
        !searchTerm ||
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.address?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesIndustry =
        !industryFilter || company.industry === industryFilter;

      return matchesSearch && matchesIndustry;
    });
  }, [companies, searchTerm, industryFilter]);

  // Get parent company name by ID
  const getParentName = (parentId: string | null | undefined): string | null => {
    if (!parentId) return null;
    const parent = companies.find((c) => c.id === parentId);
    return parent?.name || null;
  };

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Handle card click (edit mode)
  const handleCardClick = (company: Company) => {
    setSelectedCompany(company);
    setIsModalOpen(true);
  };

  // Handle add button click
  const handleAddClick = () => {
    setSelectedCompany(null);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCompany(null);
  };

  // Handle save (create or update)
  const handleSave = async (data: CompanyFormData) => {
    try {
      if (selectedCompany) {
        // Update existing company
        const updated = await updateCompany(selectedCompany.id, {
          name: data.name,
          industry: data.industry || undefined,
          size: data.size,
          website: data.website || undefined,
          address: data.address || undefined,
          parentId: data.parentId,
        });
        if (updated) {
          setCompanies((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
          );
        }
      } else {
        // Create new company
        const created = await createCompany({
          name: data.name,
          industry: data.industry || undefined,
          size: data.size,
          website: data.website || undefined,
          address: data.address || undefined,
          parentId: data.parentId,
        });
        setCompanies((prev) => [...prev, created]);
      }
      handleModalClose();
    } catch (error) {
      console.error('Failed to save company:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="mt-1 text-gray-600">
            Manage your company accounts and relationships.
          </p>
        </div>
        <Button onClick={handleAddClick}>
          <Building2 className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={industryOptions}
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Company Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-gray-500">Loading companies...</div>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No companies found</h3>
          <p className="mt-1 text-gray-500">
            {searchTerm || industryFilter
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by adding your first company.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.map((company) => {
            const parentName = getParentName(company.parentId);
            return (
              <div
                key={company.id}
                onClick={() => handleCardClick(company)}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
              >
                <div className="p-6">
                  {/* Company Header */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {company.name}
                      </h3>
                      {parentName && (
                        <p className="text-sm text-gray-500 truncate">
                          Subsidiary of {parentName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Company Details */}
                  <div className="mt-4 space-y-3">
                    {company.industry && (
                      <div className="flex items-center text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {company.industry}
                        </span>
                        {company.size && (
                          <span className="ml-2 text-gray-500">
                            {company.size} employees
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <Users className="h-4 w-4 mr-1.5" />
                        <span>{company.contactCount} contacts</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-0.5" />
                        <span>{formatCurrency(company.totalDealValue)}</span>
                      </div>
                    </div>

                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1" />
                        Visit website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Company Modal */}
      <CompanyModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        company={selectedCompany}
        companies={companies}
      />
    </div>
  );
}
