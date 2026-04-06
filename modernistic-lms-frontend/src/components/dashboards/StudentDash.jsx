import { StatCard, PageHeader } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Award, CalendarCheck, TrendingUp, Clock, CheckCircle, Video } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { useMemo } from 'react';

const StudentDash = () => {
    const { user } = useAuth();
    const { classes, classEnrollments, exams, submissions, assignments } = useLmsData();

    // Ensure safe arrays
    const safeClasses = Array.isArray(classes) ? classes : [];
    const safeEnrollments = Array.isArray(classEnrollments) ? classEnrollments : [];
    const safeExams = Array.isArray(exams) ? exams : [];
    const safeSubmissions = Array.isArray(submissions) ? submissions : [];

    // Filter student-specific data
    const myEnrollmentMap = useMemo(() => {
        const map = {};
        safeEnrollments.forEach(e => {
            const sId = e.student?.id ?? e.studentId;
            const cId = e.schoolClass?.id ?? e.classId;
            if (String(sId) === String(user?.id)) {
                map[cId] = e;
            }
        });
        return map;
    }, [safeEnrollments, user?.id]);

    const myClasses = useMemo(() => 
        safeClasses.filter(c => myEnrollmentMap[c.id]), 
    [safeClasses, myEnrollmentMap]);

    const completedClasses = useMemo(() => 
        myClasses.filter(c => c.activeStatus === 0).length, 
    [myClasses]);

    const mySubmissions = useMemo(() => 
        safeSubmissions.filter(s => (s.student?.id ?? s.studentId) === user?.id), 
    [safeSubmissions, user?.id]);

    const avgGrade = useMemo(() => {
        const graded = mySubmissions.filter(s => s.grade);
        if (graded.length === 0) return 0;
        const total = graded.reduce((acc, s) => acc + Number(s.grade || 0), 0);
        return Math.round((total / graded.length) * 10) / 10;
    }, [mySubmissions]);

    // Gather upcoming exams for my classes
    const upcomingExams = useMemo(() => {
        const myClassIds = new Set(myClasses.map(c => c.id));
        return safeExams.filter(e => {
            if (e.classId && myClassIds.has(e.classId)) return true;
            // Also include general/course exams assigned without specific class constraints
            if (!e.classId) return true; 
            return false;
        }).filter(e => e.status !== 'completed');
    }, [safeExams, myClasses]);

    return (
        <div className="space-y-6 pt-12 lg:pt-0">
            <PageHeader title="My Dashboard" subtitle={`Welcome back, ${user?.name || user?.firstname || 'Student'}`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Enrolled Classes" value={myClasses.length} icon={BookOpen}/>
                <StatCard title="Completed" value={completedClasses} icon={Award}/>
                <StatCard title="Average Grade" value={`${avgGrade}%`} icon={TrendingUp} trend={avgGrade > 0 ? "up" : "neutral"} />
                <StatCard title="Submissions" value={mySubmissions.length} icon={CheckCircle}/>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="glass-card">
                    <CardHeader><CardTitle className="text-lg">My Classes</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {myClasses.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">You are not enrolled in any classes yet.</p>
                        ) : myClasses.slice(0, 5).map(c => (
                            <div key={c.id} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <BookOpen className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{c.name}</p>
                                            <p className="text-xs text-muted-foreground">{c.teacher?.name || 'Unknown Teacher'}</p>
                                        </div>
                                    </div>
                                    <Badge variant={c.activeStatus !== 0 ? 'default' : 'secondary'} className="text-xs">
                                        {c.activeStatus !== 0 ? 'Active' : 'Completed'}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                <div className="space-y-4">
                    <Card className="glass-card">
                        <CardHeader><CardTitle className="text-lg">Upcoming Exams</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {upcomingExams.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">No upcoming exams.</p>
                            ) : upcomingExams.slice(0, 3).map(e => (
                                <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">{e.title}</p>
                                        <p className="text-xs text-muted-foreground">{e.date || 'TBA'} {e.paperDuration ? `· ${e.paperDuration} min` : ''}</p>
                                    </div>
                                    <Badge>{(e.quizType || e.type || 'QUIZ').toUpperCase()}</Badge>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card className="glass-card">
                        <CardHeader><CardTitle className="text-lg">My Live Sessions</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            {myClasses.filter(c => c.zoomJoinUrl).length === 0 ? (
                                <p className="text-sm text-muted-foreground py-2 text-center">No scheduled live sessions for your classes.</p>
                            ) : myClasses.filter(c => c.zoomJoinUrl).slice(0, 3).map((c, i) => {
                                const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'];
                                return (
                                <div key={c.id} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-secondary/20 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1 h-10 rounded-full" style={{ background: colors[i % colors.length] }}/>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">{c.name}</p>
                                            <p className="text-xs text-muted-foreground">Online via Zoom</p>
                                        </div>
                                    </div>
                                    <div className="cursor-pointer" onClick={() => window.open(c.zoomJoinUrl, '_blank')}>
                                        <Badge variant="outline" className="bg-blue-50/50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
                                            <Video className="w-3 h-3 mr-1" /> Join
                                        </Badge>
                                    </div>
                                </div>
                            )})}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentDash;

