import { Clock, Search } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

type Props = {
  /** 显示的标题，默认"总览" */
  title?: string;
  /** 副标题或 slogan */
  subtitle?: string;
  /** 右侧时钟显示的日期，可选 */
  date?: string;
  /** 右侧时钟显示的时间，可选 */
  time?: string;
};

export function Topbar({
  title = "总览",
  subtitle = "全网热搜聚合与关键词雷达",
  date,
  time,
}: Props) {
  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <>
            <span className="hidden text-muted-foreground sm:inline">·</span>
            <p className="hidden truncate text-sm text-muted-foreground sm:block">
              {subtitle}
            </p>
          </>
        )}
      </div>

      <div className="hidden items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground lg:flex">
        <Search className="h-3.5 w-3.5" />
        <span className="text-xs">搜索功能即将上线</span>
      </div>

      {(date || time) && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          {date && <span className="font-medium text-foreground">{date}</span>}
          {time && <span className="font-mono">{time}</span>}
        </div>
      )}

      <ThemeToggle />
    </header>
  );
}
