import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { LayoutDashboard, BookOpen, Users, GraduationCap, ClipboardList, Calendar, CreditCard, Video, BarChart3, Settings, LogOut, ChevronLeft, ChevronRight, Shield, Menu, X, UserCog, Layers, Bell, MessageSquare, Landmark, ChevronDown, Plus, Eye, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';

const adminMenuItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
  { label: 'Teachers', icon: UserCog, path: '/app/teachers' },
  {
    label: 'Manage Course',
    icon: BookOpen,
    children: [
      { label: 'Add Course', path: '/app/courses/create', icon: Plus },
      { label: 'View Courses', path: '/app/courses', icon: Eye },
    ]
  },
  {
    label: 'Manage Lessons',
    icon: Layers,
    children: [
      { label: 'Add Lessons', path: '/app/lessons/add', icon: Plus },
      { label: 'View Lessons', path: '/app/lessons', icon: Eye },
    ]
  },
  { label: 'Students', icon: Users, path: '/app/students' },
  { label: 'Manage Classes', icon: GraduationCap, path: '/app/classes' },
  {
    label: 'Manage Exams',
    icon: ClipboardList,
    children: [
      { label: 'Add Papers', path: '/app/exams/add', icon: Plus },
      { label: 'View Papers', path: '/app/exams', icon: Eye },
    ]
  },
  { label: 'Student Attendance', icon: Calendar, path: '/app/attendance' },
  { label: 'Release Zoom Account', icon: Video, path: '/app/zoom' },
  { label: 'Special Notification', icon: Bell, path: '/app/notifications' },
  {
    label: 'SMS',
    icon: MessageSquare,
    children: [
      { label: 'Class SMS', path: '/app/sms/class', icon: MessageSquare },
      { label: 'Lesson SMS', path: '/app/sms/lesson', icon: MessageSquare },
      { label: 'Course SMS', path: '/app/sms/course', icon: MessageSquare },
      { label: 'Custom Sms', path: '/app/sms/custom', icon: MessageSquare },
    ]
  },
  { label: 'Payments', icon: CreditCard, path: '/app/payments' },
  {
    label: 'Finance',
    icon: Landmark,
    children: [
      { label: 'Class Payments', path: '/app/finance/class', icon: Landmark },
      { label: 'Course Payment', path: '/app/finance/course', icon: Landmark },
      { label: 'Lesson Payments', path: '/app/finance/lesson', icon: Landmark },
      { label: 'Sms Costs', path: '/app/finance/sms', icon: Landmark },
    ]
  },
  { label: 'Reports', icon: BarChart3, path: '/app/reports' },
  { label: 'Science AI Analyst', icon: Brain, path: '/app/science-analyst' },
  { label: 'Settings', icon: Settings, path: '/app/settings' },
];

const menuItems = {
  admin: adminMenuItems,
  institute: adminMenuItems,  // Institute = admin role in new schema
  teacher: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
    {
      label: 'Manage Course',
      icon: BookOpen,
      children: [
        { label: 'Add Course', path: '/app/courses/create', icon: Plus },
        { label: 'View Courses', path: '/app/courses', icon: Eye },
      ]
    },
    {
      label: 'Manage Lessons',
      icon: Layers,
      children: [
        { label: 'Add Lessons', path: '/app/lessons/add', icon: Plus },
        { label: 'View Lessons', path: '/app/lessons', icon: Eye },
      ]
    },
    { label: 'Classes', icon: GraduationCap, path: '/app/classes' },
    { label: 'Students', icon: Users, path: '/app/students' },
    { label: 'Exams', icon: ClipboardList, path: '/app/exams' },
    { label: 'Attendance', icon: Calendar, path: '/app/attendance' },
    { label: 'Zoom Classes', icon: Video, path: '/app/zoom' },
    { label: 'Notifications', icon: Bell, path: '/app/notifications' },
    { label: 'Reports', icon: BarChart3, path: '/app/reports' },
    { label: 'Science AI Analyst', icon: Brain, path: '/app/science-analyst' },
    { label: 'Settings', icon: Settings, path: '/app/settings' },
  ],
  student: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/app/dashboard' },
    { label: 'My Courses', icon: BookOpen, path: '/app/courses' },
    { label: 'Classes', icon: Layers, path: '/app/classes' },
    { label: 'Exams', icon: ClipboardList, path: '/app/exams' },
    { label: 'Zoom Classes', icon: Video, path: '/app/zoom' },
    { label: 'Notifications', icon: Bell, path: '/app/notifications' },
    { label: 'Payments', icon: CreditCard, path: '/app/payments' },
    { label: 'Science AI Analyst', icon: Brain, path: '/app/science-analyst' },
    { label: 'Settings', icon: Settings, path: '/app/settings' },
  ],
};

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const { collapsed, setCollapsed } = useSidebar();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState({});

  if (!user) return null;

  const items = menuItems[user.role];
  const roleBadge = user.role.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());

  const toggleMenu = (label) => {
    setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const renderMenuItem = (item) => {
    if (item.children) {
      const isOpen = openMenus[item.label];
      const isActive = item.children.some(child => location.pathname === child.path);

      return (
        <div key={item.label} className="space-y-1">
          <button
            onClick={() => {
              if (collapsed) setCollapsed(false);
              toggleMenu(item.label);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 hover:bg-sidebar-accent text-sidebar-foreground justify-between",
              isActive && "bg-sidebar-accent"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="truncate font-medium">{item.label}</span>}
            </div>
            {!collapsed && (
              <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", isOpen ? "transform rotate-180" : "")} />
            )}
          </button>

          {isOpen && !collapsed && (
            <div className="pl-10 space-y-1 animate-in slide-in-from-top-2 duration-200">
              {item.children.map(child => {
                const isChildActive = location.pathname === child.path;
                return (
                  <Link
                    key={child.path}
                    to={child.path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors block",
                      isChildActive
                        ? "bg-sidebar-primary/10 text-sidebar-primary"
                        : "text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    {child.icon ? <child.icon className="w-4 h-4" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                    <span className="truncate">{child.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    const active = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200",
          active
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
            : "text-sidebar-foreground hover:bg-sidebar-accent"
        )}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span className="truncate font-medium">{item.label}</span>}
      </Link>
    );
  };

  const sidebarContent = (
    <div className={cn("flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300", collapsed ? "w-[72px]" : "w-64")}>
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm text-sidebar-foreground truncate">Modernistic LMS</h1>
            <p className="text-[10px] text-muted-foreground truncate">{user.school}</p>
          </div>
        )}
        <Button size="icon" className="ml-auto hidden lg:flex h-7 w-7 bg-blue-500 hover:bg-blue-600 text-white shadow-sm transition-colors border-transparent" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-sidebar-border">
        {(items || []).map((item, index) => (
          <div key={item.path || index}>{renderMenuItem(item)}</div>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={cn("flex items-center gap-3", collapsed && "justify-center")}>
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 text-sm font-semibold text-primary">
            {user.name.split(' ').map(n => n[0]).join('')}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground">{roleBadge}</p>
            </div>
          )}
          {!collapsed && (
            <Button size="icon" className="h-8 w-8 bg-blue-500 hover:bg-blue-600 text-white shadow-sm transition-colors border-transparent" onClick={() => { logout(); navigate('/login'); }}>
              <LogOut className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <Button variant="ghost" size="icon" className="fixed top-3 left-3 z-50 lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn("fixed top-0 left-0 h-full z-40 lg:relative lg:z-0 transition-transform duration-300", mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
        {sidebarContent}
      </aside>
    </>
  );
};

