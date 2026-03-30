import { Link } from 'react-router-dom';
import {
  Users,
  BarChart3,
  Activity,
  ArrowRight,
  CheckCircle,
  Target,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Users,
    title: 'Contact Management',
    description:
      'Centralise every customer interaction. Search, filter, and track contacts alongside their full activity history.',
  },
  {
    icon: Target,
    title: 'Deal Pipeline',
    description:
      'Visualise your sales pipeline as a Kanban board. Drag deals between stages and forecast revenue at a glance.',
  },
  {
    icon: Activity,
    title: 'Activity Tracking',
    description:
      'Log calls, emails, meetings, and tasks. Stay on top of follow-ups with smart date grouping and status filters.',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description:
      'Deep-dive into pipeline health, win rates, and team performance with role-gated reporting dashboards.',
  },
];

const stats = [
  { value: '2,400+', label: 'Contacts managed' },
  { value: '$1.2M+', label: 'Pipeline tracked' },
  { value: '3 roles', label: 'Permission levels' },
];

const bullets = [
  'Role-based access control',
  'Real-time deal pipeline',
  'Activity & follow-up tracking',
  'Analytics and reporting',
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
              <svg viewBox="0 0 64 64" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 44 20 A 17 17 0 1 0 44 44" stroke="white" strokeWidth="9" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="leading-tight">
              <span className="text-sm font-bold tracking-tight block">Curo</span>
              <span className="text-xs text-muted-foreground tracking-tight block">PeopleOS</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/login">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-foreground text-background">
        <div className="max-w-6xl mx-auto px-6 py-24 md:py-36 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-background/20 text-xs text-background/70 mb-8">
              <Shield className="h-3 w-3" />
              Role-based access — Admin, Manager, Rep
            </div>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight mb-3">
              Curo PeopleOS
            </h1>
            <p className="text-background/50 text-sm uppercase tracking-widest mb-6">
              The CRM built for PeopleOS
            </p>
            <p className="text-background/70 text-lg leading-relaxed mb-10">
              Manage contacts, track deals, and close more business — all in one clean, fast workspace designed for the way your team actually works.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/login">
                <Button
                  size="lg"
                  className="bg-background text-foreground hover:bg-background/90 w-full sm:w-auto"
                >
                  Start free trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-background/30 text-background hover:bg-background/10 hover:text-background w-full sm:w-auto"
                >
                  Try demo accounts
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="rounded-2xl border border-background/10 bg-background/5 p-8 space-y-3">
              {bullets.map((b) => (
                <div key={b} className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-background/60 flex-shrink-0" />
                  <span className="text-sm text-background/80">{b}</span>
                </div>
              ))}
              <div className="pt-4 mt-4 border-t border-background/10 grid grid-cols-3 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="text-xl font-bold text-background">{s.value}</p>
                    <p className="text-xs text-background/50 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-background">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Features</p>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Everything you need to close deals faster
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A complete toolset built for sales teams — from first contact to closed won.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-foreground flex items-center justify-center mb-5">
                  <f.icon className="h-5 w-5 text-background" />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role section */}
      <section className="py-24 bg-muted/30 border-y border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Access Control</p>
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Built with role-based access in mind
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Every permission level sees exactly what they need — nothing more, nothing less.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                role: 'Admin',
                description: 'Complete control. Delete records, export data, manage settings, and access all reports.',
                perms: ['Full CRUD on all records', 'Export to CSV', 'View analytics & reports', 'Manage pipeline stages'],
              },
              {
                role: 'Sales Manager',
                description: 'Visibility and insight without destructive access. Drive the team with data.',
                perms: ['View all records', 'Export to CSV', 'Access reports', 'Monitor team activity'],
              },
              {
                role: 'Sales Rep',
                description: 'Focused on selling. Manage contacts, deals, and activities without noise.',
                perms: ['Manage own contacts & deals', 'Log activities', 'Track pipeline stages', 'Standard CRM access'],
              },
            ].map((r) => (
              <div key={r.role} className="rounded-xl border border-border bg-card p-6">
                <div className="inline-block px-2.5 py-1 rounded-md bg-foreground text-background text-xs font-medium mb-4">
                  {r.role}
                </div>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed">{r.description}</p>
                <ul className="space-y-2">
                  {r.perms.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-foreground">
                      <CheckCircle className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-foreground text-background py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Ready to take the wheel?
          </h2>
          <p className="text-background/70 text-lg mb-10 max-w-md mx-auto">
            Jump straight in with a demo account. No setup, no credit card.
          </p>
          <Link to="/login">
            <Button
              size="lg"
              className="bg-background text-foreground hover:bg-background/90"
            >
              Try a demo account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-background">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-foreground flex items-center justify-center">
              <svg viewBox="0 0 64 64" className="h-3 w-3" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 44 20 A 17 17 0 1 0 44 44" stroke="white" strokeWidth="10" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold">Curo</span>
            <span className="text-xs text-muted-foreground">PeopleOS</span>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Altrium &mdash; Curo PeopleOS. Built for demonstration purposes.
          </p>
        </div>
      </footer>
    </div>
  );
}
