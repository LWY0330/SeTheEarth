/* ============================================================
   看见地球 · v2.14.0 · EventDrawer · 右侧详情抽屉
   - 渐进式信息披露（点击事件 → 查看更多）
   - 桌面：右侧 380px 抽屉
   - 移动：底部 Sheet
   - 保留时间轴和事件列表的可见性
   ============================================================ */

import { contentTypeColors, getTimeAgo, type LiveEvent, type ContentType } from '@/data/liveMoments';
import styles from './EventDrawer.module.css';
import { Button, Tag, type TagTone } from '@/components/ui';

// v1.5 · PROMPT 17 · Stage 3 · contentType → Tag.tone 映射
// Tag 只有 5 tones, contentType 有 11 个;按语义聚类成 3 level 色调
// (blue: 世界/天气/金融/科学 · yellow: 本地/日常/自然/交通 · red: 文化/社区/体育)
// 注意:原 chip 用 per-contentType hex(11 色),改用 Tag tone 后视觉略有标准化
// (这是 ui/ 整合的预期 trade-off,Designer 后续可细化映射)
const contentTypeToTone: Record<ContentType, TagTone> = {
  world: 'level-blue',
  weather: 'level-blue',
  finance: 'level-blue',
  science: 'level-blue',
  local: 'level-yellow',
  'daily-life': 'level-yellow',
  nature: 'level-yellow',
  transport: 'level-yellow',
  culture: 'level-red',
  community: 'level-red',
  sports: 'level-red',
};

export type EventDrawerProps = {
  event: LiveEvent | null;
  onClose: () => void;
};

export function EventDrawer({ event, onClose }: EventDrawerProps) {
  // v1.3 · PR #13 · Esc 关闭交给 useHotkeys（src/hooks/useHotkeys.ts）统一处理

  if (!event) return null;

  const accent = contentTypeColors[event.contentType];
  const verificationLabels = {
    verified: '已核实',
    developing: '发展中',
    editorial: '编辑观察',
  };
  const scaleLabels = {
    global: '世界',
    national: '国家',
    regional: '地区',
    local: '城市',
    everyday: '日常',
  };

  return (
    <>
      {/* 背景遮罩（仅桌面） */}
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />

      {/* 抽屉（桌面：右侧 / 移动：底部） */}
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        style={{ '--drawer-accent': accent } as React.CSSProperties}
      >
        <header className={styles.head}>
          <span className={styles.index}>
            {String(event.id.split('-').pop()).padStart(2, '0')}
          </span>
          {/* v1.5 · Button 接入 close icon */}
          <Button variant="ghost" size="md" onClick={onClose} aria-label="关闭详情">
            ✕
          </Button>
        </header>

        <div className={styles.body}>
          {/* 城市 + 国家 */}
          <div className={styles.cityBlock}>
            <h2 id="drawer-title" className={styles.cityName}>
              {event.cityNameZh}
            </h2>
            <p className={styles.cityEn}>{event.cityNameEn}</p>
            <p className={styles.country}>{event.countryEn}</p>
          </div>

          {/* 本地时间 + 类型 */}
          <div className={styles.timeBlock}>
            <span className={styles.localTime}>{event.localTime}</span>
            <span className={styles.timezone}>{event.timezone}</span>
            {/* v1.5 · Tag 接入 contentType chip */}
            <Tag tone={contentTypeToTone[event.contentType]} size="sm">
              {event.contentTypeZh}
            </Tag>
          </div>

          {/* 事件标题 */}
          <h3 className={styles.title}>{event.title}</h3>

          {/* 事件描述（更详细） */}
          <p className={styles.description}>{event.description}</p>

          {/* 扩展描述（示例：v2.14.0 加更长内容） */}
          <div className={styles.extended}>
            <p>
              这是一条正在被持续观察的现场片段。{event.cityNameZh} 的此刻，{event.timezone} 时区，
              当地生活正在发生这种变化。
            </p>
            <p>
              你看到的内容可能与你的兴趣不同。
              这是有意为之：板块 3 的目的是展示不同地区、不同尺度、不同类型正在发生的事情，
              让你暂时跳出日常的信息茧房。
            </p>
          </div>

          {/* 元数据：来源 + 时间 + 真实度 */}
          <div className={styles.meta}>
            <h4>关于这条观察</h4>
            <dl>
              <dt>来源</dt>
              <dd>{event.sourceName}</dd>

              <dt>观察时间</dt>
              <dd>{event.observedAt}</dd>

              <dt>最后更新</dt>
              <dd>{getTimeAgo(event.updatedAt)}</dd>

              <dt>内容尺度</dt>
              <dd>{scaleLabels[event.scale]} · {event.contentTypeZh}</dd>

              <dt>真实度</dt>
              <dd>
                <span
                  className={styles.statusDot}
                  style={{ background: event.verificationStatus === 'verified' ? '#4ADE80' : '#D97757' }}
                />
                {verificationLabels[event.verificationStatus]}
                {event.verificationStatus === 'editorial' && ' · 不依赖实时数据'}
              </dd>
            </dl>
          </div>

          {/* 操作 */}
          <div className={styles.actions}>
            {event.sourceUrl && (
              <a
                className={styles.actionLink}
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                查看来源 →
              </a>
            )}
            {/* v1.5 · Button 接入 secondary CTA */}
            <Button variant="secondary" size="md" onClick={onClose}>
              关闭
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default EventDrawer;
