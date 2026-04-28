import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { COLOR_CLASSES, type PlatformColor } from "@/lib/platforms";

type Props = {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  color?: PlatformColor;
};

export function KpiCard({
  icon: Icon,
  label,
  value,
  hint,
  color = "blue",
}: Props) {
  const c = COLOR_CLASSES[color];

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          {hint && (
            <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
          )}
        </div>
        <div
          className={cn(
            "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
            c.bg,
            c.text,
            c.bgDark,
            c.textDark
          )}
          aria-hidden
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
