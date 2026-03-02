import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { uid } from '@/lib/storage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { Plus, Copy, Edit, Trash2, Ban, CheckCircle, Eye, Search, Slash } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const Teachers = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { users, classes, upsertUser, deleteUser } = useLmsData();

    if (!user) return <Navigate to="/login" />;
    if (user.role !== 'admin' && user.role !== 'institute') return <Navigate to="/app" />;

    const teachers = useMemo(() => users.filter((u) => u.role === 'teacher'), [users]);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [draft, setDraft] = useState({
        id: '',
        name: '',
        email: '',
        mobile: '',
        title: '',
        maxEnrolls: 100,
        role: 'teacher',
        status: 'active',
    });
    const [isEditing, setIsEditing] = useState(false);

    const openCreate = () => {
        setDraft({ id: '', name: '', email: '', mobile: '', title: '', maxEnrolls: 100, role: 'teacher', status: 'active' });
        setIsEditing(false);
        setIsDialogOpen(true);
    };

    const openEdit = (teacher) => {
        setDraft({ ...teacher, title: teacher.title || '', maxEnrolls: teacher.maxEnrolls || 100 });
        setIsEditing(true);
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        if (!draft.name.trim() || !draft.email.trim()) {
            toast.error('Name and email are required');
            return;
        }

        const payload = {
            ...draft,
            id: draft.id || uid(),
            role: 'teacher',
        };

        upsertUser(payload);
        toast.success(isEditing ? 'Teacher updated' : 'Teacher created');
        setIsDialogOpen(false);
    };

    const toggleStatus = (teacher) => {
        const newStatus = teacher.status === 'inactive' ? 'active' : 'inactive';
        upsertUser({ ...teacher, status: newStatus });
        toast.success(`Teacher ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this teacher?')) {
            if (deleteUser) {
                deleteUser(id);
                toast.success('Teacher deleted');
            } else {
                toast.error('Delete function not found');
            }
        }
    }

    const copyUrl = () => {
        navigator.clipboard.writeText(window.location.origin);
        toast.success('URL copied to clipboard');
    }

    return (
        <AppLayout>
            <div className="space-y-5 pt-12 lg:pt-0">

                {/* Breadcrumb + Title */}
                <div>
                    <p className="text-sm text-blue-600 font-medium mb-1 cursor-pointer hover:underline">Teachers</p>
                </div>



                {/* Add New Teacher – right aligned */}
                <div className="flex justify-end">
                    <button
                        onClick={openCreate}
                        className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold px-5 py-2.5 rounded-md transition-colors shadow"
                    >
                        <Plus className="w-4 h-4" /> Add New Teacher
                    </button>
                </div>

                {/* Teacher Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {teachers.map((t) => (
                        <div
                            key={t.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Top section: avatar + info + Edit button */}
                            <div className="relative flex items-start gap-4 p-5 pb-4">
                                {/* Edit button – top right */}
                                <button
                                    onClick={() => openEdit(t)}
                                    className="absolute top-4 right-4 text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                >
                                    Edit
                                </button>

                                {/* Square avatar with Edit badge */}
                                <div className="relative flex-shrink-0">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100">
                                        <img
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}&backgroundColor=b6e3f4,c0aede,d1d4f9`}
                                            alt={t.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    {/* Small Edit badge below avatar */}
                                    <button
                                        onClick={() => openEdit(t)}
                                        className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 text-[10px] bg-slate-600 hover:bg-slate-500 text-white px-2.5 py-0.5 rounded-sm font-semibold transition-colors whitespace-nowrap shadow"
                                    >
                                        Edit
                                    </button>
                                </div>

                                {/* Text info */}
                                <div className="pt-1 pr-14 min-w-0 mt-1">
                                    <h3 className="text-xl font-extrabold text-slate-800 dark:text-white leading-snug">{t.name}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-0.5">{t.title || 'Instructor'}</p>
                                    <p className="text-xs text-orange-500 font-semibold mt-2">Max Enrolls : {t.maxEnrolls || 100}</p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="mx-5 border-t border-slate-100 dark:border-slate-800" />

                            {/* Action buttons */}
                            <div className="flex items-center gap-3 px-5 py-4">
                                <button
                                    onClick={() => handleDelete(t.id)}
                                    className="flex-shrink-0 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-md transition-colors"
                                >
                                    Delete Teacher
                                </button>
                                <button
                                    onClick={() => toggleStatus(t)}
                                    className="flex-shrink-0 bg-yellow-400 hover:bg-yellow-500 text-white text-xs font-bold px-4 py-2 rounded-md transition-colors"
                                >
                                    {t.status === 'inactive' ? 'Activate' : 'Deactivate'}
                                </button>
                                <div className="flex-1" />
                                <button
                                    onClick={() => navigate(`/app/teachers/${t.id}/classes`)}
                                    className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-5 py-2 rounded-md transition-colors"
                                >
                                    View Classes
                                </button>
                            </div>
                        </div>
                    ))}

                    {teachers.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                            <h3 className="text-lg font-medium text-muted-foreground">No teachers found</h3>
                            <p className="text-sm text-muted-foreground mt-1">Click "+ Add New Teacher" to get started.</p>
                        </div>
                    )}
                </div>

                {/* Add / Edit Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{isEditing ? 'Edit Teacher' : 'Add Teacher'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" value={draft.name} onChange={(e) => setDraft(d => ({ ...d, name: e.target.value }))} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="title">Title / Qualification</Label>
                                <Input id="title" placeholder="e.g. Professor of Mathematics" value={draft.title} onChange={(e) => setDraft(d => ({ ...d, title: e.target.value }))} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={draft.email} onChange={(e) => setDraft(d => ({ ...d, email: e.target.value }))} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="mobile">Mobile</Label>
                                <Input id="mobile" value={draft.mobile} onChange={(e) => setDraft(d => ({ ...d, mobile: e.target.value }))} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="maxEnrolls">Max Enrolls</Label>
                                <Input id="maxEnrolls" type="number" value={draft.maxEnrolls} onChange={(e) => setDraft(d => ({ ...d, maxEnrolls: e.target.value }))} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} className="gradient-primary text-primary-foreground">{isEditing ? 'Update' : 'Create'}</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
};

export default Teachers;

