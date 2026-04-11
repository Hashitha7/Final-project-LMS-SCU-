import { useEffect, useMemo, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import * as api from '@/lib/api';

const formatSubmissionAnswers = (rawAnswers) => {
  if (rawAnswers == null) return 'No answers submitted.';

  const toPrettyJson = (value) => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value ?? '');
    }
  };

  let parsed = rawAnswers;
  if (typeof rawAnswers === 'string') {
    const trimmed = rawAnswers.trim();
    if (!trimmed) return 'No answers submitted.';

    try {
      parsed = JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return String(parsed);
  }

  const sections = [];
  const responses = parsed.responses && typeof parsed.responses === 'object' ? parsed.responses : null;

  if (responses && Object.keys(responses).length > 0) {
    const responseLines = Object.entries(responses).map(([questionId, answer]) => {
      if (answer?.type === 'mcq') {
        return `Question ${questionId}: Option ${Number(answer.selectedIndex) + 1}`;
      }
      if (answer?.type === 'essay') {
        const text = String(answer.text ?? '').trim();
        return `Question ${questionId}: ${text || '(empty essay answer)'}`;
      }
      if (answer?.type === 'file') {
        const fileName = answer.name || '(unnamed file)';
        const fileUrl = answer.url ? ` (${answer.url})` : '';
        return `Question ${questionId}: Uploaded file ${fileName}${fileUrl}`;
      }

      return `Question ${questionId}: ${toPrettyJson(answer)}`;
    });

    sections.push(['Responses', responseLines.join('\n')].join('\n'));
  }

  if (parsed.autoScore) {
    const mcqScore = parsed.autoScore.mcqScore ?? 0;
    const mcqMaxScore = parsed.autoScore.mcqMaxScore ?? 0;
    sections.push(`Auto Score\nMCQ: ${mcqScore}/${mcqMaxScore}`);
  }

  if (typeof parsed.tabWarnings !== 'undefined') {
    sections.push(`Integrity\nTab warnings: ${parsed.tabWarnings}`);
  }

  if (sections.length === 0) {
    const plain = toPrettyJson(parsed);
    return plain.trim() ? plain : 'No answers submitted.';
  }

  return sections.join('\n\n');
};

const extractSubmissionFiles = (rawAnswers) => {
  if (!rawAnswers) return [];

  let parsed = rawAnswers;
  if (typeof rawAnswers === 'string') {
    try {
      parsed = JSON.parse(rawAnswers);
    } catch {
      return [];
    }
  }

  if (!parsed || typeof parsed !== 'object') return [];
  const files = [];

  const collectFiles = (source, sourceLabel = 'sheet') => {
    if (!source || typeof source !== 'object') return;
    for (const [key, answer] of Object.entries(source)) {
      if (answer?.type === 'file') {
        files.push({
          questionId: key,
          name: answer.name || `${sourceLabel}-${key}`,
          url: answer.url || null,
        });
      }
    }
  };

  collectFiles(parsed.responses, 'response');
  collectFiles(parsed, 'answer');

  return files.filter((file, index, arr) =>
    arr.findIndex((x) => x.questionId === file.questionId && x.name === file.name && x.url === file.url) === index
  );
};

