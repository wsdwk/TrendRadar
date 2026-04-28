import { COLOR_CLASSES, getPlatform } from "@/lib/platforms";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  size?: "sm" | "md" | "lg";
  withName?: boolean;
};

const SIZE_MAP = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

export function PlatformBadge({ id, size = "md", withName = false }: Props) {
  const meta = getPlatform(id);
  const c = COLOR_CLASSES[meta.color];

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
          SIZE_MAP[size],
          c.bg,
          c.text,
          c.bgDark,
          c.textDark
        )}
        aria-hidden
      >
        {meta.short}
      </div>
      {withName && (
        <span className="text-sm font-medium text-foreground">{meta.name}</span>
      )}
    </div>
  );
}
