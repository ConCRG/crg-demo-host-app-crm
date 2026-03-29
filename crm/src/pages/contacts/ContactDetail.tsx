import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Edit,
  Phone as PhoneIcon,
  Mail as MailIcon,
  CalendarDays,
  CheckSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { getContact, type ContactWithDetails } from '../../api/contacts';
import { getDeals, type Deal } from '../../api/deals';
import { getActivities, type Activity } from '../../api/activities';
import ContactModal from '../../components/ContactModal';

const statusBadgeClass: Record<string, string> = {
  active: 'bg-muted text-foreground border-border hover:bg-muted',
  lead: 'bg-muted text-foreground border-border hover:bg-muted',
  inactive: 'bg-muted text-foreground border-border hover:bg-muted',
};

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

const statusBadgeActivityClass: Record<string, string> = {
  Completed: 'bg-muted text-foreground border-border hover:bg-muted',
  Pending: 'bg-muted text-foreground border-border hover:bg-muted',
  Overdue: 'bg-muted text-foreground border-border hover:bg-muted',
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);
}

function formatDate(dateString?: string): string {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const [contact, setContact] = useState<ContactWithDetails | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [contactData, allDeals, allActivities] = await Promise.all([
          getContact(id),
          getDeals(),
          getActivities(),
        ]);
        setContact(contactData);
        setDeals(allDeals.filter((d) => d.contactId === id));
        setActivities(allActivities.filter((a) => a.relatedType === 'Contact' && a.relatedId === id));
      } catch (err) {
        console.error('Failed to load contact detail:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3" />
        Loading contact...
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Contact not found.</p>
        <Button variant="link" asChild className="mt-2"><Link to="/contacts">Back to Contacts</Link></Button>
      </div>
    );
  }

  const initials = `${contact.firstName[0]}${contact.lastName[0]}`.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link to="/contacts">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Contacts
        </Link>
      </Button>

      {/* Header */}
      <div className="flex items-start gap-5">
        <Avatar className="h-16 w-16 flex-shrink-0">
          <AvatarFallback className="text-xl bg-primary text-primary-foreground">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold text-foreground">
              {contact.firstName} {contact.lastName}
            </h1>
            <Badge className={statusBadgeClass[contact.status]}>
              {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 mt-1.5 text-sm text-muted-foreground flex-wrap">
            {contact.jobTitle && (
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" />
                {contact.jobTitle}
              </span>
            )}
            {contact.company && (
              <span className="flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5" />
                {contact.company}
              </span>
            )}
          </div>
        </div>
        <Button size="sm" onClick={() => setIsEditModalOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deals">
            Deals
            {deals.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs px-1.5">{deals.length}</Badge>
            )}
          </TabsTrigger>
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
                <CardTitle className="text-sm font-semibold">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-foreground">{contact.email}</span>
                </div>
                {contact.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground">{contact.phone}</span>
                  </div>
                )}
                {contact.company && (
                  <div className="flex items-center gap-3">
                    <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground">{contact.company}</span>
                  </div>
                )}
                {contact.jobTitle && (
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground">{contact.jobTitle}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Activity Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-semibold text-foreground">{deals.length}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Active Deals</p>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-semibold text-foreground">{activities.length}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Activities</p>
                  </div>
                </div>
                {contact.lastActivity && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Last activity: {formatDate(contact.lastActivity)}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Deals */}
        <TabsContent value="deals" className="mt-6">
          {deals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No deals linked to this contact.</div>
          ) : (
            <div className="space-y-3">
              {deals.map((deal) => (
                <Card key={deal.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <Link
                          to={`/deals/${deal.id}`}
                          className="text-sm font-medium text-foreground hover:underline"
                        >
                          {deal.name}
                        </Link>
                        <p className="text-xs text-muted-foreground mt-0.5">{deal.companyName}</p>
                      </div>
                      <div className="flex items-center gap-3 ml-4">
                        <span className="text-sm font-semibold text-foreground">{formatCurrency(deal.value)}</span>
                        <Badge className={stageBadgeClass[deal.stage]}>
                          {deal.stage.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </Badge>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Close date: {formatDate(deal.expectedCloseDate)}</span>
                      <span>Probability: {deal.probability}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Activities */}
        <TabsContent value="activities" className="mt-6">
          {activities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">No activities linked to this contact.</div>
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
                    <Badge className={statusBadgeActivityClass[activity.status]}>{activity.status}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <ContactModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={() => {
          setIsEditModalOpen(false);
          if (id) getContact(id).then((c) => { if (c) setContact(c); });
        }}
        contact={contact}
      />
    </div>
  );
}
