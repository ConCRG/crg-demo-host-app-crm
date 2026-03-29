import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Building2,
  User,
  Calendar,
  DollarSign,
  TrendingUp,
  Phone as PhoneIcon,
  Mail as MailIcon,
  CalendarDays,
  CheckSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getDeal, moveDeal, DEAL_STAGES, type Deal } from '../../api/deals';
import { getActivities, type Activity } from '../../api/activities';
import DealModal, { type DealFormData } from '../../components/DealModal';
import { updateDeal } from '../../api/deals';

const stageBadgeClass: Record<string, string> = {
  lead: 'bg-muted text-foreground border-border hover:bg-muted',
  qualified: 'bg-muted text-foreground border-border hover:bg-muted',
  proposal: 'bg-muted text-foreground border-border hover:bg-muted',
  negotiation: 'bg-muted text-foreground border-border hover:bg-muted',
  'closed-won': 'bg-muted text-foreground border-border hover:bg-muted',
  'closed-lost': 'bg-muted text-foreground border-border hover:bg-muted',
};

const activityTypeIcons: Record<string, typeof PhoneIcon> = {
  Call: PhoneIcon,
  Email: MailIcon,
  Meeting: CalendarDays,
  Task: CheckSquare,
};

const activityTypeColors: Record<string, string> = {
  Call: 'bg-muted text-foreground',
  Email: 'bg-muted text-foreground',
  Meeting: 'bg-muted text-foreground',
  Task: 'bg-muted text-foreground',
};

const activityStatusBadgeClass: Record<string, string> = {
  Completed: 'bg-muted text-foreground border-border hover:bg-muted',
  Pending: 'bg-muted text-foreground border-border hover:bg-muted',
  Overdue: 'bg-muted text-foreground border-border hover:bg-muted',
};

const MOCK_COMPANIES = [
  { value: 'comp-001', label: 'Acme Corporation' },
  { value: 'comp-002', label: 'TechStart Inc' },
  { value: 'comp-003', label: 'Global Industries' },
  { value: 'comp-004', label: 'Creative Solutions Ltd' },
  { value: 'comp-005', label: 'DataDriven Co' },
];

const MOCK_CONTACTS = [
  { value: 'cont-001', label: 'John Smith' },
  { value: 'cont-002', label: 'Sarah Johnson' },
  { value: 'cont-003', label: 'Michael Chen' },
  { value: 'cont-004', label: 'Emily Davis' },
  { value: 'cont-005', label: 'Robert Wilson' },
];

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getStageLabel(stage: string): string {
  return stage.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [movingStage, setMovingStage] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [dealData, allActivities] = await Promise.all([
          getDeal(id),
          getActivities(),
        ]);
        setDeal(dealData);
        setActivities(allActivities.filter((a) => a.relatedType === 'Deal' && a.relatedId === id));
      } catch (err) {
        console.error('Failed to load deal:', err);
        navigate('/deals');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const handleStageChange = async (newStage: Deal['stage']) => {
    if (!deal || newStage === deal.stage) return;
    setMovingStage(true);
    try {
      const updated = await moveDeal(deal.id, newStage);
      setDeal(updated);
    } catch (err) {
      console.error('Failed to move deal:', err);
    } finally {
      setMovingStage(false);
    }
  };

  const handleSaveDeal = async (formData: DealFormData) => {
    if (!deal) return;
    try {
      const updated = await updateDeal(deal.id, formData);
      setDeal(updated);
    } catch (err) {
      console.error('Failed to update deal:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
        Loading deal...
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Deal not found.</p>
        <Button variant="link" asChild className="mt-2"><Link to="/deals">Back to Deals</Link></Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/deals">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Deals
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-foreground">{deal.name}</h1>
            <Badge className={stageBadgeClass[deal.stage]}>{getStageLabel(deal.stage)}</Badge>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1.5 text-lg font-semibold text-foreground">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              {formatCurrency(deal.value)}
            </span>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              {deal.probability}% probability
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Close: {formatDate(deal.expectedCloseDate)}
            </span>
          </div>
        </div>

        {/* Move Stage */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Select
            value={deal.stage}
            onValueChange={(v) => handleStageChange(v as Deal['stage'])}
            disabled={movingStage}
          >
            <SelectTrigger className="w-44 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DEAL_STAGES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button size="sm" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activities">
            Activities
            {activities.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs px-1.5">{activities.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Deal Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Contact</p>
                    <p className="font-medium text-foreground">{deal.contactName || '—'}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Company</p>
                    <p className="font-medium text-foreground">{deal.companyName || '—'}</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="font-medium text-foreground">{formatDate(deal.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Stage History</CardTitle>
              </CardHeader>
              <CardContent>
                {deal.stageHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No stage changes recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {deal.stageHistory.map((entry, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <Badge className={stageBadgeClass[entry.stage as Deal['stage']] ?? 'bg-muted text-foreground border-border'}>
                          {getStageLabel(entry.stage)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{formatDate(entry.date)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Activities */}
        <TabsContent value="activities" className="mt-6">
          {activities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No activities linked to this deal.</div>
          ) : (
            <div className="rounded-md border bg-card overflow-hidden">
              {activities.map((activity, idx) => {
                const Icon = activityTypeIcons[activity.type] ?? CheckSquare;
                return (
                  <div key={activity.id} className={`flex items-center gap-4 p-4 ${idx < activities.length - 1 ? 'border-b border-border' : ''}`}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${activityTypeColors[activity.type] ?? 'bg-muted text-muted-foreground'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium text-foreground ${activity.status === 'Completed' ? 'line-through opacity-60' : ''}`}>
                        {activity.subject}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatDate(activity.dueDate)}</p>
                    </div>
                    <Badge className={activityStatusBadgeClass[activity.status]}>{activity.status}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <DealModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveDeal}
        deal={deal}
        companies={MOCK_COMPANIES}
        contacts={MOCK_CONTACTS}
      />
    </div>
  );
}
