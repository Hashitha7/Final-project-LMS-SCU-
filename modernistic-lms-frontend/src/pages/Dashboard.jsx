import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import AdminDash from '@/components/dashboards/AdminDash';
import TeacherDash from '@/components/dashboards/TeacherDash';
import StudentDash from '@/components/dashboards/StudentDash';
const Dashboard = () => {
    const { user } = useAuth();
    if (!user)
        return <Navigate to="/login" />;
    const dashMap = {
        admin: <AdminDash />,
        institute: <AdminDash />,   // Institute = admin in new schema
        teacher: <TeacherDash />,
        student: <StudentDash />,
    };
    return <AppLayout>{dashMap[user.role] || <AdminDash />}</AppLayout>;
};
export default Dashboard;

