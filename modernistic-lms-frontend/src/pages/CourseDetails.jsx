import { useMemo, useState, useEffect } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { uid } from '@/lib/storage';
import { FileText, Play, Plus, Upload } from 'lucide-react';
const isTrialActive = (trialEndsAt) => {
    if (!trialEndsAt)
        return false;
    return new Date(trialEndsAt).getTime() > Date.now();
};
const CourseDetails = () => {
    const { user } = useAuth();
  const navigate = useNavigate();
    const params = useParams();
    const courseId = params.id;
    const { users, courses, lessons, assignments, submissions, payments, upsertLesson, upsertAssignment, submitAssignment, gradeSubmission } = useLmsData();
    const course = courses.find((c) => c.id == courseId);
    const teacherId = course?.teacherId || course?.currentTeacherId;
    const teacher = users.find((u) => u.id === teacherId);
    const courseLessons = lessons.filter((l) => l.courseId == courseId).sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0));
    const courseAssignments = assignments.filter((a) => a.courseId == courseId);
    const courseSubmissions = submissions.filter((s) => courseAssignments.some((a) => a.id === s.assignmentId));
    const courseFee = course ? Number(course.price || course.fee || course.totalFee || 0) : 0;
    
    const hasPaidAccess = useMemo(() => {
        if (!user || !course) return false;
        if (courseFee === 0) return true;
        if (user.role !== 'student') return true;
        if (user.subscription?.plan === 'paid') return true;
        if (user.subscription?.plan === 'trial' && isTrialActive(user.subscription.trialEndsAt)) return true;
        return payments.some((p) => p.studentId === user.id && p.courseId === course.id && p.status === 'completed');
    }, [course, courseFee, payments, user]);

    const [lessonDraft, setLessonDraft] = useState({ name: '', description: '', lessonOrder: courseLessons.length + 1 });
    const [resourceDraft, setResourceDraft] = useState({ type: 'pdf', title: '', url: '', premium: courseFee > 0 });
    const [selectedLessonId, setSelectedLessonId] = useState(courseLessons[0]?.id ?? '');
    const [assignmentDraft, setAssignmentDraft] = useState({
        title: '',
        instructions: '',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        maxPoints: 100,
    });
    const [showVideo, setShowVideo] = useState(false);
    const [submissionText, setSubmissionText] = useState('');
    const [activeAssignmentId, setActiveAssignmentId] = useState('');

    const selectedLesson = courseLessons.find((l) => l.id === selectedLessonId) ?? courseLessons[0];

    useEffect(() => {
        setShowVideo(false);
        let timer;
        if (selectedLesson?.previewVideo) {
            timer = setTimeout(() => {
                setShowVideo(true);
            }, 2000);
        }
        return () => clearTimeout(timer);
    }, [selectedLesson?.id, selectedLesson?.previewVideo]);

    if (!user) return <Navigate to="/login"/>;
    if (!course) return <AppLayout><div className="pt-12 lg:pt-0">Course not found.</div></AppLayout>;

    const canManage = user.role === 'admin' || user.role === 'institute' || (user.role === 'teacher' && user.id === teacherId);
    const mySubmissions = user.role === 'student'
        ? courseSubmissions.filter((s) => s.studentId === user.id)
        : courseSubmissions;
    const submit = (assignmentId) => {
        if (user.role !== 'student')
            return;
        submitAssignment({ assignmentId, studentId: user.id, content: submissionText, attachmentUrl: undefined });
        setSubmissionText('');
        toast.success('Submitted');
    };
    const updateGrade = (submissionId, grade, feedback) => {
        gradeSubmission(submissionId, grade, feedback);
        toast.success('Graded');
    };
    return (<AppLayout>
      <div className="space-y-6 pt-12 lg:pt-0">
        <PageHeader title={course.title} subtitle={course.description}>

          {user.role === 'student' && !hasPaidAccess && (
            <Button
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => navigate(`/app/payments?action=pay&courseId=${course.id}`)}
            >
              Pay & Enroll
            </Button>
          )}

        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="glass-card lg:col-span-1">
            <CardHeader><CardTitle className="text-lg">Lessons</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {courseLessons.length === 0 && <p className="text-sm text-muted-foreground">No lessons yet.</p>}
              {courseLessons.map((l) => (<Button key={l.id} variant={l.id === selectedLessonId ? 'default' : 'ghost'} className={`w-full justify-start ${l.id === selectedLessonId ? 'bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-sm transition-colors border-transparent' : ''}`} onClick={() => setSelectedLessonId(l.id)}>
                  <span className={`mr-2 ${l.id === selectedLessonId ? 'text-white/80' : 'text-muted-foreground'}`}>{l.lessonOrder}.</span>
                  <span className="truncate">{l.name}</span>
                </Button>))}
            </CardContent>
          </Card>

          <Card className="glass-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">{selectedLesson?.name ?? 'Lesson'}</CardTitle>
              {(selectedLesson?.image || selectedLesson?.previewVideo) && (
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black mt-3 mb-3 shadow-md border border-slate-200 dark:border-slate-800">
                    {(!showVideo && selectedLesson?.image) || (!selectedLesson?.previewVideo && selectedLesson?.image) ? (
                        <img src={selectedLesson.image} alt="lesson cover" className="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-500" />
                    ) : null}
                    {((showVideo && selectedLesson?.previewVideo) || (!selectedLesson?.image && selectedLesson?.previewVideo)) && (
                        <video src={selectedLesson.previewVideo} autoPlay controls poster={selectedLesson?.image} className="absolute inset-0 w-full h-full object-contain animate-in fade-in duration-700" />
                    )}
                  </div>
              )}
              <p className="text-sm text-muted-foreground">{selectedLesson?.description}</p>
              {teacher && <p className="text-xs text-muted-foreground">Teacher: {teacher.name}</p>}
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="resources">
                <TabsList>
                  <TabsTrigger value="resources">Resources</TabsTrigger>

                </TabsList>

                <TabsContent value="resources" className="space-y-4">
                  {canManage && selectedLesson && (<Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white font-medium shadow-sm transition-colors border-transparent"><Upload className="w-4 h-4 mr-1"/> Add resource</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader><DialogTitle>Upload lesson resource</DialogTitle></DialogHeader>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Type</Label>
                            <Select value={resourceDraft.type} onValueChange={(v) => setResourceDraft((d) => ({ ...d, type: v }))}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="video">Video</SelectItem>
                                <SelectItem value="pdf">PDF</SelectItem>
                                <SelectItem value="link">Link</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input value={resourceDraft.title} onChange={(e) => setResourceDraft((d) => ({ ...d, title: e.target.value }))}/>
                          </div>
                          <div className="space-y-2 sm:col-span-2">
                            <Label>URL</Label>
                            <Input value={resourceDraft.url} onChange={(e) => setResourceDraft((d) => ({ ...d, url: e.target.value }))}/>
                          </div>
                          <div className="flex items-center justify-between sm:col-span-2">
                            <Label>Premium resource</Label>
                            <input aria-label="Premium resource" type="checkbox" checked={resourceDraft.premium} onChange={(e) => setResourceDraft((d) => ({ ...d, premium: e.target.checked }))}/>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button className="gradient-primary text-primary-foreground" onClick={() => {
                const updated = {
                    ...selectedLesson,
                    resources: [...selectedLesson.resources, { id: uid(), ...resourceDraft }],
                };
                upsertLesson(updated);
                toast.success('Resource added');
                setResourceDraft({ type: 'pdf', title: '', url: '', premium: courseFee > 0 });
            }}>Add</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>)}

                  {!selectedLesson?.resources?.length && (<p className="text-sm text-muted-foreground">No resources added for this lesson yet.</p>)}

                  <div className="space-y-2">
                    {selectedLesson?.resources?.map((r) => {
            const locked = r.premium && !hasPaidAccess;
            return (<Card key={r.id} className="glass-card">
                          <CardContent className="py-4 flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium text-foreground">{r.title}</p>
                              <p className="text-xs text-muted-foreground">{r.type.toUpperCase()} {r.premium ? '• Premium' : ''}</p>
                            </div>
                            <Button size="sm" variant={locked ? 'secondary' : 'outline'} disabled={locked} onClick={() => window.open(r.url, '_blank')}>
                              {r.type === 'video' ? <Play className="w-4 h-4 mr-1"/> : <FileText className="w-4 h-4 mr-1"/>}
                              {locked ? 'Locked' : 'Open'}
                            </Button>
                          </CardContent>
                        </Card>);
        })}
                  </div>
                </TabsContent>


              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>);
};
export default CourseDetails;

