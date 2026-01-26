import { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from './index';
import { createContact, updateContact, getCompanies, type ContactWithDetails } from '../api/contacts';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  contact: ContactWithDetails | null;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyId: string;
  company: string;
  jobTitle: string;
  status: 'active' | 'inactive' | 'lead';
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
}

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  companyId: '',
  company: '',
  jobTitle: '',
  status: 'lead',
};

export default function ContactModal({ isOpen, onClose, onSave, contact }: ContactModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);

  const isEditMode = !!contact;

  // Load companies on mount
  useEffect(() => {
    getCompanies().then(setCompanies);
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (contact) {
      setFormData({
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        phone: contact.phone || '',
        companyId: contact.companyId || '',
        company: contact.company || '',
        jobTitle: contact.jobTitle || '',
        status: contact.status,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [contact, isOpen]);

  // Handle input changes
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle company change
  const handleCompanyChange = (companyId: string) => {
    const selectedCompany = companies.find((c) => c.id === companyId);
    setFormData((prev) => ({
      ...prev,
      companyId,
      company: selectedCompany?.name || '',
    }));
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setSaving(true);
    try {
      if (isEditMode && contact) {
        await updateContact(contact.id, formData);
      } else {
        await createContact(formData);
      }
      onSave();
    } catch (error) {
      console.error('Failed to save contact:', error);
    } finally {
      setSaving(false);
    }
  };

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'lead', label: 'Lead' },
    { value: 'inactive', label: 'Inactive' },
  ];

  // Company options
  const companyOptions = [
    { value: '', label: 'Select a company' },
    ...companies.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Contact' : 'Add Contact'}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            error={errors.firstName}
            placeholder="John"
            required
          />
          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            error={errors.lastName}
            placeholder="Doe"
            required
          />
        </div>

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          placeholder="john.doe@example.com"
          required
        />

        <Input
          label="Phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="+1 (555) 000-0000"
        />

        <Select
          label="Company"
          options={companyOptions}
          value={formData.companyId}
          onChange={(e) => handleCompanyChange(e.target.value)}
        />

        <Input
          label="Job Title"
          value={formData.jobTitle}
          onChange={(e) => handleChange('jobTitle', e.target.value)}
          placeholder="Software Engineer"
        />

        <Select
          label="Status"
          options={statusOptions}
          value={formData.status}
          onChange={(e) => handleChange('status', e.target.value as FormData['status'])}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Contact'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
