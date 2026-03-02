import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
const ForgotPassword = () => {
    const { requestPasswordReset, resetPassword } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [resetToken, setResetToken] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const request = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await requestPasswordReset({ identifier });
            setResetToken(res.resetToken);
            toast.success('Reset token generated (demo)');
        }
        catch (err) {
            toast.error(err?.message ?? 'Failed');
        }
        finally {
            setLoading(false);
        }
    };
    const applyReset = async (e) => {
        e.preventDefault();
        if (!resetToken)
            return;
        setLoading(true);
        try {
            await resetPassword({ resetToken, newPassword });
            toast.success('Password reset (demo). You can sign in with demo123 in this UI.');
        }
        catch (err) {
            toast.error(err?.message ?? 'Failed');
        }
        finally {
            setLoading(false);
        }
    };
    return (<div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-background via-background to-primary/10">
      <Card className="glass-card w-full max-w-lg">
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <p className="text-sm text-muted-foreground">
            Demo flow: we generate a short-lived reset token locally.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4" onSubmit={request}>
            <div className="space-y-2">
              <Label htmlFor="identifier">Email or mobile</Label>
              <Input id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className="bg-secondary/50" required/>
            </div>
            <Button disabled={loading} className="gradient-primary text-primary-foreground">
              Generate reset token
            </Button>
          </form>

          {resetToken && (<form className="space-y-4" onSubmit={applyReset}>
              <div className="space-y-2">
                <Label>Reset token</Label>
                <Textarea value={resetToken} readOnly className="bg-secondary/50" rows={3}/>
                <p className="text-xs text-muted-foreground">Valid for ~15 minutes in this demo.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-secondary/50" required/>
              </div>
              <Button disabled={loading} className="gradient-primary text-primary-foreground">Reset</Button>
            </form>)}

          <p className="text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>);
};
export default ForgotPassword;

