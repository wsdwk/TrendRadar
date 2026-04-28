import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PlatformSnapshot } from "@/lib/parser";
import { PlatformBadge } from "./platform-badge";

type Props = {
  platforms: PlatformSnapshot[];
};

export function PlatformGrid({ platforms }: Props) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <header className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">平台覆盖</h2>
        <Link
          href="/platforms"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
        >
          查看全部
          <ArrowRight className="h-3 w-3" />
        </Link>
      </header>

      <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((p) => (
          <Link
            key={p.id}
            href={`/platforms/${p.id}`}
            className="group flex flex-col gap-3 bg-card p-5 transition-colors hover:bg-muted/40"
          >
            <div className="flex items-center justify-between gap-3">
              <PlatformBadge id={p.id} size="md" withName />
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {p.items.length}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-blue-600 group-hover:opacity-100 dark:group-hover:text-blue-400" />
              </div>
            </div>
            <ul className="flex flex-col gap-1.5">
              {p.items.slice(0, 3).map((it) => (
                <li
                  key={`${p.id}-${it.rank}`}
                  className="flex items-start gap-2 text-xs"
                >
                  <span className="mt-px w-4 shrink-0 font-mono text-muted-foreground">
                    {it.rank}
                  </span>
                  <span
                    className="line-clamp-1 flex-1 text-foreground"
                    title={it.title}
                  >
                    {it.title}
                  </span>
                </li>
              ))}
            </ul>
          </Link>
        ))}
      </div>
    </section>
  );
}
