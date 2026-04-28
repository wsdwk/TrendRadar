import "server-only";
import { promises as fs } from "fs";
import path from "path";
import {
  parseTxt,
  dateDirToISO,
  timeFileToHM,
  type Snapshot,
  type SnapshotItem,
} from "./parser";
import {
  parseFrequencyWords,
  matchesWordGroups,
  type ParsedFrequencyWords,
} from "./keywords";

// dashboard 在仓库的 /dashboard，数据在仓库根的 /output 与 /config
const REPO_ROOT = path.resolve(process.cwd(), "..");
const OUTPUT_DIR = path.join(REPO_ROOT, "output");
const FREQ_FILE = path.join(REPO_ROOT, "config", "frequency_words.txt");

const DATE_DIR_RE = /^(\d{4})年(\d{2})月(\d{2})日$/;
const TIME_FILE_RE = /^(\d{2})时(\d{2})分\.txt$/;

export async function listDateDirs(): Promise<string[]> {
  try {
    const entries = await fs.readdir(OUTPUT_DIR, { withFileTypes: true });
    return entries
      .filter((e) => e.isDirectory() && DATE_DIR_RE.test(e.name))
      .map((e) => e.name)
      .sort(); // 字典序即时间序
  } catch {
    return [];
  }
}

export async function listTimeFiles(dateDir: string): Promise<string[]> {
  const dir = path.join(OUTPUT_DIR, dateDir, "txt");
  try {
    const files = await fs.readdir(dir);
    return files
      .filter((f) => TIME_FILE_RE.test(f))
      .sort()
      .map((f) => f.replace(/\.txt$/, ""));
  } catch {
    return [];
  }
}

export async function loadSnapshot(
  dateDir: string,
  timeFile: string
): Promise<Snapshot | null> {
  const filePath = path.join(OUTPUT_DIR, dateDir, "txt", `${timeFile}.txt`);
  try {
    const content = await fs.readFile(filePath, "utf8");
    const parsed = parseTxt(content);
    return {
      dateDir,
      timeFile,
      date: dateDirToISO(dateDir),
      time: timeFileToHM(timeFile),
      platforms: parsed.platforms,
    };
  } catch {
    return null;
  }
}

export async function loadLatestSnapshot(): Promise<Snapshot | null> {
  const dates = await listDateDirs();
  for (let i = dates.length - 1; i >= 0; i--) {
    const dateDir = dates[i];
    const times = await listTimeFiles(dateDir);
    if (times.length > 0) {
      const latestTime = times[times.length - 1];
      const snap = await loadSnapshot(dateDir, latestTime);
      if (snap) return snap;
    }
  }
  return null;
}

export async function loadFrequencyWords(): Promise<ParsedFrequencyWords> {
  try {
    const content = await fs.readFile(FREQ_FILE, "utf8");
    return parseFrequencyWords(content);
  } catch {
    return { groups: [], filterWords: [] };
  }
}

// =============== 派生计算 ===============

export type RankedItem = SnapshotItem & {
  platformId: string;
  platformName: string;
  /** 命中的词组 key，为 null 表示未命中关键词 */
  hit: string | null;
  /** 综合权重得分 */
  score: number;
};

/**
 * 跨平台综合排序：参考 main.py 的「排名 0.6 + 频次 0.3 + 热度 0.1」思路。
 * 由于 TXT 中没有热度数值，这里用：
 *   排名权重 0.7（rank 越小越大）
 *   多平台命中频次权重 0.3
 */
export function rankCrossPlatform(snapshot: Snapshot): RankedItem[] {
  // 同标题在多平台命中的次数
  const titleCount = new Map<string, number>();
  for (const p of snapshot.platforms) {
    for (const it of p.items) {
      titleCount.set(it.title, (titleCount.get(it.title) || 0) + 1);
    }
  }

  const all: RankedItem[] = [];
  for (const p of snapshot.platforms) {
    for (const it of p.items) {
      const rankScore = Math.max(0, 1 - (it.rank - 1) / 30); // 1~30 线性映射
      const freqScore = Math.min(1, (titleCount.get(it.title) || 1) / 4);
      const score = rankScore * 0.7 + freqScore * 0.3;
      all.push({
        ...it,
        platformId: p.id,
        platformName: p.name,
        hit: null,
        score,
      });
    }
  }

  // 同标题去重，保留 score 最高的那条
  const dedup = new Map<string, RankedItem>();
  for (const item of all) {
    const exist = dedup.get(item.title);
    if (!exist || item.score > exist.score) {
      dedup.set(item.title, item);
    }
  }

  return Array.from(dedup.values()).sort((a, b) => b.score - a.score);
}

/** 找出当前快照中所有命中关键词的条目（保留每条命中的词组） */
export function collectKeywordHits(
  snapshot: Snapshot,
  parsed: ParsedFrequencyWords
): RankedItem[] {
  if (parsed.groups.length === 0) return [];

  const seen = new Set<string>();
  const out: RankedItem[] = [];
  for (const p of snapshot.platforms) {
    for (const it of p.items) {
      const hit = matchesWordGroups(it.title, parsed);
      if (!hit) continue;
      const dedupKey = `${p.id}::${it.title}`;
      if (seen.has(dedupKey)) continue;
      seen.add(dedupKey);
      out.push({
        ...it,
        platformId: p.id,
        platformName: p.name,
        hit: hit.groupKey,
        score: 1 - (it.rank - 1) / 30,
      });
    }
  }
  return out.sort((a, b) => a.rank - b.rank);
}

/** 用于 KPI：快照基础统计 */
export function summarize(snapshot: Snapshot, hits: RankedItem[]) {
  const totalItems = snapshot.platforms.reduce(
    (acc, p) => acc + p.items.length,
    0
  );
  const platformCount = snapshot.platforms.length;
  const hitCount = hits.length;
  const uniqueHitGroups = new Set(hits.map((h) => h.hit)).size;
  return { totalItems, platformCount, hitCount, uniqueHitGroups };
}
