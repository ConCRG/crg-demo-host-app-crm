import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useCanViewReports } from '@/contexts/RoleContext';
import { getDeals, type Deal } from '../api/deals';
import { getActivities, type Activity } from '../api/activities';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

const CHART_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--muted-foreground)',
];

const STAGE_LABELS: Record<string, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  'closed-won': 'Won',
  'closed-lost': 'Lost',
};

function tooltipStyle() {
  return {
    background: 'var(--popover)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontSize: '12px',
    color: 'var(--foreground)',
  };
}

interface ReportData {
  pipelineByStage: { stage: string; count: number; value: number }[];
  closedThisMonth: { count: number; value: number };
  topContactsByDealValue: { name: string; value: number }[];
  activitiesByType: { type: string; count: number }[];
}

async function buildReportData(
  deals: Deal[],
  activities: Activity[],
  _contacts: unknown[]
): Promise<ReportData> {
  // Pipeline by stage
  const stageMap: Record<string, { count: number; value: number }> = {};
  deals.forEach((d) => {
    if (!stageMap[d.stage]) stageMap[d.stage] = { count: 0, value: 0 };
    stageMap[d.stage].count += 1;
    stageMap[d.stage].value += d.value;
  });
  const pipelineByStage = Object.entries(stageMap).map(([stage, data]) => ({
    stage: STAGE_LABELS[stage] ?? stage,
    ...data,
  }));

  // Closed won this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const closedWon = deals.filter(
    (d) =>
      d.stage === 'closed-won' &&
      new Date(d.expectedCloseDate) >= startOfMonth
  );
  const closedThisMonth = {
    count: closedWon.length,
    value: closedWon.reduce((sum, d) => sum + d.value, 0),
  };

  // Top 5 contacts by deal value
  const contactDealMap: Record<string, number> = {};
  deals.forEach((d) => {
    if (d.contactId && d.contactName) {
      contactDealMap[d.contactName] = (contactDealMap[d.contactName] ?? 0) + d.value;
    }
  });
  const topContactsByDealValue = Object.entries(contactDealMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));

  // Activities by type
  const typeMap: Record<string, number> = {};
  activities.forEach((a) => {
    typeMap[a.type] = (typeMap[a.type] ?? 0) + 1;
  });
  const activitiesByType = Object.entries(typeMap).map(([type, count]) => ({ type, count }));

  return { pipelineByStage, closedThisMonth, topContactsByDealValue, activitiesByType };
}

export default function Reports() {
  const navigate = useNavigate();
  const canViewReports = useCanViewReports();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  // Redirect if not authorized
  useEffect(() => {
    if (!canViewReports) {
      navigate('/', { replace: true });
    }
  }, [canViewReports, navigate]);

  useEffect(() => {
    if (!canViewReports) return;
    const load = async () => {
      setLoading(true);
      try {
        const [deals, activities] = await Promise.all([
          getDeals(),
          getActivities(),
        ]);
        const reportData = await buildReportData(deals, activities, []);
        setData(reportData);
      } catch (err) {
        console.error('Failed to load report data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [canViewReports]);

  if (!canViewReports) return null;

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
        Loading reports...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Analytics and insights for your sales pipeline</p>
      </div>

      {/* Closed this month — KPI card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Deals Closed This Month</p>
            <p className="text-3xl font-bold text-foreground mt-1">{data.closedThisMonth.count}</p>
            <p className="text-sm text-foreground font-medium mt-0.5">
              {formatCurrency(data.closedThisMonth.value)} won
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Total Activities Logged</p>
            <p className="text-3xl font-bold text-foreground mt-1">
              {data.activitiesByType.reduce((sum, a) => sum + a.count, 0)}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {data.activitiesByType.length} types tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart row 1: Pipeline by stage + Activities by type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Pipeline by Stage</CardTitle>
            <CardDescription className="text-xs">Deal count and value per stage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.pipelineByStage} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v: number) => `${v}`}
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value, name) => [
                    name === 'value' && typeof value === 'number' ? formatCurrency(value) : value,
                    name === 'value' ? 'Value' : 'Count',
                  ]}
                  contentStyle={tooltipStyle()}
                />
                <Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} name="count" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Activities by Type</CardTitle>
            <CardDescription className="text-xs">Distribution of logged activities</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={data.activitiesByType}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={3}
                >
                  {data.activitiesByType.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle()} />
                <Legend
                  formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Chart row 2: Pipeline value by stage + Top contacts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Pipeline Value by Stage</CardTitle>
            <CardDescription className="text-xs">Total deal value per stage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.pipelineByStage} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                <XAxis
                  dataKey="stage"
                  tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
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
                  contentStyle={tooltipStyle()}
                />
                <Bar dataKey="value" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Contacts by Deal Value</CardTitle>
            <CardDescription className="text-xs">Contacts with highest associated deal value</CardDescription>
          </CardHeader>
          <CardContent>
            {data.topContactsByDealValue.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-muted-foreground text-sm">
                No contact-linked deals found.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={data.topContactsByDealValue}
                  layout="vertical"
                  margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} className="stroke-border" />
                  <XAxis
                    type="number"
                    tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value) => [typeof value === 'number' ? formatCurrency(value) : value, 'Value']}
                    contentStyle={tooltipStyle()}
                  />
                  <Bar dataKey="value" fill="var(--chart-4)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
