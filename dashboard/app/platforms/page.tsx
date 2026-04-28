import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { PlatformBadge } from "@/components/platform-badge";
import { loadLatestSnapshot } from "@/lib/data";
import { PLATFORMS } from "@/lib/platforms";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PlatformsIndexPage() {
  const snapshot = await loadLatestSnapshot();
  const itemsById = new Map(
    (snapshot?.platforms ?? []).map((p) => [p.id, p.items])
  );

  // 以 PLATFORMS 元数据为准，保证 12 个平台都展示，即使本次抓取缺失
  const cards = Object.values(PLATFORMS).map((meta) => {
    const items = itemsById.get(meta.id) ?? [];
    return { meta, items };
  });

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title="平台排名"
          subtitle="按平台维度查看完整热搜榜单"
          date={snapshot?.date}
          time={snapshot?.time}
        />

        <main className="flex-1 px-6 py-6">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                12 个平台
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                选择一个平台查看完整榜单与排名详情
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cards.map(({ meta, items }) => (
              <Link
                key={meta.id}
                href={`/platforms/${meta.id}`}
                className="group flex flex-col gap-4 rounded-lg border border-border bg-card p-5 transition-all hover:border-blue-200 hover:shadow-sm dark:hover:border-blue-500/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <PlatformBadge id={meta.id} size="lg" withName />
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-semibold text-foreground tabular-nums">
                    {items.length}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    条热搜
                  </span>
                </div>

                <ul className="flex flex-col gap-1.5 border-t border-border pt-3">
                  {items.slice(0, 3).map((it) => (
                    <li
                      key={`${meta.id}-${it.rank}`}
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
                  {items.length === 0 && (
                    <li className="text-xs text-muted-foreground">
                      本次未采集到数据
                    </li>
                  )}
                </ul>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
