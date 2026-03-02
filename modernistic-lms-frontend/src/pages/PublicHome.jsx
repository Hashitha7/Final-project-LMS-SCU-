import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Award, BarChart3, CreditCard, Video, CheckCircle2, ArrowRight } from 'lucide-react';
const PublicHome = () => {
  return (<div className="min-h-screen bg-background flex flex-col">
    {/* Navigation */}
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold">
            E
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">Modernistic LMS Hub</span>
        </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Testimonials</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </nav>
          <div className="flex gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild size="sm" className="gradient-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>

    <main className="flex-1">
      {/* Hero Section */}
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 -z-20">
          <img
            src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop"
            alt="Background"
            className="w-full h-full object-cover opacity-20 dark:opacity-10"
          />
        </div>

        {/* Gradient Overlay for professional look */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background -z-10" />

        <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">
          <Badge variant="outline" className="mb-6 py-1.5 px-4 rounded-full border-primary/20 bg-primary/10 text-primary animate-in fade-in slide-in-from-bottom-4 duration-500 backdrop-blur-sm">
            <span className="font-semibold mr-1">New</span> Mobile-first student experience
          </Badge>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Transform Your <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">Teaching Experience</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            A comprehensive Learning Management System designed for modern education.
            Streamline administration, engage students, and grow your institution.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Button asChild size="lg" className="h-12 px-8 text-lg gradient-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all rounded-full hover:scale-105 active:scale-95">
              <Link to="/register">Start Free Trial <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-lg rounded-full backdrop-blur-sm bg-background/50 border-primary/20 hover:bg-background/80">
              <Link to="/login">View Demo</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-10 border-t border-border/50 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500 bg-background/40 backdrop-blur-md rounded-2xl p-6 shadow-sm border border-white/10">
            {[
              { label: 'Active Users', value: '10k+' },
              { label: 'Courses Created', value: '2.5k+' },
              { label: 'Exams Taken', value: '50k+' },
              { label: 'Uptime', value: '99.9%' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Everything you need to teach</h2>
            <p className="text-muted-foreground text-lg">
              Powerful tools for Admins, Teachers, and Students, all in one unified platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'Course Management',
                desc: 'Create rich courses with video lessons, PDFs, and structured modules. Organize by grade and subject.'
              },
              {
                icon: Award,
                title: 'Smart Exams',
                desc: 'Run secure MCQ and Essay exams with shuffle, timers, and anti-cheat tab monitoring.'
              },
              {
                icon: BarChart3,
                title: 'Analytics & Reports',
                desc: 'Track student performance, attendance, and financial growth with detailed interactive charts.'
              },
              {
                icon: Users,
                title: 'Student Portal',
                desc: 'A dedicated, mobile-friendly dashboard for students to access lessons, submit assignments, and view grades.'
              },
              {
                icon: CreditCard,
                title: 'Payments & Finance',
                desc: 'Accept online payments or track offline bank deposits. Manage revenue, refunds, and subscriptions.'
              },
              {
                icon: Video,
                title: 'Live Classes',
                desc: 'Seamlessly integrate focused Zoom or MS Teams links for live scheduled sessions.'
              },
            ].map((feature, i) => (<Card key={i} className="glass-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-primary/10">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <feature.icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold leading-tight">
                Focus on teaching, <br />
                <span className="text-primary">we'll handle the rest.</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Modernistic LMS Hub automates the boring stuff - grading, attendance tracking, and payment reconciliation - so you can spend more time with your students.
              </p>
              <div className="space-y-4">
                {[
                  'Automated grading for MCQs',
                  'Instant attendance reports',
                  'Secure role-based access control',
                  'Mobile-optimized for learning on the go'
                ].map((item) => (<div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="font-medium">{item}</span>
                </div>))}
              </div>
              <div className="pt-4">
                <Button size="lg" variant="outline" className="rounded-full">
                  Explore all features
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent opacity-20 blur-3xl rounded-full" />
              <div className="relative bg-card border border-border rounded-2xl shadow-2xl p-6 md:p-8 space-y-6">
                {/* Mock UI Element */}
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="space-y-1">
                    <div className="h-2 w-24 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-8 rounded-full bg-primary/20" />
                </div>
                <div className="space-y-3">
                  <div className="h-20 bg-muted/50 rounded-lg w-full" />
                  <div className="h-20 bg-muted/50 rounded-lg w-full" />
                  <div className="h-20 bg-muted/50 rounded-lg w-full" />
                </div>
                <div className="pt-4 flex justify-between items-center">
                  <div className="h-8 w-24 bg-primary/20 rounded" />
                  <div className="h-8 w-8 bg-muted rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]" />

            <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10">Ready to start your journey?</h2>
            <p className="text-primary-foreground/80 text-lg mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of educators and students who are already using Modernistic LMS Hub to transform their educational experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-lg rounded-full text-primary font-bold shadow-lg">
                <Link to="/register">Get Started for Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-transparent border-primary-foreground/30 hover:bg-primary-foreground/10 text-primary-foreground">
                <Link to="/login">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>

    {/* Footer */}
    <footer className="bg-muted/50 py-12 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                E
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">Modernistic LMS Hub</span>
            </div>
            <p className="text-muted-foreground max-w-xs">
              Empowering education through technology. Simple, powerful, and effective learning management for everyone.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">Features</a></li>
              <li><a href="#" className="hover:text-primary">Pricing</a></li>
              <li><a href="#" className="hover:text-primary">Integrations</a></li>
              <li><a href="#" className="hover:text-primary">Roadmap</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary">About Us</a></li>
              <li><a href="#" className="hover:text-primary">Careers</a></li>
              <li><a href="#" className="hover:text-primary">Blog</a></li>
              <li><a href="#" className="hover:text-primary">Contact</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Modernistic LMS Hub. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">Privacy Policy</a>
            <a href="#" className="hover:text-foreground">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  </div>);
};
export default PublicHome;

