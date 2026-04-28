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
        <p className="text-xs text-muted-foreground">
          共 {platforms.length} 个平台
        </p>
      </header>

      <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        {platforms.map((p) => (
          <article
            key={p.id}
            className="flex flex-col gap-3 bg-card p-5 transition-colors hover:bg-muted/40"
          >
            <div className="flex items-center justify-between gap-3">
              <PlatformBadge id={p.id} size="md" withName />
              <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                {p.items.length}
              </span>
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
                  <a
                    href={it.url || it.mobileUrl || "#"}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="line-clamp-1 flex-1 text-foreground hover:text-blue-600 dark:hover:text-blue-400"
                    title={it.title}
                  >
                    {it.title}
                  </a>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
