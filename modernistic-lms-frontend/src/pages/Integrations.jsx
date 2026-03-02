import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageHeader } from '@/components/shared/StatCard';
import { useAuth } from '@/contexts/AuthContext';
import { useLmsData } from '@/contexts/LmsDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/sonner';
const Integrations = () => {
    const { user } = useAuth();
    const { integrations, toggleIntegration } = useLmsData();
    if (!user)
        return <Navigate to="/login"/>;
    if (user.role !== 'admin')
        return <Navigate to="/app"/>;
    const zoom = integrations.find((i) => i.type === 'zoom');
    const teams = integrations.find((i) => i.type === 'msteams');
    const pay = integrations.find((i) => i.type === 'payments');
    const [zoomEmail, setZoomEmail] = useState(zoom?.accountEmail ?? '');
    const [tenantId, setTenantId] = useState(teams?.tenantId ?? '');
    const [provider, setProvider] = useState(pay?.provider ?? 'stripe');
    return (<AppLayout>
      <div className="space-y-6 pt-12 lg:pt-0 max-w-3xl">
        <PageHeader title="Integrations" subtitle="Zoom / MS Teams / Payments"/>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Zoom</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Connect a Zoom account for online classes.</p>
              <Switch checked={!!zoom?.connected} onCheckedChange={(v) => {
            toggleIntegration('zoom', Boolean(v), { accountEmail: zoomEmail });
            toast.success(Boolean(v) ? 'Zoom connected' : 'Zoom disconnected');
        }}/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Account email</Label>
                <Input value={zoomEmail} onChange={(e) => setZoomEmail(e.target.value)} className="bg-secondary/50"/>
              </div>
              <div className="space-y-2">
                <Label>Security defaults</Label>
                <div className="text-sm text-muted-foreground">
                  Waiting room • Passcode • Authenticated users only
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => {
            toggleIntegration('zoom', !!zoom?.connected, { accountEmail: zoomEmail });
            toast.success('Saved');
        }}>Save</Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Microsoft Teams</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Use Teams for online lessons when Zoom is unavailable.</p>
              <Switch checked={!!teams?.connected} onCheckedChange={(v) => {
            toggleIntegration('msteams', Boolean(v), { tenantId });
            toast.success(Boolean(v) ? 'Teams connected' : 'Teams disconnected');
        }}/>
            </div>
            <div className="space-y-2">
              <Label>Tenant ID</Label>
              <Input value={tenantId} onChange={(e) => setTenantId(e.target.value)} className="bg-secondary/50"/>
            </div>
            <Button variant="outline" onClick={() => {
            toggleIntegration('msteams', !!teams?.connected, { tenantId });
            toast.success('Saved');
        }}>Save</Button>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Payments</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Online payment provider (offline deposit slips still supported).</p>
              <Switch checked={!!pay?.connected} onCheckedChange={(v) => {
            toggleIntegration('payments', Boolean(v), { provider });
            toast.success(Boolean(v) ? 'Payments connected' : 'Payments disconnected');
        }}/>
            </div>
            <div className="space-y-2">
              <Label>Provider</Label>
              <Input value={provider} onChange={(e) => setProvider(e.target.value)} className="bg-secondary/50" placeholder="stripe / payhere / other"/>
            </div>
            <Button variant="outline" onClick={() => {
            toggleIntegration('payments', !!pay?.connected, { provider });
            toast.success('Saved');
        }}>Save</Button>
          </CardContent>
        </Card>
      </div>
    </AppLayout>);
};
export default Integrations;

