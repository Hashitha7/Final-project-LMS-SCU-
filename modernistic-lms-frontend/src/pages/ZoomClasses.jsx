import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Power, Trash2 } from 'lucide-react';

const ZoomClasses = () => {
  const { user } = useAuth();
  // Mock data state - currently empty as per image
  const [accounts, setAccounts] = useState([]);

  // Authorization check
  if (!user) return <Navigate to="/login" />;

  // Should only be accessible by admin ideally, based on "Release zoom account" being an admin task
  // But keeping it open for now based on existing implementation permissions, just updating UI.

  return (
    <AppLayout>
      <div className="space-y-6 pt-12 lg:pt-0 pb-8">
        {/* Breadcrumb Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-medium text-muted-foreground">Teachers / Release Zoom Account</h1>
          </div>
          {/* Optional: Add button if needed later */}
        </div>

        {/* Main Table Card */}
        <div className="bg-card rounded-md border shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-white hover:bg-white border-b border-border text-foreground">
                <TableHead className="h-10 text-xs font-semibold text-foreground uppercase tracking-wider w-[20%] pl-6">Teacher Name</TableHead>
                <TableHead className="h-10 text-xs font-semibold text-foreground uppercase tracking-wider w-[15%]">Type</TableHead>
                <TableHead className="h-10 text-xs font-semibold text-foreground uppercase tracking-wider w-[20%]">Meeting Id</TableHead>
                <TableHead className="h-10 text-xs font-semibold text-foreground uppercase tracking-wider w-[30%]">Class/Course Name</TableHead>
                <TableHead className="h-10 text-xs font-semibold text-foreground uppercase tracking-wider w-[15%]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center align-middle hover:bg-transparent">
                    <div className="flex flex-col items-center justify-center text-muted-foreground/40 text-sm font-medium">
                      No rows found
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((acc, idx) => (
                  <TableRow key={idx} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-sm">{acc.teacherName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{acc.type}</TableCell>
                    <TableCell className="font-mono text-xs">{acc.meetingId}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{acc.courseName}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Power className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Footer / Pagination */}
          <div className="flex items-center justify-between px-6 py-3 border-t bg-white">
            <Button variant="ghost" size="sm" className="text-muted-foreground h-8 text-xs font-medium hover:bg-secondary/50" disabled>
              Previous
            </Button>

            <div className="flex items-center gap-4 text-xs text-muted-foreground font-medium">
              <span>Page 1 of 1</span>
              <Select defaultValue="10">
                <SelectTrigger className="h-7 w-[85px] text-xs border-none bg-secondary/30 focus:ring-0">
                  <div className="flex items-center gap-1">
                    <span>10 rows</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="20">20 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="ghost" size="sm" className="text-muted-foreground h-8 text-xs font-medium hover:bg-secondary/50" disabled>
              Next
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ZoomClasses;

