import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowRight, Sparkles, ShieldCheck, BookOpenCheck } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!identifier || !password)
        throw new Error('Please fill all fields');

      // Backend role is empty by default so it searches INSTITUTE -> TEACHER -> STUDENT
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

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div className="relative h-screen overflow-hidden bg-[#f5f7ff] dark:bg-slate-950">
      <div className="pointer-events-none absolute -top-40 -left-24 h-96 w-96 rounded-full bg-[#ffb703]/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 right-0 h-[28rem] w-[28rem] rounded-full bg-[#4cc9f0]/30 blur-3xl" />

      <div className="relative grid h-screen grid-cols-1 lg:grid-cols-2">
        <section className="hidden h-screen lg:flex flex-col justify-between border-r border-slate-200/60 bg-gradient-to-br from-[#0f172a] via-[#14213d] to-[#1d3557] p-10 text-white">
          <div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-[#ffd166]" />
              Next Gen Learning Platform
            </div>
            <h1 className="mt-8 text-5xl font-black leading-tight tracking-tight">
              Modernistic
              <br />
              LMS Hub
            </h1>
            <p className="mt-5 max-w-lg text-base text-slate-200">
              One place to manage teaching, payments, attendance, and AI-powered learning workflows.
            </p>
          </div>

          <div className="mt-8 relative drop-shadow-2xl overflow-hidden rounded-xl border border-white/10">
            <img 
              src="/images/LMS1.png" 
              alt="LMS Overview" 
              className="w-full h-auto object-cover opacity-90 hover:opacity-100 transition-opacity duration-300" 
            />
          </div>
        </section>

        <section className="flex h-screen items-center justify-center overflow-hidden px-4 py-4 sm:px-6">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-2xl backdrop-blur-md sm:p-7 dark:border-slate-800 dark:bg-slate-900/90">
            <div className="mb-8 text-center sm:text-left">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r from-[#f97316] to-[#fb8500] text-white shadow-lg sm:mx-0">
                <Sparkles className="h-6 w-6" />
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Welcome Back</h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Sign in to continue to your learning workspace.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  placeholder="Enter your email"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-sm font-medium text-[#e76f51] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11"
                />
              </div>

              <Button type="submit" disabled={loading} className="h-11 w-full bg-gradient-to-r from-[#f97316] to-[#fb8500] text-base font-semibold text-white shadow-md hover:opacity-95">
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-[#e76f51] hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};
export default Login;

