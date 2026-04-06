
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MonitorX, CalendarDays, User, GraduationCap } from 'lucide-react';

const Finance = ({ view = 'class' }) => {
  const { user } = useAuth();
  const { classes, users, classEnrollments, payments } = useLmsData();
  const [selectedMonth, setSelectedMonth] = useState('2023/August');
  const [selectedTeacher, setSelectedTeacher] = useState('all');
  const [selectedClass, setSelectedClass] = useState('all');

  if (!user) return <Navigate to="/login" />;

  // Authorization check
  if (user.role !== 'admin' && user.role !== 'institute') return <Navigate to="/app" />;

  const getTitle = () => {
    switch (view) {
      case 'class': return 'Class Finance';
      case 'course': return 'Course Payment';
      case 'lesson': return 'Lesson Payments';
      case 'sms': return 'Sms Costs';
      default: return 'Finance';
    }
  };

  const teachers = users.filter((u) => u.role === 'teacher');
  const safeClasses = Array.isArray(classes) ? classes : [];
  const safePayments = Array.isArray(payments) ? payments : [];
  const safeEnrollments = Array.isArray(classEnrollments) ? classEnrollments : [];

  // Calculate real data from system
  const classFinanceData = safeClasses
    .filter(c => selectedTeacher === 'all' || selectedTeacher === '' || String(c.teacher?.id ?? c.teacherId) === selectedTeacher)
    .filter(c => selectedClass === 'all' || selectedClass === '' || String(c.id) === selectedClass)
    .map(c => {
      const teacherName = c.teacher?.name || teachers.find(t => t.id === c.teacherId)?.name || 'Unknown';
      const enrolled = c.studentIds?.length || 0;
      
      const classPayments = safePayments.filter(p => p.courseId === c.id || p.classId === c.id);
      
      const card = classPayments.filter(p => (p.method || '').toLowerCase().includes('card') || (p.method || '').toLowerCase().includes('stripe'))
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
        
      const deposits = classPayments.filter(p => (p.method || '').toLowerCase().includes('bank') || (p.method || '').toLowerCase().includes('deposit'))
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
        
      const manual = classPayments.filter(p => !p.method || (p.method || '').toLowerCase().includes('cash') || (p.method || '').toLowerCase().includes('manual'))
        .reduce((sum, p) => sum + Number(p.amount || 0), 0);
        
      const total = card + deposits + manual;

      return {
        id: c.id,
        name: c.name,
        teacher: teacherName,
        enrolled,
        unenrolled: 0,
        card,
        deposits,
        manual,
        total
      };
  });

  const renderClassFinance = () => (
    <div className="space-y-6">
      {/* Filter Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative">
          <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="bg-background pl-9 h-10 border-input shadow-sm">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2023/August">2023/August</SelectItem>
              <SelectItem value="2023/September">2023/September</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
          <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
            <SelectTrigger className="bg-background pl-9 h-10 border-input shadow-sm">
              <SelectValue placeholder="All Teachers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teachers</SelectItem>
              {teachers.map(t => (
                <SelectItem key={`t-${t.id}`} value={String(t.id)}>{t.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <GraduationCap className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="bg-background pl-9 h-10 border-input shadow-sm">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Classes</SelectItem>
              {safeClasses.map(c => (
                <SelectItem key={`c-${c.id}`} value={String(c.id)}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 w-[15%] pl-6">Class Name</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 w-[20%]">Teacher</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 w-[15%]">Enrolled Students</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 w-[10%]">Card</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 w-[10%]">Deposits</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 w-[12%]">Manual Enroll</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 w-[10%] text-right pr-6">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classFinanceData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No financial data matches your filters.</TableCell>
                </TableRow>
              ) : classFinanceData.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="text-sm font-medium pl-6 py-4">{row.name}</TableCell>
                  <TableCell className="text-sm font-medium text-foreground py-4">{row.teacher}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-4">{row.enrolled}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-4">Rs {row.card.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-4">Rs {row.deposits.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-4">Rs {row.manual.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-foreground font-medium text-right pr-6 py-4">Rs {row.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Footer / Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/5">
          <Button variant="ghost" size="sm" className="text-muted-foreground h-8 text-xs font-medium hover:bg-background border border-transparent hover:border-border hover:shadow-sm transition-all" disabled>
            Previous
          </Button>

          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <span>Page 1 of 1</span>
            <div className="h-4 w-[1px] bg-border mx-2"></div>
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline">Rows per page</span>
              <Select defaultValue="10">
                <SelectTrigger className="h-8 w-[70px] text-xs bg-background border-border shadow-sm focus:ring-1 focus:ring-primary/20">
                  <SelectValue placeholder="10" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button variant="ghost" size="sm" className="text-muted-foreground h-8 text-xs font-medium hover:bg-background border border-transparent hover:border-border hover:shadow-sm transition-all" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );

  const { courses, lessons, sms } = useLmsData();
  const safeCourses = Array.isArray(courses) ? courses : [];
  const safeLessons = Array.isArray(lessons) ? lessons : [];
  const safeSms = Array.isArray(sms) ? sms : [];

  const renderCourseFinance = () => (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 pl-6">Course Name</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11">Teacher</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11">Enrolled (Approx)</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11">Total Fee</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 text-right pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No course financial records found.</TableCell>
                </TableRow>
              ) : safeCourses.map((c) => (
                <TableRow key={c.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="text-sm font-medium pl-6 py-4">{c.title || c.name || `Course ${c.id}`}</TableCell>
                  <TableCell className="text-sm text-foreground py-4">{teachers.find(t => t.id === c.teacherId || t.id === c.currentTeacherId)?.name || 'Unknown'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-4">{c.studentIds?.length || 0}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-4">Rs {(Number(c.totalFee) || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-sm font-medium text-right pr-6 py-4">{c.status || c.courseOnGoingStatus || 'Active'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
    </div>
  );

  const renderLessonFinance = () => (
    <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 pl-6">Lesson Title</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11">Course</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11">Created</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 text-right pr-6">Access</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {safeLessons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No lesson financial records found.</TableCell>
                </TableRow>
              ) : safeLessons.map((l) => (
                <TableRow key={l.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="text-sm font-medium pl-6 py-4">{l.title}</TableCell>
                  <TableCell className="text-sm text-foreground py-4">{safeCourses.find(c => c.id === l.courseId)?.name || `Course ${l.courseId}`}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-4">{l.createdAt ? new Date(l.createdAt).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell className="text-sm font-medium text-right pr-6 py-4">Viewed</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
    </div>
  );

  const renderSmsFinance = () => {
    const totalSmsCost = safeSms.length * 2.50; // Approximated Rs 2.50 per SMS
    return (
      <div className="space-y-4">
        <div className="bg-card p-4 rounded-xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total SMS Messages Sent</p>
            <p className="text-2xl font-bold">{safeSms.length}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Estimated Total Cost</p>
            <p className="text-2xl font-bold text-primary">Rs {totalSmsCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-b border-border">
                    <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 pl-6">Date</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11">Recipient</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11">Message</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 text-right pr-6">Status</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {safeSms.length === 0 ? (
                    <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No SMS logs found.</TableCell>
                    </TableRow>
                ) : safeSms.map((s) => (
                    <TableRow key={s.id} className="hover:bg-muted/40 transition-colors">
                    <TableCell className="text-sm text-muted-foreground pl-6 py-4">{s.createdAt || s.date || 'Recent'}</TableCell>
                    <TableCell className="text-sm font-medium text-foreground py-4">{s.phoneNumber || s.recipient || 'Multiple'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground py-4 truncate max-w-[200px]">{s.message || s.content}</TableCell>
                    <TableCell className="text-sm font-medium text-right pr-6 py-4">{s.status || 'Sent'}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </div>
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-8 pt-12 lg:pt-0 pb-10">
        {/* Header Section */}
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Teachers / Finance / {getTitle()}</p>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{getTitle()}</h1>
          <p className="text-muted-foreground">Manage and track financial records and payment statuses.</p>
        </div>

        {view === 'class' && renderClassFinance()}
        {view === 'course' && renderCourseFinance()}
        {view === 'lesson' && renderLessonFinance()}
        {view === 'sms' && renderSmsFinance()}
      </div>
    </AppLayout>
  );
};

export default Finance;

