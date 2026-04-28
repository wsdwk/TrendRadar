// 解析 output/YYYY年MM月DD日/txt/HH时mm分.txt
// 数据形如：
//   toutiao | 今日头条
//   1. 标题 [URL:https://...] [MOBILE:https://...]
//   2. 标题 [URL:https://...]
//   <空行>
//   baidu | 百度热搜
//   1. 标题 [URL:...]

export type SnapshotItem = {
  rank: number;
  title: string;
  url: string;
  mobileUrl: string;
};

export type PlatformSnapshot = {
  id: string;
  name: string;
  items: SnapshotItem[];
};

export type Snapshot = {
  /** 中文日期目录名，如 "2025年09月10日" */
  dateDir: string;
  /** 中文时间文件名（不含扩展名），如 "10时53分" */
  timeFile: string;
  /** ISO-ish 显示用日期，如 "2025-09-10" */
  date: string;
  /** 显示用时间 "10:53" */
  time: string;
  platforms: PlatformSnapshot[];
};

export function parseTxt(content: string): Pick<Snapshot, "platforms"> {
  const platforms: PlatformSnapshot[] = [];
  const sections = content.split(/\n\s*\n/);

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;
    if (trimmed.includes("==== 以下ID请求失败 ====")) continue;

    const lines = trimmed.split("\n");
    if (lines.length < 2) continue;

    const header = lines[0].trim();
    let id = header;
    let name = header;
    if (header.includes(" | ")) {
      const [rawId, rawName] = header.split(" | ", 2);
      id = rawId.trim();
      name = rawName.trim();
    }

    const items: SnapshotItem[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      let rest = line;
      let rank = i;

      const dotIdx = rest.indexOf(". ");
      if (dotIdx > 0 && /^\d+$/.test(rest.slice(0, dotIdx))) {
        rank = parseInt(rest.slice(0, dotIdx), 10);
        rest = rest.slice(dotIdx + 2);
      }

      let mobileUrl = "";
      const mobileMatch = rest.match(/\s\[MOBILE:([^\]]+)\]\s*$/);
      if (mobileMatch) {
        mobileUrl = mobileMatch[1];
        rest = rest.slice(0, mobileMatch.index).trim();
      }

      let url = "";
      const urlMatch = rest.match(/\s\[URL:([^\]]+)\]\s*$/);
      if (urlMatch) {
        url = urlMatch[1];
        rest = rest.slice(0, urlMatch.index).trim();
      }

      items.push({
        rank,
        title: rest,
        url,
        mobileUrl,
      });
    }

    if (items.length > 0) {
      platforms.push({ id, name, items });
    }
  }

  return { platforms };
}

/** 把 "2025年09月10日" 转成 "2025-09-10" */
export function dateDirToISO(dateDir: string): string {
  const m = dateDir.match(/^(\d{4})年(\d{2})月(\d{2})日$/);
  if (!m) return dateDir;
  return `${m[1]}-${m[2]}-${m[3]}`;
}

/** 把 "10时53分" 转成 "10:53" */
export function timeFileToHM(timeFile: string): string {
  const m = timeFile.match(/^(\d{2})时(\d{2})分$/);
  if (!m) return timeFile;
  return `${m[1]}:${m[2]}`;
}
