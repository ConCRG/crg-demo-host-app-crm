import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Handshake,
  DollarSign,
  Phone,
  Mail,
  Calendar,
  CheckSquare,
  FileText,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import Card from '../components/Card';
import Badge from '../components/Badge';
import {
  getStats,
  getPipelineBreakdown,
  getRecentDeals,
  getWinRate,
  getUpcomingActivities,
  type DashboardStats,
  type PipelineStage,
  type RecentDeal,
  type WinRateData,
  type UpcomingActivity,
} from '../api/dashboard';

// Format currency
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Format date
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// Get badge color for deal stage
function getStageBadgeColor(
  stage: string
): 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'purple' {
  const colorMap: Record<string, 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'purple'> = {
    lead: 'gray',
    qualified: 'blue',
    proposal: 'yellow',
    negotiation: 'purple',
    'closed-won': 'green',
    'closed-lost': 'red',
  };
  return colorMap[stage] || 'gray';
}

// Get stage display label
function getStageLabel(stage: string): string {
  const labelMap: Record<string, string> = {
    lead: 'Lead',
    qualified: 'Qualified',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    'closed-won': 'Won',
    'closed-lost': 'Lost',
  };
  return labelMap[stage] || stage;
}

// Get activity icon
function ActivityIcon({ type }: { type: string }) {
  const iconClass = 'h-4 w-4';
  switch (type) {
    case 'call':
      return <Phone className={iconClass} />;
    case 'email':
      return <Mail className={iconClass} />;
    case 'meeting':
      return <Calendar className={iconClass} />;
    case 'task':
      return <CheckSquare className={iconClass} />;
    default:
      return <FileText className={iconClass} />;
  }
}

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: number;
  loading?: boolean;
}

