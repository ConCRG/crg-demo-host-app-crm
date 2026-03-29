import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export default function ActivityModal({ isOpen, onClose, onSave, activity }: ActivityModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [relatedEntities, setRelatedEntities] = useState<{
    contacts: { id: string; name: string }[];
    deals: { id: string; name: string }[];
    companies: { id: string; name: string }[];
  }>({ contacts: [], deals: [], companies: [] });
  const [assignees] = useState(() => getAssignees());

  const isEditMode = !!activity;

  useEffect(() => {
    getRelatedEntities().then(setRelatedEntities);
  }, []);

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
      setFormData({ ...initialFormData, assignedTo: assignees[0] || '' });
    }
    setErrors({});
  }, [activity, isOpen, assignees]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleRelatedTypeChange = (relatedType: RelatedType) => {
    setFormData((prev) => ({ ...prev, relatedType, relatedId: '', relatedTo: '' }));
  };

  const handleRelatedEntityChange = (relatedId: string) => {
    const entities =
      formData.relatedType === 'Contact'
        ? relatedEntities.contacts
        : formData.relatedType === 'Deal'
          ? relatedEntities.deals
          : relatedEntities.companies;
    const entity = entities.find((e) => e.id === relatedId);
    setFormData((prev) => ({ ...prev, relatedId, relatedTo: entity?.name || '' }));
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
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
        await createActivity({ ...formData, status });
      }
      onSave();
    } catch (err) {
      console.error('Failed to save activity:', err);
    } finally {
      setSaving(false);
    }
  };

  const getRelatedOptions = () => {
    const entities =
      formData.relatedType === 'Contact'
        ? relatedEntities.contacts
        : formData.relatedType === 'Deal'
          ? relatedEntities.deals
          : relatedEntities.companies;
    return entities;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Activity' : 'Add Activity'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Type <span className="text-destructive">*</span></Label>
              <Select value={formData.type} onValueChange={(v) => handleChange('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Call">Call</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Meeting">Meeting</SelectItem>
                  <SelectItem value="Task">Task</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && <p className="text-xs text-destructive">{errors.type}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Due Date <span className="text-destructive">*</span></Label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
              />
              {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate}</p>}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Subject <span className="text-destructive">*</span></Label>
            <Input
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              placeholder="Enter activity subject"
            />
            {errors.subject && <p className="text-xs text-destructive">{errors.subject}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Add any additional notes..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Related Type</Label>
              <Select value={formData.relatedType} onValueChange={(v) => handleRelatedTypeChange(v as RelatedType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Contact">Contact</SelectItem>
                  <SelectItem value="Deal">Deal</SelectItem>
                  <SelectItem value="Company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Related To</Label>
              <Select value={formData.relatedId || 'none'} onValueChange={(v) => handleRelatedEntityChange(v === 'none' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder={`Select ${formData.relatedType.toLowerCase()}`} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {getRelatedOptions().map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Assigned To</Label>
            <Select value={formData.assignedTo || 'none'} onValueChange={(v) => handleChange('assignedTo', v === 'none' ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="Select assignee" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {assignees.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Activity'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
