import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { I18nProvider } from '@/contexts/I18nContext';
import { LmsDataProvider } from '@/contexts/LmsDataContext';
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import PublicHome from './pages/PublicHome';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import AddLesson from './pages/AddLesson';
import Lessons from './pages/Lessons';
import Classes from './pages/Classes';
import Students from './pages/Students';
import Exams from './pages/Exams';
import AddPaper from './pages/AddPaper';
import ExamTake from './pages/ExamTake';
import Attendance from './pages/Attendance';
import Schedule from './pages/Schedule';
import Payments from './pages/Payments';
import Finance from './pages/Finance';
import ZoomClasses from './pages/ZoomClasses';
import Notifications from './pages/Notifications';
import SMS from './pages/SMS';
import Integrations from './pages/Integrations';
import Reports from './pages/Reports';
// import UserManagement from './pages/UserManagement';
import Teachers from './pages/Teachers';
import TeacherClasses from './pages/TeacherClasses';
import SettingsPage from './pages/Settings';
import NotFound from './pages/NotFound';
import ScienceAnalyst from './pages/ScienceAnalyst';
import ScienceResults from './pages/ScienceResults';
const queryClient = new QueryClient();
const App = () => (<ErrorBoundary>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LmsDataProvider>
        <I18nProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                <Routes>
                  <Route path="/" element={<PublicHome />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
                  <Route path="/app/dashboard" element={<Dashboard />} />
                  <Route path="/app/courses" element={<Courses />} />
                  <Route path="/app/courses/create" element={<Courses />} />
                  <Route path="/app/courses/:id" element={<CourseDetails />} />
                  <Route path="/app/lessons" element={<Lessons />} />
                  <Route path="/app/lessons/add" element={<AddLesson />} />
                  <Route path="/app/classes" element={<Classes />} />
                  <Route path="/app/students" element={<Students />} />
                  <Route path="/app/exams/add" element={<AddPaper />} />
                  <Route path="/app/exams" element={<Exams />} />
                  <Route path="/app/exams/take/:examId" element={<ExamTake />} />
                  <Route path="/app/attendance" element={<Attendance />} />
                  <Route path="/app/schedule" element={<Schedule />} />
                  <Route path="/app/payments" element={<Payments />} />
                  <Route path="/app/finance" element={<Navigate to="/app/finance/class" replace />} />
                  <Route path="/app/finance/class" element={<Finance view="class" />} />
                  <Route path="/app/finance/course" element={<Finance view="course" />} />
                  <Route path="/app/finance/lesson" element={<Finance view="lesson" />} />
                  <Route path="/app/finance/sms" element={<Finance view="sms" />} />
                  <Route path="/app/zoom" element={<ZoomClasses />} />
                  <Route path="/app/notifications" element={<Notifications />} />
                  <Route path="/app/sms" element={<Navigate to="/app/sms/class" replace />} />
                  <Route path="/app/sms/class" element={<SMS view="class" />} />
                  <Route path="/app/sms/lesson" element={<SMS view="lesson" />} />
                  <Route path="/app/sms/course" element={<SMS view="course" />} />
                  <Route path="/app/sms/custom" element={<SMS view="custom" />} />
                  <Route path="/app/integrations" element={<Integrations />} />
                  <Route path="/app/reports" element={<Reports />} />
                  {/* <Route path="/app/users" element={<UserManagement />} /> */}
                  <Route path="/app/teachers" element={<Teachers />} />
                  <Route path="/app/teachers/:teacherId/classes" element={<TeacherClasses />} />
                  <Route path="/app/settings" element={<SettingsPage />} />
                  <Route path="/app/science-analyst" element={<ScienceAnalyst />} />
                  <Route path="/app/science-analyst/results/:answerId" element={<ScienceResults />} />

                  {/* Legacy path redirects (optional) */}
                  <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />
                  <Route path="/courses" element={<Navigate to="/app/courses" replace />} />
                  <Route path="/users" element={<Navigate to="/app/users" replace />} />
                  <Route path="/payments" element={<Navigate to="/app/payments" replace />} />
                  <Route path="/settings" element={<Navigate to="/app/settings" replace />} />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </I18nProvider>
      </LmsDataProvider>
    </ThemeProvider>
  </QueryClientProvider>
</ErrorBoundary>);
export default App;

