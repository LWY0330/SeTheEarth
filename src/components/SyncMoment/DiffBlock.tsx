/* ============================================================
   看见地球 · v1.4 · DiffBlock (PR #29)
   - 时差 + 温差对比行
   - 全部状态（loading / 未知）都"无声降级"，UI 兜底文案
   ============================================================ */

import { formatTempDiff, formatTimeDiff } from '@/lib/timeDiff';

export type DiffBlockProps = {
  /** tzA - tzB 的小时数（已计算好；0 表示同 tz） */
  diffHours: number;
  /** cityTemp - userTemp 的摄氏度（null 表示温差未知） */
  diffCelsius: number | null;
  /** 仅显示时差（compact 模式） */
  onlyTime?: boolean;
};

export function DiffBlock({ diffHours, diffCelsius, onlyTime }: DiffBlockProps) {
  const timeStr = `时差 ${formatTimeDiff(diffHours)}`;

  return (
    <div className={`sm-diff${onlyTime ? ' sm-diff-only-time' : ''}`}>
      <span className="sm-diff-time">{timeStr}</span>
      {!onlyTime && (
        <span className="sm-diff-sep" aria-hidden="true">
          │
        </span>
      )}
      {!onlyTime && (
        <span className="sm-diff-temp">
          温差{' '}
          {diffCelsius === null ? (
            <span className="sm-diff-unknown" aria-label="温差未知">
              --
            </span>
          ) : (
            formatTempDiff(diffCelsius)
          )}
        </span>
      )}
    </div>
  );
}
