import { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import Select from './Select';
import { DEAL_STAGES, type Deal } from '../api/deals';

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (deal: DealFormData) => void;
  deal?: Deal | null;
  companies: { value: string; label: string }[];
  contacts: { value: string; label: string }[];
}

export interface DealFormData {
  id?: string;
  name: string;
  companyId: string;
  companyName: string;
  contactId: string;
  contactName: string;
  value: number;
  stage: Deal['stage'];
  probability: number;
  expectedCloseDate: string;
}

const initialFormState: DealFormData = {
  name: '',
  companyId: '',
  companyName: '',
  contactId: '',
  contactName: '',
  value: 0,
  stage: 'lead',
  probability: 10,
  expectedCloseDate: '',
};

export default function DealModal({
  isOpen,
  onClose,
  onSave,
  deal,
  companies,
  contacts,
}: DealModalProps) {
  const [formData, setFormData] = useState<DealFormData>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditMode = !!deal;

  useEffect(() => {
    if (deal) {
      setFormData({
        id: deal.id,
        name: deal.name,
        companyId: deal.companyId,
        companyName: deal.companyName,
        contactId: deal.contactId,
        contactName: deal.contactName,
        value: deal.value,
        stage: deal.stage,
        probability: deal.probability,
        expectedCloseDate: deal.expectedCloseDate,
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [deal, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Deal name is required';
    }

    if (formData.value <= 0) {
      newErrors.value = 'Value must be greater than 0';
    }

    if (!formData.stage) {
      newErrors.stage = 'Stage is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
      onClose();
    }
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const companyId = e.target.value;
    const company = companies.find((c) => c.value === companyId);
    setFormData((prev) => ({
      ...prev,
      companyId,
      companyName: company?.label || '',
    }));
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const contactId = e.target.value;
    const contact = contacts.find((c) => c.value === contactId);
    setFormData((prev) => ({
      ...prev,
      contactId,
      contactName: contact?.label || '',
    }));
  };

  const stageOptions = [
    { value: '', label: 'Select stage...' },
    ...DEAL_STAGES.map((s) => ({ value: s.value, label: s.label })),
  ];

  const companyOptions = [{ value: '', label: 'Select company...' }, ...companies];
  const contactOptions = [{ value: '', label: 'Select contact...' }, ...contacts];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Deal' : 'Add New Deal'}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Deal Name"
          value={formData.name}
          onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
          error={errors.name}
          placeholder="Enter deal name"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Company"
            options={companyOptions}
            value={formData.companyId}
            onChange={handleCompanyChange}
          />

          <Select
            label="Contact"
            options={contactOptions}
            value={formData.contactId}
            onChange={handleContactChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Value ($)"
            type="number"
            value={formData.value || ''}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, value: parseFloat(e.target.value) || 0 }))
            }
            error={errors.value}
            placeholder="0"
            min="0"
            step="100"
            required
          />

          <Select
            label="Stage"
            options={stageOptions}
            value={formData.stage}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, stage: e.target.value as Deal['stage'] }))
            }
            error={errors.stage}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Probability (%)"
            type="number"
            value={formData.probability}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                probability: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)),
              }))
            }
            placeholder="0"
            min="0"
            max="100"
          />

          <Input
            label="Expected Close Date"
            type="date"
            value={formData.expectedCloseDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, expectedCloseDate: e.target.value }))
            }
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Deal'}</Button>
        </div>
      </form>
    </Modal>
  );
}
