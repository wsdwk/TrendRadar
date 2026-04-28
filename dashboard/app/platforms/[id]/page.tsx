import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { PlatformBadge } from "@/components/platform-badge";
import { loadFrequencyWords, loadLatestSnapshot } from "@/lib/data";
import { matchesWordGroups } from "@/lib/keywords";
import { PLATFORMS, getPlatform, COLOR_CLASSES } from "@/lib/platforms";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateStaticParams() {
  return Object.keys(PLATFORMS).map((id) => ({ id }));
}

export default async function PlatformDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!PLATFORMS[id]) notFound();

  const meta = getPlatform(id);
  const colors = COLOR_CLASSES[meta.color];

  const [snapshot, freq] = await Promise.all([
    loadLatestSnapshot(),
    loadFrequencyWords(),
  ]);

  const platform = snapshot?.platforms.find((p) => p.id === id);
  const items = platform?.items ?? [];

  // 标记每条是否命中关键词
  const itemsWithHit = items.map((it) => ({
    ...it,
    hit: matchesWordGroups(it.title, freq),
  }));
  const hitCount = itemsWithHit.filter((it) => it.hit).length;

  // 其他平台的快速切换
  const otherPlatforms = Object.values(PLATFORMS).filter((p) => p.id !== id);

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={meta.name}
          subtitle={`${meta.name} 完整榜单`}
          date={snapshot?.date}
          time={snapshot?.time}
        />

        <main className="flex-1 px-6 py-6">
          <Link
            href="/platforms"
            className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            返回平台列表
          </Link>

          {/* 平台头部 */}
          <section className="mb-6 flex flex-col gap-4 rounded-lg border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <PlatformBadge id={id} size="lg" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {meta.name}
                </h1>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  平台 ID: <code className="font-mono">{id}</code>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <Stat label="本次条目" value={items.length} />
              <div className="h-8 w-px bg-border" />
              <Stat
                label="命中关键词"
                value={hitCount}
                accent={hitCount > 0}
              />
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
            {/* 主榜单 */}
            <section className="rounded-lg border border-border bg-card">
              <header className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="text-sm font-semibold text-foreground">
                  完整榜单
                </h2>
                <p className="text-xs text-muted-foreground">
                  共 {items.length} 条
                </p>
              </header>

              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                  <p className="text-sm text-foreground">本次抓取没有数据</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    可能该平台接口暂时不可用，等下一次抓取
                  </p>
                </div>
              ) : (
                <ol className="divide-y divide-border">
                  {itemsWithHit.map((it) => (
                    <li
                      key={`${id}-${it.rank}`}
                      className="flex items-start gap-4 px-5 py-3 transition-colors hover:bg-muted/40"
                    >
                      <RankBadge
                        rank={it.rank}
                        accentBg={colors.bg}
                        accentText={colors.text}
                        accentBgDark={colors.bgDark}
                        accentTextDark={colors.textDark}
                      />
                      <div className="min-w-0 flex-1">
                        <a
                          href={it.url || it.mobileUrl || "#"}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="group inline-flex items-start gap-1.5 text-sm text-foreground hover:text-blue-600 dark:hover:text-blue-400"
                          title={it.title}
                        >
                          <span className="flex-1">{it.title}</span>
                          <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                        </a>
                        {it.hit && (
                          <div className="mt-1.5">
                            <span className="inline-flex items-center rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:bg-amber-500/15 dark:text-amber-400">
                              命中：{it.hit.groupKey}
                            </span>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {/* 右侧切换栏 */}
            <aside className="hidden lg:block">
              <div className="sticky top-6 rounded-lg border border-border bg-card p-3">
                <p className="px-2 pb-2 text-xs font-medium text-muted-foreground">
                  切换平台
                </p>
                <ul className="flex flex-col gap-0.5">
                  {otherPlatforms.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/platforms/${p.id}`}
                        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <PlatformBadge id={p.id} size="sm" />
                        <span>{p.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="flex flex-col">
      <span
        className={cn(
          "font-mono text-2xl font-semibold tabular-nums",
          accent
            ? "text-amber-600 dark:text-amber-400"
            : "text-foreground"
        )}
      >
        {value}
      </span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

function RankBadge({
  rank,
  accentBg,
  accentText,
  accentBgDark,
  accentTextDark,
}: {
  rank: number;
  accentBg: string;
  accentText: string;
  accentBgDark: string;
  accentTextDark: string;
}) {
  const isTop3 = rank <= 3;
  return (
    <span
      className={cn(
        "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-xs font-semibold tabular-nums",
        isTop3
          ? cn(accentBg, accentText, accentBgDark, accentTextDark)
          : "bg-muted text-muted-foreground"
      )}
    >
      {rank}
    </span>
  );
}
