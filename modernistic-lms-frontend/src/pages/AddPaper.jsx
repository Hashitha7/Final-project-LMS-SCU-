import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLmsData } from '@/contexts/LmsDataContext';
import { AppLayout } from '@/components/layout/AppLayout';
import * as api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Clock, Upload, CheckCircle2, FileText, Users, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

// Steps component
const Steps = ({ currentStep }) => {
    const steps = [
        { id: 1, label: 'Setup Paper' },
        { id: 2, label: 'Upload Paper' },
        { id: 3, label: 'Add Course & Class' },
    ];
    return (
        <div className="flex items-center justify-between mb-8 px-4 overflow-x-auto">
            {steps.map((step, index) => (
                <div key={step.id} className="flex items-center min-w-fit">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${currentStep >= step.id ? 'bg-primary border-primary text-primary-foreground' : 'border-muted text-muted-foreground'}`}>
                        {currentStep > step.id ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                    </div>
                    <span className={`ml-2 text-sm font-medium whitespace-nowrap ${currentStep >= step.id ? 'text-primary' : 'text-muted-foreground'}`}>{step.label}</span>
                    {index < steps.length - 1 && <div className={`w-12 h-0.5 mx-4 hidden sm:block ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />}
                </div>
            ))}
        </div>
    );
};

