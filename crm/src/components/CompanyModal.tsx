import { useState, useEffect } from 'react';
import type { Company } from '../types';
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

const industries = [
  'Technology', 'Finance', 'Healthcare', 'Manufacturing',
  'Retail', 'Education', 'Energy', 'Logistics', 'Media',
];

export default function CompanyModal({ isOpen, onClose, onSave, company, companies }: CompanyModalProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '', industry: '', size: undefined, website: '', address: '', parentId: null,
  });
  const [errors, setErrors] = useState<{ name?: string }>({});

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
        setFormData({ name: '', industry: '', size: undefined, website: '', address: '', parentId: null });
      }
      setErrors({});
    }
  }, [isOpen, company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Company name is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    onSave(formData);
  };

  const parentOptions = companies.filter((c) => c.id !== company?.id);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{company ? 'Edit Company' : 'Add Company'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Company Name <span className="text-destructive">*</span></Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter company name"
            />
            {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>Industry</Label>
            <Select value={formData.industry || 'none'} onValueChange={(v) => setFormData({ ...formData, industry: v === 'none' ? '' : v })}>
              <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No industry</SelectItem>
                {industries.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Company Size</Label>
            <Select value={formData.size || 'none'} onValueChange={(v) => setFormData({ ...formData, size: v === 'none' ? undefined : v as Company['size'] })}>
              <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unknown</SelectItem>
                <SelectItem value="10-50">10–50 employees</SelectItem>
                <SelectItem value="50-100">50–100 employees</SelectItem>
                <SelectItem value="100-500">100–500 employees</SelectItem>
                <SelectItem value="500+">500+ employees</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Website</Label>
            <Input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Enter company address"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Parent Company</Label>
            <Select value={formData.parentId || 'none'} onValueChange={(v) => setFormData({ ...formData, parentId: v === 'none' ? null : v })}>
              <SelectTrigger><SelectValue placeholder="None (top-level)" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None (top-level)</SelectItem>
                {parentOptions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">{company ? 'Save Changes' : 'Add Company'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
