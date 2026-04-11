import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { uid } from '@/lib/storage';
import * as api from '@/lib/api';
import { FileText, CheckCircle2 } from 'lucide-react';
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
    const exam = exams.find((e) => e.id == examId);

    const questions = useMemo(() => {
        if (!exam) return [];
        let q = [...(exam.questions || [])];
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
    }, [exam]);

    const [answers, setAnswers] = useState({});
    const [secondsLeft, setSecondsLeft] = useState(() => Math.max(60, ((exam?.durationMin || exam?.paperDuration || 60) * 60)));
    const [tabWarnings, setTabWarnings] = useState(0);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!exam || submitted)
            return;
        const t = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
        return () => window.clearInterval(t);
    }, [submitted, exam]);

    useEffect(() => {
        if (!exam || submitted)
            return;
        if (secondsLeft === 0) {
            toast.message('Time is up — submitting');
            onSubmit();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [secondsLeft, exam, submitted]);

    useEffect(() => {
        if (!exam || !exam.integrity?.warnOnTabChange)
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
    }, [exam?.integrity?.warnOnTabChange, exam]);

    useEffect(() => {
        if (!exam || !exam.integrity?.disableCopyPaste)
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
    }, [exam?.integrity?.disableCopyPaste, exam]);

    const requestFullscreen = async () => {
        if (!exam?.integrity?.fullscreenRequired)
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
    
    if (!user)
        return <Navigate to="/login"/>;
    if (user.role !== 'student')
        return <Navigate to="/app/exams"/>;
    if (!exam)
        return <AppLayout><div className="pt-12 lg:pt-0">Exam not found.</div></AppLayout>;

    const scoreAttempt = (ans) => {
        let score = 0;
        let max = 0;
        for (const q of (exam.questions || [])) {
            max += q.points || 0;
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
        const hasAnyAnswer = Object.values(answers).some((value) => {
            if (!value)
                return false;
            if (value.type === 'essay')
                return String(value.text ?? '').trim().length > 0;
            if (value.type === 'mcq')
                return Number.isInteger(value.selectedIndex);
            if (value.type === 'file')
                return Boolean(value.file || value.url);
            return true;
        });

        if (!hasAnyAnswer) {
            toast.error('Please provide at least one answer before submitting.');
            setSubmitted(false);
            return;
        }

        const { score, max } = scoreAttempt(answers);

        const preparedAnswers = { ...answers };
        for (const [key, value] of Object.entries(preparedAnswers)) {
            if (value?.type !== 'file' || !value?.file || value?.url) {
                continue;
            }

            try {
                const uploadResult = await api.files.upload(value.file, 'exam-submissions');
                const uploadedUrl = uploadResult?.url || uploadResult?.fileUrl || null;
                if (!uploadedUrl) {
                    toast.error('Answer sheet upload did not return a valid URL. Please try again.');
                    setSubmitted(false);
                    return;
                }

                preparedAnswers[key] = {
                    type: 'file',
                    name: value.file.name,
                    size: value.file.size,
                    url: uploadedUrl,
                };
            } catch (error) {
                const message = error?.response?.data?.message || 'Failed to upload answer sheet file.';
                toast.error(message);
                setSubmitted(false);
                return;
            }
        }

        const normalizedAnswers = Object.fromEntries(
            Object.entries(preparedAnswers).map(([key, value]) => {
                if (value?.type === 'file') {
                    return [key, {
                        type: 'file',
                        name: value.name,
                        size: value.file?.size ?? null,
                        url: value.url ?? null,
                    }];
                }
                return [key, value];
            })
        );

        const durationMin = exam?.durationMin || exam?.paperDuration || 60;
        const now = new Date();
        const startedAt = new Date(now.getTime() - ((durationMin * 60 - secondsLeft) * 1000));

        const parsedExamId = Number(exam.id);
        if (Number.isNaN(parsedExamId)) {
            toast.error('This exam cannot be submitted because it is not synced with the backend.');
            setSubmitted(false);
            return;
        }

        const toLocalDateTime = (date) => date.toISOString().slice(0, 19);

        const attempt = {
            examId: parsedExamId,
            answers: {
                responses: normalizedAnswers,
                autoScore: {
                    mcqScore: score,
                    mcqMaxScore: max,
                },
                tabWarnings,
            },
            startDateTime: toLocalDateTime(startedAt),
            endDateTime: toLocalDateTime(now),
        };

        try {
            await saveExamAttempt(attempt);
            toast.success('Answers submitted successfully. Waiting for lecturer review.');
            navigate('/app/exams');
        } catch (error) {
            const message = error?.response?.data?.message || error?.message || 'Failed to submit answers';
            toast.error(message);
            setSubmitted(false);
        }
    };
    return (<AppLayout>
      <div className="space-y-6 pt-12 lg:pt-0 max-w-4xl">
        <PageHeader title={`Take exam: ${exam.title}`} subtitle={`Duration: ${exam.durationMin || exam.paperDuration || 60} min • Time left: ${formatTime(secondsLeft)}`}>
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium border-transparent transition-colors shadow-sm" onClick={requestFullscreen}>Fullscreen</Button>
          <Button className="bg-blue-500 hover:bg-blue-600 text-white font-medium border-transparent transition-colors shadow-sm" onClick={onSubmit}>Submit</Button>
        </PageHeader>

        {exam.integrity?.warnOnTabChange && (<Card className="glass-card">
            <CardContent className="py-4 text-sm text-muted-foreground">
              Tab-switch warnings: {tabWarnings}
            </CardContent>
          </Card>)}

        <div className="space-y-4">
          {(exam.questions && exam.questions.length > 0) ? (
            questions.map((q, idx) => (<Card key={q.id} className="glass-card">
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
            </Card>))
          ) : (
            <Card className="glass-card">
               <CardHeader><CardTitle>Exam Paper</CardTitle></CardHeader>
               <CardContent className="space-y-6">
                  <div className="p-4 bg-secondary/50 rounded-lg whitespace-pre-wrap text-sm border-l-4 border-primary">
                    <p className="font-semibold mb-2">Instructions:</p>
                    {exam.description || "No specific instructions provided for this exam."}
                  </div>
                  
                  {exam.questionPaperUrl ? (
                     <a href={exam.questionPaperUrl} download target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full sm:w-auto">
                        <FileText className="w-4 h-4 mr-2"/> Download Exam Paper
                     </a>
                  ) : (
                     <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-sm font-medium text-amber-800">Note: The exam paper document hasn't been uploaded via the system yet. Please refer to your instructions.</p>
                     </div>
                  )}
                  
                  <div className="pt-6 border-t border-border">
                     <Label className="text-base font-semibold">Your Answers</Label>
                     <p className="text-xs text-muted-foreground mb-4 mt-1">Submit your completed paper by uploading the document and/or writing in the box below.</p>
                     
                     <div className="mb-6 bg-background rounded-lg p-4 border border-border">
                         <Label className="inline-block mb-2 font-medium">Attach Document (PDF, Word, Images)</Label>
                         <Input 
                             type="file" 
                             className="cursor-pointer file:cursor-pointer pb-2" 
                             onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) {
                                     setAnswers(prev => ({ ...prev, 'uploaded_file': { type: 'file', file, name: file.name }}));
                                     toast.success(`${file.name} attached!`);
                                 }
                             }} 
                         />
                         {answers['uploaded_file'] && (
                             <p className="text-xs text-green-600 mt-2 font-medium flex items-center gap-1">
                                 <CheckCircle2 className="w-3.5 h-3.5"/> Document "{answers['uploaded_file'].name}" is ready for submission.
                             </p>
                         )}
                     </div>

                     <Textarea 
                         placeholder="Type any additional text answers or notes here..."
                         className="min-h-[250px] bg-secondary/30"
                         value={answers['essay']?.text || ''}
                         onChange={(e) => setAnswers((prev) => ({ ...prev, essay: { type: 'essay', text: e.target.value } }))}
                     />
                  </div>
               </CardContent>
             </Card>
          )}
        </div>
      </div>
    </AppLayout>);
};
export default ExamTake;

