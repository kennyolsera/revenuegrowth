import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-surface-border bg-surface shadow-xs transition-colors",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
  icon: Icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-surface-border px-5 py-3.5">
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-sm font-semibold tracking-tight text-ink">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-ink-faint" />}
          {title}
        </h3>
        {description && (
          <p className={cn("mt-0.5 text-xs text-ink-muted leading-relaxed", Icon && "pl-6")}>{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-5", className)}>{children}</div>;
}
