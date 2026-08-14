/* ============================================================
   看见地球 · v1.4 · TimeBlock (PR #29)
   - 大号时间 HH:MM:SS + 时区缩写
   - 自带 1s tick（不依赖父组件 rerender）
   ============================================================ */

import { useEffect, useState } from 'react';
import { getLocalTimeInTz, getTzAbbrev } from '@/lib/timeDiff';

export type TimeBlockProps = {
  timezone: string;
  /** 不传默认 full（18px）；chip / compact 由父组件控字号 */
  size?: 'full' | 'compact' | 'chip';
};

export function TimeBlock({ timezone, size = 'full' }: TimeBlockProps) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const hhms = getLocalTimeInTz(timezone);
  const abbrev = getTzAbbrev(timezone);
  const valid = hhms !== '--:--:--';

  return (
    <time
      className={`sm-time sm-time-${size}`}
      dateTime={valid ? new Date().toISOString() : undefined}
      aria-label={
        valid
          ? `${timezone} 当前时间 ${hhms}${abbrev ? ' ' + abbrev : ''}`
          : '时间加载失败'
      }
    >
      <span className="sm-time-clock">{valid ? hhms : '--:--:--'}</span>
      {abbrev && <span className="sm-time-tz">{abbrev}</span>}
    </time>
  );
}
