import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, BookOpen, Users, GraduationCap, Zap, CheckCircle, Lock, Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Classes = () => {
    const { user } = useAuth();
    const { classes, courses, users, classEnrollments, upsertClass, enrollInClass, deleteClass } = useLmsData();
    if (!user) return <Navigate to="/login" />;

    const canManage = user.role === 'admin' || user.role === 'institute';
    const isStudent = user.role === 'student';
    const teachers = users.filter((u) => u.role === 'teacher');
    const courseList = courses;

    const [draft, setDraft] = useState({
        name: '',
        grade: 'Grade 10',
        status: 'active',
        teacherId: teachers[0]?.id,
        courseIds: [],
        studentIds: [],
        fee: '',
        firstWeekFree: false,
        zoomJoinUrl: `https://zoom.us/j/${Math.floor(1000000000 + Math.random() * 9000000000)}?pwd=${Math.random().toString(36).substring(2, 8)}`,
    });
    const [isOpen, setIsOpen] = useState(false);
    const [enrollingClassId, setEnrollingClassId] = useState(null);
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [payDialog, setPayDialog] = useState(null); // { classItem }

    // My enrolled class IDs for the student
    const myEnrollments = useMemo(() => {
        if (!isStudent) return {};
        const map = {};
        (classEnrollments || []).forEach(e => {
            const cId = e.schoolClass?.id ?? e.classId;
            const sId = e.student?.id ?? e.studentId;
            if (String(sId) === String(user.id)) {
                map[cId] = { enrollmentId: e.id, enrollType: e.enrollType };
            }
        });
        return map;
    }, [classEnrollments, user, isStudent]);

    const rows = useMemo(() => (Array.isArray(classes) ? classes : []).map((c) => {
        const teacherObj = teachers.find(t =>
            t.id === (c.teacher?.id ?? c.teacherId)
        );
        const sIds = c.studentIds || [];
        const enrolled = myEnrollments[c.id];
        return { c: { ...c, studentIds: sIds }, teacher: teacherObj, enrolled };
    }), [classes, teachers, myEnrollments]);

    const handleEnroll = async (classItem, enrollType) => {
        setIsEnrolling(true);
        try {
            await enrollInClass(user.id, classItem.id, enrollType);
            toast.success(enrollType === 'FREE_TRIAL'
                ? `1 Day Free Trial started for "${classItem.name}"!`
                : `Successfully enrolled in "${classItem.name}"!`);
            setPayDialog(null);
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to enroll';
            toast.error(msg.includes('already') ? 'You are already enrolled in this class.' : msg);
        } finally {
            setIsEnrolling(false);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 pt-12 lg:pt-0">
                <PageHeader title="Classes" subtitle={canManage ? "Create and manage class groups" : "Browse and join available classes"}>
                    {canManage && (
                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1" /> New Class</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl">
                                <DialogHeader><DialogTitle>Create class</DialogTitle></DialogHeader>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Name</Label>
                                        <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Grade 10 - A" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Grade</Label>
                                        <Select value={draft.grade} onValueChange={(v) => setDraft((d) => ({ ...d, grade: v }))}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {['Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12', 'Grade 13'].map((g) => (
                                                    <SelectItem key={g} value={g}>{g}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Teacher</Label>
                                        <Select value={draft.teacherId ? String(draft.teacherId) : ''} onValueChange={(v) => setDraft((d) => ({ ...d, teacherId: v || undefined }))}>
                                            <SelectTrigger><SelectValue placeholder={teachers.length > 0 ? "Select" : "No Teachers Available"} /></SelectTrigger>
                                            <SelectContent>
                                                {teachers.length === 0 ? (
                                                    <SelectItem value="none" disabled>Please add a Teacher in the Teachers menu first.</SelectItem>
                                                ) : (
                                                    teachers.map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Class Fee (LKR)</Label>
                                        <Input type="number" value={draft.fee} onChange={(e) => setDraft((d) => ({ ...d, fee: e.target.value }))} placeholder="0" />
                                    </div>
                                    <div className="space-y-2 flex items-center pt-8">
                                        <input type="checkbox" id="trial" className="w-4 h-4 mr-2 cursor-pointer" checked={draft.firstWeekFree} onChange={(e) => setDraft((d) => ({ ...d, firstWeekFree: e.target.checked }))} />
                                        <Label htmlFor="trial" className="cursor-pointer">Enable 1 Day Free Trial</Label>
                                    </div>
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label>Zoom Join URL (Optional)</Label>
                                        <Input value={draft.zoomJoinUrl} onChange={(e) => setDraft((d) => ({ ...d, zoomJoinUrl: e.target.value }))} placeholder="https://zoom.us/j/123..." />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button className="gradient-primary text-primary-foreground" onClick={() => {
                                        upsertClass({
                                            name: draft.name,
                                            grade: draft.grade,
                                            activeStatus: 1,
                                            teacher: draft.teacherId ? { id: draft.teacherId } : null,
                                            fee: draft.fee ? Number(draft.fee) : 0,
                                            firstWeekFree: draft.firstWeekFree,
                                            zoomJoinUrl: draft.zoomJoinUrl
                                        });
                                        setDraft({ name: '', grade: 'Grade 10', status: 'active', teacherId: teachers[0]?.id, courseIds: [], studentIds: [], fee: '', firstWeekFree: false, zoomJoinUrl: `https://zoom.us/j/${Math.floor(1000000000 + Math.random() * 9000000000)}?pwd=${Math.random().toString(36).substring(2, 8)}` });
                                        setIsOpen(false);
                                        toast.success('Class created!');
                                    }}>Create</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </PageHeader>

                {/* Student card grid view */}
                {isStudent ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {rows.length === 0 && (
                            <p className="col-span-full text-center text-muted-foreground py-12">No classes available at the moment.</p>
                        )}
                        {rows.map(({ c, teacher, enrolled }) => {
                            const hasFee = c.fee && Number(c.fee) > 0;
                            const hasFreeTrial = c.firstWeekFree;
                            const isEnrolled = !!enrolled;
                            const isTrial = enrolled?.enrollType === 'FREE_TRIAL';

                            return (
                                <Card key={c.id} className="glass-card flex flex-col overflow-hidden group hover:shadow-lg transition-all duration-300">
                                    {/* Color bar */}
                                    <div className="h-2 gradient-primary" />
                                    <CardContent className="p-5 flex flex-col flex-1 gap-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <h3 className="font-semibold text-foreground text-base leading-tight">{c.name}</h3>
                                                <p className="text-xs text-muted-foreground mt-0.5">{c.grade}</p>
                                            </div>
                                            {isEnrolled ? (
                                                <Badge className="bg-green-500 text-white border-transparent shrink-0">
                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                    {isTrial ? 'Trial' : 'Enrolled'}
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary" className="shrink-0">
                                                    {hasFee ? <Lock className="w-3 h-3 mr-1" /> : <BookOpen className="w-3 h-3 mr-1" />}
                                                    {hasFee ? `LKR ${c.fee}` : 'Free'}
                                                </Badge>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                                                <span>{teacher?.name ?? 'Unknown Teacher'}</span>
                                            </div>
                                            {hasFreeTrial && !isEnrolled && (
                                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                    <Clock className="w-3.5 h-3.5 shrink-0" />
                                                    <span className="font-medium">1 Day Free Trial available</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto flex flex-col gap-2">
                                            {isEnrolled ? (
                                                <>
                                                    {c.zoomJoinUrl && (
                                                        <Button
                                                            size="sm"
                                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                                            onClick={() => window.open(c.zoomJoinUrl, '_blank')}
                                                        >
                                                            <Zap className="w-3.5 h-3.5 mr-1.5" /> Join Zoom Class
                                                        </Button>
                                                    )}
                                                    {isTrial && hasFee && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="w-full border-primary text-primary hover:bg-primary/5"
                                                            onClick={() => setPayDialog({ classItem: c })}
                                                        >
                                                            Upgrade — Pay LKR {c.fee}
                                                        </Button>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex gap-2">
                                                    {hasFee && (
                                                        <Button
                                                            size="sm"
                                                            className="flex-1 gradient-primary text-primary-foreground"
                                                            onClick={() => setPayDialog({ classItem: c })}
                                                        >
                                                            Pay &amp; Enroll
                                                        </Button>
                                                    )}
                                                    {hasFreeTrial && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
                                                            disabled={isEnrolling}
                                                            onClick={() => handleEnroll(c, 'FREE_TRIAL')}
                                                        >
                                                            <Clock className="w-3.5 h-3.5 mr-1" /> Free Trial
                                                        </Button>
                                                    )}
                                                    {!hasFee && !hasFreeTrial && (
                                                        <Button
                                                            size="sm"
                                                            className="flex-1 gradient-primary text-primary-foreground"
                                                            disabled={isEnrolling}
                                                            onClick={() => handleEnroll(c, 'FREE')}
                                                        >
                                                            Enroll Free
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    /* Admin / Teacher table view */
                    <Card className="glass-card">
                        <CardHeader><CardTitle className="text-lg">Class list</CardTitle></CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Teacher</TableHead>
                                        <TableHead>Students</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Fee</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rows.map(({ c, teacher }) => (
                                        <TableRow key={c.id}>
                                            <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{c.grade}</TableCell>
                                            <TableCell className="text-muted-foreground">{teacher?.name ?? '—'}</TableCell>
                                            <TableCell className="text-muted-foreground">{c.studentIds.length}</TableCell>
                                            <TableCell>
                                                <Badge variant={c.activeStatus === 1 ? 'default' : 'secondary'}>
                                                    {c.activeStatus === 1 ? 'active' : 'inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <span className="text-muted-foreground font-medium">{c.fee ? `LKR ${c.fee}` : 'Free'}</span>
                                                {c.firstWeekFree && <Badge className="ml-2 bg-green-500 text-white border-transparent">1 Day Trial</Badge>}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    {c.zoomJoinUrl ? (
                                                        <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => window.open(c.zoomJoinUrl, '_blank')}>Join Zoom</Button>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground mr-2">—</span>
                                                    )}
                                                    <Button size="icon" variant="destructive" className="h-8 w-8 rounded-md" onClick={() => {
                                                        if(window.confirm('Are you sure you want to delete this class?')) {
                                                            deleteClass(c.id).then(() => toast.success('Class deleted successfully')).catch(() => toast.error('Failed to delete class'));
                                                        }
                                                    }}>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Pay & Enroll Dialog */}
            {payDialog && (
                <Dialog open={!!payDialog} onOpenChange={() => setPayDialog(null)}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Enroll in {payDialog.classItem.name}</DialogTitle>
                            <DialogDescription>
                                Choose how you'd like to join this class.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-2">
                            {/* Paid option */}
                            <div className="rounded-xl border border-border p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-foreground">Full Enrollment</p>
                                        <p className="text-sm text-muted-foreground">Get full access to all class sessions.</p>
                                    </div>
                                    <Badge className="text-base px-3 py-1 bg-primary/10 text-primary border-primary/20">
                                        LKR {payDialog.classItem.fee}
                                    </Badge>
                                </div>
                                <Button
                                    className="w-full gradient-primary text-primary-foreground"
                                    disabled={isEnrolling}
                                    onClick={() => handleEnroll(payDialog.classItem, 'PAID')}
                                >
                                    {isEnrolling ? 'Processing...' : `Pay LKR ${payDialog.classItem.fee} & Enroll`}
                                </Button>
                            </div>

                            {/* Free trial option */}
                            {payDialog.classItem.firstWeekFree && (
                                <div className="rounded-xl border border-green-200 dark:border-green-800 p-4 space-y-3 bg-green-50/50 dark:bg-green-950/20">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-green-700 dark:text-green-400">1 Day Free Trial</p>
                                            <p className="text-sm text-muted-foreground">Try the class for one day at no cost.</p>
                                        </div>
                                        <Badge className="bg-green-500 text-white border-transparent">FREE</Badge>
                                    </div>
                                    <Button
                                        variant="outline"
                                        className="w-full border-green-500 text-green-600 hover:bg-green-50"
                                        disabled={isEnrolling}
                                        onClick={() => handleEnroll(payDialog.classItem, 'FREE_TRIAL')}
                                    >
                                        <Clock className="w-4 h-4 mr-2" />
                                        {isEnrolling ? 'Processing...' : 'Start Free Trial'}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </AppLayout>
    );
};

export default Classes;
