import { Clock, Search } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

type Props = {
  date: string;
  time: string;
};

export function Topbar({ date, time }: Props) {
  return (
    <header className="flex h-16 items-center gap-4 border-b border-border bg-card px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <h1 className="text-base font-semibold text-foreground">总览</h1>
        <span className="hidden text-muted-foreground sm:inline">·</span>
        <p className="hidden truncate text-sm text-muted-foreground sm:block">
          全网热搜聚合与关键词雷达
        </p>
      </div>

      <div className="hidden items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground lg:flex">
        <Search className="h-3.5 w-3.5" />
        <span className="text-xs">搜索功能即将上线</span>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground">
        <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
        <span className="font-medium text-foreground">{date}</span>
        <span className="font-mono">{time}</span>
      </div>

      <ThemeToggle />
    </header>
  );
}
