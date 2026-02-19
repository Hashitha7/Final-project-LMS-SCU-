import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, MoreVertical, Pencil, Trash2, Eye } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { toast } from '@/components/ui/sonner';

const Lessons = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [lessons, setLessons] = useState([
        { id: 1, title: 'Introduction into Trigonometry', teacher: 'Saman Perera', description: 'Basic concepts of trigonometry', date: '2023-10-25' },
        { id: 2, title: 'Algebra Functions', teacher: 'Nimali Silva', description: 'Understanding functions and graphs', date: '2023-10-26' },
        { id: 3, title: 'Organic Chemistry 101', teacher: 'Kamal Gunaratne', description: 'Introduction to carbon compounds', date: '2023-10-27' },
    ]);

    const handleDelete = (id) => {
        setLessons(lessons.filter(l => l.id !== id));
        toast.success("Lesson deleted successfully");
    };

    const filteredLessons = lessons.filter(l => l.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <AppLayout>
            <div className="space-y-8">
                {/* Breadcrumb Header */}
                <div className="flex items-center text-sm text-slate-500 mb-6">
                    <span className="hover:text-slate-900 cursor-pointer" onClick={() => navigate('/app/teachers')}>Teachers</span>
                    <span className="mx-2">/</span>
                    <span className="hover:text-slate-900 cursor-pointer">Manage Lesson</span>
                    <span className="mx-2">/</span>
                    <span className="font-semibold text-slate-900">View Lessons</span>
                </div>

                {/* Header */}
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Lessons</h1>
                    <Button onClick={() => navigate('/app/lessons/add')} className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6">
                        <Plus className="w-5 h-5 mr-2" /> Add Lesson
                    </Button>
                </div>

                {/* Main Content Card */}
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 border border-slate-100 dark:border-slate-800">
                    {/* Search Bar */}
                    <div className="relative max-w-md mb-8">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Search lessons..."
                            className="pl-10 bg-slate-50 dark:bg-slate-800 border-none h-10 text-sm focus-visible:ring-1 focus-visible:ring-slate-300"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Table */}
                    <div className="overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-slate-100 dark:border-slate-800">
                                    <TableHead className="font-semibold text-slate-600 dark:text-slate-400 pl-0 pb-4">Lesson Name</TableHead>
                                    <TableHead className="font-semibold text-slate-600 dark:text-slate-400 pb-4">Teacher</TableHead>
                                    <TableHead className="font-semibold text-slate-600 dark:text-slate-400 pb-4">Description</TableHead>
                                    <TableHead className="font-semibold text-slate-600 dark:text-slate-400 pb-4">Date Added</TableHead>
                                    <TableHead className="text-right font-semibold text-slate-600 dark:text-slate-400 pr-0 pb-4">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredLessons.length > 0 ? filteredLessons.map((lesson) => (
                                    <TableRow key={lesson.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 border-b border-slate-50 dark:border-slate-800 last:border-0 group">
                                        <TableCell className="font-semibold text-slate-800 dark:text-slate-200 py-6 pl-0">{lesson.title}</TableCell>
                                        <TableCell className="text-slate-600 dark:text-slate-400 py-6">{lesson.teacher}</TableCell>
                                        <TableCell className="text-slate-500 py-6 max-w-md">{lesson.description}</TableCell>
                                        <TableCell className="text-slate-500 py-6">{lesson.date}</TableCell>
                                        <TableCell className="text-right py-6 pr-0">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-transparent hover:border-blue-200 hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-all">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-[160px]">
                                                    <DropdownMenuItem onClick={() => navigate(`/app/lessons/edit/${lesson.id}`)} className="cursor-pointer text-slate-700 dark:text-slate-300">
                                                        <Pencil className="w-3.5 h-3.5 mr-2.5 text-slate-500" /> Edit Lesson
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => { }} className="cursor-pointer text-slate-700 dark:text-slate-300">
                                                        <Eye className="w-3.5 h-3.5 mr-2.5 text-slate-500" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDelete(lesson.id)} className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10">
                                                        <Trash2 className="w-3.5 h-3.5 mr-2.5" /> Delete Lesson
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                                            No lessons found matching your search.
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

export default Lessons;