const ExamReview = () => {
  const { user } = useAuth();
  const { exams } = useLmsData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedExamId, setSelectedExamId] = useState(searchParams.get('examId') || 'all');
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeSubmissionId, setActiveSubmissionId] = useState(null);
  const [activeFileUrl, setActiveFileUrl] = useState('');
  const [resolvedFileUrls, setResolvedFileUrls] = useState({});
  const [resolvingFileKey, setResolvingFileKey] = useState('');
  const [mark, setMark] = useState('');
  const [teacherComments, setTeacherComments] = useState('');
  const canReview = user?.role === 'teacher' || user?.role === 'institute' || user?.role === 'admin';
  const isTeacher = user?.role === 'teacher';

  const teacherExams = useMemo(
    () => exams.filter((exam) => String(exam?.teacher?.id ?? exam?.teacherId ?? '') === String(user?.id ?? '')),
    [exams, user?.id]
  );

  const reviewableExams = isTeacher ? teacherExams : exams;

  const normalizeToAll = () => {
    setSelectedExamId('all');
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('examId');
    setSearchParams(nextParams, { replace: true });
  };

  const isNumericId = (value) => /^\d+$/.test(String(value ?? '').trim());
  const canTeacherReviewExamId = (examId) => reviewableExams.some((exam) => String(exam.id) === String(examId));

  const loadSubmissions = async (examId) => {
    const rawExamId = String(examId ?? 'all');
    const useExamFilter = rawExamId !== 'all' && isNumericId(rawExamId) && (!isTeacher || canTeacherReviewExamId(rawExamId));
    const safeExamId = useExamFilter ? rawExamId : 'all';

    if (rawExamId !== safeExamId) {
      normalizeToAll();
    }

    setLoading(true);
    try {
      const data = safeExamId !== 'all'
        ? await api.examSubmissions.getByExam(safeExamId)
        : await api.examSubmissions.getAll();
      setSubmissions(data || []);
    } catch (error) {
      const status = error?.response?.status;
      if (safeExamId !== 'all' && (status === 400 || status === 403 || status === 404)) {
        try {
          const fallback = await api.examSubmissions.getAll();
          setSubmissions(fallback || []);
          normalizeToAll();
          toast.error('Selected exam is not available for review. Showing all submissions.');
          return;
        } catch {
          // Fall through to generic message below.
        }
      }
      console.error('Failed to load exam submissions', error);
      toast.error('Failed to load submitted answers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions(selectedExamId);
  }, [selectedExamId]);

  const activeSubmission = useMemo(
    () => submissions.find((s) => s.id === activeSubmissionId) || null,
    [submissions, activeSubmissionId]
  );

  const activeSubmissionAnswerText = useMemo(
    () => formatSubmissionAnswers(activeSubmission?.answers),
    [activeSubmission]
  );

  const activeSubmissionFiles = useMemo(
    () => extractSubmissionFiles(activeSubmission?.answers),
    [activeSubmission]
  );

  const activeSubmissionFilesWithResolvedUrls = useMemo(
    () => activeSubmissionFiles.map((file) => {
      const fileKey = `${file.questionId}|${file.name}`;
      return {
        ...file,
        url: file.url || resolvedFileUrls[fileKey] || null,
      };
    }),
    [activeSubmissionFiles, resolvedFileUrls]
  );

  useEffect(() => {
    const firstFileWithUrl = activeSubmissionFilesWithResolvedUrls.find((file) => Boolean(file.url));
    if (firstFileWithUrl?.url) {
      setActiveFileUrl(firstFileWithUrl.url);
    } else {
      setActiveFileUrl('');
    }
  }, [activeSubmissionFilesWithResolvedUrls]);

  useEffect(() => {
    setResolvedFileUrls({});
    setResolvingFileKey('');
  }, [activeSubmissionId]);

  const onResolveFileUrl = async (file) => {
    const fileKey = `${file.questionId}|${file.name}`;
    setResolvingFileKey(fileKey);
    try {
      const response = await api.files.resolveByName(file.name, 'exam-submissions');
      const resolvedUrl = response?.url || null;
      if (!resolvedUrl) {
        toast.error('Could not resolve a downloadable file URL from AWS.');
        return;
      }

      setResolvedFileUrls((prev) => ({ ...prev, [fileKey]: resolvedUrl }));
      setActiveFileUrl(resolvedUrl);
      toast.success('File URL resolved from AWS. You can download now.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to resolve file from AWS.';
      toast.error(message);
    } finally {
      setResolvingFileKey('');
    }
  };

  useEffect(() => {
    if (!activeSubmission) {
      setMark('');
      setTeacherComments('');
      return;
    }
    setMark(String(activeSubmission.mark ?? 0));
    setTeacherComments(activeSubmission.teacherComments || '');
  }, [activeSubmission]);

  if (!user) return <Navigate to="/login" />;
  if (!canReview) return <Navigate to="/app/exams" />;

  const onExamChange = (value) => {
    setSelectedExamId(value);
    if (value === 'all') {
      searchParams.delete('examId');
      setSearchParams(searchParams);
    } else {
      setSearchParams({ examId: value });
    }
  };

  const onSaveReview = async () => {
    if (!activeSubmission) {
      toast.error('Select a submission first');
      return;
    }

    const markValue = Number(mark);
    if (Number.isNaN(markValue) || markValue < 0) {
      toast.error('Mark must be 0 or higher');
      return;
    }

    try {
      await api.examSubmissions.review(activeSubmission.id, {
        mark: markValue,
        teacherComments,
        isFinalMarkCalculated: 1,
        state: 2,
      });
      toast.success('Marks submitted successfully');
      await loadSubmissions(selectedExamId);
      setActiveSubmissionId(null);
    } catch (error) {
      console.error('Failed to submit marks', error);
      toast.error('Failed to submit marks');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pt-12 lg:pt-0">
        <PageHeader
          title="Review Exam Answers"
          subtitle="Select a student submission, review answers, and submit marks"
        />

        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2 md:col-span-2">
                <Label>Filter by Exam</Label>
                <Select value={selectedExamId} onValueChange={onExamChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an exam" />
                  </SelectTrigger>
                  <SelectContent className="bg-blue-50 [&_[data-highlighted]]:bg-blue-200 [&_[data-highlighted]]:text-blue-900 border-border">
                    <SelectItem value="all">All exams</SelectItem>
                    {reviewableExams.map((exam) => (
                      <SelectItem key={String(exam.id)} value={String(exam.id)}>
                        {exam.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm transition-colors border-transparent" onClick={() => loadSubmissions(selectedExamId)} disabled={loading}>
                {loading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Submitted Answers</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Submitted At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Mark</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.examTitle || '-'}</TableCell>
                    <TableCell>{item.studentName || '-'}</TableCell>
                    <TableCell>
                      {item.endDateTime ? new Date(item.endDateTime).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.isFinalMarkCalculated === 1 ? 'default' : 'secondary'}>
                        {item.isFinalMarkCalculated === 1 ? 'Reviewed' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.mark ?? 0}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white border-transparent" onClick={() => setActiveSubmissionId(item.id)}>
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {submissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No submissions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {activeSubmission && (
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>
                Review: {activeSubmission.studentName || 'Student'} - {activeSubmission.examTitle || 'Exam'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Student Answer Sheet</Label>
                {activeSubmissionFilesWithResolvedUrls.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {activeSubmissionFilesWithResolvedUrls.map((file) => (
                        <div key={`${file.questionId}-${file.url}`} className="flex gap-2">
                          <Button
                            size="sm"
                            variant={activeFileUrl === file.url ? 'default' : 'outline'}
                            onClick={() => file.url && setActiveFileUrl(file.url)}
                          >
                            {file.name}
                          </Button>
                          {file.url ? (
                            <Button asChild size="sm" variant="outline">
                              <a href={file.url} download={file.name} target="_blank" rel="noreferrer">Download</a>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onResolveFileUrl(file)}
                              disabled={resolvingFileKey === `${file.questionId}|${file.name}`}
                            >
                              {resolvingFileKey === `${file.questionId}|${file.name}` ? 'Resolving...' : 'Resolve from AWS'}
                            </Button>
                          )}
                        </div>
                      ))}
                      {activeFileUrl && (
                        <>
                          <Button asChild size="sm" variant="outline">
                            <a href={activeFileUrl} target="_blank" rel="noreferrer">Open in New Tab</a>
                          </Button>
                          <Button asChild size="sm" variant="outline">
                            <a href={activeFileUrl} download target="_blank" rel="noreferrer">Download Selected</a>
                          </Button>
                        </>
                      )}
                    </div>
                    {activeFileUrl ? (
                      <div className="rounded-md border bg-background overflow-hidden">
                        <iframe
                          title="Student Answer Sheet Preview"
                          src={activeFileUrl}
                          className="w-full h-[520px]"
                        />
                      </div>
                    ) : (
                      <div className="rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                        This submission contains file metadata, but no downloadable URL was saved for the file.
                      </div>
                    )}
                  </div>
                ) : (
                  <Textarea
                    value={activeSubmissionAnswerText}
                    readOnly
                    rows={12}
                    className="font-mono text-xs"
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mark</Label>
                  <Input
                    type="number"
                    min="0"
                    value={mark}
                    onChange={(e) => setMark(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Submitted Time</Label>
                  <Input
                    readOnly
                    value={activeSubmission.endDateTime ? new Date(activeSubmission.endDateTime).toLocaleString() : '-'}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Teacher Comments</Label>
                <Textarea
                  value={teacherComments}
                  onChange={(e) => setTeacherComments(e.target.value)}
                  placeholder="Enter feedback for the student"
                  rows={5}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setActiveSubmissionId(null)}>Cancel</Button>
                <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-sm border-transparent transition-colors" onClick={onSaveReview}>
                  Submit Marks
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default ExamReview;
