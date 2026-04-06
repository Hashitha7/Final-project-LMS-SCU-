import { useAuth } from '@/contexts/AuthContext';
import { useSidebar } from '@/contexts/SidebarContext';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/StatCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Save, Palette, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const SettingsPage = () => {
  const { user } = useAuth();
  const { collapsed, setCollapsed } = useSidebar();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Temporary states for settings
  const [tempIsDarkMode, setTempIsDarkMode] = useState(false);
  const [tempCollapsed, setTempCollapsed] = useState(false);

  // Avoid hydration mismatch and initialize temporary states
  useEffect(() => {
    setMounted(true);
    setTempIsDarkMode(theme === 'dark');
    setTempCollapsed(collapsed);
  }, [theme, collapsed]);

  if (!user) return <Navigate to="/login" />;

  const handleSave = () => {
    setTheme(tempIsDarkMode ? 'dark' : 'light');
    setCollapsed(tempCollapsed);
    toast.success('Settings saved successfully!');
  };

  return (
    <AppLayout>
      <div className="space-y-6 pt-12 lg:pt-0 max-w-3xl">
        <PageHeader title="Settings" subtitle="Manage your preferences" />

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
                  {mounted && tempIsDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                  Dark Mode
                </Label>
                <p className="text-sm text-muted-foreground">
                  {mounted ? (tempIsDarkMode ? 'Will use dark theme' : 'Will use light theme') : 'Loading...'}
                </p>
              </div>
              <Switch
                checked={tempIsDarkMode}
                onCheckedChange={setTempIsDarkMode}
                disabled={!mounted}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Compact Sidebar</Label>
              <Switch 
                checked={tempCollapsed} 
                onCheckedChange={setTempCollapsed} 
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            className="bg-sky-500 hover:bg-sky-600 text-white border-0" 
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </div>
      </div>
    </AppLayout>
  );
};

export default SettingsPage;

