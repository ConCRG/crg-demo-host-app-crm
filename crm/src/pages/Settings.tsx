import { useState, useEffect, useRef } from 'react';
import { User, Layers, Grid3X3, Bell, Plus, Trash2, GripVertical, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  getSettings,
  updateProfile,
  updatePipelineStages,
  addCustomField,
  updateCustomField,
  deleteCustomField,
  updateNotifications,
  type SettingsData,
  type UserProfile,
  type PipelineStage,
  type CustomField,
  type NotificationPreferences,
} from '../api/settings';

const stageColors = [
  { value: '#6B7280', label: 'Gray' },
  { value: '#3B82F6', label: 'Blue' },
  { value: '#8B5CF6', label: 'Purple' },
  { value: '#F59E0B', label: 'Amber' },
  { value: '#10B981', label: 'Green' },
  { value: '#EF4444', label: 'Red' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#06B6D4', label: 'Cyan' },
];

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

function ProfileTab({
  profile,
  timezones,
  onSave,
}: {
  profile: UserProfile;
  timezones: { value: string; label: string }[];
  onSave: (profile: Partial<UserProfile>) => void;
}) {
  const [formData, setFormData] = useState({ name: profile.name, email: profile.email, timezone: profile.timezone });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Profile Settings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your personal information</p>
      </div>

      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg bg-primary text-primary-foreground">
            {getInitials(formData.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <Button variant="outline" size="sm">Change Avatar</Button>
          <p className="mt-1 text-xs text-muted-foreground">JPG, GIF or PNG. Max 2MB</p>
        </div>
      </div>

      <div className="grid gap-4 max-w-md">
        <div className="space-y-1.5">
          <Label>Full Name</Label>
          <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Email Address</Label>
          <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label>Timezone</Label>
          <Select value={formData.timezone} onValueChange={(v) => setFormData({ ...formData, timezone: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-2">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

function ColorPicker({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-7 h-7 rounded-md border border-border shadow-sm flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-ring"
        style={{ backgroundColor: value }}
        title="Pick colour"
      />
      {open && (
        <div className="absolute z-20 top-9 left-0 bg-popover border border-border rounded-lg shadow-md p-2 flex flex-wrap gap-1.5" style={{ width: '116px' }}>
          {stageColors.map((c) => (
            <button
              key={c.value}
              type="button"
              title={c.label}
              onClick={() => { onChange(c.value); setOpen(false); }}
              className="flex-shrink-0 flex items-center justify-center rounded focus:outline-none focus:ring-2 focus:ring-ring hover:scale-110 transition-transform"
              style={{ backgroundColor: c.value, width: '24px', height: '24px' }}
            >
              {value === c.value && (
                <Check className="h-3 w-3 text-white drop-shadow" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PipelineTab({ stages, onSave }: { stages: PipelineStage[]; onSave: (stages: PipelineStage[]) => void }) {
  const [localStages, setLocalStages] = useState<PipelineStage[]>(stages);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleStageChange = (id: string, field: keyof PipelineStage, value: string | number) => {
    setLocalStages((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const handleAddStage = () => {
    setLocalStages([...localStages, {
      id: `stage-${Date.now()}`,
      name: 'New Stage',
      probability: 50,
      color: '#6B7280',
      order: localStages.length + 1,
    }]);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(localStages);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Pipeline Stages</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Configure your deal pipeline stages</p>
        </div>
        <Button size="sm" onClick={handleAddStage}>
          <Plus className="h-4 w-4 mr-2" />
          Add Stage
        </Button>
      </div>

      <div className="space-y-2">
        {localStages.map((stage) => (
          <div key={stage.id} className="flex items-center gap-3 p-3 border border-border rounded-lg bg-card">
            <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
            <ColorPicker
              value={stage.color}
              onChange={(color) => handleStageChange(stage.id, 'color', color)}
            />
            <Input
              value={stage.name}
              onChange={(e) => handleStageChange(stage.id, 'name', e.target.value)}
              className="flex-1"
              placeholder="Stage name"
            />
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                min={0}
                max={100}
                value={stage.probability}
                onChange={(e) => handleStageChange(stage.id, 'probability', parseInt(e.target.value) || 0)}
                className="w-16 text-center"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
            <button
              onClick={() => setDeleteConfirm(stage.id)}
              className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save Changes'}
      </Button>

      <Dialog open={deleteConfirm !== null} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Stage</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this pipeline stage? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => {
              if (deleteConfirm) setLocalStages((prev) => prev.filter((s) => s.id !== deleteConfirm));
              setDeleteConfirm(null);
            }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CustomFieldsTab({
  fields,
  onAdd,
  onUpdate,
  onDelete,
}: {
  fields: CustomField[];
  onAdd: (field: Omit<CustomField, 'id'>) => void;
  onUpdate: (id: string, field: Partial<CustomField>) => void;
  onDelete: (id: string) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<CustomField | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<CustomField, 'id'>>({
    name: '', type: 'text', entity: 'contact', required: false, options: [],
  });
  const [optionsText, setOptionsText] = useState('');

  const openAddModal = () => {
    setEditingField(null);
    setFormData({ name: '', type: 'text', entity: 'contact', required: false, options: [] });
    setOptionsText('');
    setIsModalOpen(true);
  };

  const openEditModal = (field: CustomField) => {
    setEditingField(field);
    setFormData({ name: field.name, type: field.type, entity: field.entity, required: field.required, options: field.options || [] });
    setOptionsText(field.options?.join('\n') || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const fieldData = {
      ...formData,
      options: formData.type === 'dropdown' ? optionsText.split('\n').filter((o) => o.trim()) : undefined,
    };
    if (editingField) await onUpdate(editingField.id, fieldData);
    else await onAdd(fieldData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Custom Fields</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Add custom data fields to your entities</p>
        </div>
        <Button size="sm" onClick={openAddModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Field Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Required</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fields.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No custom fields defined. Click "Add Field" to create one.
                </TableCell>
              </TableRow>
            ) : (
              fields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell className="font-medium">{field.name}</TableCell>
                  <TableCell className="text-muted-foreground capitalize">{field.type}</TableCell>
                  <TableCell className="text-muted-foreground capitalize">{field.entity}</TableCell>
                  <TableCell>
                    <Badge variant={field.required ? 'default' : 'secondary'} className="text-xs">
                      {field.required ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <button onClick={() => openEditModal(field)} className="text-xs text-primary hover:underline mr-3">Edit</button>
                    <button onClick={() => setDeleteConfirm(field.id)} className="text-xs text-destructive hover:underline">Delete</button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={(open) => { if (!open) setIsModalOpen(false); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingField ? 'Edit Custom Field' : 'Add Custom Field'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Field Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Lead Source" />
            </div>
            <div className="space-y-1.5">
              <Label>Field Type</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as CustomField['type'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="dropdown">Dropdown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Entity</Label>
              <Select value={formData.entity} onValueChange={(v) => setFormData({ ...formData, entity: v as CustomField['entity'] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="contact">Contact</SelectItem>
                  <SelectItem value="deal">Deal</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Required Field</Label>
              <Switch checked={formData.required} onCheckedChange={(checked) => setFormData({ ...formData, required: checked })} />
            </div>
            {formData.type === 'dropdown' && (
              <div className="space-y-1.5">
                <Label>Options (one per line)</Label>
                <Textarea value={optionsText} onChange={(e) => setOptionsText(e.target.value)} rows={4} placeholder={"Option 1\nOption 2\nOption 3"} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
              {editingField ? 'Save Changes' : 'Add Field'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirm !== null} onOpenChange={(open) => { if (!open) setDeleteConfirm(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Custom Field</DialogTitle>
            <DialogDescription>
              This action cannot be undone. Any data stored in this field will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { if (deleteConfirm) onDelete(deleteConfirm); setDeleteConfirm(null); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NotificationsTab({ notifications, onSave }: { notifications: NotificationPreferences; onSave: (n: NotificationPreferences) => void }) {
  const [local, setLocal] = useState<NotificationPreferences>(notifications);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(local);
    setIsSaving(false);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const emailLabels: Record<keyof NotificationPreferences['email'], string> = {
    newDeal: 'New deal created',
    dealStageChange: 'Deal stage changes',
    dealWon: 'Deal won',
    dealLost: 'Deal lost',
    newContact: 'New contact added',
    activityReminder: 'Activity reminders',
    weeklyReport: 'Weekly summary report',
  };

  const inAppLabels: Record<keyof NotificationPreferences['inApp'], string> = {
    newDeal: 'New deal created',
    dealStageChange: 'Deal stage changes',
    dealWon: 'Deal won',
    dealLost: 'Deal lost',
    newContact: 'New contact added',
    activityReminder: 'Activity reminders',
    mentionNotification: 'When someone mentions you',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-foreground">Notification Preferences</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Choose how you want to be notified</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Email Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {(Object.keys(local.email) as Array<keyof NotificationPreferences['email']>).map((key) => (
            <div key={key} className="flex items-center justify-between py-2.5 border-b border-border last:border-b-0">
              <Label className="text-sm font-normal cursor-pointer">{emailLabels[key]}</Label>
              <Switch
                checked={local.email[key]}
                onCheckedChange={(v) => setLocal((prev) => ({ ...prev, email: { ...prev.email, [key]: v } }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">In-App Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {(Object.keys(local.inApp) as Array<keyof NotificationPreferences['inApp']>).map((key) => (
            <div key={key} className="flex items-center justify-between py-2.5 border-b border-border last:border-b-0">
              <Label className="text-sm font-normal cursor-pointer">{inAppLabels[key]}</Label>
              <Switch
                checked={local.inApp[key]}
                onCheckedChange={(v) => setLocal((prev) => ({ ...prev, inApp: { ...prev.inApp, [key]: v } }))}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
        {showSaved && (
          <span className="flex items-center text-sm text-foreground">
            <Check className="h-4 w-4 mr-1" />
            Saved successfully
          </span>
        )}
      </div>
    </div>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getSettings().then((r) => { setSettings(r.data); setIsLoading(false); });
  }, []);

  const handleProfileSave = async (profile: Partial<UserProfile>) => {
    const r = await updateProfile(profile);
    if (settings) setSettings({ ...settings, profile: r.data });
  };

  const handlePipelineSave = async (stages: PipelineStage[]) => {
    const r = await updatePipelineStages(stages);
    if (settings) setSettings({ ...settings, pipelineStages: r.data });
  };

  const handleAddCustomField = async (field: Omit<CustomField, 'id'>) => {
    const r = await addCustomField(field);
    if (settings) setSettings({ ...settings, customFields: [...settings.customFields, r.data] });
  };

  const handleUpdateCustomField = async (id: string, field: Partial<CustomField>) => {
    const r = await updateCustomField(id, field);
    if (settings) setSettings({ ...settings, customFields: settings.customFields.map((f) => (f.id === id ? r.data : f)) });
  };

  const handleDeleteCustomField = async (id: string) => {
    await deleteCustomField(id);
    if (settings) setSettings({ ...settings, customFields: settings.customFields.filter((f) => f.id !== id) });
  };

  const handleNotificationsSave = async (notifications: NotificationPreferences) => {
    const r = await updateNotifications(notifications);
    if (settings) setSettings({ ...settings, notifications: r.data });
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
        Loading settings...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account and CRM preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="pipeline" className="gap-2">
            <Layers className="h-4 w-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="custom-fields" className="gap-2">
            <Grid3X3 className="h-4 w-4" />
            Custom Fields
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardContent className="p-6">
              <ProfileTab profile={settings.profile} timezones={settings.timezones} onSave={handleProfileSave} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card>
            <CardContent className="p-6">
              <PipelineTab stages={settings.pipelineStages} onSave={handlePipelineSave} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="custom-fields">
          <Card>
            <CardContent className="p-6">
              <CustomFieldsTab
                fields={settings.customFields}
                onAdd={handleAddCustomField}
                onUpdate={handleUpdateCustomField}
                onDelete={handleDeleteCustomField}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab notifications={settings.notifications} onSave={handleNotificationsSave} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
