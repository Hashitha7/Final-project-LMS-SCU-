import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useLmsData } from '@/contexts/LmsDataContext';
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
    const { users } = useLmsData();
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
        teacherId: '',
        lessonName: '',
        description: '',
        image: null,
        video: null,
        sellSeparately: false,
        videos: [],
        pdfs: [],
        selectedClasses: []
    });
    const { courses } = useLmsData();

    const steps = [
        { id: 1, label: 'Add Lesson' },
        { id: 2, label: 'Add Videos' },
        { id: 3, label: 'Add Pdfs' },
        { id: 4, label: 'Add Classes' },
        { id: 5, label: 'Add Course' } // Matches screenshot even if it might be a typo for "Finish"
    ];

    const handleFileSelect = (e, type, index = null) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'pdfs') {
                    setFormData(prev => ({
                        ...prev,
                        pdfs: [...prev.pdfs, { name: file.name, url: reader.result }]
                    }));
                } else if (type === 'videos') {
                    // For videos in step 2 (assuming they might be file uploads too)
                    setFormData(prev => {
                        const newVideos = [...prev.videos];
                        newVideos[index] = { ...newVideos[index], url: reader.result, file: file };
                        return { ...prev, videos: newVideos };
                    });
                } else {
                    setFormData(prev => ({ ...prev, [type]: reader.result }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const addVideoRow = () => {
        setFormData(prev => ({ ...prev, videos: [...prev.videos, { title: '', url: '' }] }));
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

    const handleSave = () => {
        toast.success("Lesson saved successfully!");
        navigate('/app/lessons');
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
                                    {/* ... Step 1 Fields ... */}
                                    {/* Teacher Selection */}
                                    <div className="space-y-4">
                                        <Label className="text-base font-semibold text-slate-700 dark:text-slate-300">
                                            Select Teacher <span className="text-slate-400 text-sm font-normal">(ගුරුවරයා තෝරන්න)</span>
                                        </Label>
                                        <Select onValueChange={(val) => setFormData({ ...formData, teacherId: val })} value={formData.teacherId}>
                                            <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                                                <SelectValue placeholder="Select teacher (ගුරුවරයා තෝරන්න)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.filter(u => u.role === 'teacher').map(teacher => (
                                                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Lesson Name */}
                                    <div className="space-y-4">
                                        <Label className="text-base font-semibold text-slate-700 dark:text-slate-300">
                                            Lesson Name <span className="text-slate-400 text-sm font-normal">(පාඩම නම)</span>
                                        </Label>
                                        <Input
                                            placeholder="Enter lesson name (පාඩම නම ඇතුලත් කරන්න)"
                                            className="h-12 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                                            value={formData.lessonName}
                                            onChange={(e) => setFormData({ ...formData, lessonName: e.target.value })}
                                        />
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-4">
                                        <Label className="text-base font-semibold text-slate-700 dark:text-slate-300">
                                            Lesson Description <span className="text-slate-400 text-sm font-normal">(පාඩම විස්තරය)</span>
                                        </Label>
                                        <Textarea
                                            placeholder="Enter description (පාඩම විස්තරය ඇතුලත් කරන්න)"
                                            className="min-h-[120px] bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none p-4"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    {/* Uploads Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Image Upload */}
                                        <div className="space-y-4">
                                            <Label className="text-base font-semibold text-slate-700 dark:text-slate-300">
                                                Lesson Image <span className="text-slate-400 text-sm font-normal">(පාඩම රූපය)</span>
                                            </Label>
                                            <div className="relative group cursor-pointer border-2 border-dashed border-blue-200 dark:border-blue-900 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all h-[180px] flex flex-col items-center justify-center text-center p-6">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    onChange={(e) => handleFileSelect(e, 'image')}
                                                />
                                                {formData.image ? (
                                                    <img src={formData.image} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                                                            <Upload className="w-6 h-6" />
                                                        </div>
                                                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Drag Files or Click to Browse</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Video Upload */}
                                        <div className="space-y-4">
                                            <Label className="text-base font-semibold text-slate-700 dark:text-slate-300">
                                                Introduction Video <span className="text-slate-400 text-sm font-normal">(හැඳින්වීමේ වීඩියෝව)</span>
                                            </Label>
                                            <div className="relative group cursor-pointer border-2 border-dashed border-blue-200 dark:border-blue-900 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all h-[180px] flex flex-col items-center justify-center text-center p-6">
                                                <input
                                                    type="file"
                                                    accept="video/*"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                    onChange={(e) => handleFileSelect(e, 'video')}
                                                />
                                                {formData.video ? (
                                                    <video src={formData.video} className="h-full w-full object-contain rounded-lg" controls />
                                                ) : (
                                                    <>
                                                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                                                            <Upload className="w-6 h-6" />
                                                        </div>
                                                        <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Drag Files or Click to Browse</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sell Separately Toggle */}
                                    <div className="flex items-center justify-between py-4">
                                        <Label className="text-base font-semibold text-slate-700 dark:text-slate-300 flex flex-col">
                                            <span>Sell separately</span>
                                            <span className="text-slate-400 text-sm font-normal">(පාඩම Separate)</span>
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
                                                <Label>Video File/URL</Label>
                                                <div className="flex gap-2">
                                                    <div className="relative flex-1">
                                                        <Input value={video.url ? 'File Uploaded' : ''} readOnly placeholder="Upload Video" />
                                                        <input
                                                            type="file"
                                                            accept="video/*"
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                            onChange={(e) => handleFileSelect(e, 'videos', index)}
                                                        />
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
                                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative cursor-pointer">
                                        <input
                                            type="file"
                                            accept=".pdf"
                                            multiple
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            onChange={(e) => handleFileSelect(e, 'pdfs')}
                                        />
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mb-3">
                                            <Upload className="w-6 h-6" />
                                        </div>
                                        <p className="font-medium text-slate-900 dark:text-slate-100">Click to upload PDFs</p>
                                        <p className="text-sm text-slate-500 mt-1">Support for PDF files</p>
                                    </div>

                                    {formData.pdfs.length > 0 && (
                                        <div className="space-y-2 mt-4">
                                            {formData.pdfs.map((pdf, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border rounded-lg shadow-sm">
                                                    <div className="flex items-center gap-3">
                                                        <div className="bg-red-100 text-red-600 p-2 rounded">
                                                            <div className="text-xs font-bold">PDF</div>
                                                        </div>
                                                        <span className="text-sm font-medium">{pdf.name}</span>
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
                                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">{course.title}</h4>
                                                        <p className="text-xs text-slate-500 mt-1">{course.grade} Grade</p>
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
