/* ============================================================
   看见地球 · v1.4 · timeDiff (PR #29)
   - 时区工具：取当前时间 / 时区缩写 / 时差
   - 输入是 IANA tz 字符串（如 'Asia/Shanghai'），不绑定 City
   - 复用 Intl.DateTimeFormat，DST 自动处理
   ============================================================ */

/** 取 tz 当前本地时间，格式 HH:MM:SS（24h） */
export function getLocalTimeInTz(tz: string, now: Date = new Date()): string {
  try {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: tz,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const parts = fmt.formatToParts(now);
    const get = (t: Intl.DateTimeFormatPartTypes): string =>
      parts.find((p) => p.type === t)?.value ?? '00';
    return `${get('hour')}:${get('minute')}:${get('second')}`;
  } catch {
    return '--:--:--';
  }
}

/** 取 tz 当前缩写（GMT+9 / CST / JST …），空字符串表示不支持 */
export function getTzAbbrev(tz: string, now: Date = new Date()): string {
  try {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'short',
    });
    const parts = fmt.formatToParts(now);
    return parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
  } catch {
    return '';
  }
}

/**
 * 时差（小时，保留 1 位小数）。
 * 正数 = tzA 在 tzB 前面（tzA 时间更晚）；负数 = tzA 落后。
 * 同 tz → 0。
 *
 * 实现：用 YYYY-MM-DD HH:MM:SS 拼成 wall clock，把两份当作 UTC 解析；
 * now 与解析结果的差就是 tz 的真实偏移（含 DST）。
 */
export function getTimeDiffHours(tzA: string, tzB: string, now: Date = new Date()): number {
  if (tzA === tzB) return 0;
  try {
    const wallAsUtc = (tz: string): number => {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).formatToParts(now);
      const get = (t: Intl.DateTimeFormatPartTypes): string =>
        parts.find((p) => p.type === t)?.value ?? '00';
      const stamp = `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')}:00Z`;
      return Date.parse(stamp);
    };
    const diffMs = wallAsUtc(tzA) - wallAsUtc(tzB);
    return Math.round((diffMs / 3600000) * 10) / 10;
  } catch {
    return 0;
  }
}

/** 时差带符号的展示字符串："+1h" / "-5h" / "+5.5h" / "0h" */
export function formatTimeDiff(diff: number): string {
  if (diff === 0) return '0h';
  const sign = diff > 0 ? '+' : '';
  if (Number.isInteger(diff)) return `${sign}${diff}h`;
  return `${sign}${diff.toFixed(1)}h`;
}

/** 温差整数展示："-12°C" / "+3°C" */
export function formatTempDiff(diff: number): string {
  const sign = diff > 0 ? '+' : '';
  return `${sign}${Math.round(diff)}°C`;
}
