import { StatCard, PageHeader } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, Calendar, FileText, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { useMemo } from 'react';

const TeacherDash = () => {
    const { user } = useAuth();
    const { classes, exams, submissions, assignments } = useLmsData();

    // Ensure safe array arrays from context
    const safeClasses = Array.isArray(classes) ? classes : [];
    const safeExams = Array.isArray(exams) ? exams : [];
    const safeSubmissions = Array.isArray(submissions) ? submissions : [];
    const safeAssignments = Array.isArray(assignments) ? assignments : [];

    // Filter teacher-specific data
    const myClasses = useMemo(() => 
        safeClasses.filter(c => (c.teacher?.id ?? c.teacherId) === user?.id), 
    [safeClasses, user?.id]);

    const totalStudents = useMemo(() => 
        myClasses.reduce((acc, c) => acc + (c.studentIds?.length || 0), 0), 
    [myClasses]);

    const myExams = useMemo(() => 
        safeExams.filter(e => (e.teacher?.id ?? e.teacherId) === user?.id), 
    [safeExams, user?.id]);

    const myAssignments = useMemo(() => 
        safeAssignments.filter(a => (a.teacher?.id ?? a.teacherId) === user?.id), 
    [safeAssignments, user?.id]);

    // Calculate pending submissions for assignments owned by this teacher
    const pendingReviews = useMemo(() => {
        const myAssignmentIds = new Set(myAssignments.map(a => a.id));
        return safeSubmissions.filter(s => 
            (s.assignmentId && myAssignmentIds.has(s.assignmentId)) || 
            (s.assignment?.id && myAssignmentIds.has(s.assignment.id))
        ).filter(s => s.status === 'pending' || s.status === 'submitted').length;
    }, [safeSubmissions, myAssignments]);

    // Active metrics
    const upcomingClasses = myClasses.filter(c => c.activeStatus !== 0).length;

    return (
        <div className="space-y-6 pt-12 lg:pt-0">
            <PageHeader title="Teacher Dashboard" subtitle={`Welcome back, ${user?.name || user?.firstname || 'Teacher'}`} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="My Courses" value={myClasses.length} icon={BookOpen}/>
                <StatCard title="Total Students" value={totalStudents} icon={Users}/>
                <StatCard title="Active Classes" value={upcomingClasses} icon={Calendar}/>
                <StatCard title="Pending Reviews" value={pendingReviews} icon={FileText} trend={pendingReviews > 0 ? "up" : "neutral"} change={pendingReviews > 0 ? `${pendingReviews} pending` : "All caught up"} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className="glass-card">
                    <CardHeader><CardTitle className="text-lg">My Classes</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {myClasses.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">No active classes available.</p>
                        ) : myClasses.slice(0, 4).map(c => (
                            <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{c.name}</p>
                                    <p className="text-xs text-muted-foreground">{c.studentIds?.length || 0} students · {c.grade}</p>
                                </div>
                                <div className="text-right">
                                    <Badge variant={c.activeStatus !== 0 ? 'default' : 'secondary'}>
                                        {c.activeStatus !== 0 ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
                
                <Card className="glass-card">
                    <CardHeader><CardTitle className="text-lg">Upcoming Exams</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                        {myExams.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">No upcoming exams defined.</p>
                        ) : myExams.slice(0, 4).map(e => (
                            <div key={e.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{e.title}</p>
                                    <p className="text-xs text-muted-foreground">{e.quizType || e.type || 'Quiz'} · {e.date || 'TBA'}</p>
                                </div>
                                <div className="text-right">
                                    <Badge variant={e.status === 'upcoming' ? 'default' : e.status === 'completed' ? 'secondary' : 'outline'}>
                                        {e.status || 'Active'}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default TeacherDash;

