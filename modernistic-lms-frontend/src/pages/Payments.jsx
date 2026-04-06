import { useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import { DollarSign, CreditCard, Download, Plus, TrendingUp, Upload, Landmark, ShieldCheck, ReceiptText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { uid } from '@/lib/storage';

const Payments = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { payments, courses, users, upsertPayment, setPaymentStatus, attachDepositSlip } = useLmsData();

  if (!user) return <Navigate to="/login"/>;

  const isStudent = user.role === 'student';
  const isFinanceManager = ['admin', 'institute'].includes(user.role);

  const visiblePayments = useMemo(() => {
    if (isStudent) return payments.filter(p => p.studentId === user.id);
    return payments;
  }, [isStudent, payments, user.id]);

  const completedCourseIds = useMemo(() => new Set(
    payments
      .filter((p) => p.studentId === user.id && p.status === 'completed')
      .map((p) => String(p.courseId))
  ), [payments, user.id]);

  const studentDueCourses = useMemo(() => {
    if (!isStudent) return [];
    return courses.filter((c) => {
      const id = String(c.id);
      const fee = Number(c.fee || c.price || c.totalFee || 0);
      const hasPending = payments.some(
        (p) => String(p.studentId) === String(user.id) && String(p.courseId) === id && p.status === 'pending'
      );

      return fee > 0 && !completedCourseIds.has(id) && !hasPending;
    });
  }, [completedCourseIds, courses, isStudent, payments, user.id]);

  const totalRevenue  = useMemo(() =>
    payments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount || 0), 0),
    [payments]
  );

  // Admin / Institute: Record Payment state
  const [studentId, setStudentId] = useState('');
  const [courseId,  setCourseId]  = useState('');
  const [amount,    setAmount]    = useState('');
  const [method,    setMethod]    = useState('offline');

  // Student gateway state
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [gatewayPhone, setGatewayPhone] = useState('');
  const [cardName, setCardName] = useState(user.name || '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [gatewayLoading, setGatewayLoading] = useState(false);

  const selectedCourse = useMemo(
    () => courses.find((c) => String(c.id) === String(selectedCourseId)),
    [courses, selectedCourseId]
  );

  const selectedCourseAmount = useMemo(() => {
    if (!selectedCourse) return '';
    const amountFromCourse = Number(selectedCourse.fee || selectedCourse.price || selectedCourse.totalFee || 0);
    return amountFromCourse > 0 ? String(amountFromCourse) : '';
  }, [selectedCourse]);

  const openGatewayForCourse = (id) => {
    setSelectedCourseId(String(id));
    setGatewayOpen(true);
  };

  useEffect(() => {
    if (!isStudent) return;

    const query = new URLSearchParams(location.search || '');
    const action = query.get('action');
    const courseId = query.get('courseId');
    if (action !== 'pay' || !courseId) return;

    const dueCourse = studentDueCourses.find((c) => String(c.id) === String(courseId));
    if (dueCourse) {
      setSelectedCourseId(String(dueCourse.id));
      setGatewayOpen(true);
      toast.message(`Checkout opened for ${dueCourse.title}`);
    } else {
      toast.message('This course is already paid or unavailable for payment.');
    }

    navigate('/app/payments', { replace: true });
  }, [isStudent, location.search, navigate, studentDueCourses]);

  const validateGatewayForm = () => {
    const onlyDigits = cardNumber.replace(/\s+/g, '');
    if (!selectedCourseId || !gatewayPhone || !cardName || !cardNumber || !expiry || !cvv) {
      toast.error('Please fill all payment fields.');
      return false;
    }
    if (!/^\d{13,19}$/.test(onlyDigits)) {
      toast.error('Card number is invalid.');
      return false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      toast.error('Use expiry format MM/YY.');
      return false;
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      toast.error('CVV is invalid.');
      return false;
    }
    return true;
  };

  const handleStudentGatewayPayment = async () => {
    if (!validateGatewayForm()) return;
    setGatewayLoading(true);

    const orderId = `LMS-${uid().toUpperCase()}`;
    const amountValue = Number(selectedCourseAmount || 0);
    if (amountValue <= 0) {
      toast.error('Invalid amount for selected course.');
      setGatewayLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await upsertPayment({
        studentId: Number(user.id),
        courseId: Number(selectedCourseId),
        amount: amountValue,
        method: 'card',
        status: 'completed',
        transactionId: orderId,
      });

      toast.success(`Payment successful. Receipt: ${orderId}`);
      setGatewayOpen(false);
      setCardNumber('');
      setExpiry('');
      setCvv('');
    } catch (err) {
      toast.error('Payment failed. Please try again.');
    } finally {
      setGatewayLoading(false);
    }
  };

  const recordManualPayment = async () => {
    if (!studentId || !courseId || !amount) {
      toast.error('Select student, course and amount.');
      return;
    }
    const value = Number(amount || 0);
    if (value <= 0) {
      toast.error('Amount should be greater than 0.');
      return;
    }
    await upsertPayment({
      studentId: Number(studentId),
      courseId: Number(courseId),
      amount: value,
      method,
      status: method === 'offline' ? 'pending' : 'completed',
      transactionId: method === 'card' ? `POS-${uid().slice(0, 10).toUpperCase()}` : undefined,
    });
    setStudentId('');
    setCourseId('');
    setAmount('');
    setMethod('offline');
    toast.success('Payment saved.');
  };

  return (
    <AppLayout>
      <div className="space-y-6 pt-12 lg:pt-0">
        <PageHeader title="Payments" subtitle="Student checkout + admin finance tracking">

          {/* Export */}
          <Button size="sm" variant="outline" onClick={() => toast.message('Export feature — coming soon')}>
            <Download className="w-4 h-4 mr-1"/> Export
          </Button>

          {/* Admin/Institute: record payment manually */}
          {isFinanceManager && (
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
                    <Select value={studentId} onValueChange={setStudentId}>
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.filter((u) => u.role === 'student').map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Select
                      value={courseId}
                      onValueChange={(value) => {
                        setCourseId(value);
                        const selected = courses.find((c) => String(c.id) === String(value));
                        const selectedAmount = Number(selected?.fee || selected?.price || 0);
                        setAmount(selectedAmount > 0 ? String(selectedAmount) : '');
                      }}
                    >
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.title || c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Amount (LKR)</Label>
                      <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="bg-secondary/50"/>
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
                  <Button className="gradient-primary text-primary-foreground" onClick={recordManualPayment}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Student: simulated real gateway */}
          {isStudent && (
            <Dialog open={gatewayOpen} onOpenChange={setGatewayOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white shadow-md hover:shadow-lg">
                  <ShieldCheck className="w-4 h-4 mr-1"/> Secure Checkout
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-emerald-600"/>
                    Modernistic Secure Payment Gateway
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="rounded-lg border bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-950/20 dark:to-cyan-950/20 p-3 text-sm">
                    <div className="font-medium text-foreground flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" /> PCI-DSS style secure flow
                    </div>
                    <p className="text-muted-foreground mt-1">Card details are validated in-browser for demo checkout behavior.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Select Course</Label>
                    <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                      <SelectTrigger className="bg-secondary/50">
                        <SelectValue placeholder="Choose a course to pay for"/>
                      </SelectTrigger>
                      <SelectContent>
                        {studentDueCourses.map(c => (
                          <SelectItem key={c.id} value={String(c.id)}>{c.title || c.name} - LKR {Number(c.fee || c.price || c.totalFee || 0).toLocaleString()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Amount (LKR)</Label>
                    <Input type="text" value={selectedCourseAmount ? `LKR ${Number(selectedCourseAmount).toLocaleString()}` : ''} readOnly className="bg-secondary/40"/>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <Input value={gatewayPhone} onChange={e => setGatewayPhone(e.target.value)} placeholder="07X XXXXXXX" className="bg-secondary/50"/>
                  </div>
                  <div className="space-y-2">
                    <Label>Card Holder Name</Label>
                    <Input value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Name on card" className="bg-secondary/50"/>
                  </div>
                  <div className="space-y-2">
                    <Label>Card Number</Label>
                    <Input value={cardNumber} onChange={e => setCardNumber(e.target.value)} placeholder="4111 1111 1111 1111" className="bg-secondary/50"/>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Expiry (MM/YY)</Label>
                      <Input value={expiry} onChange={e => setExpiry(e.target.value)} placeholder="08/28" className="bg-secondary/50"/>
                    </div>
                    <div className="space-y-2">
                      <Label>CVV</Label>
                      <Input value={cvv} onChange={e => setCvv(e.target.value)} placeholder="123" className="bg-secondary/50"/>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setGatewayOpen(false)}>Cancel</Button>
                  <Button
                    className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white"
                    onClick={handleStudentGatewayPayment}
                    disabled={gatewayLoading || studentDueCourses.length === 0}
                  >
                    {gatewayLoading ? 'Verifying & Charging...' : 'Confirm Secure Payment'}
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

        {isStudent && (
          <Card className="glass-card">
            <CardHeader><CardTitle className="flex items-center gap-2"><ReceiptText className="w-5 h-5" /> Due Course Payments</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {studentDueCourses.length === 0 && (
                <p className="text-sm text-muted-foreground">All course payments are completed.</p>
              )}
              {studentDueCourses.map((course) => (
                <div key={course.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-foreground">{course.title || course.name}</p>
                    <p className="text-sm text-muted-foreground">LKR {Number(course.fee || course.price || course.totalFee || 0).toLocaleString()}</p>
                  </div>
                  <Button onClick={() => openGatewayForCourse(course.id)} className="bg-gradient-to-r from-emerald-600 to-cyan-600 text-white">
                    <CreditCard className="w-4 h-4 mr-1" /> Pay Now
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

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
                  <TableHead>Deposit Slip</TableHead>
                  {isFinanceManager && <TableHead>Action</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visiblePayments.slice().reverse().map(p => {
                  const student = users.find(u => u.id === p.studentId);
                  const course  = courses.find(c => c.id === p.courseId);
                  const depositName = typeof p.depositSlip === 'object'
                    ? p.depositSlip?.filename
                    : p.depositSlip;
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-foreground">{student?.name ?? p.studentId}</TableCell>
                      <TableCell className="text-muted-foreground">{course?.title ?? p.courseId}</TableCell>
                      <TableCell className="font-semibold text-foreground">Rs. {Number(p.amount).toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {p.date || (p.createdAt ? new Date(p.createdAt).toISOString().slice(0, 10) : '-')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          {p.method === 'card' ? <><CreditCard className="w-3 h-3 text-emerald-600"/> Card</> :
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
                        {p.method === 'card' ? (
                          <span className="text-xs text-muted-foreground">
                            Not required{p.transactionId ? ` (${p.transactionId})` : ''}
                          </span>
                        ) : depositName ? (
                          <span className="text-xs text-muted-foreground">{depositName}</span>
                        ) : isStudent && p.method === 'offline' && p.status === 'pending' ? (
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
                      {isFinanceManager && (
                        <TableCell>
                          <div className="flex gap-2">
                            {p.status === 'pending' && (
                              <>
                                <Button size="sm" onClick={() => setPaymentStatus(p.id, 'completed')}>Approve</Button>
                                <Button size="sm" variant="outline" onClick={() => setPaymentStatus(p.id, 'failed')}>Reject</Button>
                              </>
                            )}
                            {p.status === 'completed' && (
                              <Button size="sm" variant="outline" onClick={() => setPaymentStatus(p.id, 'refunded', 'Admin initiated refund')}>Refund</Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
                {visiblePayments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={isFinanceManager ? 8 : 7} className="text-center text-muted-foreground py-6">No transactions yet</TableCell>
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
