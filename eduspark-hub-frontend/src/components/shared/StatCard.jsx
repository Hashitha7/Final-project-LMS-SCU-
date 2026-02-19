import { cn } from '@/lib/utils';
export const StatCard = ({ title, value, change, icon: Icon, trend, className }) => (<div className={cn("glass-card rounded-xl p-5 animate-fade-in", className)}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold mt-1 text-foreground">{value}</p>
        {change && (<p className={cn("text-xs mt-1 font-medium", trend === 'up' ? 'text-success' : 'text-destructive')}>
            {trend === 'up' ? '↑' : '↓'} {change}
          </p>)}
      </div>
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary"/>
      </div>
    </div>
  </div>);
export const PageHeader = ({ title, subtitle, children }) => (<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
    {children && <div className="flex items-center gap-2">{children}</div>}
  </div>);
