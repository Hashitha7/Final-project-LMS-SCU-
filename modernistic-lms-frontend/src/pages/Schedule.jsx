import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/StatCard';
import { Card, CardContent } from '@/components/ui/card';
import { mockSchedule } from '@/data/mockData';
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const Schedule = () => {
    const { user } = useAuth();
    if (!user)
        return <Navigate to="/login"/>;
    return (<AppLayout>
      <div className="space-y-6 pt-12 lg:pt-0">
        <PageHeader title="Class Schedule" subtitle="Weekly timetable view"/>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-5 gap-3">
              {days.map(day => (<div key={day}>
                  <h3 className="text-sm font-semibold text-foreground mb-3 text-center">{day}</h3>
                  <div className="space-y-2">
                    {mockSchedule.filter(s => s.day === day).map(s => (<div key={s.id} className="p-3 rounded-lg border border-border/50" style={{ borderLeftColor: s.color, borderLeftWidth: 3 }}>
                        <p className="text-sm font-medium text-foreground">{s.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{s.time}</p>
                        <p className="text-xs text-muted-foreground">{s.room}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{s.teacher}</p>
                      </div>))}
                    {mockSchedule.filter(s => s.day === day).length === 0 && (<div className="p-3 rounded-lg border border-dashed border-border/50 text-center">
                        <p className="text-xs text-muted-foreground">No classes</p>
                      </div>)}
                  </div>
                </div>))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>);
};
export default Schedule;

