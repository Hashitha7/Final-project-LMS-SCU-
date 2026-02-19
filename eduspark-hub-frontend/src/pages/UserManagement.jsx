import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { uid } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/sonner';
import { Plus } from 'lucide-react';
const UserManagement = () => {
    const { user } = useAuth();
    const { users, upsertUser } = useLmsData();
    if (!user)
        return <Navigate to="/login"/>;
    if (user.role !== 'admin')
        return <Navigate to="/app"/>;
    const [activeTab, setActiveTab] = useState('teacher');
    const list = useMemo(() => users.filter((u) => u.role === activeTab), [users, activeTab]);
    const [draft, setDraft] = useState({
        name: '',
        email: '',
        mobile: '',
        role: 'teacher',
    });
    const create = () => {
        if (!draft.name.trim() || !draft.email.trim()) {
            toast.error('Name and email are required');
            return;
        }
        const created = {
            id: uid(),
            name: draft.name.trim(),
            email: draft.email.trim(),
            mobile: draft.mobile?.trim() || undefined,
            role: draft.role,
            subscription: draft.role === 'student' ? { plan: 'free' } : undefined,
        };
        upsertUser(created);
        toast.success('User created');
        setDraft({ name: '', email: '', mobile: '', role: activeTab });
    };
    return (<AppLayout>
      <div className="space-y-6 pt-12 lg:pt-0">
        <PageHeader title="User Management" subtitle="Create and manage teachers, students and admins">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm" className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1"/> New user</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>Create user</DialogTitle></DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} className="bg-secondary/50"/>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <select aria-label="Role" className="w-full h-10 rounded-md bg-secondary/50 border border-border px-3 text-sm" value={draft.role} onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>

                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={draft.email} onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))} className="bg-secondary/50"/>
                </div>
                <div className="space-y-2">
                  <Label>Mobile (optional)</Label>
                  <Input value={draft.mobile ?? ''} onChange={(e) => setDraft((d) => ({ ...d, mobile: e.target.value }))} className="bg-secondary/50"/>
                </div>
              </div>
              <DialogFooter>
                <Button className="gradient-primary text-primary-foreground" onClick={create}>Create</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PageHeader>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setDraft((d) => ({ ...d, role: v })); }}>
              <TabsList>
                <TabsTrigger value="teacher">Teachers</TabsTrigger>
                <TabsTrigger value="student">Students</TabsTrigger>
                <TabsTrigger value="admin">Admins</TabsTrigger>
              </TabsList>
              <TabsContent value={activeTab} className="pt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {list.map((u) => (<TableRow key={u.id}>
                        <TableCell className="font-medium text-foreground">{u.name}</TableCell>
                        <TableCell className="text-muted-foreground">{u.email}</TableCell>
                        <TableCell className="text-muted-foreground">{u.mobile ?? '—'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Active</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{u.id}</TableCell>
                      </TableRow>))}
                    {list.length === 0 && (<TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No users</TableCell></TableRow>)}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
            <p className="text-xs text-muted-foreground mt-3">
              Demo note: This UI includes create/list flows. Extend with deactivate/delete & class assignment as per the full admin portal.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>);
};
export default UserManagement;
