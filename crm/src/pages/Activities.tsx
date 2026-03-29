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
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const typeIcons: Record<ActivityType, typeof Phone> = {
  Call: Phone,
  Email: Mail,
  Meeting: Calendar,
  Task: CheckSquare,
};

const typeColors: Record<ActivityType, string> = {
  Call: 'bg-muted text-foreground',
  Email: 'bg-muted text-foreground',
  Meeting: 'bg-muted text-foreground',
  Task: 'bg-muted text-foreground',
};

const statusBadgeClass: Record<ActivityStatus, string> = {
  Completed: 'bg-muted text-foreground border-border hover:bg-muted',
  Pending: 'bg-muted text-foreground border-border hover:bg-muted',
  Overdue: 'bg-muted text-foreground border-border hover:bg-muted',
};

const relatedTypeBadgeClass: Record<string, string> = {
  Contact: 'bg-muted text-foreground border-border hover:bg-muted',
  Deal: 'bg-muted text-foreground border-border hover:bg-muted',
  Company: 'bg-muted text-foreground border-border hover:bg-muted',
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

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

  if (dateOnly.getTime() === today.getTime()) return 'Today';
  if (dateOnly.getTime() === yesterday.getTime()) return 'Yesterday';
  if (dateOnly > weekAgo) return 'This Week';
  return 'Earlier';
}

function groupActivitiesByDate(activities: Activity[]): Map<string, Activity[]> {
  const groups = new Map<string, Activity[]>();
  ['Today', 'Yesterday', 'This Week', 'Earlier'].forEach((g) => groups.set(g, []));
  activities.forEach((a) => {
    const group = getDateGroup(a.dueDate);
    groups.set(group, [...(groups.get(group) ?? []), a]);
  });
  ['Today', 'Yesterday', 'This Week', 'Earlier'].forEach((g) => {
    if (groups.get(g)?.length === 0) groups.delete(g);
  });
  return groups;
}

interface ActivityItemProps {
  activity: Activity;
  onToggleComplete: (id: string, isComplete: boolean) => void;
  onClick: (activity: Activity) => void;
  toggling: string | null;
}

function ActivityItem({ activity, onToggleComplete, onClick, toggling }: ActivityItemProps) {
  const Icon = typeIcons[activity.type];
  const isCompleted = activity.status === 'Completed';
  const isOverdue = activity.status === 'Overdue';
  const isToggling = toggling === activity.id;

  return (
    <div
      className={`flex items-center gap-4 p-4 border-b border-border last:border-b-0 cursor-pointer transition-colors ${
        isCompleted ? 'opacity-60' : ''
      } hover:bg-muted/50`}
      onClick={() => onClick(activity)}
    >
      <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${typeColors[activity.type]}`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className={`text-sm font-medium text-foreground truncate ${isCompleted ? 'line-through' : ''}`}>
          {activity.subject}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <Badge className={`${relatedTypeBadgeClass[activity.relatedType]} text-xs`}>
            {activity.relatedType}
          </Badge>
          <span className="text-xs text-muted-foreground truncate">{activity.relatedTo}</span>
        </div>
      </div>

      <div className="flex-shrink-0 text-right">
        <p className={`text-xs ${isOverdue ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
          {formatDate(activity.dueDate)}
        </p>
        <Badge className={`${statusBadgeClass[activity.status]} text-xs mt-1`}>
          {activity.status}
        </Badge>
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onToggleComplete(activity.id, isCompleted); }}
        disabled={isToggling}
        title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          isCompleted
            ? 'bg-muted text-foreground hover:bg-muted/80'
            : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
        } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isToggling ? (
          <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : isCompleted ? (
          <RotateCcw className="w-3.5 h-3.5" />
        ) : (
          <Check className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<ActivityStatus | 'all'>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<'today' | 'this_week' | 'this_month' | 'all'>('all');
  const [toggling, setToggling] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const filters: ActivityFilters = {};
      if (typeFilter !== 'all') filters.type = typeFilter;
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (dateRangeFilter !== 'all') filters.dateRange = dateRangeFilter;
      const response = await getActivities(filters);
      setActivities(response);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, dateRangeFilter]);

  useEffect(() => { fetchActivities(); }, [fetchActivities]);

  const handleToggleComplete = async (id: string, isCurrentlyComplete: boolean) => {
    setToggling(id);
    try {
      if (isCurrentlyComplete) await markIncomplete(id);
      else await markComplete(id);
      await fetchActivities();
    } catch (err) {
      console.error('Failed to toggle activity:', err);
    } finally {
      setToggling(null);
    }
  };

  const groupedActivities = groupActivitiesByDate(activities);
  const totalActivities = activities.length;
  const pendingCount = activities.filter((a) => a.status === 'Pending').length;
  const overdueCount = activities.filter((a) => a.status === 'Overdue').length;
  const completedCount = activities.filter((a) => a.status === 'Completed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Activities</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track your tasks, calls, emails, and meetings.</p>
        </div>
        <Button onClick={() => { setEditingActivity(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: totalActivities, cls: 'text-foreground' },
          { label: 'Pending', value: pendingCount, cls: 'text-foreground' },
          { label: 'Overdue', value: overdueCount, cls: 'text-foreground' },
          { label: 'Completed', value: completedCount, cls: 'text-foreground' },
        ].map(({ label, value, cls }) => (
          <Card key={label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className={`text-2xl font-semibold mt-1 ${cls}`}>{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ActivityType | 'all')}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Call">Call</SelectItem>
            <SelectItem value="Email">Email</SelectItem>
            <SelectItem value="Meeting">Meeting</SelectItem>
            <SelectItem value="Task">Task</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as ActivityStatus | 'all')}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
            <SelectItem value="Overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateRangeFilter} onValueChange={(v) => setDateRangeFilter(v as typeof dateRangeFilter)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All Dates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Dates</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity list */}
      {loading ? (
        <div className="rounded-md border bg-card flex items-center justify-center py-16 text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
          Loading activities...
        </div>
      ) : activities.length === 0 ? (
        <div className="rounded-md border bg-card py-16 text-center">
          <CheckSquare className="mx-auto h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-foreground">No activities found</p>
          <p className="text-sm text-muted-foreground mt-1">
            {typeFilter !== 'all' || statusFilter !== 'all' || dateRangeFilter !== 'all'
              ? 'Try adjusting your filter criteria.'
              : 'Get started by adding your first activity.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Array.from(groupedActivities.entries()).map(([group, groupActivities]) => (
            <div key={group}>
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {group}
              </h2>
              <div className="rounded-md border bg-card overflow-hidden">
                {groupActivities.map((activity) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    onToggleComplete={handleToggleComplete}
                    onClick={(a) => { setEditingActivity(a); setIsModalOpen(true); }}
                    toggling={toggling}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <ActivityModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingActivity(null); }}
        onSave={() => { setIsModalOpen(false); setEditingActivity(null); fetchActivities(); }}
        activity={editingActivity}
      />
    </div>
  );
}
