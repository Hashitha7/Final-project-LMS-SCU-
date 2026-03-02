import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!identifier || !password)
        throw new Error('Please fill all fields');

      // Pass role so backend knows which table to look up
      await login({ identifier, password, role: selectedRole });

      toast.success('Login successful');
      navigate('/app/dashboard', { replace: true });
    }
    catch (err) {
      toast.error(err?.message ?? 'Sign in failed');
    }
    finally {
      setLoading(false);
    }
  };

  const [selectedRole, setSelectedRole] = useState('INSTITUTE');

  // Demo accounts matching the new advance_lms schema
  const demoUsers = [
    { id: 1, name: 'Modernistic LMS Institute', email: 'admin@modernisticlms.com', role: 'INSTITUTE' },
    { id: 2, name: 'Demo Teacher', email: 'teacher@modernisticlms.com', role: 'TEACHER' },
    { id: 3, name: 'Demo Student', email: 'student@modernisticlms.com', role: 'STUDENT' }
  ];

  return (<div className="min-h-screen w-full flex">
    {/* Left Side - Visuals */}
    <div className="hidden lg:flex w-1/2 bg-muted relative overflow-hidden items-center justify-center p-12">
      <div className="absolute inset-0 bg-primary/5 dark:bg-slate-900 border-r border-border/50">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background/50 to-background" />
      </div>

      <div className="relative z-10 max-w-lg space-y-8 text-foreground dark:text-slate-100">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg">E</div>
          <span className="text-2xl font-bold tracking-tight">Modernistic LMS Hub</span>
        </div>

        <div className="mt-8 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          <img
            src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"
            alt="Digital Learning"
            className="relative rounded-2xl shadow-2xl border border-white/10 object-cover w-full aspect-[4/3] transform transition duration-500 hover:scale-[1.02]"
          />
        </div>
      </div>
    </div>

    {/* Right Side - Login Form */}
    <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl font-bold tracking-tight">Sign in to your account</h2>
          <p className="text-muted-foreground mt-2">Enter your details below to access your dashboard.</p>
        </div>

        <div className="w-full space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" placeholder="name@school.edu" type="email" autoCapitalize="none" autoComplete="email" autoCorrect="off" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <Button onClick={onSubmit} disabled={loading} className="w-full h-11 gradient-primary text-primary-foreground text-base shadow-lg hover:shadow-xl transition-all">
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
          </Button>
        </div>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with demo accounts</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {demoUsers.map((u) => (<Button key={u.id} variant="outline" className="justify-between h-auto py-3 px-4 hover:border-primary/50 hover:bg-primary/5 transition-all group" onClick={() => {
            setIdentifier(u.email);
            setPassword('demo123');
            setSelectedRole(u.role);
          }}>
            <div className="flex flex-col items-start text-left">
              <span className="font-medium group-hover:text-primary transition-colors">{u.name}</span>
              <span className="text-xs text-muted-foreground">{u.email}</span>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground uppercase tracking-wide">
              {u.role}
            </span>
          </Button>))}
        </div>

        <p className="px-8 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="underline underline-offset-4 hover:text-primary font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  </div>);
};
export default Login;

