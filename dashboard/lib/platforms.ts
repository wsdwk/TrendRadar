// 12 个平台的展示元数据：颜色、首字母 logo、显示名
// 颜色来自 Tailwind 调色板，避开紫色，使用柔和饱和度

export type PlatformMeta = {
  id: string;
  name: string;
  short: string; // 首字母 / 单字 logo
  color: PlatformColor;
};

export type PlatformColor =
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "pink"
  | "rose"
  | "slate";

export const PLATFORMS: Record<string, PlatformMeta> = {
  toutiao: { id: "toutiao", name: "今日头条", short: "头", color: "red" },
  baidu: { id: "baidu", name: "百度热搜", short: "百", color: "blue" },
  weibo: { id: "weibo", name: "微博", short: "微", color: "orange" },
  zhihu: { id: "zhihu", name: "知乎", short: "知", color: "sky" },
  douyin: { id: "douyin", name: "抖音", short: "抖", color: "slate" },
  bilibili: { id: "bilibili", name: "哔哩哔哩", short: "B", color: "pink" },
  tieba: { id: "tieba", name: "百度贴吧", short: "贴", color: "amber" },
  thepaper: { id: "thepaper", name: "澎湃新闻", short: "澎", color: "indigo" },
  ifeng: { id: "ifeng", name: "凤凰网", short: "凤", color: "rose" },
  wallstreetcn: {
    id: "wallstreetcn",
    name: "华尔街见闻",
    short: "华",
    color: "emerald",
  },
  cls: { id: "cls", name: "财联社", short: "财", color: "teal" },
  juejin: { id: "juejin", name: "掘金", short: "掘", color: "cyan" },
};

export function getPlatform(id: string): PlatformMeta {
  return (
    PLATFORMS[id] || {
      id,
      name: id,
      short: id.slice(0, 1).toUpperCase(),
      color: "slate",
    }
  );
}

// 颜色到完整 className 的映射，避免 Tailwind purge 摇掉动态类
export const COLOR_CLASSES: Record<
  PlatformColor,
  { bg: string; text: string; border: string; bgDark: string; textDark: string }
> = {
  red: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-100",
    bgDark: "dark:bg-red-500/10",
    textDark: "dark:text-red-400",
  },
  orange: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-100",
    bgDark: "dark:bg-orange-500/10",
    textDark: "dark:text-orange-400",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-100",
    bgDark: "dark:bg-amber-500/10",
    textDark: "dark:text-amber-400",
  },
  yellow: {
    bg: "bg-yellow-50",
    text: "text-yellow-600",
    border: "border-yellow-100",
    bgDark: "dark:bg-yellow-500/10",
    textDark: "dark:text-yellow-400",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-100",
    bgDark: "dark:bg-emerald-500/10",
    textDark: "dark:text-emerald-400",
  },
  teal: {
    bg: "bg-teal-50",
    text: "text-teal-600",
    border: "border-teal-100",
    bgDark: "dark:bg-teal-500/10",
    textDark: "dark:text-teal-400",
  },
  cyan: {
    bg: "bg-cyan-50",
    text: "text-cyan-600",
    border: "border-cyan-100",
    bgDark: "dark:bg-cyan-500/10",
    textDark: "dark:text-cyan-400",
  },
  sky: {
    bg: "bg-sky-50",
    text: "text-sky-600",
    border: "border-sky-100",
    bgDark: "dark:bg-sky-500/10",
    textDark: "dark:text-sky-400",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
    bgDark: "dark:bg-blue-500/10",
    textDark: "dark:text-blue-400",
  },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-100",
    bgDark: "dark:bg-indigo-500/10",
    textDark: "dark:text-indigo-400",
  },
  pink: {
    bg: "bg-pink-50",
    text: "text-pink-600",
    border: "border-pink-100",
    bgDark: "dark:bg-pink-500/10",
    textDark: "dark:text-pink-400",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    border: "border-rose-100",
    bgDark: "dark:bg-rose-500/10",
    textDark: "dark:text-rose-400",
  },
  slate: {
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
    bgDark: "dark:bg-slate-500/15",
    textDark: "dark:text-slate-300",
  },
};
