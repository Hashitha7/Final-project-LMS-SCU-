import { useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
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
    const params = useParams();
    const courseId = params.id;
    const { users, courses, lessons, assignments, submissions, payments, upsertLesson, upsertAssignment, submitAssignment, gradeSubmission } = useLmsData();
    if (!user)
        return <Navigate to="/login"/>;
    const course = courses.find((c) => c.id === courseId);
    if (!course)
        return <AppLayout><div className="pt-12 lg:pt-0">Course not found.</div></AppLayout>;
    const teacher = users.find((u) => u.id === course.teacherId);
    const courseLessons = lessons.filter((l) => l.courseId === courseId).sort((a, b) => a.order - b.order);
    const courseAssignments = assignments.filter((a) => a.courseId === courseId);
    const courseSubmissions = submissions.filter((s) => courseAssignments.some((a) => a.id === s.assignmentId));
    const hasPaidAccess = useMemo(() => {
        if (course.price === 0)
            return true;
        if (user.role !== 'student')
            return true;
        if (user.subscription?.plan === 'paid')
            return true;
        if (user.subscription?.plan === 'trial' && isTrialActive(user.subscription.trialEndsAt))
            return true;
        // or completed payment
        const paid = payments.some((p) => p.studentId === user.id && p.courseId === course.id && p.status === 'completed');
        return paid;
    }, [course.id, course.price, payments, user]);
    const [lessonDraft, setLessonDraft] = useState({ title: '', summary: '', order: courseLessons.length + 1 });
    const [resourceDraft, setResourceDraft] = useState({ type: 'pdf', title: '', url: '', premium: course.price > 0 });
    const [selectedLessonId, setSelectedLessonId] = useState(courseLessons[0]?.id ?? '');
    const [assignmentDraft, setAssignmentDraft] = useState({
        title: '',
        instructions: '',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
        maxPoints: 100,
    });
    const canManage = user.role === 'admin' || (user.role === 'teacher' && user.id === course.teacherId);
    const selectedLesson = courseLessons.find((l) => l.id === selectedLessonId) ?? courseLessons[0];
    const mySubmissions = user.role === 'student'
        ? courseSubmissions.filter((s) => s.studentId === user.id)
        : courseSubmissions;
    const [submissionText, setSubmissionText] = useState('');
    const [activeAssignmentId, setActiveAssignmentId] = useState('');
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
          {course.price > 0 && (<Badge variant={hasPaidAccess ? 'default' : 'secondary'}>
              {hasPaidAccess ? 'Premium access enabled' : 'Premium locked'}
            </Badge>)}
          {canManage && (<Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1"/> Add lesson</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader><DialogTitle>Create lesson</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input value={lessonDraft.title} onChange={(e) => setLessonDraft((d) => ({ ...d, title: e.target.value }))}/>
                    </div>
                    <div className="space-y-2">
                      <Label>Order</Label>
                      <Input type="number" value={lessonDraft.order} onChange={(e) => setLessonDraft((d) => ({ ...d, order: Number(e.target.value) }))}/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Summary</Label>
                    <Textarea value={lessonDraft.summary} onChange={(e) => setLessonDraft((d) => ({ ...d, summary: e.target.value }))}/>
                  </div>
                </div>
                <DialogFooter>
                  <Button className="gradient-primary text-primary-foreground" onClick={() => {
                const created = { id: uid(), courseId, resources: [], ...lessonDraft };
                upsertLesson(created);
                setSelectedLessonId(created.id);
                setLessonDraft({ title: '', summary: '', order: created.order + 1 });
                toast.success('Lesson created');
            }}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>)}
        </PageHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="glass-card lg:col-span-1">
            <CardHeader><CardTitle className="text-lg">Lessons</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {courseLessons.length === 0 && <p className="text-sm text-muted-foreground">No lessons yet.</p>}
              {courseLessons.map((l) => (<Button key={l.id} variant={l.id === selectedLessonId ? 'secondary' : 'ghost'} className="w-full justify-start" onClick={() => setSelectedLessonId(l.id)}>
                  <span className="mr-2 text-muted-foreground">{l.order}.</span>
                  <span className="truncate">{l.title}</span>
                </Button>))}
            </CardContent>
          </Card>

          <Card className="glass-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">{selectedLesson?.title ?? 'Lesson'}</CardTitle>
              <p className="text-sm text-muted-foreground">{selectedLesson?.summary}</p>
              {teacher && <p className="text-xs text-muted-foreground">Teacher: {teacher.name}</p>}
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="resources">
                <TabsList>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                  <TabsTrigger value="assignments">Assignments</TabsTrigger>
                  <TabsTrigger value="grades">Grades</TabsTrigger>
                </TabsList>

                <TabsContent value="resources" className="space-y-4">
                  {canManage && selectedLesson && (<Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline"><Upload className="w-4 h-4 mr-1"/> Add resource</Button>
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
                setResourceDraft({ type: 'pdf', title: '', url: '', premium: course.price > 0 });
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

                <TabsContent value="assignments" className="space-y-4">
                  {canManage && (<Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1"/> Create assignment</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-lg">
                        <DialogHeader><DialogTitle>Create assignment</DialogTitle></DialogHeader>
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label>Title</Label>
                            <Input value={assignmentDraft.title} onChange={(e) => setAssignmentDraft((d) => ({ ...d, title: e.target.value }))}/>
                          </div>
                          <div className="space-y-2">
                            <Label>Due date</Label>
                            <Input type="date" value={assignmentDraft.dueDate} onChange={(e) => setAssignmentDraft((d) => ({ ...d, dueDate: e.target.value }))}/>
                          </div>
                          <div className="space-y-2">
                            <Label>Instructions</Label>
                            <Textarea value={assignmentDraft.instructions} onChange={(e) => setAssignmentDraft((d) => ({ ...d, instructions: e.target.value }))}/>
                          </div>
                          <div className="space-y-2">
                            <Label>Max points</Label>
                            <Input type="number" value={assignmentDraft.maxPoints} onChange={(e) => setAssignmentDraft((d) => ({ ...d, maxPoints: Number(e.target.value) }))}/>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button className="gradient-primary text-primary-foreground" onClick={() => {
                const created = { id: uid(), courseId, attachments: [], ...assignmentDraft };
                upsertAssignment(created);
                setAssignmentDraft({ title: '', instructions: '', dueDate: assignmentDraft.dueDate, maxPoints: 100 });
                toast.success('Assignment created');
            }}>Create</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>)}

                  {courseAssignments.length === 0 && <p className="text-sm text-muted-foreground">No assignments for this course.</p>}

                  <div className="space-y-3">
                    {courseAssignments.map((a) => (<Card key={a.id} className="glass-card">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <CardTitle className="text-base">{a.title}</CardTitle>
                              <p className="text-xs text-muted-foreground">Due {a.dueDate} • {a.maxPoints} pts</p>
                            </div>
                            {user.role === 'student' && (<Button size="sm" variant="outline" onClick={() => setActiveAssignmentId(a.id)}>Submit</Button>)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">{a.instructions}</p>
                          {user.role === 'student' && activeAssignmentId === a.id && (<div className="mt-4 space-y-2">
                              <Label>Submission</Label>
                              <Textarea value={submissionText} onChange={(e) => setSubmissionText(e.target.value)} placeholder="Write your answer or paste a link to your file…"/>
                              <Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => submit(a.id)}>
                                Submit
                              </Button>
                            </div>)}
                        </CardContent>
                      </Card>))}
                  </div>
                </TabsContent>

                <TabsContent value="grades" className="space-y-3">
                  {mySubmissions.length === 0 && <p className="text-sm text-muted-foreground">No submissions yet.</p>}
                  {mySubmissions.map((s) => {
            const assn = courseAssignments.find((a) => a.id === s.assignmentId);
            const student = users.find((u) => u.id === s.studentId);
            return (<Card key={s.id} className="glass-card">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <CardTitle className="text-base">{assn?.title ?? 'Assignment'}</CardTitle>
                              <p className="text-xs text-muted-foreground">
                                Submitted {new Date(s.submittedAt).toLocaleString()} • {student?.name ?? ''}
                              </p>
                            </div>
                            <Badge variant={s.grade == null ? 'secondary' : 'default'}>
                              {s.grade == null ? 'Pending' : `${s.grade}%`}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <p className="text-sm text-muted-foreground">{s.content}</p>
                          {s.feedback && <p className="text-sm">Feedback: {s.feedback}</p>}

                          {canManage && (<div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <Input aria-label="Grade" placeholder="Grade" type="number" defaultValue={s.grade ?? ''} onChange={() => { }}/>
                              <Input aria-label="Feedback" placeholder="Feedback" defaultValue={s.feedback ?? ''} onChange={() => { }}/>
                              <Button size="sm" className="gradient-primary text-primary-foreground" onClick={(e) => {
                        const wrap = e.currentTarget.parentElement;
                        const inputs = wrap.querySelectorAll('input');
                        const grade = Number(inputs[0].value);
                        const feedback = inputs[1].value;
                        updateGrade(s.id, grade, feedback);
                    }}>
                                Save
                              </Button>
                            </div>)}
                        </CardContent>
                      </Card>);
        })}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>);
};
export default CourseDetails;

