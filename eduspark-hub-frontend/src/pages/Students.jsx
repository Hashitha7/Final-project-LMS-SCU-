import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useLmsData } from '@/contexts/LmsDataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Download } from 'lucide-react';

const Students = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { users } = useLmsData();
  const [search, setSearch] = useState('');

  if (!user) return <Navigate to="/login" />;

  // Filter students
  const students = users.filter(u => u.role === 'student' && u.name.toLowerCase().includes(search.toLowerCase()));

  const handleDownloadCSV = () => {
    const headers = ["Id", "Student Name", "School", "Address", "Mobile"];
    const rows = students.map(s => [
      s.id,
      s.name,
      s.school || "-",
      s.address || "-",
      s.mobile || "-"
    ]);

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students.csv");
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
          <span className="font-semibold text-slate-900">Students</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-slate-900 rounded-t-lg">
            <div className="relative w-full md:max-w-md">
              <Input
                placeholder="Search Student"
                className="pl-4 bg-slate-50 dark:bg-slate-800 border-none h-10 w-full"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button className="bg-cyan-500 hover:bg-cyan-600 text-white font-medium px-6 h-10">
                <Search className="w-4 h-4 mr-2" /> Search Student
              </Button>
              <Button onClick={handleDownloadCSV} className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 h-10">
                Download CSV <Download className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300 w-[80px]">Id</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300">Student Name</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300">School</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300">Address</TableHead>
                  <TableHead className="font-bold text-slate-700 dark:text-slate-300">Mobile</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length > 0 ? students.map((student, index) => (
                  <TableRow key={student.id} className={`border-b border-slate-100 dark:border-slate-800 ${index % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'} hover:bg-slate-100 dark:hover:bg-slate-800`}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-medium text-slate-700 dark:text-slate-300">{student.name}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{student.school || "N/A"}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{student.address || "N/A"}</TableCell>
                    <TableCell className="text-slate-600 dark:text-slate-400">{student.mobile || "N/A"}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      No students found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Students;
