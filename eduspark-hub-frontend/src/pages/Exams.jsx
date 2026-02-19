import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/sonner';
import { Plus, ClipboardList, Clock, FileText, Play, Shield } from 'lucide-react';
import { uid } from '@/lib/storage';
const inferExamType = (questions) => {
  const types = new Set(questions.map((q) => q.type));
  if (types.size === 1)
    return [...types][0].toUpperCase();
  return 'MIXED';
};
const defaultIntegrity = {
  shuffleQuestions: false,
  shuffleOptions: false,
  fullscreenRequired: false,
  disableCopyPaste: false,
  warnOnTabChange: true,
};
const Exams = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { exams, courses, examAttempts, upsertExam } = useLmsData();
  const [search, setSearch] = useState('');
  const canManage = user?.role === 'admin' || user?.role === 'teacher';
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q)
      return exams;
    return exams.filter((e) => e.title.toLowerCase().includes(q));
  }, [exams, search]);
  const stats = useMemo(() => {
    const list = exams;
    const total = list.length;
    const upcoming = list.filter((e) => e.status === 'upcoming' || e.status === 'live').length;
    const needsGrading = list.filter((e) => e.status === 'grading').length;
    return { total, upcoming, needsGrading };
  }, [exams]);
  const attemptsByExam = useMemo(() => {
    const map = new Map();
    for (const a of examAttempts) {
      if (!map.has(a.examId))
        map.set(a.examId, []);
      map.get(a.examId).push(a);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)));
      map.set(k, arr);
    }
    return map;
  }, [examAttempts]);
  // Create Exam (admin/teacher)
  const [draftTitle, setDraftTitle] = useState('');
  const [draftCourseId, setDraftCourseId] = useState('');
  const [draftDate, setDraftDate] = useState('');
  const [draftDurationMin, setDraftDurationMin] = useState(60);
  const [draftIntegrity, setDraftIntegrity] = useState(defaultIntegrity);
  const [qType, setQType] = useState('mcq');
  const [qPrompt, setQPrompt] = useState('');
  const [qPoints, setQPoints] = useState(5);
  const [qOptions, setQOptions] = useState('Option A\nOption B\nOption C\nOption D');
  const [qCorrectIndex, setQCorrectIndex] = useState(0);
  const [draftQuestions, setDraftQuestions] = useState([]);
  const resetDraft = () => {
    setDraftTitle('');
    setDraftCourseId('');
    setDraftDate('');
    setDraftDurationMin(60);
    setDraftIntegrity(defaultIntegrity);
    setQType('mcq');
    setQPrompt('');
    setQPoints(5);
    setQOptions('Option A\nOption B\nOption C\nOption D');
    setQCorrectIndex(0);
    setDraftQuestions([]);
  };
  const addQuestion = () => {
    if (!qPrompt.trim()) {
      toast.error('Question prompt is required');
      return;
    }
    if (qType === 'mcq') {
      const opts = qOptions
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      if (opts.length < 2) {
        toast.error('Provide at least 2 options');
        return;
      }
      if (qCorrectIndex < 0 || qCorrectIndex >= opts.length) {
        toast.error('Correct index is out of range');
        return;
      }
      const nq = {
        id: uid(),
        type: 'mcq',
        prompt: qPrompt.trim(),
        options: opts,
        correctIndex: qCorrectIndex,
        points: Math.max(1, Number(qPoints) || 1),
      };
      setDraftQuestions((prev) => [...prev, nq]);
      setQPrompt('');
      return;
    }
    const nq = {
      id: uid(),
      type: 'essay',
      prompt: qPrompt.trim(),
      points: Math.max(1, Number(qPoints) || 1),
    };
    setDraftQuestions((prev) => [...prev, nq]);
    setQPrompt('');
  };
  const createExam = () => {
    if (!draftTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!draftCourseId) {
      toast.error('Course is required');
      return;
    }
    if (!draftDate) {
      toast.error('Date is required');
      return;
    }
    if (draftQuestions.length === 0) {
      toast.error('Add at least one question');
      return;
    }
    const exam = {
      id: uid(),
      courseId: draftCourseId,
      title: draftTitle.trim(),
      date: draftDate,
      durationMin: Math.max(5, Number(draftDurationMin) || 5),
      status: 'upcoming',
      questions: draftQuestions,
      integrity: draftIntegrity,
    };
    upsertExam(exam);
    toast.success('Exam created');
    resetDraft();
  };
  if (!user)
    return <Navigate to="/login" />;
  return (<AppLayout>
    <div className="space-y-6 pt-12 lg:pt-0">
      <div className="mb-6">
        <p className="text-sm text-muted-foreground mb-1">Teachers / Manage Exams / View Papers</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">View Papers</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><ClipboardList className="w-5 h-5 text-primary" /></div>
          <div><p className="text-2xl font-bold text-foreground">{stats.total}</p><p className="text-xs text-muted-foreground">Total Exams</p></div>
        </Card>
        <Card className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center"><Clock className="w-5 h-5 text-warning" /></div>
          <div><p className="text-2xl font-bold text-foreground">{stats.upcoming}</p><p className="text-xs text-muted-foreground">Upcoming/Live</p></div>
        </Card>
        <Card className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center"><FileText className="w-5 h-5 text-accent" /></div>
          <div><p className="text-2xl font-bold text-foreground">{stats.needsGrading}</p><p className="text-xs text-muted-foreground">Needs Grading</p></div>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 max-w-sm">
          <Input placeholder="Search exams..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-secondary/50" />
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader><CardTitle>All exams</CardTitle></CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Integrity</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => {
                const course = courses.find((c) => c.id === e.courseId);
                const latestMyAttempt = user.role === 'student'
                  ? (attemptsByExam.get(e.id) || []).find((a) => a.studentId === user.id)
                  : null;
                const action = (() => {
                  if (user.role !== 'student')
                    return <span className="text-xs text-muted-foreground">—</span>;
                  if (latestMyAttempt) {
                    return (<div className="text-xs text-muted-foreground text-right">
                      <div>Last score: {latestMyAttempt.score}/{latestMyAttempt.maxScore}</div>
                      <Button size="sm" variant="outline" className="mt-2" onClick={() => navigate(`/app/exams/take/${e.id}`)}>
                        Retake
                      </Button>
                    </div>);
                  }
                  return (<Button size="sm" className="gradient-primary text-primary-foreground" onClick={() => navigate(`/app/exams/take/${e.id}`)}>
                    <Play className="w-4 h-4 mr-1" /> Start
                  </Button>);
                })();
                return (<TableRow key={e.id} className="hover:bg-secondary/50">
                  <TableCell className="font-medium text-foreground">{e.title}</TableCell>
                  <TableCell className="text-muted-foreground">{course?.title ?? '—'}</TableCell>
                  <TableCell><Badge variant="outline">{inferExamType(e.questions)}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{e.date}</TableCell>
                  <TableCell>{e.durationMin} min</TableCell>
                  <TableCell>{e.questions.length}</TableCell>
                  <TableCell>
                    <Badge variant={e.status === 'upcoming' || e.status === 'live' ? 'default' : e.status === 'completed' ? 'secondary' : 'outline'}>
                      {e.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {e.integrity?.fullscreenRequired && <Badge variant="secondary">Fullscreen</Badge>}
                      {e.integrity?.disableCopyPaste && <Badge variant="secondary">No Copy/Paste</Badge>}
                      {e.integrity?.warnOnTabChange && <Badge variant="secondary">Tab Warn</Badge>}
                      {!e.integrity?.fullscreenRequired && !e.integrity?.disableCopyPaste && !e.integrity?.warnOnTabChange && (<span className="text-xs text-muted-foreground">—</span>)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{action}</TableCell>
                </TableRow>);
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  </AppLayout>);
};
export default Exams;
