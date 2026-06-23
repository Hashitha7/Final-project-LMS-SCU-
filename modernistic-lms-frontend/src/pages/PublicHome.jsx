import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, Award, BarChart3, CreditCard, Video, CheckCircle2, ArrowRight } from 'lucide-react';
import lmsVideo from '../assests/lms_7.mp4';

const PublicHome = () => {
  const canvasRef = useRef(null);
  const ctaCardRef = useRef(null);

  const handleCtaMouseMove = (e) => {
    const card = ctaCardRef.current;
    if (!card) return;
    
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((centerY - y) / centerY) * 10; 
    const rotateY = ((x - centerX) / centerX) * 10; 
    
    const lightX = (x / rect.width) * 100;
    const lightY = (y / rect.height) * 100;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.transition = 'transform 0.1s ease-out, shadow 0.3s ease';
    card.style.setProperty('--light-x', `${lightX}%`);
    card.style.setProperty('--light-y', `${lightY}%`);
  };
  
  const handleCtaMouseLeave = () => {
    const card = ctaCardRef.current;
    if (!card) return;
    
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    card.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), shadow 0.5s ease';
    card.style.setProperty('--light-x', '50%');
    card.style.setProperty('--light-y', '50%');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const parent = canvas.parentElement;
    if (!parent) return;
    
    let animationFrameId;
    let particles = [];
    const maxParticles = 115; 
    let mouse = { x: null, y: null, radius: 160 };
    
    const handleResize = () => {
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    const colors = [
      '#3b82f6', // Blue
      '#6366f1', // Indigo
      '#a855f7', // Purple
      '#ec4899', // Pink
      '#14b8a6', // Teal
      '#f59e0b'  // Amber/Gold
    ];
    
    class Particle {
      constructor(x, y) {
        this.x = x !== undefined ? x : Math.random() * canvas.width;
        this.y = y !== undefined ? y : Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.radius = Math.random() * 2.5 + 1.5;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      
      update() {
        this.x += this.vx;
        this.y += this.vy;
        
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
        
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            this.x -= dx * force * 0.03;
            this.y -= dy * force * 0.03;
          }
        }
      }
      
      draw() {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 4;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.restore();
      }
    }
    
    for (let i = 0; i < maxParticles; i++) {
      particles.push(new Particle());
    }
    
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    
    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      particles.forEach((p) => {
        const dx = p.x - clickX;
        const dy = p.y - clickY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 200) {
          const force = (200 - distance) / 200;
          p.vx += (dx / distance) * force * 5;
          p.vy += (dy / distance) * force * 5;
        }
      });
      
      for (let i = 0; i < 15; i++) {
        const p = new Particle(clickX, clickY);
        p.vx = (Math.random() - 0.5) * 5;
        p.vy = (Math.random() - 0.5) * 5;
        particles.push(p);
      }
    };
    
    parent.addEventListener('mousemove', handleMouseMove);
    parent.addEventListener('mouseleave', handleMouseLeave);
    parent.addEventListener('mousedown', handleMouseDown);
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (particles.length > maxParticles) {
        particles.splice(maxParticles, particles.length - maxParticles);
      }
      
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i];
          const p2 = particles[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 130) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const alpha = (130 - distance) / 130 * 0.28;
            
            // Colorful gradient line connecting p1 and p2 colors
            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            grad.addColorStop(0, p1.color);
            grad.addColorStop(1, p2.color);
            
            ctx.strokeStyle = grad;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1.2;
            ctx.stroke();
            ctx.globalAlpha = 1.0; // Reset alpha
          }
        }
        
        if (mouse.x !== null && mouse.y !== null) {
          const p = particles[i];
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            const alpha = (mouse.radius - distance) / mouse.radius * 0.38;
            
            // Dynamic colorful gradient connecting particle to cursor
            const grad = ctx.createLinearGradient(p.x, p.y, mouse.x, mouse.y);
            grad.addColorStop(0, p.color);
            grad.addColorStop(1, '#a855f7'); // neon purple at cursor
            
            ctx.strokeStyle = grad;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1.4;
            ctx.stroke();
            ctx.globalAlpha = 1.0; // Reset alpha
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', handleResize);
      parent.removeEventListener('mousemove', handleMouseMove);
      parent.removeEventListener('mouseleave', handleMouseLeave);
      parent.removeEventListener('mousedown', handleMouseDown);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (<div className="min-h-screen bg-background flex flex-col relative overflow-x-hidden">
    {/* Navigation */}
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-md">
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

    {/* Spacer to compensate for fixed header height */}
    <div className="h-16 w-full" />

    <main className="flex-1">
      <section
        className="relative py-20 lg:py-32 overflow-hidden border-b border-border/40"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* High Performance Canvas Mouse & Click Constellation Mesh */}
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 w-full h-full" />

        {/* Animated Background Motion Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Blob 1 (Blue) */}
          <div className="absolute -top-20 -left-20 w-72 h-72 md:w-96 md:h-96 rounded-full bg-blue-400/10 blur-[80px] md:blur-[120px] animate-blob-1" />
          {/* Blob 2 (Purple) */}
          <div className="absolute top-10 -right-20 w-72 h-72 md:w-96 md:h-96 rounded-full bg-purple-400/10 blur-[80px] md:blur-[120px] animate-blob-2" />
          {/* Blob 3 (Teal/Pink) */}
          <div className="absolute -bottom-20 left-1/3 w-72 h-72 md:w-96 md:h-96 rounded-full bg-indigo-400/10 blur-[80px] md:blur-[120px] animate-blob-3" />
        </div>

        <div className="container mx-auto px-4 text-center max-w-4xl relative z-10">

          <h1 className="text-4xl md:text-5xl lg:text-[3.8rem] font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 leading-[1.15]">
            Elevate Education with Our{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              Modernistic LMS
            </span>{' '}
            &{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              AI Answer Analyst System
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
            <h2 className="text-3xl font-bold mb-4">Everything Your LMS Needs</h2>
            <p className="text-muted-foreground text-lg">
              Production-ready modules already available in this system for day-to-day  operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: BookOpen,
                title: 'AI Answer Analyst',
                desc: 'Upload student written/typed answers and get instant science scoring, missing keyword analysis, and feedback.'
              },
              {
                icon: Award,
                title: 'Courses, Lessons & Exams',
                desc: 'Create courses, organize lessons, schedule papers, and track student progress in one consistent flow.'
              },
              {
                icon: BarChart3,
                title: 'Analytics & Reports',
                desc: 'Monitor performance trends, attendance impact, and learning outcomes with actionable reporting views.'
              },
              {
                icon: Users,
                title: 'Role-Based Portals',
                desc: 'Separate experiences for Institute Admin, Teachers, and Students with secure role-aware navigation.'
              },
              {
                icon: CreditCard,
                title: 'Payment & Enrollment',
                desc: 'Students can pay and enroll, while admins can verify, refund, and track all transaction history centrally.'
              },
              {
                icon: Video,
                title: 'Zoom Integration',
                desc: 'Schedule and run live class sessions directly through integrated Zoom workflow support.'
              },
            ].map((feature, i) => (
              <Card 
                key={i} 
                className="glass-card border border-border/50 hover:border-primary/40 shadow-md hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] group animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary group-hover:text-white group-hover:rotate-[360deg] transition-all duration-700 shadow-sm">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground font-medium leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
                Focus on management and teaching, <br />
                <span className="text-blue-600">the platform handles operations.</span>
              </h2>
              <p className="text-xl text-muted-foreground font-medium">
                From student registration to payment verification to AI-based science answer analysis, this system reduces manual workload for your team.
              </p>
              <div className="space-y-4">
                {[
                  'Student, Teacher, and Institute account management',
                  'Course, class, lesson, and exam administration',
                  'Science answer evaluation with AI support'
                ].map((item) => (<div key={item} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="font-medium">{item}</span>
                </div>))}
              </div>

            </div>
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary to-accent opacity-20 blur-3xl rounded-full" />
              <div className="relative border border-border rounded-2xl shadow-2xl overflow-hidden drop-shadow-2xl">
                <video 
                  src={lmsVideo} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-auto object-cover block" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div 
            ref={ctaCardRef}
            onMouseMove={handleCtaMouseMove}
            onMouseLeave={handleCtaMouseLeave}
            className="bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-primary-foreground rounded-3xl p-8 md:p-16 text-center relative overflow-hidden shadow-2xl transition-all duration-300 ease-out select-none border border-white/20"
            style={{ 
              transformStyle: 'preserve-3d', 
              transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
              boxShadow: '0 25px 50px -12px rgba(14, 165, 233, 0.3)'
            }}
          >
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.08)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_4s_infinite] pointer-events-none" />

            {/* Dynamic Spotlight Glare */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-80"
              style={{
                background: 'radial-gradient(circle 400px at var(--light-x, 50%) var(--light-y, 50%), rgba(255, 255, 255, 0.25) 0%, transparent 80%)',
                transform: 'translateZ(10px)',
                mixBlendMode: 'overlay'
              }}
            />

            {/* Floating 3D Background Glows */}
            <div 
              className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-cyan-300/30 blur-3xl pointer-events-none animate-blob-1"
              style={{ transform: 'translateZ(-40px)' }}
            />
            <div 
              className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-blue-400/30 blur-3xl pointer-events-none animate-blob-2"
              style={{ transform: 'translateZ(-50px)' }}
            />

            {/* Interactive Grid Pattern inside Card */}
            <div 
              className="absolute inset-0 bg-grid-pattern opacity-[0.15] pointer-events-none" 
              style={{ transform: 'translateZ(-20px)' }}
            />

            {/* Card Content with Parallax Pop */}
            <h2 
              className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 relative z-10 tracking-tight leading-tight select-none text-white drop-shadow-md"
              style={{ 
                transform: 'translateZ(60px)', 
                transformStyle: 'preserve-3d'
              }}
            >
              Ready to Run Your LMS Efficiently?
            </h2>
            
            <p 
              className="text-sky-50 text-lg md:text-xl mb-10 max-w-2xl mx-auto relative z-10 font-semibold select-none drop-shadow"
              style={{ 
                transform: 'translateZ(40px)',
                transformStyle: 'preserve-3d'
              }}
            >
              Launch your workflow with role-based access, smart payment handling, and AI-assisted science evaluation.
            </p>
            
            <div 
              className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 items-center"
              style={{ 
                transform: 'translateZ(50px)',
                transformStyle: 'preserve-3d'
              }}
            >
              <Button asChild size="lg" variant="secondary" className="h-14 px-8 text-lg rounded-full text-blue-700 hover:text-blue-800 bg-white hover:bg-slate-50 font-extrabold shadow-xl hover:shadow-2xl hover:shadow-white/20 hover:scale-105 active:scale-95 transition-all duration-300">
                <Link to="/register">Get Started for Free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-white/5 border-white/20 hover:bg-white/10 hover:border-white/40 text-white font-bold hover:scale-105 active:scale-95 transition-all duration-300">
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </main>

    {/* Footer */}
    <footer className="relative bg-muted/30 py-16 border-t border-border/40 overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute -bottom-20 right-10 w-96 h-96 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4 group/logo cursor-pointer inline-flex">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-blue-500/20 group-hover/logo:rotate-[360deg] group-hover/logo:scale-105 transition-all duration-700">
                M
              </div>
              <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 dark:from-blue-400 dark:to-indigo-400 group-hover/logo:from-indigo-600 group-hover/logo:to-purple-600 transition-all duration-500">
                Modernistic LMS
              </span>
            </div>
            <p className="text-muted-foreground max-w-xs leading-relaxed font-medium">
              A complete Learning Management System featuring a custom-trained AI Science Answer Analyst, built for the future of education.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4 select-none">Product</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <a href="#features" className="group flex items-center gap-1 text-muted-foreground hover:text-primary hover:translate-x-2 transition-all duration-300 ease-out">
                  <span className="w-1 h-1 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300 ease-out mr-1" />
                  Features
                </a>
              </li>
              <li>
                <Link to="/login" className="group flex items-center gap-1 text-muted-foreground hover:text-primary hover:translate-x-2 transition-all duration-300 ease-out">
                  <span className="w-1 h-1 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300 ease-out mr-1" />
                  Payments
                </Link>
              </li>
              <li>
                <Link to="/login" className="group flex items-center gap-1 text-muted-foreground hover:text-primary hover:translate-x-2 transition-all duration-300 ease-out">
                  <span className="w-1 h-1 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300 ease-out mr-1" />
                  Science Analyst
                </Link>
              </li>
              <li>
                <Link to="/login" className="group flex items-center gap-1 text-muted-foreground hover:text-primary hover:translate-x-2 transition-all duration-300 ease-out">
                  <span className="w-1 h-1 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300 ease-out mr-1" />
                  Reports
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-4 select-none">Company</h3>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <Link to="/login" className="group flex items-center gap-1 text-muted-foreground hover:text-primary hover:translate-x-2 transition-all duration-300 ease-out">
                  <span className="w-1 h-1 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300 ease-out mr-1" />
                  Institute Login
                </Link>
              </li>
              <li>
                <Link to="/login" className="group flex items-center gap-1 text-muted-foreground hover:text-primary hover:translate-x-2 transition-all duration-300 ease-out">
                  <span className="w-1 h-1 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300 ease-out mr-1" />
                  Teacher Login
                </Link>
              </li>
              <li>
                <Link to="/login" className="group flex items-center gap-1 text-muted-foreground hover:text-primary hover:translate-x-2 transition-all duration-300 ease-out">
                  <span className="w-1 h-1 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300 ease-out mr-1" />
                  Student Login
                </Link>
              </li>
              <li>
                <Link to="/register" className="group flex items-center gap-1 text-muted-foreground hover:text-primary hover:translate-x-2 transition-all duration-300 ease-out">
                  <span className="w-1 h-1 rounded-full bg-primary scale-0 group-hover:scale-100 transition-transform duration-300 ease-out mr-1" />
                  Create Account
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/40 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground font-medium">
          <p>© {new Date().getFullYear()} Modernistic LMS with AI Answer Analyst System. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary hover:-translate-y-0.5 transition-all duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-primary hover:-translate-y-0.5 transition-all duration-200">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  </div>);
};
export default PublicHome;
