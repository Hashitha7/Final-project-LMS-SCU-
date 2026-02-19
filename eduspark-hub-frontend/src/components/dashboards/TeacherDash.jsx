import { StatCard, PageHeader } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockStats, mockCourses, mockExams } from '@/data/mockData';
import { BookOpen, Users, Calendar, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
const TeacherDash = () => {
    const s = mockStats.teacher;
    return (<div className="space-y-6 pt-12 lg:pt-0">
      <PageHeader title="Teacher Dashboard" subtitle="Welcome back, Dr. James Carter"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Courses" value={s.myCourses} icon={BookOpen}/>
        <StatCard title="Total Students" value={s.totalStudents} icon={Users}/>
        <StatCard title="Upcoming Classes" value={s.upcomingClasses} icon={Calendar}/>
        <StatCard title="Pending Reviews" value={s.pendingSubmissions} icon={FileText} change="4 urgent" trend="down"/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">My Courses</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {mockCourses.slice(0, 4).map(c => (<div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <span className="text-2xl">{c.image}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{c.title}</p>
                  <p className="text-xs text-muted-foreground">{c.students} students · {c.lessons} lessons</p>
                </div>
                <div className="text-right">
                  <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${c.progress}%` }}/>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{c.progress}%</p>
                </div>
              </div>))}
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Upcoming Exams</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {mockExams.map(e => (<div key={e.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.course} · {e.date}</p>
                </div>
                <Badge variant={e.status === 'upcoming' ? 'default' : e.status === 'completed' ? 'secondary' : 'outline'}>
                  {e.status}
                </Badge>
              </div>))}
          </CardContent>
        </Card>
      </div>
    </div>);
};
export default TeacherDash;
