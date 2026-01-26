import { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from './index';
import {
  createActivity,
  updateActivity,
  getRelatedEntities,
  getAssignees,
  type Activity,
  type ActivityType,
  type RelatedType,
} from '../api/activities';

interface ActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  activity: Activity | null;
}

interface FormData {
  type: ActivityType;
  subject: string;
  notes: string;
  relatedType: RelatedType;
  relatedId: string;
  relatedTo: string;
  dueDate: string;
  assignedTo: string;
}

interface FormErrors {
  type?: string;
  subject?: string;
  dueDate?: string;
}

const initialFormData: FormData = {
  type: 'Call',
  subject: '',
  notes: '',
  relatedType: 'Contact',
  relatedId: '',
  relatedTo: '',
  dueDate: new Date().toISOString().split('T')[0],
  assignedTo: '',
};

export default function ActivityModal({
  isOpen,
  onClose,
  onSave,
  activity,
}: ActivityModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [relatedEntities, setRelatedEntities] = useState<{
    contacts: { id: string; name: string }[];
    deals: { id: string; name: string }[];
    companies: { id: string; name: string }[];
  }>({ contacts: [], deals: [], companies: [] });
  const [assignees] = useState(() => getAssignees());

  // Load related entities on mount
  useEffect(() => {
    getRelatedEntities().then(setRelatedEntities);
  }, []);

  const isEditMode = !!activity;

  // Populate form when editing
  useEffect(() => {
    if (activity) {
      setFormData({
        type: activity.type,
        subject: activity.subject,
        notes: activity.notes,
        relatedType: activity.relatedType,
        relatedId: activity.relatedId,
        relatedTo: activity.relatedTo,
        dueDate: activity.dueDate,
        assignedTo: activity.assignedTo,
      });
    } else {
      setFormData({
        ...initialFormData,
        assignedTo: assignees[0] || '',
      });
    }
    setErrors({});
  }, [activity, isOpen, assignees]);

  // Handle input changes
  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle related type change
  const handleRelatedTypeChange = (relatedType: RelatedType) => {
    setFormData((prev) => ({
      ...prev,
      relatedType,
      relatedId: '',
      relatedTo: '',
    }));
  };

  // Handle related entity change
  const handleRelatedEntityChange = (relatedId: string) => {
    let relatedTo = '';
    const entities =
      formData.relatedType === 'Contact'
        ? relatedEntities.contacts
        : formData.relatedType === 'Deal'
          ? relatedEntities.deals
          : relatedEntities.companies;

    const entity = entities.find((e) => e.id === relatedId);
    if (entity) {
      relatedTo = entity.name;
    }

    setFormData((prev) => ({
      ...prev,
      relatedId,
      relatedTo,
    }));
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.type) {
      newErrors.type = 'Type is required';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
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
      // Determine status based on due date
      const dueDate = new Date(formData.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const status = dueDate < today ? 'Overdue' : 'Pending';

      if (isEditMode && activity) {
        await updateActivity(activity.id, {
          ...formData,
          status: activity.status === 'Completed' ? 'Completed' : status,
        });
      } else {
        await createActivity({
          ...formData,
          status,
        });
      }
      onSave();
    } catch (error) {
      console.error('Failed to save activity:', error);
    } finally {
      setSaving(false);
    }
  };

  // Type options
  const typeOptions = [
    { value: 'Call', label: 'Call' },
    { value: 'Email', label: 'Email' },
    { value: 'Meeting', label: 'Meeting' },
    { value: 'Task', label: 'Task' },
  ];

  // Related type options
  const relatedTypeOptions = [
    { value: 'Contact', label: 'Contact' },
    { value: 'Deal', label: 'Deal' },
    { value: 'Company', label: 'Company' },
  ];

  // Get related entity options based on selected type
  const getRelatedOptions = () => {
    const entities =
      formData.relatedType === 'Contact'
        ? relatedEntities.contacts
        : formData.relatedType === 'Deal'
          ? relatedEntities.deals
          : relatedEntities.companies;

    return [
      { value: '', label: `Select a ${formData.relatedType.toLowerCase()}` },
      ...entities.map((e) => ({ value: e.id, label: e.name })),
    ];
  };

  // Assignee options
  const assigneeOptions = [
    { value: '', label: 'Select assignee' },
    ...assignees.map((a) => ({ value: a, label: a })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Activity' : 'Add Activity'}
      className="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Type"
            options={typeOptions}
            value={formData.type}
            onChange={(e) => handleChange('type', e.target.value)}
            error={errors.type}
            required
          />
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            error={errors.dueDate}
            required
          />
        </div>

        <Input
          label="Subject"
          value={formData.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          error={errors.subject}
          placeholder="Enter activity subject"
          required
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add any additional notes..."
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Related Type"
            options={relatedTypeOptions}
            value={formData.relatedType}
            onChange={(e) => handleRelatedTypeChange(e.target.value as RelatedType)}
          />
          <Select
            label="Related To"
            options={getRelatedOptions()}
            value={formData.relatedId}
            onChange={(e) => handleRelatedEntityChange(e.target.value)}
          />
        </div>

        <Select
          label="Assigned To"
          options={assigneeOptions}
          value={formData.assignedTo}
          onChange={(e) => handleChange('assignedTo', e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Activity'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
