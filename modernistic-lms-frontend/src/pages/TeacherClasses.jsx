import { useMemo, useState, useRef } from 'react';
import { Navigate, useParams, Link } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { uid } from '@/lib/storage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { Plus, Copy, Slash, FileText, Upload, Calendar, Clock, Trash2, Search } from 'lucide-react';

const TeacherClasses = () => {
    const { user } = useAuth();
    const { teacherId } = useParams();
    const { users, classes, upsertClass, deleteClass, payments } = useLmsData();

    const teacher = useMemo(() => users.find(u => u.id === teacherId), [users, teacherId]);
    const teacherClasses = useMemo(() => classes.filter(c => c.teacherId === teacherId), [classes, teacherId]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [viewEnrollmentsClass, setViewEnrollmentsClass] = useState(null);
    const [viewDepositsClass, setViewDepositsClass] = useState(null);
    const [managePdfClass, setManagePdfClass] = useState(null);

    const fileInputRef = useRef(null);
    const videoInputRef = useRef(null);

    // Draft state for creating/editing classes
    const [draft, setDraft] = useState({
        id: '',
        name: '', // Class Name
        subject: '', // Subject Name
        grade: '10th',
        day: 'Monday',
        startTime: '15:30',
        endTime: '18:30',
        description: '',
        syllabus: '', // Current input value
        syllabusItems: [], // List of syllabus topics
        monthlyFee: '',
        firstWeekFree: false,
        image: null,
        video: null,
        status: 'active',
        teacherId: teacherId,
        courseIds: [],
        studentIds: [],
        resources: []
    });

    if (!user) return <Navigate to="/login" />;
    if (user.role !== 'admin') return <Navigate to="/app" />;
    if (!teacher) return <div className="p-8 text-center text-muted-foreground">Teacher not found</div>;

    const copyUrl = () => {
        const url = `${window.location.origin}/teacher/${teacher.name.toLowerCase().replace(/\s+/g, '-')}`;
        navigator.clipboard.writeText(url);
        toast.success('URL copied to clipboard');
    };

    const handleFileSelect = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setDraft(prev => ({ ...prev, [type]: reader.result }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddSyllabus = () => {
        if (draft.syllabus.trim()) {
            setDraft(prev => ({
                ...prev,
                syllabusItems: [...(prev.syllabusItems || []), prev.syllabus.trim()],
                syllabus: ''
            }));
        }
    };

    const handleRemoveSyllabus = (index) => {
        setDraft(prev => ({
            ...prev,
            syllabusItems: prev.syllabusItems.filter((_, i) => i !== index)
        }));
    };

    const handleSave = () => {
        if (!draft.name.trim() || !draft.subject.trim()) {
            toast.error('Class Name and Subject are required');
            return;
        }

        const payload = {
            ...draft,
            id: draft.id || uid(),
            teacherId: teacherId,
            monthlyFee: draft.monthlyFee ? parseFloat(draft.monthlyFee) : 0,
        };

        upsertClass(payload);
        toast.success(draft.id ? 'Class updated' : 'Class created');
        setDraft({ id: '', name: '', subject: '', grade: '10th', day: 'Monday', startTime: '15:30', endTime: '18:30', description: '', syllabus: '', syllabusItems: [], monthlyFee: '', firstWeekFree: false, image: null, video: null, status: 'active', teacherId: teacherId, courseIds: [], studentIds: [], resources: [] });
        setIsDialogOpen(false);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
            deleteClass(id);
            toast.success('Class deleted successfully');
        }
    };

    const handleDeactivate = (c) => {
        const newStatus = c.status === 'inactive' ? 'active' : 'inactive';
        upsertClass({ ...c, status: newStatus });
        toast.success(`Class ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    };

    const handleStartClass = (c) => {
        toast.success(`Starting class: ${c.name}`);
        // Simulate Zoom start
        setTimeout(() => {
            window.open(`https://zoom.us/start?confno=123456789&name=${encodeURIComponent(c.name)}`, '_blank');
        }, 1000);
    };

    const formatTime = (time24) => {
        if (!time24) return '';
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${minutes}${ampm}`;
    };

    // Helper to get enrollments (mock: random students from users)
    const getEnrollments = (classId) => {
        // In real app, check c.studentIds or enrollment table.
        // For demo, return random students
        return users.filter(u => u.role === 'student').slice(0, 5);
    };

    // Helper to get deposits (mock: payments consistent with class fee)
    const getDeposits = (classId) => {
        // In real app, filter payments by classId/courseId
        return payments.slice(0, 3);
    };

    return (
        <AppLayout>
            <div className="space-y-6 pt-12 lg:pt-0">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <Link to="/app/teachers" className="hover:text-foreground cursor-pointer">Teachers</Link>
                            <Slash className="w-3 h-3 mx-2" />
                            <span className="text-foreground font-medium">Classes</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">{teacher.name}</h1>
                    </div>
                </div>

                {/* Share URL Box - Compact & Professional */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-900 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Copy className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold flex items-center gap-2">Public Teacher Profile <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal">Live</span></h3>
                            <p className="text-blue-100/80 text-sm">Share this link to let students view all classes taught by {teacher.name}.</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-1.5 pl-3 rounded-lg border border-white/20 max-w-full">
                            <span className="text-blue-50 text-sm truncate font-mono max-w-[200px] md:max-w-xs">{window.location.origin}/teacher/{teacher.name.toLowerCase().replace(/\s+/g, '-')}</span>
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 hover:text-white h-7 w-7 p-0" onClick={copyUrl}>
                                <Copy className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm sticky top-0 z-10 backdrop-blur-3xl bg-card/80">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search classes..." className="pl-9 bg-secondary/50 border-transparent focus:bg-background transition-colors" />
                    </div>
                    <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" onClick={() => {
                        setDraft({ id: '', name: '', subject: '', grade: '10th', day: 'Monday', startTime: '15:30', endTime: '18:30', description: '', syllabus: '', syllabusItems: [], monthlyFee: '', firstWeekFree: false, image: null, video: null, status: 'active', teacherId: teacherId, courseIds: [], studentIds: [], resources: [] });
                        setIsDialogOpen(true);
                    }}>
                        <Plus className="w-4 h-4 mr-2" /> Add New Class
                    </Button>
                </div>

                {/* Class List */}
                <div className="space-y-4">
                    {teacherClasses.map((c) => (
                        <div key={c.id} className={`group bg-card hover:bg-slate-50 dark:hover:bg-slate-900/50 border border-border rounded-xl p-4 transition-all duration-200 ${c.status === 'inactive' ? 'opacity-60 grayscale' : 'hover:shadow-md'}`}>
                            <div className="flex flex-col lg:flex-row gap-6">
                                {/* Image */}
                                <div className="w-full lg:w-48 h-32 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden relative flex-shrink-0">
                                    {c.image ? (
                                        <img src={c.image} alt={c.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-slate-100 dark:bg-slate-800">
                                            <span className="text-3xl opacity-50">📚</span>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => { setDraft(c); setIsDialogOpen(true); }}>Edit Photo</Button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 py-1">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-foreground truncate flex items-center gap-2">
                                                {c.name}
                                                {c.status === 'inactive' && <span className="text-[10px] uppercase tracking-wider bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">Inactive</span>}
                                            </h3>
                                            <p className="text-sm font-medium text-muted-foreground">{c.subject} • {c.grade}</p>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-lg font-bold text-primary">LKR {(c.monthlyFee || 0).toLocaleString()}</span>
                                            <span className="text-xs text-muted-foreground">per month</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex flex-wrap gap-y-2 gap-x-6 text-sm text-slate-600 dark:text-slate-400">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            <span className="font-medium">{c.day || 'Monday'}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <span>{formatTime(c.startTime) || '3:30PM'} - {formatTime(c.endTime) || '6:30PM'}</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                                        <Button size="sm" className="h-8 text-xs bg-orange-600 hover:bg-orange-700 text-white border-none shadow-sm" onClick={() => handleStartClass(c)}>Start Class</Button>
                                        <Button size="sm" variant="outline" className="h-8 text-xs border-slate-200 dark:border-slate-700" onClick={() => setViewEnrollmentsClass(c)}>Enrollments</Button>
                                        <Button size="sm" variant="outline" className="h-8 text-xs border-slate-200 dark:border-slate-700" onClick={() => setViewDepositsClass(c)}>Payments</Button>
                                        <Button size="sm" variant="outline" className="h-8 text-xs border-slate-200 dark:border-slate-700" onClick={() => setManagePdfClass(c)}>Resources</Button>

                                        <div className="flex-1"></div>

                                        <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground hover:text-foreground" onClick={() => { setDraft(c); setIsDialogOpen(true); }}>Edit</Button>
                                        <Button size="sm" variant="ghost" className={`h-8 text-xs ${c.status === 'inactive' ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-slate-500 hover:text-slate-700'}`} onClick={() => handleDeactivate(c)}>
                                            {c.status === 'inactive' ? 'Activate' : 'Deactivate'}
                                        </Button>
                                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDelete(c.id)}>
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {teacherClasses.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 text-center">
                            <div className="bg-white dark:bg-slate-800 p-4 rounded-full mb-4 shadow-sm">
                                <span className="text-4xl">🎓</span>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">No classes created yet</h3>
                            <p className="text-muted-foreground max-w-sm mt-1 mb-6">Get started by creating the first class for {teacher.name}. Students will be able to enroll once you publish.</p>
                            <Button onClick={() => {
                                setDraft({ id: '', name: '', subject: '', grade: '10th', day: 'Monday', startTime: '15:30', endTime: '18:30', description: '', syllabus: '', syllabusItems: [], monthlyFee: '', firstWeekFree: false, image: null, video: null, status: 'active', teacherId: teacherId, courseIds: [], studentIds: [], resources: [] });
                                setIsDialogOpen(true);
                            }}>
                                <Plus className="w-4 h-4 mr-2" /> Create First Class
                            </Button>
                        </div>
                    )}
                </div>

                {/* Add/Edit Class Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl">{draft.id ? 'Edit Class Details' : 'Create New Class'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-6 py-4">

                            {/* Top Section: Basic Info & Image */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="className">Class Name <span className="text-red-500">*</span></Label>
                                        <Input id="className" value={draft.name} onChange={(e) => setDraft(d => ({ ...d, name: e.target.value }))} placeholder="e.g. Adv. Mathematics 2025" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subjectName">Subject <span className="text-red-500">*</span></Label>
                                        <Input id="subjectName" value={draft.subject} onChange={(e) => setDraft(d => ({ ...d, subject: e.target.value }))} placeholder="e.g. Mathematics" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="grade">Grade</Label>
                                            <Select value={draft.grade} onValueChange={(v) => setDraft(d => ({ ...d, grade: v }))}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {['6th', '7th', '8th', '9th', '10th', '11th', '12th', 'After AL'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="monthlyFee">Fee (LKR)</Label>
                                            <Input id="monthlyFee" type="number" value={draft.monthlyFee} onChange={(e) => setDraft(d => ({ ...d, monthlyFee: e.target.value }))} placeholder="2500" />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Class Cover Image</Label>
                                    <div
                                        className="h-full min-h-[160px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground bg-secondary/20 hover:bg-secondary/40 cursor-pointer transition-colors relative overflow-hidden group"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        {draft.image ? (
                                            <>
                                                <img src={draft.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <p className="text-white text-sm font-medium">Click to Change</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-8 h-8 mb-2 opacity-50" />
                                                <span className="text-xs font-medium">Click to upload cover</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileSelect(e, 'image')}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Schedule Section */}
                            <div className="space-y-2">
                                <Label>Schedule</Label>
                                <div className="flex flex-wrap items-center gap-3 p-3 border rounded-lg bg-card/50">
                                    <Select value={draft.day} onValueChange={(v) => setDraft(d => ({ ...d, day: v }))}>
                                        <SelectTrigger className="w-[140px]">
                                            <SelectValue placeholder="Day" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <span className="text-sm text-muted-foreground hidden sm:inline">from</span>
                                    <Input type="time" value={draft.startTime} onChange={(e) => setDraft(d => ({ ...d, startTime: e.target.value }))} className="w-[110px]" />
                                    <span className="text-sm text-muted-foreground">-</span>
                                    <Input type="time" value={draft.endTime} onChange={(e) => setDraft(d => ({ ...d, endTime: e.target.value }))} className="w-[110px]" />
                                </div>
                            </div>

                            {/* Syllabus Section */}
                            <div className="space-y-2">
                                <Label>Syllabus Topics</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={draft.syllabus}
                                        onChange={(e) => setDraft(d => ({ ...d, syllabus: e.target.value }))}
                                        placeholder="Add a topic (e.g. Algebra Basics)"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSyllabus()}
                                    />
                                    <Button type="button" onClick={handleAddSyllabus} variant="secondary">Add</Button>
                                </div>
                                {(draft.syllabusItems || []).length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {(draft.syllabusItems || []).map((item, idx) => (
                                            <span key={idx} className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md text-sm flex items-center gap-1.5">
                                                {item}
                                                <button onClick={() => handleRemoveSyllabus(idx)} className="text-muted-foreground hover:text-red-500">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" value={draft.description} onChange={(e) => setDraft(d => ({ ...d, description: e.target.value }))} className="min-h-[80px]" placeholder="Brief description of the class..." />
                            </div>

                            {/* Bottom Section: Trial & Video */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2 border p-3 rounded-lg">
                                        <Switch id="firstWeekFree" checked={draft.firstWeekFree} onCheckedChange={(v) => setDraft(d => ({ ...d, firstWeekFree: v }))} />
                                        <div className="flex flex-col">
                                            <Label htmlFor="firstWeekFree" className="cursor-pointer">First Week Free</Label>
                                            <span className="text-xs text-muted-foreground">Allow students to try for free</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Preview Video (Optional)</Label>
                                    <div className="flex items-center gap-3 border p-3 rounded-lg border-dashed bg-secondary/10">
                                        <Button variant="outline" size="sm" onClick={() => videoInputRef.current?.click()}>
                                            <Upload className="w-4 h-4 mr-2" /> Upload Video
                                        </Button>
                                        <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                                            {draft.video ? 'Video selected' : 'No video selected'}
                                        </span>
                                        <input
                                            type="file"
                                            ref={videoInputRef}
                                            className="hidden"
                                            accept="video/*"
                                            onChange={(e) => handleFileSelect(e, 'video')}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} className="bg-primary text-primary-foreground hover:bg-primary/90">Save Class</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* View Enrollments Dialog */}
                <Dialog open={!!viewEnrollmentsClass} onOpenChange={(o) => !o && setViewEnrollmentsClass(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Enrollments for {viewEnrollmentsClass?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            {viewEnrollmentsClass && getEnrollments(viewEnrollmentsClass.id).length > 0 ? (
                                <div className="space-y-2">
                                    {getEnrollments(viewEnrollmentsClass.id).map(student => (
                                        <div key={student.id} className="flex items-center justify-between border p-2 rounded">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs">{student.name.substring(0, 2)}</div>
                                                <div>
                                                    <p className="text-sm font-medium">{student.name}</p>
                                                    <p className="text-xs text-muted-foreground">{student.email}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Active</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground">No students enrolled yet.</p>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* View Deposit Slips Dialog */}
                <Dialog open={!!viewDepositsClass} onOpenChange={(o) => !o && setViewDepositsClass(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Deposit Slips for {viewDepositsClass?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            {viewDepositsClass && getDeposits(viewDepositsClass.id).length > 0 ? (
                                <div className="space-y-2">
                                    {getDeposits(viewDepositsClass.id).map(payment => (
                                        <div key={payment.id} className="flex items-center justify-between border p-2 rounded">
                                            <div>
                                                <p className="text-sm font-medium">LKR {payment.amount}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(payment.date || Date.now()).toLocaleDateString()}</p>
                                            </div>
                                            <Button size="sm" variant="outline">View Slip</Button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground">No deposit slips found.</p>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Manage PDF Dialog */}
                <Dialog open={!!managePdfClass} onOpenChange={(o) => !o && setManagePdfClass(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Manage Resources for {managePdfClass?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-muted-foreground bg-secondary/20 hover:bg-secondary/40 cursor-pointer transition-colors" onClick={() => toast.success('Upload feature simulated')}>
                                <Upload className="w-8 h-8 mb-2" />
                                <span className="text-sm font-medium">Click to upload new PDF</span>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Current Resources</h4>
                                {(managePdfClass?.resources || []).length > 0 ? (
                                    managePdfClass.resources.map((res, idx) => (
                                        <div key={idx} className="flex items-center justify-between border p-2 rounded">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-blue-500" />
                                                <span className="text-sm">{res.name}</span>
                                            </div>
                                            <Button size="sm" variant="ghost" className="text-red-500 h-8 w-8 p-0" onClick={() => {
                                                // Mock delete resource
                                                const updated = { ...managePdfClass, resources: managePdfClass.resources.filter((_, i) => i !== idx) };
                                                upsertClass(updated);
                                                setManagePdfClass(updated);
                                            }}><Trash2 className="w-4 h-4" /></Button>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground italic">No resources uploaded yet.</p>
                                )}

                                {/* Helper logic to add mock resource on click for demo */}
                                {managePdfClass && (managePdfClass.resources || []).length === 0 && (
                                    <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => {
                                        const updated = { ...managePdfClass, resources: [...(managePdfClass.resources || []), { name: 'Lecture Notes 1.pdf', url: '#' }] };
                                        upsertClass(updated);
                                        setManagePdfClass(updated);
                                    }}>
                                        Add Mock PDF
                                    </Button>
                                )}
                            </div>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => setManagePdfClass(null)}>Done</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    );
};

export default TeacherClasses;

