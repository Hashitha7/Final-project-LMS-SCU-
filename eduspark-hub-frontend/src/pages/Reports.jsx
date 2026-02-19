import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
const coursePerformance = [
    { name: 'Math', score: 85 }, { name: 'Physics', score: 78 }, { name: 'English', score: 92 },
    { name: 'CS', score: 88 }, { name: 'History', score: 75 }, { name: 'Biology', score: 82 },
];
const gradeDistribution = [
    { name: 'A', value: 35, color: 'hsl(142, 71%, 45%)' },
    { name: 'B', value: 30, color: 'hsl(217, 91%, 60%)' },
    { name: 'C', value: 20, color: 'hsl(38, 92%, 50%)' },
    { name: 'D', value: 10, color: 'hsl(262, 83%, 58%)' },
    { name: 'F', value: 5, color: 'hsl(0, 84%, 60%)' },
];
const monthlyProgress = [
    { month: 'Sep', completion: 15 }, { month: 'Oct', completion: 30 }, { month: 'Nov', completion: 48 },
    { month: 'Dec', completion: 58 }, { month: 'Jan', completion: 72 }, { month: 'Feb', completion: 85 },
];
const Reports = () => {
    const { user } = useAuth();
    if (!user)
        return <Navigate to="/login"/>;
    return (<AppLayout>
      <div className="space-y-6 pt-12 lg:pt-0">
        <PageHeader title="Progress Reports" subtitle="Analytics & performance tracking">
          <Button size="sm" variant="outline"><Download className="w-4 h-4 mr-1"/> Export PDF</Button>
        </PageHeader>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-lg">Course Performance</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={coursePerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12}/>
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12}/>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }}/>
                  <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}/>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-lg">Grade Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={gradeDistribution} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                    {gradeDistribution.map((e, i) => <Cell key={i} fill={e.color}/>)}
                  </Pie>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }}/>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-3 mt-2">
                {gradeDistribution.map(d => (<span key={d.name} className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }}/>{d.name}
                  </span>))}
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card lg:col-span-2">
            <CardHeader><CardTitle className="text-lg">Course Completion Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12}/>
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%"/>
                  <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8, color: 'hsl(var(--foreground))' }}/>
                  <Line type="monotone" dataKey="completion" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: 'hsl(var(--accent))' }}/>
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>);
};
export default Reports;
