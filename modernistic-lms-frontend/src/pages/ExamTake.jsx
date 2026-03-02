import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { uid } from '@/lib/storage';
const formatTime = (s) => {
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
};
const ExamTake = () => {
    const { user } = useAuth();
    const { examId } = useParams();
    const navigate = useNavigate();
    const { exams, saveExamAttempt } = useLmsData();
    if (!user)
        return <Navigate to="/login"/>;
    if (user.role !== 'student')
        return <Navigate to="/app/exams"/>;
    const exam = exams.find((e) => e.id === examId);
    if (!exam)
        return <AppLayout><div className="pt-12 lg:pt-0">Exam not found.</div></AppLayout>;
    const questions = useMemo(() => {
        let q = [...exam.questions];
        if (exam.integrity?.shuffleQuestions)
            q = q.sort(() => Math.random() - 0.5);
        if (exam.integrity?.shuffleOptions) {
            q = q.map((qq) => {
                if (qq.type !== 'mcq')
                    return qq;
                const pairs = qq.options.map((opt, idx) => ({ opt, idx }));
                pairs.sort(() => Math.random() - 0.5);
                const viewOptions = pairs.map((p) => p.opt);
                const viewToOrig = pairs.map((p) => p.idx);
                return { ...qq, _viewOptions: viewOptions, _viewToOrig: viewToOrig };
            });
        }
        return q;
    }, [exam.questions, exam.integrity?.shuffleQuestions, exam.integrity?.shuffleOptions]);
    const [answers, setAnswers] = useState({});
    const [secondsLeft, setSecondsLeft] = useState(() => Math.max(60, exam.durationMin * 60));
    const [tabWarnings, setTabWarnings] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    useEffect(() => {
        if (submitted)
            return;
        const t = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
        return () => window.clearInterval(t);
    }, [submitted]);
    useEffect(() => {
        if (submitted)
            return;
        if (secondsLeft === 0) {
            toast.message('Time is up — submitting');
            onSubmit();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [secondsLeft]);
    useEffect(() => {
        if (!exam.integrity?.warnOnTabChange)
            return;
        const onVis = () => {
            if (document.hidden) {
                setTabWarnings((w) => {
                    const next = w + 1;
                    toast.warning(`Focus lost (${next})`);
                    return next;
                });
            }
        };
        document.addEventListener('visibilitychange', onVis);
        return () => document.removeEventListener('visibilitychange', onVis);
    }, [exam.integrity?.warnOnTabChange]);
    const requestFullscreen = async () => {
        if (!exam.integrity?.fullscreenRequired)
            return true;
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            }
            return true;
        }
        catch {
            toast.error('Fullscreen is required for this exam');
            return false;
        }
    };
    useEffect(() => {
        if (!exam.integrity?.disableCopyPaste)
            return;
        const prevent = (e) => {
            e.preventDefault();
            toast.warning('Copy/Paste disabled for this exam');
        };
        document.addEventListener('copy', prevent);
        document.addEventListener('paste', prevent);
        return () => {
            document.removeEventListener('copy', prevent);
            document.removeEventListener('paste', prevent);
        };
    }, [exam.integrity?.disableCopyPaste]);
    const scoreAttempt = (ans) => {
        let score = 0;
        let max = 0;
        for (const q of exam.questions) {
            max += q.points;
            const a = ans[q.id];
            if (!a)
                continue;
            if (q.type === 'mcq') {
                if (a.type === 'mcq' && a.selectedIndex === q.correctIndex)
                    score += q.points;
            }
            else {
                // essay is ungraded in demo UI
            }
        }
        return { score, max };
    };
    const onSubmit = async () => {
        if (submitted)
            return;
        setSubmitted(true);
        const ok = await requestFullscreen();
        if (!ok) {
            setSubmitted(false);
            return;
        }
        const { score, max } = scoreAttempt(answers);
        const attempt = {
            id: uid(),
            examId: exam.id,
            studentId: user.id,
            submittedAt: new Date().toISOString(),
            answers: Object.values(answers),
            score,
            maxScore: max,
            tabWarnings,
        };
        saveExamAttempt(attempt);
        toast.success(`Submitted. MCQ score: ${score}/${max}`);
        navigate('/app/exams');
    };
    return (<AppLayout>
      <div className="space-y-6 pt-12 lg:pt-0 max-w-4xl">
        <PageHeader title={`Take exam: ${exam.title}`} subtitle={`Duration: ${exam.durationMin} min • Time left: ${formatTime(secondsLeft)}`}>
          <Button variant="outline" onClick={requestFullscreen}>Fullscreen</Button>
          <Button className="gradient-primary text-primary-foreground" onClick={onSubmit}>Submit</Button>
        </PageHeader>

        {exam.integrity?.warnOnTabChange && (<Card className="glass-card">
            <CardContent className="py-4 text-sm text-muted-foreground">
              Tab-switch warnings: {tabWarnings}
            </CardContent>
          </Card>)}

        <div className="space-y-4">
          {questions.map((q, idx) => (<Card key={q.id} className="glass-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{idx + 1}. {q.prompt} <span className="text-xs text-muted-foreground">({q.points} pts)</span></CardTitle>
              </CardHeader>
              <CardContent>
                {q.type === 'mcq' ? (<RadioGroup value={(() => {
                    const stored = answers[q.id]?.selectedIndex;
                    if (stored === undefined || stored === null)
                        return '';
                    if (q._viewToOrig)
                        return String(q._viewToOrig.indexOf(stored));
                    return String(stored);
                })()} onValueChange={(v) => {
                    const viewIdx = Number(v);
                    const origIdx = q._viewToOrig ? q._viewToOrig[viewIdx] : viewIdx;
                    setAnswers((prev) => ({
                        ...prev,
                        [q.id]: { id: uid(), questionId: q.id, type: 'mcq', selectedIndex: origIdx },
                    }));
                }}>
                    {(q._viewOptions ?? q.options).map((opt, i) => (<div key={opt} className="flex items-center space-x-2">
                        <RadioGroupItem id={`${q.id}-${i}`} value={String(i)}/>
                        <Label htmlFor={`${q.id}-${i}`}>{opt}</Label>
                      </div>))}
                  </RadioGroup>) : (<Textarea value={answers[q.id]?.text ?? ''} onChange={(e) => {
                    setAnswers((prev) => ({
                        ...prev,
                        [q.id]: { id: uid(), questionId: q.id, type: 'essay', text: e.target.value },
                    }));
                }} placeholder="Write your answer…" className="bg-secondary/50" rows={5}/>)}
              </CardContent>
            </Card>))}
        </div>
      </div>
    </AppLayout>);
};
export default ExamTake;

