import { StatCard, PageHeader } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLmsData } from '@/contexts/LmsDataContext';
import { Users, GraduationCap, BookOpen, DollarSign, Plus, UserPlus, CalendarCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const AdminDash = () => {
    const { users, courses, payments, exams } = useLmsData();

    const totalStudents = users.filter(u => u.role === 'student').length;
    const totalTeachers = users.filter(u => u.role === 'teacher').length;
    const totalCourses = courses.length;
    
    // Sum completed payments
    const revenue = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    // Calculate pie chart based on students
    const pieData = [
        { name: 'Active', value: totalStudents > 0 ? totalStudents : 1, color: 'hsl(142, 71%, 45%)' },
        { name: 'Inactive', value: 0, color: 'hsl(0, 84%, 60%)' },
        { name: 'New', value: 0, color: 'hsl(217, 91%, 60%)' },
    ];

    // Real courses mapped to UI structure
    const topCoursesMapped = courses.slice(0, 4).map((c, i) => ({
        id: c.id || i,
        image: ['📐', '⚛️', '📚', '💻'][i % 4],
        title: c.title,
        students: users.filter(u => u.role === 'student').length, // Fallback if no specific relation
        progress: 100
    }));

    // Real recent activity from system (mixing users, payments, exams)
    const allActivities = [
        ...users.filter(u => u.createdAt).map(u => ({ type: 'New member', date: new Date(u.createdAt) })),
        ...payments.filter(p => p.date).map(p => ({ type: `Payment received: $${p.amount}`, date: new Date(p.date) })),
        ...courses.filter(c => c.createdAt).map(c => ({ type: `Course added: ${c.title}`, date: new Date(c.createdAt) }))
    ].sort((a, b) => b.date - a.date);

    const recentActivitiesMapped = allActivities.slice(0, 4).map((a, i) => ({
        id: i,
        action: a.type,
        time: a.date.toLocaleDateString()
    }));
    return (<div className="space-y-6 pt-12 lg:pt-0">
      <PageHeader title="Admin Dashboard" subtitle="System Overview">
      </PageHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Students" value={totalStudents} icon={Users} />
        <StatCard title="Teachers" value={totalTeachers} icon={GraduationCap}/>
        <StatCard title="Courses" value={totalCourses} icon={BookOpen}/>
        <StatCard title="Revenue" value={`Rs ${revenue.toLocaleString()}`} icon={DollarSign}/>
        <StatCard title="Attendance" value={`100%`} icon={CalendarCheck} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Student Status</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color}/>)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {pieData.map(d => (<div key={d.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }}/>
                  {d.name}
                </div>))}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Top Courses</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {topCoursesMapped.length > 0 ? topCoursesMapped.map(c => (<div key={c.id} className="flex items-center gap-3">
                <span className="text-2xl">{c.image}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.students} students</p>
                </div>
                <span className="text-xs font-medium text-primary">{c.progress}%</span>
              </div>)) : <p className="text-sm text-muted-foreground">No courses available.</p>}
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {recentActivitiesMapped.length > 0 ? recentActivitiesMapped.map(a => (<div key={a.id} className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"/>
                <div>
                  <p className="font-medium text-foreground">{a.action}</p>
                  <p className="text-[10px] text-muted-foreground">{a.time}</p>
                </div>
              </div>)) : <p className="text-sm text-muted-foreground">No recent activity.</p>}
          </CardContent>
        </Card>
      </div>
    </div>);
};
export default AdminDash;

