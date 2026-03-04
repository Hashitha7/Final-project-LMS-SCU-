import { useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useLmsData } from '@/contexts/LmsDataContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Video, Power, ExternalLink, Search, Clock, Users, Monitor,
  Calendar, Shield, Copy, CheckCircle2, AlertCircle, Wifi, WifiOff
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from '@/components/ui/sonner';

const ZoomClasses = () => {
  const { user } = useAuth();
  const { courses, users } = useLmsData();
  const [search, setSearch] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [copiedField, setCopiedField] = useState('');

  if (!user) return <Navigate to="/login" />;

  // Filter courses that have Zoom meetings configured
  const zoomMeetings = useMemo(() => {
    return (courses || [])
      .filter(c => c.zoomMeetingId || c.zoomStartUrl || c.zoomJoinUrl)
      .filter(c => {
        const cName = (c.title || c.name || '').toLowerCase();
        return cName.includes(search.toLowerCase());
      })
      .map(c => {
        const teacher = users?.find(u => u.id === c.currentTeacherId && u.role === 'teacher');
        const isLive = c.lastMeetingStartedAt &&
          (new Date() - new Date(c.lastMeetingStartedAt)) < 3 * 60 * 60 * 1000; // Within 3 hours
        return {
          ...c,
          teacherName: teacher?.name || 'Unassigned',
          teacherEmail: teacher?.email || '',
          isLive,
        };
      });
  }, [courses, users, search]);

  // Stats
  const totalMeetings = zoomMeetings.length;
  const liveMeetings = zoomMeetings.filter(m => m.isLive).length;
  const teachersWithZoom = new Set(zoomMeetings.map(m => m.currentTeacherId).filter(Boolean)).size;

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleRelease = (meeting) => {
    toast.success(`Zoom account released for "${meeting.title || meeting.name}"`);
  };

  const handleJoin = (url) => {
    if (url) window.open(url, '_blank');
    else toast.error('No Zoom join link available');
  };

  const handleStart = (url) => {
    if (url) window.open(url, '_blank');
    else toast.error('No Zoom start link available');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'institute';
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center text-sm text-slate-500">
          <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer">
            {isAdmin ? 'Teachers' : isTeacher ? 'My Classes' : 'My Courses'}
          </span>
          <span className="mx-2 text-slate-300">/</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {isAdmin ? 'Release Zoom Account' : 'Zoom Classes'}
          </span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {isAdmin ? 'Zoom Account Management' : 'Zoom Classes'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {isAdmin
                ? 'Monitor and manage active Zoom meetings across all courses'
                : isTeacher
                  ? 'Start and manage your Zoom class sessions'
                  : 'Join your scheduled Zoom class sessions'}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                <Monitor className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalMeetings}</p>
                <p className="text-xs text-slate-500 font-medium">Total Zoom Rooms</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                <Wifi className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{liveMeetings}</p>
                <p className="text-xs text-slate-500 font-medium">Live Now</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{teachersWithZoom}</p>
                <p className="text-xs text-slate-500 font-medium">Active Teachers</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-md flex items-center">
          <div className="p-2 text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <Input
            placeholder="Search by course name..."
            className="border-none shadow-none focus-visible:ring-0 bg-transparent text-base h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Zoom Meeting Cards */}
        {zoomMeetings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {zoomMeetings.map((meeting) => (
              <div
                key={meeting.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-300 overflow-hidden"
              >
                {/* Card Header with Live Badge */}
                <div className={`px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between ${meeting.isLive ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10' : ''}`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl shadow-sm ${meeting.isLive ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                      <Video className={`w-5 h-5 ${meeting.isLive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-tight line-clamp-1">
                        {meeting.title || meeting.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{meeting.teacherName}</p>
                    </div>
                  </div>
                  {meeting.isLive ? (
                    <Badge className="bg-green-500 text-white border-none shadow-md animate-pulse">
                      <Wifi className="w-3 h-3 mr-1" /> LIVE
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-slate-500 border-slate-300">
                      <WifiOff className="w-3 h-3 mr-1" /> Offline
                    </Badge>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4">
                  {/* Meeting Details */}
                  <div className="space-y-2.5">
                    {meeting.zoomMeetingId && (
                      <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-slate-400" />
                          <span className="text-xs text-slate-500">Meeting ID</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
                            {meeting.zoomMeetingId}
                          </span>
                          <button
                            onClick={() => handleCopy(meeting.zoomMeetingId, `id-${meeting.id}`)}
                            className="text-slate-400 hover:text-blue-500 transition-colors"
                          >
                            {copiedField === `id-${meeting.id}` ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {meeting.zoomMeetingPassword && (
                      <div className="flex items-center justify-between py-2 px-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-slate-400" />
                          <span className="text-xs text-slate-500">Password</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-300">
                            {meeting.zoomMeetingPassword}
                          </span>
                          <button
                            onClick={() => handleCopy(meeting.zoomMeetingPassword, `pw-${meeting.id}`)}
                            className="text-slate-400 hover:text-blue-500 transition-colors"
                          >
                            {copiedField === `pw-${meeting.id}` ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    )}

                    {meeting.startDate && (
                      <div className="flex items-center gap-2 px-3 py-1.5">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-500">
                          {new Date(meeting.startDate).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}
                          {meeting.endDate && ` — ${new Date(meeting.endDate).toLocaleDateString('en-US', {
                            year: 'numeric', month: 'short', day: 'numeric'
                          })}`}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {/* Admin: Release + View Details */}
                    {isAdmin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs h-9 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200"
                          onClick={() => setSelectedMeeting(meeting)}
                        >
                          <Monitor className="w-3.5 h-3.5 mr-1.5" /> Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-9 text-red-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          onClick={() => handleRelease(meeting)}
                        >
                          <Power className="w-3.5 h-3.5 mr-1.5" /> Release
                        </Button>
                      </>
                    )}

                    {/* Teacher: Start Meeting + Details */}
                    {isTeacher && (
                      <>
                        <Button
                          size="sm"
                          className="flex-1 text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20"
                          onClick={() => handleStart(meeting.zoomStartUrl)}
                        >
                          <Video className="w-3.5 h-3.5 mr-1.5" /> Start Meeting
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-9"
                          onClick={() => setSelectedMeeting(meeting)}
                        >
                          <Monitor className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}

                    {/* Student: Join Meeting + Details */}
                    {isStudent && (
                      <>
                        <Button
                          size="sm"
                          className={`flex-1 text-xs h-9 shadow-md ${meeting.isLive
                            ? 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20'
                            }`}
                          onClick={() => handleJoin(meeting.zoomJoinUrl)}
                        >
                          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                          {meeting.isLive ? 'Join Live' : 'Join Meeting'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-9"
                          onClick={() => setSelectedMeeting(meeting)}
                        >
                          <Monitor className="w-3.5 h-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Video className="w-9 h-9 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-500">No Zoom meetings found</h3>
            <p className="text-sm text-slate-400 mt-1">
              {isAdmin
                ? 'No courses have Zoom meetings configured yet.'
                : 'No Zoom classes are scheduled at this time.'}
            </p>
            {isAdmin && (
              <p className="text-xs text-slate-400 mt-3">
                Go to <span className="font-medium text-blue-500">Integrations</span> to connect your Zoom account, then configure meetings in each course.
              </p>
            )}
          </div>
        )}

        {/* Meeting Detail Dialog */}
        <Dialog open={!!selectedMeeting} onOpenChange={(o) => !o && setSelectedMeeting(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${selectedMeeting?.isLive ? 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
                  <Video className={`w-4 h-4 ${selectedMeeting?.isLive ? 'text-white' : 'text-slate-500'}`} />
                </div>
                <div>
                  <span className="block">{selectedMeeting?.title || selectedMeeting?.name}</span>
                  {selectedMeeting?.isLive && (
                    <Badge className="bg-green-500 text-white border-none text-[10px] mt-1">● LIVE NOW</Badge>
                  )}
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-slate-500 font-semibold">Teacher</span>
                  <p className="font-medium text-slate-800 dark:text-slate-200">{selectedMeeting?.teacherName}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-semibold">Status</span>
                  <p className="font-medium">{selectedMeeting?.courseOnGoingStatus || 'NOT_STARTED'}</p>
                </div>
                {selectedMeeting?.zoomMeetingId && (
                  <div>
                    <span className="text-xs text-slate-500 font-semibold">Meeting ID</span>
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedMeeting.zoomMeetingId}</p>
                  </div>
                )}
                {selectedMeeting?.zoomMeetingPassword && (
                  <div>
                    <span className="text-xs text-slate-500 font-semibold">Password</span>
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200">{selectedMeeting.zoomMeetingPassword}</p>
                  </div>
                )}
                {selectedMeeting?.startDate && (
                  <div>
                    <span className="text-xs text-slate-500 font-semibold">Start Date</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {new Date(selectedMeeting.startDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {selectedMeeting?.endDate && (
                  <div>
                    <span className="text-xs text-slate-500 font-semibold">End Date</span>
                    <p className="font-medium text-slate-800 dark:text-slate-200">
                      {new Date(selectedMeeting.endDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                {selectedMeeting?.zoomJoinUrl && (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10"
                    onClick={() => handleJoin(selectedMeeting.zoomJoinUrl)}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" /> Join Zoom Meeting
                  </Button>
                )}
                {(isAdmin || isTeacher) && selectedMeeting?.zoomStartUrl && (
                  <Button
                    variant="outline"
                    className="w-full h-10"
                    onClick={() => handleStart(selectedMeeting.zoomStartUrl)}
                  >
                    <Video className="w-4 h-4 mr-2" /> Start as Host
                  </Button>
                )}
                {isAdmin && (
                  <Button
                    variant="outline"
                    className="w-full h-10 text-red-500 hover:bg-red-50 hover:border-red-200"
                    onClick={() => {
                      handleRelease(selectedMeeting);
                      setSelectedMeeting(null);
                    }}
                  >
                    <Power className="w-4 h-4 mr-2" /> Release Zoom Account
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default ZoomClasses;
