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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import { DollarSign, CreditCard, Download, Plus, TrendingUp, Upload, Landmark, Wifi } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { uid } from '@/lib/storage';

// ── PayHere Sandbox Config ────────────────────────────────────────────────────
const PAYHERE_MERCHANT_ID     = '4OVybuypHIe4JH5Fx67puF3Xc';
const PAYHERE_MERCHANT_SECRET = '4JAIWxxlWcz8MR4g3VugXw8QmVe8yyAO94fSsSuRlXRh';
const PAYHERE_SANDBOX         = true;

// Generate MD5 hash for PayHere (frontend-friendly, demo only — in production hash on backend)
async function generatePayHereHash(merchantId, orderId, amount, currency, secret) {
  const upperSecret = secret.toUpperCase();
  const data = `${merchantId}${orderId}${amount}${currency}${upperSecret}`;
  const msgBuffer = new TextEncoder().encode(data);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

async function initiatePayHerePayment({ studentName, studentEmail, studentPhone, amount, orderId, itemName }) {
  const currency = 'LKR';
  const hash = await generatePayHereHash(
    PAYHERE_MERCHANT_ID,
    orderId,
    parseFloat(amount).toFixed(2),
    currency,
    btoa(PAYHERE_MERCHANT_SECRET) // demo only
  );

  const baseUrl = PAYHERE_SANDBOX
    ? 'https://sandbox.payhere.lk/pay/checkout'
    : 'https://www.payhere.lk/pay/checkout';

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = baseUrl;
  form.target = '_blank'; // open in new tab

  const fields = {
    merchant_id:    PAYHERE_MERCHANT_ID,
    return_url:     window.location.href,
    cancel_url:     window.location.href,
    notify_url:     'http://localhost:8080/api/payments/payhere-notify', // backend endpoint
    order_id:       orderId,
    items:          itemName,
    amount:         parseFloat(amount).toFixed(2),
    currency,
    hash,
    first_name:     studentName.split(' ')[0] || studentName,
    last_name:      studentName.split(' ')[1] || '',
    email:          studentEmail,
    phone:          studentPhone,
    address:        'Modernistic LMS',
    city:           'Colombo',
    country:        'Sri Lanka',
  };

  Object.entries(fields).forEach(([key, val]) => {
    const input = document.createElement('input');
    input.type  = 'hidden';
    input.name  = key;
    input.value = val;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
}

// ─────────────────────────────────────────────────────────────────────────────

const Payments = () => {
  const { user } = useAuth();
  const { payments, courses, users, upsertPayment, attachDepositSlip } = useLmsData();

  if (!user) return <Navigate to="/login"/>;

  const visiblePayments = useMemo(() => {
    if (user.role === 'student') return payments.filter(p => p.studentId === user.id);
    return payments;
  }, [payments, user.id, user.role]);

  const totalRevenue  = useMemo(() =>
    payments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount || 0), 0),
    [payments]
  );

  // Admin/Teacher: Record Payment state
  const [studentId, setStudentId] = useState('');
  const [courseId,  setCourseId]  = useState('');
  const [amount,    setAmount]    = useState(0);
  const [method,    setMethod]    = useState('offline');

  // Student: PayHere online payment state
  const [payDialogOpen, setPayDialogOpen] = useState(false);
  const [payPhone,      setPayPhone]      = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [onlineAmount, setOnlineAmount]   = useState('');
  const [paying, setPaying] = useState(false);

  const studentCourses = useMemo(() =>
    courses.filter(c => !payments.some(p =>
      p.studentId === user.id && p.courseId === c.id && p.status === 'completed'
    )),
    [courses, payments, user.id]
  );

  const handleOnlinePayment = async () => {
    if (!selectedCourseId || !onlineAmount || !payPhone) {
      toast.error('Please fill all fields');
      return;
    }
    const course = courses.find(c => c.id === selectedCourseId);
    const orderId = `LMS-${uid()}`;
    setPaying(true);
    try {
      // Record payment as pending first
      const p = {
        id: orderId,
        studentId: user.id,
        courseId: selectedCourseId,
        amount: onlineAmount,
        date: new Date().toISOString().slice(0, 10),
        method: 'payhere',
        status: 'pending',
      };
      upsertPayment(p);

      await initiatePayHerePayment({
        studentName:  user.name || 'Student',
        studentEmail: user.email || 'student@lms.lk',
        studentPhone: payPhone,
        amount:       onlineAmount,
        orderId,
        itemName:     course?.title || 'LMS Course Fee',
      });
      toast.success('Redirecting to PayHere secure checkout...');
      setPayDialogOpen(false);
    } catch (err) {
      toast.error('Payment initiation failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 pt-12 lg:pt-0">
        <PageHeader title="Payments" subtitle="Online (PayHere) & offline (deposit slip) payments">

          {/* Export */}
          <Button size="sm" variant="outline" onClick={() => toast.message('Export feature — coming soon')}>
            <Download className="w-4 h-4 mr-1"/> Export
          </Button>

          {/* Admin/Teacher: record payment manually */}
          {user.role !== 'student' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm" className="gradient-primary text-primary-foreground">
                  <Plus className="w-4 h-4 mr-1"/> Record Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader><DialogTitle>Record payment</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Student</Label>
                    <Input value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="Paste student user id" className="bg-secondary/50"/>
                  </div>
                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Input value={courseId} onChange={e => setCourseId(e.target.value)} placeholder="Paste course id" className="bg-secondary/50"/>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount (LKR)</Label>
                      <Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="bg-secondary/50"/>
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
                    if (!studentId || !courseId || !amount) { toast.error('Fill student, course and amount'); return; }
                    const p = { id: uid(), studentId, courseId, amount, date: new Date().toISOString().slice(0, 10), method, status: method === 'offline' ? 'pending' : 'completed' };
                    upsertPayment(p);
                    setStudentId(''); setCourseId(''); setAmount(0); setMethod('offline');
                    toast.success('Recorded');
                  }}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Student: Pay Online via PayHere */}
          {user.role === 'student' && (
            <Dialog open={payDialogOpen} onOpenChange={setPayDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:shadow-lg">
                  <Wifi className="w-4 h-4 mr-1"/> Pay Online (PayHere)
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-500"/>
                    Pay Online via PayHere
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 text-sm text-orange-700 dark:text-orange-400">
                    🔒 Secure payment powered by <strong>PayHere</strong> — Sri Lanka's trusted payment gateway. Supports Visa, Mastercard, and local bank cards.
                  </div>
                  <div className="space-y-2">
                    <Label>Select Course</Label>
                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue placeholder="Choose a course to pay for"/>
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map(c => (
                          <SelectItem key={c.id} value={c.id}>{c.title} — LKR {c.fee || '0'}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount (LKR)</Label>
                    <Input type="number" value={onlineAmount} onChange={e => setOnlineAmount(e.target.value)} placeholder="e.g. 5000" className="bg-secondary/50"/>
                  </div>
                  <div className="space-y-2">
                    <Label>Your Phone Number</Label>
                    <Input value={payPhone} onChange={e => setPayPhone(e.target.value)} placeholder="07X XXXXXXX" className="bg-secondary/50"/>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setPayDialogOpen(false)}>Cancel</Button>
                  <Button
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white"
                    onClick={handleOnlinePayment}
                    disabled={paying}
                  >
                    {paying ? 'Processing...' : '🔒 Proceed to PayHere'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </PageHeader>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard title="Total Revenue (LKR)" value={`Rs. ${totalRevenue.toLocaleString()}`} icon={DollarSign} trend="up" change=""/>
          <StatCard title="Transactions" value={payments.length} icon={CreditCard}/>
          <StatCard title="Pending" value={payments.filter(p => p.status === 'pending').length} icon={TrendingUp}/>
        </div>

        {/* Transaction Table */}
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
                  <TableHead>Deposit Slip / Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visiblePayments.slice().reverse().map(p => {
                  const student = users.find(u => u.id === p.studentId);
                  const course  = courses.find(c => c.id === p.courseId);
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-foreground">{student?.name ?? p.studentId}</TableCell>
                      <TableCell className="text-muted-foreground">{course?.title ?? p.courseId}</TableCell>
                      <TableCell className="font-semibold text-foreground">Rs. {Number(p.amount).toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">{p.date}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          {p.method === 'payhere' ? <><Wifi className="w-3 h-3 text-orange-500"/> PayHere</> :
                           p.method === 'offline' ? <><Landmark className="w-3 h-3"/> Offline</> :
                           p.method}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          p.status === 'completed' ? 'default' :
                          p.status === 'pending'   ? 'secondary' :
                          p.status === 'refunded'  ? 'outline'   : 'destructive'
                        }>
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {p.method === 'payhere' ? (
                          <span className="text-xs text-orange-500 font-medium">PayHere Online</span>
                        ) : p.depositSlip ? (
                          <span className="text-xs text-muted-foreground">{p.depositSlip.filename}</span>
                        ) : user.role === 'student' ? (
                          <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                            <Upload className="w-4 h-4"/>
                            <input className="hidden" type="file" onChange={e => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              attachDepositSlip(p.id, file.name);
                              toast.success('Deposit slip uploaded');
                            }}/>
                            <span className="text-primary hover:underline">Upload slip</span>
                          </label>
                        ) : (
                          <span className="text-xs text-muted-foreground">Awaiting slip</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {visiblePayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-6">No transactions yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Payments;
