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
import { Brain, Upload, FileText, CheckCircle2, XCircle, BarChart3, Loader2, Microscope, Atom, Zap } from 'lucide-react';
import api from '@/lib/api';

const ScienceAnalyst = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Upload state
    const [file, setFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [grade, setGrade] = useState('');
    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState('');
    const [studentName, setStudentName] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Results state
    const [results, setResults] = useState([]);
    const [loadingResults, setLoadingResults] = useState(true);
    const [serviceHealth, setServiceHealth] = useState(null);

    // Check service health on mount
    useEffect(() => {
        api.get('/science-analyst/health')
            .then(r => setServiceHealth(r.data))
            .catch(() => setServiceHealth({ flaskService: 'unavailable' }));

        loadResults();
    }, []);

    const loadResults = () => {
        setLoadingResults(true);
        api.get('/science-analyst/results')
            .then(r => setResults(r.data))
            .catch(err => console.error('Failed to load results:', err))
            .finally(() => setLoadingResults(false));
    };

    // Stats
    const stats = useMemo(() => {
        const total = results.length;
        const avgScore = total > 0 ? (results.reduce((sum, r) => sum + (r.score || 0), 0) / total).toFixed(1) : 0;
        const excellent = results.filter(r => r.gradeLabel === 'Excellent').length;
        const needsImprovement = results.filter(r => r.gradeLabel === 'Needs Improvement').length;
        return { total, avgScore, excellent, needsImprovement };
    }, [results]);

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
            setFile(e.target.files[0]);
        }
    };

    // Submit for analysis
    const handleAnalyze = async () => {
        if (!file) {
            toast.error('Please upload a PDF or PNG file');
            return;
        }
        if (!grade) {
            toast.error('Please select a grade');
            return;
        }
        if (!subject) {
            toast.error('Please select a subject');
            return;
        }

        setIsAnalyzing(true);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('grade', grade);
            formData.append('subject', subject);
            if (topic) formData.append('topic', topic);
            formData.append('student_name', studentName || 'Unknown Student');
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

    const canAnalyze = user?.role === 'admin' || user?.role === 'teacher';

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

                {/* Service Status */}
                {serviceHealth && serviceHealth.flaskService === 'unavailable' && (
                    <Card className="border-amber-500/30 bg-amber-500/5">
                        <CardContent className="py-3 flex items-center gap-2 text-amber-600">
                            <Zap className="w-4 h-4" />
                            <span className="text-sm font-medium">Python AI Service is not running. Start it with: <code className="bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 rounded text-xs">python app.py</code></span>
                        </CardContent>
                    </Card>
                )}

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
                            {/* Grade, Subject, Topic selectors */}
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>Grade *</Label>
                                    <Select value={grade} onValueChange={setGrade}>
                                        <SelectTrigger><SelectValue placeholder="Select Grade" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">Grade 10</SelectItem>
                                            <SelectItem value="11">Grade 11</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Subject *</Label>
                                    <Select value={subject} onValueChange={setSubject}>
                                        <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                                        <SelectContent>
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
                                </div>
                                <div className="space-y-2">
                                    <Label>Topic (Optional)</Label>
                                    <Input placeholder="e.g. Photosynthesis" value={topic} onChange={e => setTopic(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Student Name</Label>
                                    <Input placeholder="Student name" value={studentName} onChange={e => setStudentName(e.target.value)} />
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
                                            Drag & drop a PDF or PNG file here, or click to browse.
                                        </p>
                                        <p className="text-xs text-muted-foreground">Supported: PDF, PNG, JPG</p>
                                    </div>
                                )}
                            </div>

                            {/* Analyze Button */}
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={!file || !grade || !subject || isAnalyzing}
                                    className="gradient-primary text-primary-foreground px-8 py-2.5"
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
                            Analysis History
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loadingResults ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : results.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p className="font-medium">No analyses yet</p>
                                <p className="text-sm">Upload a student answer sheet to get started</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Topic</TableHead>
                                        <TableHead>Score</TableHead>
                                        <TableHead>Grade</TableHead>
                                        <TableHead>Keywords</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {results.sort((a, b) => new Date(b.analyzedAt) - new Date(a.analyzedAt)).map((r) => (
                                        <TableRow key={r.id} className="hover:bg-secondary/50 cursor-pointer" onClick={() => navigate(`/app/science-analyst/results/${r.id}`)}>
                                            <TableCell className="font-medium text-foreground">{r.studentName || '—'}</TableCell>
                                            <TableCell><Badge variant="outline">{r.grade || '—'}</Badge></TableCell>
                                            <TableCell className="text-muted-foreground">{r.subject || '—'}</TableCell>
                                            <TableCell className="text-muted-foreground max-w-[150px] truncate">{r.questionTopic || r.topic || '—'}</TableCell>
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
                                                <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/app/science-analyst/results/${r.id}`); }}>
                                                    View
                                                </Button>
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
