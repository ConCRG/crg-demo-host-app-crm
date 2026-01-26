import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Button, Select, Badge } from '../components';
import ActivityModal from '../components/ActivityModal';
import {
  getActivities,
  markComplete,
  markIncomplete,
  type Activity,
  type ActivityFilters,
  type ActivityType,
  type ActivityStatus,
} from '../api/activities';

// Type icon mapping
const typeIcons: Record<ActivityType, typeof Phone> = {
  Call: Phone,
  Email: Mail,
  Meeting: Calendar,
  Task: CheckSquare,
};

// Type colors for icons
const typeColors: Record<ActivityType, string> = {
  Call: 'text-blue-600 bg-blue-100',
  Email: 'text-purple-600 bg-purple-100',
  Meeting: 'text-green-600 bg-green-100',
  Task: 'text-orange-600 bg-orange-100',
};

// Status badge colors
const statusColors: Record<ActivityStatus, 'green' | 'yellow' | 'red'> = {
  Completed: 'green',
  Pending: 'yellow',
  Overdue: 'red',
};

// Related type badge colors
const relatedTypeColors: Record<string, 'blue' | 'purple' | 'gray'> = {
  Contact: 'blue',
  Deal: 'purple',
  Company: 'gray',
};

// Format date for display
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Get date group label
function getDateGroup(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  if (dateOnly.getTime() === today.getTime()) {
    return 'Today';
  } else if (dateOnly.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else if (dateOnly > weekAgo) {
    return 'This Week';
  } else {
    return 'Earlier';
  }
}

// Group activities by date
function groupActivitiesByDate(
  activities: Activity[]
): Map<string, Activity[]> {
  const groups = new Map<string, Activity[]>();
  const groupOrder = ['Today', 'Yesterday', 'This Week', 'Earlier'];

  // Initialize groups in order
  groupOrder.forEach((group) => groups.set(group, []));

  activities.forEach((activity) => {
    const group = getDateGroup(activity.dueDate);
    const existing = groups.get(group) || [];
    existing.push(activity);
    groups.set(group, existing);
  });

  // Remove empty groups
  groupOrder.forEach((group) => {
    if (groups.get(group)?.length === 0) {
      groups.delete(group);
    }
  });

  return groups;
}

// Activity list item component
function ActivityItem({
  activity,
  onToggleComplete,
  onClick,
  toggling,
}: {
  activity: Activity;
  onToggleComplete: (id: string, isComplete: boolean) => void;
  onClick: (activity: Activity) => void;
  toggling: string | null;
}) {
  const Icon = typeIcons[activity.type];
  const isCompleted = activity.status === 'Completed';
  const isOverdue = activity.status === 'Overdue';
  const isToggling = toggling === activity.id;

  return (
    <div
      className={`flex items-center gap-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors ${
        isCompleted ? 'opacity-60' : ''
      } ${isOverdue ? 'bg-red-50 hover:bg-red-100' : ''}`}
      onClick={() => onClick(activity)}
    >
      {/* Type Icon */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[activity.type]}`}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3
            className={`font-medium text-gray-900 truncate ${
              isCompleted ? 'line-through' : ''
            }`}
          >
            {activity.subject}
          </h3>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <Badge color={relatedTypeColors[activity.relatedType]}>
            {activity.relatedType}
          </Badge>
          <span className="text-sm text-gray-500 truncate">
            {activity.relatedTo}
          </span>
        </div>
      </div>

      {/* Due Date */}
      <div className="flex-shrink-0 text-right">
        <p
          className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}
        >
          {formatDate(activity.dueDate)}
        </p>
        <Badge color={statusColors[activity.status]} className="mt-1">
          {activity.status}
        </Badge>
      </div>

      {/* Toggle Complete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleComplete(activity.id, isCompleted);
        }}
        disabled={isToggling}
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          isCompleted
            ? 'bg-green-100 text-green-600 hover:bg-green-200'
            : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
        } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
      >
        {isToggling ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isCompleted ? (
          <RotateCcw className="w-4 h-4" />
        ) : (
          <Check className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<ActivityType | ''>('');
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | ''>('');
  const [dateRangeFilter, setDateRangeFilter] = useState<
    'today' | 'this_week' | 'this_month' | 'all' | ''
  >('');
  const [toggling, setToggling] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const filters: ActivityFilters = {};
      if (typeFilter) filters.type = typeFilter;
      if (statusFilter) filters.status = statusFilter;
      if (dateRangeFilter) filters.dateRange = dateRangeFilter;

      const response = await getActivities(filters);
      setActivities(response);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, dateRangeFilter]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Handle toggle complete
  const handleToggleComplete = async (id: string, isCurrentlyComplete: boolean) => {
    setToggling(id);
    try {
      if (isCurrentlyComplete) {
        await markIncomplete(id);
      } else {
        await markComplete(id);
      }
      await fetchActivities();
    } catch (error) {
      console.error('Failed to toggle activity status:', error);
    } finally {
      setToggling(null);
    }
  };

  // Handle activity click
  const handleActivityClick = (activity: Activity) => {
    setEditingActivity(activity);
    setIsModalOpen(true);
  };

  // Handle add activity
  const handleAddActivity = () => {
    setEditingActivity(null);
    setIsModalOpen(true);
  };

  // Handle modal save
  const handleSave = () => {
    setIsModalOpen(false);
    setEditingActivity(null);
    fetchActivities();
  };

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingActivity(null);
  };

  // Filter options
  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'Call', label: 'Call' },
    { value: 'Email', label: 'Email' },
    { value: 'Meeting', label: 'Meeting' },
    { value: 'Task', label: 'Task' },
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Overdue', label: 'Overdue' },
  ];

  const dateRangeOptions = [
    { value: '', label: 'All Dates' },
    { value: 'today', label: 'Today' },
    { value: 'this_week', label: 'This Week' },
    { value: 'this_month', label: 'This Month' },
  ];

  // Group activities by date
  const groupedActivities = groupActivitiesByDate(activities);

  // Calculate stats
  const totalActivities = activities.length;
  const pendingCount = activities.filter((a) => a.status === 'Pending').length;
  const overdueCount = activities.filter((a) => a.status === 'Overdue').length;
  const completedCount = activities.filter((a) => a.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track your tasks, calls, emails, and meetings.
          </p>
        </div>
        <Button onClick={handleAddActivity}>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-semibold text-gray-900">{totalActivities}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-semibold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Overdue</p>
          <p className="text-2xl font-semibold text-red-600">{overdueCount}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-500">Completed</p>
          <p className="text-2xl font-semibold text-green-600">{completedCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-40">
          <Select
            options={typeOptions}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ActivityType | '')}
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ActivityStatus | '')}
          />
        </div>
        <div className="w-full sm:w-40">
          <Select
            options={dateRangeOptions}
            value={dateRangeFilter}
            onChange={(e) =>
              setDateRangeFilter(
                e.target.value as 'today' | 'this_week' | 'this_month' | 'all' | ''
              )
            }
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-500">Loading activities...</span>
          </div>
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <CheckSquare className="h-12 w-12" />
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              No activities found
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              {typeFilter || statusFilter || dateRangeFilter
                ? 'Try adjusting your filter criteria.'
                : 'Get started by adding your first activity.'}
            </p>
            {!typeFilter && !statusFilter && !dateRangeFilter && (
              <div className="mt-6">
                <Button onClick={handleAddActivity}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activity
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(groupedActivities.entries()).map(([group, groupActivities]) => (
            <div key={group}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {group}
              </h2>
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                {groupActivities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    onToggleComplete={handleToggleComplete}
                    onClick={handleActivityClick}
                    toggling={toggling}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Activity Modal */}
      <ActivityModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        activity={editingActivity}
      />
    </div>
  );
}