function StatCard({ icon, label, value, trend, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-10 w-10 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="p-2 bg-blue-50 rounded-lg">{icon}</div>
        {trend !== undefined && (
          <div
            className={`flex items-center text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {trend >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="mt-4 text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

// Pipeline Bar Component
interface PipelineBarProps {
  stages: PipelineStage[];
  loading?: boolean;
}

function PipelineChart({ stages, loading }: PipelineBarProps) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // Filter out closed stages for the pipeline chart (only show active pipeline)
  const activeStages = stages.filter(
    (s) => s.stage !== 'closed-won' && s.stage !== 'closed-lost'
  );
  const maxValue = Math.max(...activeStages.map((s) => s.value), 1);

  return (
    <div className="space-y-4">
      {activeStages.map((stage) => {
        const widthPercent = (stage.value / maxValue) * 100;
        return (
          <div key={stage.stage}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">
                {stage.label} ({stage.count})
              </span>
              <span className="text-sm font-medium text-gray-900">
                {formatCurrency(stage.value)}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
              <div
                className="h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{
                  width: `${Math.max(widthPercent, 2)}%`,
                  backgroundColor: stage.color,
                }}
              >
                {widthPercent > 15 && (
                  <span className="text-xs font-medium text-white">
                    {Math.round(widthPercent)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Win Rate Gauge Component
interface WinRateGaugeProps {
  data: WinRateData | null;
  loading?: boolean;
}

function WinRateGauge({ data, loading }: WinRateGaugeProps) {
  if (loading || !data) {
    return (
      <div className="flex flex-col items-center animate-pulse">
        <div className="w-40 h-40 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </div>
    );
  }

  const circumference = 2 * Math.PI * 58; // radius of 58
  const offset = circumference - (data.winRate / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* Circular Progress */}
      <div className="relative w-40 h-40">
        <svg className="w-40 h-40 transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="80"
            cy="80"
            r="58"
            stroke="#e5e7eb"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="80"
            cy="80"
            r="58"
            stroke="#22c55e"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{data.winRate}%</span>
          <span className="text-sm text-gray-500">Win Rate</span>
        </div>
      </div>

      {/* Stats below */}
      <div className="mt-6 w-full grid grid-cols-2 gap-4 text-center">
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-700">{data.wonDeals}</p>
          <p className="text-xs text-green-600">Won Deals</p>
          <p className="text-sm font-medium text-green-700 mt-1">
            {formatCurrency(data.wonValue)}
          </p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-700">{data.lostDeals}</p>
          <p className="text-xs text-red-600">Lost Deals</p>
          <p className="text-sm font-medium text-red-700 mt-1">
            {formatCurrency(data.lostValue)}
          </p>
        </div>
      </div>
    </div>
  );
}

// Recent Deals List Component
interface RecentDealsListProps {
  deals: RecentDeal[];
  loading?: boolean;
}

function RecentDealsList({ deals, loading }: RecentDealsListProps) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {deals.map((deal) => (
        <Link
          key={deal.id}
          to="/deals"
          className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">{deal.name}</p>
            <p className="text-xs text-gray-500">{deal.companyName}</p>
          </div>
          <div className="ml-4 flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(deal.value)}
            </span>
            <Badge color={getStageBadgeColor(deal.stage)}>{getStageLabel(deal.stage)}</Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}

// Upcoming Activities List Component
interface UpcomingActivitiesListProps {
  activities: UpcomingActivity[];
  loading?: boolean;
}

function UpcomingActivitiesList({ activities, loading }: UpcomingActivitiesListProps) {
  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start space-x-3 py-3 border-b border-gray-100">
            <div className="h-8 w-8 bg-gray-200 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start space-x-3 py-3">
          <div
            className={`p-2 rounded-lg ${
              activity.type === 'call'
                ? 'bg-blue-50 text-blue-600'
                : activity.type === 'email'
                  ? 'bg-green-50 text-green-600'
                  : activity.type === 'meeting'
                    ? 'bg-purple-50 text-purple-600'
                    : 'bg-gray-50 text-gray-600'
            }`}
          >
            <ActivityIcon type={activity.type} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">{activity.subject}</p>
            <div className="flex items-center mt-1 space-x-2 text-xs text-gray-500">
              {activity.contactName && <span>{activity.contactName}</span>}
              {activity.contactName && activity.dueDate && <span>-</span>}
              {activity.dueDate && (
                <span className="font-medium text-gray-700">
                  {formatDate(activity.dueDate)}
                </span>
              )}
            </div>
          </div>
          <Badge
            color={activity.type === 'call' ? 'blue' : activity.type === 'meeting' ? 'purple' : 'gray'}
          >
            {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
          </Badge>
        </div>
      ))}
    </div>
  );
}

// Main Dashboard Component
export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [recentDeals, setRecentDeals] = useState<RecentDeal[]>([]);
  const [winRateData, setWinRateData] = useState<WinRateData | null>(null);
  const [activities, setActivities] = useState<UpcomingActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true);
      try {
        const [statsData, pipelineData, dealsData, winData, activitiesData] =
          await Promise.all([
            getStats(),
            getPipelineBreakdown(),
            getRecentDeals(5),
            getWinRate(),
            getUpcomingActivities(5),
          ]);

        setStats(statsData);
        setPipeline(pipelineData);
        setRecentDeals(dealsData);
        setWinRateData(winData);
        setActivities(activitiesData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your sales pipeline and recent activity
        </p>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="h-6 w-6 text-blue-600" />}
          label="Total Contacts"
          value={stats?.totalContacts ?? 0}
          loading={loading}
        />
        <StatCard
          icon={<Building2 className="h-6 w-6 text-blue-600" />}
          label="Total Companies"
          value={stats?.totalCompanies ?? 0}
          loading={loading}
        />
        <StatCard
          icon={<Handshake className="h-6 w-6 text-blue-600" />}
          label="Active Deals"
          value={stats?.activeDeals ?? 0}
          loading={loading}
        />
        <StatCard
          icon={<DollarSign className="h-6 w-6 text-blue-600" />}
          label="Pipeline Value"
          value={stats ? formatCurrency(stats.pipelineValue) : '$0'}
          loading={loading}
        />
      </div>

      {/* Row 2: Pipeline Overview & Win Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card title="Pipeline Overview">
            <PipelineChart stages={pipeline} loading={loading} />
          </Card>
        </div>
        <div>
          <Card title="Win Rate">
            <WinRateGauge data={winRateData} loading={loading} />
          </Card>
        </div>
      </div>

      {/* Row 3: Recent Deals & Upcoming Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Deals">
          <RecentDealsList deals={recentDeals} loading={loading} />
        </Card>
        <Card title="Upcoming Activities">
          <UpcomingActivitiesList activities={activities} loading={loading} />
        </Card>
      </div>
    </div>
  );
}
