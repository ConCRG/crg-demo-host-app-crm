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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
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

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStageBadgeClass(stage: string): string {
  const map: Record<string, string> = {
    lead: 'bg-muted text-foreground border-border hover:bg-muted',
    qualified: 'bg-muted text-foreground border-border hover:bg-muted',
    proposal: 'bg-muted text-foreground border-border hover:bg-muted',
    negotiation: 'bg-muted text-foreground border-border hover:bg-muted',
    'closed-won': 'bg-muted text-foreground border-border hover:bg-muted',
    'closed-lost': 'bg-muted text-foreground border-border hover:bg-muted',
  };
  return map[stage] ?? map.lead;
}

function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    lead: 'Lead',
    qualified: 'Qualified',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    'closed-won': 'Won',
    'closed-lost': 'Lost',
  };
  return labels[stage] ?? stage;
}

function ActivityIcon({ type }: { type: string }) {
  const cls = 'h-4 w-4';
  switch (type) {
    case 'call': return <Phone className={cls} />;
    case 'email': return <Mail className={cls} />;
    case 'meeting': return <Calendar className={cls} />;
    case 'task': return <CheckSquare className={cls} />;
    default: return <FileText className={cls} />;
  }
}

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
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-10 w-10 bg-muted rounded-lg" />
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-8 bg-muted rounded w-20" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2.5 bg-primary/10 rounded-lg text-primary">{icon}</div>
          {trend !== undefined && (
            <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
              {trend >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

interface PipelineChartProps {
  stages: PipelineStage[];
  loading?: boolean;
}

function PipelineChart({ stages, loading }: PipelineChartProps) {
  if (loading) {
    return (
      <div className="h-48 animate-pulse flex items-end gap-2">
        {[60, 80, 45, 70, 30].map((h, i) => (
          <div key={i} className="flex-1 bg-muted rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    );
  }

  const activeStages = stages.filter(
    (s) => s.stage !== 'closed-won' && s.stage !== 'closed-lost'
  );

  const chartData = activeStages.map((s) => ({
    name: s.label,
    value: s.value,
    count: s.count,
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value) => [typeof value === 'number' ? formatCurrency(value) : value, 'Value']}
          contentStyle={{
            background: 'var(--popover)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            fontSize: '12px',
          }}
        />
        <Bar dataKey="value" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface WinRateGaugeProps {
  data: WinRateData | null;
  loading?: boolean;
}

function WinRateGauge({ data, loading }: WinRateGaugeProps) {
  if (loading || !data) {
    return (
      <div className="flex flex-col items-center animate-pulse">
        <div className="w-36 h-36 bg-muted rounded-full mb-4" />
        <div className="h-5 bg-muted rounded w-28 mb-2" />
        <div className="h-4 bg-muted rounded w-20" />
      </div>
    );
  }

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (data.winRate / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-36 h-36 transform -rotate-90">
          <circle cx="72" cy="72" r="54" stroke="var(--muted)" strokeWidth="10" fill="none" />
          <circle
            cx="72"
            cy="72"
            r="54"
            stroke="var(--primary)"
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-foreground">{data.winRate}%</span>
          <span className="text-xs text-muted-foreground">Win Rate</span>
        </div>
      </div>

      <div className="mt-5 w-full grid grid-cols-2 gap-3 text-center">
        <div className="p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-xl font-bold text-foreground">{data.wonDeals}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Won Deals</p>
          <p className="text-sm font-medium text-foreground mt-1">{formatCurrency(data.wonValue)}</p>
        </div>
        <div className="p-3 bg-muted/50 rounded-lg border border-border">
          <p className="text-xl font-bold text-foreground">{data.lostDeals}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Lost Deals</p>
          <p className="text-sm font-medium text-foreground mt-1">{formatCurrency(data.lostValue)}</p>
        </div>
      </div>
    </div>
  );
}

interface RecentDealsListProps {
  deals: RecentDeal[];
  loading?: boolean;
}

function RecentDealsList({ deals, loading }: RecentDealsListProps) {
  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="space-y-1.5">
              <div className="h-4 bg-muted rounded w-36" />
              <div className="h-3 bg-muted rounded w-24" />
            </div>
            <div className="h-6 bg-muted rounded w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {deals.map((deal) => (
        <Link
          key={deal.id}
          to="/deals"
          className="flex items-center justify-between py-3 hover:bg-muted/50 -mx-2 px-2 rounded transition-colors"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground truncate">{deal.name}</p>
            <p className="text-xs text-muted-foreground">{deal.companyName}</p>
          </div>
          <div className="ml-4 flex items-center gap-3">
            <span className="text-sm font-medium text-foreground">{formatCurrency(deal.value)}</span>
            <Badge className={getStageBadgeClass(deal.stage)}>{getStageLabel(deal.stage)}</Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}

interface UpcomingActivitiesListProps {
  activities: UpcomingActivity[];
  loading?: boolean;
}

function UpcomingActivitiesList({ activities, loading }: UpcomingActivitiesListProps) {
  if (loading) {
    return (
      <div className="space-y-3 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-start gap-3 py-2">
            <div className="h-8 w-8 bg-muted rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 bg-muted rounded w-44" />
              <div className="h-3 bg-muted rounded w-28" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const typeColorMap: Record<string, string> = {
    call: 'bg-muted text-foreground',
    email: 'bg-muted text-foreground',
    meeting: 'bg-muted text-foreground',
    task: 'bg-muted text-foreground',
  };

  return (
    <div className="divide-y divide-border">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3 py-3">
          <div className={`p-2 rounded-lg flex-shrink-0 ${typeColorMap[activity.type] ?? 'bg-muted text-muted-foreground'}`}>
            <ActivityIcon type={activity.type} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{activity.subject}</p>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
              {activity.contactName && <span>{activity.contactName}</span>}
              {activity.contactName && activity.dueDate && <span>·</span>}
              {activity.dueDate && <span className="font-medium text-foreground">{formatDate(activity.dueDate)}</span>}
            </div>
          </div>
          <Badge variant="secondary" className="capitalize text-xs flex-shrink-0">
            {activity.type}
          </Badge>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pipeline, setPipeline] = useState<PipelineStage[]>([]);
  const [recentDeals, setRecentDeals] = useState<RecentDeal[]>([]);
  const [winRateData, setWinRateData] = useState<WinRateData | null>(null);
  const [activities, setActivities] = useState<UpcomingActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [statsData, pipelineData, dealsData, winData, activitiesData] = await Promise.all([
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
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of your sales pipeline and recent activity
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="Total Contacts"
          value={stats?.totalContacts ?? 0}
          loading={loading}
        />
        <StatCard
          icon={<Building2 className="h-5 w-5" />}
          label="Total Companies"
          value={stats?.totalCompanies ?? 0}
          loading={loading}
        />
        <StatCard
          icon={<Handshake className="h-5 w-5" />}
          label="Active Deals"
          value={stats?.activeDeals ?? 0}
          loading={loading}
        />
        <StatCard
          icon={<DollarSign className="h-5 w-5" />}
          label="Pipeline Value"
          value={stats ? formatCurrency(stats.pipelineValue) : '$0'}
          loading={loading}
        />
      </div>

      {/* Pipeline + Win Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Pipeline Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <PipelineChart stages={pipeline} loading={loading} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <WinRateGauge data={winRateData} loading={loading} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Deals + Upcoming Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Recent Deals</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentDealsList deals={recentDeals} loading={loading} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Upcoming Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <UpcomingActivitiesList activities={activities} loading={loading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
