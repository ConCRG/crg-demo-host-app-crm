import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuthStore, DEMO_ACCOUNTS } from '@/contexts/AuthContext';
import { useRoleStore } from '@/contexts/RoleContext';
import { ROLE_LABELS } from '@/contexts/RoleContext';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const setRole = useRoleStore((s) => s.setRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = (accountIndex: number) => {
    const { user } = DEMO_ACCOUNTS[accountIndex];
    login(user);
    setRole(user.role);
    navigate('/dashboard');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    await new Promise((r) => setTimeout(r, 400));

    const match = DEMO_ACCOUNTS.find(
      (a) => a.user.email === email.trim().toLowerCase() && a.password === password
    );

    if (match) {
      login(match.user);
      setRole(match.user.role);
      navigate('/dashboard');
    } else {
      setError('Invalid email or password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-background/10 border border-background/20 flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 44 20 A 17 17 0 1 0 44 44" stroke="white" strokeWidth="9" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="leading-tight">
            <span className="text-sm font-bold text-background tracking-tight block">Curo</span>
            <span className="text-xs text-background/50 tracking-tight block">PeopleOS</span>
          </div>
        </Link>

        <div>
          <p className="text-background/40 text-xs uppercase tracking-widest mb-3">Curo PeopleOS</p>
          <h2 className="text-3xl font-bold text-background leading-tight mb-4">
            Sales intelligence,<br />built different.
          </h2>
          <p className="text-background/60 text-base leading-relaxed mb-10">
            Manage your pipeline, track every contact, and make decisions backed by data — all from one workspace.
          </p>

          <div className="space-y-3">
            {DEMO_ACCOUNTS.map((a) => (
              <div
                key={a.user.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-background/10 bg-background/5"
              >
                <div className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center text-xs font-semibold text-background flex-shrink-0">
                  {a.user.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-background">{a.user.name}</p>
                  <p className="text-xs text-background/50">{ROLE_LABELS[a.user.role]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-background/30">
          &copy; {new Date().getFullYear()} Altrium &mdash; Curo PeopleOS. Demo environment.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <Link to="/" className="flex items-center gap-2.5 mb-10 lg:hidden">
          <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="h-4 w-4" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 44 20 A 17 17 0 1 0 44 44" stroke="white" strokeWidth="9" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="leading-tight">
            <span className="text-sm font-bold tracking-tight block">Curo</span>
            <span className="text-xs text-muted-foreground tracking-tight block">PeopleOS</span>
          </div>
        </Link>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to your account to continue.</p>
          </div>

          {/* Email / password form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-background px-3 text-xs text-muted-foreground">or try a demo account</span>
            </div>
          </div>

          {/* Demo accounts */}
          <div className="space-y-2.5">
            {DEMO_ACCOUNTS.map((account, index) => (
              <button
                key={account.user.id}
                onClick={() => handleAuth(index)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-left group"
              >
                <div className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center text-xs font-semibold text-background flex-shrink-0">
                  {account.user.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{account.user.name}</span>
                    <Badge className="text-xs bg-muted text-foreground border-border hover:bg-muted px-1.5 py-0">
                      {ROLE_LABELS[account.user.role]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{account.description}</p>
                </div>
              </button>
            ))}
          </div>

          <p className="text-xs text-muted-foreground text-center mt-8">
            Don't have an account?{' '}
            <Link to="/" className="underline underline-offset-2 hover:text-foreground transition-colors">
              Learn more
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
