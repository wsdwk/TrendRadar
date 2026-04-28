import { Activity, Layers, Tag, Clock } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { KpiCard } from "@/components/kpi-card";
import { TopList } from "@/components/top-list";
import { PlatformGrid } from "@/components/platform-grid";
import { KeywordHits } from "@/components/keyword-hits";
import {
  loadLatestSnapshot,
  loadFrequencyWords,
  rankCrossPlatform,
  collectKeywordHits,
  summarize,
  listDateDirs,
  listTimeFiles,
} from "@/lib/data";

// 数据每次请求都新读，避免被静态化
export const dynamic = "force-dynamic";
export const revalidate = 0;

function EmptyState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md rounded-lg border border-border bg-card p-8 text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
          <Clock className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-base font-semibold text-foreground">
          尚未发现爬虫产物
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          请先在仓库根运行
          <code className="mx-1 rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            python main.py
          </code>
          ，或等待 GitHub Actions 自动跑完一次。
          仪表盘会从仓库根的{" "}
          <code className="font-mono text-xs">output/</code> 目录读取数据。
        </p>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const [snapshot, freq, dates] = await Promise.all([
    loadLatestSnapshot(),
    loadFrequencyWords(),
    listDateDirs(),
  ]);

  if (!snapshot) {
    return <EmptyState />;
  }

  const ranked = rankCrossPlatform(snapshot);
  const hits = collectKeywordHits(snapshot, freq);
  const stats = summarize(snapshot, hits);
  const timeFiles = await listTimeFiles(snapshot.dateDir);

  return (
    <div className="flex min-h-screen bg-muted/40">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar date={snapshot.date} time={snapshot.time} />

        <main className="flex flex-1 flex-col gap-6 p-6">
          {/* KPI 行 */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={Activity}
              label="本次抓取条目"
              value={stats.totalItems}
              hint={`${snapshot.platforms.length} 个平台累计`}
              color="blue"
            />
            <KpiCard
              icon={Tag}
              label="关键词命中"
              value={stats.hitCount}
              hint={`覆盖 ${stats.uniqueHitGroups} 个词组`}
              color="amber"
            />
            <KpiCard
              icon={Layers}
              label="监控平台"
              value={`${snapshot.platforms.length} / 12`}
              hint="今日头条 / 微博 / 知乎 / B站 …"
              color="emerald"
            />
            <KpiCard
              icon={Clock}
              label="最近更新"
              value={snapshot.time}
              hint={`${snapshot.date} · 当日已采集 ${timeFiles.length} 次 · 历史 ${dates.length} 天`}
              color="indigo"
            />
          </div>

          {/* 主区双栏 */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TopList items={ranked} />
            </div>
            <div className="lg:col-span-1">
              <KeywordHits hits={hits} />
            </div>
          </div>

          <PlatformGrid platforms={snapshot.platforms} />

          <footer className="pt-2 text-center text-xs text-muted-foreground">
            数据快照：{snapshot.date} {snapshot.time} ·
            来自 GitHub Actions 每小时自动抓取的{" "}
            <code className="font-mono">output/</code> 目录
          </footer>
        </main>
      </div>
    </div>
  );
}
