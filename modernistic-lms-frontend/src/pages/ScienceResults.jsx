import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, ArrowLeft, CheckCircle2, XCircle, FileText, BarChart3, Loader2, Star, Microscope, Atom, Zap, User } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import api from '@/lib/api';

const ScoreCircle = ({ score, size = 160 }) => {
    const radius = (size - 20) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444';

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth="8"
                    strokeDasharray={circumference} strokeDashoffset={offset}
                    strokeLinecap="round" className="transition-all duration-1000 ease-out" />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-4xl font-bold" style={{ color }}>{score?.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">out of 100</span>
            </div>
        </div>
    );
};

const ScienceResults = () => {
    const { answerId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const isStudent = user?.role === 'student';
    const canAnalyze = user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'institute';
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    // Student dropdown state (admin/teacher only)
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedStudentName, setSelectedStudentName] = useState('');

    // All results (for student navigation lookup)
    const [allResults, setAllResults] = useState([]);

    // Load students list for admin/teacher
    useEffect(() => {
        if (canAnalyze) {
            setLoadingStudents(true);
            // Load students + all results in parallel
            Promise.all([
                api.get('/students').then(r => r.data || []),
                api.get('/science-analyst/results').then(r => r.data || [])
            ])
                .then(([studentsData, resultsData]) => {
                    setStudents(studentsData);
                    setAllResults(resultsData);
                })
                .catch(() => {})
                .finally(() => setLoadingStudents(false));
        }
    }, [canAnalyze]);

    // When result loads, pre-select the student from the result
    useEffect(() => {
        if (result?.student_name && students.length > 0) {
            const found = students.find(s =>
                s.name.trim().toLowerCase() === result.student_name.trim().toLowerCase()
            );
            if (found) {
                setSelectedStudentId(String(found.id));
                setSelectedStudentName(found.name);
            } else {
                setSelectedStudentName(result.student_name);
            }
        }
    }, [result, students]);

    // When a student is selected from dropdown → assign this result to them
    const handleStudentSelect = async (studentId) => {
        setSelectedStudentId(studentId);
        const found = students.find(s => String(s.id) === String(studentId));
        const studentName = found ? found.name : '';
        setSelectedStudentName(studentName);

        if (!studentName || !answerId || answerId === 'latest') return;

        try {
            // Re-assign this result to the selected student
            await api.put(`/science-analyst/results/${answerId}/student`, { studentName });
            
            // Update local state so it shows up correctly
            setResult(prev => ({ ...prev, student_name: studentName }));
            
            // Update allResults cache so other navigation won't break
            setAllResults(prev => prev.map(r => 
                String(r.id) === String(answerId) ? { ...r, studentName: studentName } : r
            ));
            
            toast.success(`Analysis assigned to ${studentName}`);
        } catch (error) {
            console.error('Failed to update student:', error);
            toast.error('Failed to assign result to student.');
        }
    };

    // Reset result whenever answerId changes (so navigation between students reloads)
    useEffect(() => {
        setResult(null);
        setLoading(true);
    }, [answerId]);

    // Fetch result for current answerId
    useEffect(() => {
        if (answerId && answerId !== 'latest') {
            setLoading(true);
            api.get(`/science-analyst/results/${answerId}`)
                .then(r => {
                    const data = r.data;
                    setResult({
                        success: true,
                        score: data.score,
                        grade: data.gradeLabel,
                        similarity_score: data.similarityScore,
                        keyword_coverage: data.keywordCoverage,
                        matched_keywords: data.matchedKeywords ? data.matchedKeywords.split(', ').filter(Boolean) : [],
                        missed_keywords: data.missedKeywords ? data.missedKeywords.split(', ').filter(Boolean) : [],
                        total_keywords: data.totalKeywords,
                        matched_count: data.matchedCount,
                        missed_count: data.missedCount,
                        feedback: data.feedback,
                        question_topic: data.questionTopic,
                        question_subject: data.subject,
                        question_grade: data.grade,
                        student_answer_preview: data.extractedText,
                        word_count: data.wordCount,
                        extraction_info: {
                            file_name: data.fileName,
                            word_count: data.wordCount
                        },
                        student_name: data.studentName,
                        analyzed_at: data.analyzedAt
                    });
                })
                .catch(err => {
                    console.error('Failed to load result:', err);
                    setResult(null);
                })
                .finally(() => setLoading(false));
        }
    }, [answerId]);

    if (loading) {
        return (
            <AppLayout>
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </AppLayout>
        );
    }

    if (!result) {
        return (
            <AppLayout>
                <div className="text-center py-24">
                    <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                    <h2 className="text-xl font-bold text-foreground mb-2">Result Not Found</h2>
                    <p className="text-muted-foreground mb-4">The analysis result could not be found.</p>
                    <Button onClick={() => navigate('/app/science-analyst')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Analyst
                    </Button>
                </div>
            </AppLayout>
        );
    }

    const subjectIcon = {
        'Biology': <Microscope className="w-5 h-5" />,
        'Chemistry': <Atom className="w-5 h-5" />,
        'Physics': <Zap className="w-5 h-5" />,
    };

    const gradeColor = {
        'Excellent': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
        'Good': 'bg-blue-500/10 text-blue-500 border-blue-500/30',
        'Fair': 'bg-amber-500/10 text-amber-500 border-amber-500/30',
        'Needs Improvement': 'bg-red-500/10 text-red-500 border-red-500/30'
    };

    const gradeEmoji = {
        'Excellent': '🌟',
        'Good': '👍',
        'Fair': '📝',
        'Needs Improvement': '📚'
    };

    // Build per-question breakdown from either:
    //   a) fresh analysis data (result.per_question array), OR
    //   b) DB-stored result by parsing prefixed keywords + feedback text
    const parsePerQuestion = () => {
        // (a) Fresh result already has structured per_question
        if (result.per_question && result.per_question.length > 1) {
            return result.per_question;
        }

        // (b) Try to reconstruct from Q1./Q2. prefixed keywords
        const matched = result.matched_keywords || [];
        const missed  = result.missed_keywords  || [];

        // Group keywords by their "Q1. keyword" → { Q1: [...], Q2: [...] }
        const groupByQ = (arr) => {
            const map = {};
            arr.forEach(kw => {
                const m = kw.match(/^(Q\d+)[.\s]+(.+)$/);
                if (m) {
                    const q = m[1];
                    if (!map[q]) map[q] = [];
                    map[q].push(m[2].trim());
                }
            });
            return map;
        };

        const matchedByQ = groupByQ(matched);
        const missedByQ  = groupByQ(missed);
        const questions  = Object.keys({ ...matchedByQ, ...missedByQ }).sort();
        if (questions.length < 2) return null;   // single question — use old view

        // Parse per-question scores + feedback from the combined feedback string
        // Format: "### Q1. [Topic] (Score: 46.9%)\nfeedback text..."
        const feedbackMap = {};
        if (result.feedback) {
            const sectionRe = /###\s*(Q\d+)[^\n]*(?:\[([^\]]*)\])?\s*\(Score:\s*([\d.]+)%\)\s*([\s\S]*?)(?=\n###|\n\n###|$)/g;
            let fm;
            while ((fm = sectionRe.exec(result.feedback)) !== null) {
                feedbackMap[fm[1]] = {
                    topic:    fm[2] && fm[2] !== 'Unknown' ? fm[2] : '',
                    score:    parseFloat(fm[3]),
                    feedback: fm[4].trim(),
                };
            }
        }

        return questions.map(q => ({
            question: q,
            topic:    feedbackMap[q]?.topic    || '',
            score:    feedbackMap[q]?.score    ?? 0,
            feedback: feedbackMap[q]?.feedback || '',
            matched_keywords: matchedByQ[q] || [],
            missed_keywords:  missedByQ[q]  || [],
        }));
    };

    const perQuestion = parsePerQuestion();

    return (
        <AppLayout>
            <div className="space-y-6 pt-12 lg:pt-0 max-w-5xl">
                {/* Back Button */}
                <Button variant="ghost" size="sm" onClick={() => navigate('/app/science-analyst')} className="text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Science AI Analyst
                </Button>

                {/* Header */}
                <div className="mb-4">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Brain className="w-7 h-7 text-primary" />
                        Analysis Results
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                        {result.question_grade && <Badge variant="outline">Grade {result.question_grade}</Badge>}
                        {result.question_subject && (
                            <Badge variant="outline" className="flex items-center gap-1">
                                {subjectIcon[result.question_subject]} {result.question_subject}
                            </Badge>
                        )}
                        {result.question_topic && <Badge variant="outline">{result.question_topic}</Badge>}

                        {/* Student Dropdown — admin/teacher only */}
                        {canAnalyze && (
                            <div className="flex items-center gap-2">
                                <span className="text-muted-foreground">•</span>
                                <Select
                                    value={selectedStudentId}
                                    onValueChange={handleStudentSelect}
                                    disabled={loadingStudents}
                                >
                                    <SelectTrigger className="h-8 min-w-[180px] max-w-[260px] text-sm border-border bg-background">
                                        {loadingStudents ? (
                                            <span className="flex items-center gap-2 text-muted-foreground">
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
                                            </span>
                                        ) : (
                                            <SelectValue placeholder="Select Student" />
                                        )}
                                    </SelectTrigger>
                                    <SelectContent className="max-h-64 bg-blue-50 [&_[data-highlighted]]:bg-blue-200 [&_[data-highlighted]]:text-blue-900 border-border">
                                        {students.length === 0 && !loadingStudents ? (
                                            <div className="py-3 px-4 text-sm text-muted-foreground text-center">No students found</div>
                                        ) : (
                                            students.map(s => (
                                                <SelectItem key={s.id} value={String(s.id)}>
                                                    <span className="flex items-center gap-2">
                                                        <User className="w-3.5 h-3.5 text-muted-foreground" />
                                                        {s.name}
                                                        {s.grade && <span className="text-xs text-muted-foreground ml-1">({s.grade})</span>}
                                                    </span>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Student view — show plain name */}
                        {isStudent && result.student_name && (
                            <span>• Student: <strong>{result.student_name}</strong></span>
                        )}
                    </div>
                </div>

                {/* Score + Grade Card */}
                <Card className="glass-card overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-transparent p-8">
                        <div className="flex flex-col sm:flex-row items-center gap-8">
                            {/* Score Circle */}
                            <ScoreCircle score={result.score || 0} />

                            {/* Grade & Details */}
                            <div className="flex-1 text-center sm:text-left">
                                <div className="flex items-center gap-3 justify-center sm:justify-start mb-3">
                                    <span className="text-4xl">{gradeEmoji[result.grade] || '📝'}</span>
                                    <Badge className={`text-lg px-4 py-1 ${gradeColor[result.grade] || gradeColor['Fair']}`}>
                                        {result.grade}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div className="bg-background/50 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-foreground">{result.similarity_score?.toFixed(1)}%</p>
                                        <p className="text-xs text-muted-foreground">Content Similarity</p>
                                    </div>
                                    <div className="bg-background/50 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-foreground">{result.keyword_coverage?.toFixed(1)}%</p>
                                        <p className="text-xs text-muted-foreground">Keyword Coverage</p>
                                    </div>
                                    <div className="bg-background/50 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-emerald-500">{result.matched_count || 0}</p>
                                        <p className="text-xs text-muted-foreground">Keywords Matched</p>
                                    </div>
                                    <div className="bg-background/50 rounded-lg p-3 text-center">
                                        <p className="text-2xl font-bold text-red-500">{result.missed_count || 0}</p>
                                        <p className="text-xs text-muted-foreground">Keywords Missed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Feedback — shown only for single question (multi-q feedback is embedded per card) */}
                {result.feedback && !perQuestion && (
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Star className="w-5 h-5 text-amber-500" /> Feedback
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-foreground leading-relaxed whitespace-pre-line">{result.feedback}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Per-Question: Feedback + Matched/Missed Keywords */}
                {perQuestion ? (
                    <div className="space-y-4">
                        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            Per-Question Analysis
                        </h2>
                        {perQuestion.map((q, idx) => {
                            const qColor = q.score >= 80 ? 'emerald' : q.score >= 60 ? 'blue' : q.score >= 40 ? 'amber' : 'red';
                            const colorMap = {
                                emerald: 'bg-emerald-500/5 border-emerald-500/20',
                                blue:    'bg-blue-500/5 border-blue-500/20',
                                amber:   'bg-amber-500/5 border-amber-500/20',
                                red:     'bg-red-500/5 border-red-500/20',
                            };
                            const scoreColor = {
                                emerald: 'text-emerald-500',
                                blue:    'text-blue-500',
                                amber:   'text-amber-500',
                                red:     'text-red-500',
                            };
                            return (
                                <Card key={idx} className={`glass-card border ${colorMap[qColor]}`}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-base font-semibold text-foreground">
                                                {q.question}
                                                {q.topic && <span className="text-xs font-normal text-muted-foreground ml-2">— {q.topic}</span>}
                                            </CardTitle>
                                            <Badge className={`${scoreColor[qColor]} bg-transparent border border-current text-sm font-bold`}>
                                                {q.score?.toFixed ? q.score.toFixed(1) : q.score}%
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {/* Feedback for this question */}
                                        {q.feedback && (
                                            <>
                                                <div className="bg-muted/40 rounded-lg px-4 py-3">
                                                    <p className="text-xs font-medium text-amber-500 mb-1 flex items-center gap-1">
                                                        <Star className="w-3.5 h-3.5" /> Feedback
                                                    </p>
                                                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{q.feedback}</p>
                                                </div>
                                                <Separator />
                                            </>
                                        )}
                                        {/* Matched */}
                                        <div>
                                            <p className="text-xs font-medium text-emerald-500 mb-1.5 flex items-center gap-1">
                                                <CheckCircle2 className="w-3.5 h-3.5" /> Matched Keywords ({q.matched_keywords?.length || 0})
                                            </p>
                                            {q.matched_keywords?.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {q.matched_keywords.map((kw, i) => (
                                                        <Badge key={i} className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs">
                                                            ✅ {kw}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic">No keywords matched</p>
                                            )}
                                        </div>
                                        <Separator />
                                        {/* Missed */}
                                        <div>
                                            <p className="text-xs font-medium text-red-500 mb-1.5 flex items-center gap-1">
                                                <XCircle className="w-3.5 h-3.5" /> Missed Keywords ({q.missed_keywords?.length || 0})
                                            </p>
                                            {q.missed_keywords?.length > 0 ? (
                                                <div className="flex flex-wrap gap-1.5">
                                                    {q.missed_keywords.map((kw, i) => (
                                                        <Badge key={i} className="bg-red-500/10 text-red-500 border-red-500/20 text-xs">
                                                            ❌ {kw}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-xs text-emerald-500 italic">All keywords covered! 🎉</p>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    /* Single question — combined keywords view */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="glass-card">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base text-emerald-500">
                                    <CheckCircle2 className="w-5 h-5" /> Matched Keywords ({result.matched_keywords?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {result.matched_keywords?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {result.matched_keywords.map((kw, i) => (
                                            <Badge key={i} className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20">
                                                ✅ {kw}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No keywords matched</p>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="glass-card">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base text-red-500">
                                    <XCircle className="w-5 h-5" /> Missed Keywords ({result.missed_keywords?.length || 0})
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {result.missed_keywords?.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {result.missed_keywords.map((kw, i) => (
                                            <Badge key={i} className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">
                                                ❌ {kw}
                                            </Badge>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">All keywords covered! 🎉</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Extracted Answer Text */}
                {result.student_answer_preview && (
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="w-5 h-5" />
                                Extracted Answer Text
                                {result.word_count && <span className="text-sm font-normal text-muted-foreground">({result.word_count} words)</span>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground leading-relaxed max-h-[400px] overflow-y-auto whitespace-pre-line">
                                {result.student_answer_preview}
                            </div>
                            {result.extraction_info?.file_name && (
                                <p className="text-xs text-muted-foreground mt-3">
                                    📄 Source file: {result.extraction_info.file_name}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Action buttons */}
                <div className="flex justify-between mt-6">
                    <Button className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 shadow-sm transition-colors" onClick={() => navigate('/app/science-analyst')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    {/* Only admin/teacher can upload — hide Analyze Another for students */}
                    {!isStudent && (
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white shadow-md transition-colors" onClick={() => navigate('/app/science-analyst')}>
                            <Brain className="w-4 h-4 mr-2" /> Analyze Another
                        </Button>
                    )}
                </div>
            </div>
        </AppLayout>
    );
};

export default ScienceResults;
