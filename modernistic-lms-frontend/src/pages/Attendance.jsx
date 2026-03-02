import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const Attendance = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { users } = useLmsData();
  const [search, setSearch] = useState('');
  const [date, setDate] = useState(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');

  if (!user) return <Navigate to="/login" />;

  // Filter logic (mock implementation for demonstration)
  const teachers = users.filter(u => u.role === 'teacher');

  // In a real app we would filter attendance records. Here we show students.
  const filteredStudents = users.filter(u => {
    const matchesRole = u.role === 'student';
    const term = search.toLowerCase();
    const matchesSearch = u.name.toLowerCase().includes(term) || (u.mobile && u.mobile.toLowerCase().includes(term));
    // In a real app, we would also filter by `selectedTeacher` and `date`
    // For now, we return matchesSearch since we are mocking the attendance list
    return matchesRole && matchesSearch;
  });

  const handleDownloadCSV = () => {
    const headers = ["Student ID", "Student Name", "Join Time", "Mobile Number"];
    const rows = filteredStudents.map((s, index) => [
      index + 1,
      s.name,
      "08:00 AM", // Mocked as per screenshot/requirement
      s.mobile || "-"
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_attendance.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Breadcrumb Header */}
        <div className="flex items-center text-sm text-slate-500 mb-6">
          <span className="hover:text-slate-900 cursor-pointer" onClick={() => navigate('/app/teachers')}>Teachers</span>
          <span className="mx-2">/</span>
          <span className="font-semibold text-slate-900">Student Attendance</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">

          {/* Filters Section */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 h-10",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "MM/dd/yyyy") : <span>mm/dd/yyyy</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              {/* Teacher Select */}
              <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                <SelectTrigger className="w-[240px] bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 h-10">
                  <SelectValue placeholder="Select Teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full">
                <Input
                  placeholder="Search student by name or mobile"
                  className="pl-4 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 h-10 w-full"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-3 w-full md:w-auto shrink-0">
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-6 h-10">
                  <Search className="w-4 h-4 mr-2" /> Search Student
                </Button>
                <Button onClick={handleDownloadCSV} className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 h-10">
                  Download CSV <Download className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300 pl-6 h-12">Student ID</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300 h-12">Student Name</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300 h-12">Join Time</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300 h-12">Mobile Number</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? filteredStudents.map((student, index) => (
                  <TableRow key={student.id} className={`border-b border-slate-100 dark:border-slate-800 ${index % 2 === 0 ? 'bg-slate-50/50 dark:bg-slate-800/30' : 'bg-white dark:bg-slate-900'} hover:bg-slate-100 dark:hover:bg-slate-800`}>
                    <TableCell className="font-medium pl-6">{index + 1}</TableCell>
                    <TableCell className="font-medium text-slate-700 dark:text-slate-300">{student.name}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">08:00 AM</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{student.mobile || "-"}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-64 text-slate-500">
                      <div className="flex flex-col items-center justify-center">
                        <span className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-md text-sm">No rows found</span>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-b-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <div className="flex-1">
              <Button variant="outline" size="sm" disabled className="w-24 bg-slate-100 border-slate-200 text-slate-400">Previous</Button>
            </div>

            <div className="flex items-center justify-center gap-8 flex-1">
              <div className="flex items-center gap-2">
                <span>Page</span>
                <div className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded text-slate-900 font-medium shadow-sm">1</div>
                <span>of 1</span>
              </div>

              <div className="flex items-center gap-2">
                <Select defaultValue="10">
                  <SelectTrigger className="w-[80px] h-8 bg-white border-slate-200 shadow-sm">
                    <SelectValue placeholder="10 rows" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 ...</SelectItem>
                    <SelectItem value="20">20 ...</SelectItem>
                    <SelectItem value="50">50 ...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex-1 flex justify-end">
              <Button variant="outline" size="sm" disabled className="w-24 bg-slate-100 border-slate-200 text-slate-400">Next</Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Attendance;

