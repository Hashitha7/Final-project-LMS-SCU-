
import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MonitorX, CalendarDays, User, GraduationCap } from 'lucide-react';

const Finance = ({ view = 'class' }) => {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('2023/August');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedClass, setSelectedClass] = useState('');

  if (!user) return <Navigate to="/login" />;

  // Authorization check
  if (user.role !== 'admin') return <Navigate to="/app" />;

  const getTitle = () => {
    switch (view) {
      case 'class': return 'Class Finance';
      case 'course': return 'Course Payment';
      case 'lesson': return 'Lesson Payments';
      case 'sms': return 'Sms Costs';
      default: return 'Finance';
    }
  };

  // Mock data based on the image
  const classFinanceData = [
    { id: 1, teacher: 'Emma Johnson', enrolled: 0, unenrolled: 0, card: 0, deposits: 0, manual: 0, total: 0 },
    { id: 2, teacher: 'Emily Roberts', enrolled: 0, unenrolled: 0, card: 0, deposits: 0, manual: 0, total: 0 },
    { id: 3, teacher: 'James Martinez', enrolled: 0, unenrolled: 0, card: 0, deposits: 0, manual: 0, total: 0 },
    { id: 4, teacher: 'Samuel Wilson', enrolled: 0, unenrolled: 0, card: 0, deposits: 0, manual: 0, total: 0 },
  ];

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
              <SelectValue placeholder="Select Teacher" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="t1">Emma Johnson</SelectItem>
              <SelectItem value="t2">Emily Roberts</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="relative">
          <GraduationCap className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10" />
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="bg-background pl-9 h-10 border-input shadow-sm">
              <SelectValue placeholder="Select Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="c1">Class A</SelectItem>
              <SelectItem value="c2">Class B</SelectItem>
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
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 w-[5%] pl-6">Id</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 w-[20%]">Teacher</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 w-[15%]">Enrolled Students</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 w-[15%]">Unenrolled Students</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 w-[10%]">Card</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 w-[10%]">Deposits</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 w-[12%]">Manual Enroll</TableHead>
                <TableHead className="text-xs font-semibold text-foreground uppercase tracking-wider h-11 w-[10%] text-right pr-6">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classFinanceData.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/40 transition-colors">
                  <TableCell className="text-sm pl-6 py-4">{row.id}</TableCell>
                  <TableCell className="text-sm font-medium text-foreground py-4">{row.teacher}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-4">{row.enrolled}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-4">{row.unenrolled}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-4">{row.card}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-4">{row.deposits}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-4">{row.manual}</TableCell>
                  <TableCell className="text-sm text-foreground font-medium text-right pr-6 py-4">{row.total}</TableCell>
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

  const renderEmptyState = (title) => (
    <div className="flex flex-col items-center justify-center p-12 bg-card rounded-xl border border-dashed text-center min-h-[400px]">
      <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
        <MonitorX className="w-8 h-8 opacity-50" />
      </div>
      <h3 className="text-lg font-semibold text-foreground">No Data for {title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mt-1">
        There are no financial records to display for this category yet.
      </p>
    </div>
  );

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
        {view === 'course' && renderEmptyState('Course Payment')}
        {view === 'lesson' && renderEmptyState('Lesson Payments')}
        {view === 'sms' && renderEmptyState('Sms Costs')}
      </div>
    </AppLayout>
  );
};

export default Finance;
