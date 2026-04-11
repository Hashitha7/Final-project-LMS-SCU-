import { useState, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon, Send, Clock, Users, MessageSquare, AlertCircle, CheckCircle2, User, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const SMS = ({ view = 'class' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { users, classes, courses, lessons, sendSms, sms } = useLmsData();

  // Form State
  const [date, setDate] = useState();
  const [selectedTeacher, setSelectedTeacher] = useState('ALL');
  const [selectedTarget, setSelectedTarget] = useState(''); // Class, Lesson, or Course ID
  const [message, setMessage] = useState('');
  const [customRecipient, setCustomRecipient] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!user) return <Navigate to="/login" />;

  // Derived Data
  const teachers = useMemo(() => users.filter(u => u.role === 'teacher'), [users]);

  // Helper to get students for a target
  const getRecipientCount = (targetId, type) => {
    if (!targetId || type === 'custom') return 1;

    let targetStudentIds = new Set();

    if (type === 'class') {
      const cls = classes.find(c => c.id === targetId);
      if (cls && cls.studentIds) {
        cls.studentIds.forEach(id => targetStudentIds.add(id));
      }
    } else if (type === 'course' || type === 'lesson') {
      // Find course ID
      let courseId = targetId;
      if (type === 'lesson') {
        const lesson = lessons.find(l => l.id === targetId);
        courseId = lesson?.courseId;
      }

      // Find all classes with this course
      const relevantClasses = classes.filter(c => c.courseIds?.includes(courseId));
      relevantClasses.forEach(cls => {
        if (cls.studentIds) {
          cls.studentIds.forEach(id => targetStudentIds.add(id));
        }
      });
    }
    return targetStudentIds.size;
  };

  // Determine title and target list based on view
  let pageTitle = 'Class SMS';
  let targetLabel = 'Select Class';

  const targetOptions = useMemo(() => {
    let options = [];
    if (view === 'class') {
      targetLabel = 'Select Class';
      options = classes || [];
      if (selectedTeacher && selectedTeacher !== 'ALL') {
        options = options.filter(c => c.teacherId === selectedTeacher);
      }
    } else if (view === 'lesson') {
      targetLabel = 'Select Lesson';
      options = (lessons || []).map(l => {
        const course = courses.find(c => c.id === l.courseId);
        return {
          ...l,
          teacherId: course?.teacherId,
          courseName: course?.title,
          displayTitle: `${l.title} (${course?.title || 'Unknown Course'})`
        };
      });
      if (selectedTeacher && selectedTeacher !== 'ALL') {
        options = options.filter(l => l.teacherId === selectedTeacher);
      }
    } else if (view === 'course') {
      targetLabel = 'Select Course';
      options = courses || [];
      if (selectedTeacher && selectedTeacher !== 'ALL') {
        options = options.filter(c => c.teacherId === selectedTeacher);
      }
    }
    return options;
  }, [view, classes, lessons, courses, selectedTeacher]);

  const currentRecipientCount = useMemo(() => {
    return getRecipientCount(selectedTarget, view);
  }, [selectedTarget, view]);

  // Update page title string for display
  if (view === 'lesson') pageTitle = 'Lesson SMS';
  else if (view === 'course') pageTitle = 'Course SMS';
  else if (view === 'custom') pageTitle = 'Custom SMS';

  // Message Stats
  const charCount = message.length;
  // GSM-7 standard: 160 chars for single, 153 for multi-part
  const segments = charCount <= 160 ? 1 : Math.ceil(charCount / 153);

  const handleSend = async () => {
    setIsSending(true);

    // Simulate network delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));

    let recipientName = '';

    if (view === 'custom') {
      recipientName = customRecipient;
    } else {
      const target = targetOptions.find(t => t.id === selectedTarget);
      recipientName = target ? (target.title || target.name || target.displayTitle) : 'Unknown Group';
    }

    // Format message with schedule if date is selected
    const body = date
      ? `[Scheduled: ${format(date, 'yyyy-MM-dd')}] ${message}`
      : message;

    try {
      await sendSms(recipientName, body);
      toast.success(`Message sent successfully to ${recipientName}!`);
      setMessage('');
      setCustomRecipient('');
      setShowConfirm(false);
    } catch (err) {
      toast.error('Failed to send message: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSending(false);
    }
  };

  const sortedLogs = useMemo(() => {
    return [...(sms || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [sms]);

  return (
    <AppLayout>
      <div className="container max-w-7xl mx-auto py-6 space-y-8 animate-in fade-in duration-500">

        {/* Header Section */}
        <div className="flex flex-col gap-2 border-b pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">{pageTitle}</h1>
              <p className="text-muted-foreground mt-1">
                Manage and broadcast SMS notifications to your {view === 'custom' ? 'recipients' : `students`}.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-muted/30 p-2 rounded-lg border border-border/50">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Balance: <span className="text-foreground font-bold">5,240 SMS</span></span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Compose Form */}
          <Card className="lg:col-span-5 border-border shadow-md bg-card h-fit sticky top-6">
            <CardHeader className="bg-muted/40 pb-4 border-b">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Send className="h-5 w-5 text-primary" />
                New Message
              </CardTitle>
              <CardDescription>
                Compose and schedule your SMS campaign.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">

              {/* Conditional Inputs based on View */}
              {view === 'custom' ? (
                <div className="space-y-2">
                  <Label htmlFor="recipient" className="text-sm font-semibold text-foreground/80">Recipient Mobile Number</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="recipient"
                      placeholder="+94 7X XXX XXXX"
                      className="pl-9 h-10 border-input bg-background"
                      value={customRecipient}
                      onChange={(e) => setCustomRecipient(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Teacher Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-foreground/80">Filter by Teacher</Label>
                    <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder="All Teachers" />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-50 [&_[data-highlighted]]:bg-blue-200 [&_[data-highlighted]]:text-blue-900">
                        <SelectItem value="ALL">All Teachers</SelectItem>
                        {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Target Selection */}
                  <div className="space-y-2">
                    <Label className="flex justify-between items-center text-sm font-semibold text-foreground/80">
                      {targetLabel}
                      {selectedTarget && currentRecipientCount > 0 && (
                        <Badge variant="outline" className="text-xs font-normal bg-primary/5 border-primary/20 text-primary animate-in zoom-in">
                          <Users className="w-3 h-3 mr-1" />
                          {currentRecipientCount} Recipient{currentRecipientCount !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </Label>
                    <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                      <SelectTrigger className="w-full bg-background">
                        <SelectValue placeholder={`Select ${view}...`} />
                      </SelectTrigger>
                      <SelectContent className="bg-blue-50 [&_[data-highlighted]]:bg-blue-200 [&_[data-highlighted]]:text-blue-900">
                        {targetOptions.length === 0 ? (
                          <div className="p-4 text-sm text-center text-muted-foreground flex flex-col items-center gap-2">
                            <Search className="w-5 h-5 opacity-50" />
                            <p>No {view}s found</p>
                          </div>
                        ) : (
                          targetOptions.map(t => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.title || t.name || t.displayTitle}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Schedule Date */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-foreground/80">Schedule Delivery</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-background hover:bg-blue-50 data-[state=open]:bg-blue-500 data-[state=open]:text-white",
                        !date && "text-muted-foreground data-[state=open]:text-white"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Send Immediately</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      classNames={{
                        day_selected: "bg-blue-500 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-500 focus:text-white"
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Message Body */}
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <Label htmlFor="message" className="text-sm font-semibold text-foreground/80">Message Body</Label>
                  <div className="text-right flex flex-col items-end">
                    <span className={cn("text-xs font-mono", charCount > 160 ? "text-amber-600 dark:text-amber-400 font-bold" : "text-muted-foreground")}>
                      {charCount} / {160 * segments}
                    </span>
                    {segments > 1 && (
                      <Badge variant="secondary" className="px-1 py-0 h-4 text-[10px] mt-0.5">
                        {segments} SMS
                      </Badge>
                    )}
                  </div>
                </div>
                <Textarea
                  id="message"
                  placeholder="Type your message content here..."
                  className="min-h-[140px] resize-none p-4 text-base leading-relaxed bg-background focus-visible:ring-primary/50"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                {charCount > 160 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 p-2 rounded border border-amber-200 dark:border-amber-900/50">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Long message will be sent as multiple parts (cost x{segments}).
                  </p>
                )}
              </div>

              <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                <AlertDialogTrigger asChild>
                  <Button
                    disabled={(!customRecipient && !selectedTarget && view !== 'custom') || !message || isSending}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-11 shadow-sm transition-all"
                  >
                    {isSending ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Campaign
                      </div>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Message Broadcast</AlertDialogTitle>
                    <AlertDialogDescription>
                      You are about to send this message to <span className="font-semibold text-foreground">{view === 'custom' ? customRecipient : currentRecipientCount + ' recipient(s)'}</span>.
                      <br /><br />
                      This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleSend} className="bg-primary text-primary-foreground">
                      Confirm & Send
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

            </CardContent>
          </Card>

          {/* Right Column: History */}
          <div className="lg:col-span-7 flex flex-col h-full space-y-6">

            {/* Quick Stats Row (Optional professional touch) */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 flex items-center gap-4 border-border shadow-sm">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Delivered</p>
                  <p className="text-2xl font-bold">{sms?.length || 0}</p>
                </div>
              </Card>
              <Card className="p-4 flex items-center gap-4 border-border shadow-sm">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Scheduled</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </Card>
              <Card className="p-4 flex items-center gap-4 border-border shadow-sm">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full text-orange-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Failed</p>
                  <p className="text-2xl font-bold">0</p>
                </div>
              </Card>
            </div>

            <Card className="border-border shadow-md flex-1">
              <CardHeader className="bg-muted/40 pb-4 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Transmission Log</CardTitle>
                  <CardDescription>Real-time delivery status of recent messages.</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="h-8">Export Log</Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md border-none">
                  <Table>
                    <TableHeader className="bg-background">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-[30%] pl-6">Recipient</TableHead>
                        <TableHead className="w-[45%]">Content</TableHead>
                        <TableHead className="w-[15%]">Status</TableHead>
                        <TableHead className="w-[10%] text-right pr-6">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedLogs.length > 0 ? (
                        sortedLogs.map((log) => (
                          <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                            <TableCell className="pl-6 font-medium align-top py-4">
                              <div className="flex flex-col gap-1">
                                <span className="truncate max-w-[140px] font-semibold text-sm" title={log.to}>
                                  {log.to}
                                </span>
                                <span className="text-xs text-muted-foreground bg-muted w-fit px-1.5 py-0.5 rounded">
                                  SMS
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="align-top py-4">
                              <p className="text-sm text-foreground/80 leading-snug line-clamp-2 pr-4 font-mono text-xs md:text-sm" title={log.body}>
                                {log.body}
                              </p>
                            </TableCell>
                            <TableCell className="align-top py-4">
                              <Badge
                                variant="secondary"
                                className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 font-medium whitespace-nowrap"
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1.5" /> Delivered
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6 text-xs text-muted-foreground align-top py-4 whitespace-nowrap">
                              <div className="flex flex-col items-end gap-0.5">
                                <span>{format(new Date(log.createdAt), "MMM d")}</span>
                                <span className="opacity-70">{format(new Date(log.createdAt), "h:mm a")}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-48 text-center text-muted-foreground bg-muted/5">
                            <div className="flex flex-col items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <MessageSquare className="h-6 w-6 opacity-30" />
                              </div>
                              <p className="font-medium">No messages in history</p>
                              <p className="text-xs max-w-[200px] text-center opacity-70">Sent campaigns will appear here automatically.</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </AppLayout>
  );
};

export default SMS;

