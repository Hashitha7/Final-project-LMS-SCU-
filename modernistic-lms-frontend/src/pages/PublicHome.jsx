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
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-blue-500/20">
              M
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400">
              Modernistic LMS
            </span>
          </div>
        <div className="flex items-center gap-4">
          <nav className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          </nav>
          <div className="flex gap-2">
            <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700 text-white transition-all font-semibold rounded-full px-6 shadow-md shadow-blue-500/20">
              <Link to="/login">Log In</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>

    <main className="flex-1">
      <section 
        className="relative py-20 lg:py-32 overflow-hidden" 
        style={{ backgroundColor: '#67e6dc' }}
      >
        
        <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">

          <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-black tracking-tight text-foreground mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 leading-[1.1]">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
              Elevate Education with Our Modernistic LMS with AI Answer Analyst System Platform
            </span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Button asChild size="lg" className="h-12 px-8 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all rounded-full hover:scale-105 active:scale-95">
              <Link to="/register">Get Started <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
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
                title: 'AI Answer Analyst',
                desc: 'Upload student written answers. Our AI Engine instantly evaluates Science questions using NLP TF-IDF keyword matching and gives a score.'
              },
              {
                icon: Award,
                title: 'Smart Exams & Courses',
                desc: 'Create and manage rich courses, MCQ quizzes, and structured modules specifically designed for O/L Students.'
              },
              {
                icon: BarChart3,
                title: 'Analytics & Reports',
                desc: 'Track student performance graphically. Identify weak science concepts through continuous AI assessment feedback.'
              },
              {
                icon: Users,
                title: 'Role-Based Portals',
                desc: 'Dedicated, secure dashboards for Administrators, Teachers, and Students, ensuring privacy and ease of navigation.'
              },
              {
                icon: CreditCard,
                title: 'Flexible Payments',
                desc: 'Accept online payments or track offline manual bank deposit slips securely. Manage revenue and course enrollments.'
              },
              {
                icon: Video,
                title: 'Zoom Integration',
                desc: 'Seamlessly schedule and launch live Zoom classes directly from the platform without sharing external links.'
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
              <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
                Focus on teaching, <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">the AI handles grading.</span>
              </h2>
              <p className="text-xl text-muted-foreground font-medium">
                Modernistic LMS automates the repetitive marking process — evaluating Grade 10 and 11 Biology, Chemistry, and Physics questions instantly.
              </p>
              <div className="space-y-4">
                {[
                  'NLP Keyword Extraction Scoring',
                  'TF-IDF Semantic Matching',
                  '100% Offline AI Processing',
                  'Sri Lankan O/L Curriculum Trained'
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

            <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10 tracking-tight">Experience Modern Education</h2>
            <p className="text-primary-foreground/90 text-xl mb-10 max-w-2xl mx-auto relative z-10 font-medium">
              Join the revolution in educational technology. Bring powerful AI Answer Analysis to your school today.
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="font-bold text-xl tracking-tight text-foreground">Modernistic LMS</span>
            </div>
            <p className="text-muted-foreground max-w-xs">
              A complete Learning Management System featuring a custom-trained AI Science Answer Analyst, built for the future of education.
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
          <p>© {new Date().getFullYear()} Modernistic LMS with AI Answer Analyst System. All rights reserved.</p>
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

