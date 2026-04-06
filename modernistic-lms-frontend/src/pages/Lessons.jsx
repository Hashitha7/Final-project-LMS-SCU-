import { useState, useMemo, useRef } from 'react';
import { files as filesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useLmsData } from '@/contexts/LmsDataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Badge } from '@/components/ui/badge';
import {
    Plus, Search, MoreVertical, Pencil, Trash2, Eye,
    Upload, ArrowLeft, CheckCircle2, BookOpen
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from '@/components/ui/sonner';

const Lessons = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { lessons, users, courses, upsertLesson, deleteLesson } = useLmsData();

    // View State: 'list' | 'create' | 'edit'
    const [view, setView] = useState('list');
    const [search, setSearch] = useState('');
    const [viewDetail, setViewDetail] = useState(null);

    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const [formData, setFormData] = useState({
        id: '',
        title: '',
        description: '',
        image: null,
        video: null,
        fee: '',
        validityDays: '',
        teacherId: '',
        courseId: '',
        status: 'active',
    });

    // Filter Logic
    const filteredLessons = useMemo(() => {
        return lessons
            .filter(l => {
                const lName = (l.title || l.name || '').toLowerCase();
                const lDesc = (l.description || '').toLowerCase();
                return lName.includes(search.toLowerCase()) || lDesc.includes(search.toLowerCase());
            })
            .sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
    }, [lessons, search]);

    // S3 Upload
    const [uploading, setUploading] = useState({ image: false, video: false });

    const handleFileSelect = async (e, type) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 100 * 1024 * 1024) {
            toast.error('File size exceeds 100MB limit');
            return;
        }

        setUploading(prev => ({ ...prev, [type]: true }));
        try {
            const result = await filesApi.upload(file, 'lessons');
            setFormData(prev => ({ ...prev, [type]: result.url }));
            toast.success(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully!`);
        } catch (err) {
            toast.error(`Upload failed: ${err?.response?.data?.message || err.message}`);
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    // Get teacher name from users list
    const getTeacherName = (lesson) => {
        if (lesson.teacher?.name) return lesson.teacher.name;
        const teacherId = lesson.teacherId || lesson.teacher?.id;
        if (!teacherId) return 'Unassigned';
        const teacher = users.find(u => u.id === teacherId && u.role === 'teacher');
        return teacher?.name || 'Unknown';
    };

    const handleSave = async () => {
        if (!formData.title) {
            toast.error('Please enter a lesson name.');
            return;
        }

        // Map frontend field names to backend Lesson model field names
        const payload = {
            ...(formData.id ? { id: formData.id } : {}),
            name: formData.title,
            description: formData.description || '',
            image: formData.image || '',
            previewVideo: formData.video || '',
            fee: Number(formData.fee) || 0,
            validityDays: Number(formData.validityDays) || 0,
            activeStatus: formData.status === 'active' ? 1 : 0,
            courseId: formData.courseId && formData.courseId !== 'none' ? Number(formData.courseId) : null,
            teacher: formData.teacherId ? { id: Number(formData.teacherId) } : null,
        };

        try {
            await upsertLesson(payload);
            toast.success(formData.id ? 'Lesson updated successfully' : 'Lesson created successfully');
            resetForm();
        } catch (err) {
            toast.error(`Failed to save lesson: ${err?.response?.data?.message || err.message}`);
        }
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
            deleteLesson(id);
            toast.success('Lesson deleted successfully');
        }
    };

    const resetForm = () => {
        setFormData({
            id: '',
            title: '',
            description: '',
            image: null,
            video: null,
            fee: '',
            validityDays: '',
            teacherId: '',
            courseId: '',
            status: 'active',
        });
        setView('list');
    };

    const startEdit = (lesson) => {
        setFormData({
            id: lesson.id,
            title: lesson.title || lesson.name || '',
            description: lesson.description || '',
            image: lesson.image || null,
            video: lesson.video || lesson.previewVideo || null,
            fee: (lesson.fee || 0).toString(),
            validityDays: (lesson.validityDays || 0).toString(),
            teacherId: lesson.teacherId || lesson.teacher?.id || '',
            courseId: lesson.courseId?.toString() || '',
            status: lesson.activeStatus === 1 || lesson.status === 'active' ? 'active' : 'inactive',
        });
        setView('edit');
    };

    if (!user) return <Navigate to="/login" />;

    return (
        <AppLayout>
            <div className="space-y-8">
                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-slate-500 mb-6">
                    <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer" onClick={() => navigate('/app/teachers')}>Teachers</span>
                    <span className="mx-2 text-slate-300">/</span>
                    <span className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Manage Lesson</span>
                    <span className="mx-2 text-slate-300">/</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                        {view === 'list' ? 'View Lessons' : (view === 'create' ? 'Add Lesson' : 'Edit Lesson')}
                    </span>
                </div>

                {view === 'list' ? (
                    <div className="space-y-6">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Lessons</h1>

                        </div>

                        {/* Search Bar */}
                        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-md flex items-center">
                            <div className="p-2 text-slate-400">
                                <Search className="w-5 h-5" />
                            </div>
                            <Input
                                placeholder="Search lessons..."
                                className="border-none shadow-none focus-visible:ring-0 bg-transparent text-base h-11"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Lessons Grid — Modern Card Layout */}
                        {filteredLessons.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredLessons.map((lesson) => {
                                    const videoUrl = lesson.video || lesson.previewVideo;
                                    const isPdf = videoUrl && /\.pdf$/i.test(videoUrl);
                                    const isActive = lesson.activeStatus === 1 || lesson.status === 'active';

                                    return (
                                        <div
                                            key={lesson.id}
                                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 overflow-hidden group flex flex-col"
                                        >
                                            {/* Video / Image Area */}
                                            <div className="relative w-full aspect-video bg-slate-950 overflow-hidden">
                                                {videoUrl && !isPdf ? (
                                                    <video
                                                        src={videoUrl}
                                                        controls
                                                        poster={lesson.image || undefined}
                                                        className="w-full h-full object-contain"
                                                        preload="metadata"
                                                    >
                                                        Your browser does not support the video tag.
                                                    </video>
                                                ) : lesson.image ? (
                                                    <img
                                                        src={lesson.image}
                                                        alt={lesson.title || lesson.name}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                                                        <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-2" />
                                                        <span className="text-xs text-slate-400">No preview available</span>
                                                    </div>
                                                )}

                                                {/* Status Badge Overlay */}
                                                <div className="absolute top-3 left-3">
                                                    <Badge className={
                                                        isActive
                                                            ? 'bg-green-500/90 text-white border-none shadow-lg backdrop-blur-sm'
                                                            : 'bg-red-500/90 text-white border-none shadow-lg backdrop-blur-sm'
                                                    }>
                                                        {isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>

                                                {/* PDF badge */}
                                                {isPdf && (
                                                    <div className="absolute top-3 right-3">
                                                        <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                                                            <Badge className="bg-red-600/90 text-white border-none shadow-lg backdrop-blur-sm cursor-pointer hover:bg-red-700">
                                                                📄 PDF
                                                            </Badge>
                                                        </a>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Card Content */}
                                            <div className="p-5 flex flex-col flex-1">
                                                {/* Title */}
                                                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2">
                                                    {lesson.title || lesson.name}
                                                </h3>

                                                {/* Description */}
                                                {lesson.description && (
                                                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                                                        {lesson.description}
                                                    </p>
                                                )}

                                                {/* Meta Info */}
                                                <div className="mt-auto space-y-3">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                                                {(getTeacherName(lesson) || 'U').charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="text-slate-600 dark:text-slate-400 font-medium">{getTeacherName(lesson)}</span>
                                                        </div>
                                                        <span className="font-bold text-orange-600 dark:text-orange-400">
                                                            {lesson.fee ? `LKR ${lesson.fee}` : 'Free'}
                                                        </span>
                                                    </div>

                                                    {/* Validity */}
                                                    {lesson.validityDays > 0 && (
                                                        <div className="text-xs text-slate-400">
                                                            Access: {lesson.validityDays} days
                                                        </div>
                                                    )}

                                                    {/* Action Buttons */}
                                                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="flex-1 text-xs h-9 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                                                            onClick={() => setViewDetail(lesson)}
                                                        >
                                                            <Eye className="w-3.5 h-3.5 mr-1.5" /> View
                                                        </Button>
                                                        {(user?.role === 'admin' || user?.role === 'teacher' || user?.role === 'institute') && (
                                                            <>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-xs h-9 hover:bg-amber-50 hover:text-amber-600 hover:border-amber-200"
                                                                    onClick={() => startEdit(lesson)}
                                                                >
                                                                    <Pencil className="w-3.5 h-3.5" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="text-xs h-9 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                                                    onClick={() => handleDelete(lesson.id)}
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="w-9 h-9 text-slate-300 dark:text-slate-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-500">No lessons found</h3>
                                <p className="text-sm text-slate-400 mt-1">Try adjusting your search or add a new lesson.</p>
                            </div>
                        )}
                    </div>
                ) : (
                    /* ─── Create / Edit Form ─── */
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={resetForm} className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                {view === 'create' ? 'Add New Lesson' : 'Edit Lesson'}
                            </h1>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column */}
                                <div className="space-y-6">
                                    {/* Lesson Name */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Lesson Name *</Label>
                                        <Input
                                            placeholder="Enter lesson name"
                                            value={formData.title}
                                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                            className="h-11"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</Label>
                                        <Textarea
                                            placeholder="Enter lesson description..."
                                            rows={4}
                                            value={formData.description}
                                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        />
                                    </div>

                                    {/* Fee and Validity */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Fee (LKR)</Label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                value={formData.fee}
                                                onChange={(e) => setFormData(prev => ({ ...prev, fee: e.target.value }))}
                                                className="h-11"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Validity (Days)</Label>
                                            <Input
                                                type="number"
                                                placeholder="30"
                                                value={formData.validityDays}
                                                onChange={(e) => setFormData(prev => ({ ...prev, validityDays: e.target.value }))}
                                                className="h-11"
                                            />
                                        </div>
                                    </div>

                                    {/* Link to Course */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Link to Course</Label>
                                        <Select value={formData.courseId} onValueChange={(v) => setFormData(prev => ({ ...prev, courseId: v }))}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select a course (Optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No Course Linked</SelectItem>
                                                {courses.map(c => (
                                                    <SelectItem key={c.id} value={c.id.toString()}>{c.title || c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Teacher Select */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Assign Teacher</Label>
                                        <Select value={formData.teacherId?.toString() || ''} onValueChange={(v) => setFormData(prev => ({ ...prev, teacherId: v }))}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue placeholder="Select a teacher" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.filter(u => u.role === 'teacher').map(t => (
                                                    <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Status */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</Label>
                                        <Select value={formData.status} onValueChange={(v) => setFormData(prev => ({ ...prev, status: v }))}>
                                            <SelectTrigger className="h-11">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Right Column — Image & Video Upload */}
                                <div className="space-y-6">
                                    {/* Image Upload */}
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Lesson Image</Label>
                                        <div
                                            className="h-48 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer group"
                                            onClick={() => !uploading.image && imageInputRef.current?.click()}
                                        >
                                            {uploading.image ? (
                                                <div className="flex flex-col items-center text-blue-600">
                                                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2" />
                                                    <span className="text-sm font-medium">Uploading to S3...</span>
                                                </div>
                                            ) : formData.image ? (
                                                <img src={formData.image} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                                            ) : (
                                                <>
                                                    <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-primary" />
                                                    </div>
                                                    <span className="text-xs font-medium text-slate-500">Click to upload lesson image</span>
                                                </>
                                            )}
                                            <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={e => handleFileSelect(e, 'image')} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Preview Video / Material (Optional)</Label>
                                        {formData.video && !uploading.video ? (
                                            <div className="space-y-2">
                                                {/\.pdf$/i.test(formData.video) ? (
                                                    <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                                                        <iframe src={formData.video} className="w-full h-48" title="PDF Preview" />
                                                    </div>
                                                ) : (
                                                    <div className="relative rounded-xl overflow-hidden bg-black border border-slate-200 dark:border-slate-700 shadow-sm">
                                                        <video
                                                            src={formData.video}
                                                            controls
                                                            className="w-full h-48 rounded-xl object-contain"
                                                        >
                                                            Your browser does not support the video tag.
                                                        </video>
                                                    </div>
                                                )}
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full text-xs"
                                                    onClick={() => videoInputRef.current?.click()}
                                                >
                                                    <Upload className="w-3.5 h-3.5 mr-1.5" /> Change Video/File
                                                </Button>
                                            </div>
                                        ) : (
                                            <div
                                                className="h-48 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer group"
                                                onClick={() => !uploading.video && videoInputRef.current?.click()}
                                            >
                                                {uploading.video ? (
                                                    <div className="flex flex-col items-center text-blue-600">
                                                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2" />
                                                        <span className="text-sm font-medium">Uploading to S3...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                                                            <Upload className="w-6 h-6 text-slate-400 group-hover:text-primary" />
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-500">Click to upload video/PDF (max 100MB)</span>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                        <input type="file" ref={videoInputRef} className="hidden" accept="video/*,.pdf,.doc,.docx,.ppt,.pptx" onChange={e => handleFileSelect(e, 'video')} />
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                                <Button variant="outline" onClick={resetForm} className="px-6 h-11">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={uploading.image || uploading.video}
                                    className="bg-orange-600 hover:bg-orange-700 text-white px-8 h-11 shadow-lg shadow-orange-600/20"
                                >
                                    {formData.id ? 'Update Lesson' : 'Create Lesson'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* View Detail Dialog */}
                <Dialog open={!!viewDetail} onOpenChange={(o) => !o && setViewDetail(null)}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-xl">{viewDetail?.title || viewDetail?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-5 py-4 max-h-[80vh] overflow-y-auto">
                            {/* Video Player */}
                            {(() => {
                                const videoUrl = viewDetail?.video || viewDetail?.previewVideo;
                                if (!videoUrl) return null;
                                const isPdf = /\.pdf$/i.test(videoUrl);

                                if (isPdf) {
                                    return (
                                        <div className="space-y-2">
                                            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Lesson Material (PDF)</span>
                                            <div className="border rounded-xl overflow-hidden shadow-lg">
                                                <iframe src={videoUrl} className="w-full h-[400px]" title="PDF Viewer" />
                                            </div>
                                            <a href={videoUrl} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline mt-1">
                                                Open in new tab ↗
                                            </a>
                                        </div>
                                    );
                                }

                                return (
                                    <div className="space-y-2">
                                        <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Preview Video</span>
                                        <div className="relative rounded-xl overflow-hidden bg-black border border-slate-200 dark:border-slate-700 shadow-lg">
                                            <video
                                                src={videoUrl}
                                                controls
                                                className="w-full max-h-[400px] rounded-xl"
                                                poster={viewDetail?.image || undefined}
                                            >
                                                Your browser does not support the video tag.
                                            </video>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Lesson Image (show only if no video) */}
                            {!(viewDetail?.video || viewDetail?.previewVideo) && viewDetail?.image && (
                                <img src={viewDetail.image} alt="Lesson" className="w-full h-48 object-cover rounded-lg border" />
                            )}

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-xs text-slate-500 font-semibold">Teacher</span>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{viewDetail ? getTeacherName(viewDetail) : ''}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 font-semibold">Fee</span>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">LKR {viewDetail?.fee || 0}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 font-semibold">Validity</span>
                                    <p className="font-medium text-slate-800 dark:text-slate-200">{viewDetail?.validityDays || 0} days</p>
                                </div>
                                <div>
                                    <span className="text-xs text-slate-500 font-semibold">Status</span>
                                    <Badge variant="outline" className={
                                        (viewDetail?.activeStatus === 1 || viewDetail?.status === 'active')
                                            ? 'bg-green-50 text-green-700 border-green-200'
                                            : 'bg-red-50 text-red-700 border-red-200'
                                    }>
                                        {(viewDetail?.activeStatus === 1 || viewDetail?.status === 'active') ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                            </div>

                            {/* Description */}
                            {viewDetail?.description && (
                                <div>
                                    <span className="text-xs text-slate-500 font-semibold">Description</span>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">{viewDetail.description}</p>
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
};

export default Lessons;
