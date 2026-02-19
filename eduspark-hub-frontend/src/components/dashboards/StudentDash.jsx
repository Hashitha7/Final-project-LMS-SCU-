import { StatCard, PageHeader } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockStats, mockCourses, mockExams, mockSchedule } from '@/data/mockData';
import { BookOpen, Award, CalendarCheck, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
const StudentDash = () => {
    const s = mockStats.student;
    return (<div className="space-y-6 pt-12 lg:pt-0">
      <PageHeader title="My Dashboard" subtitle="Welcome back, Alex Rivera"/>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Enrolled Courses" value={s.enrolledCourses} icon={BookOpen}/>
        <StatCard title="Completed" value={s.completedCourses} icon={Award}/>
        <StatCard title="Average Grade" value={`${s.avgGrade}%`} icon={TrendingUp} change="+2.3%" trend="up"/>
        <StatCard title="Attendance" value={`${s.attendanceRate}%`} icon={CalendarCheck}/>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">My Courses</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {mockCourses.slice(0, 4).map(c => (<div key={c.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{c.image}</span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.teacher}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary">{c.progress}%</span>
                </div>
                <Progress value={c.progress} className="h-1.5"/>
              </div>))}
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-lg">Upcoming Exams</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {mockExams.filter(e => e.status === 'upcoming').map(e => (<div key={e.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{e.title}</p>
                    <p className="text-xs text-muted-foreground">{e.date} · {e.duration} min</p>
                  </div>
                  <Badge>{e.type.toUpperCase()}</Badge>
                </div>))}
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-lg">Today's Schedule</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {mockSchedule.slice(0, 3).map(s => (<div key={s.id} className="flex items-center gap-3 p-2 rounded-lg">
                  <div className="w-1 h-10 rounded-full" style={{ background: s.color }}/>
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.title}</p>
                    <p className="text-xs text-muted-foreground">{s.time} · {s.room}</p>
                  </div>
                </div>))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>);
};
export default StudentDash;
