import { ExternalLink, Flame } from "lucide-react";
import type { RankedItem } from "@/lib/data";
import { PlatformBadge } from "./platform-badge";
import { getPlatform } from "@/lib/platforms";

type Props = {
  items: RankedItem[];
};

export function TopList({ items }: Props) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
            <Flame className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-sm font-semibold text-foreground">
            跨平台综合 Top 20
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          排名权重 0.7 · 跨平台频次 0.3
        </p>
      </header>

      <ol className="divide-y divide-border">
        {items.slice(0, 20).map((it, idx) => {
          const platform = getPlatform(it.platformId);
          return (
            <li
              key={`${it.platformId}-${it.title}`}
              className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-muted/40"
            >
              <span className="w-6 shrink-0 text-center font-mono text-sm font-medium text-muted-foreground">
                {idx + 1}
              </span>
              <PlatformBadge id={it.platformId} size="sm" />
              <div className="min-w-0 flex-1">
                <a
                  href={it.url || it.mobileUrl || "#"}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="block truncate text-sm font-medium text-foreground hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {it.title}
                </a>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {platform.name} · 该平台第 {it.rank} 位
                </p>
              </div>
              {it.url && (
                <a
                  href={it.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label="打开原文"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
