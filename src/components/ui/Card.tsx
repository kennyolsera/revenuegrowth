import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface",
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
    <div className="flex items-start justify-between gap-4 border-b border-divider px-4 py-3">
      <div className="min-w-0">
        <h3 className="flex items-center gap-2 text-base font-semibold text-text">
          {Icon && <Icon className="h-[15px] w-[15px] shrink-0 text-text-4" />}
          {title}
        </h3>
        {description && (
          <p className={cn("mt-0.5 text-xs text-text-3", Icon && "pl-6")}>{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}
