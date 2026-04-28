"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  Tag,
  CalendarDays,
  LineChart,
  Settings,
  Radar,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** 用于判定 active 的前缀；不填则按 href 全等匹配 */
  matchPrefix?: string;
  disabled?: boolean;
};

const NAV: NavItem[] = [
  { href: "/", label: "总览", icon: LayoutDashboard },
  { href: "/platforms", label: "平台", icon: Layers, matchPrefix: "/platforms" },
  { href: "#", label: "关键词", icon: Tag, disabled: true },
  { href: "#", label: "历史归档", icon: CalendarDays, disabled: true },
  { href: "#", label: "趋势", icon: LineChart, disabled: true },
  { href: "#", label: "设置", icon: Settings, disabled: true },
];

function isActive(item: NavItem, pathname: string) {
  if (item.disabled) return false;
  if (item.matchPrefix) return pathname.startsWith(item.matchPrefix);
  return pathname === item.href;
}

export function Sidebar() {
  const pathname = usePathname() || "/";

  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-card md:flex md:flex-col">
      <Link
        href="/"
        className="flex h-16 items-center gap-2 border-b border-border px-6"
      >
        <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Radar className="h-4 w-4" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-foreground">TrendRadar</p>
          <p className="text-[11px] text-muted-foreground">趋势雷达</p>
        </div>
      </Link>

      <nav className="flex-1 px-3 py-4">
        <ul className="flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item, pathname);
            const inner = (
              <>
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.disabled && (
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    Soon
                  </span>
                )}
              </>
            );

            const className = cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              item.disabled && "cursor-not-allowed opacity-50 hover:bg-transparent"
            );

            return (
              <li key={item.label}>
                {item.disabled ? (
                  <span className={className} aria-disabled>
                    {inner}
                  </span>
                ) : (
                  <Link href={item.href} className={className}>
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-xs font-medium text-foreground">数据来源</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            读取仓库 <code className="font-mono">output/</code> 下的爬虫产物，
            每小时由 GitHub Actions 自动更新。
          </p>
        </div>
      </div>
    </aside>
  );
}
