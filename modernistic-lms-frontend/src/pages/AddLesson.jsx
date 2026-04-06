import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useLmsData } from '@/contexts/LmsDataContext';
import { files as filesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/sonner';
import { CheckCircle2, Upload, ArrowLeft, ChevronRight } from 'lucide-react';

const AddLesson = () => {
    const navigate = useNavigate();
    const { users, courses, upsertLesson } = useLmsData();
    const [currentStep, setCurrentStep] = useState(1);
    const [uploading, setUploading] = useState({ image: false, video: false });

    const [formData, setFormData] = useState({
        teacherId: '',
        lessonName: '',
        description: '',
        fee: '',
        validityDays: '',
        image: null,
        video: null,
        sellSeparately: false,
        videos: [],
        pdfs: [],
        selectedClasses: []
    });

    const steps = [
        { id: 1, label: 'Add Lesson' },
        { id: 2, label: 'Add Videos' },
        { id: 3, label: 'Add Pdfs' },
        { id: 4, label: 'Add Classes' },
        { id: 5, label: 'Add Course' }
    ];

    // S3 Upload for image/video
    const handleS3Upload = async (e, type) => {
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
            toast.success(`${type === 'image' ? 'Image' : 'Video'} uploaded to S3!`);
        } catch (err) {
            toast.error(`Upload failed: ${err?.response?.data?.message || err.message}`);
        } finally {
            setUploading(prev => ({ ...prev, [type]: false }));
        }
    };

    // S3 Upload for additional videos
    const handleVideoUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 100 * 1024 * 1024) {
            toast.error('File size exceeds 100MB limit');
            return;
        }

        const updatedVideos = [...formData.videos];
        updatedVideos[index] = { ...updatedVideos[index], uploading: true };
        setFormData(prev => ({ ...prev, videos: updatedVideos }));

        try {
            const result = await filesApi.upload(file, 'lessons/videos');
            const newVideos = [...formData.videos];
            newVideos[index] = { ...newVideos[index], url: result.url, uploading: false };
            setFormData(prev => ({ ...prev, videos: newVideos }));
            toast.success('Video uploaded to S3!');
        } catch (err) {
            const newVideos = [...formData.videos];
            newVideos[index] = { ...newVideos[index], uploading: false };
            setFormData(prev => ({ ...prev, videos: newVideos }));
            toast.error(`Upload failed: ${err?.response?.data?.message || err.message}`);
        }
    };

    // S3 Upload for PDFs
    const handlePdfUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 100 * 1024 * 1024) {
            toast.error('File size exceeds 100MB limit');
            return;
        }

        try {
            const result = await filesApi.upload(file, 'lessons/pdfs');
            setFormData(prev => ({
                ...prev,
                pdfs: [...prev.pdfs, { name: file.name, url: result.url }]
            }));
            toast.success('PDF uploaded to S3!');
        } catch (err) {
            toast.error(`Upload failed: ${err?.response?.data?.message || err.message}`);
        }
    };

    const addVideoRow = () => {
        setFormData(prev => ({ ...prev, videos: [...prev.videos, { title: '', url: '', uploading: false }] }));
    };

    const removeVideoRow = (index) => {
        setFormData(prev => ({ ...prev, videos: prev.videos.filter((_, i) => i !== index) }));
    };

    const updateVideoRow = (index, field, value) => {
        setFormData(prev => {
            const newVideos = [...prev.videos];
            newVideos[index] = { ...newVideos[index], [field]: value };
            return { ...prev, videos: newVideos };
        });
    };

    const toggleClassSelection = (courseId) => {
        setFormData(prev => {
            const isSelected = prev.selectedClasses.includes(courseId);
            if (isSelected) {
                return { ...prev, selectedClasses: prev.selectedClasses.filter(id => id !== courseId) };
            } else {
                return { ...prev, selectedClasses: [...prev.selectedClasses, courseId] };
            }
        });
    };

    const handleSave = async () => {
        if (!formData.lessonName) {
            toast.error('Please enter a lesson name.');
            return;
        }

        const resources = [
            ...(formData.video ? [{ id: Math.random().toString(36).substr(2, 9), type: 'video', title: 'Preview Video', url: formData.video, premium: false }] : []),
            ...formData.videos.map(v => ({ id: Math.random().toString(36).substr(2, 9), type: 'video', title: v.title || 'Video', url: v.url, premium: !formData.sellSeparately })),
            ...formData.pdfs.map(p => ({ id: Math.random().toString(36).substr(2, 9), type: 'pdf', title: p.name || 'PDF', url: p.url, premium: !formData.sellSeparately }))
        ];

        // Map frontend fields to backend Lesson model fields
        const payload = {
            name: formData.lessonName,
            description: formData.description || '',
            image: formData.image || '',
            previewVideo: formData.video || '',
            fee: Number(formData.fee) || 0,
            validityDays: Number(formData.validityDays) || 0,
            activeStatus: 1,
            teacher: formData.teacherId ? { id: Number(formData.teacherId) } : null,
            resources: resources
        };

        try {
            if (formData.selectedClasses.length > 0) {
                for (const cId of formData.selectedClasses) {
                    await upsertLesson({ ...payload, courseId: cId });
                }
            } else {
                await upsertLesson(payload);
            }
            toast.success("Lesson saved to database successfully!");
            navigate('/app/lessons');
        } catch (err) {
            toast.error(`Failed to save lesson: ${err?.response?.data?.message || err.message}`);
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Breadcrumb Header */}
                <div className="flex items-center text-sm text-slate-500 mb-6">
                    <span className="hover:text-slate-900 cursor-pointer" onClick={() => navigate('/app/teachers')}>Teachers</span>
                    <span className="mx-2">/</span>
                    <span className="hover:text-slate-900 cursor-pointer">Manage Lesson</span>
                    <span className="mx-2">/</span>
                    <span className="font-semibold text-slate-900">Add Lesson</span>
                </div>

                <div className="max-w-6xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                    {/* Stepper Header */}
                    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-8 px-8 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600" />
                        <div className="flex justify-between items-center max-w-4xl mx-auto relative z-10">
                            {/* Connecting Line */}
                            <div className="absolute top-[1.25rem] left-0 w-full h-[1px] bg-slate-200 dark:bg-slate-800 -z-10" />

                            {steps.map((step) => (
                                <div key={step.id} className="flex flex-col items-center group cursor-default relative bg-white dark:bg-slate-900 px-2">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300 ${currentStep >= step.id
                                        ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400'
                                        }`}>
                                        {currentStep > step.id ? <CheckCircle2 className="w-6 h-6" /> : step.id}
                                    </div>
                                    <span className={`text-xs font-semibold mt-3 ${currentStep >= step.id ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 md:p-12">
                        {currentStep === 1 && (
                            <div className="space-y-8 max-w-4xl mx-auto">
                                <div className="space-y-8">
                                    {/* Teacher Selection */}
                                    <div className="space-y-4">
                                        <Label className="text-base font-semibold text-slate-700 dark:text-slate-300">
                                            Select Teacher
                                        </Label>
                                        <Select onValueChange={(val) => setFormData({ ...formData, teacherId: val })} value={formData.teacherId}>
                                            <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                                <SelectValue placeholder="Select teacher" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.filter(u => u.role === 'teacher').map(teacher => (
                                                    <SelectItem key={teacher.id} value={teacher.id.toString()}>{teacher.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Lesson Name */}
                                    <div className="space-y-4">
                                        <Label className="text-base font-semibold text-slate-700 dark:text-slate-300">
                                            Lesson Name *
                                        </Label>
                                        <Input
                                            placeholder="Enter lesson name"
                                            className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                            value={formData.lessonName}
                                            onChange={(e) => setFormData({ ...formData, lessonName: e.target.value })}
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-4">
                                        <Label className="text-base font-semibold text-slate-700 dark:text-slate-300">
                                            Lesson Description
                                        </Label>
                                        <Textarea
                                            placeholder="Enter description"
                                            className="min-h-[120px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none p-4"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    {/* Fee and Validity */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <Label className="text-base font-semibold text-slate-700 dark:text-slate-300">
                                                Fee (LKR)
                                            </Label>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                                value={formData.fee}
                                                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-base font-semibold text-slate-700 dark:text-slate-300">
                                                Validity (Days)
                                            </Label>
                                            <Input
                                                type="number"
                                                placeholder="30"
                                                className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                                value={formData.validityDays}
                                                onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Uploads Grid — S3 Upload */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Image Upload */}
                                        <div className="space-y-4">
                                            <Label className="text-base font-semibold text-slate-700 dark:text-slate-300">
                                                Lesson Image
                                            </Label>
                                            <div
                                                className="relative group cursor-pointer border-2 border-dashed border-blue-200 dark:border-blue-900 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all h-[180px] flex flex-col items-center justify-center text-center p-6"
                                                onClick={() => !uploading.image && document.getElementById('lesson-image-input')?.click()}
                                            >
                                                <input
                                                    id="lesson-image-input"
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleS3Upload(e, 'image')}
                                                />
                                                {uploading.image ? (
                                                    <div className="flex flex-col items-center text-blue-600">
                                                        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2" />
                                                        <span className="text-sm font-medium">Uploading to S3...</span>
                                                    </div>
                                                ) : formData.image ? (
                                                    <img src={formData.image} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                                                            <Upload className="w-6 h-6" />
                                                        </div>
                                                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Click to Upload Image</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Video Upload */}
                                        <div className="space-y-4">
                                            <Label className="text-base font-semibold text-slate-700 dark:text-slate-300">
                                                Introduction Video
                                            </Label>
                                            <div
                                                className="relative group cursor-pointer border-2 border-dashed border-blue-200 dark:border-blue-900 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all h-[180px] flex flex-col items-center justify-center text-center p-6"
                                                onClick={() => !uploading.video && document.getElementById('lesson-video-input')?.click()}
                                            >
                                                <input
                                                    id="lesson-video-input"
                                                    type="file"
                                                    accept="video/*"
                                                    className="hidden"
                                                    onChange={(e) => handleS3Upload(e, 'video')}
                                                />
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
                                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                                                            <Upload className="w-6 h-6" />
                                                        </div>
                                                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Click to Upload Video (max 100MB)</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sell Separately Toggle */}
                                    <div className="flex items-center justify-between py-4">
                                        <Label className="text-base font-semibold text-slate-700 dark:text-slate-300 flex flex-col">
                                            <span>Sell separately</span>
                                            <span className="text-slate-400 text-sm font-normal"></span>
                                        </Label>
                                        <Switch
                                            checked={formData.sellSeparately}
                                            onCheckedChange={(checked) => setFormData({ ...formData, sellSeparately: checked })}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <Button onClick={() => setCurrentStep(2)} size="lg" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 h-11">
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-8 max-w-4xl mx-auto">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add Lesson Videos</h3>
                                        <Button onClick={addVideoRow} variant="outline" size="sm" className="border-blue-500 text-blue-500 hover:bg-blue-50">Add Video Row</Button>
                                    </div>
                                    {formData.videos.length === 0 && <p className="text-sm text-slate-500 italic">No videos added yet.</p>}
                                    {formData.videos.map((video, index) => (
                                        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                                            <div className="space-y-2">
                                                <Label>Video Title</Label>
                                                <Input value={video.title} onChange={(e) => updateVideoRow(index, 'title', e.target.value)} placeholder="Lesson Part 01" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Video File</Label>
                                                <div className="flex gap-2">
                                                    <div className="flex-1">
                                                        {video.uploading ? (
                                                            <div className="h-10 flex items-center gap-2 text-blue-600 text-sm">
                                                                <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                                                Uploading...
                                                            </div>
                                                        ) : video.url ? (
                                                            <div className="h-10 flex items-center gap-2 text-green-600 text-sm">
                                                                <CheckCircle2 className="w-4 h-4" />
                                                                <span className="truncate">{video.url}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="relative">
                                                                <Button variant="outline" className="w-full" onClick={() => document.getElementById(`video-input-${index}`)?.click()}>
                                                                    <Upload className="w-4 h-4 mr-2" /> Upload Video
                                                                </Button>
                                                                <input
                                                                    id={`video-input-${index}`}
                                                                    type="file"
                                                                    accept="video/*"
                                                                    className="hidden"
                                                                    onChange={(e) => handleVideoUpload(e, index)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button variant="ghost" size="icon" onClick={() => removeVideoRow(index)} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                                        <div className="h-5 w-5 bg-red-100 rounded flex items-center justify-center">x</div>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between pt-4">
                                    <Button onClick={() => setCurrentStep(1)} variant="outline" size="lg" className="px-8 h-11">Back</Button>
                                    <Button onClick={() => setCurrentStep(3)} size="lg" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 h-11">Next</Button>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-8 max-w-4xl mx-auto">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Add Lesson PDFs</h3>
                                    <div
                                        className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                        onClick={() => document.getElementById('pdf-input')?.click()}
                                    >
                                        <input
                                            id="pdf-input"
                                            type="file"
                                            accept=".pdf"
                                            className="hidden"
                                            onChange={handlePdfUpload}
                                        />
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mb-3">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">Click to upload PDFs to S3</p>
                                        <p className="text-sm text-slate-500 mt-1">Support for PDF files (max 100MB)</p>
                                    </div>

                                    {formData.pdfs.length > 0 && (
                                        <div className="space-y-2 mt-4">
                                            {formData.pdfs.map((pdf, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border rounded-lg shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-red-100 text-red-600 p-2 rounded">
                                                            <div className="text-xs font-bold">PDF</div>
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-medium">{pdf.name}</span>
                                                            <a href={pdf.url} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-500 hover:underline truncate max-w-[300px]">{pdf.url}</a>
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={() => setFormData(prev => ({ ...prev, pdfs: prev.pdfs.filter((_, i) => i !== idx) }))}>
                                                        Remove
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex justify-between pt-4">
                                    <Button onClick={() => setCurrentStep(2)} variant="outline" size="lg" className="px-8 h-11">Back</Button>
                                    <Button onClick={() => setCurrentStep(4)} size="lg" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 h-11">Next</Button>
                                </div>
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="space-y-8 max-w-4xl mx-auto">
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Select Classes for this Lesson</h3>
                                    <p className="text-sm text-slate-500">Choose which courses/classes this lesson should be available in.</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {courses && courses.length > 0 ? courses.map(course => (
                                            <div
                                                key={course.id}
                                                onClick={() => toggleClassSelection(course.id)}
                                                className={`cursor-pointer p-4 rounded-xl border transition-all ${formData.selectedClasses.includes(course.id)
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-sm'
                                                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                                    }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center mt-0.5 ${formData.selectedClasses.includes(course.id) ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-300'
                                                        }`}>
                                                        {formData.selectedClasses.includes(course.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{course.title || course.name}</h4>
                                                        <p className="text-xs text-slate-500 mt-1">{course.description?.substring(0, 60) || 'No description'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )) : <p className="text-slate-500">No active courses available.</p>}
                                    </div>
                                </div>
                                <div className="flex justify-between pt-4">
                                    <Button onClick={() => setCurrentStep(3)} variant="outline" size="lg" className="px-8 h-11">Back</Button>
                                    <Button onClick={() => setCurrentStep(5)} size="lg" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 h-11">Next</Button>
                                </div>
                            </div>
                        )}

                        {currentStep === 5 && (
                            <div className="space-y-8 max-w-4xl mx-auto text-center py-8">
                                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ready to Publish Lesson?</h2>
                                <p className="text-slate-500 max-w-md mx-auto">
                                    You are about to add "<span className="font-medium text-slate-900 dark:text-white">{formData.lessonName}</span>"
                                    to {formData.selectedClasses.length} courses with {formData.videos.length} videos and {formData.pdfs.length} PDFs.
                                    {formData.image && ' Image uploaded to S3.'}
                                    {formData.video && ' Video uploaded to S3.'}
                                </p>

                                <div className="flex flex-col gap-3 max-w-xs mx-auto pt-6">
                                    <Button onClick={handleSave} size="lg" className="bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-green-600/20">
                                        Publish Lesson
                                    </Button>
                                    <Button onClick={() => setCurrentStep(4)} variant="ghost" className="text-slate-500 hover:text-slate-900">
                                        Go Back & Edit
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default AddLesson;
