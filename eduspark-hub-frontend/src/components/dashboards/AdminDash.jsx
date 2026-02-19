import { StatCard, PageHeader } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockStats, mockActivities, mockCourses } from '@/data/mockData';
import { Users, GraduationCap, BookOpen, DollarSign, Plus, UserPlus, CalendarCheck } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
const pieData = [
    { name: 'Active', value: 1120, color: 'hsl(142, 71%, 45%)' },
    { name: 'Inactive', value: 80, color: 'hsl(0, 84%, 60%)' },
    { name: 'New', value: 40, color: 'hsl(217, 91%, 60%)' },
];
const AdminDash = () => {
    const s = mockStats.admin;
    return (<div className="space-y-6 pt-12 lg:pt-0">
      <PageHeader title="Admin Dashboard" subtitle="Lincoln Academy Overview">
        <Button size="sm" className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1"/> Add Course</Button>
        <Button size="sm" variant="outline"><UserPlus className="w-4 h-4 mr-1"/> Add Student</Button>
      </PageHeader>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Students" value={s.totalStudents} icon={Users} change="+24 this month" trend="up"/>
        <StatCard title="Teachers" value={s.totalTeachers} icon={GraduationCap}/>
        <StatCard title="Courses" value={s.totalCourses} icon={BookOpen}/>
        <StatCard title="Revenue" value={`$${s.revenue.toLocaleString()}`} icon={DollarSign} change="+8.2%" trend="up"/>
        <StatCard title="Attendance" value={`${s.attendanceRate}%`} icon={CalendarCheck} change="+1.5%" trend="up"/>
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
            {mockCourses.slice(0, 4).map(c => (<div key={c.id} className="flex items-center gap-3">
                <span className="text-2xl">{c.image}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.students} students</p>
                </div>
                <span className="text-xs font-medium text-primary">{c.progress}%</span>
              </div>))}
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {mockActivities.slice(0, 4).map(a => (<div key={a.id} className="flex gap-3 text-sm">
                <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"/>
                <div>
                  <p className="font-medium text-foreground">{a.action}</p>
                  <p className="text-[10px] text-muted-foreground">{a.time}</p>
                </div>
              </div>))}
          </CardContent>
        </Card>
      </div>
    </div>);
};
export default AdminDash;
