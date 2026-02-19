import { useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader, StatCard } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
import { DollarSign, CreditCard, Download, Plus, TrendingUp, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { uid } from '@/lib/storage';
const Payments = () => {
    const { user } = useAuth();
    const { payments, courses, users, upsertPayment, attachDepositSlip } = useLmsData();
    if (!user)
        return <Navigate to="/login"/>;
    const visiblePayments = useMemo(() => {
        if (user.role === 'student')
            return payments.filter((p) => p.studentId === user.id);
        return payments;
    }, [payments, user.id, user.role]);
    const totalRevenue = useMemo(() => payments.filter((p) => p.status === 'completed').reduce((s, p) => s + Number(p.amount || 0), 0), [payments]);
    const [studentId, setStudentId] = useState('');
    const [courseId, setCourseId] = useState('');
    const [amount, setAmount] = useState(0);
    const [method, setMethod] = useState('offline');
    return (<AppLayout>
      <div className="space-y-6 pt-12 lg:pt-0">
        <PageHeader title="Payments" subtitle="Online & offline payments (deposit slip workflow)">
          <Button size="sm" variant="outline" onClick={() => toast.message('Demo: export not wired')}>
            <Download className="w-4 h-4 mr-1"/> Export
          </Button>
          {user.role !== 'student' && (<Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-primary text-primary-foreground"><Plus className="w-4 h-4 mr-1"/> Record Payment</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader><DialogTitle>Record payment</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Student</Label>
                    <Input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Paste student user id (demo)" className="bg-secondary/50"/>
                    <p className="text-xs text-muted-foreground">Tip: open Users page to copy a student's ID (demo).</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Input value={courseId} onChange={(e) => setCourseId(e.target.value)} placeholder="Paste course id (demo)" className="bg-secondary/50"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} className="bg-secondary/50"/>
                    </div>
                    <div className="space-y-2">
                      <Label>Method</Label>
                      <div className="flex gap-2">
                        <Button type="button" variant={method === 'card' ? 'secondary' : 'outline'} onClick={() => setMethod('card')}>Card</Button>
                        <Button type="button" variant={method === 'offline' ? 'secondary' : 'outline'} onClick={() => setMethod('offline')}>Offline</Button>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button className="gradient-primary text-primary-foreground" onClick={() => {
                if (!studentId || !courseId || !amount) {
                    toast.error('Fill student, course and amount');
                    return;
                }
                const p = {
                    id: uid(),
                    studentId,
                    courseId,
                    amount,
                    date: new Date().toISOString().slice(0, 10),
                    method,
                    status: method === 'offline' ? 'pending' : 'completed',
                };
                upsertPayment(p);
                setStudentId('');
                setCourseId('');
                setAmount(0);
                setMethod('offline');
                toast.success('Recorded');
            }}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>)}
        </PageHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon={DollarSign} trend="up" change=""/>
          <StatCard title="Transactions" value={payments.length} icon={CreditCard}/>
          <StatCard title="Pending" value={payments.filter((p) => p.status === 'pending').length} icon={TrendingUp}/>
        </div>

        <Card className="glass-card">
          <CardHeader><CardTitle>Transaction History</CardTitle></CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deposit Slip</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visiblePayments.slice().reverse().map((p) => {
            const student = users.find((u) => u.id === p.studentId);
            const course = courses.find((c) => c.id === p.courseId);
            return (<TableRow key={p.id}>
                      <TableCell className="font-medium text-foreground">{student?.name ?? p.studentId}</TableCell>
                      <TableCell className="text-muted-foreground">{course?.title ?? p.courseId}</TableCell>
                      <TableCell className="font-semibold text-foreground">${Number(p.amount).toFixed(2)}</TableCell>
                      <TableCell className="text-muted-foreground">{p.date}</TableCell>
                      <TableCell><Badge variant="outline">{p.method}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={p.status === 'completed' ? 'default' : p.status === 'pending' ? 'secondary' : p.status === 'refunded' ? 'outline' : 'destructive'}>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {p.method !== 'offline' ? (<span className="text-xs text-muted-foreground">—</span>) : p.depositSlip ? (<span className="text-xs text-muted-foreground">{p.depositSlip.filename}</span>) : user.role === 'student' ? (<div className="flex items-center gap-2">
                            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                              <Upload className="w-4 h-4"/>
                              <input className="hidden" type="file" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file)
                            return;
                        attachDepositSlip(p.id, file.name);
                        toast.success('Deposit slip uploaded (demo)');
                    }}/>
                              <span className="text-primary hover:underline">Upload slip</span>
                            </label>
                          </div>) : (<span className="text-xs text-muted-foreground">Awaiting slip</span>)}
                      </TableCell>
                    </TableRow>);
        })}
                {visiblePayments.length === 0 && (<TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-6">No transactions</TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>);
};
export default Payments;
