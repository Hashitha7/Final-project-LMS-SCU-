import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';
import { Plus, Eye, EyeOff, UserCheck, Trash2, Power, PowerOff } from 'lucide-react';

const EMPTY_DRAFT = {
    id: '',
    name: '',
    email: '',
    password: '',
    mobile: '',
    qualification: '',
    maxEnrolls: 100,
    role: 'teacher',
    status: 'active',
};

const Teachers = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { users, upsertUser, deleteUser } = useLmsData();

    if (!user) return <Navigate to="/login" />;
    if (user.role !== 'admin' && user.role !== 'institute') return <Navigate to="/app" />;

    const teachers = useMemo(() => users.filter((u) => u.role === 'teacher'), [users]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [draft, setDraft] = useState(EMPTY_DRAFT);
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const set = (field, value) => {
        setDraft(d => ({ ...d, [field]: value }));
        setErrors(e => ({ ...e, [field]: '' }));
    };

    const openCreate = () => {
        setDraft(EMPTY_DRAFT);
        setErrors({});
        setIsEditing(false);
        setShowPassword(false);
        setIsDialogOpen(true);
    };

    const openEdit = (teacher) => {
        // Don't carry password hash into edit form — leave blank means "no change"
        setDraft({
            ...EMPTY_DRAFT,
            ...teacher,
            password: '',           // clear hashed password
            qualification: teacher.qualification || '',
            maxEnrolls: teacher.maxEnrolls || 100,
        });
        setErrors({});
        setIsEditing(true);
        setShowPassword(false);
        setIsDialogOpen(true);
    };

    const validate = () => {
        const newErrors = {};
        if (!draft.name.trim()) newErrors.name = 'Name is required';
        if (!draft.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) newErrors.email = 'Invalid email format';
        if (!isEditing && !draft.password.trim()) newErrors.password = 'Password is required for new teacher';
        if (draft.password && draft.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            const payload = {
                ...draft,
                role: 'teacher',
                maxEnrolls: Number(draft.maxEnrolls) || 100,
            };
            // If editing and password is blank, remove it so backend keeps the existing one
            if (isEditing && !payload.password) {
                delete payload.password;
            }
            await upsertUser(payload);
            toast.success(isEditing ? '✅ Teacher updated successfully!' : '✅ Teacher added successfully!');
            setIsDialogOpen(false);
        } catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Failed to save teacher';
            toast.error('❌ ' + msg);
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async (teacher) => {
        const newStatus = teacher.status === 'inactive' ? 'active' : 'inactive';
        try {
            await upsertUser({ ...teacher, status: newStatus });
            toast.success(`Teacher ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
        } catch {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async (teacher) => {
        if (!confirm(`Are you sure you want to delete "${teacher.name}"? This cannot be undone.`)) return;
        try {
            await deleteUser(teacher.id, 'teacher');
            toast.success('Teacher deleted');
        } catch {
            toast.error('Failed to delete teacher');
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6 pt-12 lg:pt-0">

                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-blue-500 font-medium mb-0.5">Management</p>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Teachers</h1>
                    </div>
                    <button
                        id="add-teacher-btn"
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all shadow-md"
                    >
                        <Plus className="w-4 h-4" />
                        Add New Teacher
                    </button>
                </div>

                {/* Teacher Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {teachers.map((t) => (
                        <div
                            key={t.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden"
                        >
                            {/* Status bar */}
                            <div className={`h-1 w-full ${t.status === 'inactive' ? 'bg-red-400' : 'bg-emerald-400'}`} />

                            {/* Top: Avatar + Info + Edit */}
                            <div className="relative flex items-start gap-4 p-5 pb-4">
                                <button
                                    onClick={() => openEdit(t)}
                                    className="absolute top-4 right-4 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-md font-semibold hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900 dark:hover:text-blue-300 transition-colors"
                                >
                                    Edit
                                </button>

                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100">
                                        <img
                                            src={t.imageUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(t.name)}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                                            alt={t.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {t.status === 'inactive' && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                            OFF
                                        </span>
                                    )}
                                </div>

                                {/* Text info */}
                                <div className="pt-1 min-w-0 pr-14">
                                    <h3 className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight truncate">{t.name}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-0.5">{t.qualification || 'Instructor'}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">{t.email}</p>
                                    <p className="text-xs text-orange-500 font-semibold mt-2">Max Enrolls: {t.maxEnrolls || 100}</p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="mx-5 border-t border-slate-100 dark:border-slate-800" />

                            {/* Action buttons */}
                            <div className="flex items-center gap-2 px-5 py-4">
                                <button
                                    onClick={() => handleDelete(t)}
                                    className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold px-3.5 py-2 rounded-md transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                                <button
                                    onClick={() => toggleStatus(t)}
                                    className={`flex items-center gap-1.5 text-white text-xs font-bold px-3.5 py-2 rounded-md transition-all active:scale-95 ${t.status === 'inactive' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-amber-500 hover:bg-amber-600'}`}
                                >
                                    {t.status === 'inactive'
                                        ? <><UserCheck className="w-3.5 h-3.5" /> Activate</>
                                        : <><PowerOff className="w-3.5 h-3.5" /> Deactivate</>
                                    }
                                </button>
                                <div className="flex-1" />
                                <button
                                    onClick={() => navigate(`/app/teachers/${t.id}/classes`)}
                                    className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-bold px-4 py-2 rounded-md transition-all"
                                >
                                    View Classes
                                </button>
                            </div>
                        </div>
                    ))}

                    {teachers.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                <Plus className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300">No teachers yet</h3>
                            <p className="text-sm text-slate-400 mt-1 mb-4">Click "+ Add New Teacher" to get started.</p>
                            <button
                                onClick={openCreate}
                                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all"
                            >
                                <Plus className="w-4 h-4" /> Add New Teacher
                            </button>
                        </div>
                    )}
                </div>

                {/* ── Add / Edit Dialog ── */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">
                                {isEditing ? '✏️ Edit Teacher' : '➕ Add New Teacher'}
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-500 mt-1">
                                {isEditing
                                    ? 'Update the teacher details below. Leave password blank to keep the existing one.'
                                    : 'Fill in the details to create a new teacher account.'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-2">
                            {/* Name */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="t-name">
                                    Full Name <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="t-name"
                                    placeholder="e.g. Dr. Samantha Perera"
                                    value={draft.name}
                                    onChange={e => set('name', e.target.value)}
                                    className={errors.name ? 'border-red-500 focus-visible:ring-red-400' : ''}
                                />
                                {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                            </div>

                            {/* Email */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="t-email">
                                    Email Address <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="t-email"
                                    type="email"
                                    placeholder="teacher@example.com"
                                    value={draft.email}
                                    onChange={e => set('email', e.target.value)}
                                    className={errors.email ? 'border-red-500 focus-visible:ring-red-400' : ''}
                                />
                                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                            </div>

                            {/* Password */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="t-password">
                                    Password {!isEditing && <span className="text-red-500">*</span>}
                                    {isEditing && <span className="text-slate-400 font-normal text-xs"> (leave blank to keep current)</span>}
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="t-password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder={isEditing ? '••••••••' : 'Min 6 characters'}
                                        value={draft.password}
                                        onChange={e => set('password', e.target.value)}
                                        className={`pr-10 ${errors.password ? 'border-red-500 focus-visible:ring-red-400' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                            </div>

                            {/* Two columns: Mobile + Qualification */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-1.5">
                                    <Label htmlFor="t-mobile">Mobile Number</Label>
                                    <Input
                                        id="t-mobile"
                                        placeholder="07X XXX XXXX"
                                        value={draft.mobile}
                                        onChange={e => set('mobile', e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-1.5">
                                    <Label htmlFor="t-qual">Qualification / Title</Label>
                                    <Input
                                        id="t-qual"
                                        placeholder="e.g. B.Sc., M.Sc."
                                        value={draft.qualification}
                                        onChange={e => set('qualification', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Max Enrolls */}
                            <div className="grid gap-1.5">
                                <Label htmlFor="t-maxEnrolls">Max Student Enrollments</Label>
                                <Input
                                    id="t-maxEnrolls"
                                    type="number"
                                    min={1}
                                    placeholder="100"
                                    value={draft.maxEnrolls}
                                    onChange={e => set('maxEnrolls', e.target.value)}
                                />
                                <p className="text-xs text-slate-400">Maximum number of students this teacher can enroll</p>
                            </div>
                        </div>

                        <DialogFooter className="gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-slate-800 hover:bg-slate-700 text-white min-w-[100px]"
                            >
                                {saving
                                    ? (isEditing ? 'Updating…' : 'Creating…')
                                    : (isEditing ? 'Update Teacher' : 'Create Teacher')
                                }
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </AppLayout>
    );
};

export default Teachers;
