import { useState, useEffect, useMemo } from 'react';
import { Building2, ExternalLink, Search, Users, DollarSign, Plus } from 'lucide-react';
import type { Company } from '../types';
import { getCompanies, createCompany, updateCompany, getIndustries } from '../api/companies';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CompanyModal, { type CompanyFormData } from '../components/CompanyModal';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [industries, setIndustries] = useState<string[]>([]);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    getIndustries().then(setIndustries);
  }, [companies]);

  const loadCompanies = async () => {
    setLoading(true);
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter((c) => {
      const matchesSearch =
        !searchTerm ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.industry?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesIndustry = industryFilter === 'all' || c.industry === industryFilter;
      return matchesSearch && matchesIndustry;
    });
  }, [companies, searchTerm, industryFilter]);

  const getParentName = (parentId: string | null | undefined): string | null => {
    if (!parentId) return null;
    return companies.find((c) => c.id === parentId)?.name ?? null;
  };

  const handleSave = async (data: CompanyFormData) => {
    try {
      if (selectedCompany) {
        const updated = await updateCompany(selectedCompany.id, {
          name: data.name,
          industry: data.industry || undefined,
          size: data.size,
          website: data.website || undefined,
          address: data.address || undefined,
          parentId: data.parentId,
        });
        if (updated) setCompanies((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
      } else {
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
      setIsModalOpen(false);
      setSelectedCompany(null);
    } catch (err) {
      console.error('Failed to save company:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Companies</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your company accounts and relationships.</p>
        </div>
        <Button onClick={() => { setSelectedCompany(null); setIsModalOpen(true); }}>
          <Building2 className="h-4 w-4 mr-2" />
          Add Company
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.map((i) => (
              <SelectItem key={i} value={i}>{i}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
          Loading companies...
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-foreground">No companies found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {searchTerm || industryFilter !== 'all'
              ? 'Try adjusting your filters.'
              : 'Get started by adding your first company.'}
          </p>
          {!searchTerm && industryFilter === 'all' && (
            <Button className="mt-4" onClick={() => { setSelectedCompany(null); setIsModalOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCompanies.map((company) => {
            const parentName = getParentName(company.parentId);
            return (
              <Card
                key={company.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => { setSelectedCompany(company); setIsModalOpen(true); }}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-foreground truncate">{company.name}</h3>
                      {parentName && (
                        <p className="text-xs text-muted-foreground truncate mt-0.5">Subsidiary of {parentName}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2.5">
                    {company.industry && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">{company.industry}</Badge>
                        {company.size && (
                          <span className="text-xs text-muted-foreground">{company.size} employees</span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        <span>{company.contactCount} contacts</span>
                      </div>
                      <div className="flex items-center gap-0.5">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>{formatCurrency(company.totalDealValue)}</span>
                      </div>
                    </div>

                    {company.website && (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Visit website
                      </a>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <CompanyModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelectedCompany(null); }}
        onSave={handleSave}
        company={selectedCompany}
        companies={companies}
      />
    </div>
  );
}
