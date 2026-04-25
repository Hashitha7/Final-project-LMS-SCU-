import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/StatCard';
import { Card, CardContent } from '@/components/ui/card';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const colors = ['hsl(217 91% 60%)', 'hsl(262 83% 58%)', 'hsl(142 71% 45%)', 'hsl(38 92% 50%)', 'hsl(0 84% 60%)', 'hsl(180 60% 45%)'];

const Schedule = () => {
    const { user } = useAuth();
    const { classes } = useLmsData();

    if (!user)
        return <Navigate to="/login"/>;

    // Map backend classes to schedule items format
    const scheduleItems = [];
    if (classes && classes.length > 0) {
        classes.forEach((cls, index) => {
            const color = colors[index % colors.length];
            const teacherName = cls.teacher?.user?.firstName 
                ? `${cls.teacher.user.firstName} ${cls.teacher.user.lastName}` 
                : (cls.teacher?.name || 'Unknown Teacher');
            
            if (cls.dayTimes && cls.dayTimes.length > 0) {
                cls.dayTimes.forEach(dt => {
                    const formatTime = (timeStr) => {
                        if (!timeStr) return '';
                        if (Array.isArray(timeStr)) {
                            return `${String(timeStr[0]).padStart(2, '0')}:${String(timeStr[1]).padStart(2, '0')}`;
                        }
                        return String(timeStr).substring(0, 5);
                    };
                    
                    const timeStr = `${formatTime(dt.startTime)} - ${formatTime(dt.endTime)}`;
                    
                    scheduleItems.push({
                        id: `${cls.id}-${dt.id}`,
                        title: cls.name,
                        day: dt.day,
                        time: timeStr,
                        room: cls.subject || 'Online',
                        teacher: teacherName,
                        color: color
                    });
                });
            }
        });
    }

    return (
      <AppLayout>
        <div className="space-y-6 pt-12 lg:pt-0">
          <PageHeader title="Class Schedule" subtitle="Weekly timetable view"/>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="grid grid-cols-5 gap-3">
                {days.map(day => {
                    const dayItems = scheduleItems.filter(s => s.day && s.day.toLowerCase() === day.toLowerCase());
                    return (
                      <div key={day}>
                        <h3 className="text-sm font-semibold text-foreground mb-3 text-center">{day}</h3>
                        <div className="space-y-2">
                          {dayItems.map(s => (
                            <div key={s.id} className="p-3 rounded-lg border border-border/50" style={{ borderLeftColor: s.color, borderLeftWidth: 3 }}>
                              <p className="text-sm font-medium text-foreground">{s.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{s.time}</p>
                              <p className="text-xs text-muted-foreground">{s.room}</p>
                              <p className="text-[10px] text-muted-foreground mt-1">{s.teacher}</p>
                            </div>
                          ))}
                          {dayItems.length === 0 && (
                            <div className="p-3 rounded-lg border border-dashed border-border/50 text-center">
                              <p className="text-xs text-muted-foreground">No classes</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
};
export default Schedule;

