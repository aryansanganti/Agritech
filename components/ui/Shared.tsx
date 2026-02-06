import * as React from "react";
import { cn } from "../../lib/utils";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

// Separator
const Separator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { orientation?: "horizontal" | "vertical" }
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "shrink-0 bg-gray-200 dark:bg-white/10",
      orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
      className
    )}
    {...props}
  />
));
Separator.displayName = "Separator";

// Progress Bar
interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "danger" | "purple";
}

const progressVariantColors = {
  default: "bg-bhoomi-green",
  success: "bg-gradient-to-r from-emerald-500 to-teal-500",
  warning: "bg-gradient-to-r from-amber-500 to-orange-500",
  danger: "bg-gradient-to-r from-red-500 to-rose-500",
  purple: "bg-gradient-to-r from-purple-500 to-indigo-500",
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, variant = "default", ...props }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100));
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            progressVariantColors[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

// Skeleton Loading
const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gray-200 dark:bg-white/10",
        className
      )}
      {...props}
    />
  );
};

// Spinner
interface SpinnerProps {
  size?: number;
  className?: string;
}

const Spinner = ({ size = 20, className }: SpinnerProps) => (
  <Loader2 size={size} className={cn("animate-spin text-bhoomi-green", className)} />
);

// Collapsible Section
interface CollapsibleProps {
  title: string;
  icon?: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

const Collapsible: React.FC<CollapsibleProps> = ({
  title,
  icon,
  isExpanded,
  onToggle,
  children,
  className,
  headerClassName,
}) => (
  <div className={cn("rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800/80 overflow-hidden transition-all", className)}>
    <button
      onClick={onToggle}
      className={cn(
        "w-full flex items-center justify-between p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors",
        headerClassName
      )}
    >
      <div className="flex items-center gap-3 font-bold text-gray-900 dark:text-white">
        {icon}
        {title}
      </div>
      {isExpanded ? (
        <ChevronUp size={20} className="text-gray-400" />
      ) : (
        <ChevronDown size={20} className="text-gray-400" />
      )}
    </button>
    {isExpanded && (
      <div className="p-5 pt-0 border-t border-gray-100 dark:border-white/5 mt-0 pt-4 animate-fade-in">
        {children}
      </div>
    )}
  </div>
);

// Avatar
interface AvatarProps {
  src?: string;
  alt?: string;
  fallback: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const avatarSizes = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-lg",
};

const Avatar: React.FC<AvatarProps> = ({ src, alt, fallback, size = "md", className }) => (
  <div className={cn("rounded-full overflow-hidden flex items-center justify-center bg-bhoomi-green/10 text-bhoomi-green font-bold", avatarSizes[size], className)}>
    {src ? (
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    ) : (
      fallback
    )}
  </div>
);

// Stat Card (for metrics)
interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "purple";
  className?: string;
}

const statVariantClasses = {
  default: "bg-gray-50 dark:bg-white/5",
  success: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30",
  warning: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30",
  danger: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30",
  info: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30",
  purple: "bg-purple-50 dark:bg-purple-500/10 border-purple-200 dark:border-purple-500/30",
};

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  variant = "default",
  className,
}) => (
  <div className={cn("p-4 rounded-xl border transition-all", statVariantClasses[variant], className)}>
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
      {icon && <span className="text-gray-400">{icon}</span>}
    </div>
    <div className="text-2xl font-bold text-gray-900 dark:text-white">{value}</div>
  </div>
);

// Empty State
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action, className }) => (
  <div className={cn("flex flex-col items-center justify-center text-center p-12 rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10", className)}>
    {icon && <div className="mb-4 text-gray-300 dark:text-gray-600">{icon}</div>}
    <h3 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-1">{title}</h3>
    {description && <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm mb-4">{description}</p>}
    {action}
  </div>
);

// Toggle / Switch
interface ToggleGroupProps {
  options: { id: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const ToggleGroup: React.FC<ToggleGroupProps> = ({ options, value, onChange, className }) => (
  <div className={cn("flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10", className)}>
    {options.map((option) => (
      <button
        key={option.id}
        onClick={() => onChange(option.id)}
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
          value === option.id
            ? "bg-white dark:bg-slate-700 shadow-sm text-bhoomi-green font-semibold"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        )}
      >
        {option.label}
      </button>
    ))}
  </div>
);

// Page Header
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onBack?: () => void;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, icon, onBack, badge, actions, className }) => (
  <div className={cn("flex items-center justify-between mb-6", className)}>
    <div className="flex items-center gap-3">
      {onBack && (
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </button>
      )}
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-bhoomi-green to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          {icon}
        </div>
      )}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {title}
          {badge}
        </h1>
        {subtitle && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        )}
      </div>
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export {
  Separator,
  Progress,
  Skeleton,
  Spinner,
  Collapsible,
  Avatar,
  StatCard,
  EmptyState,
  ToggleGroup,
  PageHeader,
};
