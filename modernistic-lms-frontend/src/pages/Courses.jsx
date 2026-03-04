import { useState, useMemo, useRef, useEffect } from 'react';
import { files as filesApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useLmsData } from '@/contexts/LmsDataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { uid } from '@/lib/storage';
import {
  Plus, Search, Pencil, Trash2, Eye, EyeOff,
  FileText, Users, Upload, Calendar, ArrowLeft,
  CheckCircle2, MoreVertical, Clock, ChevronRight
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Courses = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { courses, users, upsertCourse, deleteCourse, payments } = useLmsData();

  // View State: 'list' | 'create' | 'edit'
  const [view, setView] = useState('list');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (location.pathname === '/app/courses/create') {
      setView('create');
    } else {
      setView('list');
    }
  }, [location.pathname]);

  // Dialog State
  const [viewEnrollments, setViewEnrollments] = useState(null);
  const [viewDeposits, setViewDeposits] = useState(null);
  const [manualEnroll, setManualEnroll] = useState(null);

  // Form State
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    description: '',
    image: null,
    video: null,
    startDate: '',
    endDate: '',
    semesters: '',
    price: '',
    installments: '',
    installmentPrice: '',
    timeTable: [],
    teacherId: '',
    status: 'active',
    tags: []
  });

  // Refs
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Filter Logic
  const filteredCourses = useMemo(() => {
    return courses
      .filter(c => {
        const cName = (c.title || c.name || '').toLowerCase();
        const cDesc = (c.description || '').toLowerCase();
        return cName.includes(search.toLowerCase()) || cDesc.includes(search.toLowerCase());
      })
      .sort((a, b) => (a.title || a.name || '').localeCompare(b.title || b.name || ''));
  }, [courses, search]);

  // Helpers
  const [uploading, setUploading] = useState({ image: false, video: false });

  const handleFileSelect = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size exceeds 100MB limit');
      return;
    }

    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const result = await filesApi.upload(file, 'courses');
      setFormData(prev => ({ ...prev, [type]: result.url }));
      toast.success(`${type === 'image' ? 'Image' : 'Video'} uploaded successfully!`);
    } catch (err) {
      toast.error(`Upload failed: ${err?.response?.data?.message || err.message}`);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
    }
  };

  const getEnrollments = (courseId) => users.filter(u => u.role === 'student').slice(0, 5); // Mock
  const getDeposits = (courseId) => payments.slice(0, 3); // Mock

  const handleSave = async () => {
    if (!formData.title || !formData.startDate || !formData.endDate) {
      toast.error('Please fill in all required fields.');
      return;
    }

    // Map frontend field names to backend Course model field names
    const payload = {
      ...(formData.id ? { id: formData.id } : {}),
      name: formData.title,
      description: formData.description || '',
      imageUrl: formData.image || '',
      videoUrl: formData.video || '',
      totalFee: Number(formData.price) || 0,
      noOfInstallments: Number(formData.installments) || 1,
      noOfSemesters: Number(formData.semesters) || 1,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status || 'active',
      currentTeacherId: formData.teacherId ? Number(formData.teacherId) : null,
    };

    try {
      await upsertCourse(payload);
      toast.success(formData.id ? 'Course updated successfully' : 'Course created successfully');
      resetForm();
    } catch (err) {
      toast.error(`Failed to save course: ${err?.response?.data?.message || err.message}`);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      deleteCourse(id);
      toast.success('Course deleted successfully');
    }
  };

  const handleDeactivate = (c) => {
    upsertCourse({ ...c, status: c.status === 'active' ? 'inactive' : 'active' });
    toast.success(`Course ${c.status === 'active' ? 'deactivated' : 'activated'}`);
  };

  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      description: '',
      image: null,
      video: null,
      startDate: '',
      endDate: '',
      semesters: '',
      price: '',
      installments: '',
      installmentPrice: '',
      timeTable: [],
      teacherId: '',
      status: 'active',
      tags: []
    });
    setCurrentStep(1);
    setView('list');
  };

  const startEdit = (course) => {
    setFormData({
      id: course.id,
      title: course.title || course.name || '',
      description: course.description || '',
      image: course.image || course.imageUrl || null,
      video: course.video || course.videoUrl || null,
      startDate: course.startDate || '',
      endDate: course.endDate || '',
      price: (course.price || course.totalFee || 0).toString(),
      installments: (course.installments || course.noOfInstallments || '').toString(),
      semesters: (course.semesters || course.noOfSemesters || '').toString(),
      installmentPrice: '',
      timeTable: course.timeTable || course.dayTimes || [],
      teacherId: course.teacherId || course.currentTeacherId || '',
      status: course.status || 'active',
      tags: course.tags || [],
    });
    setView('edit');
  };

  // Sub-components for Form Steps
  const renderStep1 = () => (
    <div className="grid gap-6 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course Name <span className="text-red-500">*</span></Label>
        <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Advanced Mathematics" className="h-11 bg-slate-50 border-slate-200" />
      </div>
      <div className="space-y-2">
        <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course Description</Label>
        <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Provide a detailed description of the course..." className="min-h-[120px] resize-none bg-slate-50 border-slate-200" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course Image</Label>
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
                <span className="text-xs font-medium text-slate-500">Click to upload cover image</span>
              </>
            )}
            <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={e => handleFileSelect(e, 'image')} />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course Video (Optional)</Label>
          <div
            className="h-48 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-muted-foreground bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer group"
            onClick={() => !uploading.video && videoInputRef.current?.click()}
          >
            {uploading.video ? (
              <div className="flex flex-col items-center text-blue-600">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2" />
                <span className="text-sm font-medium">Uploading to S3...</span>
              </div>
            ) : formData.video ? (
              <div className="flex flex-col items-center text-green-600">
                <CheckCircle2 className="w-10 h-10 mb-2" />
                <span className="text-sm font-medium">Video Uploaded ✓</span>
                <span className="text-xs text-slate-400 mt-1 truncate max-w-[200px]">{formData.video}</span>
              </div>
            ) : (
              <>
                <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-slate-400 group-hover:text-primary" />
                </div>
                <span className="text-xs font-medium text-slate-500">Click to upload intro video (max 100MB)</span>
              </>
            )}
            <input type="file" ref={videoInputRef} className="hidden" accept="video/*,.pdf,.doc,.docx,.ppt,.pptx" onChange={e => handleFileSelect(e, 'video')} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Starting Date <span className="text-red-500">*</span></Label>
          <Input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="h-11 bg-slate-50 border-slate-200" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ending Date <span className="text-red-500">*</span></Label>
          <Input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="h-11 bg-slate-50 border-slate-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Fee (LKR)</Label>
          <Input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="0.00" className="h-11 bg-slate-50 border-slate-200" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">No. of Semesters</Label>
          <Input type="number" value={formData.semesters} onChange={e => setFormData({ ...formData, semesters: e.target.value })} placeholder="1" className="h-11 bg-slate-50 border-slate-200" />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">No. of Installments</Label>
          <Input type="number" value={formData.installments} onChange={e => setFormData({ ...formData, installments: e.target.value })} placeholder="1" className="h-11 bg-slate-50 border-slate-200" />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-8 py-8 animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col items-center">
      <div className="text-center space-y-2">
        <div className="bg-slate-100 p-4 rounded-2xl w-20 h-20 mx-auto flex items-center justify-center mb-4">
          <Calendar className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Weekly Schedule</h3>
        <p className="text-slate-500 max-w-md mx-auto">Define the weekly class schedule for this course. You can add multiple slots per day.</p>
      </div>

      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <Label className="text-slate-700">Select Day</Label>
          <Select onValueChange={(v) => {
            const newItem = { day: v, startTime: '08:00', endTime: '10:00' };
            setFormData(p => ({ ...p, timeTable: [...p.timeTable, newItem] }));
          }}>
            <SelectTrigger className="h-12 bg-slate-50 border-slate-200"><SelectValue placeholder="Add a day to schedule" /></SelectTrigger>
            <SelectContent>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {formData.timeTable.length > 0 ? (
            formData.timeTable.map((t, idx) => (
              <div key={idx} className="flex items-center gap-3 p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm transition-all hover:shadow-md">
                <div className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 w-24 py-1.5 px-3 rounded-lg text-center font-bold text-sm uppercase tracking-wide">
                  {t.day}
                </div>
                <div className="flex items-center gap-2 flex-1">
                  <Clock className="w-4 h-4 text-slate-300 ml-2" />
                  <Input type="time" value={t.startTime} onChange={e => {
                    const newTable = [...formData.timeTable];
                    newTable[idx].startTime = e.target.value;
                    setFormData({ ...formData, timeTable: newTable });
                  }} className="h-9 w-24 text-sm border-none shadow-none focus-visible:ring-0 p-0" />
                  <span className="text-slate-300">-</span>
                  <Input type="time" value={t.endTime} onChange={e => {
                    const newTable = [...formData.timeTable];
                    newTable[idx].endTime = e.target.value;
                    setFormData({ ...formData, timeTable: newTable });
                  }} className="h-9 w-24 text-sm border-none shadow-none focus-visible:ring-0 p-0" />
                </div>
                <Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full" onClick={() => {
                  setFormData(p => ({ ...p, timeTable: p.timeTable.filter((_, i) => i !== idx) }));
                }}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400 italic">
              No time slots added yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-8 py-8 animate-in fade-in slide-in-from-right-8 duration-500 flex flex-col items-center">
      <div className="w-full max-w-xl space-y-8">
        <div className="space-y-3">
          <Label className="text-lg font-semibold text-slate-800">Assign a Teacher</Label>
          <Select value={formData.teacherId} onValueChange={(v) => setFormData({ ...formData, teacherId: v })}>
            <SelectTrigger className="h-14 text-lg px-4 bg-slate-50 border-slate-200"><SelectValue placeholder="Select a Teacher" /></SelectTrigger>
            <SelectContent>
              {users.filter(u => u.role === 'teacher').map(t => <SelectItem key={t.id} value={t.id} className="py-3">{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Course Summary</h4>
            <Badge className="bg-blue-600 hover:bg-blue-700 text-white border-none px-3">General</Badge>
          </div>
          <div className="p-6 grid grid-cols-1 gap-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-sm text-slate-500">Course Title</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{formData.title || 'Untitled'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-sm text-slate-500">Duration</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{formData.startDate || '-'} — {formData.endDate || '-'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-sm text-slate-500">Total Fee</span>
              <span className="font-bold text-blue-600">LKR {formData.price || '0.00'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50 dark:border-slate-800/50">
              <span className="text-sm text-slate-500">Schedule</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{formData.timeTable.length} sessions/week</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-slate-500">Assigned Teacher</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{users.find(u => u.id === formData.teacherId)?.name || 'Unassigned'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  return (
    <AppLayout>
      <div className="space-y-8 pt-12 lg:pt-0">
        {/* Header Section */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center text-sm text-slate-500 font-medium mb-2">
            <span className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer" onClick={() => navigate('/app/teachers')}>Teachers</span>
            <span className="mx-2 text-slate-300">/</span>
            <span className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer">Manage Course</span>
            <span className="mx-2 text-slate-300">/</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {view === 'list' ? 'View Courses' : (view === 'create' ? 'Add Course' : 'Edit Course')}
            </span>
          </div>
        </div>

        {view === 'list' ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Courses</h1>
              <Button onClick={() => { resetForm(); setView('create'); }} className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20 px-6 h-11 rounded-lg">
                <Plus className="w-5 h-5 mr-2" /> Add Course
              </Button>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-md flex items-center">
              <div className="p-2 text-slate-400">
                <Search className="w-5 h-5" />
              </div>
              <Input
                placeholder="Search courses..."
                className="border-none shadow-none focus-visible:ring-0 bg-transparent text-base h-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Course Cards View */}
            <div className="space-y-6">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <div key={course.id} className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center lg:items-start lg:flex-row gap-8">
                    {/* Left: Image & Details */}
                    <div className="w-full lg:w-[450px] flex-shrink-0 flex flex-col gap-6">
                      <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 relative group shadow-inner">
                        {(course.image || course.imageUrl) ? (
                          <img src={course.image || course.imageUrl} alt={course.title || course.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                            <div className="flex flex-col items-center gap-2">
                              <span className="text-xs font-medium">No Cover Image</span>
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                          <Button variant="secondary" size="sm" onClick={() => startEdit(course)} className="shadow-lg">Change Image</Button>
                        </div>
                      </div>

                      {/* Course Details (Bottom Left) */}
                      <div className="space-y-3">
                        <h4 className="font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">Course Details</h4>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-semibold mb-0.5">Start Date :</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{course.startDate || '-'}</span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-xs text-slate-500 font-semibold mb-0.5">Total Fee :</span>
                            <span className="text-slate-700 dark:text-slate-300 font-bold">{course.price || course.totalFee || 0}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-slate-500 font-semibold mb-0.5">End Date :</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{course.endDate || '-'}</span>
                          </div>
                          <div className="flex flex-col text-right">
                            <span className="text-xs text-slate-500 font-semibold mb-0.5">Number Allocated Teacher :</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{(course.teacherId || course.currentTeacherId) ? '1' : '0'}</span>
                          </div>
                          <div className="flex flex-col col-span-2">
                            <span className="text-xs text-slate-500 font-semibold mb-0.5">Number of Semesters :</span>
                            <span className="text-slate-700 dark:text-slate-300 font-medium">{course.semesters || course.noOfSemesters || '0'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Content */}
                    <div className="flex-1 flex flex-col gap-6 w-full">
                      <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Course Name :</span>
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-blue-500 leading-tight">{course.title || course.name}</h2>
                      </div>

                      <div className="flex-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">About Course :</span>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed text-justify">
                          {course.description || "No description provided for this course."}
                        </p>
                      </div>
                    </div>

                    {/* Right: Actions Stack */}
                    <div className="w-full lg:w-64 flex flex-col gap-3 flex-shrink-0 pt-1">
                      <Button onClick={() => navigate(`/app/courses/${course.id}`)} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold shadow-md h-10 transition-transform active:scale-95">
                        Start Course Session
                      </Button>
                      <Button onClick={() => startEdit(course)} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium shadow-sm h-10 border border-slate-700">
                        Edit Course
                      </Button>
                      <Button onClick={() => handleDeactivate(course)} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium shadow-sm h-10 border border-slate-700">
                        {course.status === 'active' ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button onClick={() => setViewEnrollments(course)} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium shadow-sm h-10 border border-slate-700">
                        View Enrollments
                      </Button>
                      <Button onClick={() => setViewDeposits(course)} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium shadow-sm h-10 border border-slate-700">
                        View Deposit Slip
                      </Button>
                      <Button onClick={() => setManualEnroll(course)} className="w-full bg-slate-800 hover:bg-slate-900 text-white font-medium shadow-sm h-10 border border-slate-700">
                        Manual Enroll
                      </Button>
                      <Button onClick={() => handleDelete(course.id)} className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold shadow-md h-10 mt-auto opacity-90 hover:opacity-100">
                        Delete Course
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                  <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full inline-block mb-4">
                    <Search className="w-8 h-8 opacity-40" />
                  </div>
                  <p className="text-lg font-medium text-slate-900 dark:text-slate-100">No courses found</p>
                  <p className="text-sm text-slate-500 mt-1">Try adjusting your search or add a new course.</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            {/* Stepper Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-8 px-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600" />
              <div className="flex justify-between items-center max-w-3xl mx-auto relative z-10">
                {/* Connecting Line */}
                <div className="absolute top-[1.25rem] left-0 w-full h-[2px] bg-slate-200 dark:bg-slate-800 -z-10" />

                {[
                  { id: 1, label: 'Course Details' },
                  { id: 2, label: 'Time Table' },
                  { id: 3, label: 'Review & Submit' }
                ].map((step) => (
                  <div key={step.id} className="flex flex-col items-center group cursor-default">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${currentStep >= step.id
                      ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/30'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
                      }`}>
                      {currentStep > step.id ? <CheckCircle2 className="w-6 h-6" /> : step.id}
                    </div>
                    <span className={`text-[10px] font-bold mt-3 uppercase tracking-wider ${currentStep >= step.id ? 'text-orange-600 dark:text-orange-500' : 'text-slate-400'}`}>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 md:p-12 min-h-[500px] flex flex-col justify-center">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <Button variant="ghost" size="lg" onClick={() => currentStep === 1 ? navigate('/app/courses') : setCurrentStep(c => c - 1)} className="text-slate-500 hover:text-slate-900 font-medium">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back
              </Button>

              {currentStep < 3 ? (
                <Button onClick={() => setCurrentStep(c => c + 1)} size="lg" className="bg-slate-900 text-white hover:bg-slate-800 shadow-xl px-8 h-12 rounded-lg font-semibold">
                  Next Step <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={handleSave} size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/20 px-8 h-12 rounded-lg font-bold">
                  Submit Course
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Dialogs */}
        <Dialog open={!!viewEnrollments} onOpenChange={(o) => !o && setViewEnrollments(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enrollments for {viewEnrollments?.title || viewEnrollments?.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2">
              {viewEnrollments && getEnrollments(viewEnrollments.id).length > 0 ? getEnrollments(viewEnrollments.id).map(student => (
                <div key={student.id} className="flex items-center justify-between border p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-600">{student.name.substring(0, 2)}</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{student.name}</p>
                      <p className="text-xs text-slate-500">{student.email}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-2 py-0.5">Active</Badge>
                </div>
              )) : <div className="text-center py-8 text-slate-400">No students enrolled yet.</div>}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!viewDeposits} onOpenChange={(o) => !o && setViewDeposits(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Deposit Slips for {viewDeposits?.title || viewDeposits?.name}</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-2">
              {viewDeposits && getDeposits(viewDeposits.id).length > 0 ? getDeposits(viewDeposits.id).map(p => (
                <div key={p.id} className="flex items-center justify-between border p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-bold text-slate-900">LKR {p.amount}</p>
                    <p className="text-xs text-slate-500">{new Date(p.date || Date.now()).toLocaleDateString()}</p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">View Slip</Button>
                </div>
              )) : <div className="text-center py-8 text-slate-400">No deposit slips found.</div>}
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!manualEnroll} onOpenChange={(o) => !o && setManualEnroll(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manually Enroll Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-slate-500">Select a student to enroll in {manualEnroll?.title || manualEnroll?.name}.</p>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select Student" />
                </SelectTrigger>
                <SelectContent>
                  {users.filter(u => u.role === 'student').map(student => (
                    <SelectItem key={student.id} value={student.id}>{student.name} ({student.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex justify-end pt-2">
                <Button onClick={() => {
                  toast.success('Student enrolled successfully');
                  setManualEnroll(null);
                }} className="bg-orange-600 hover:bg-orange-700 text-white">Enroll Student</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default Courses;

