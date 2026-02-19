import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, BookOpen, GraduationCap, ShieldCheck } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('email');
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
    { id: 1, name: 'EduSpark Institute', email: 'admin@eduspark.com', role: 'INSTITUTE' },
    { id: 2, name: 'Demo Teacher', email: 'teacher@eduspark.com', role: 'TEACHER' },
    { id: 3, name: 'Demo Student', email: 'student@eduspark.com', role: 'STUDENT' }
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
          <span className="text-2xl font-bold tracking-tight">EduSpark Hub</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
          Empowering Education <br />
          <span className="text-primary">Through Innovation.</span>
        </h1>

        <p className="text-lg text-muted-foreground dark:text-slate-300">
          Seamlessly manage courses, exams, and students with our comprehensive learning management system designed for the modern era.
        </p>

        <div className="space-y-4 pt-4">
          {[
            { icon: BookOpen, text: 'Comprehensive Course Management' },
            { icon: ShieldCheck, text: 'Secure Exam Environment' },
            { icon: GraduationCap, text: 'Student Performance Tracking' },
          ].map((item, i) => (<div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-card/50 dark:bg-white/5 backdrop-blur border border-border dark:border-white/10 hover:bg-card dark:hover:bg-white/10 transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary-foreground">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <span className="font-medium text-foreground dark:text-slate-200">{item.text}</span>
          </div>))}
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

        <Tabs defaultValue="email" className="w-full" onValueChange={(v) => setMode(v)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="mobile">Mobile Number</TabsTrigger>
          </TabsList>

          <TabsContent value="email" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" placeholder="name@school.edu" type="email" autoCapitalize="none" autoComplete="email" autoCorrect="off" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
            </div>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input id="mobile" placeholder="+1 (555) 000-0000" type="tel" autoComplete="tel" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
            </div>
          </TabsContent>

          <div className="space-y-4 mt-4">
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
        </Tabs>

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
            setMode('email');
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
