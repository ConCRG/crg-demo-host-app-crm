import { useState, useEffect } from 'react';
import { User, Layers, Grid3X3, Bell, Plus, Trash2, GripVertical, Check } from 'lucide-react';
import { Button, Card, Input, Select, Modal } from '../components';
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

type TabId = 'profile' | 'pipeline' | 'custom-fields' | 'notifications';

interface TabItem {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: TabItem[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'pipeline', label: 'Pipeline', icon: Layers },
  { id: 'custom-fields', label: 'Custom Fields', icon: Grid3X3 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
];

// Color options for pipeline stages
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

// Toggle Switch Component
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center justify-between py-3 cursor-pointer">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
          ${checked ? 'bg-blue-600' : 'bg-gray-200'}
        `}
      >
        <span
          className={`
            inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? 'translate-x-6' : 'translate-x-1'}
          `}
        />
      </button>
    </label>
  );
}

// Profile Tab Component
function ProfileTab({
  profile,
  timezones,
  onSave,
}: {
  profile: UserProfile;
  timezones: { value: string; label: string }[];
  onSave: (profile: Partial<UserProfile>) => void;
}) {
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    timezone: profile.timezone,
  });
  const [isSaving, setIsSaving] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
        <p className="text-sm text-gray-500">Manage your personal information</p>
      </div>

      {/* Avatar Section */}
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-semibold">
          {getInitials(formData.name)}
        </div>
        <div>
          <Button variant="outline" onClick={() => console.log('Change avatar clicked')}>
            Change Avatar
          </Button>
          <p className="mt-1 text-xs text-gray-500">JPG, GIF or PNG. Max size 2MB</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid gap-4 max-w-md">
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Select
          label="Timezone"
          value={formData.timezone}
          options={timezones}
          onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
        />
      </div>

      <div className="pt-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}

// Pipeline Tab Component
function PipelineTab({
  stages,
  onSave,
}: {
  stages: PipelineStage[];
  onSave: (stages: PipelineStage[]) => void;
}) {
  const [localStages, setLocalStages] = useState<PipelineStage[]>(stages);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleStageChange = (id: string, field: keyof PipelineStage, value: string | number) => {
    setLocalStages((prev) =>
      prev.map((stage) => (stage.id === id ? { ...stage, [field]: value } : stage))
    );
  };

  const handleAddStage = () => {
    const newStage: PipelineStage = {
      id: `stage-${Date.now()}`,
      name: 'New Stage',
      probability: 50,
      color: '#6B7280',
      order: localStages.length + 1,
    };
    setLocalStages([...localStages, newStage]);
  };

  const handleDeleteStage = (id: string) => {
    setLocalStages((prev) => prev.filter((stage) => stage.id !== id));
    setDeleteConfirm(null);
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
          <h2 className="text-lg font-medium text-gray-900">Pipeline Stages</h2>
          <p className="text-sm text-gray-500">Configure your deal pipeline stages</p>
        </div>
        <Button onClick={handleAddStage}>
          <Plus className="h-4 w-4 mr-2" />
          Add Stage
        </Button>
      </div>

      <div className="space-y-3">
        {localStages.map((stage) => (
          <div
            key={stage.id}
            className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg"
          >
            <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />

            {/* Color Picker */}
            <div className="relative">
              <select
                value={stage.color}
                onChange={(e) => handleStageChange(stage.id, 'color', e.target.value)}
                className="appearance-none w-10 h-10 rounded-lg cursor-pointer border-2 border-gray-200"
                style={{ backgroundColor: stage.color }}
              >
                {stageColors.map((color) => (
                  <option key={color.value} value={color.value}>
                    {color.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Stage Name */}
            <div className="flex-1">
              <input
                type="text"
                value={stage.name}
                onChange={(e) => handleStageChange(stage.id, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Stage name"
              />
            </div>

            {/* Probability */}
            <div className="w-32">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={stage.probability}
                  onChange={(e) =>
                    handleStageChange(stage.id, 'probability', parseInt(e.target.value) || 0)
                  }
                  className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-gray-500">%</span>
              </div>
            </div>

            {/* Delete Button */}
            <button
              onClick={() => setDeleteConfirm(stage.id)}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>

      <div className="pt-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Stage"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete this pipeline stage? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={() => deleteConfirm && handleDeleteStage(deleteConfirm)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// Custom Fields Tab Component
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
    name: '',
    type: 'text',
    entity: 'contact',
    required: false,
    options: [],
  });
  const [optionsText, setOptionsText] = useState('');

  const fieldTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'date', label: 'Date' },
    { value: 'dropdown', label: 'Dropdown' },
  ];

  const entityTypes = [
    { value: 'contact', label: 'Contact' },
    { value: 'deal', label: 'Deal' },
    { value: 'company', label: 'Company' },
  ];

  const openAddModal = () => {
    setEditingField(null);
    setFormData({
      name: '',
      type: 'text',
      entity: 'contact',
      required: false,
      options: [],
    });
    setOptionsText('');
    setIsModalOpen(true);
  };

  const openEditModal = (field: CustomField) => {
    setEditingField(field);
    setFormData({
      name: field.name,
      type: field.type,
      entity: field.entity,
      required: field.required,
      options: field.options || [],
    });
    setOptionsText(field.options?.join('\n') || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    const fieldData = {
      ...formData,
      options: formData.type === 'dropdown' ? optionsText.split('\n').filter((o) => o.trim()) : undefined,
    };

    if (editingField) {
      await onUpdate(editingField.id, fieldData);
    } else {
      await onAdd(fieldData);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await onDelete(id);
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Custom Fields</h2>
          <p className="text-sm text-gray-500">Add custom data fields to your entities</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Custom Field
        </Button>
      </div>

      {/* Fields Table */}
      <div className="overflow-hidden border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Field Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Required
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {fields.map((field) => (
              <tr key={field.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {field.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {field.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {field.entity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {field.required ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      Yes
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      No
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    onClick={() => openEditModal(field)}
                    className="text-blue-600 hover:text-blue-800 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(field.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {fields.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No custom fields defined. Click "Add Custom Field" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingField ? 'Edit Custom Field' : 'Add Custom Field'}
      >
        <div className="space-y-4">
          <Input
            label="Field Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Lead Source"
          />

          <Select
            label="Field Type"
            value={formData.type}
            options={fieldTypes}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value as CustomField['type'] })
            }
          />

          <Select
            label="Entity"
            value={formData.entity}
            options={entityTypes}
            onChange={(e) =>
              setFormData({ ...formData, entity: e.target.value as CustomField['entity'] })
            }
          />

          <Toggle
            label="Required Field"
            checked={formData.required}
            onChange={(checked) => setFormData({ ...formData, required: checked })}
          />

          {formData.type === 'dropdown' && (
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Options (one per line)
              </label>
              <textarea
                value={optionsText}
                onChange={(e) => setOptionsText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Option 1&#10;Option 2&#10;Option 3"
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
              {editingField ? 'Save Changes' : 'Add Field'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Custom Field"
      >
        <p className="text-gray-600 mb-4">
          Are you sure you want to delete this custom field? Any data stored in this field will be
          lost.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

// Notifications Tab Component
function NotificationsTab({
  notifications,
  onSave,
}: {
  notifications: NotificationPreferences;
  onSave: (notifications: NotificationPreferences) => void;
}) {
  const [localNotifications, setLocalNotifications] =
    useState<NotificationPreferences>(notifications);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const handleEmailToggle = (key: keyof NotificationPreferences['email'], value: boolean) => {
    setLocalNotifications((prev) => ({
      ...prev,
      email: { ...prev.email, [key]: value },
    }));
  };

  const handleInAppToggle = (key: keyof NotificationPreferences['inApp'], value: boolean) => {
    setLocalNotifications((prev) => ({
      ...prev,
      inApp: { ...prev.inApp, [key]: value },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await onSave(localNotifications);
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
        <h2 className="text-lg font-medium text-gray-900">Notification Preferences</h2>
        <p className="text-sm text-gray-500">Choose how you want to be notified</p>
      </div>

      {/* Email Notifications */}
      <Card title="Email Notifications">
        <div className="divide-y divide-gray-100">
          {(Object.keys(localNotifications.email) as Array<keyof NotificationPreferences['email']>).map(
            (key) => (
              <Toggle
                key={key}
                label={emailLabels[key]}
                checked={localNotifications.email[key]}
                onChange={(value) => handleEmailToggle(key, value)}
              />
            )
          )}
        </div>
      </Card>

      {/* In-App Notifications */}
      <Card title="In-App Notifications">
        <div className="divide-y divide-gray-100">
          {(Object.keys(localNotifications.inApp) as Array<keyof NotificationPreferences['inApp']>).map(
            (key) => (
              <Toggle
                key={key}
                label={inAppLabels[key]}
                checked={localNotifications.inApp[key]}
                onChange={(value) => handleInAppToggle(key, value)}
              />
            )
          )}
        </div>
      </Card>

      <div className="flex items-center gap-4 pt-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </Button>
        {showSaved && (
          <span className="flex items-center text-green-600 text-sm">
            <Check className="h-4 w-4 mr-1" />
            Saved successfully
          </span>
        )}
      </div>
    </div>
  );
}

// Main Settings Page
export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      const response = await getSettings();
      setSettings(response.data);
      setIsLoading(false);
    };
    loadSettings();
  }, []);

  const handleProfileSave = async (profile: Partial<UserProfile>) => {
    const response = await updateProfile(profile);
    if (settings) {
      setSettings({ ...settings, profile: response.data });
    }
    console.log('Profile saved:', response.data);
  };

  const handlePipelineSave = async (stages: PipelineStage[]) => {
    const response = await updatePipelineStages(stages);
    if (settings) {
      setSettings({ ...settings, pipelineStages: response.data });
    }
    console.log('Pipeline stages saved:', response.data);
  };

  const handleAddCustomField = async (field: Omit<CustomField, 'id'>) => {
    const response = await addCustomField(field);
    if (settings) {
      setSettings({
        ...settings,
        customFields: [...settings.customFields, response.data],
      });
    }
    console.log('Custom field added:', response.data);
  };

  const handleUpdateCustomField = async (id: string, field: Partial<CustomField>) => {
    const response = await updateCustomField(id, field);
    if (settings) {
      setSettings({
        ...settings,
        customFields: settings.customFields.map((f) => (f.id === id ? response.data : f)),
      });
    }
    console.log('Custom field updated:', response.data);
  };

  const handleDeleteCustomField = async (id: string) => {
    await deleteCustomField(id);
    if (settings) {
      setSettings({
        ...settings,
        customFields: settings.customFields.filter((f) => f.id !== id),
      });
    }
    console.log('Custom field deleted:', id);
  };

  const handleNotificationsSave = async (notifications: NotificationPreferences) => {
    const response = await updateNotifications(notifications);
    if (settings) {
      setSettings({ ...settings, notifications: response.data });
    }
    console.log('Notifications saved:', response.data);
  };

  if (isLoading || !settings) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading settings...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-gray-600">Manage your account and CRM preferences</p>
      </div>

      <div className="flex gap-8">
        {/* Vertical Tab Navigation */}
        <nav className="w-56 flex-shrink-0">
          <ul className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors
                      ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Tab Content */}
        <div className="flex-1 bg-white rounded-lg shadow p-6">
          {activeTab === 'profile' && (
            <ProfileTab
              profile={settings.profile}
              timezones={settings.timezones}
              onSave={handleProfileSave}
            />
          )}
          {activeTab === 'pipeline' && (
            <PipelineTab stages={settings.pipelineStages} onSave={handlePipelineSave} />
          )}
          {activeTab === 'custom-fields' && (
            <CustomFieldsTab
              fields={settings.customFields}
              onAdd={handleAddCustomField}
              onUpdate={handleUpdateCustomField}
              onDelete={handleDeleteCustomField}
            />
          )}
          {activeTab === 'notifications' && (
            <NotificationsTab
              notifications={settings.notifications}
              onSave={handleNotificationsSave}
            />
          )}
        </div>
      </div>
    </div>
  );
}
