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
    if (user.role !== 'admin') return <Navigate to="/app" />;

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
            <div className="space-y-8 pt-12 lg:pt-0">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <span className="hover:text-foreground cursor-pointer">Dashboard</span>
                            <Slash className="w-3 h-3 mx-2" />
                            <span className="text-foreground font-medium">Teachers</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Teachers</h1>
                        <p className="text-muted-foreground">Manage your institute's teaching staff, assignments, and performance.</p>
                    </div>
                </div>

                {/* Institute URL Card */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 rounded-xl p-6 text-white shadow-lg relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Copy className="w-32 h-32" />
                    </div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 text-center md:text-left">
                            <h3 className="text-lg font-semibold">Institute Public URL</h3>
                            <p className="text-slate-300 text-sm max-w-md">Share this link with your students to let them browse courses and enroll in your institute.</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm p-2 rounded-lg border border-white/20 w-full md:w-auto">
                            <span className="text-blue-200 text-sm px-3 truncate max-w-[200px] md:max-w-xs font-mono">
                                {window.location.origin}
                            </span>
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 hover:text-white" onClick={copyUrl}>
                                <Copy className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border shadow-sm">
                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search teachers by name..." className="pl-9 bg-secondary/30 border-slate-200 dark:border-slate-800 focus-visible:ring-offset-0" />
                    </div>
                    <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm" onClick={openCreate}>
                        <Plus className="w-4 h-4 mr-2" /> Add New Teacher
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {teachers.map((t) => (
                        <Card key={t.id} className="overflow-hidden border-border shadow-md hover:shadow-lg transition-shadow duration-200">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4 relative">
                                    <div className="flex gap-4">
                                        <div className="relative">
                                            <Avatar className="w-16 h-16 border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`} />
                                                <AvatarFallback>{t.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <button
                                                onClick={() => openEdit(t)}
                                                className="absolute -bottom-1 -right-1 bg-slate-700 text-white rounded-full p-1.5 hover:bg-slate-600 transition-colors ring-2 ring-white dark:ring-slate-950 shadow-sm"
                                                title="Edit Details"
                                            >
                                                <Edit className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t.name}</h3>
                                            <p className="text-xs text-muted-foreground italic mb-1">{t.title || 'Instructor'}</p>
                                            <p className="text-[10px] text-orange-500 font-medium bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full w-fit border border-orange-100 dark:border-orange-900/30">
                                                Max Enrolls : {t.maxEnrolls || 100}
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-3 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors rounded-md"
                                        onClick={() => openEdit(t)}
                                    >
                                        Edit
                                    </Button>

                                </div>

                                <div className="flex w-full gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <Button variant="destructive" size="sm" className="flex-1 bg-red-600 hover:bg-red-700 text-xs font-medium h-9" onClick={() => handleDelete(t.id)}>
                                        Delete Teacher
                                    </Button>

                                    <Button
                                        variant="default"
                                        size="sm"
                                        className={`flex-1 text-xs font-medium h-9 border-none ${t.status === 'inactive' ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-400 hover:bg-yellow-500 text-yellow-950'}`}
                                        onClick={() => toggleStatus(t)}
                                    >
                                        {t.status === 'inactive' ? 'Activate' : 'Deactivate'}
                                    </Button>

                                    <Button variant="default" size="sm" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium h-9" onClick={() => navigate(`/app/teachers/${t.id}/classes`)}>
                                        View Classes
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {teachers.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border rounded-xl">
                            <h3 className="text-lg font-medium text-muted-foreground">No teachers found</h3>
                            <p className="text-sm text-muted-foreground mt-1">Add a new teacher to get started.</p>
                        </div>
                    )}
                </div>

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
