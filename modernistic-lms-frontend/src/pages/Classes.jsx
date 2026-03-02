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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';
const Classes = () => {
    const { user } = useAuth();
    const { classes, courses, users, upsertClass } = useLmsData();
    if (!user)
        return <Navigate to="/login"/>;
    const canManage = user.role === 'admin';
    const teachers = users.filter((u) => u.role === 'teacher');
    const courseList = courses;
    const [draft, setDraft] = useState({
        name: '',
        grade: '10th',
        status: 'active',
        teacherId: teachers[0]?.id,
        courseIds: [],
        studentIds: [],
    });
    const rows = useMemo(() => classes.map((c) => {
        const teacher = users.find((u) => u.id === c.teacherId);
        const courseNames = c.courseIds.map((id) => courseList.find((x) => x.id === id)?.title).filter(Boolean).join(', ');
        return { c, teacher, courseNames };
    }), [classes, courseList, users]);
    return (<AppLayout>
      <div className="space-y-6 pt-12 lg:pt-0">
        <PageHeader title="Classes" subtitle="Create and manage class groups">
          {canManage && (<Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1"/> New Class</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader><DialogTitle>Create class</DialogTitle></DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Grade 10 - A"/>
                  </div>
                  <div className="space-y-2">
                    <Label>Grade</Label>
                    <Select value={draft.grade} onValueChange={(v) => setDraft((d) => ({ ...d, grade: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {['6th', '7th', '8th', '9th', '10th', '11th', '12th'].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Teacher</Label>
                    <Select value={draft.teacherId ?? ''} onValueChange={(v) => setDraft((d) => ({ ...d, teacherId: v || undefined }))}>
                      <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
                      <SelectContent>
                        {teachers.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Courses</Label>
                    <Select value={(draft.courseIds[0] ?? '')} onValueChange={(v) => setDraft((d) => ({ ...d, courseIds: v ? [v] : [] }))}>
                      <SelectTrigger><SelectValue placeholder="Select"/></SelectTrigger>
                      <SelectContent>
                        {courseList.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Demo UI supports selecting one course per class. Extend to multi-course easily.</p>
                  </div>
                </div>
                <DialogFooter>
                  <Button className="gradient-primary text-primary-foreground" onClick={() => {
                const created = { id: uid(), ...draft };
                upsertClass(created);
                setDraft({ name: '', grade: '10th', status: 'active', teacherId: teachers[0]?.id, courseIds: [], studentIds: [] });
            }}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>)}
        </PageHeader>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Class list</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map(({ c, teacher, courseNames }) => (<TableRow key={c.id}>
                    <TableCell className="font-medium text-foreground">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground">{c.grade}</TableCell>
                    <TableCell className="text-muted-foreground">{teacher?.name ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{courseNames || '—'}</TableCell>
                    <TableCell className="text-muted-foreground">{c.studentIds.length}</TableCell>
                    <TableCell>
                      <Badge variant={c.status === 'active' ? 'default' : 'secondary'}>{c.status}</Badge>
                    </TableCell>
                  </TableRow>))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>);
};
export default Classes;

