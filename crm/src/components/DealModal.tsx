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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

export default function DealModal({ isOpen, onClose, onSave, deal, companies, contacts }: DealModalProps) {
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
    if (!formData.name.trim()) newErrors.name = 'Deal name is required';
    if (formData.value <= 0) newErrors.value = 'Value must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) { onSave(formData); onClose(); }
  };

  const handleCompanyChange = (companyId: string) => {
    const company = companies.find((c) => c.value === companyId);
    setFormData((prev) => ({ ...prev, companyId: companyId === 'none' ? '' : companyId, companyName: company?.label || '' }));
  };

  const handleContactChange = (contactId: string) => {
    const contact = contacts.find((c) => c.value === contactId);
    setFormData((prev) => ({ ...prev, contactId: contactId === 'none' ? '' : contactId, contactName: contact?.label || '' }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Deal' : 'Add New Deal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Deal Name <span className="text-destructive">*</span></Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Enter deal name"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Company</Label>
              <Select value={formData.companyId || 'none'} onValueChange={handleCompanyChange}>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No company</SelectItem>
                  {companies.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Contact</Label>
              <Select value={formData.contactId || 'none'} onValueChange={handleContactChange}>
                <SelectTrigger><SelectValue placeholder="Select contact" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No contact</SelectItem>
                  {contacts.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Value ($) <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                value={formData.value || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, value: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
                min="0"
                step="100"
              />
              {errors.value && <p className="text-xs text-destructive">{errors.value}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Stage</Label>
              <Select value={formData.stage} onValueChange={(v) => setFormData((prev) => ({ ...prev, stage: v as Deal['stage'] }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEAL_STAGES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Probability (%)</Label>
              <Input
                type="number"
                value={formData.probability}
                onChange={(e) => setFormData((prev) => ({ ...prev, probability: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) }))}
                min="0"
                max="100"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Expected Close Date</Label>
              <Input
                type="date"
                value={formData.expectedCloseDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, expectedCloseDate: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{isEditMode ? 'Save Changes' : 'Create Deal'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
