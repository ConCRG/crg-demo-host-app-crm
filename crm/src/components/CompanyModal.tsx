import { useState, useEffect } from 'react';
import type { Company } from '../types';
import Modal from './Modal';
import Input from './Input';
import Select from './Select';
import Button from './Button';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CompanyFormData) => void;
  company?: Company | null;
  companies: Company[];
}

export interface CompanyFormData {
  name: string;
  industry: string;
  size: Company['size'];
  website: string;
  address: string;
  parentId: string | null;
}

const industryOptions = [
  { value: '', label: 'Select Industry' },
  { value: 'Technology', label: 'Technology' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Education', label: 'Education' },
  { value: 'Energy', label: 'Energy' },
  { value: 'Logistics', label: 'Logistics' },
  { value: 'Media', label: 'Media' },
];

const sizeOptions = [
  { value: '', label: 'Select Size' },
  { value: '10-50', label: '10-50 employees' },
  { value: '50-100', label: '50-100 employees' },
  { value: '100-500', label: '100-500 employees' },
  { value: '500+', label: '500+ employees' },
];

export default function CompanyModal({
  isOpen,
  onClose,
  onSave,
  company,
  companies,
}: CompanyModalProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    industry: '',
    size: undefined,
    website: '',
    address: '',
    parentId: null,
  });
  const [errors, setErrors] = useState<{ name?: string }>({});

  // Reset form when modal opens/closes or company changes
  useEffect(() => {
    if (isOpen) {
      if (company) {
        setFormData({
          name: company.name,
          industry: company.industry || '',
          size: company.size,
          website: company.website || '',
          address: company.address || '',
          parentId: company.parentId || null,
        });
      } else {
        setFormData({
          name: '',
          industry: '',
          size: undefined,
          website: '',
          address: '',
          parentId: null,
        });
      }
      setErrors({});
    }
  }, [isOpen, company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { name?: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
  };

  // Filter out the current company from parent options (can't be its own parent)
  const parentOptions = [
    { value: '', label: 'None (Top-level company)' },
    ...companies
      .filter((c) => c.id !== company?.id)
      .map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={company ? 'Edit Company' : 'Add Company'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Company Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          error={errors.name}
          placeholder="Enter company name"
          required
        />

        <Select
          label="Industry"
          options={industryOptions}
          value={formData.industry}
          onChange={(e) =>
            setFormData({ ...formData, industry: e.target.value })
          }
        />

        <Select
          label="Company Size"
          options={sizeOptions}
          value={formData.size || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              size: (e.target.value as Company['size']) || undefined,
            })
          }
        />

        <Input
          label="Website"
          type="url"
          value={formData.website}
          onChange={(e) =>
            setFormData({ ...formData, website: e.target.value })
          }
          placeholder="https://example.com"
        />

        <Input
          label="Address"
          value={formData.address}
          onChange={(e) =>
            setFormData({ ...formData, address: e.target.value })
          }
          placeholder="Enter company address"
        />

        <Select
          label="Parent Company"
          options={parentOptions}
          value={formData.parentId || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              parentId: e.target.value || null,
            })
          }
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {company ? 'Save Changes' : 'Add Company'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
