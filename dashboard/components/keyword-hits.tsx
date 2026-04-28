import { Tag, ExternalLink } from "lucide-react";
import type { RankedItem } from "@/lib/data";
import { PlatformBadge } from "./platform-badge";

type Props = {
  hits: RankedItem[];
};

export function KeywordHits({ hits }: Props) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <Tag className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-sm font-semibold text-foreground">关键词命中</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          匹配 <span className="font-mono">frequency_words.txt</span>
        </p>
      </header>

      {hits.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            当前快照暂无关键词命中
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            可在仓库
            <code className="mx-1 font-mono">config/frequency_words.txt</code>
            中调整关注词
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {hits.map((it) => (
            <li
              key={`${it.platformId}-${it.title}`}
              className="flex items-center gap-3 px-5 py-3"
            >
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
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span>{it.platformName}</span>
                  <span>·</span>
                  <span>第 {it.rank} 位</span>
                  {it.hit && (
                    <span className="ml-1 inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                      {it.hit}
                    </span>
                  )}
                </div>
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
          ))}
        </ul>
      )}
    </section>
  );
}
