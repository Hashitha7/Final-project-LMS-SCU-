import { useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { uid } from '@/lib/storage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/sonner';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, upsertNotification, markNotificationRead } = useLmsData();

  // Form State
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  if (!user) return <Navigate to="/login" />;

  // Derived Data for Inbox
  const visible = useMemo(() => notifications
    .filter((n) => n.targetRoles.includes(user.role))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [notifications, user.role]);

  // Handler for Admin "Set Notification"
  const handleSetNotification = () => {
    if (!title.trim() || !message.trim()) {
      toast.error("Please provide both a header and a message.");
      return;
    }

    const newNotification = {
      id: uid(),
      title: title.trim(),
      message: message.trim(),
      targetRoles: ['student', 'teacher'],
      createdAt: new Date().toISOString(),
      readBy: []
    };

    upsertNotification(newNotification);
    toast.success("Notification set successfully!");
    setTitle('');
    setMessage('');
  };

  // --- Admin View: Special Notification Form ---
  if (user.role === 'admin') {
    return (
      <AppLayout>
        <div className="space-y-6">
          {/* Breadcrumb Header */}
          <div className="flex items-center text-sm text-slate-500 mb-6">
            <span className="hover:text-slate-900 cursor-pointer" onClick={() => navigate('/app/teachers')}>Teachers</span>
            <span className="mx-2">/</span>
            <span className="font-semibold text-slate-900">Special Notification</span>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 min-h-[600px] flex flex-col relative overflow-hidden">
            {/* Decorative top border */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />

            <div className="max-w-4xl w-full mx-auto space-y-8 mt-4">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Title</label>
                <Input
                  placeholder="Notice Header"
                  className="h-14 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-lg px-4 focus-visible:ring-2 focus-visible:ring-blue-500 transition-all rounded-lg"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Content</label>
                <Textarea
                  placeholder="Announcement Message"
                  className="min-h-[350px] bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-base p-6 resize-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all rounded-xl leading-relaxed"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSetNotification}
                  className="bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-200 hover:border-blue-300 font-bold px-8 h-12 rounded-lg shadow-sm hover:shadow transition-all uppercase tracking-wider"
                >
                  Set Notification
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // --- Student/Teacher View: Notification Inbox ---
  return (
    <AppLayout>
      <div className="space-y-6 pt-12 lg:pt-0 max-w-3xl">
        <PageHeader title="Notifications" subtitle="Announcements and updates" />

        <div className="space-y-3">
          {visible.length === 0 && <p className="text-sm text-muted-foreground">No notifications.</p>}
          {visible.map((n) => {
            const isRead = n.readBy.includes(user.id);
            return (
              <Card key={n.id} className="glass-card">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardTitle className="text-base">{n.title}</CardTitle>
                      <p className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                    <Badge variant={isRead ? 'secondary' : 'default'}>{isRead ? 'Read' : 'New'}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{n.message}</p>
                  {!isRead && (
                    <Button size="sm" variant="outline" onClick={() => markNotificationRead(n.id, user.id)}>Mark as read</Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
};

export default Notifications;

