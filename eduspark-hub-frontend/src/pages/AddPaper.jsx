import { useState } from 'react';
import { useLmsData } from '@/contexts/LmsDataContext';
import { AppLayout } from '@/components/layout/AppLayout';
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
        { id: 3, label: 'Add Class' },
        { id: 4, label: 'Add Course' },
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
    const { users, classes, courses } = useLmsData();
    const teachers = users.filter(u => u.role === 'teacher' || u.role === 'admin'); // Admins might also teach?
    const [step, setStep] = useState(1);

    // Form State
    const [formData, setFormData] = useState({
        teacherId: '',
        title: '',
        description: '',
        timeAllocation: '',
        type: 'mcq',
        file: null,
        classIds: [],
        courseIds: []
    });

    const handleNext = () => {
        // Basic Validation
        if (step === 1) {
            if (!formData.teacherId || !formData.title || !formData.description || !formData.timeAllocation) {
                toast.error('Please fill in all required fields');
                return;
            }
        }
        if (step < 4) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleFinish = () => {
        toast.success('Exam Paper Created Successfully!');
        // Ideally navigate away or reset
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
                                <Label>Select teacher (ගුරුතුමා තෝරන්න)</Label>
                                <Select value={formData.teacherId} onValueChange={(v) => setFormData({ ...formData, teacherId: v })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select teacher" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Paper Title (ප්‍රශ්න පත්‍රයේ මාතෘකාව)</Label>
                                <Input placeholder="Enter Paper Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <Label>Paper Description / Instruction (විස්තරය / උපදෙස්)</Label>
                                <Textarea placeholder="Enter description or instructions" className="min-h-[120px]" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                            </div>

                            <div className="space-y-2">
                                <Label>Time Allocation (ප්‍රශ්න පත්‍රය සඳහා කාලය)</Label>
                                <div className="relative">
                                    <Input placeholder="Select time" value={formData.timeAllocation} onChange={e => setFormData({ ...formData, timeAllocation: e.target.value })} />
                                    <Clock className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground pointer-events-none" />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Select Paper Type (ප්‍රශ්න පත්‍රයේ වර්ගය)</Label>
                                <RadioGroup value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })} className="flex gap-8">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="mcq" id="mcq" />
                                        <Label htmlFor="mcq" className="cursor-pointer">MCQ</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="essay" id="essay" />
                                        <Label htmlFor="essay" className="cursor-pointer">Essay (රචනා)</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="max-w-xl mx-auto py-12 text-center space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-10 hover:bg-muted/50 transition-colors cursor-pointer flex flex-col items-center justify-center">
                                <div className="p-4 bg-primary/10 rounded-full mb-4">
                                    <Upload className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-lg font-medium">Upload Exam Paper</h3>
                                <p className="text-sm text-muted-foreground mb-6 max-w-xs">Drag and drop your PDF or DOCX file here, or click to browse.</p>
                                <Button variant="outline">Browse Files</Button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="max-w-3xl mx-auto py-4 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold">Assign to Classes</h3>
                                <p className="text-muted-foreground">Select which classes can access this exam.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {classes.map(cls => (
                                    <div key={cls.id}
                                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${formData.classIds.includes(cls.id) ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                                        onClick={() => {
                                            const newIds = formData.classIds.includes(cls.id)
                                                ? formData.classIds.filter(id => id !== cls.id)
                                                : [...formData.classIds, cls.id];
                                            setFormData({ ...formData, classIds: newIds });
                                        }}
                                    >
                                        <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${formData.classIds.includes(cls.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                                            {formData.classIds.includes(cls.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium">{cls.name}</p>
                                            <p className="text-xs text-muted-foreground">{cls.subject} • {cls.grade}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div className="max-w-3xl mx-auto py-4 space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="text-center mb-6">
                                <h3 className="text-lg font-semibold">Link to Course (Optional)</h3>
                                <p className="text-muted-foreground">Associate this exam with a specific course.</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {courses.map(course => (
                                    <div key={course.id}
                                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${formData.courseIds.includes(course.id) ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/50'}`}
                                        onClick={() => {
                                            const newIds = formData.courseIds.includes(course.id)
                                                ? formData.courseIds.filter(id => id !== course.id)
                                                : [...formData.courseIds, course.id];
                                            setFormData({ ...formData, courseIds: newIds });
                                        }}
                                    >
                                        <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${formData.courseIds.includes(course.id) ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}>
                                            {formData.courseIds.includes(course.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                                        </div>
                                        <div>
                                            <p className="font-medium">{course.title}</p>
                                            <p className="text-xs text-muted-foreground">{course.level || 'All Levels'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between pt-8 border-t mt-8">
                        {step > 1 ? (
                            <Button variant="outline" onClick={handleBack}>Back</Button>
                        ) : (
                            <div></div>
                        )}

                        {step < 4 ? (
                            <Button onClick={handleNext} className="w-24">Next</Button>
                        ) : (
                            <Button onClick={handleFinish} className="w-24">Finish</Button>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default AddPaper;
