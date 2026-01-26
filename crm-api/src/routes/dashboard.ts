import { Hono } from 'hono';
import { contactStore, companyStore, dealStore, activityStore } from '../db/store';
import type { DashboardStats, PipelineBreakdown, WinRateData, RecentDeal, UpcomingActivity, DealStage } from '../db/types';

const dashboard = new Hono();

// Stage labels and colors
const STAGE_CONFIG: Record<DealStage, { label: string; color: string }> = {
  'lead': { label: 'Lead', color: '#6B7280' },
  'qualified': { label: 'Qualified', color: '#3B82F6' },
  'proposal': { label: 'Proposal', color: '#8B5CF6' },
  'negotiation': { label: 'Negotiation', color: '#F59E0B' },
  'closed-won': { label: 'Closed Won', color: '#10B981' },
  'closed-lost': { label: 'Closed Lost', color: '#EF4444' },
};

// GET /stats - Get dashboard stats
dashboard.get('/stats', (c) => {
  const contacts = contactStore.getAll();
  const companies = companyStore.getAll();
  const deals = dealStore.getAll();

  // Active deals = not closed-won or closed-lost
  const activeDeals = deals.filter(d => d.stage !== 'closed-won' && d.stage !== 'closed-lost');
  const pipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);

  const stats: DashboardStats = {
    totalContacts: contacts.length,
    totalCompanies: companies.length,
    activeDeals: activeDeals.length,
    pipelineValue,
  };

  return c.json(stats);
});

// GET /pipeline - Get pipeline breakdown
dashboard.get('/pipeline', (c) => {
  const deals = dealStore.getAll();
  const stages: DealStage[] = ['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];

  const breakdown: PipelineBreakdown[] = stages.map(stage => {
    const stageDeals = deals.filter(d => d.stage === stage);
    return {
      stage,
      label: STAGE_CONFIG[stage].label,
      count: stageDeals.length,
      value: stageDeals.reduce((sum, d) => sum + d.value, 0),
      color: STAGE_CONFIG[stage].color,
    };
  });

  return c.json(breakdown);
});

// GET /win-rate - Get win rate data
dashboard.get('/win-rate', (c) => {
  const deals = dealStore.getAll();

  const wonDeals = deals.filter(d => d.stage === 'closed-won');
  const lostDeals = deals.filter(d => d.stage === 'closed-lost');

  const totalClosed = wonDeals.length + lostDeals.length;
  const winRate = totalClosed > 0 ? Math.round((wonDeals.length / totalClosed) * 100) : 0;

  const data: WinRateData = {
    winRate,
    wonDeals: wonDeals.length,
    lostDeals: lostDeals.length,
    wonValue: wonDeals.reduce((sum, d) => sum + d.value, 0),
    lostValue: lostDeals.reduce((sum, d) => sum + d.value, 0),
  };

  return c.json(data);
});

// GET /recent-deals - Get recent deals
dashboard.get('/recent-deals', (c) => {
  const limit = parseInt(c.req.query('limit') || '5', 10);
  const deals = dealStore.getAll();

  // Sort by createdAt descending and take top N
  const recentDeals: RecentDeal[] = deals
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
    .map(d => ({
      id: d.id,
      name: d.name,
      companyName: d.companyName,
      value: d.value,
      stage: d.stage,
    }));

  return c.json(recentDeals);
});

// GET /upcoming-activities - Get upcoming activities
dashboard.get('/upcoming-activities', (c) => {
  const limit = parseInt(c.req.query('limit') || '5', 10);
  const activities = activityStore.getAll();
  const today = new Date().toISOString().split('T')[0];

  // Filter to pending/overdue activities, sort by due date, take top N
  const upcomingActivities: UpcomingActivity[] = activities
    .filter(a => a.status !== 'Completed')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, limit)
    .map(a => ({
      id: a.id,
      type: a.type.toLowerCase(),
      subject: a.subject,
      contactName: a.relatedType === 'Contact' ? a.relatedTo : undefined,
      dueDate: a.dueDate,
    }));

  return c.json(upcomingActivities);
});

export default dashboard;
