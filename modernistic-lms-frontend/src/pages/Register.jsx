import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { GraduationCap, UserCog, ArrowRight } from 'lucide-react';
import { GridScan } from '@/components/GridScan';

const Register = () => {
  const navigate = useNavigate();
  const { registerStudent } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await registerStudent({ name, email, mobile, password, grade });
      toast.success('Account created! Please sign in to continue.');
      navigate('/login', { replace: true });
    } catch (err) {
      toast.error(err?.message ?? 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-slate-950">
      <div className="absolute inset-0 z-0 pointer-events-auto opacity-70">
        <GridScan 
          scanColor="#fb8500" 
          linesColor="#1e293b" 
          bloomIntensity={1.5} 
          scanOpacity={0.6}
        />
      </div>
      <div className="relative z-10 w-full max-w-md">
        <Card className="w-full shadow-2xl border border-slate-700/50 bg-white/90 backdrop-blur-xl dark:bg-slate-900/90">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center mb-2">
              <span className="text-xl font-bold tracking-tight">Modernistic LMS Hub</span>
            </div>
            <CardTitle className="text-2xl font-bold">Create Student Account</CardTitle>
          <p className="text-sm text-muted-foreground">
            Join Modernistic LMS and start learning today.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                placeholder="+94 77 123 4567"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Grade / Class (optional)</Label>
              <Input
                id="grade"
                placeholder="e.g. Grade 10 or Grade 11"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-sky-500 hover:bg-sky-600 text-white text-base shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? 'Creating account…' : 'Create Account'}
              {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>

            <p className="text-sm text-muted-foreground text-center pt-2">
              Already have an account?{' '}
              <Link className="text-primary hover:underline font-medium" to="/login">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default Register;

