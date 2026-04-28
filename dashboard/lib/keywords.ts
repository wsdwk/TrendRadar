// 复刻 main.py 中 load_frequency_words / matches_word_groups 的规则
//
// 词组语法（与 frequency_words.txt 保持一致）：
//   - 文件按空行分组
//   - 组内每行一个词
//   - 以 "!" 开头：过滤词，命中即排除该标题
//   - 以 "+" 开头：必须词，组内所有 "+" 词都需出现
//   - 普通词：组内任一普通词出现即可
// 标题与词均按小写比较

export type WordGroup = {
  required: string[];
  normal: string[];
  /** 用于展示，把组内主要词拼成一个 key */
  groupKey: string;
};

export type ParsedFrequencyWords = {
  groups: WordGroup[];
  filterWords: string[];
};

export function parseFrequencyWords(content: string): ParsedFrequencyWords {
  const rawGroups = content
    .split(/\n\s*\n/)
    .map((g) => g.trim())
    .filter(Boolean);

  const groups: WordGroup[] = [];
  const filterWords: string[] = [];

  for (const raw of rawGroups) {
    const words = raw
      .split("\n")
      .map((w) => w.trim())
      .filter(Boolean);

    const required: string[] = [];
    const normal: string[] = [];

    for (const w of words) {
      if (w.startsWith("!")) {
        filterWords.push(w.slice(1));
      } else if (w.startsWith("+")) {
        required.push(w.slice(1));
      } else {
        normal.push(w);
      }
    }

    if (required.length === 0 && normal.length === 0) continue;

    const groupKey = (normal.length > 0 ? normal : required).join(" ");
    groups.push({ required, normal, groupKey });
  }

  return { groups, filterWords };
}

/** 标题是否命中词组规则 */
export function matchesWordGroups(
  title: string,
  parsed: ParsedFrequencyWords
): WordGroup | null {
  const lower = title.toLowerCase();

  if (parsed.filterWords.some((f) => f && lower.includes(f.toLowerCase()))) {
    return null;
  }

  for (const group of parsed.groups) {
    if (group.required.length > 0) {
      const allReq = group.required.every((r) =>
        lower.includes(r.toLowerCase())
      );
      if (!allReq) continue;
    }
    if (group.normal.length > 0) {
      const anyNormal = group.normal.some((n) =>
        lower.includes(n.toLowerCase())
      );
      if (!anyNormal) continue;
    }
    return group;
  }

  return null;
}
