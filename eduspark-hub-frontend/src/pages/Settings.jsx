import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Save, Bell, Palette, Globe, Lock, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!user) return <Navigate to="/login" />;

  const isDarkMode = mounted && theme === 'dark';

  const toggleTheme = () => {
    setTheme(isDarkMode ? 'light' : 'dark');
  };

  return (
    <AppLayout>
      <div className="space-y-6 pt-12 lg:pt-0 max-w-3xl">
        <PageHeader title="Settings" subtitle="Manage your preferences" />

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" /> General
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>School Name</Label>
                <Input defaultValue="Lincoln Academy" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input defaultValue={user.email} className="bg-secondary/50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input defaultValue="America/New_York (UTC-5)" className="bg-secondary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {['Email notifications', 'Push notifications', 'Exam reminders', 'Attendance alerts', 'Payment notifications'].map(label => (
              <div key={label} className="flex items-center justify-between">
                <Label>{label}</Label>
                <Switch defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" /> Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  {mounted && isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  {mounted ? (isDarkMode ? 'Currently using dark theme' : 'Currently using light theme') : 'Loading...'}
                </p>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={toggleTheme}
                disabled={!mounted}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Compact Sidebar</Label>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" /> Security
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" className="bg-secondary/50" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" className="bg-secondary/50" />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" className="bg-secondary/50" />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Two-Factor Authentication</Label>
              <Switch />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button className="gradient-primary text-primary-foreground">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;
