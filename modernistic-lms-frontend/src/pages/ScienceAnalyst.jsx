import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/sonner';
import { Brain, Upload, FileText, CheckCircle2, XCircle, BarChart3, Loader2, Microscope, Atom, Zap, Eye, Trash2, User } from 'lucide-react';
import api from '@/lib/api';

const ScienceAnalyst = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Upload state
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [grade, setGrade] = useState('');
    const [subject, setSubject] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [selectedStudentName, setSelectedStudentName] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [errors, setErrors] = useState({});        // field-level validation errors
    const [submitAttempted, setSubmitAttempted] = useState(false);

    // Students list (for admin/teacher dropdown)
    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Results state
    const [results, setResults] = useState([]);
    const [loadingResults, setLoadingResults] = useState(true);

    const isStudent = user?.role === 'student';
    const canAnalyze = user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'institute';

    // Load students list for admin/teacher
    useEffect(() => {
        if (canAnalyze) {
            setLoadingStudents(true);
            api.get('/students')
                .then(r => setStudents(r.data || []))
                .catch(err => {
                    console.error('Failed to load students:', err);
                    setStudents([]);
                })
                .finally(() => setLoadingStudents(false));
        }

        // If student is logged in, auto-use their own name
        if (isStudent && user?.name) {
            setSelectedStudentName(user.name);
            setSelectedStudentId(String(user.id));
        }
    }, [user, canAnalyze, isStudent]);

    // Load results on mount
    useEffect(() => {
        loadResults();
    }, []);

    const loadResults = () => {
        setLoadingResults(true);
        api.get('/science-analyst/results')
            .then(r => setResults(r.data))
            .catch(err => console.error('Failed to load results:', err))
            .finally(() => setLoadingResults(false));
    };

    // Filter results based on role — students only see their own
    const visibleResults = useMemo(() => {
        if (!results) return [];
        if (isStudent && user?.name) {
            return results.filter(r =>
                r.studentName && r.studentName.trim().toLowerCase() === user.name.trim().toLowerCase()
            );
        }
        return results;
    }, [results, isStudent, user]);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this analysis result? This cannot be undone.')) return;
        try {
            await api.delete(`/science-analyst/results/${id}`);
            setResults(prev => prev.filter(r => r.id !== id));
            toast.success('Analysis result deleted.');
        } catch (err) {
            toast.error('Failed to delete. Please try again.');
        }
    };

    // Stats — based on visible results (role-filtered)
    const stats = useMemo(() => {
        const total = visibleResults.length;
        const avgScore = total > 0 ? (visibleResults.reduce((sum, r) => sum + (r.score || 0), 0) / total).toFixed(1) : 0;
        const excellent = visibleResults.filter(r => r.gradeLabel === 'Excellent').length;
        const needsImprovement = visibleResults.filter(r => r.gradeLabel === 'Needs Improvement').length;
        return { total, avgScore, excellent, needsImprovement };
    }, [visibleResults]);

    // File handling
    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
        else if (e.type === 'dragleave') setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            // Client-side file size check (max 10 MB)
            if (selected.size > 10 * 1024 * 1024) {
                toast.error('File too large. Maximum size is 10 MB.');
                e.target.value = '';
                return;
            }
            setFile(selected);
            setErrors(prev => ({ ...prev, file: undefined }));
        }
    };

    // Handle student dropdown selection
    const handleStudentSelect = (studentId) => {
        setSelectedStudentId(studentId);
        const found = students.find(s => String(s.id) === String(studentId));
        setSelectedStudentName(found ? found.name : '');
        setErrors(p => ({ ...p, studentName: undefined }));
    };

    // Validate all required fields — returns error object
    const validateForm = () => {
        const errs = {};
        if (!file) errs.file = 'Please select a PDF file to upload.';
        if (!grade) errs.grade = 'Grade is required.';
        if (!subject) errs.subject = 'Subject is required.';
        return errs;
    };

    // Submit for analysis
    const handleAnalyze = async () => {
        setSubmitAttempted(true);
        const errs = validateForm();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            toast.error('Please fix the errors before submitting.');
            return;
        }
        setErrors({});
        setIsAnalyzing(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('grade', grade);
            if (subject && subject !== 'mixed') formData.append('subject', subject);  // omit for mixed papers
            formData.append('student_name', selectedStudentName || 'Unknown Student');
            formData.append('teacher_name', user?.name || 'Unknown Teacher');

            const response = await api.post('/science-analyst/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const result = response.data;

            if (result.success) {
                toast.success(`Analysis complete! Score: ${result.score}%`);
                // Navigate to results page with the analysis data
                if (result.db_id) {
                    navigate(`/app/science-analyst/results/${result.db_id}`);
                } else {
                    navigate('/app/science-analyst/results/latest', { state: { result } });
                }
            } else {
                toast.error(result.error || 'Analysis failed');
            }
        } catch (err) {
            console.error('Analysis error:', err);
            const message = err.response?.data?.error || 'Failed to analyze. Make sure the Python Flask service is running.';
            toast.error(message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const gradeColor = (g) => {
        switch (g) {
            case 'Excellent': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'Good': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'Fair': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
            default: return 'bg-red-500/10 text-red-500 border-red-500/20';
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 pt-12 lg:pt-0">
                {/* Header */}
                <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-1">Science / AI Answer Analyst</p>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                        <Brain className="w-7 h-7 text-primary" />
                        Science AI Answer Analyst
                    </h1>
                    <p className="text-muted-foreground mt-1">Upload student answer sheets for AI-powered keyword analysis</p>
                </div>


                {/* Stats Row */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <Card className="glass-card p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                            <p className="text-xs text-muted-foreground">Total Analyses</p>
                        </div>
                    </Card>
                    <Card className="glass-card p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats.avgScore}%</p>
                            <p className="text-xs text-muted-foreground">Average Score</p>
                        </div>
                    </Card>
                    <Card className="glass-card p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats.excellent}</p>
                            <p className="text-xs text-muted-foreground">Excellent</p>
                        </div>
                    </Card>
                    <Card className="glass-card p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                            <XCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stats.needsImprovement}</p>
                            <p className="text-xs text-muted-foreground">Needs Work</p>
                        </div>
                    </Card>
                </div>

                {/* Upload Section (Teacher/Admin only) */}
                {canAnalyze && (
                    <Card className="glass-card">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="w-5 h-5 text-primary" />
                                Upload Student Answer Sheet
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Grade & Subject selectors */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Grade <span className="text-red-500">*</span></Label>
                                    <Select value={grade} onValueChange={v => { setGrade(v); setErrors(p => ({ ...p, grade: undefined })); }}>
                                        <SelectTrigger className={errors.grade ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select Grade" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-blue-50 [&_[data-highlighted]]:bg-blue-200 [&_[data-highlighted]]:text-blue-900 border-border">
                                            <SelectItem value="10">Grade 10</SelectItem>
                                            <SelectItem value="11">Grade 11</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.grade && <p className="text-xs text-red-500">{errors.grade}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Subject <span className="text-red-500">*</span></Label>
                                    <Select value={subject} onValueChange={v => { setSubject(v); setErrors(p => ({ ...p, subject: undefined })); }}>
                                        <SelectTrigger className={errors.subject ? 'border-red-500' : ''}>
                                            <SelectValue placeholder="Select Subject" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-blue-50 [&_[data-highlighted]]:bg-blue-200 [&_[data-highlighted]]:text-blue-900 border-border">
                                            <SelectItem value="mixed">
                                                <span className="flex items-center gap-2">🔬 Mixed Paper (All Subjects)</span>
                                            </SelectItem>
                                            <SelectItem value="Biology">
                                                <span className="flex items-center gap-2"><Microscope className="w-4 h-4" /> Biology</span>
                                            </SelectItem>
                                            <SelectItem value="Chemistry">
                                                <span className="flex items-center gap-2"><Atom className="w-4 h-4" /> Chemistry</span>
                                            </SelectItem>
                                            <SelectItem value="Physics">
                                                <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> Physics</span>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.subject && <p className="text-xs text-red-500">{errors.subject}</p>}
                                </div>
                            </div>

                            {/* File Upload Zone */}
                            <div
                                className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${dragActive
                                    ? 'border-primary bg-primary/5 scale-[1.01]'
                                    : file
                                        ? 'border-emerald-500 bg-emerald-500/5'
                                        : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'
                                    }`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('file-upload-input').click()}
                            >
                                <input
                                    id="file-upload-input"
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                {file ? (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-3 bg-emerald-500/10 rounded-full">
                                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                                        </div>
                                        <p className="font-medium text-foreground">{file.name}</p>
                                        <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); setFile(null); }}>
                                            Remove & Upload Different File
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-4 bg-primary/10 rounded-full">
                                            <Upload className="w-8 h-8 text-primary" />
                                        </div>
                                        <h3 className="text-lg font-medium text-foreground">Upload Answer Sheet</h3>
                                        <p className="text-sm text-muted-foreground max-w-xs">
                                            Drag & drop a <strong>PDF or Image</strong> file here, or click to browse.
                                        </p>
                                        <p className="text-xs text-muted-foreground">Supported: PDF, PNG, JPG (typed or handwritten answers)</p>
                                    </div>
                                )}
                            </div>

                            {errors.file && (
                                <p className="text-xs text-red-500 mt-1">{errors.file}</p>
                            )}

                            {/* Validation summary + Analyze Button */}
                            <div className="flex items-center justify-between gap-4">
                                {submitAttempted && Object.keys(errors).length > 0 ? (
                                    <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2">
                                        <XCircle className="w-4 h-4 flex-shrink-0" />
                                        <span>Please fix {Object.keys(errors).length} error(s) before submitting.</span>
                                    </div>
                                ) : (
                                    <span />
                                )}
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2.5 shadow-md transition-colors"
                                    size="lg"
                                >
                                    {isAnalyzing ? (
                                        <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Analyzing...</>
                                    ) : (
                                        <><Brain className="w-5 h-5 mr-2" /> Analyze Answer</>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Results History Table */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            {isStudent ? 'My Analysis History' : 'Analysis History'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loadingResults ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : visibleResults.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">{isStudent ? 'No analyses for you yet' : 'No analyses yet'}</p>
                                <p className="text-sm">
                                    {isStudent
                                        ? 'Your teacher will upload your answer sheet to get started'
                                        : 'Upload a student answer sheet to get started'}
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Keywords</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {visibleResults.sort((a, b) => new Date(b.analyzedAt) - new Date(a.analyzedAt)).map((r) => (
                                        <TableRow key={r.id} className="hover:bg-secondary/50 cursor-pointer" onClick={() => navigate(`/app/science-analyst/results/${r.id}`)}>
                                            <TableCell className="font-medium text-foreground">{r.studentName || '—'}</TableCell>
                                            <TableCell><Badge variant="outline">{r.grade || '—'}</Badge></TableCell>
                                            <TableCell className="text-muted-foreground">{r.subject || '—'}</TableCell>
                                            <TableCell>
                                                <span className="font-bold text-foreground">{r.score?.toFixed(1)}%</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={gradeColor(r.gradeLabel)}>{r.gradeLabel}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-emerald-500 font-medium">{r.matchedCount || 0}</span>
                                                <span className="text-muted-foreground"> / </span>
                                                <span className="text-foreground">{r.totalKeywords || 0}</span>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">
                                                {r.analyzedAt ? new Date(r.analyzedAt).toLocaleDateString() : '—'}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        size="icon"
                                                        variant="outline"
                                                        title="View Result"
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/app/science-analyst/results/${r.id}`); }}
                                                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary hover:border-primary/30"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    {/* Only admin/teacher can delete */}
                                                    {!isStudent && (
                                                        <Button
                                                            size="icon"
                                                            variant="outline"
                                                            title="Delete Result"
                                                            onClick={(e) => handleDelete(e, r.id)}
                                                            className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
};

export default ScienceAnalyst;