const AddPaper = () => {
    const { users, classes, courses, upsertExam } = useLmsData();
    const teachers = users.filter(u => u.role === 'teacher' || u.role === 'admin'); // Admins might also teach?
    const [step, setStep] = useState(1);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    // Form State
    const [formData, setFormData] = useState({
        teacherId: '',
        title: '',
        description: '',
        timeAllocation: '',
        type: 'mcq',
        file: null,
        classId: '',
        courseId: ''
    });

    const handleNext = () => {
        // Basic Validation
        if (step === 1) {
            if (!formData.teacherId || !formData.title || !formData.description || !formData.timeAllocation) {
                toast.error('Please fill in all required fields');
                return;
            }
        }
        if (step === 2 && !formData.file) {
            toast.error('Please upload an exam paper file.');
            return;
        }
        if (step < 3) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleFinish = async () => {
        try {
            let fileUrl = '';
            if (formData.file) {
                try {
                    toast.loading('Uploading paper...', { id: 'upload' });
                    const res = await api.files.upload(formData.file, 'exams');
                    fileUrl = res.url;
                    toast.success('Upload complete', { id: 'upload' });
                } catch (e) {
                    console.error("Upload to server failed, using local blob:", e);
                    toast.dismiss('upload');
                    fileUrl = URL.createObjectURL(formData.file);
                }
            }

            const examId = `paper_${Date.now()}`;
            const payload = {
                id: examId,
                title: formData.title,
                description: formData.description,
                quizType: formData.type,
                type: formData.type,
                paperDuration: Number(formData.timeAllocation) || 60,
                durationMin: Number(formData.timeAllocation) || 60,
                questionPaperUrl: fileUrl,
                teacher: { id: formData.teacherId },
                teacherId: formData.teacherId,
                courseId: formData.courseId || null,
                classId: formData.classId || null,
                state: 1,
                status: 'live',
                date: new Date().toISOString().slice(0, 10),
                questions: [],
                integrity: {},
            };

            await upsertExam(payload);
            toast.success('Exam Paper Created Successfully!');
            navigate('/app/exams');
        } catch (error) {
            console.error("Failed to create exam", error);
            toast.error("Failed to create the exam paper.");
        }
    };

    return (
        <AppLayout>
            <div className="p-6 max-w-5xl mx-auto space-y-6">
                <div className="mb-6">
                    <p className="text-sm text-muted-foreground mb-1">Teachers / Manage Exams / Add Papers</p>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Add Papers</h1>
                </div>

                <div className="bg-card rounded-xl border shadow-sm p-6 mx-auto">
                    <Steps currentStep={step} />

                    {step === 1 && (
                        <div className="space-y-6 max-w-3xl mx-auto py-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="space-y-2">
                                <Label>Select Teacher</Label>
                                <Select value={formData.teacherId ? String(formData.teacherId) : ''} onValueChange={(v) => setFormData({ ...formData, teacherId: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select teacher" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-blue-50 [&_[data-highlighted]]:bg-blue-200 [&_[data-highlighted]]:text-blue-900 border-border">
                                        {teachers.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Paper Title</Label>
                                <Input placeholder="Enter Paper Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <Label>Paper Description / Instruction</Label>
                                <Textarea placeholder="Enter description or instructions" className="min-h-[120px]" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <Label>Time Allocation (Duration)</Label>
                                <Select value={formData.timeAllocation} onValueChange={(v) => setFormData({ ...formData, timeAllocation: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select duration" />
                                        <Clock className="h-4 w-4 text-muted-foreground ml-auto opacity-50" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-blue-50 [&_[data-highlighted]]:bg-blue-200 [&_[data-highlighted]]:text-blue-900 border-border">
                                        <SelectItem value="30">30 Minutes</SelectItem>
                                        <SelectItem value="60">1 Hour</SelectItem>
                                        <SelectItem value="90">1.5 Hours</SelectItem>
                                        <SelectItem value="120">2 Hours</SelectItem>
                                        <SelectItem value="150">2.5 Hours</SelectItem>
                                        <SelectItem value="180">3 Hours</SelectItem>
                                        <SelectItem value="240">4 Hours</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <Label>Select Paper Type</Label>
                                <RadioGroup value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })} className="flex gap-8">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="mcq" id="mcq" />
                                        <Label htmlFor="mcq" className="cursor-pointer">MCQ</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="essay" id="essay" />
                                        <Label htmlFor="essay" className="cursor-pointer">Essay</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="max-w-xl mx-auto py-12 text-center space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 hover:bg-muted/50 transition-colors flex flex-col items-center justify-center">
                                <div className="p-4 bg-primary/10 rounded-full mb-4">
                                    <Upload className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-medium">Upload Exam Paper</h3>
                                <p className="text-sm text-muted-foreground mb-6 max-w-xs">Drag and drop your PDF or DOCX file here, or click to browse.</p>
                                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={e => {
                                    if (e.target.files[0]) {
                                        setFormData({ ...formData, file: e.target.files[0] });
                                        toast.success(`File attached successfully!`);
                                    }
                                }} />
                                {formData.file ? (
                                    <div className="flex flex-col items-center">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg mb-4 border border-green-200">
                                            <CheckCircle2 className="w-5 h-5" />
                                            <span className="font-medium">{formData.file.name}</span>
                                        </div>
                                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>Change File</Button>
                                    </div>
                                ) : (
                                    <Button className="bg-blue-500 hover:bg-blue-600 text-white border-transparent shadow-sm transition-colors" onClick={() => fileInputRef.current?.click()}>Browse Files</Button>
                                )}
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="max-w-3xl mx-auto py-4 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold">Link to Course (Optional)</h3>
                                <p className="text-muted-foreground">Associate this exam with specific courses.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {courses.map(course => (
                                    <div key={course.id}
                                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${formData.courseId === course.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                                        onClick={() => {
                                            setFormData({ ...formData, courseId: course.id });
                                        }}
                                    >
                                        <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${formData.courseId === course.id ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                                            {formData.courseId === course.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium">{course.name || course.title}</p>
                                            <p className="text-xs text-muted-foreground">{course.status || 'Active'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="text-center mt-8 mb-6">
                                <h3 className="text-lg font-semibold">Link to Class (Optional)</h3>
                                <p className="text-muted-foreground">Associate this exam with specific classes.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {classes.map(c => (
                                    <div key={c.id}
                                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${formData.classId === c.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                                        onClick={() => {
                                            setFormData({ ...formData, classId: c.id });
                                        }}
                                    >
                                        <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${formData.classId === c.id ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                                            {formData.classId === c.id && <CheckCircle2 className="w-3.5 h-3.5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium">{c.name}</p>
                                            <p className="text-xs text-muted-foreground">{c.grade} • {c.activeStatus === 1 ? 'Active' : c.status || 'Inactive'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between pt-8 border-t mt-8">
                        {step > 1 ? (
                            <Button className="bg-blue-500 hover:bg-blue-600 text-white border-transparent shadow-sm transition-colors" onClick={handleBack}>Back</Button>
                        ) : (
                            <div></div>
                        )}

                        {step < 3 ? (
                            <Button onClick={handleNext} className="w-24">Next</Button>
                        ) : (
                            <Button onClick={handleFinish} className="w-24 bg-primary text-primary-foreground">Finish Test</Button>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default AddPaper;

